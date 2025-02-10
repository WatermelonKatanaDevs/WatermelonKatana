const Users = require("../../Database/model/Users");
const Profanity = require("../../util/js/censored");
const { checkFormToken } = require("../../Middleware/auth");

function interpretBool(obj, name, str) {
  if (str == "0" || str == "false") obj[name] = false;
  if (str == "1" || str == "true") obj[name] = true;
}

module.exports = class {
  constructor(model, name) {
    this.model = model;
    this.name = name;
  }

  route(router, userAuth, adminAuth, checkAuth) {
    router.route("/publish").post(userAuth, checkFormToken, this.publish.bind(this));
    router.route("/list").get(checkAuth, this.list.bind(this));
    router.route("/search").get(checkAuth, this.search.bind(this));
    router.route("/data/:id").get(checkAuth, this.data.bind(this));
    router.route("/update/:id").put(userAuth, this.update.bind(this));
    router.route("/delete/:id").delete(userAuth, this.delete.bind(this));
    router.route("/delete/:id").get(userAuth, this.delete.bind(this));
    router.route("/feature/:id").get(adminAuth, this.feature.bind(this));
    router.route("/unfeature/:id").get(adminAuth, this.unfeature.bind(this));
    router.route("/comment/:id").post(userAuth, checkFormToken, this.comment.bind(this));
    router.route("/comment/:id/edit").put(userAuth, this.editComment.bind(this));
    router.route("/comment/:id/delete").delete(userAuth, this.deleteComment.bind(this));
    router.route("/comment/:id/upvote").get(userAuth, this.upvoteComment.bind(this));
    router.route("/comment/:id/downvote").get(userAuth, this.downvoteComment.bind(this));
  }


  notifyUserMentions(message, user, content, link) {
    return Promise.all((message.match(/(?<=@)[^\s]+/g) || []).map(async function (name) {
      var mention = await Users.findOne({ username: name });
      mention.notify(user.username + " mentioned you!", content, link, user._id, user.username);
      await mention.save();
    }));
  }

  notifyUserFollowers(title, user, content, link) {
    return Promise.all(user.followers.map(async function (fid) {
      var follower = await Users.findOne({ _id: fid });
      follower.notify(title, content, link, user._id, user.username);
      await follower.save();
    }));
  }

  async publish(req, res, next) {
    var { title, content, tags, mature, hidden, privateRecipients } = req.body;
    console.log(title, content);
    try {
      const uid = res.locals.userToken.id;
      const user = await Users.findOne({ _id: uid });
      if (!user) return res.status(404).json({
        message: "Post not successfully published",
        error: "User not found",
      });
      const post = await this.model.create({
        title,
        content,
        tags,
        mature,
        hidden,
        privateRecipients,
        postedAt: Date.now(),
        activeAt: Date.now(),
        posterId: user.id,
        poster: user.username, //convert to ref eventually
      });
      await this.notifyUserFollowers(user.username + " posted a discussion", user, title, "/forum/post/" + post._id);
      await this.notifyUserMentions(content, user, title, "/forum/post/" + post._id);
      console.log(post);
      res.locals.clearCookie();
      res.status(201).json({
        message: "Post successfully published",
        id: post._id,
        title: post.title,
      });
      console.log("done!");
    } catch (error) {
      res.locals.clearCookie();
      res.status(400).json({
        message: "Post not successfully published",
        error: error.message,
      });
      console.log(error.message);
    }
  }

  async update(req, res, next) {
    var { title, content, tags, mature, hidden, privateRecipients } = req.body;
    console.log(title, content);
    try {
      const pid = req.params.id;
      const post = await this.model.findOne({ _id: pid });
      if (!post) return res.status(404).json({
        message: "Fetch not successful",
        error: "Post not found",
      });
      const user = res.locals.userToken;
      if (post.posterId !== user.id && user.role !== "Admin") return res.status(403).json({
        message: "Not Authorized. You do not own this post",
      });
      post.title = title;
      post.content = content;
      post.tags = tags;
      post.mature = mature;
      post.hidden = hidden;
      post.privateRecipients = privateRecipients;
      post.activeAt = Date.now();
      post.viewers = [];
      await post.save();
      res.status(201).json({
        message: "Post successfully updated",
        id: post._id,
        title: post.title,
      });
      console.log("done!");
    } catch (error) {
      res.status(400).json({
        message: "Post not successfully updated",
        error: error.message,
      });
      console.log(error.message);
    }
  };

  async delete(req, res, next) {
    try {
      const pid = req.params.id;
      const post = await this.model.findOne({ _id: pid });
      if (!post) return res.status(404).json({
        message: "Fetch not successful",
        error: "Post not found",
      });
      const user = res.locals.userToken;
      if (post.posterId !== user.id && user.role !== "Admin") return res.status(403).json({
        message: "Not Authorized. You do not own this post",
      });
      await this.model.deleteOne({_id: pid});
      // await post.remove();
      console.log("deleted " + pid);
      res.status(201).json({
        message: "Post successfully deleted",
        id: post._id,
        title: post.title,
      });
      console.log("done!");
    } catch (error) {
      res.status(400).json({
        message: "Post not successfully deleted",
        error: error.message,
      });
      console.log(error.message);
    }
  };

  async censor(data, res) {
    if (res.locals.userToken) {
      const uid = res.locals.userToken.id;
      var user = await Users.findOne({ _id: uid });
      if (user && user.mature) return data;
    }
    return JSON.parse(Profanity.censorText(JSON.stringify(data)));
  }

  async list(req, res, next) {
    try {
      var search = { hidden: false, mature: false };
      const { poster, platform, postedBefore, postedAfter, includeTags, excludeTags, featured, showMature, showHidden, recipient, customQuery } = req.query;
      if (poster) search.poster = poster;
      if (platform) search.platform = platform;
      interpretBool(search, "featured", featured);
      if (showMature == "true" || showMature == "1") delete search.mature;
      if (showHidden == "true" || showHidden == "1") delete search.hidden;
      // work out recipient search later
      if (postedBefore || postedAfter) {
        search.postedAt = {};
        if (postedBefore) search.postedAt.$lte = postedBefore;
        if (postedAfter) search.postedAt.$gte = postedAfter;
      }
      if (includeTags) {
        search.tags = { $all: includeTags.split("+") };
      }
      if (excludeTags) {
        excludeTags = excludeTags.split("+");
        search.$nor = [];
        for (var i = 0; i < excludeTags.length; i++) {
          search.$nor.push({ tags: excludeTags[i] });
        }
      }
      if (customQuery) search = JSON.parse(customQuery);
      var list = await this.model.find(search);
      list = list.map(e => e.pack());
      var data = {};
      data[this.name] = list;
      data = await this.censor(data, res);
      res.status(200).json(data);
    } catch (err) {
      res.status(401).json({ message: "Not successful", error: err.message });
      console.log(err.message);
    }
  };

  async search(req, res, next) {
    try {
      const { query, showMature, showHidden } = req.query;
      var search = { hidden: false, mature: false, $text: { $search: query } };
      if (showMature == "true" || showMature == "1") delete search.mature;
      if (showHidden == "true" || showHidden == "1") delete search.hidden;
      var list = await this.model.find(
        search,
        { relevance: { $meta: "textScore" } }
      ).sort({ relevance: { $meta: "textScore" } });
      list = list.map(e => {
        var c = e.pack();
        c.relevance = e.relevance;
        return c;
      });
      var data = {};
      data[this.name] = list;
      data = await this.censor(data, res);
      res.status(200).json(data);
    } catch (err) {
      res.status(401).json({ message: "Not successful", error: err.message });
      console.log(err.message);
    }
  };

  async data(req, res, next) {
    try {
      const pid = req.params.id;
      if (pid === "undefined") return res.status(400).json({ message: "Missing Project ID" });
      var post = await this.model.findOne({ _id: pid });
      if (!post) return res.status(404).json({
        message: "Fetch not successful",
        error: "Post not found",
      });
      var data = await this.censor(post.pack(), res);
      res.status(200).json(data);
    } catch (err) {
      res.status(401).json({ message: "Not successful", error: err.message });
      console.log(err.message);
    }
  };

  async feature(req, res, next) {
    try {
      const pid = req.params.id;
      const post = await this.model.findOne({ _id: pid });
      if (!post) return res.status(404).json({
        message: "Fetch not successful",
        error: "Post not found",
      });
      post.featured = true;
      await post.save();
      res.status(201).json({
        message: "Post successfully updated",
        id: post._id,
        title: post.title,
      });
      console.log("done!");
    } catch (error) {
      res.status(400).json({
        message: "Post not successfully updated",
        error: error.message,
      });
      console.log(error.message);
    }
  };

  async unfeature(req, res, next) {
    try {
      const pid = req.params.id;
      const post = await this.model.findOne({ _id: pid });
      if (!post) return res.status(404).json({
        message: "Fetch not successful",
        error: "Post not found",
      });
      post.featured = false;
      await post.save();
      res.status(201).json({
        message: "Post successfully updated",
        id: post._id,
        title: post.title,
      });
      console.log("done!");
    } catch (error) {
      res.status(400).json({
        message: "Post not successfully updated",
        error: error.message,
      });
      console.log(error.message);
    }
  };

  async comment(req, res, next) {
    var { content } = req.body;
    try {
      const pid = req.params.id;
      const post = await this.model.findOne({ _id: pid });
      if (!post) return res.status(404).json({
        message: "Fetch not successful",
        error: "Post not found",
      });
      const uid = res.locals.userToken.id;
      const user = await Users.findOne({ _id: uid });
      if (!user) return res.status(404).json({
        message: "Fetch not successful",
        error: "User not found",
      });
      post.activeAt = Date.now();
      post.viewers = [];
      post.comments.push({
        content,
        rating: 0,
        poster: user.username,
        posterId: user.id,
        postedAt: Date.now(),
      });
      await post.save();
      var link = this.name === "posts" ? "/forum/post/" + post._id : "/project/" + post._id;
      await this.notifyUserFollowers(user.username + " commented", user, title, link);
      await this.notifyUserMentions(content, user, title, link);
      // const owner = await Users.findOne({ _id: post.posterId });
      // if (!owner) return res.status(404).json({
      //   message: "Fetch not successful",
      //   error: "Owner not found",
      // });
      // var type = this.name === "posts" ? "discussion" : "project";
      // owner.notify(user.username + " commented on your " + type, post.name, link, user._id, user.username);
      // await owner.save();
      res.locals.clearCookie();
      res.status(201).json({
        message: "Post successfully updated",
        id: post._id,
        title: post.title,
      });
      console.log("done!");
    } catch (error) {
      res.locals.clearCookie();
      res.status(400).json({
        message: "Post not successfully updated",
        error: error.message,
      });
      console.log(error.message);
    }
  };

  async deleteComment(req, res, next) {
    var { index } = req.body;
    console.log(index);
    try {
      const pid = req.params.id;
      const post = await this.model.findOne({ _id: pid });
      if (!post) return res.status(404).json({
        message: "Fetch not successful",
        error: "Post not found",
      });
      const uid = res.locals.userToken.id;
      const user = await Users.findOne({ _id: uid });
      if (!user) return res.status(404).json({
        message: "Fetch not successful",
        error: "User not found",
      });
      var comment = post.comments[index];
      if (user.id !== comment.posterId && user.role !== "Admin") return res.status(404).json({
        message: "Delete not successful",
        error: "User does not own comment",
      });
      post.comments.splice(index, 1);
      await post.save();
      res.status(201).json({
        message: "Post successfully updated",
        id: post._id,
        title: post.title,
      });
      console.log("done!");
    } catch (error) {
      res.status(400).json({
        message: "Post not successfully updated",
        error: error.message,
      });
      console.log(error.message);
    }
  };

  async editComment(req, res, next) {
    var { content, index } = req.body;
    console.log(content, index);
    try {
      const pid = req.params.id;
      const post = await this.model.findOne({ _id: pid });
      if (!post) return res.status(404).json({
        message: "Fetch not successful",
        error: "Post not found",
      });
      const uid = res.locals.userToken.id;
      var comment = post.comments[index];
      if (uid !== comment.posterId) return res.status(404).json({
        message: "Edit not successful",
        error: "User does not own comment",
      });
      post.activeAt = Date.now();
      post.viewers = [];
      comment.content = content;
      await post.save();
      res.status(201).json({
        message: "Post successfully updated",
        id: post._id,
        title: post.title,
      });
      console.log("done!");
    } catch (error) {
      res.status(400).json({
        message: "Post not successfully updated",
        error: error.message,
      });
      console.log(error.message);
    }
  };

  async upvoteComment(req, res, next) {
    var { index } = req.query;
    console.log("upvote", index);
    try {
      const pid = req.params.id;
      const post = await this.model.findOne({ _id: pid });
      if (!post) return res.status(404).json({
        message: "Fetch not successful",
        error: "Post not found",
      });
      const uid = res.locals.userToken.id;
      var comment = index === "main" ? post : post.comments[index];
      if (comment.upvotes.includes(uid)) return res.status(404).json({
        message: "Upvote not successful",
        error: "Already upvoted",
      });
      comment.upvotes.push(uid);
      await post.save();
      res.status(201).json({
        message: "Post successfully updated",
        id: post._id,
        title: post.title,
      });
      console.log("done!");
    } catch (error) {
      res.status(400).json({
        message: "Post not successfully updated",
        error: error.message,
      });
      console.log(error.message);
    }
  };

  async downvoteComment(req, res, next) {
    var { index } = req.query;
    console.log("downvote", index);
    try {
      const pid = req.params.id;
      const post = await this.model.findOne({ _id: pid });
      if (!post) return res.status(404).json({
        message: "Fetch not successful",
        error: "Post not found",
      });
      const uid = res.locals.userToken.id;
      var comment = index === "main" ? post : post.comments[index];
      var voteindex = comment.upvotes.indexOf(uid);
      if (voteindex < 0) return res.status(404).json({
        message: "Downvote not successful",
        error: "Not upvoted",
      });
      comment.upvotes.splice(voteindex, 1);
      await post.save();
      res.status(201).json({
        message: "Post successfully updated",
        id: post._id,
        title: post.title,
      });
      console.log("done!");
    } catch (error) {
      res.status(400).json({
        message: "Post not successfully updated",
        error: error.message,
      });
      console.log(error.message);
    }
  };


}