import {
  error_response,
  R_ID_NOT_FOUND,
  R_INVALID_INFO,
  R_INVALID_RESERVATION
} from '../response.js'
import SpaceRepository from '../../repositories/space_repository.js'
import dayjs from 'dayjs'
import { OBJECT_ID_REGEXP, DATETIME_MINUTE_REGEXP } from '../input_format.js'

export default async function validateSpaceReservation (space_reservation) {
  let error_message = ''

  // check format
  if (OBJECT_ID_REGEXP.test(space_reservation.space_id) === false) {
    error_message += 'space_reservations space_id format error\n'
  }
  if (
    DATETIME_MINUTE_REGEXP.test(space_reservation.start_datetime) === false ||
    dayjs(space_reservation.start_datetime).toISOString().slice(0, 10) !==
    space_reservation.start_datetime.slice(0, 10) // prevent something like 02-31 which can be parsed successfully
  ) {
    error_message += 'space_reservations start_datetime format error\n'
  }
  if (
    DATETIME_MINUTE_REGEXP.test(space_reservation.end_datetime) === false ||
    dayjs(space_reservation.end_datetime).toISOString().slice(0, 10) !==
    space_reservation.end_datetime.slice(0, 10)
  ) {
    error_message += 'space_reservations end_datetime format error\n'
  }
  if (error_message.length) {
    return {
      status: 400,
      json: error_response(R_INVALID_INFO, error_message)
    }
  }
  // check if the space_id exist
  const space_found = await SpaceRepository.findSpaceById(
    space_reservation.space_id
  )

  if (space_found === null) {
    return {
      status: 404,
      json: error_response(R_ID_NOT_FOUND, 'Space ID not found')
    }
  }
  // check if the start_datetime is earlier than end_datetime
  const start_datetime = dayjs(space_reservation.start_datetime)
  const end_datetime = dayjs(space_reservation.end_datetime)
  const limit_space_end_datetime = start_datetime.add(7, 'day')
  // prevent reservation from over a week
  if (end_datetime.isAfter(limit_space_end_datetime)) {
    return {
      status: 400,
      json: error_response(
        R_INVALID_RESERVATION,
        'You can make a reservation for up to 7 days.'
      )
    }
  }
  // prevent end_datetime from being earlier than start_datetime
  if (!end_datetime.isAfter(start_datetime)) {
    return {
      status: 400,
      json: error_response(
        R_INVALID_RESERVATION,
        'space_reservations start_datetime needs to be earlier than end_datetime'
      )
    }
  }

  // prevent reservation from over a week
  if (end_datetime.diff(start_datetime, 'day') > 7) {
    return {
      status: 400,
      json: error_response(
        R_INVALID_RESERVATION,
        'space_reservations over 7 days is not allowed'
      )
    }
  }

  return {
    status: 200
  }
}
