import {
  convert_item_reservations_string,
  convert_space_reservations_string
} from '../template_utils.js'

export const subject = '【學生會】驗證成功通知'
export const html = async (reservation) => {
  const space_reservations_string = await convert_space_reservations_string(reservation.space_reservations)
  const item_reservations_string = await convert_item_reservations_string(reservation.item_reservations)

  return `
    <!DOCTYPE html>
    <html lang="zh-Hant-TW">
    <head>
      <meta charset="UTF-8">
      <title></title>
    </head>
    <body>
      <p>您好：</p>
      <p>您已完成電子郵件驗證，以下是預約資訊：</p>
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
      <p>↓ 如欲更改或取消預約，請點擊按鈕進行操作</p>
      <table width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td>
            <table cellspacing="0" cellpadding="0">
              <tr>
                <td style="border-radius: 2px; background-color: #1867C0;">
                  <a href="${new URL(`edit?id=${reservation._id}`, process.env.FRONTEND_BASE_URL)}" target="_blank" style="padding: 8px 12px; border: 1px solid #1867C0;border-radius: 2px;font-family: Helvetica, Arial, sans-serif;font-size: 14px; color: #ffffff;text-decoration: none;font-weight:bold;display: inline-block;">
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
