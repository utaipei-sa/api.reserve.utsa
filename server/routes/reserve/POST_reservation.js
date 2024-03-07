const express = require('express')
const ObjectID = require('mongodb').ObjectId
const { reservations, spaces_reserved_time, items_reserved_time, spaces, items } = require('../../models/mongodb')
// const { Timestamp } = require('mongodb');
const router = express.Router()
const dayjs = require('dayjs');
dayjs().format()

/**
 * @openapi
 * /reserve/reservation:
 *   post:
 *     tags:
 *       - reserve
 *     summary: 新增單筆預約紀錄
 *     description: 新增單筆預約紀錄
 *     operationId: PostReservation
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
 */
router.post('/reservation', function (req, res, next) {
  // define constants and variables
  const EMAIL_REGEXP = /^[\w-.\+]+@([\w-]+\.)+[\w-]{2,4}$/  // user+name@domain.com
  const SUBMIT_DATETIME_REGEXP = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)\+08:?00$/  // 2024-03-03T22:25:32.000+08:00
  const DATETIME_MINUTE_REGEXP = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/  // 2024-03-03T22:25
  const OBJECT_ID_REGEXP = /^[0-9a-fA-F]{24}$/  // 652765ed3d21844635674e71

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


  // process data
  const reservation_id = new ObjectID()
  let received_space_reserved_time = []
  let received_item_reserved_time = []

  // space reservation process
  received_space_reservations.forEach(space_reservation => {
    // check
    if (!OBJECT_ID_REGEXP.test(space_reservation.space_id)) {
      error_message += 'space_reservations space_id empty error\n'
    }
    if (!DATETIME_MINUTE_REGEXP.test(space_reservation.start_datetime)) {
      error_message += 'space_reservations start_datetime empty error\n'
    }
    if (!DATETIME_MINUTE_REGEXP.test(space_reservation.end_datetime)) {
      error_message += 'space_reservations end_datetime empty error\n'
    }
    if (error_message.length) {
      res
        .status(400)
        .json({ error: error_message })
      return
    }

    // check whether space_id is exist
    let space_found = spaces.findOne({ _id: ObjectID(space_reservation.space_id) })
    console.log(space_found)  // <-- null? undefined? something else?
    if (!space_found) {
      res
        .status(400)
        .json({ error: 'space_reservations space_id not found error' })
      return
    }

    // =============== ↓底下還沒更新↓ ===============

    // process data
    let start_datetime = new Date(space_reservation.start_datetime)
    let end_datetime = new Date(space_reservation.end_datetime)
    let section_end_datetime = new Date(space_reservation.start_datetime)
    section_end_datetime = section_end_datetime.setTime(section_end_datetime.getTime() + hours * 60 * 60 * 1000)

    // if end_datetime is earlier than start_datetime
    if (end_datetime < start_datetime) {
      res
        .status(400)
        .json({ error: 'space_reservations end_datetime earlier than start_datetime error' })
    }

    // convert to time slots (1 hour)
    let start_datetime_dayjs = dayjs(start_datetime);
    let end_datetime_dayjs = dayjs(end_datetime);
    //判斷不乾淨的分鐘數
    start_datetime_dayjs=start_datetime_dayjs.minute(0);
    if(!end_datetime_dayjs.isSame('0','minute')){
        end_datetime_dayjs=end_datetime_dayjs.minute(0);
        end_datetime_dayjs=end_datetime_dayjs.add(1,'hour');
    }
    //
    for (i = received_space_reserved_time.length; start_datetime_dayjs.isBefore(end_datetime_dayjs); i++) {
      received_space_reserved_time[i] = start_datetime_dayjs.format();
      start_datetime_dayjs = start_datetime_dayjs.add(1, 'hour');
    }


    
    
    
    // let test = new Date('1995-12-17T03:24:00');
    // console.log(dayjs(test).get(hour));



    // first time slot (for instance: 18:38~18:59 convert to 18:00~18:59)
    // check whether the time slot has been reserved
    // if not:
    //   push to received_space_reserved_time
    // let temp = {
    //   space_id: space_id,
    //   start_datetime: start_datetime,
    //   end_datetime: section_end_datetime
    // }
    // else:
    //   abort

    // middle time slot (convert to an hour a block)

    // the last time slot (for instance: 19:00~19:38 convert to 19:00~19:59)





    // const duration = parseInt(space_reservation.duration.substring(0, 2), 10) // decimal integer from the substring
    // // let unshifted_time = new Date(element.start_time);
    // let shifted_time
    // for (let i = 0; i < duration; i++) {
    //   // check 預約的時段是可供出借的時段（非半夜）
    //   // shifted_time = new Date(new Date(unshifted_time).setHours(unshifted_time.getHours()+i));  // getHours --> shift --> set back
    //   shifted_time = hour_shift(space_reservation.start_time, i)
    //   received_space_reserved_time.push({
    //     space_id: space_reservation.space_id,
    //     date: space_reservation.start_date,
    //     time_slot: shifted_time, // unit: hour
    //     reservations_id: reservation_id
    //   })
    // }

    // =============== ↑以上還沒更新↑ ===============
  })

  // item reservation process
  received_item_reservations.forEach(item_reservation => {
    // check
    if (item_reservation.quantity <= 0) {
      error_message += 'item_reservations quantity error\n'
    }
    if (!OBJECT_ID_REGEXP.test(item_reservation.item_id)) {
      error_message += 'item_reservations item_id empty error\n'
    }
    if (!DATETIME_MINUTE_REGEXP.test(item_reservation.start_datetime)) {
      error_message += 'item_reservations start_datetime empty error\n'
    }
    if (!DATETIME_MINUTE_REGEXP.test(item_reservation.end_datetime)) {
      error_message += 'item_reservations end_datetime empty error\n'
    }
    if (error_message.length) {
      res
        .status(400)
        .json({ error: error_message })
      return
    }

    // check whether item_id is exist
    let item_found = items.findOne({ _id: ObjectID(item_reservation.item_id) })
    if (!item_found) {  // <-- notice what's this when not found (should be same as space)
      res
        .status(400)
        .json({ error: 'item_reservations item_id not found error' })
      return
    }

    // =============== ↓底下還沒更新↓ ===============

    // process data
    let start_datetime = new Date(item_reservation.start_datetime)
    let end_datetime = new Date(item_reservation.end_datetime)
    let section_end_datetime = new Date(item_reservation.start_datetime)
    section_end_datetime = section_end_datetime.setTime(section_end_datetime.getTime() + hours * 60 * 60 * 1000)

    // if end_datetime is earlier than start_datetime
    if (end_datetime < start_datetime) {
      res
        .status(400)
        .json({ error: 'item_reservations end_datetime earlier than start_datetime error' })
    }
    // convert to time slots (a day, from 12:00 pm to 11:59 am)
    var a = dayjs(new Date());
    console.log(a);



    // // get duration (days)
    // const start_date = new Date(item_reservation.start_date)
    // const end_date = new Date(item_reservation.end_date)
    // const duration = (end_date.getTime() - start_date.getTime()) / (1000 * 60 * 60 * 24) // from millisecond to days
    // // define variables
    // const unshifted_date = new Date(item_reservation.start_date)
    // let shifted_date
    // // loop
    // for (let i = 0; i < duration; i++) {
    //   shifted_date = new Date(new Date(unshifted_date).setDate(unshifted_date.getDate() + i))
    //   received_item_reserved_time.push({
    //     item_id: item_reservation.item_id,
    //     date: shifted_date.toISOString().substring(0, 10), // noon-to-noon, here's the 1st day
    //     reservations_id: reservation_id
    //   })
    // }
    // =============== ↑以上還沒更新↑ ===============
  })

  // insert reservation into database
  const doc = {
    _id: reservation_id,
    status: 'new', // new/modified/canceled
    history: [
      {
        submit_timestamp: new Date(submit_datetime),
        server_timestamp: new Date(), // now
        type: 'new' // new/modify/cancel
      }
    ],
    organization: organization,
    contact: contact,
    department_grade: department_grade,
    email: email,
    reason: reason,
    space_reservations: received_space_reservations,
    item_reservations: received_item_reservations,
    note: note
  }

  const reservations_result = reservations.insertOne(doc)
  if (received_space_reserved_time.length > 0) {
    const spaces_reserved_time_result = spaces_reserved_time.insertMany(received_space_reserved_time)
  }
  if (received_item_reserved_time.length > 0) {
    const items_reserved_time_result = items_reserved_time.insertMany(received_item_reserved_time)
  }

  // result.insertedId
  // reservation_id
  // send email
  res.json({ message: 'Success!' })
})

module.exports = router
