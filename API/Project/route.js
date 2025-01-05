const express = require("express");
const router = express.Router();

const Projects = require("../../Database/model/Projects");
const ProjectAPI = require("./project");
const poster = new ProjectAPI(Projects);
const { adminAuth, userAuth, checkAuth } = require("../../Middleware/auth");

poster.route(router,userAuth,adminAuth,checkAuth);
router.route("/favorite/:id").get(userAuth, poster.favorite.bind(poster));
router.route("/unfavorite/:id").get(userAuth, poster.unfavorite.bind(poster));

module.exports = router;
