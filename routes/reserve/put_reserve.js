import express from 'express'
import { check, validationResult } from 'express-validator'
import ReserveRepository from '../../repositories/reserve_repository.js'
import SpaceRepository from '../../repositories/space_repository.js'
import ItemRepository from '../../repositories/item_repository.js'
import { ObjectId } from 'mongodb'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import {
  error_response,
  R_ID_NOT_FOUND,
  R_INVALID_INFO,
  R_INVALID_RESERVATION,
  R_SEND_EMAIL_FAILED,
  R_SUCCESS
} from '../../utilities/response.js'
import validateRservationInfo from '../../utilities/reserve/validate_reservation_info.js'
import validateSpaceReservation from '../../utilities/reserve/validate_space_reservation.js'
import splitSpaceReservation from '../../utilities/reserve/split_space_reservation.js'
import validateItemReservation, { isRemainItemEnough } from '../../utilities/reserve/validate_item_reservation.js'
import splitItemReservation from '../../utilities/reserve/split_item_reservation.js'
import {
  subject as email_subject,
  html as email_html
} from '../../utilities/email/templates/update_reservation.js'
import sendEmail from '../../utilities/email/email.js'

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
router.put('/reserve/:reservation_id', [
  check('note').optional().escape()
], async function (req, res, next) {
  // define constants and variables
  const OBJECT_ID_REGEXP = /^[a-fA-F0-9]{24}$/ // ObjectId 格式 (652765ed3d21844635674e71)

  const reservation_id = req.params.reservation_id
  const submit_datetime = req.body.submit_datetime
  const name = req.body.name
  const department_grade = req.body.department_grade
  const organization = req.body.organization
  let email = req.body.email // not allow to change
  const reason = req.body.reason
  const note = req.body.note || ''
  const updated_space_reservations = req.body.space_reservations ?? []
  const updated_item_reservations = req.body.item_reservations ?? []
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
  const original_reservation = await ReserveRepository.getReserveById(reservation_id)

  if (!original_reservation) {
    res
      .status(404)
      .json(error_response(R_ID_NOT_FOUND, 'reservation_id not found error'))
    return
  }
  email = original_reservation.email
  // check not empty reservation
  if (
    updated_space_reservations.length + updated_item_reservations.length <=
    0
  ) {
    res
      .status(400)
      .json(error_response(R_INVALID_INFO, 'empty reservation error'))
    return
  }
  // validate reservation basic info
  const validate_result = validateRservationInfo(
    submit_datetime,
    name,
    department_grade,
    organization,
    email,
    reason,
    note,
    updated_space_reservations,
    updated_item_reservations
  )
  if (validate_result.status !== 200) {
    res.status(validate_result.status).json(validate_result.json)
    return
  }
  // 檢查輸入是否正確
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res
      .status(400)
      .json(error_response(R_INVALID_INFO, errors.array().map(error => error.msg).join('\n')))
    return
  }

  const verify = original_reservation.verify === 1

  // compare space reservations -> difference lists (add and delete)
  const original_space_reservations = await SpaceRepository.findSlotsByReservationId(reservation_id)
  const add_space_reservations = []
  // const remove_space_reservations = original_reservation.space_reservations
  let remove_space_reservations = []
  let updated_timeslot_space_reservations = []
  // check add_space_reservations list
  for (const updated_space_reservation of updated_space_reservations) {
    // check format
    const validate_result = await validateSpaceReservation(
      updated_space_reservation
    )
    if (validate_result.status !== 200) {
      res.status(validate_result.status).json(validate_result.json)
      return
    }

    // tear down time slots
    const split_result = splitSpaceReservation(
      updated_space_reservation,
      updated_timeslot_space_reservations
    )
    if (split_result.status !== 200) {
      res.status(split_result.status).json(split_result.json)
      return
    }
    updated_timeslot_space_reservations = split_result.output
  }
  for (const updated_space_reservation of updated_timeslot_space_reservations) {
    // not reserved => add
    const original_space_reservation_index =
      original_space_reservations.findIndex((space_reservation) => {
        return (
          space_reservation.space_id === updated_space_reservation.space_id &&
          space_reservation.start_datetime.getTime() ===
          updated_space_reservation.start_datetime.getTime() &&
          space_reservation.end_datetime.getTime() ===
          updated_space_reservation.end_datetime.getTime()
        )
      })
    if (original_space_reservation_index === -1) {
      add_space_reservations.push({
        start_datetime: updated_space_reservation.start_datetime,
        end_datetime: updated_space_reservation.end_datetime,
        space_id: new ObjectId(updated_space_reservation.space_id),
        reserved: 1,
        reservations: [new ObjectId(reservation_id)]
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
    db_find_result = await SpaceRepository.getRemainingSlotsByStartTime(
      add_space_reservation.space_id,
      add_space_reservation.start_datetime,
      reservation_id
    )

    if (db_find_result !== null && db_find_result.reserved !== null) {
      res
        .status(400)
        .json(
          error_response(
            R_INVALID_RESERVATION,
            'space_datetime has been reserved'
          )
        )
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
    const validate_result = await validateItemReservation(
      updated_item_reservation
    )
    if (validate_result.status !== 200) {
      res.status(validate_result.status).json(validate_result.json)
      return
    }

    // tear down time slots
    const split_result = splitItemReservation(
      updated_item_reservation,
      updated_timeslot_item_reservations
    )
    if (split_result.status !== 200) {
      res.status(split_result.status).json(split_result.json)
      return
    }
    updated_timeslot_item_reservations = split_result.output
  }

  // tear down original_item_reservations into time slots
  const original_item_reservations = original_reservation.item_reservations
  let original_timeslot_item_reservations = []
  for (const original_item_reservation of original_item_reservations) {
    original_timeslot_item_reservations = splitItemReservation(
      original_item_reservation,
      original_timeslot_item_reservations
    ).output
  }
  // go throught and put them into add/remove list
  for (const updated_item_reservation of updated_timeslot_item_reservations) {
    // categorize update_item_reservation to add and remove list
    const original_item_reservation_index =
      original_timeslot_item_reservations.findIndex((item_reservation) => {
        return (
          item_reservation.item_id === updated_item_reservation.item_id &&
          new Date(item_reservation.start_datetime).getTime() ===
          updated_item_reservation.start_datetime.getTime() &&
          new Date(item_reservation.end_datetime).getTime() ===
          updated_item_reservation.end_datetime.getTime()
        )
      })
    const item_reservation_found = await ItemRepository.findSlotByTimeRange(
      updated_item_reservation.item_id,
      updated_item_reservation.start_datetime,
      updated_item_reservation.end_datetime
    )

    if (original_item_reservation_index > -1) {
      // found original item reservation
      // TODO: seems not work?
      // check item quantity
      const original_item_found =
        original_timeslot_item_reservations[original_item_reservation_index]
      const reservations =
        item_reservation_found !== null
          ? item_reservation_found.reservations
          : [new ObjectId(reservation_id)]
      if (
        updated_item_reservation.quantity >
        original_item_found.reserved_quantity
      ) {
        add_item_reservations.push({
          item_id: new ObjectId(updated_item_reservation.item_id),
          start_datetime: updated_item_reservation.start_datetime,
          end_datetime: updated_item_reservation.end_datetime,
          reserved_quantity:
            updated_item_reservation.quantity -
            original_item_found.reserved_quantity,
          reservations
        })
      } else if (
        updated_item_reservation.quantity <
        original_item_found.reserved_quantity
      ) {
        remove_item_reservations.push({
          item_id: updated_item_reservation.item_id,
          start_datetime: updated_item_reservation.start_datetime,
          end_datetime: updated_item_reservation.end_datetime,
          reserved_quantity:
            original_item_found.reserved_quantity -
            updated_item_reservation.quantity,
          reservations
        })
      }
      // remove from original_item_reservations
      original_timeslot_item_reservations.splice(
        original_item_reservation_index,
        1
      )
    } else {
      // new time slot (not reserved originally)
      const new_quantity = updated_item_reservation.quantity
      const reservations =
        item_reservation_found !== null
          ? [...item_reservation_found.reservations, new ObjectId(reservation_id)]
          : [new ObjectId(reservation_id)]
      add_item_reservations.push({
        item_id: new ObjectId(updated_item_reservation.item_id),
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
    const timeslot_item_reservation = await ItemRepository.findSlotByTimeRange(
      original_item_reservation.item_id,
      original_item_reservation.start_datetime,
      original_item_reservation.end_datetime
    )
    const new_item_reservation = {
      reservations: timeslot_item_reservation !== null ? timeslot_item_reservation?.reservations : [],
      reserved_quantity: original_item_reservation.quantity,
      ...original_item_reservation
    }
    new_item_reservation.reservations.splice(
      new_item_reservation.reservations.findIndex((t) => t.equals(new ObjectId(reservation_id))),
      1
    )
    remove_item_reservations.push(new_item_reservation)
  }
  console.log('add_item_reservations: ', add_item_reservations) // debug
  console.log('remove_item_reservations: ', remove_item_reservations) // debug

  // check items not all reserved
  if (!(await isRemainItemEnough(add_item_reservations))) {
    res
      .status(400)
      .json(
        error_response(
          R_INVALID_RESERVATION,
          'item_datetime has all been reserved'
        )
      )
    return
  }

  if (verify) {
    // remove spaces reservations
    for (const remove_space_reservation of remove_space_reservations) {
      await SpaceRepository.deleteSlotByStartTimeAndId(
        remove_space_reservation.space_id,
        remove_space_reservation.start_datetime
      )
    }
    // add spaces reservations
    if (add_space_reservations.length > 0) {
      await SpaceRepository.insertSlots(add_space_reservations)
    }

    // remove items reservations (copy from delete_reservation.js)
    for (const remove_item_reservation of remove_item_reservations) {
      const found = await ItemRepository.findSlotByStartTime(
        remove_item_reservation.item_id,
        remove_item_reservation.start_datetime
      )

      if (found === null) continue
      if (found.reserved_quantity - remove_item_reservation.reserved_quantity <= 0) {
        await ItemRepository.deleteSlotByStartTimeAndId(
          remove_item_reservation.item_id,
          remove_item_reservation.start_datetime
        )
      } else {
        await ItemRepository.updateSlotDataByStartTimeAndId(
          remove_item_reservation.item_id,
          remove_item_reservation.start_datetime,
          -remove_item_reservation.reserved_quantity,
          remove_item_reservation.reservations
        )
      }
    }
    // add items reservations (copy from post_reservation.js)
    for (const add_item_reservation of add_item_reservations) {
      const found = await ItemRepository.findSlotByStartTime(
        add_item_reservation.item_id,
        add_item_reservation.start_datetime
      )

      if (found !== null) {
        await ItemRepository.updateSlotDataByStartTimeAndId(
          add_item_reservation.item_id,
          add_item_reservation.start_datetime,
          add_item_reservation.reserved_quantity,
          add_item_reservation.reservations
        )
      } else {
        await ItemRepository.insertSlot({
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
  ReserveRepository.updateReserveById(
    reservation_id,
    updated_reservation
  )
  // send email
  updated_reservation.verify = original_reservation.verify
  updated_reservation.reservation_id = reservation_id
  try {
    const email_response = await sendEmail(
      email,
      email_subject,
      await email_html(updated_reservation)
    )
    console.log('The email has been sent: ' + email_response)
  } catch (error) {
    console.error('Error sending email:', error)
    res.status(500).json(error_response(R_SEND_EMAIL_FAILED, error.response))
    return
  }

  res.json({
    code: R_SUCCESS,
    message: 'Success!'
  })
})

export default router
