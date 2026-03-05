// Email
const mailer = require('nodemailer');
const transporter = mailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,          // or 2525, or 465
  secure: false,      // true only if you use port 465
  auth: {
    user: process.env.BREVO_SMTP_LOGIN, 
    pass: process.env.BREVO_SMTP_KEY,  
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
