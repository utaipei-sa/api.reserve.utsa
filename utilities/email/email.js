import nodemailer from 'nodemailer' // email relative

/**
 * 寄送 email
 * @param {string} to_email 收件者的 email address
 * @param {string} subject 主旨
 * @param {string} content 信件內容
 */
export default async function sendEmail (toEmail, subject, content) {
  // 創建 SMTP 傳輸器
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD // 你的 Gmail 密碼或應用程式特定密碼
    }
  })

  // 郵件內容 utsa@go.utaipei.edu.tw
  const mailOptions = {
    from: process.env.EMAIL, // 你的 Gmail 地址
    to: toEmail, // 使用者填寫的郵箱地址
    subject,
    html: content // 郵件正文內容
  }

  // 發送郵件
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error) // Reject the promise with the error
      } else {
        resolve(info.response) // Resolve the promise with the response info
      }
    })
  })
}
