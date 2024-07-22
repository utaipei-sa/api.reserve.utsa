import express from 'express'
import { ObjectId } from 'mongodb'
import { spaces, spaces_reserved_time } from '../../models/mongodb.js'
import dayjs from 'dayjs'
import { error_response, R_ID_NOT_FOUND } from '../../utilities/response.js'

const router = express.Router()

/**
 * @openapi
 * /reserve/space_available_time:
 *   get:
 *     tags:
 *       - reserve
 *     summary: 查詢特定時段場地是否可預約
 *     description: 查詢特定時段場地是否可預約
 *     operationId: GetIntegralSpaceAvailability
 *     parameters:
 *       - name: intervals
 *         description: 是否切分成各時段進行回傳
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *       - name: space_id
 *         in: query
 *         description: 場地 ID
 *         required: true
 *         schema:
 *           type: string
 *       - name: start_datetime
 *         in: query
 *         description: 查詢起始時間
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - name: end_datetime
 *         in: query
 *         description: 查詢終止時間
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error_code:
 *                   type: string
 *                 message:
 *                   type: string
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SpaceAvailability'
 *      
 */
router.get('/space_available_time', async function (req, res, next) {
  // 取得參數
  const space_id = req.query.space_id
  const start_datetime = req.query.start_datetime
  const end_datetime = req.query.end_datetime
  const space_intervals = req.query.intervals
  // 檢查輸入是否正確（正規表達式 Regular Expression）
  const OBJECT_ID_REGEXP = /^[a-fA-F0-9]{24}$/ // ObjectId 格式
  const DATETIME_MINUTE_REGEXP = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/ // 日期時間格式（年-月-日T時:分）
  if (space_id === undefined || start_datetime === undefined || end_datetime === undefined) { // 沒給齊參數
    res
      .status(400)
      .json(error_response(R_ID_NOT_FOUND, 'Reservation ID not found'))
    return
  } else if (!OBJECT_ID_REGEXP.test(space_id)) { // check space_id format
    res
      .status(400)
      .json(error_response(R_ID_NOT_FOUND, 'Reservation ID not found'))
    return
  } else if (!DATETIME_MINUTE_REGEXP.test(start_datetime) || !DATETIME_MINUTE_REGEXP.test(end_datetime)) { // check datetime fromat
    res
      .status(400)
      .json(error_response(R_ID_NOT_FOUND, 'Reservation ID not found'))
    return
  }
  // 查詢場地資訊
  const space_found = await spaces.findOne({ _id: new ObjectId(space_id) })
  if (!space_found) {
    res
      .status(400)
      .json(error_response(R_ID_NOT_FOUND, 'Reservation ID not found'))
    return
  }
  if (space_intervals === "true") { // intervals
    // 統整場地可否借用資訊
    const digical_time_slots = [
      { start: 8, end: 12 },
      { start: 13, end: 17 },
      { start: 18, end: 22 }
    ]
    const output_array = []
    const end_datetime_dayjs = dayjs(end_datetime)
    let start_datetime_dayjs = dayjs(start_datetime)
    while (start_datetime_dayjs.isBefore(end_datetime_dayjs)) {
      for (
        let current_timeslot = 0;
        start_datetime_dayjs.isBefore(end_datetime_dayjs) && current_timeslot < 3;
        start_datetime_dayjs = start_datetime_dayjs.add(1, 'hour')
      ) {
        // 檢查start_datetime是在哪一個時段的
        if (start_datetime_dayjs.hour() >= digical_time_slots[current_timeslot].end) {
          current_timeslot++
          start_datetime_dayjs = start_datetime_dayjs.subtract(1, 'hour')
          continue
        }
        let reserved_value = 0
        // 在資料庫中是否有找到此時段的資料,如果否reserved_value=0
        let space_database_info

        for (let i = 0; i <= 3; i++) {
          space_database_info = await spaces_reserved_time.findOne({ start_datetime: new Date(start_datetime_dayjs.add(i, 'hour').format()), space_id })
          if (space_database_info == null) {
            console.log('hey this is null')
            continue
          }
          reserved_value = space_database_info.reserved
          if (reserved_value === 1) {
            break
          }
        }

        if (start_datetime_dayjs.hour() >= digical_time_slots[current_timeslot].start && start_datetime_dayjs.hour() < digical_time_slots[current_timeslot].end) {
          output_array.push(
            {
              space_id,
              start_datetime: start_datetime_dayjs.set('hour', digical_time_slots[current_timeslot].start).format('YYYY-MM-DDTHH:mm'),
              end_datetime: start_datetime_dayjs.set('hour', digical_time_slots[current_timeslot].end).format('YYYY-MM-DDTHH:mm'),
              availability: 1 - reserved_value
            }
          )
          start_datetime_dayjs = start_datetime_dayjs.set('hour', digical_time_slots[current_timeslot].end)
        }
      }
      start_datetime_dayjs = start_datetime_dayjs.add(1, 'day')
      start_datetime_dayjs = start_datetime_dayjs.set('hour', 0).set('minute', 0).set('second', 0)
    }
    res.json(output_array)
  } else { // intergral
    // 取得場地預約時段紀錄
    const spaces_reservations = await spaces_reserved_time.find({
      space_id,
      start_datetime: {
        $gte: new Date(start_datetime + ':00+0800'), // query start_datetime
        $lt: new Date(end_datetime + ':00+0800') // query end_datetime
      },
      reserved: 1
    }).toArray() // 搜尋時間範圍內已被預約的時段

    // console.log(spaces_reservations)
    if (spaces_reservations.length > 0) {
      // 已被借用(不可借)
      res.json({
        data: {
          space_id,
          start_datetime,
          end_datetime,
          availability: 0
        }
      })
    } else {
      // 未被借用(可借)
      res.json({
        data: {
          space_id,
          start_datetime,
          end_datetime,
          availability: 1
        }
      })
    }
  }
})

export default router
