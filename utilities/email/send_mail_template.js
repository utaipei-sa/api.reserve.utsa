import sendEmail from '../../utilities/email/email.js'
import {
  subject as new_reserve_subject,
  html as new_reserve_html
} from './templates/new_reservation.js'
// TODO: import more templates

export const NEW_RESERVATION = 'new_reservation'
export const RESERVATION_VERIFIED = 'reservation_verified'
export const RESERVATION_MODIFIED = 'reseration_modified'
export const RESERVATION_DELETED = 'reservation_deleted'

export default async function send_mail_template (template_type, data) {
  let subject = null
  let html = null

  switch (template_type) {
    case NEW_RESERVATION:
      subject = new_reserve_subject
      html = await new_reserve_html(data)
      break
    case RESERVATION_VERIFIED:
      subject = '' // TODO: replace with template
      html = ''
      break
    case RESERVATION_MODIFIED:
      subject = ''
      html = ''
      break
    case RESERVATION_DELETED:
      subject = ''
      html = ''
      break
    default:
      return 'ERROR! No template type'
  }

  return sendEmail(data.email, subject, html)
}
