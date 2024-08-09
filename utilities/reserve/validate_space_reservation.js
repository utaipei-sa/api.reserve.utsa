import {
  error_response,
  R_ID_NOT_FOUND,
  R_INVALID_INFO,
  R_INVALID_RESERVATION
} from '../response.js'
import { spaces } from '../../models/mongodb.js'
import { ObjectId } from 'mongodb'
import dayjs from 'dayjs'

export default async function validateSpaceReservation (space_reservation) {
  const OBJECT_ID_REGEXP = /^[a-fA-F0-9]{24}$/ // ObjectId 格式 (652765ed3d21844635674e71)
  const DATETIME_MINUTE_REGEXP =
    /^20\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T[0-5]\d:00:00(?:\.0+)?\+08:?00$/ // 2024-03-03T22:25:00.000+08:00

  let error_message = ''

  // check format
  if (OBJECT_ID_REGEXP.test(space_reservation.space_id) === false) {
    error_message += 'space_id format error\n'
  }
  if (
    DATETIME_MINUTE_REGEXP.test(space_reservation.start_datetime) === false ||
    dayjs(space_reservation.start_datetime).toISOString().slice(0, 10) !==
      space_reservation.start_datetime.slice(0, 10) // prevent something like 02-31 which can be parsed successfully
  ) {
    error_message += 'start_datetime format error\n'
  }
  if (
    DATETIME_MINUTE_REGEXP.test(space_reservation.end_datetime) === false ||
    dayjs(space_reservation.end_datetime).toISOString().slice(0, 10) !==
      space_reservation.end_datetime.slice(0, 10)
  ) {
    error_message += 'end_datetime format error\n'
  }
  if (error_message.length) {
    return {
      status: 400,
      json: error_response(R_INVALID_INFO, error_message)
    }
  }
  // check if the space_id exist
  const space_found = await spaces.findOne({
    _id: { $eq: new ObjectId(space_reservation.space_id) }
  })

  if (space_found === null) {
    return {
      status: 404,
      json: error_response(R_ID_NOT_FOUND, 'Space ID not found')
    }
  }
  // check if the start_datetime is earlier than end_datetime
  const start_datetime = dayjs(space_reservation.start_datetime)
  const end_datetime = dayjs(space_reservation.end_datetime)
  if (start_datetime.isAfter(end_datetime)) {
    return {
      status: 400,
      json: error_response(
        R_INVALID_RESERVATION,
        'space_reservations end_datetime earlier than start_datetime is not allowed'
      )
    }
  }

  return {
    status: 200
  }
}
