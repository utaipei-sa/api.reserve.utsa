import {
  error_response,
  R_ID_NOT_FOUND,
  R_INVALID_INFO,
  R_INVALID_RESERVATION
} from '../response.js'
import ItemRepository from '../../repositories/item_repository.js'
import dayjs from 'dayjs'
import { OBJECT_ID_REGEXP, DATETIME_MINUTE_REGEXP } from '../input_format.js'

export default async function validateItemReservation (item_reservation) {
  let error_message = ''

  if (OBJECT_ID_REGEXP.test(item_reservation.item_id) === false) {
    error_message += 'item_reservations item_id format error\n'
  }
  if (
    DATETIME_MINUTE_REGEXP.test(item_reservation.start_datetime) === false ||
    dayjs(item_reservation.start_datetime).toISOString().slice(0, 10) !==
    item_reservation.start_datetime.slice(0, 10) // prevent something like 02-31 which can be parsed successfully
  ) {
    error_message += 'item_reservations start_datetime format error\n'
  }
  if (
    DATETIME_MINUTE_REGEXP.test(item_reservation.end_datetime) === false ||
    dayjs(item_reservation.end_datetime).toISOString().slice(0, 10) !==
    item_reservation.end_datetime.slice(0, 10)
  ) {
    error_message += 'item_reservations end_datetime format error\n'
  }
  if (Number.isInteger(item_reservation.quantity) === false) {
    error_message += 'item_reservations quantity is not integer error\n'
  }
  if (error_message.length) {
    return {
      status: 400,
      json: error_response(R_INVALID_INFO, error_message)
    }
  }
  // check if the item_id exist
  const item_found = await ItemRepository.findItemById(
    item_reservation.item_id
  )

  if (item_found === null) {
    return {
      status: 404,
      json: error_response(R_ID_NOT_FOUND, 'Item ID not found')
    }
  }
  // check if the start_datetime is earlier than end_datetime
  const start_datetime = dayjs(item_reservation.start_datetime)
  const end_datetime = dayjs(item_reservation.end_datetime)
  const limit_end_datetime = start_datetime.add(7, 'day')
  // prevent reservation from over a week
  if (end_datetime.isAfter(limit_end_datetime)) {
    return {
      status: 400,
      json: error_response(
        R_INVALID_RESERVATION,
        'You can make a reservation for up to seven days.'
      )
    }
  }
  // prevent end_datetime from being earlier than start_datetime
  if (!end_datetime.isAfter(start_datetime)) {
    return {
      status: 400,
      json: error_response(
        R_INVALID_RESERVATION,
        'item_reservations start_datetime need to be earlier than end_datetime'
      )
    }
  }
  // check the quantity
  if (item_reservation.quantity <= 0) {
    return {
      status: 400,
      json: error_response(
        R_INVALID_RESERVATION,
        'item_reservations quantity must > 0'
      )
    }
  }
  if (item_reservation.quantity > item_found.quantity) {
    return {
      status: 400,
      json: error_response(
        R_INVALID_RESERVATION,
        'item_reservations quantity should not exceed the item max quantity'
      )
    }
  }

  // prevent reservation from over a week
  if (end_datetime.diff(start_datetime, 'day') > 7) {
    return {
      status: 400,
      json: error_response(
        R_INVALID_RESERVATION,
        'item_reservations over 7 days is not allowed'
      )
    }
  }

  return {
    status: 200
  }
}

export async function isRemainItemEnough (received_item_reserved_time) {
  // Check if DB has enough items to be reserved
  let db_item_check
  let max_quantity
  for (let i = 0; i < received_item_reserved_time.length; i++) {
    const current_reservation = received_item_reserved_time[i]
    max_quantity = await ItemRepository.findItemById(current_reservation.item_id)

    let total_reserved_quantity = current_reservation.reserved_quantity

    db_item_check = await ItemRepository.findSlotByStartTime(
      current_reservation.item_id,
      current_reservation.start_datetime
    )

    if (db_item_check?.reserved_quantity) {
      total_reserved_quantity += db_item_check.reserved_quantity
    }

    for (let j = 0; j < received_item_reserved_time.length; j++) {
      if (i === j) continue // 跳過自己

      const other_reservation = received_item_reserved_time[j]
      if (current_reservation.item_id.toString() !== other_reservation.item_id.toString()) continue

      // 檢查時間是否重疊
      const current_start = dayjs(current_reservation.start_datetime)
      const current_end = dayjs(current_reservation.end_datetime)
      const other_start = dayjs(other_reservation.start_datetime)
      const other_end = dayjs(other_reservation.end_datetime)

      if (current_start.isBefore(other_end) && other_start.isBefore(current_end)) {
        total_reserved_quantity += other_reservation.reserved_quantity
      }
    }

    // 檢查總預約數量是否超過限制
    if (total_reserved_quantity > max_quantity.quantity) {
      return false
    }
  }
  return true
}
