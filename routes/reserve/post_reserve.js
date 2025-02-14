import { randomBytes } from 'crypto'
import express from 'express'
import { check, validationResult } from 'express-validator'
import { ObjectId } from 'mongodb'
import ReserveRepository from '../../repositories/reserve_repository.js'
import SpaceRepository from '../../repositories/space_repository.js'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import {
  error_response,
  R_SUCCESS,
  R_INVALID_INFO,
  R_INVALID_RESERVATION,
  R_SEND_EMAIL_FAILED
} from '../../utilities/response.js'
import sendEmail from '../../utilities/email/email.js'
import {
  subject as email_subject,
  html as email_html
} from '../../utilities/email/templates/new_reservation.js'
import validateRservationInfo from '../../utilities/reserve/validate_reservation_info.js'
import validateSpaceReservation from '../../utilities/reserve/validate_space_reservation.js'
import validateItemReservation, { isRemainItemEnough } from '../../utilities/reserve/validate_item_reservation.js'
import splitSpaceReservation from '../../utilities/reserve/split_space_reservation.js'
import splitItemReservation from '../../utilities/reserve/split_item_reservation.js'

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
router.post('/reserve', [
  check('note').optional().escape()
], async function (req, res, next) {
  // Destructure common fields and reservations.
  const submitDatetime = req.body.submit_datetime
  const name = req.body.name
  const departmentGrade = req.body.department_grade
  const organization = req.body.organization
  const email = req.body.email
  const reason = req.body.reason
  const note = req.body.note || ''
  const spaceReservations = req.body.space_reservations ?? []
  const itemReservations = req.body.item_reservations ?? []

  // check input data basic info
  const validateResult = validateRservationInfo(
    submitDatetime,
    name,
    departmentGrade,
    organization,
    email,
    reason,
    note,
    spaceReservations,
    itemReservations
  )
  if (validateResult.status !== 200) { // error
    res.status(validateResult.status).json(validateResult.json)
    return
  }

  // check express-validator errors
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res
      .status(400)
      .json(error_response(R_INVALID_INFO, errors.array().map(error => error.msg).join('\n')))
    return
  }

  // generate reservation_id
  const reservationId = new ObjectId(randomBytes(12))

  // space reservation process
  const timeslotSpaceReservedTime = []
  for (const space_reservation of spaceReservations) {
    // check data format
    const validateResult = await validateSpaceReservation(
      space_reservation
    )
    if (validateResult.status !== 200) {
      res.status(validateResult.status).json(validateResult.json)
      return
    }

    // split space_reservation into hourly slots
    const splitResult = splitSpaceReservation(
      space_reservation,
      timeslotSpaceReservedTime
    )
    if (splitResult.status !== 200) { // error
      res.status(splitResult.status).json(splitResult.json)
      return
    } else { // success
      timeslotSpaceReservedTime.push(...splitResult.output)
    }
  }

  // check if the space has been reserved
  for (const spaceReservation of timeslotSpaceReservedTime) {
    // find slot reservation data in database
    const findResult = await SpaceRepository.findSlotByStartTime(
      spaceReservation.space_id,
      spaceReservation.start_datetime
    )
    // if found (has been reserved), return error
    if (findResult !== null) {
      res
        .status(400)
        .json(
          error_response(
            R_INVALID_RESERVATION,
            'space_datetime has reserved error'
          )
        )
      return
    }
  }

  // item reservation process
  const timeslotItemReservedTime = []
  for (const itemReservation of itemReservations) {
    // check data format
    const validateResult = await validateItemReservation(
      itemReservation
    )
    if (validateResult.status !== 200) {
      res.status(validateResult.status).json(validateResult.json)
      return
    }

    // split item_reservation into hourly slots
    const splitResult = splitItemReservation(
      itemReservation,
      timeslotItemReservedTime
    )
    if (splitResult.status !== 200) { // error
      res.status(splitResult.status).json(splitResult.json)
      return
    } else { // success
      timeslotItemReservedTime.push(...splitResult.output)
    }
  }

  // Check if DB has enough items to be reserved
  if (isRemainItemEnough(timeslotItemReservedTime) === false) {
    res.status(400).json(
      error_response(
        R_INVALID_RESERVATION,
        'item_datetime has over reserved error'
      )
    )
    return
  }

  // insert reservation into database
  const doc = {
    _id: reservationId,
    verify: 0,
    status: 'new', // new/modified/canceled
    history: [
      {
        submit_timestamp: new Date(submitDatetime),
        server_timestamp: new Date(), // now
        type: 'new' // new/modify/cancel
      }
    ],
    organization,
    name,
    department_grade: departmentGrade,
    email,
    reason,
    space_reservations: spaceReservations,
    item_reservations: itemReservations,
    note
  }
  await ReserveRepository.insertReserve(doc)
  // send verify email
  try {
    const emailResponse = await sendEmail(
      email,
      email_subject,
      await email_html(doc)
    )
    console.log('The email has been sent: ' + emailResponse)
  } catch (error) {
    console.error('Error sending email:', error)
    res.status(500).json(error_response(R_SEND_EMAIL_FAILED, error.response))
    return
  }

  res.json({ code: R_SUCCESS, message: 'Success!' })
})

export default router
