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
  const add_space_reservations = []
  const remove_space_reservations = original_reservation.space_reservations
  // check add_space_reservations list
  for (const updated_space_reservation of updated_space_reservations) {
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
    // check if the space_id exist
    const space_found = await spaces.findOne({ _id: ObjectId.createFromHexString(updated_space_reservation.space_id) })
    if (!space_found) {
      res
        .status(404)
        .json(error_response(R_ID_NOT_FOUND, 'Space ID not found'))
      return
    }
    // check if the start_datetime is earlier than end_datetime
    let start_datetime = dayjs(updated_space_reservation.start_datetime)
    let end_datetime = dayjs(updated_space_reservation.end_datetime)
    if (start_datetime.isAfter(end_datetime)) {
      res
        .status(400)
        .json(error_response(R_INVALID_RESERVATION, 'space_reservations end_datetime earlier than start_datetime is not allowed'))
      return
    }



    // TODO: tear down time slots
    // minute set to 0 (use an hour as the unit of a time slot)
    start_datetime = start_datetime.minute(0)
    if (end_datetime.minute() !== 0 || end_datetime.second() !== 0 || end_datetime.millisecond() !== 0) {
      end_datetime = end_datetime.minute(0)
      end_datetime = end_datetime.add(1, 'hour')
    }
    // cut into hours
    let stop_flag = false
    for (; start_datetime.isBefore(end_datetime);) {
      for (const space_reserved_time_segment of updated_space_reservations) {
        // chech if there has any reservation is repeated
        // no any repeated => push into updated_space_reservationstime
        if (dayjs(space_reserved_time_segment.start_datetime).isSame(start_datetime)) {
          stop_flag = true
          break
        }
      }
      if (stop_flag === true) {
        break
      }
      updated_space_reservations.push({
        start_datetime: new Date(start_datetime.format()),
        end_datetime: new Date(start_datetime.add(1, 'hour').format()),
        space_id: updated_space_reservation.space_id,
        reserved: 1
      })
      start_datetime = start_datetime.add(1, 'hour')
    }
    if (stop_flag === true) {
      res
        .status(400)
        .json(error_response(R_INVALID_RESERVATION, 'space_reservations datetime repeat error'))  // TODO: fix the bug
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
      const original_space_found = original_reservation.space_reservations[original_space_reservation_index]
      add_space_reservations.push({
        start_datetime: original_space_found.start_datetime,
        end_datetime: original_space_found.end_datetime,
        space_id: original_space_found.space_id,
        reserved: 1,
        reservations: [original_reservation._id]
      })
    }

    remove_space_reservations.splice(original_space_reservation_index, 1)
  }
  // check the spaces have not been reserved
  let db_find_result = null // db find result
  for (const add_space_reservation of add_space_reservations) {
    // find data drom db
    db_find_result = await spaces_reserved_time.findOne({
      start_datetime: add_space_reservation.start_datetime,
      space_id: add_space_reservation.space_id,
      reserved: 1
    })

    if (db_find_result == null) {
      continue
    } else if (db_find_result.reserved) {
      res
        .status(400)
        .json(error_response(R_INVALID_RESERVATION, 'space_datetime has been reserved'))
      return
    }
  }

  // compare item reservations -> difference lists (add and delete)
  const add_item_reservations = []
  const remove_item_reservations = []
  const original_item_reservations = original_reservation.item_reservations
  // check add_item_reservations list
  for (const updated_item_reservation of updated_item_reservations) {
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
    // check if the item_id exist
    const item_found = await items.findOne({ _id: ObjectId.createFromHexString(updated_item_reservation.item_id) })
    if (!item_found) {
      res
        .status(404)
        .json(error_response(R_ID_NOT_FOUND, 'Item ID not found'))
      return
    }
    // check if the start_datetime is earlier than end_datetime
    let start_datetime = dayjs(updated_item_reservation.start_datetime)
    let end_datetime = dayjs(updated_item_reservation.end_datetime)
    if (start_datetime.isAfter(end_datetime)) {
      res
        .status(400)
        .json(error_response(R_INVALID_RESERVATION, 'item_reservations end_datetime earlier than start_datetime is not allowed'))
      return
    }

    
    
    // TODO: tear down time slots
    // minute set to 0 (use an hour as the unit of a time slot)
    start_datetime = start_datetime.minute(0)
    if (end_datetime.minute() !== 0 || end_datetime.second() !== 0 || end_datetime.millisecond() !== 0) {
      end_datetime = end_datetime.minute(0)
      end_datetime = end_datetime.add(1, 'hour')
    }
    // cut into hours
    let stop_flag = false
    for (; start_datetime.isBefore(end_datetime);) {
      for (const item_reserved_time_segment of updated_item_reservations) {
        // chech if there has any reservation is repeated
        // no any repeated => push into updated_item_reservationstime
        if (dayjs(item_reserved_time_segment.start_datetime).isSame(start_datetime)) {
          stop_flag = true
          break
        }
      }
      if (stop_flag === true) {
        break
      }
      updated_item_reservations.push({
        start_datetime: new Date(start_datetime.format()),
        end_datetime: new Date(start_datetime.add(1, 'hour').format()),
        item_id: updated_item_reservation.item_id,
        quantity: updated_item_reservation.quantity
      })
      start_datetime = start_datetime.add(1, 'hour')
    }
    if (stop_flag === true) {
      res
        .status(400)
        .json(error_response(R_INVALID_RESERVATION, 'item_reservations datetime repeat error'))
      return
    }




    // categorize update_item_reservation to add and remove list
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
      // check item quantity
      const original_item_found = original_reservation.item_reservations[original_item_reservation_index]
      if (updated_item_reservation.quantity > original_item_found.quantity) {
        add_item_reservations.push({
          item_id: updated_item_reservation.item_id,
          start_datetime: updated_item_reservation.start_datetime,
          end_datetime: updated_item_reservation.end_datetime,
          quantity: updated_item_reservation.quantity - original_item_found.quantity,
          reservations: updated_item_reservation.reservations
        })
      } else if (updated_item_reservation.quantity < original_item_found.quantity) {
        remove_item_reservations.push({
          item_id: updated_item_reservation.item_id,
          start_datetime: updated_item_reservation.start_datetime,
          end_datetime: updated_item_reservation.end_datetime,
          quantity: original_item_found.quantity - updated_item_reservation.quantity,
          reservations: updated_item_reservation.reservations
        })
      } else { // updated_item_reservation.quantity === original_item_found.quantity
        // remove reservation_id from the list
        updated_item_reservation.reservations.splice(
          updated_item_reservation.reservations.findIndex(
            (reservation_id) => reservation_id === original_reservation._id
          ),
          1
        )
        remove_item_reservations.push({
          item_id: updated_item_reservation.item_id,
          start_datetime: updated_item_reservation.start_datetime,
          end_datetime: updated_item_reservation.end_datetime,
          quantity: original_item_found.quantity - updated_item_reservation.quantity,
          reservations: updated_item_reservation.reservations
        })
      }
    } else { // new time slot (not reserved originally)
      const new_reservations = []
      console.log(updated_item_reservation.reservations) // TODO: tear down time slots
      new_reservations.push(...updated_item_reservation.reservations)
      new_reservations.push(original_reservation._id) // add reservation_id to the list
      add_item_reservations.push({
        item_id: updated_item_reservation.item_id,
        start_datetime: updated_item_reservation.start_datetime,
        end_datetime: updated_item_reservation.end_datetime,
        quantity: updated_item_reservation.quantity,
        reservations: new_reservations
      })
    }

    original_item_reservations.splice(original_item_reservation_index, 1)
  }
  // put all remaining original_item_reservation into remove_item_reservations
  for (const original_item_reservation of original_item_reservations) {
    remove_item_reservations.push(original_item_reservation)
  }
  // check items not all reserved
  let max_quantity = 0
  db_find_result = null // db find result
  for (const add_item_reservation of add_item_reservations) {
    // find data drom db
    db_find_result = await items_reserved_time.findOne({
      start_datetime: add_item_reservation.start_datetime,
      item_id: add_item_reservation.item_id
    })
    max_quantity = await items.findOne({
      _id: ObjectId.createFromHexString(add_item_reservation.item_id)
    }).quantity

    if (db_find_result == null) {
      continue
    } else if (db_find_result.quantity + add_item_reservation.quantity > max_quantity) {
      res
        .status(400)
        .json(error_response(R_INVALID_RESERVATION, 'item_datetime has all been reserved'))
      return
    }
  }

  // remove spaces reservations
  for (const remove_space_reservation of remove_space_reservations) {
    spaces_reserved_time.deleteOne({
      start_datetime: remove_space_reservation.start_datetime,
      space_id: remove_space_reservation.space_id
    })
  }
  // add spaces reservations
  if (add_space_reservations.length > 0) {
    spaces_reserved_time.insertMany(add_space_reservations)
  }

  // TODO: remove items reservations (copy from delete_reservation.js)
  for (const remove_item_reservation of remove_space_reservations) {
    spaces_reserved_time.updateOne(
      {
        item_id: remove_item_reservation.item_id,
        start_datetime: remove_item_reservation.start_datetime
      }, {
        $inc: { quantity: -remove_item_reservation.quantity },
        $set: { reservations: remove_item_reservation.reservations }
      }
    )
  }
  // TODO: add items reservations (copy from post_reservation.js)
  for (const add_item_reservation of add_space_reservations) {
    spaces_reserved_time.updateOne(
      {
        item_id: add_item_reservation.item_id,
        start_datetime: add_item_reservation.start_datetime
      }, {
        $inc: { quantity: add_item_reservation.quantity },
        $set: { reservations: add_item_reservation.reservations }
      }
    )
  }

  // update reservation
  const updated_reservation = {
    status: 'modified',
    history: original_reservation.history.push({
      submit_timestamp: new Date(submit_datetime),
      server_timestamp: new Date(), // now
      type: 'modified'
    }),
    organization,
    name,
    department_grade,
    email,
    reason,
    space_reservations: updated_space_reservations,
    item_reservations: updated_item_reservations,
    note
  }
  const reservation_update_result = await reservations.updateOne(
    { _id: new ObjectId(reservation_id) },
    { $set: updated_reservation }
  )

  console.log(reservation_update_result) // TODO: process according to result and then remove it

  // TODO: send email

  res.json({ code: R_SUCCESS, message: 'Success!' })
})

export default router
