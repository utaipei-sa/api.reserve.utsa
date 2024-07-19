import express from 'express'
import { reservations, spaces_reserved_time, items_reserved_time, spaces, items } from '../../models/mongodb.js'
import { ObjectId } from 'mongodb'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import { URL } from 'url'
import { error_response, R_SUCCESS, R_ID_NOT_FOUND, R_INVALID_INFO, R_INVALID_RESERVATION, R_SEND_EMAIL_FAILED } from '../../utilities/response.js'
import send_reservation_email from '../../utilities/email/sendReservationEmail.js'

const router = express.Router()
dayjs.extend(utc)

/**
 * @openapi
 * /reserve/reserve:
 *   post:
 *     tags:
 *       - reserve
 *     summary: 新增單筆預約紀錄
 *     description: 新增單筆預約紀錄
 *     operationId: PostReserve
 *     requestBody:
 *       description: 新增的預約紀錄
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReservationPost'
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
router.post('/reserve', async function (req, res, next) {
  const EMAIL_REGEXP = /^[\w-.+]+@([\w-]+\.)+[\w-]{2,4}$/ // user+name@domain.com
  const SUBMIT_DATETIME_REGEXP = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(\.\d*)?\+08:?00$/ // 2024-03-03T22:25:32.000+08:00
  const DATETIME_MINUTE_REGEXP = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/ // 2024-03-03T22:25
  const OBJECT_ID_REGEXP = /^[0-9a-fA-F]{24}$/ // 652765ed3d21844635674e71

  const submit_datetime = req.body.submit_datetime
  const name = req.body.name
  const department_grade = req.body.department_grade
  const organization = req.body.organization
  const email = req.body.email
  const reason = req.body.reason
  const note = req.body.note
  const received_space_reservations = req.body.space_reservations
  const received_item_reservations = req.body.item_reservations
  let error_message = ''

  // check input datas
  if (received_space_reservations.length + received_item_reservations.length <= 0) {
    error_message += 'empty reservation error\n'
  }
  if (!EMAIL_REGEXP.test(email)) {
    error_message += 'email format error\n'
  }
  if (!SUBMIT_DATETIME_REGEXP.test(submit_datetime)) {
    error_message += 'submit_datetime format error\n'
  }
  if (!name) { // name string or undefined
    error_message += 'name empty error\n'
  }
  if (!department_grade) { // name string or undefined
    error_message += 'department_grade empty error\n'
  }
  if (!organization) { // empty string or undefined
    error_message += 'organization empty error\n'
  }
  if (!reason) { // empty string or undefined
    error_message += 'reason empty error\n'
  }
  if (error_message.length) {
    res
      .status(400)
      .json(error_response(R_INVALID_INFO, error_message))
    return
  }

  // TODO: add reservation_id
  const reservation_id = new ObjectId()
  const received_space_reserved_time = []
  const received_item_reserved_time = []

  // space reservation process
  for (const space_reservation of received_space_reservations) {
    // check data format
    if (!OBJECT_ID_REGEXP.test(space_reservation.space_id)) {
      error_message += 'space_reservations space_id format error\n'
    }
    if (!DATETIME_MINUTE_REGEXP.test(space_reservation.start_datetime)) {
      error_message += 'space_reservations start_datetime format error\n'
    }
    if (!DATETIME_MINUTE_REGEXP.test(space_reservation.end_datetime)) {
      error_message += 'space_reservations end_datetime format error\n'
    }
    if (error_message.length) {
      res
        .status(400)
        .json(error_response(R_INVALID_RESERVATION, error_message))
      return
    }

    // check whether space_id is exist
    const space_found = await spaces.findOne({ _id: new ObjectId(space_reservation.space_id) })
    if (!space_found) {
      res
        .status(404)
        .json(error_response(R_ID_NOT_FOUND, 'Space ID not found'))
      return
    }
    // space時間確認
    let start_datetime = dayjs(space_reservation.start_datetime)
    let end_datetime = dayjs(space_reservation.end_datetime)
    // 起始時間必定早於結束時間
    if (start_datetime.isAfter(end_datetime)) {
      res
        .status(400)
        .json(error_response(R_INVALID_RESERVATION, 'space_reservations end_datetime earlier than start_datetime error'))
      return
    }

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
        if (dayjs(received_space_reserved_time[i].start_datetime).isSame(start_datetime)) {
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
    if (stop_flag) {
      res
        .status(400)
        .json(error_response(R_INVALID_RESERVATION, 'space_datetime repeat error'))
      return
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
    // check
    if (item_reservation.quantity <= 0) {
      error_message += 'item_reservations quantity error\n'
    }
    if (!OBJECT_ID_REGEXP.test(item_reservation.item_id)) {
      error_message += 'item_reservations item_id format error\n'
    }
    if (!DATETIME_MINUTE_REGEXP.test(item_reservation.start_datetime)) {
      error_message += 'item_reservations start_datetime format error\n'
    }
    if (!DATETIME_MINUTE_REGEXP.test(item_reservation.end_datetime)) {
      error_message += 'item_reservations end_datetime format error\n'
    }
    if (error_message.length) {
      res
        .status(400)
        .json(error_response(R_INVALID_RESERVATION, error_message))
      return
    }

    // check whether item_id is exist
    const item_found = await items.findOne({ _id: new ObjectId(item_reservation.item_id) })
    if (!item_found) { // <-- notice what's this when not found (should be same as space)
      res
        .status(404)
        .json(error_response(R_ID_NOT_FOUND, 'item_reservations item_id not found error'))
      return
    }

    // =============== ↓底下還沒更新↓ ===============
    let start_datetime = dayjs(item_reservation.start_datetime)
    let end_datetime = dayjs(item_reservation.end_datetime)

    if (start_datetime.isAfter(end_datetime)) {
      res
        .status(400)
        .json(error_response(R_INVALID_RESERVATION, 'item_reservation end_datetime earlier than start_datetime error'))
      return
    }

    // 判斷不乾淨的分鐘數
    start_datetime = start_datetime.minute(0)
    if (end_datetime.minute() !== 0 || end_datetime.second() !== 0 || end_datetime.millisecond() !== 0) {
      end_datetime = end_datetime.minute(0)
      end_datetime = end_datetime.add(1, 'hour')
    }

    let stop_flag = 0
    for (; start_datetime.isBefore(end_datetime);) {
      for (let i = 0; i < received_item_reserved_time.length; i++) {
        if (dayjs(received_item_reserved_time[i].start_datetime).isSame(start_datetime)) {
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
    if (stop_flag) {
      res
        .status(400)
        .json(error_response(R_INVALID_RESERVATION, 'item_datetime repeat error'))
      return
    }
  }
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

  // insert reservation into database
  const doc = {
    _id: reservation_id,
    verify: 0,
    status: 'new', // new/modified/canceled
    history: [
      {
        submit_timestamp: new Date(submit_datetime),
        server_timestamp: new Date(), // now
        type: 'new' // new/modify/cancel
      }
    ],
    organization,
    name,
    department_grade,
    email,
    reason,
    space_reservations: received_space_reservations,
    item_reservations: received_item_reservations,
    note
  }
  const reservations_result = await reservations.insertOne(doc)
  console.log(received_item_reserved_time)
  // TODO :: update items reserved_quantity
  for (let i = 0; i < received_item_reserved_time.length; i++) {
    console.log(i)
    max_quantity = await items.findOne({ _id: new ObjectId(received_item_reserved_time[i].item_id) })
    db_item_check = await items_reserved_time.findOne({
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
          $push: { reservation_id: reservations_result.insertedId }
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
    spaces_reserved_time_each.reservation_id = reservations_result.insertedId
  }
  if (received_space_reserved_time.length > 0) {
    spaces_reserved_time.insertMany(received_space_reserved_time)
  }
  for (const items_reserved_time_each of received_item_reserved_time) {
    items_reserved_time_each.reservation_id = [reservations_result.insertedId]
  }
  console.log(received_item_reserved_time)
  if (received_item_reserved_time.length > 0) {
    items_reserved_time.insertMany(received_item_reserved_time)
  }
  console.log(received_item_reserved_time)

  // send verify email
  const verify_link = new URL(`verify/${reservation_id}`, process.env.FRONTEND_BASE_URL)
  try {
    const email_response = await send_reservation_email(doc, verify_link.href)
    console.log('The email has been sent: ' + email_response)
  } catch (error) {
    console.error('Error sending email:', error)
    res
      .status(400)
      .json(error_response(R_SEND_EMAIL_FAILED, error.response))
    return
  }

  res.json({ code: R_SUCCESS, message: 'Success!' })
})

export default router