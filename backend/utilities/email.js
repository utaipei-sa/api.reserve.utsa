const nodemailer = require('nodemailer') // email relative

/**
 * 寄送 email
 * @param {string} to_email 收件者的 email address
 * @param {string} subject 主旨
 * @param {string} content 信件內容
 */
function sendEmail (toEmail, subject, content) {
  // 創建 SMTP 傳輸器
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'utsa@go.utaipei.edu.tw',
      pass: '你的密碼' // 你的 Gmail 密碼或應用程式特定密碼
    }
  })
  
  // 郵件內容
  const mailOptions = {
    from: 'utsa@go.utaipei.edu.tw', // 你的 Gmail 地址
    to: toEmail, // 使用者填寫的郵箱地址
    subject,
    text: content // 郵件正文內容
  }
  
  // 發送郵件
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error)
    } else {
      console.log('The email has sent: ' + info.response)
    }
  })
}