const express = require("express");
const router = express.Router();

const Posts = require("../../Database/model/Posts")
const PostAPI = require("./post");
const poster = new PostAPI(Posts,"posts");
const { userAuth, adminAuth, checkAuth } = require("../../Middleware/auth");

poster.route(router,userAuth,adminAuth,checkAuth);

module.exports = router;
