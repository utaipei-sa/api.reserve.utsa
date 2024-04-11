import express from 'express'
import { ObjectId } from 'mongodb'
import { items, items_reserved_time } from '../../models/mongodb.js'

const router = express.Router()

/**
 * @openapi
 * /reserve/integral_item_availability:
 *   get:
 *     tags:
 *       - reserve
 *     summary: 查詢特定時段物品可借數量
 *     description: 查詢特定時段物品可借數量
 *     operationId: GetIntegralItemAvailability
 *     parameters:
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
 *               $ref: '#/components/schemas/ItemAvailability'
 */
router.get('/integral_item_availability', async function(req, res, next) {
  // 取得參數
  const item_id = req.query.item_id
  const start_datetime = req.query.start_datetime
  const end_datetime = req.query.end_datetime

  // 檢查輸入是否正確（正規表達式 Regular Expression）
  const OBJECT_ID_REGEXP = /^[a-fA-F0-9]{24}$/  // ObjectId 格式
  const DATETIME_MINUTE_REGEXP = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/  // 日期時間格式（年-月-日T時:分）
  if (item_id === undefined || start_datetime === undefined || end_datetime === undefined) {  // 沒給齊參數
    res
      .status(400)
      .json({ error: 'item_id, start_datetime, and end_datetime are required' })
    return
  } else if (!OBJECT_ID_REGEXP.test(item_id)) {  // check item_id format
    res
      .status(400)
      .json({ error: 'item_id format error' })
    return
  } else if (!DATETIME_MINUTE_REGEXP.test(start_datetime) || !DATETIME_MINUTE_REGEXP.test(end_datetime)) {  // check datetime fromat
    res
      .status(400)
      .json({ error: 'datetime format error' })
    return
  }

  // 查詢物品資訊
  const item_found = await items.findOne({ _id: new ObjectId(item_id) })
  if (!item_found) {
    res
      .status(400)
      .json({ error: 'item_id not found error' })
    return
  }
  const max_quantity = item_found.quantity
    
  // 取得物品預約時段紀錄
  const items_reservations = await items_reserved_time.find({ 
    item_id: item_id, 
    start_datetime: {
      $gte: new Date(start_datetime+':00+0800'),  // query start_datetime
      $lt: new Date(end_datetime+':00+0800')  // query end_datetime
    }
  }).toArray()  // 搜尋時間範圍內已被預約的時段

  // 取得單一時段已被預約的最大數量
  let max_reserved_quantity = 0
  for (const item_reservation of items_reservations) {
    max_reserved_quantity = item_reservation.reserved_quantity > max_reserved_quantity
      ? item_reservation.reserved_quantity
      : max_reserved_quantity
  }

  // 輸出/回傳結果
  res.json({
    data: {
      "item_id": item_id,
      "start_datetime": start_datetime,
      "end_datetime" : end_datetime,
      "available_quantity": max_quantity - max_reserved_quantity
    }
  })
})

export default router
