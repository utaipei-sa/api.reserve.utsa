import express from 'express'
import dayjs from 'dayjs'
import { ObjectId } from 'mongodb'
import { reservations, spaces_reserved_time, items_reserved_time, items } from '../../models/mongodb.js'
import {
    error_response,
    R_SUCCESS,
    R_ID_NOT_FOUND,
    R_INVALID_INFO,
    R_ALREADY_VERIFIED,
    R_INVALID_RESERVATION,
    R_SEND_EMAIL_FAILED
} from '../../utilities/response.js'
import send_mail_template, { RESERVATION_VERIFIED } from '../../utilities/email/send_mail_template.js'

const router = express.Router()
/**
 * @openapi
 * /reserve/verify/{reservation_id}:
 *   patch:
 *     tags:
 *       - reserve
 *     summary: 進行預約驗證
 *     description: 進行預約驗證
 *     operationId: PatchVerify
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
 *         description: reservation_id format error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error_code:
 *                   type: string
 *                   example: R_INVALID_INFO
 *                 message:
 *                   type: string
 *                   example: reservation_id format error
 *       '404':
 *         description: reservation_id not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error_code:
 *                   type: string
 *                   example: R_ID_NOT_FOUND
 *                 message:
 *                   type: string
 *                   example: reservation_id not found
 *       '409':
 *         description: reservation has already been verified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error_code:
 *                   type: string
 *                   example: R_ALREADY_VERIFIED
 *                 message:
 *                   type: string
 *                   example: This reservation has already been verified
 */
router.patch('/verify/:reservation_id', async function (req, res, next) {
  const OBJECT_ID_REGEXP = /^[a-fA-F0-9]{24}$/ // ObjectId 格式 (652765ed3d21844635674e71)
  const reservation_id = req.params.reservation_id
  if (!OBJECT_ID_REGEXP.test(reservation_id)) {
    res
      .status(400)
      .json(error_response(R_INVALID_INFO, 'reservation_id format error'))
    return
  }

  const reservation = await reservations.findOne({ _id: new ObjectId(req.params.reservation_id) })
  if (!reservation) {
    res
      .status(404)
      .json(error_response(R_ID_NOT_FOUND, 'reservation_id not found'))
    return
  }
  if (reservation.verify) {
    res
      .status(409)
      .json(error_response(R_ALREADY_VERIFIED, 'This reservation has already been verified'))
    return
  }

  const received_space_reservations = reservation.space_reservations
  const received_item_reservations = reservation.item_reservations
  const received_space_reserved_time = []
  const received_item_reserved_time = []
  // space reservation process
  for (const space_reservation of received_space_reservations) {
    // space時間確認
    let start_datetime = dayjs(space_reservation.start_datetime)
    let end_datetime = dayjs(space_reservation.end_datetime)

    // 判斷不乾淨的分鐘數 補整
    start_datetime = start_datetime.minute(0)
    if (end_datetime.minute() !== 0 || end_datetime.second() !== 0 || end_datetime.millisecond() !== 0) {
      end_datetime = end_datetime.minute(0)
      end_datetime = end_datetime.add(1, 'hour')
    }
    // 將時間段切個成一小時為單位
    let stop_flag = 0
    for (; start_datetime.isBefore(end_datetime);) {
      for (let i = 0; i < received_space_reserved_time.length; i++) {
        // 判斷收到的reservation時間段是否有重複的，
        // 有的話就直接ret space_datetime repeat error
        // 沒有就push進received_space_reserved_time
        if (dayjs(received_space_reserved_time[i].start_datetime).isSame(start_datetime) && received_space_reserved_time[i].space_id === space_reservation.id) {
          stop_flag = 1
          break
        }
      }
      if (stop_flag === 1) {
        break
      }
      received_space_reserved_time.push({
        start_datetime: new Date(start_datetime.format()),
        end_datetime: new Date(start_datetime.add(1, 'hour').format()),
        space_id: space_reservation.space_id,
        reserved: 1
      })
      start_datetime = start_datetime.add(1, 'hour')
    }
  }
  // 確認db裡有沒有被借過
  let db_space_check // db資料暫存器
  for (let i = 0; i < received_space_reserved_time.length; i++) {
    // 挖db
    db_space_check = await spaces_reserved_time.findOne({
      start_datetime: received_space_reserved_time[i].start_datetime,
      space_id: received_space_reserved_time[i].space_id,
      reserved: 1
    })

    if (db_space_check == null) {
      continue
    } else if (db_space_check.reserved) {
      res
        .status(400)
        .json(error_response(R_INVALID_RESERVATION, 'space_datetime has reserved error'))
      return
    }
  }

  // 重複的註解就不打了，參考樓上space(絕對不是我懶
  // item reservation process
  for (const item_reservation of received_item_reservations) {
    // =============== ↓底下還沒更新↓ ===============
    let start_datetime = dayjs(item_reservation.start_datetime)
    let end_datetime = dayjs(item_reservation.end_datetime)

    // 判斷不乾淨的分鐘數
    start_datetime = start_datetime.minute(0)
    if (end_datetime.minute() !== 0 || end_datetime.second() !== 0 || end_datetime.millisecond() !== 0) {
      end_datetime = end_datetime.minute(0)
      end_datetime = end_datetime.add(1, 'hour')
    }

    let stop_flag = 0
    for (; start_datetime.isBefore(end_datetime);) {
      for (let i = 0; i < received_item_reserved_time.length; i++) {
        if (dayjs(received_item_reserved_time[i].start_datetime).isSame(start_datetime) && received_item_reserved_time[i].item_id === item_reservation.id) {
          stop_flag = 1
          break
        }
      }
      if (stop_flag === 1) {
        break
      }
      received_item_reserved_time.push({
        start_datetime: new Date(start_datetime.format()),
        end_datetime: new Date(start_datetime.add(1, 'hour').format()),
        item_id: item_reservation.item_id,
        reserved_quantity: item_reservation.quantity
      })
      start_datetime = start_datetime.add(1, 'hour')
    }
  }
  console.log('item time', received_item_reserved_time)
  let db_item_check
  let max_quantity
  for (let i = 0; i < received_item_reserved_time.length; i++) {
    max_quantity = await items.findOne({ _id: new ObjectId(received_item_reserved_time[i].item_id) })
    db_item_check = await items_reserved_time.findOne({
      start_datetime: received_item_reserved_time[i].start_datetime,
      item_id: received_item_reserved_time[i].item_id
    })
    if (db_item_check == null) {
      continue
    } else {
      if (db_item_check.reserved_quantity <= max_quantity.quantity - received_item_reserved_time[i].reserved_quantity) {
        continue
      } else {
        res
          .status(400)
          .json(error_response(R_INVALID_RESERVATION, 'item_datetime has over reserved error'))
        return
      }
    }
  }

  console.log(received_item_reserved_time)
  // TODO :: update items reserved_quantity
  for (let i = 0; i < received_item_reserved_time.length; i++) {
    console.log(i)
    // const max_quantity = await items.findOne({ _id: new ObjectId(received_item_reserved_time[i].item_id) })
    const db_item_check = await items_reserved_time.findOne({
      start_datetime: received_item_reserved_time[i].start_datetime,
      item_id: received_item_reserved_time[i].item_id
    })

    if (db_item_check != null) {
      console.log('suc')
      console.log(db_item_check)
      await items_reserved_time.updateOne(
        {
          _id: db_item_check._id
        },
        {
          $inc: { reserved_quantity: received_item_reserved_time[i].reserved_quantity },
          $push: { reservations: reservation_id }
        }
      )
      received_item_reserved_time.splice(i, 1)
      i--
      console.log(received_item_reserved_time)
    } else {
      console.log('fail')
      console.log(db_item_check)
    }
  }

  for (const spaces_reserved_time_each of received_space_reserved_time) {
    spaces_reserved_time_each.reservations = [reservation_id]
  }
  if (received_space_reserved_time.length > 0) {
    spaces_reserved_time.insertMany(received_space_reserved_time)
  }

  for (const items_reserved_time_each of received_item_reserved_time) {
    items_reserved_time_each.reservations = [reservation_id]
  }
  console.log(received_item_reserved_time)
  if (received_item_reserved_time.length > 0) {
    items_reserved_time.insertMany(received_item_reserved_time)
  }
  console.log(received_item_reserved_time)

  await reservations.updateOne(
    { _id: new ObjectId(req.params.reservation_id) },
    { $set: { verify: 1 } }
  )

  // send email
  try {
    const email_response = await send_mail_template(RESERVATION_VERIFIED, reservation)
    console.log('The email has been sent: ' + email_response)
  } catch (error) {
    console.error('Error sending email:', error)
    res
      .status(400)
      .json(error_response(R_SEND_EMAIL_FAILED, error.response))
    return
  }

  res.status(200).json({
    code: R_SUCCESS,
    message: 'success!'
  })
})

export default router
