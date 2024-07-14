export const R_SUCCESS = 'R_SUCCESS'
export const R_INVALID_INFO = 'R_INVALID_INFO'
export const R_ID_NOT_FOUND = 'R_ID_NOT_FOUND'
export const R_INVALID_RESERVATION = 'R_INVALID_RESERVATION'
export const R_SEND_EMAIL_FAILED = 'R_SEND_EMAIL_FAILED'

export function error_response (error_code, message) {
  return { error_code, message }
}
