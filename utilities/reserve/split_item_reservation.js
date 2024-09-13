import { error_response, R_INVALID_RESERVATION } from '../response.js'
import dayjs from 'dayjs'

export default function splitItemReservation (item_reservation, timeslot_item_reservations = []) {
  let start_datetime = dayjs(item_reservation.start_datetime)
  let end_datetime = dayjs(item_reservation.end_datetime)

  // minute set to 0 (use an hour as the unit of a time slot)
  start_datetime = start_datetime.minute(0)
  if (end_datetime.minute() !== 0 || end_datetime.second() !== 0 || end_datetime.millisecond() !== 0) {
    end_datetime = end_datetime.minute(0)
    end_datetime = end_datetime.add(1, 'hour')
  }
  // cut into hours
  while (start_datetime.isBefore(end_datetime)) {
    // check if there are any repeated reservation
    for (const temp_reservation of timeslot_item_reservations) {
      if (
        temp_reservation.item_id === item_reservation.item_id &&
          new Date(temp_reservation.start_datetime) === new Date(start_datetime.format())
      ) {
        return {
          status: 400,
          output:[],
          json: error_response(R_INVALID_RESERVATION, 'item_reservations repeat error')
        }
      }
    }
    // add data
    timeslot_item_reservations.push({
      start_datetime: new Date(start_datetime.format()),
      end_datetime: new Date(start_datetime.add(1, 'hour').format()),
      item_id: item_reservation.item_id,
      quantity: item_reservation.quantity
    })
    start_datetime = start_datetime.add(1, 'hour')
  }

  return {
    status: 200,
    output: timeslot_item_reservations
  }
}
