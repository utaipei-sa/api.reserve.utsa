import { ObjectId } from 'mongodb'
import { spaces, items } from '../../models/mongodb.js'
import sendEmail from '../../utilities/email/email.js'

export default async function send_reservation_email (request_content, url) {
  let reservation_content = ''
  for (let i = 0; i < request_content.space_reservations.length; i++) {
    reservation_content += '<div>'
    const temp_space = await spaces.findOne({ _id: new ObjectId(request_content.space_reservations[i].space_id) })
    reservation_content += temp_space.name['zh-tw']
    reservation_content += ' '
    reservation_content += request_content.space_reservations[i].start_datetime
    reservation_content += '~'
    reservation_content += request_content.space_reservations[i].end_datetime
  }
  for (let i = 0; i < request_content.item_reservations.length; i++) {
    reservation_content += '<div>'
    const temp_item = await items.findOne({ _id: new ObjectId(request_content.item_reservations[i].item_id) })
    reservation_content += temp_item.name['zh-tw']
    reservation_content += ' '
    reservation_content += '數量：'
    reservation_content += request_content.item_reservations[i].quantity
    reservation_content += ' '
    reservation_content += request_content.item_reservations[i].start_datetime
    reservation_content += '~'
    reservation_content += request_content.item_reservations[i].end_datetime
  }
  const content = `<!DOCTYPE html >
                  <html >
                    <head>
                      <meta name="viewport" content="width=device-width" />
                      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                    </head>
                    <body>
                    <div>
                      <h2>預約資訊</h2>
                      <div>姓名：${request_content.name}</div>
                      <div>系級：${request_content.department_grade}</div>
                      <div>借用單位：${request_content.organization}</div>
                      <div>email：${request_content.email}</div>
                      <div>借用理由：${request_content.reason}</div>
                      <div>備註 ：${request_content.note}</div>
                      <div>預約清單</div>
                      <div>
                        ${reservation_content}
                      </div>
                    </div>
                    <h2>可利用以下連結做更改或刪除<a href="${url}">${url}</a></h2>
                    <div>學生會icon</div></body>
                  </html>
                  `
  return sendEmail(request_content.email, '學生會預約系統', content)
}
