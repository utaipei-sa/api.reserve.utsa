import express from 'express'
import { reservations, spaces_reserved_time, items_reserved_time } from '../../models/mongodb.js'
import { ObjectId } from 'mongodb'
import { error_response, R_SUCCESS, R_ID_NOT_FOUND, R_INVALID_INFO, R_INVALID_RESERVATION } from '../../utilities/response.js'

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

  // const reservation = await reservations.findOne({ _id: new ObjectId(reservation_id) })
  // if (!reservation) {
  //   res.json({ info: 'Reservation not found' })
  //   return
  // }

  // TODO: 刪除場地時段預約紀錄
  // TODO:    使用 reservation.space_reservations 的時段清單，刪除 spaces_reserved_time collection 內所有位於時段內的場地預約紀錄

  // TODO: 刪除物品時段預約紀錄
  // TODO:    使用 reservation.item_reservations 的時段清單，逐一減去 items_reserved_time collection 內所有位於時段內的物品預約數量

  // 刪除預約紀錄
  const output = []
  const reservation_find = await reservations.findOne({ _id: { $in: [new ObjectId(reservation_id)] } })
  if (reservation_find == null) {
    output.push({
      code: R_ID_NOT_FOUND,
      message: "Reservation ID not found"
    })
  }
  else {
    let reservation_quantity = 0
    if (reservation_find.item_reservations != null) {
      reservation_quantity = reservation_find.item_reservations[0].quantity
    }


    const item_reserved_time_find = await items_reserved_time.find({ reservation_id: { $in: [new ObjectId(reservation_id)] } }).toArray()
    const space_reserved_time_find = await spaces_reserved_time.find({ reservation_id: { $in: [new ObjectId(reservation_id)] } }).toArray()


    //delete items_reserved_time
    
    for (const item of item_reserved_time_find) {
      let quantity = 0;
      let ID;
      quantity = item.reserved_quantity - reservation_quantity
      ID = item._id
      const updateResult = await items_reserved_time.updateOne({
        _id: ID//filter
      },
        {
          $set: {
            reserved_quantity: quantity//change data
          }
          ,
          $pull: {
            reservation_id: new ObjectId(reservation_id)
          }
        })
    }

    //space
    for (const space of space_reserved_time_find) {
      tempID = space._id
      await spaces_reserved_time.updateOne({
        _id: tempID//filter
      },
        {
          $set: {
            reserved: 0//change data
          }
          ,
          $pull: {
            reservations: new ObjectId(reservation_id)
          }
        })
    }


    const reservation_result = await reservations.deleteMany({ _id: new ObjectId(reservation_id) })
    const item_result = await items_reserved_time.deleteMany({ reserved_quantity: 0 })
    const space_result = await spaces_reserved_time.deleteMany({ reserved_quantity: 0 })
    if (reservation_result.deletedCount > 0) {
      output.push({
        code: R_SUCCESS,
        message: "Delete success!"
      })
    }
  }
  res.json(output)
})

export default router
