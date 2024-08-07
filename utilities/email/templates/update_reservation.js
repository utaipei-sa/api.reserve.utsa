import { spaces, items } from '../../../models/mongodb.js'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone.js'
import weekday from 'dayjs/plugin/weekday.js'
import { ObjectId } from 'mongodb'

dayjs.extend(timezone)
dayjs.extend(weekday)
dayjs.locale('zh-tw')
dayjs.tz.setDefault('Asia/Taipei')

export const subject = '【學生會】預約變更通知'
export const html = async (reservation) => {
  let space_reservations_string = ''
  let item_reservations_string = ''

  // generate space_reservations_string
  for (const space_reservation of reservation.space_reservations) {
    const space = await spaces.findOne({
      _id: new ObjectId(space_reservation.space_id)
    })
    const space_name = space?.name['zh-tw'] || '(查無場地名稱)'
    const start_datetime = space_reservation.start_datetime
    const end_datetime = space_reservation.end_datetime
    space_reservations_string += `
      <li>
        ${space_name}<br>
        ${time_period_string(start_datetime, end_datetime)}
      </li>
    `
  }

  // generate item_reservations_string
  for (const item_reservation of reservation.item_reservations) {
    const item = await items.findOne({
      _id: new ObjectId(item_reservation.item_id)
    })
    const item_name = item?.name['zh-tw'] || '(查無物品名稱)'
    const start_datetime = item_reservation.start_datetime
    const end_datetime = item_reservation.end_datetime
    item_reservations_string += `
      <li>
        ${item_name}<br>
        ${time_period_string(start_datetime, end_datetime)}<br>
        數量：${item_reservation.quantity}
      </li>
    `
  }

  const verify_remind_string = reservation.verify === 1
    ? ''
    : `
      <p>
        提醒您，這筆預約尚未完成驗證，完成驗證後才會為您保留時段！<br>
        ↓ 請盡速進行驗證！
      </p>
      <table width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td>
            <table cellspacing="0" cellpadding="0">
              <tr>
                <td style="border-radius: 2px; background-color: #4CAF50;">
                  <a href="${new URL(`verify/${reservation._id}`, process.env.FRONTEND_BASE_URL)}" target="_blank" style="padding: 8px 12px; border: 1px solid #4CAF50;border-radius: 2px;font-family: Helvetica, Arial, sans-serif;font-size: 14px; color: #ffffff;text-decoration: none;font-weight:bold;display: inline-block;">
                    點我進行驗證
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      `
  return `
    <!DOCTYPE html>
    <html lang="zh-Hant-TW">
    <head>
      <meta charset="UTF-8">
      <title></title>
    </head>
    <body>
      <p>您好：</p>
      <p>您的預約已變更，以下是更新後的預約資訊：</p>
      <p>
        <ul>
          <li>借用單位：${reservation.organization}</li>
          <li>用途：${reservation.reason}</li>
          <li>聯絡人姓名：${reservation.name}</li>
          <li>聯絡人系級：${reservation.department_grade}</li>
          <li>
            場地預約：
            <ul>
              ${space_reservations_string}
            </ul>
          </li>
          <li>
            物品預約：
            <ul>
              ${item_reservations_string}
            </ul>
          </li>
          <li>備註：${reservation.note}</li>
        </ul>
      </p>
      ${verify_remind_string}
      <p>↓ 如欲再次更改或取消預約，請按鈕進行操作</p>
      <table width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td>
            <table cellspacing="0" cellpadding="0">
              <tr>
                <td style="border-radius: 2px; background-color: #1867C0;">
                  <a href="${new URL(`edit/${reservation._id}`, process.env.FRONTEND_BASE_URL)}" target="_blank" style="padding: 8px 12px; border: 1px solid #1867C0;border-radius: 2px;font-family: Helvetica, Arial, sans-serif;font-size: 14px; color: #ffffff;text-decoration: none;font-weight:bold;display: inline-block;">
                    點我更改/取消預約
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <p><i>若非您本人進行借用，請 <a href="mailto:utsa@go.utaipei.edu.tw">聯絡我們</a></i></p>
      <p>臺北市立大學學生會 借用預約系統</p>
    </body>
    </html>
  `
}

function time_period_string (start_datetime, end_datetime) {
  const weekdaysMin = ['日', '一', '二', '三', '四', '五', '六']
  const start_time = dayjs(start_datetime)
  const end_time = dayjs(end_datetime)
  const start_string = `${start_time.format('YYYY/MM/DD')}(${weekdaysMin[start_time.day()]}) ${start_time.format('HH:mm')}`
  const end_string = start_time.format('YYYYMMDD') === end_time.format('YYYYMMDD')
    ? end_time.format('HH:mm')
    : `${end_time.format('YYYY/MM/DD')}(${weekdaysMin[end_time.day()]}) ${end_time.format('HH:mm')}`
  return `${start_string} ~ ${end_string}`
}
