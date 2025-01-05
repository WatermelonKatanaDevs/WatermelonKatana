const express = require("express");
const router = express.Router();

const Posts = require("../../Database/model/Posts")
const PostAPI = require("./post");
const poster = new PostAPI(Posts,"posts");
const auths = require("../../Middleware/auth");

poster.route(router,auths);

module.exports = router;
