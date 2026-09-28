// Email
const mailer = require('nodemailer');

const mailuser = process.env.EMAIL_USER || "watermelonkatana@outlook.com";
const tenant = process.env.EMAIL_TENANT || "common";
const maildebug = process.env.EMAIL_DEBUG === "1" || process.env.EMAIL_DEBUG === "true";
const useworker = !!(process.env.MAIL_WORKER_URL && process.env.MAIL_WORKER_SECRET);
const usegraph = !!(process.env.EMAIL_CLIENT_ID && process.env.EMAIL_CLIENT_SECRET && process.env.EMAIL_REFRESH_TOKEN);

let graphtoken = null;
let graphexpiry = 0;

async function getgraphtoken() {
  if (graphtoken && Date.now() < graphexpiry) return graphtoken;
  const params = new URLSearchParams();
  params.set("client_id", process.env.EMAIL_CLIENT_ID);
  params.set("client_secret", process.env.EMAIL_CLIENT_SECRET);
  params.set("grant_type", "refresh_token");
  params.set("refresh_token", process.env.EMAIL_REFRESH_TOKEN);
  params.set("scope", "offline_access https://graph.microsoft.com/Mail.Send");
  const resp = await fetch("https://login.microsoftonline.com/" + tenant + "/oauth2/v2.0/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok || !data.access_token) {
    console.log("[mail] graph token fetch failed | status: " + resp.status);
    console.log(data);
    throw new Error("Graph token fetch failed: " + JSON.stringify(data));
  }
  graphtoken = data.access_token;
  graphexpiry = Date.now() + ((data.expires_in || 3600) - 60) * 1000;
  if (maildebug) console.log("[mail] graph token acquired, expires in " + (data.expires_in || 3600) + "s");
  return graphtoken;
}

async function sendviagraph(recipient, options) {
  console.log("[mail] sending via graph to " + recipient + " | subject: " + (options.subject || "(none)"));
  const token = await getgraphtoken();
  const message = {
    subject: options.subject || "",
    body: {
      contentType: options.html ? "HTML" : "Text",
      content: options.html || options.text || "",
    },
    toRecipients: [{ emailAddress: { address: recipient } }],
  };
  const resp = await fetch("https://graph.microsoft.com/v1.0/me/sendMail", {
    method: "POST",
    headers: { "authorization": "Bearer " + token, "content-type": "application/json" },
    body: JSON.stringify({ message, saveToSentItems: true }),
  });
  if (resp.status !== 202) {
    const detail = await resp.text();
    console.log("[mail] graph send failed to " + recipient + " | status: " + resp.status + " | detail: " + detail);
    throw new Error("Graph send failed (" + resp.status + "): " + detail);
  }
  console.log("[mail] graph sent to " + recipient + " | 202 accepted");
  return { response: "202 accepted" };
}

async function sendviaworker(recipient, options) {
  console.log("[mail] sending via worker to " + recipient + " | subject: " + (options.subject || "(none)"));
  const resp = await fetch(process.env.MAIL_WORKER_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "authorization": "Bearer " + process.env.MAIL_WORKER_SECRET,
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM || mailuser,
      to: recipient,
      subject: options.subject,
      text: options.text,
      html: options.html,
    }),
  });
  const detail = await resp.text();
  if (!resp.ok) {
    console.log("[mail] worker send failed to " + recipient + " | status: " + resp.status + " | detail: " + detail);
    throw new Error("Worker send failed (" + resp.status + "): " + detail);
  }
  console.log("[mail] worker sent to " + recipient + " | detail: " + detail);
  return { response: detail };
}

let transporter = null;
function buildtransport() {
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

function sendviasmtp(recipient, options) {
  console.log("[mail] sending via smtp to " + recipient + " | subject: " + (options.subject || "(none)"));
  if (!transporter) transporter = buildtransport();
  return new Promise((res, rej) => {
    transporter.sendMail(options, function (error, info) {
      if (error) {
        console.log("[mail] send failed to " + recipient + ":");
        console.log(error);
        rej(error);
      } else {
        console.log("[mail] sent to " + recipient + " | response: " + info.response + " | messageId: " + info.messageId);
        res(info);
      }
    });
  });
}

if (useworker) console.log("[mail] mode: worker relay | url: " + process.env.MAIL_WORKER_URL + " | from: " + mailuser);
else if (usegraph) console.log("[mail] mode: Graph API (Outlook) | user: " + mailuser + " | tenant: " + tenant);
else console.log("[mail] mode: smtp password | user: " + mailuser + (process.env.EMAIL_PASSWORD ? "" : " | warning: no EMAIL_PASSWORD set"));

exports.sendMail = function (recipient, options) {
  options = options || {};
  options.from = mailuser;
  options.to = recipient;
  if (useworker) return sendviaworker(recipient, options);
  if (usegraph) return sendviagraph(recipient, options);
  return sendviasmtp(recipient, options);
};

/*
+++++++*+*********====+++++++***++++###################%%%%%%*=-::::::::::::::::::::::::::::::::::::
+++++++++*********====+++++++***++++####################%%%%%*=-::::::::::::::::::::---------:::::::
+++++++++*********====+++++++***++++#####################%%%%*=-::::::::::::::::--=+#%%@@@%#++--::::
++++++++++********====++++++++**++++#####################%%%%*-::::::::::::::::=#@@@@@@@@@@@@#*=--::
++++++++++********====++++++++**++++#####################%%%%+-:::::::::::::::=#@@@@@@@@@@@@@@%#+-::
+++++++++++*******====++++++++**++++######################%%%+--:::::::::::::-+%@@@@@@@@@@@@@@@@#+-:
+++++++++*********+===++=+++++**+++*#####################%%%%+=-::::::::----=*%@@@@@@@@@@@@@@@@@#=--
++++++************++==++++++++******#####################%%%%+--::::::-=*%%%@@@@@@@@@@@@@@@@@@@@*=-:
******************++==+++++++*******######################%%%+-::::-++%%@@@@@@@@@@@@@@@@@@@@@@@@*=-:
******************++==+++++++*******######################%%%+---=+#@@@@@@@@@@@@@@@@@@@@@@@@@@@*=-::
******************+++++++++++*******#####################%%%%*++*%@@@@@@@@@@@@@@@@@@@@@@@@@@@@#+-:::
******************+++++++++++*******######################%%%%%%@@@@@@@@@@@@@@@@@@@@@@@@@@@%*+=-::::
**************###*++++++++++*****#**######################%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%*=-::::::
*******##########*+++++++++****##***####################%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%#+=-::::::::
******%@@@@%%####*++++**++****##****###################%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%*+-:::::::::::
******#@@@@@@@@@@@@@@#%%%%#@@@@%@@%#%%%@@@@@@@@#######%@@@@@@@@@@@@@@@@@@@@@@@@@@@%*=-::::::::::::::
########@@@@@%@@@@@@@@@@@@@@@@@@@@@@@@@#@@@@@@@####%%@@@@@@@@@@@@@@@@@@@@@@@@@@#+-::::::::::::::::::
#########%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%#%@%@@@@@@@@@@@@@@@@@@@@@@@@@#=-::::::::::::::::::::
#########%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*-::::::::::::::::::::::
###########%@@@@@@@@@%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%+-:::::::::::::::::::::::
###########%@@@@@@@@@@@%@@@@@@@@@@@@@%@@@@#@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@#=-::::::::::::::::::::::::
###########@@@@@@@@@@@@@@@@@@@@@@@@@*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*=---:::::::::::::::::::::::
###########@@@@@@@@@@@@@@@@@@@@@@@@@@@%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*==---::::::::::::::::::::::
##########%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*=-=----------------::::::::
##########%@@@@@@@@@@@#@-@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*-::-------------===--::::::
##########@@@@@@@@@@@@#@@@*@@@@@@@@*@@*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*-:::::::::::-----==-:::::::
##########@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%@@@@@@@@@@@@@@@@@@@@@@@@@@@@%-:::::::::::-----==-:::::--
%%#######%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%@@@@@@@@@@@@@@@@@@@@@@@@@@@%=:::::::-:::-----==--::----
#####****#@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%@@@@@@@@@@@@@@@@@@@@@@@@@@@@%-:::::::-:::-----==---::::-
++++++++*@@@@@@%%***#@@@@@@@@@@@@@@@@@@%%#-+*@@@@@@@@@@@@@@@@@@@@@@@@@@@*-::::::--::----=====-------
++++++++*@@@%%@@@*+===+@@@@@@@@@@@@@@@*=++**#@@@#@@@@@@@@@@@@@@@@@@@@@@@+:::::::-------====+=-------
++++++++*@@%@*+==-------=#%%*=--=++*---++#%=#%*@@*@@@@@@@@@@@@@@@@@@@@@@=-:::::--------======-------
++++++++#@@@@%+=----------------------==%+%+@@%@@#@@@%@@@@@@@@@@@@@@@@@%=--------------======-------
++++++++@@@@@%==--------------------+%%%@#%#@#@@%@@@@@@@@@@@@@@@@@@@@@@%=---------------=====-------
+++++++*@@@@@%+=-------::::::::::-=*@@@@@%@%%@@@@@@@#@%@@@@@@@@@@@@@@@@#------------------==--------
+++++++*@@@@@%==-----::::::::::::-#@@@@@@@%@#@@@@@@@@@@@@@@@@@@@@@@@@@@+----------------------------
+++++++*@@@@@@*=---::-::::::::::-+%@@@@@@@@%@#@%@@@@@@@@@@@@@@@@@@@@@@@+----------------------------
++++++++@@@@@@*=-----:::::::::::-+%@@@@@@@@%@@@@@@@@%@@@@@@@@@@@@@@@@@@#=---------------------------
+++++++*@@@@@%+-------::::::::::-*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*=---------------------------
+++++++*@@@@@#+=------::::::::::-%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%=---------------------------=
======+*@@@@@@%=-------:::::::::-+@@%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@=----------------------------=
=======*@@@@@@@#==--------::::---+@@@@@@@@@@@@@@@@@@@@@@@##@@@@@@@@@%=------------------------------
=======+@@@@@@@@*+==------------=@@@@@@@@@@@@@@@@@@@@%#**++*@@@@@@@@=-------------------------------
========+@@@@@@@@##+=--------=*%#%@@@@@@@@@@@@@@@@@%*+++===#@@@@@@@%--------------------------------
========++@@@@@@@@@@%*+=-===+#%@@@@@@@@@@@@@@@##%@*=======*@@@@@@@@=--------------------------------
==========+@@@@@@@@@@@%**#*+*@@@@@@@@@@@@@@%*+=--==========--====-::----:::-------------------------
===========+#@@@@@@@@@@@%*##@@@@@@@@@@@@@@#+====++=======--:::::::------:::-------------------------
=============+#@@@@@@@@@@#%@@@@@@@@@@@@@%#**+++++*******==-::::::::::::::::-------------------------
===----====++*#@@@@@@@@@@#%@@@@@@@@@@%###*************+++++=----:::::::::::::::---------------------
======++*****#@@@@@@@@@@@#%@@@@@@@@@@#****************+==-------------::::::::-:--------------------
+************++====+@@@@##%@@@+==----=**********++==------------------:::::::::---------------------
*************++=======*@###@*===-=-=-=******+++=====-=------------------:::--::---------------------
*************++========#####*===--=--=*******+++++======-----------------:::::----------------------
*******************++*+******+++++++=++*+*++++++======-------------------::::::::::-----------------
***************++++++++******+++++++=+++++++=======-------------------------------------------------

*/