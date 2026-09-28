const express = require("express");
const router = express.Router();
const ratelimit = require("express-rate-limit");

const { register, login, update, updateRole, verifybadge, deleteUser, deleteSelf, listUsers, userdata, check, changePassword, follow, unfollow } = require("./auth");
const { sendVerification, verifyUser, sendPasswordReset, resetPassword } = require("./verify");
const { adminAuth, userAuth, checkAuth, checkFormToken } = require("../../Middleware/auth");

const authlimiter = ratelimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many attempts, please try again later" },
});

router.route("/register").post(authlimiter, checkFormToken, register);
router.route("/login").post(authlimiter, login);
router.route("/changePassword").post(authlimiter, userAuth, changePassword);
router.route("/update").put(userAuth, update);
router.route("/updateRole").put(adminAuth, updateRole);
router.route("/verifybadge").put(adminAuth, verifybadge);
router.route("/deleteUser").delete(adminAuth, deleteUser);
router.route("/deleteSelf").delete(userAuth, deleteSelf);
router.route("/listUsers").get(checkAuth, listUsers);
router.route("/check").get(checkAuth, check);
router.route("/userdata").get(checkAuth, userdata);
router.route("/follow").get(userAuth, follow);
router.route("/unfollow").get(userAuth, unfollow);
router.route("/verify/send").post(authlimiter, userAuth, sendVerification);
router.route("/verify/email").get(verifyUser);
router.route("/resetPassword/send").post(authlimiter, sendPasswordReset);
router.route("/resetPassword/reset").post(authlimiter, resetPassword);

module.exports = router;