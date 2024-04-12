import express from 'express'
import { reservations, spaces_reserved_time, items_reserved_time } from '../../models/mongodb.js'
import { ObjectId } from 'mongodb'
// import { Timestamp } from 'mongodb'

const router = express.Router()

/**
 * @openapi
 * /reserve/reservation/{reservation_id}:
 *   delete:
 *     tags:
 *       - reserve
 *     summary: 刪除單筆預約紀錄
 *     description: 刪除單筆預約紀錄
 *     operationId: DeleteReservation
 *     parameters:
 *       - name: reservation_id
 *         in: path
 *         description: 預約紀錄 ID
 *         required: true
 *         schema:
 *           type: string
 *           format: Object ID
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservation'
 */
router.delete('/reservation/:reservation_id', async function (req, res, next) {
  // 取得參數
  const reservation_id = req.params.reservation_id

  const OBJECT_ID_REGEXP = /^[a-fA-F0-9]{24}$/ // ObjectId 格式 (652765ed3d21844635674e71)

  // 檢查輸入是否正確
  if (reservation_id === undefined) { // 沒給參數
    res
      .status(400)
      .json({ error: 'reservation_id is required' })
    return
  } else if (!OBJECT_ID_REGEXP.test(reservation_id)) { // check reservation_id format
    res
      .status(400)
      .json({ error: 'reservation_id format error' })
    return
  }

  // 查詢欲刪除的預約紀錄資訊
  const reservation = await reservations.findOne({ _id: new ObjectId(reservation_id) })
  if (!reservation) {
    res.json({ info: 'Reservation not found' })
    return
  }

  // TODO: 刪除場地時段預約紀錄
  // TODO:    使用 reservation.space_reservations 的時段清單，刪除 spaces_reserved_time collection 內所有位於時段內的場地預約紀錄

  // TODO: 刪除物品時段預約紀錄
  // TODO:    使用 reservation.item_reservations 的時段清單，逐一減去 items_reserved_time collection 內所有位於時段內的物品預約數量

  // 刪除預約紀錄
  const reservation_result = await reservations.deleteOne({ _id: new ObjectId(reservation_id) })

  // 輸出/回傳
  if (reservation_result.deletedCount === 1) {
    res.json({ info: 'Delete successfully' })
  } else {
    res.json({ info: 'Reservation not found' })
  }
})

export default router
