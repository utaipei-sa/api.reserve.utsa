import express from 'express'
import { check, validationResult } from 'express-validator'
import SpaceRepository from '../../repositories/space_repository.js'
import dayjs from 'dayjs'
import {
  error_response,
  R_ID_NOT_FOUND,
  R_INVALID_INFO
} from '../../utilities/response.js'
import { OBJECT_ID_REGEXP, DATETIME_MINUTE_REGEXP } from '../../utilities/input_format.js'

const router = express.Router()

/**
 * @openapi
 * /reserve/space_available_time:
 *   get:
 *     tags:
 *       - reserve
 *     summary: 查詢特定時段場地是否可預約
 *     description: 查詢特定時段場地是否可預約
 *     operationId: GetSpaceAvailableTime
 *     parameters:
 *       - name: intervals
 *         description: 是否切分成各時段進行回傳
 *         in: query
 *         required: false
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
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SpaceAvailability'
 *
*/
router.get('/space_available_time', [
  check('space_id').matches(OBJECT_ID_REGEXP).withMessage('Reservation ID format error'),
  check('start_datetime').matches(DATETIME_MINUTE_REGEXP).withMessage('Reservation start_datetime format error'),
  check('end_datetime').matches(DATETIME_MINUTE_REGEXP).withMessage('Reservation end_datetime format error'),
  check('intervals').optional().isBoolean().withMessage('intervals must be boolean type')
], async function (req, res, next) {
  // 檢查輸入是否正確（正規表達式 Regular Expression）
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res
      .status(400)
      .json(error_response(R_INVALID_INFO, errors.array().map(error => error.msg).join('\n')))
    return
  }

  // 取得參數
  const space_id = req.query.space_id
  const start_datetime = req.query.start_datetime
  const end_datetime = req.query.end_datetime
  const space_intervals = req.query.intervals

  // 查詢場地資訊
  const space_found = await SpaceRepository.findSpaceById(space_id)

  if (!space_found) {
    res
      .status(400)
      .json(error_response(R_ID_NOT_FOUND, 'Reservation ID not found'))
    return
  }
  if (space_intervals === 'true') {
    // intervals
    // 統整場地可否借用資訊
    const digical_time_slots = [
      { start: 8, end: 12 },
      { start: 13, end: 17 },
      { start: 18, end: 22 }
    ]
    const output_array = []
    const end_datetime_dayjs = dayjs(end_datetime)
    let start_datetime_dayjs = dayjs(start_datetime)
    const limit_datetime = start_datetime_dayjs.add(1, 'month')
    if (end_datetime_dayjs.isAfter(limit_datetime)) {
      res
        .status(400)
        .json(
          error_response(R_INVALID_INFO, 'You can check for up to one month.')
        )
      return
    }
    while (start_datetime_dayjs.isBefore(end_datetime_dayjs)) {
      await cacuTimeSlot(
        start_datetime_dayjs,
        end_datetime_dayjs,
        digical_time_slots,
        space_id,
        output_array
      )
      start_datetime_dayjs = start_datetime_dayjs.add(1, 'day')
      start_datetime_dayjs = start_datetime_dayjs
        .set('hour', 0)
        .set('minute', 0)
        .set('second', 0)
    }
    res.json(output_array)
  } else {
    // intergral
    // 取得場地預約時段紀錄
    const end_datetime_dayjs = dayjs(end_datetime)
    const start_datetime_dayjs = dayjs(start_datetime)
    const limit_datetime = start_datetime_dayjs.add(1, 'month')
    if (end_datetime_dayjs.isAfter(limit_datetime)) {
      res
        .status(400)
        .json(
          error_response(R_INVALID_INFO, 'You can check for up to one month.')
        )
      return
    }
    const spaces_reservations = await SpaceRepository.getSlotsByTimeRange(
      space_id,
      start_datetime + ':00+0800',
      end_datetime + ':00+0800',
    )

    const availability = spaces_reservations.length > 0 ? 0 : 1
    res.json({
      availability
    })
  }
})

/**
 * @param {dayjs.Dayjs} start_datetime_dayjs
 * @param {dayjs.Dayjs} end_datetime_dayjs
 * @param {{ end: any;start:any; }[]} digical_time_slots
 * @param {any} space_id
 * @param {any[]} output_array
 */
async function cacuTimeSlot (
  start_datetime_dayjs,
  end_datetime_dayjs,
  digical_time_slots,
  space_id,
  output_array
) {
  for (
    let current_timeslot = 0;
    start_datetime_dayjs.isBefore(end_datetime_dayjs) && current_timeslot < 3;
    start_datetime_dayjs = start_datetime_dayjs.add(1, 'hour')
  ) {
    // 檢查start_datetime是在哪一個時段的
    if (
      start_datetime_dayjs.hour() >= digical_time_slots[current_timeslot].end
    ) {
      current_timeslot++
      start_datetime_dayjs = start_datetime_dayjs.subtract(1, 'hour')
      continue
    }
    let reserved_value = 0
    // 在資料庫中是否有找到此時段的資料,如果否reserved_value=0

    for (let i = 0; i <= 3 && reserved_value === 0; i++) {
      const space_database_info =
        await SpaceRepository.findSlotByStartTime(
          space_id,
          start_datetime_dayjs.add(i, "hour").format()
        );
      if (space_database_info == null) {
        continue;
      }
      reserved_value = space_database_info.reserved;
    }

    if (
      start_datetime_dayjs.hour() >=
      digical_time_slots[current_timeslot].start &&
      start_datetime_dayjs.hour() < digical_time_slots[current_timeslot].end
    ) {
      output_array.push({
        space_id,
        start_datetime: start_datetime_dayjs
          .set('hour', digical_time_slots[current_timeslot].start)
          .format('YYYY-MM-DDTHH:mm'),
        end_datetime: start_datetime_dayjs
          .set('hour', digical_time_slots[current_timeslot].end)
          .format('YYYY-MM-DDTHH:mm'),
        availability: 1 - reserved_value
      })
      start_datetime_dayjs = start_datetime_dayjs.set(
        'hour',
        digical_time_slots[current_timeslot].end
      )
    }
  }
}

export default router
