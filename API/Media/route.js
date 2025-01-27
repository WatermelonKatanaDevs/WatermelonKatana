const express = require("express");
const router = express.Router();
const fetch = require("cross-fetch");

const Media = require("../../Database/model/Media");
const { adminAuth, userAuth } = require("../../Middleware/auth");

router.route("/upload").post(userAuth, express.urlencoded({ extended:false, limit:"32mb" }), async (req,res) => {
  try {
    var params = new URLSearchParams();
    params.set("key",process.env.IMGBB_API_KEY);
    params.set("name",req.body.name);
    params.set("image",req.body.image);
    console.log(params);
    var data = await fetch("https://api.imgbb.com/1/upload",{
      method: "POST",
      body: params
    });
    data = await data.json();
    if (data.error) throw data.error;
    const image = data.data;
    const user = res.locals.userToken;
    const media = await Media.create({
      name: image.title,
      url: image.url,
      delete_url: image.delete_url,
      width: image.width,
      height: image.height,
      size: image.size,
      type: image.image.extension,
      uploadedAt: image.time,
      poster: user.username,
      posterId: user.id,
    });
    console.log(media);
    res.status(200).json({
      message: "Media successfully uploaded",
      media: media.pack()
    });
  } catch(error) {
    res.status(400).json({
      message: "Media not successfully uploaded",
      error: error.message,
    });
    console.log(error.message);
  }
});

router.route("/get/:id/*").get(async (req,res) => {
  try {
    var mid = req.params.id;
    var media = await Media.findOne({ _id: mid });
    var request = await fetch(media.url);
    if (request.status >= 206) throw { message: "Could not fetch; Error Code: "+request.status };
    res.setHeader("Content-Type", request.headers.get("Content-Type"));
    res.redirect(media.url);
    // var blob = await request.blob();
    // var buffer = await blob.arrayBuffer();
    // buffer = Buffer.from(buffer);
    // res.set("Content-Type", blob.type);
    // res.send(buffer);
  } catch(error) {
    res.status(400).json({
      message: "Media not successfully fetched",
      error: error.message,
    });
    console.log(error.message);
  }
});
router.route("/list").get(async (req,res) => {
  var { poster } = req.query;
  try {
    var search = {};
    if (poster) search.poster = poster;
    if (req.query.customQuery) search = req.query.customQuery;
    var media = await Media.find(search);
    const list = media.map(e=>e.pack());
    res.status(200).json({ media: list });
  } catch(err) {
    res.status(401).json({ message: "Not successful", error: err.message });
  }
});

module.exports = router;