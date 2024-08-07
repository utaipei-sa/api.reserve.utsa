import sendEmail from '../../utilities/email/email.js'
import {
  subject as new_reservation_subject,
  html as new_reservation_html
} from './templates/new_reservation.js'
import {
  subject as reservation_verified_subject,
  html as reservation_verified_html
} from './templates/verify_reservation.js'
import {
  subject as reservation_modified_subject,
  html as reservation_modified_html
} from './templates/update_reservation.js'
import {
  subject as reservation_deleted_subject,
  html as reservation_deleted_html
} from './templates/cancel_reservation.js'

export const NEW_RESERVATION = 'new_reservation'
export const RESERVATION_VERIFIED = 'reservation_verified'
export const RESERVATION_MODIFIED = 'reseration_modified'
export const RESERVATION_DELETED = 'reservation_deleted'

export default async function send_mail_template (template_type, data) {
  let subject = null
  let html = null

  switch (template_type) {
    case NEW_RESERVATION:
      subject = new_reservation_subject
      html = await new_reservation_html(data)
      break
    case RESERVATION_VERIFIED:
      subject = reservation_verified_subject
      html = await reservation_verified_html(data)
      break
    case RESERVATION_MODIFIED:
      subject = reservation_modified_subject
      html = await reservation_modified_html(data)
      break
    case RESERVATION_DELETED:
      subject = reservation_deleted_subject
      html = reservation_deleted_html
      break
    default:
      return 'ERROR! No template type'
  }

  return sendEmail(data.email, subject, html)
}
