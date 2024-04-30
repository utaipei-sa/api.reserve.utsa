import express from 'express'
import { spaces, spaces_reserved_time } from '../../models/mongodb.js'
import { ObjectId } from 'mongodb'
import dayjs from 'dayjs'

const router = express.Router()

/**
 * @openapi
 * /reserve/interval_space_availability:
 *   get:
 *     tags:
 *       - reserve
 *     summary: 查詢特定範圍內各時段之場地是否可供借用
 *     description: 查詢特定範圍內各時段之場地是否可供借用
 *     operationId: GetIntervalSpaceAvailability
 *     parameters:
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
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SpaceAvailability'
 */
router.get('/interval_space_availability', async function (req, res, next) {
  // 正規表達式 Regular Expression
  const OBJECT_ID_REGEXP = /^[0-9a-fA-F]{24}$/ // ObjectId 格式: 652765ed3d21844635674e71
  const DATETIME_MINUTE_REGEXP = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/ // 2024-03-03T22:25

  // 時段列表
  const time_slots = [
    { start: '08:00', end: '12:00' },
    { start: '13:00', end: '17:00' },
    { start: '18:00', end: '22:00' }
  ]

  // 取得輸入資料
  const space_id = req.query.space_id // 場地 ID
  const start_datetime = req.query.start_datetime // 欲查詢區間之起始時間
  const end_datetime = req.query.end_datetime // 欲查詢時間之終止時間

  let error_message = '' // 錯誤訊息

  // 檢查輸入是否正確
  if (space_id === undefined || start_datetime === undefined || end_datetime === undefined) { // 沒給齊參數
    error_message += 'space_id, start_datetime, and end_datetime are required\n'
  }
  if (!OBJECT_ID_REGEXP.test(space_id)) { // check space_id format
    error_message += 'space_id format error'
  }
  if (!DATETIME_MINUTE_REGEXP.test(start_datetime) || !DATETIME_MINUTE_REGEXP.test(end_datetime)) { // check datetime fromat
    error_message += 'datetime format error'
  }
  if ((new Date(start_datetime)).getTime() > (new Date(end_datetime)).getTime()) { // start_datetime > end_datetime
    error_message += 'end_datetime cannot be earlier than start_datetime'
  }
  if (error_message.length !== 0) {
    res
      .status(400)
      .json({ error: error_message })
    return
  }

  // 確認 space_id 是否有對應的場地，沒有就報錯
  const space_found = await spaces.findOne({ _id: new ObjectId(space_id) })
  if (!space_found) {
    res
      .status(400)
      .json({ error: 'space_id not found error' })
    return
  }

  // 統整場地可否借用資訊
  const digical_time_slots = [
    { start: 8, end: 12 },
    { start: 13, end: 17 },
    { start: 18, end: 22 }
  ]

  const output_array = []
  const end_datetime_dayjs = dayjs(end_datetime)
  let start_datetime_dayjs = dayjs(start_datetime)
  const reserved_stop_judge_flag = 1

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
      // const space_database_info = await spaces_reserved_time.findOne({ start_datetime: new Date(start_datetime_dayjs.format()), space_id: space_id })
      // if (space_database_info == null) {
      //     reserved_value = 0
      // }
      // else {
      //     reserved_value = space_database_info.reserved
      // }
      let space_database_info

      for (let i = 0; i <= 3; i++) {
        space_database_info = await spaces_reserved_time.findOne({ start_datetime: new Date(start_datetime_dayjs.add(i, 'hour').format()), space_id })
        if (space_database_info == null) {
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
            availability: reserved_value
          }
        )
        start_datetime_dayjs = start_datetime_dayjs.set('hour', digical_time_slots[current_timeslot].end)
      }
    }
    start_datetime_dayjs = start_datetime_dayjs.add(1, 'day')
    start_datetime_dayjs = start_datetime_dayjs.set('hour', 0).set('minute', 0).set('second', 0)
  }
  
  res.json(output_array)

})

export default router
