import { error_response, R_ID_NOT_FOUND, R_INVALID_INFO, R_INVALID_RESERVATION } from '../response.js'
import { items } from '../../models/mongodb.js'
import { ObjectId } from 'mongodb'
import dayjs from 'dayjs'

export default async function validateItemReservation (item_reservation) {
  const OBJECT_ID_REGEXP = /^[a-fA-F0-9]{24}$/ // ObjectId 格式 (652765ed3d21844635674e71)
  const DATETIME_MINUTE_REGEXP = /^20\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T[0-5]\d:00:00(?:\.0+)?\+08:?00$/ // 2024-03-03T22:25:00.000+08:00

  let error_message = ''

  if (OBJECT_ID_REGEXP.test(item_reservation.item_id) === false) {
    error_message += 'item_id format error\n'
  }
  if (
    DATETIME_MINUTE_REGEXP.test(item_reservation.start_datetime) === false ||
    dayjs(item_reservation.start_datetime).toISOString().slice(0, 10) !== item_reservation.start_datetime.slice(0, 10) // prevent something like 02-31 which can be parsed successfully
  ) {
    error_message += 'start_datetime format error\n'
  }
  if (
    DATETIME_MINUTE_REGEXP.test(item_reservation.end_datetime) === false ||
    dayjs(item_reservation.end_datetime).toISOString().slice(0, 10) !== item_reservation.end_datetime.slice(0, 10)
  ) {
    error_message += 'end_datetime format error\n'
  }
  if (Number.isInteger(item_reservation.quantity) === false) {
    error_message += 'quantity is not integer error\n'
  }
  if (error_message.length) {
    return {
      status: 400,
      json: error_response(R_INVALID_INFO, error_message)
    }
  }
  // check if the item_id exist
  const item_found = await items.findOne({ _id: ObjectId.createFromHexString(item_reservation.item_id) })
  if (item_found === null) {
    return {
      status: 404,
      json: error_response(R_ID_NOT_FOUND, 'Item ID not found')
    }
  }
  // check if the start_datetime is earlier than end_datetime
  const start_datetime = dayjs(item_reservation.start_datetime)
  const end_datetime = dayjs(item_reservation.end_datetime)
  if (start_datetime.isAfter(end_datetime)) {
    return {
      status: 400,
      json: error_response(R_INVALID_RESERVATION, 'item_reservations end_datetime earlier than start_datetime is not allowed')
    }
  }
  // check the quantity
  if (item_reservation.quantity <= 0) {
    return {
      status: 400,
      json: error_response(R_INVALID_RESERVATION, 'item_reservations quantity must > 0')
    }
  }
  if (item_reservation.quantity > item_found.quantity) {
    return {
      status: 400,
      json: error_response(R_INVALID_RESERVATION, 'item_reservations quantity should not exceed the item max quantity')
    }
  }

  return {
    status: 200
  }
}
