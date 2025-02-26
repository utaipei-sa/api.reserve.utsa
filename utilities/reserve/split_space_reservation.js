import { error_response, R_INVALID_RESERVATION } from '../response.js'
import dayjs from 'dayjs'

export default function splitSpaceReservation (space_reservation, timeslot_space_reservations) {
  let start_datetime = dayjs(space_reservation.start_datetime)
  let end_datetime = dayjs(space_reservation.end_datetime)

  // minute set to 0 (use an hour as the unit of a time slot)
  start_datetime = start_datetime.minute(0)
  if (end_datetime.minute() !== 0 || end_datetime.second() !== 0 || end_datetime.millisecond() !== 0) {
    end_datetime = end_datetime.minute(0)
    end_datetime = end_datetime.add(1, 'hour')
  }
  // cut into hours
  while (start_datetime.isBefore(end_datetime)) {
    // check if there are any repeated reservation
    for (const temp_reservation of timeslot_space_reservations) {
      if (
        temp_reservation.space_id === space_reservation.space_id &&
          start_datetime.isSame(temp_reservation.start_datetime)
      ) {
        return {
          status: 400,
          json: error_response(R_INVALID_RESERVATION, 'space_reservations repeat error')
        }
      }
    }
    // add data
    timeslot_space_reservations.push({
      start_datetime: new Date(start_datetime.format()),
      end_datetime: new Date(start_datetime.add(1, 'hour').format()),
      space_id: space_reservation.space_id,
      reserved: 1
    })
    start_datetime = start_datetime.add(1, 'hour')
  }

  return {
    status: 200,
    output: timeslot_space_reservations
  }
}
