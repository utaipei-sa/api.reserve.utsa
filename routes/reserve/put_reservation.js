import express from 'express'
import { reservations, spaces_reserved_time, items_reserved_time, spaces, items } from '../../models/mongodb.js'
import { ObjectId } from 'mongodb'
// import { Timestamp } from 'mongodb'

const router = express.Router()

/**
 * @openapi
 * /reserve/reservation/{reservation_id}:
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
 */
router.put('/reservation/:reservation_id', async function(req, res, next) {
  // define constants and variables
  const EMAIL_REGEXP = /^[\w-.\+]+@([\w-]+\.)+[\w-]{2,4}$/  // user+name@domain.com
  const SUBMIT_DATETIME_REGEXP = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(\.\d*)?\+08:?00$/  // 2024-03-03T22:25:32.000+08:00
  const DATETIME_MINUTE_REGEXP = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/  // 2024-03-03T22:25
  const OBJECT_ID_REGEXP = /^[a-fA-F0-9]{24}$/  // ObjectId 格式 (652765ed3d21844635674e71)

  const reservation_id = req.params.reservation_id
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
  if (!OBJECT_ID_REGEXP.test(reservation_id)) {
    res
      .status(400)
      .json({ error: 'reservation_id format error' })
    return
  }

  // check whether reservation_id is exist and get reservation data
  const original_reservation = await reservations.findOne({ _id: new ObjectId(space_reservation.space_id) })
  if (!original_reservation) {
    res
      .status(400)
      .json({ error: 'reservation_id not found error' })
    return
  }
    
  if (received_space_reservations.length + received_item_reservations.length <= 0) {
    error_message += 'empty reservation error\n'
  }
  if (!EMAIL_REGEXP.test(email)) {
    error_message += 'email format error\n'
  }
  if (!SUBMIT_DATETIME_REGEXP.test(submit_datetime)) {
    error_message += 'submit_datetime format error\n'
  }
  if (!name) {  // name string or undefined
    error_message += 'name empty error\n'
  }
  if (!department_grade) {  // name string or undefined
    error_message += 'department_grade empty error\n'
  }
  if (!organization) {  // empty string or undefined
    error_message += 'organization empty error\n'
  }
  if (!reason) {  // empty string or undefined
    error_message += 'reason empty error\n'
  }
  if (error_message.length) {
    res
      .status(400)
      .json({ error: error_message })
    return
  }

  // compare space reservations -> difference lists (add and delete)
  // check add_space_reservations list

  // compare item reservations -> difference lists (add and delete)
  // check add_item_reservations list

  // remove spaces reservations (copy from delete_reservation.js)
  // add spaces reservations (copy from post_reservation.js)

  // remove items reservations (copy from delete_reservation.js)
  // add items reservations (copy from post_reservation.js)

  // update reservation

  res.json({ title: 'Update reservation' })
})

export default router
