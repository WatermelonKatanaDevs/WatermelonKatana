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

exports.makeFormToken = function (req, res, next) {
  if (!req.cookies["formToken"]) {
    let formToken = Math.random(0, Date.now()).toString(36).slice(2) + Math.random().toString(36).slice(2);
    res.cookie("formToken", formToken);
    formTokens.set(formToken, "pending");
  }
  next();
}

exports.checkFormToken = function(req, res, next) {
  let formToken = req.cookies["formToken"];
  if(formToken && formTokens.get(formToken) !== "pending") {
    formTokens.set(formToken, "processing");
    next(()=>{res.clearCookie("formToken"); formTokens.delete(formToken)}, ()=>{formTokens.set(formToken, "pending")});
  } else {
    res.status(400).send("Form submission already in use");
  }
}