import express from 'express'
import { reservations, spaces_reserved_time, items_reserved_time, spaces, items } from '../../models/mongodb.js'
import { ObjectId } from 'mongodb'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import { error_response, R_SUCCESS, R_ID_NOT_FOUND, R_INVALID_INFO, R_INVALID_RESERVATION } from '../../utilities/response.js'

const router = express.Router()
dayjs.extend(utc)

/**
 * @openapi
 * /reserve/reserve/{reservation_id}:
 *   put:
 *     tags:
 *       - reserve
 *     summary: 更新單筆預約紀錄
 *     description: 更新單筆預約紀錄
 *     operationId: PutReservation
 *     parameters:
 *       - name: reservation_id
 *         in: path
 *         description: 預約紀錄 ID
 *         required: true
 *         schema:
 *           type: string
 *           format: Object ID
 *     requestBody:
 *       description: 更新的預約紀錄
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReservationUpdate'
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservation'
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
router.put('/reserve/:reservation_id', async function (req, res, next) {
  // define constants and variables
  const EMAIL_REGEXP = /^[\w-.+]+@([\w-]+\.)+[\w-]{2,4}$/ // user+name@domain.com
  const SUBMIT_DATETIME_REGEXP = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(\.\d*)?\+08:?00$/ // 2024-03-03T22:25:32.000+08:00
  const DATETIME_MINUTE_REGEXP = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/ // 2024-03-03T22:25
  const OBJECT_ID_REGEXP = /^[a-fA-F0-9]{24}$/ // ObjectId 格式 (652765ed3d21844635674e71)

  const reservation_id = req.params.reservation_id
  const submit_datetime = req.body.submit_datetime
  const name = req.body.name
  const department_grade = req.body.department_grade
  const organization = req.body.organization
  const email = req.body.email
  const reason = req.body.reason
  const note = req.body.note
  const updated_space_reservations = req.body.space_reservations
  const updated_item_reservations = req.body.item_reservations
  let error_message = ''

  // check input datas
  if (!OBJECT_ID_REGEXP.test(reservation_id)) {
    res
      .status(400)
      .json(error_response(R_INVALID_INFO, 'reservation_id format error'))
    return
  }

  // check whether reservation_id is exist and get reservation data
  const original_reservation = await reservations.findOne({ _id: new ObjectId(reservation_id) })
  if (!original_reservation) {
    res
      .status(404)
      .json(error_response(R_ID_NOT_FOUND, 'reservation_id not found error'))
    return
  }

  if (updated_space_reservations.length + updated_item_reservations.length <= 0) {
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

  // compare space reservations -> difference lists (add and delete)
  let add_space_reservations = []
  let remove_space_reservations = original_reservation.space_reservations
  // check add_space_reservations list
  updated_space_reservations.forEach((updated_space_reservation) => {
    // check format
    if (!OBJECT_ID_REGEXP.test(updated_space_reservation.space_id)) {
      error_message += 'space_id format error\n'
    }
    if (!DATETIME_MINUTE_REGEXP.test(updated_space_reservation.start_datetime)) {
      error_message += 'start_datetime format error\n'
    }
    if (!DATETIME_MINUTE_REGEXP.test(updated_space_reservation.end_datetime)) {
      error_message += 'end_datetime format error\n'
    }
    if (error_message.length) {
      res
        .status(400)
        .json(error_response(R_INVALID_INFO, error_message))
      return
    }
    // not reserved => add
    const original_space_reservation_index = original_reservation.space_reservations.findIndex(
      (space_reservation) => {
        return (
          space_reservation.space_id === updated_space_reservation.space_id &&
          space_reservation.start_datetime === updated_space_reservation.start_datetime &&
          space_reservation.end_datetime === updated_space_reservation.end_datetime
        )
      }
    )
    if (!original_space_reservation_index) {
      add_space_reservations.push(original_reservation.space_reservations[original_space_reservation_index])
    }

    remove_space_reservations.splice(original_space_reservation_index, 1)
  })
  // check not fully reserved
  // TODO: copy or call get_space_available_time.js

  // compare item reservations -> difference lists (add and delete)
  let add_item_reservations = []
  let remove_item_reservations = original_reservation.item_reservations
  // check add_item_reservations list
  updated_item_reservations.forEach((updated_item_reservation) => {
    // check format
    if (!OBJECT_ID_REGEXP.test(updated_item_reservation.item_id)) {
      error_message += 'item_id format error\n'
    }
    if (!DATETIME_MINUTE_REGEXP.test(updated_item_reservation.start_datetime)) {
      error_message += 'start_datetime format error\n'
    }
    if (!DATETIME_MINUTE_REGEXP.test(updated_item_reservation.end_datetime)) {
      error_message += 'end_datetime format error\n'
    }
    if (error_message.length) {
      res
        .status(400)
        .json(error_response(R_INVALID_INFO, error_message))
      return
    }
    // not reserved => add
    const original_item_reservation_index = original_reservation.item_reservations.findIndex(
      (item_reservation) => {
        return (
          item_reservation.item_id === updated_item_reservation.item_id &&
          item_reservation.start_datetime === updated_item_reservation.start_datetime &&
          item_reservation.end_datetime === updated_item_reservation.end_datetime
        )
      }
    )
    if (!original_item_reservation_index) {
      // TODO: check item quantity
      add_item_reservations.push(original_reservation.item_reservations[original_item_reservation_index])
    }

    remove_item_reservations.splice(original_item_reservation_index, 1)
  })
  // check not fully reserved
  // TODO: copy or call get_item_available_time.js

  // remove spaces reservations (copy from delete_reservation.js)
  // add spaces reservations (copy from post_reservation.js)

  // remove items reservations (copy from delete_reservation.js)
  // add items reservations (copy from post_reservation.js)

  // update reservation

  res.json({ title: 'Update reservation' })
})

export default router
