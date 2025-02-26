import { error_response, R_INVALID_INFO } from '../response.js'
import { DATETIME_REGEXP, EMAIL_REGEXP } from '../input_format.js'

export default function validateRservationInfo (
  submit_datetime,
  name,
  department_grade,
  organization,
  email,
  reason,
  note,
  space_reservations,
  item_reservations
) {
  let error_message = ''

  if (
    space_reservations === undefined ||
    item_reservations === undefined ||
    space_reservations.length + item_reservations.length <= 0
  ) {
    error_message += 'empty reservation error\n'
  }
  if (!EMAIL_REGEXP.test(email)) {
    error_message += 'email format error\n'
  }
  if (!DATETIME_REGEXP.test(submit_datetime)) {
    error_message += 'submit_datetime format error\n'
  }
  if (!name) { // name string or undefined
    error_message += 'name empty error\n'
  }
  if (!department_grade) { // name string or undefined
    error_message += 'department_grade empty error\n'
  }
  if (!organization) { // empty string or undefined
    error_message += 'organization empty error\n'
  }
  if (!reason) { // empty string or undefined
    error_message += 'reason empty error\n'
  }
  if (error_message.length) {
    return {
      status: 400,
      json: error_response(R_INVALID_INFO, error_message)
    }
  }
  return {
    status: 200
  }
}
