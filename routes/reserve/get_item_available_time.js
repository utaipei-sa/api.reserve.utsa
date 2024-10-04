import express from 'express'
import { check, validationResult } from 'express-validator'
import ItemRepository from '../../repositories/item_repository.js'
import dayjs from 'dayjs'
import {
  error_response,
  R_ID_NOT_FOUND,
  R_INVALID_INFO
} from '../../utilities/response.js'
import { OBJECT_ID_REGEXP, DATETIME_MINUTE_REGEXP } from '../../utilities/input_format.js'
import timezone from 'dayjs/plugin/timezone.js'
dayjs.extend(timezone)
const router = express.Router()

/**
 * @openapi
 * /reserve/item_available_time:
 *   get:
 *     tags:
 *       - reserve
 *     summary: 查詢特定範圍內各時段之物品可借數量
 *     description: 查詢特定範圍內各時段之物品可借數量
 *     operationId: GetItemAvailableTime
 *     parameters:
 *       - name: intervals
 *         description: 是否切分成各時段進行回傳
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *       - name: item_id
 *         in: query
 *         description: 物品 ID
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
 *                 $ref: '#/components/schemas/ItemAvailability'
*/
router.get('/item_available_time', [
  check('item_id').matches(OBJECT_ID_REGEXP).withMessage('Reservation ID format error'),
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

  const item_id = req.query.item_id
  const start_datetime = req.query.start_datetime
  const end_datetime = req.query.end_datetime
  let intervals = req.query.intervals
  if (intervals === undefined) {
    intervals = 'false'
  }

  // 確認 item_id 是否有對應的場地，沒有就報錯
  const item_found = await ItemRepository.findItemById(item_id)
  if (!item_found) {
    res.status(400).json(error_response(R_ID_NOT_FOUND, 'Item ID not found'))
    return
  }

  const interval_array = []
  let end_datetime_dayjs = dayjs(end_datetime).tz('Asia/Taipei')
  let start_datetime_dayjs = dayjs(start_datetime).tz('Asia/Taipei')
  const limit_datetime = start_datetime_dayjs.add(1, 'month')
  if (end_datetime_dayjs.isAfter(limit_datetime)) {
    res
      .status(400)
      .json(
        error_response(R_INVALID_INFO, 'You can check for up to one month.')
      )
    return
  }
  let maxValue = 0
  let min_available_quantity = 0
  let first_count = true

  if (start_datetime_dayjs.hour() > 12) {
    start_datetime_dayjs = start_datetime_dayjs.set('hour', 12)
  } else if (start_datetime_dayjs.hour() < 12) {
    start_datetime_dayjs = start_datetime_dayjs
      .subtract(1, 'day')
      .set('hour', 12)
  }
  if (end_datetime_dayjs.hour() > 12) {
    end_datetime_dayjs = end_datetime_dayjs.add(1, 'day').set('hour', 12)
  } else if (end_datetime_dayjs.hour() < 12) {
    end_datetime_dayjs = end_datetime_dayjs.set('hour', 12)
  }
  let available_quantity = 0
  while (start_datetime_dayjs.isBefore(end_datetime_dayjs)) {
    for (let count = 0; count <= 23; count++) {
      const item_database_info =
        await ItemRepository.findSlotByStartTime(
          item_id,
          start_datetime_dayjs.add(count, 'hour').format()
        )

      if (item_database_info == null) {
        continue
      }
      if (item_database_info.reserved_quantity > maxValue) {
        maxValue = item_database_info.reserved_quantity
        // console.log(maxValue)
      }
    }
    const items_quantity_info = (await ItemRepository.findItemById(
      item_id
    )) || { quantity: 0 }

    available_quantity = items_quantity_info.quantity - maxValue
    if (first_count) {
      min_available_quantity = available_quantity
      first_count = false
    } else {
      min_available_quantity =
        available_quantity < min_available_quantity
          ? available_quantity
          : min_available_quantity
    }
    if (intervals.toLowerCase() === 'true') {
      interval_array.push({
        item_id,
        start_datetime: start_datetime_dayjs.format('YYYY-MM-DDTHH:mm'),
        end_datetime: start_datetime_dayjs
          .add(1, 'day')
          .format('YYYY-MM-DDTHH:mm'),
        available_quantity
      })
    }
    start_datetime_dayjs = start_datetime_dayjs.add(1, 'day')
    maxValue = 0
    available_quantity = 0
  }
  const integral = {
    available_quantity: min_available_quantity
  }
  if (intervals.toLowerCase() === 'true') {
    res.json(interval_array)
  } else if (intervals.toLowerCase() === 'false') {
    res.json(integral)
  }
})

export default router
