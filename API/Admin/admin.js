const fetch = require("cross-fetch");
const bcrypt = require("bcryptjs");

const Users = require("../../Database/model/Users");
const Projects = require("../../Database/model/Projects");
const Posts = require("../../Database/model/Posts");
const Reports = require("../../Database/model/Reports");

exports.transferProject = async (req, res) => {
  const { uid, project, post } = req.query;
  try {
    const user = await Users.findOne({ _id: uid });
    if (!user) return res.status(404).json({
      message: "Transfer not successful",
      error: "User not found",
    });
    var p = false;
    if (project && !post) p = await Projects.findOne({ _id: project });
    if (post && !project) p = await Posts.findOne({ _id: post });
    if (!p) return res.status(404).json({
      message: "Transfer not successful",
      error: "Post/Project not found",
    });
    p.poster = user.username;
    p.posterId = uid;
    await p.save();
    res.status(200).json({
      message: "Transfer successful",
    });
  } catch (error) {
    res.status(400).json({
      message: "Transfer not successful",
      error: error.message,
    });
    console.log(error.message);
  }
};
exports.resetPassword = async (req, res) => {
  /*
    ~ 1/7/25 - I implemented swapping to req.body instead of req.query, hopefully more secure
  */
  const uid = req.body.uid;
  const password = req.body.password;
  try {
    var hash = await bcrypt.hash(password || "password", 10);
    const user = await Users.findOne({ _id: uid });
    if (!user) return res.status(404).json({
      message: "Transfer not successful",
      error: "User not found",
    });
    user.password = hash;
    await user.save();
    res.status(201).json({
      message: "Password successfully reset",
      user: user._id,
      role: user.role,
    });
  } catch (error) {
    res.status(400).json({
      message: "Password not successfully reset",
      error: error.message,
    });
  }
};
exports.createReport = async (req, res, next) => {
  var { content, link } = req.body;
  console.log(content, link);
  try {
    const uid = res.locals.userToken.id;
    const user = await Users.findOne({ _id: uid });
    if (!user) return res.status(404).json({
      message: "Report not successfully created",
      error: "User not found",
    });
    const post = await Reports.create({
      content,
      link,
      postedAt: Date.now(),
      posterId: user.id,
      poster: user.username, //convert to ref eventually
    });
    console.log(post);
    res.status(201).json({
      message: "Report successfully created",
      id: post._id,
      link: post.link,
    });
    console.log("done!");
  } catch (error) {
    res.status(400).json({
      message: "Report not successfully created",
      error: error.message,
    });
    console.log(error.message);
  }
}
exports.openReport = async (req, res, next) => {
  try {
    const rid = req.params.id;
    const report = await Reports.findOne({ _id: rid });
    if (!report) return res.status(404).json({
      message: "Fetch not successful",
      error: "Report not found",
    });
    var link = report.link;
    // await report.remove();
    await Reports.deleteOne({ _id: rid });
    console.log("deleted " + rid);
    res.redirect(link);
  } catch (error) {
    res.status(400).json({
      message: "Report not successfully deleted",
      error: error.message,
    });
    console.log(error.message);
  }
};
exports.listReports = async (req, res, next) => {
  try {
    var search = {};
    const { customQuery } = req.query;
    if (customQuery) search = JSON.parse(customQuery);
    var list = await Reports.find(search);
    list = list.map(e => e.pack());
    var data = {};
    data.report = list;
    res.status(200).json(data);
  } catch (err) {
    res.status(401).json({ message: "Not successful", error: err.message });
    console.log(err.message);
  }
};