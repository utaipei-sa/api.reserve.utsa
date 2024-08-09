import express from 'express'
import { reservations, spaces_reserved_time, items_reserved_time } from '../../models/mongodb.js'
import { ObjectId } from 'mongodb'
import { error_response, R_SUCCESS, R_ID_NOT_FOUND, R_SEND_EMAIL_FAILED } from '../../utilities/response.js'
import sendEmail from '../../utilities/email/email.js'
import {
  subject as email_subject,
  html as email_html
} from '../../utilities/email/templates/cancel_reservation.js'

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
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                 message:
 *                   type: string
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
 */
router.delete('/reserve/:reservation_id', async function (req, res, next) {
  // 取得參數
  const reservation_id = req.params.reservation_id

  const OBJECT_ID_REGEXP = /^[a-fA-F0-9]{24}$/ // ObjectId 格式 (652765ed3d21844635674e71)
  // 檢查輸入是否正確
  if (reservation_id === undefined) { // 沒給參數
    res
      .status(400)
      .json(error_response(R_ID_NOT_FOUND, 'Reservation ID not found'))
    return
  } else if (!OBJECT_ID_REGEXP.test(reservation_id)) { // check reservation_id format
    res
      .status(400)
      .json(error_response(R_ID_NOT_FOUND, 'Reservation ID not found'))
    return
  }
  // 查詢欲刪除的預約紀錄資訊
  // 刪除預約紀錄
  const reservation_find = await reservations.findOne({ _id: { $in: [new ObjectId(reservation_id)] } })
  if (reservation_find == null) {
    res
      .status(400)
      .json(error_response(R_ID_NOT_FOUND, 'Reservation ID not found'))
  } else {
    const email = reservation_find.email
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
    console.log('\x1B[36m%s\x1B[0m', 'console.log--------------------------------------------------------------------------')
    console.log('\x1B[36m%s\x1B[0m', 'reservation_id:           ' + req.params.reservation_id)
    console.log('\x1B[36m%s\x1B[0m', 'item_find_array_length:   ' + item_reserved_time_find.length)
    console.log('\x1B[36m%s\x1B[0m', 'space_find_array_length:  ' + space_reserved_time_find.length)
    // delete items_reserved_time

    for (const item of item_reserved_time_find) {
      let quantity = 0
      const index = storeReserveInfo.findIndex(e => e.item_id === item.item_id)
      quantity = item.reserved_quantity - storeReserveInfo[index].quantity

      console.log('\x1B[36m%s\x1B[0m', 'update item_id:           ' + item_id)
      console.log('\x1B[36m%s\x1B[0m', 'after delete quantity:    ' + quantity)
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
      console.log('\x1B[36m%s\x1B[0m', 'update space_id:           ' + space_id)
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
    await spaces_reserved_time.deleteMany({ reserved: 0 })
    console.log('\x1B[36m%s\x1B[0m', 'reservation_result.deletedCount:     ' + reservation_result.deletedCount)
    if (reservation_result.deletedCount > 0) {
      // send email
      try {
        const email_response = await sendEmail(email, email_subject, email_html)
        console.log('The email has been sent: ' + email_response)
      } catch (error) {
        console.error('Error sending email:', error)
        res
          .status(200)
          .json(error_response(R_SEND_EMAIL_FAILED, error.response))
        return
      }
      // success
      res
        .status(200)
        .json({ code: R_SUCCESS, message: 'Success!' })
    }
    console.log('\x1B[36m%s\x1B[0m', 'console.log end--------------------------------------------------------------------------')
  }
})

export default router
