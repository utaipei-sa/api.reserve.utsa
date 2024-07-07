import express from 'express'
import { reservations, spaces_reserved_time, items_reserved_time } from '../../models/mongodb.js'
import { ObjectId } from 'mongodb'
import { R_SUCCESS, R_ID_NOT_FOUND } from '../../utilities/response.js'

// import { Timestamp } from 'mongodb'

const router = express.Router()

/**
 * @openapi
 * /reserve/reserve/{reservation_id}:
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
router.delete('/reserve/:reservation_id', async function (req, res, next) {
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
  // 刪除預約紀錄
  const output = []
  const reservation_find = await reservations.findOne({ _id: { $in: [new ObjectId(reservation_id)] } })
  if (reservation_find == null) {
    output.push({
      code: R_ID_NOT_FOUND,
      message: 'Reservation ID not found'
    })
  } else {
    const storeReserveInfo = []
    if (reservation_find.item_reservations != null) {
      for (const element of reservation_find.item_reservations) {
        storeReserveInfo.push({
          item_id: element.item_id,
          quantity: element.quantity
        })
      }
    }

    const item_reserved_time_find = await items_reserved_time.find({ reservation_id: { $in: [new ObjectId(reservation_id)] } }).toArray()
    const space_reserved_time_find = await spaces_reserved_time.find({ reservation_id: { $in: [new ObjectId(reservation_id)] } }).toArray()

    // delete items_reserved_time

    for (const item of item_reserved_time_find) {
      let quantity = 0
      const index = storeReserveInfo.findIndex(e => e.item_id === item.item_id)
      quantity = item.reserved_quantity - storeReserveInfo[index].quantity

      await items_reserved_time.updateOne({
        _id: item._id// filter
      },
      {
        $set: {
          reserved_quantity: quantity// change data
        },
        $pull: {
          reservation_id: new ObjectId(reservation_id)
        }
      })
    }

    // space
    for (const space of space_reserved_time_find) {
      await spaces_reserved_time.updateOne({
        _id: space._id// filter
      },
      {
        $set: {
          reserved: 0// change data
        },
        $pull: {
          reservations: new ObjectId(reservation_id)
        }
      })
    }

    const reservation_result = await reservations.deleteMany({ _id: new ObjectId(reservation_id) })
    await items_reserved_time.deleteMany({ reserved_quantity: 0 })
    await spaces_reserved_time.deleteMany({ reserved_quantity: 0 })
    if (reservation_result.deletedCount > 0) {
      output.push({
        code: R_SUCCESS,
        message: 'Delete success!'
      })
    }
  }
  res.json(output)
})

export default router
