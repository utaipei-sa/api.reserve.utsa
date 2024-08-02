import { error_response, R_INVALID_INFO } from '../response.js'

export default function validateRservationInfo (
  submit_datetime, name, department_grade, organization, email, reason, note,
  space_reservations, item_reservations
) {
  const EMAIL_REGEXP = /^[\w-.+]+@([\w-]+\.)+[\w-]{2,4}$/ // user+name@domain.com
  const DATETIME_REGEXP = /^20\d{2}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?\+08:?00$/ // 2024-03-03T22:25:32.000+08:00

  let error_message = ''

  if (space_reservations.length + item_reservations.length <= 0) {
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
