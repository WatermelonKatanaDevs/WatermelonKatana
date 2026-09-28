// Email
const mailer = require('nodemailer');

const mailuser = process.env.EMAIL_USER || "watermelonkatana@outlook.com";
const tenant = process.env.EMAIL_TENANT || "common";

function buildtransport() {
  if (process.env.EMAIL_CLIENT_ID && process.env.EMAIL_CLIENT_SECRET && process.env.EMAIL_REFRESH_TOKEN) {
    return mailer.createTransport({
      host: "smtp-mail.outlook.com",
      port: 587,
      secure: false,
      auth: {
        type: "OAuth2",
        user: mailuser,
        clientId: process.env.EMAIL_CLIENT_ID,
        clientSecret: process.env.EMAIL_CLIENT_SECRET,
        refreshToken: process.env.EMAIL_REFRESH_TOKEN,
        accessToken: process.env.EMAIL_ACCESS_TOKEN,
        accessUrl: "https://login.microsoftonline.com/" + tenant + "/oauth2/v2.0/token",
      },
    });
  }
  return mailer.createTransport({
    host: "smtp-mail.outlook.com",
    port: 587,
    secure: false,
    auth: {
      user: mailuser,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
}

const transporter = buildtransport();

exports.sendMail = function(recipient, options) {
  options = options || {};
  options.from = mailuser;
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
