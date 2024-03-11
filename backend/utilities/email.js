const nodemailer = require('nodemailer') // email relative

/**
 * 寄送 email
 * @param {string} to_email 收件者的 email address
 * @param {string} subject 主旨
 * @param {string} content 信件內容
 */
module.exports.sendEmail =  function(toEmail, subject, reserve_information, url) {
  // 創建 SMTP 傳輸器
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD // 你的 Gmail 密碼或應用程式特定密碼 
    }
  })
  
  // 郵件內容 utsa@go.utaipei.edu.tw
  const mailOptions = {
    from: process.env.EMAIL, // 你的 Gmail 地址
    to: toEmail, // 使用者填寫的郵箱地址
    subject : "學生會預約系統" ,
    html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
          <html xmlns="http://www.w3.org/1999/xhtml">
          <head>
          <meta name="viewport" content="width=device-width" />
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
          <title>Notification</title>
          <link href="email.css" media="all" rel="stylesheet" type="text/css" />
          </head>
          <body>
          <h2>成功預約${reserve_information} </h2>
          <h2>可利用以下連結做更改或刪除<div>${url}</div></h2>
          <div>學生會icon</div></body></html>
    ` // 郵件正文內容
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
