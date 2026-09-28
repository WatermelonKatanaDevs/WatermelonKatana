
const Users = require("../../Database/model/Users");
const mailer = require("../mail");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const origin = "https://watermelonkatana.onrender.com";

function makeid(length) {
  return crypto.randomBytes(length).toString("base64url").slice(0, length);
}

function randomunigif() {
  const n = Math.floor(Math.random() * 16) + 1;
  return origin + "/images/uni/" + n + ".gif";
}

function emailtemplate(username, heading, intro, buttonlabel, buttonurl, footnote) {
  const gif = randomunigif();
  return `
  <div style="margin:0;padding:0;background:#151515;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#151515;padding:28px 0;font-family:Tahoma,Geneva,Verdana,sans-serif;">
      <tr><td align="center">
        <table role="presentation" width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;">
          <tr><td style="padding:0 6px 16px;">
            <span style="font-family:'Fugaz One',Tahoma,sans-serif;font-size:28px;color:#de6c83;background:linear-gradient(90deg,#de6c83,#ff2e58,#2cf6b3,#00b377);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;">WatermelonKatana</span>
          </td></tr>
          <tr><td style="background:#272727;border-radius:10px;border:1px solid #3d3d3d;padding:26px 28px;color:#e0e0e0;">
            <h1 style="margin:0 0 14px;font-family:'Fugaz One',Tahoma,sans-serif;font-size:26px;font-weight:400;color:#ffffff;">${heading}</h1>
            <p style="margin:0 0 6px;font-size:15px;color:#e0e0e0;">Hey <b style="color:#ff9c9c;">${username}</b>,</p>
            <p style="margin:0 0 24px;font-size:15px;line-height:1.55;color:#c9c9c9;">${intro}</p>
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 22px;"><tr><td bgcolor="#de6c83" style="border-radius:50px;">
              <a href="${buttonurl}" style="display:inline-block;padding:11px 26px;font-family:Tahoma,sans-serif;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:50px;background:#de6c83;">${buttonlabel}</a>
            </td></tr></table>
            <p style="margin:0 0 22px;font-size:12px;color:#b0b0b0;word-break:break-all;">or paste this link:<br><a href="${buttonurl}" style="color:#ff9c9c;text-decoration:none;">${buttonurl}</a></p>
            <div style="border-top:1px solid #3d3d3d;padding-top:20px;text-align:center;">
              <img src="${gif}" alt="uni" width="200" style="max-width:200px;border-radius:10px;border:1px solid #3d3d3d;">
              <div style="font-size:12px;color:#b0b0b0;margin-top:8px;">a uni gif from dev (dev_site)</div>
            </div>
            <p style="margin:20px 0 0;font-size:12px;color:#b0b0b0;">${footnote}</p>
          </td></tr>
          <tr><td style="padding:16px 6px 0;text-align:center;color:#777777;font-size:11px;">
            <a href="${origin}" style="color:#ff9c9c;text-decoration:none;">watermelonkatana.com</a>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </div>`;
}

var pendingVerifications = {};
exports.sendVerification = async (req,res) => {
  const { email } = req.body;
  try {
    if (!email.match(/^([^@]+)@([^\s]+?).([^.\s]+)$/)) return res.status(404).json({
      message: "Verification email not successfully created",
      error: "Email not valid",
    });
    const uid = res.locals.userToken.id;
    const user = await Users.findOne({ _id: uid });
    if (!user) return res.status(404).json({
      message: "Verification email not successfully created",
      error: "User not found",
    });
    var verifyId = makeid(64);
    const maxAge = 60 * 60 * 1000; // 1 hour
    pendingVerifications[verifyId] = {
      uid: uid,
      email: email,
      expiresAt: Date.now() + maxAge,
    };
    var verifyUrl = origin+"/api/auth/verify/email?id="+verifyId;
    mailer.sendMail(email,{
      subject: "Verify your email",
      text: `Hey ${user.username},\n\nClick the link to confirm this email for your account:\n${verifyUrl}\n\nWasn't you? Just ignore this email.\n\n- WatermelonKatana`,
      html: emailtemplate(
        user.username,
        "Verify your email",
        "Click the button below to confirm this email for your account.",
        "Verify email",
        verifyUrl,
        "Wasn't you? Just ignore this email."
      ),
    })
    res.status(200).json({
      message: "Verification email creation successful",
    });
  } catch(error) {
    res.status(400).json({
      message: "Verification email not successfully created",
      error: error.message,
    });
    console.log(error.message);
  }
};
exports.verifyUser = async (req,res) => {
  const { id } = req.query;
  try {
    var verify = pendingVerifications[id];
    if (!verify) return res.status(404).json({
      message: "Verification not successful",
      error: "Verify not found",
    });
    if (Date.now() > verify.expiresAt) return res.status(400).json({
      message: "Verification not successful",
      error: "Link expired",
    });
    const user = await Users.findOne({ _id: verify.uid });
    if (!user) return res.status(404).json({
      message: "Verification not successful",
      error: "User not found",
    });
    user.email = verify.email;
    await user.save();
    delete pendingVerifications[id];
    res.status(301).redirect("/verified?email="+user.email);
  } catch(error) {
    res.status(400).json({
      message: "Verification not successful",
      error: error.message,
    });
  }
};

var pendingPasswordResets = {};
exports.sendPasswordReset = async (req,res) => {
  const { email } = req.body;
  try {
    if (!email.match(/^([^@]+)@([^\s]+?).([^.\s]+)$/)) return res.status(404).json({
      message: "Reset email not successfully created",
      error: "Email not valid",
    });
    const user = await Users.findOne({ email });
    if (user) {
      var verifyId = makeid(64);
      const maxAge = 60 * 60 * 1000; // 1 hour
      pendingPasswordResets[verifyId] = {
        uid: user._id,
        email: email,
        expiresAt: Date.now() + maxAge,
      };
      var resetUrl = origin+"/resetpass?id="+verifyId;
      mailer.sendMail(email,{
        subject: "Reset your password",
        text: `Hey ${user.username},\n\nSomeone asked to reset your password. Click the link to pick a new one (works for 1 hour):\n${resetUrl}\n\nWasn't you? Just ignore this email, your password stays the same.\n\n- WatermelonKatana`,
        html: emailtemplate(
          user.username,
          "Reset your password",
          "Someone asked to reset your password. Click the button below to pick a new one. The link works for 1 hour.",
          "Reset password",
          resetUrl,
          "Wasn't you? Just ignore this email."
        ),
      })
    }
    res.status(200).json({
      message: "Reset email creation successful",
    });
  } catch(error) {
    res.status(400).json({
      message: "Reset email not successfully created",
      error: error.message,
    });
    console.log(error.message);
  }
};
exports.resetPassword = async (req,res) => {
  const { id, password } = req.body;
  try {
    var verify = pendingPasswordResets[id];
    if (!verify) return res.status(404).json({
      message: "Reset not successful",
      error: "Verify not found",
    });
    if (Date.now() > verify.expiresAt) return res.status(400).json({
      message: "Reset not successful",
      error: "Link expired",
    });
    const user = await Users.findOne({ _id: verify.uid });
    if (!user) return res.status(404).json({
      message: "Reset not successful",
      error: "User not found",
    });
    if (password.length < 8) return res.status(400).json({
      message: "New password should be at least 8 characters long",
    });
    const hash = await bcrypt.hash(password, 10);
    user.password = hash;
    await user.save();
    delete pendingPasswordResets[id];
    res.status(200).json({ message: "Reset successful" });
  } catch(error) {
    res.status(400).json({
      message: "Reset not successful",
      error: error.message,
    });
  }
};