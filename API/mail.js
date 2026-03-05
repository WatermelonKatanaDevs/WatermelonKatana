// Email
const mailer = require('nodemailer');
const transporter = mailer.createTransport({
  host: "smtp-mail.outlook.com",
  port: 587,
  secure: false,
  auth: {
    user: "watermelonkatana@outlook.com",
    pass: process.env.EMAIL_PASSWORD,
  },
});

exports.sendMail = function(recipient, options) {
  options = options || {};
  options.from = "watermelonkatana@outlook.com";
  options.to = recipient;
  return new Promise((res,rej)=>{
    transporter.sendMail(options, function(error, info){
      if (error) {
        console.log(error);
        rej(error);
      } else {
        console.log('Email sent: ' + info.response);
        res(info);
      }
    });
  });
};
