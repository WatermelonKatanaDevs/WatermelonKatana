const jwt = require("jsonwebtoken");
const jwtSecret = process.env["JWT_SECRET"];
const cldir = __dirname;
const formTokens = new Map();

exports.adminAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, jwtSecret, (err, decodedToken) => {
      if (err) {
        return res.status(403).sendFile(cldir + "/403.html");
      } else {
        if (decodedToken.role !== "Admin") {
          return res.status(403).json({ message: "Not authorized, user not admin" });
        } else {
          res.locals.userToken = decodedToken;
          next();
        }
      }
    });
  } else {
    return res.status(403).sendFile(cldir + "/403.html");
  }
};

exports.userAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, jwtSecret, (err, decodedToken) => {
      if (err) {
        return res.status(403).sendFile(cldir + "/403.html");
      } else {
        res.locals.userToken = decodedToken;
        next();
      }
    });
  } else {
    return res.status(403).sendFile(cldir + "/403.html");
  }
};

exports.checkAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, jwtSecret, (err, decodedToken) => {
      res.locals.userToken = err ? false : decodedToken;
      next();
    });
  } else {
    res.locals.userToken = false;
    next();
  }
};

setInterval(function handleExpiry() {
  let timestamp = Date.now();
  for (let [tokenId, token] of formTokens) {
    if (timestamp > token.expires) {
      formTokens.delete(tokenId);
    }
  }
}, 6e4)

exports.makeFormToken = function (req, res, next) {
  let tokenId = req.cookies["formToken"];
  let formToken = formTokens.get(tokenId);
  if (formToken) { formTokens.delete(tokenId) }
  generateFormToken(res);
  next();
}

exports.checkFormToken = function (req, res, next) {
  let tokenId = req.cookies["formToken"];
  let formToken = formTokens.get(tokenId);
  if (tokenId && formToken.state === "pending") {
    formToken.state = "processing";
    res.locals.clearCookie = () => { res.clearCookie("formToken"); formTokens.delete(tokenId) }
    res.locals.recycleCookie = () => { formToken.delete(tokenId); generateFormToken(res) }
    next();
  } else {
    res.status(400).send("Form submission already in use");
  }
}

function generateFormToken(res) {
  tokenId = Math.random(0, Date.now()).toString(36).slice(2) + Math.random().toString(36).slice(2);
  formTokens.set(tokenId, {
    state: "pending",
    expires: Date.now() + 9e5
  });
  res.cookie("formToken", tokenId);
}