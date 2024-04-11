import express from 'express'
import { ObjectId } from 'mongodb'
import { spaces, spaces_reserved_time } from '../../models/mongodb.js'

const router = express.Router()

/**
 * @openapi
 * /reserve/integral_space_availability:
 *   get:
 *     tags:
 *       - reserve
 *     summary: 查詢特定時段場地是否可供借用
 *     description: 查詢特定時段場地是否可供借用
 *     operationId: GetIntegralSpaceAvailability
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
 *               $ref: '#/components/schemas/SpaceAvailability'
 */
router.get('/integral_space_availability', async function(req, res, next) {
  // 取得參數
  const space_id = req.query.space_id
  const start_datetime = req.query.start_datetime
  const end_datetime = req.query.end_datetime

  // 檢查輸入是否正確（正規表達式 Regular Expression）
  const OBJECT_ID_REGEXP = /^[a-fA-F0-9]{24}$/  // ObjectId 格式
  const DATETIME_MINUTE_REGEXP = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/  // 日期時間格式（年-月-日T時:分）
  if (space_id === undefined || start_datetime === undefined || end_datetime === undefined) {  // 沒給齊參數
    res
      .status(400)
      .json({ error: 'space_id, start_datetime, and end_datetime are required' })
    return
  } else if (!OBJECT_ID_REGEXP.test(space_id)) {  // check space_id format
    res
      .status(400)
      .json({ error: 'space_id format error' })
    return
  } else if (!DATETIME_MINUTE_REGEXP.test(start_datetime) || !DATETIME_MINUTE_REGEXP.test(end_datetime)) {  // check datetime fromat
    res
      .status(400)
      .json({ error: 'datetime format error' })
    return
  }

  // 查詢場地資訊
  const space_found = await spaces.findOne({ _id: new ObjectId(space_id) })
  if (!space_found) {
    res
      .status(400)
      .json({ error: 'space_id not found error' })
    return
  }
    
  // 取得場地預約時段紀錄
  const spaces_reservations = await spaces_reserved_time.find({ 
    space_id: space_id, 
    start_datetime: {
      $gte: new Date(start_datetime+':00+0800'),  // query start_datetime
      $lt: new Date(end_datetime+':00+0800')  // query end_datetime
    },
    reserved: 1
  }).toArray()  // 搜尋時間範圍內已被預約的時段

  console.log(spaces_reservations)
  if (spaces_reservations.length > 0) {
    // 已被借用(不可借)
    res.json({
      data: {
        "space_id": space_id,
        "start_datetime": start_datetime,
        "end_datetime" : end_datetime,
        "availability": 0
      }
    })
  } else {
    // 未被借用(可借)
    res.json({
      data: {
        "space_id": space_id,
        "start_datetime": start_datetime,
        "end_datetime" : end_datetime,
        "availability": 1
      }
    })
  }
})

export default router
