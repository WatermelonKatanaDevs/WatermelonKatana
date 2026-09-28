// Email
const mailer = require('nodemailer');

const mailuser = process.env.EMAIL_USER || "watermelonkatana@outlook.com";
const tenant = process.env.EMAIL_TENANT || "common";
const maildebug = process.env.EMAIL_DEBUG === "1" || process.env.EMAIL_DEBUG === "true";
const useoauth = !!(process.env.EMAIL_CLIENT_ID && process.env.EMAIL_CLIENT_SECRET && process.env.EMAIL_REFRESH_TOKEN);

function buildtransport() {
  if (useoauth) {
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
      connectionTimeout: 15000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
      logger: maildebug,
      debug: maildebug,
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
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    logger: maildebug,
    debug: maildebug,
  });
}

const transporter = buildtransport();

console.log("[mail] mode: " + (useoauth ? "OAuth2" : "password") + " | user: " + mailuser + " | tenant: " + tenant);
if (!useoauth && !process.env.EMAIL_PASSWORD) console.log("[mail] warning: no EMAIL_PASSWORD and no OAuth2 vars set, mail will fail");

transporter.verify(function (error, success) {
  if (error) {
    console.log("[mail] transporter verify failed:");
    console.log(error);
  } else {
    console.log("[mail] transporter ready, server accepts connections");
  }
});

exports.sendMail = function(recipient, options) {
  options = options || {};
  options.from = mailuser;
  options.to = recipient;
  console.log("[mail] sending to " + recipient + " | subject: " + (options.subject || "(none)"));
  return new Promise((res,rej)=>{
    transporter.sendMail(options, function(error, info){
      if (error) {
        console.log("[mail] send failed to " + recipient + ":");
        console.log(error);
        rej(error);
      } else {
        console.log("[mail] sent to " + recipient + " | response: " + info.response + " | messageId: " + info.messageId);
        if (info.accepted) console.log("[mail] accepted: " + JSON.stringify(info.accepted));
        if (info.rejected && info.rejected.length) console.log("[mail] rejected: " + JSON.stringify(info.rejected));
        res(info);
      }
    });
  });
};
