import express from 'express'
import { reservations, spaces_reserved_time, items_reserved_time, items } from '../../models/mongodb.js'
import { ObjectId } from 'mongodb'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import {
  error_response,
  R_ID_NOT_FOUND,
  R_INVALID_INFO,
  R_INVALID_RESERVATION,
  R_SUCCESS
} from '../../utilities/response.js'
import validateRservationInfo from '../../utilities/reserve/validate_reservation_info.js'
import validateSpaceReservation from '../../utilities/reserve/validate_space_reservation.js'
import splitSpaceReservation from '../../utilities/reserve/split_space_reservation.js'
import validateItemReservation from '../../utilities/reserve/validate_item_reservation.js'
import splitItemReservation from '../../utilities/reserve/split_item_reservation.js'

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
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: R_SUCCESS
 *                 message:
 *                   type: string
 *                   example: "Success!"
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
  const OBJECT_ID_REGEXP = /^[a-fA-F0-9]{24}$/ // ObjectId 格式 (652765ed3d21844635674e71)

  const reservation_id = req.params.reservation_id
  const submit_datetime = req.body.submit_datetime
  const name = req.body.name
  const department_grade = req.body.department_grade
  const organization = req.body.organization
  const email = req.body.email
  const reason = req.body.reason
  const note = req.body.note || ''
  const updated_space_reservations = req.body.space_reservations ?? []
  const updated_item_reservations = req.body.item_reservations ?? []
  console.log('\x1B[36m%s\x1B[0m', "console.log--------------------------------------------------------------------------")
  console.log('\x1B[36m%s\x1B[0m',
    "reservation_id:".padEnd(40) +
    reservation_id.padEnd(40) + typeof (reservation_id) +
    "\nsubmit_datetime:".padEnd(40) +
    submit_datetime.padEnd(40) + typeof (submit_datetime) +
    "\nname:".padEnd(40) +
    name.padEnd(40) + typeof (name) +
    "\ndepartment_grade:".padEnd(40) +
    department_grade.padEnd(40) + typeof (department_grade) +
    "\norganization:".padEnd(40) +
    organization.padEnd(40) + typeof (organization) +
    "\nemail:".padEnd(40) +
    email.padEnd(40) + typeof (email) +
    "\nreason:".padEnd(40) +
    reason.padEnd(40) + typeof (reason) +
    "\nnote:".padEnd(40) +
    note.padEnd(40) + typeof (note))
    console.log('\x1B[36m%s\x1B[0m',"updated_space_reservations:")
    console.log(updated_space_reservations)
    console.log('\x1B[36m%s\x1B[0m',"updated_item_reservations:")
    console.log(updated_item_reservations)
  // let error_message = ''

  // check input datas
  // check reservation_id format
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
  // check not empty reservation
  if (updated_space_reservations.length + updated_item_reservations.length <= 0) {
    res
      .status(400)
      .json(error_response(R_INVALID_INFO, 'empty reservation error'))
    return
  }
  // validate reservation basic info
  const validate_result = validateRservationInfo(
    submit_datetime, name, department_grade, organization, email, reason, note,
    updated_space_reservations, updated_item_reservations
  )
  if (validate_result.status !== 200) {
    res
      .status(validate_result.status)
      .json(validate_result.json)
    return
  }

  const verify = original_reservation.verify === 1

  // compare space reservations -> difference lists (add and delete)
  const original_space_reservations = await spaces_reserved_time.find({
    reservations: { $in: [reservation_id] }
  }).toArray()
  const add_space_reservations = []
  // const remove_space_reservations = original_reservation.space_reservations
  let remove_space_reservations = []
  let updated_timeslot_space_reservations = []
  // check add_space_reservations list
  for (const updated_space_reservation of updated_space_reservations) {
    // check format
    const validate_result = await validateSpaceReservation(updated_space_reservation)
    if (validate_result.status !== 200) {
      res
        .status(validate_result.status)
        .json(validate_result.json)
      return
    }

    // tear down time slots
    const split_result = splitSpaceReservation(updated_space_reservation, updated_timeslot_space_reservations)
    if (split_result.status !== 200) {
      res
        .status(split_result.status)
        .json(split_result.json)
      return
    }
    updated_timeslot_space_reservations = split_result.output
  }
  for (const updated_space_reservation of updated_timeslot_space_reservations) {
    // not reserved => add
    const original_space_reservation_index = original_space_reservations.findIndex(
      (space_reservation) => {
        return (
          space_reservation.space_id === updated_space_reservation.space_id &&
          space_reservation.start_datetime.getTime() === updated_space_reservation.start_datetime.getTime() &&
          space_reservation.end_datetime.getTime() === updated_space_reservation.end_datetime.getTime()
        )
      }
    )
    if (original_space_reservation_index === -1) {
      add_space_reservations.push({
        start_datetime: updated_space_reservation.start_datetime,
        end_datetime: updated_space_reservation.end_datetime,
        space_id: updated_space_reservation.space_id,
        reserved: 1,
        reservations: [reservation_id]
      })
    }

    if (original_space_reservation_index !== -1) {
      original_space_reservations.splice(original_space_reservation_index, 1)
    }
  }
  // give all remaining space_reservations to remove_spave_reservations
  remove_space_reservations = original_space_reservations
  console.log('add_space_reservations: ', add_space_reservations) // debug
  console.log('remove_space_reservations: ', remove_space_reservations) // debug
  // check the spaces have not been reserved
  let db_find_result = null // db find result
  for (const add_space_reservation of add_space_reservations) {
    // find data drom db
    db_find_result = await spaces_reserved_time.findOne({
      start_datetime: add_space_reservation.start_datetime,
      space_id: add_space_reservation.space_id,
      reserved: 1,
      reservations: { $nin: [reservation_id] }
    })

    if (db_find_result !== null && db_find_result.reserved !== null) {
      res
        .status(400)
        .json(error_response(R_INVALID_RESERVATION, 'space_datetime has been reserved'))
      return
    }
  }

  // compare item reservations -> difference lists (add and delete)
  const add_item_reservations = []
  const remove_item_reservations = []
  let updated_timeslot_item_reservations = []
  // check add_item_reservations list
  for (const updated_item_reservation of updated_item_reservations) {
    // check format
    const validate_result = await validateItemReservation(updated_item_reservation)
    if (validate_result.status !== 200) {
      res
        .status(validate_result.status)
        .json(validate_result.json)
      return
    }

    // tear down time slots
    const split_result = splitItemReservation(updated_item_reservation, updated_timeslot_item_reservations)
    if (split_result.status !== 200) {
      res
        .status(split_result.status)
        .json(split_result.json)
      return
    }
    updated_timeslot_item_reservations = split_result.output
  }

  // tear down original_item_reservations into time slots
  const original_item_reservations = original_reservation.item_reservations
  let original_timeslot_item_reservations = []
  for (const original_item_reservation of original_item_reservations) {
    original_timeslot_item_reservations = splitItemReservation(original_item_reservation, original_timeslot_item_reservations).output
  }
  // go throught and put them into add/remove list
  for (const updated_item_reservation of updated_timeslot_item_reservations) {
    // categorize update_item_reservation to add and remove list
    const original_item_reservation_index = original_timeslot_item_reservations.findIndex(
      (item_reservation) => {
        return (
          item_reservation.item_id === updated_item_reservation.item_id &&
          new Date(item_reservation.start_datetime).getTime() === updated_item_reservation.start_datetime.getTime() &&
          new Date(item_reservation.end_datetime).getTime() === updated_item_reservation.end_datetime.getTime()
        )
      }
    )
    const item_reservation_found = await items_reserved_time.findOne({
      item_id: updated_item_reservation.item_id,
      start_datetime: new Date(updated_item_reservation.start_datetime),
      end_datetime: new Date(updated_item_reservation.end_datetime)
    })

    if (original_item_reservation_index > -1) { // found original item reservation
      // TODO: seems not work?
      // check item quantity
      const original_item_found = original_timeslot_item_reservations[original_item_reservation_index]
      const reservations = (item_reservation_found !== null)
        ? item_reservation_found.reservations
        : [reservation_id]
      if (updated_item_reservation.quantity > original_item_found.reserved_quantity) {
        add_item_reservations.push({
          item_id: updated_item_reservation.item_id,
          start_datetime: updated_item_reservation.start_datetime,
          end_datetime: updated_item_reservation.end_datetime,
          reserved_quantity: updated_item_reservation.quantity - original_item_found.reserved_quantity,
          reservations
        })
      } else if (updated_item_reservation.quantity < original_item_found.reserved_quantity) {
        remove_item_reservations.push({
          item_id: updated_item_reservation.item_id,
          start_datetime: updated_item_reservation.start_datetime,
          end_datetime: updated_item_reservation.end_datetime,
          reserved_quantity: original_item_found.reserved_quantity - updated_item_reservation.quantity,
          reservations
        })
      }
      // remove from original_item_reservations
      original_timeslot_item_reservations.splice(original_item_reservation_index, 1)
    } else { // new time slot (not reserved originally)
      const new_quantity = updated_item_reservation.quantity
      const reservations = (item_reservation_found !== null)
        ? [...item_reservation_found.reservations, reservation_id]
        : [reservation_id]
      add_item_reservations.push({
        item_id: updated_item_reservation.item_id,
        start_datetime: updated_item_reservation.start_datetime,
        end_datetime: updated_item_reservation.end_datetime,
        reserved_quantity: new_quantity,
        reservations
      })
    }
  }
  // put all remaining original_item_reservation into remove_item_reservations
  for (const original_item_reservation of original_timeslot_item_reservations) {
    // remove self reservation_id from remove_item_reservations reservations list
    const timeslot_item_reservation = await items_reserved_time.findOne({
      item_id: original_item_reservation.item_id,
      start_datetime: new Date(original_item_reservation.start_datetime),
      end_datetime: new Date(original_item_reservation.end_datetime)
    })
    const new_item_reservation = {
      reservations: timeslot_item_reservation.reservations,
      reserved_quantity: original_item_reservation.quantity,
      ...original_item_reservation
    }
    new_item_reservation.reservations.splice(
      new_item_reservation.reservations.findIndex(
        (t) => t === reservation_id
      ), 1
    )
    remove_item_reservations.push(new_item_reservation)
  }
  console.log('add_item_reservations: ', add_item_reservations) // debug
  console.log('remove_item_reservations: ', remove_item_reservations) // debug
  // check items not all reserved
  let max_quantity = 0
  db_find_result = null // db find result
  for (const add_item_reservation of add_item_reservations) {
    // find data drom db
    db_find_result = await items_reserved_time.findOne({
      start_datetime: add_item_reservation.start_datetime,
      item_id: add_item_reservation.item_id
    })
    if (db_find_result === null) {
      db_find_result = { quantity: 0 }
    }

    max_quantity = await items.findOne({
      _id: new ObjectId(add_item_reservation.item_id)
    })
    max_quantity = max_quantity.quantity

    if (db_find_result.reserved_quantity + add_item_reservation.reserved_quantity > max_quantity) {
      res
        .status(400)
        .json(error_response(R_INVALID_RESERVATION, 'item_datetime has all been reserved'))
      return
    }
  }

  if (verify) {
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

    // remove items reservations (copy from delete_reservation.js)
    for (const remove_item_reservation of remove_item_reservations) {
      const found = await items_reserved_time.findOne({
        item_id: remove_item_reservation.item_id,
        start_datetime: remove_item_reservation.start_datetime
      })

      if (found === null) {
        continue
      } else if (found.reserved_quantity - remove_item_reservation.reserved_quantity <= 0) {
        items_reserved_time.deleteOne({
          item_id: remove_item_reservation.item_id,
          start_datetime: remove_item_reservation.start_datetime
        })
      } else {
        items_reserved_time.updateOne(
          {
            item_id: remove_item_reservation.item_id,
            start_datetime: remove_item_reservation.start_datetime
          }, {
          $inc: { reserved_quantity: -remove_item_reservation.reserved_quantity },
          $set: { reservations: remove_item_reservation.reservations }
        }
        )
      }
    }
    // add items reservations (copy from post_reservation.js)
    for (const add_item_reservation of add_item_reservations) {
      const found = await items_reserved_time.findOne({
        item_id: add_item_reservation.item_id,
        start_datetime: add_item_reservation.start_datetime
      })

      if (found !== null) {
        items_reserved_time.updateOne(
          {
            item_id: add_item_reservation.item_id,
            start_datetime: add_item_reservation.start_datetime
          }, {
          $inc: { reserved_quantity: add_item_reservation.reserved_quantity },
          $set: { reservations: add_item_reservation.reservations }
        }
        )
      } else {
        items_reserved_time.insertOne({
          item_id: add_item_reservation.item_id,
          start_datetime: add_item_reservation.start_datetime,
          end_datetime: add_item_reservation.end_datetime,
          reserved_quantity: add_item_reservation.reserved_quantity,
          reservations: add_item_reservation.reservations
        })
      }
    }
  }

  // update reservation
  original_reservation.history.push({
    submit_timestamp: new Date(submit_datetime),
    server_timestamp: new Date(), // now
    type: 'modified'
  })
  const updated_reservation = {
    status: 'modified',
    history: original_reservation.history,
    organization,
    name,
    department_grade,
    email,
    reason,
    space_reservations: updated_space_reservations,
    item_reservations: updated_item_reservations,
    note
  }
  // const reservation_update_result = await
  reservations.updateOne(
    { _id: new ObjectId(reservation_id) },
    { $set: updated_reservation }
  )

  // TODO: send email

  res.json({
    code: R_SUCCESS,
    message: 'Success!'
  })
})

export default router
