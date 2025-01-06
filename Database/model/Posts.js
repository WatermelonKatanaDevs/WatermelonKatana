
const Mongoose = require("mongoose");

const CommentSchema = require("./Comments");

/*
  TODO: Find a way to implement slugs for posts

  const PostSchema = new Mongoose.Schema({
    title: { type, String, required: true, minlength: 2, maxlength: 100 },
    content: { type: String, default: "", maxlength: 15000 },
    boardSlug: { type: String, required: true },
    tags: [ String ],
    reported: { type: Boolean, default: false },
    createdAt: { type: Number, required: true },
*/

const PostSchema = new Mongoose.Schema({
  title: {
    type: String,
    minlength: 2,
    required: true,
    maxlength: 100,
  },
  content: {
    type: String,
    default: "",
    maxlength: 15000,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  tags: [ String ],
  mature: {
    type: Boolean,
    default: false,
  },
  hidden: {
    type: Boolean,
    default: false,
  },
  privateRecipients: [ String ],
  views: {
    type: Number,
    default: 0,
  },
  viewers: [ String ],
  upvotes: [ String ],
  postedAt: {
    type: Number,
    required: true,
  },
  activeAt: {
    type: Number,
    required: true,
  },
  posterId: {
    type: String,
    required: true,
  },
  poster: {
    type: String,
    required: true,
  },
  /*poster: {
    type: Mongoose.ObjectId,
    ref: "user",
  },*/
  comments: [ CommentSchema ]
},{
  //strict: false,
  methods: {
    pack: function() {
      const container = {};
      container.title = this.title;
      container.content = this.content;
      container.featured = this.featured;
      container.tags = this.tags || [];
      container.mature = this.mature;
      container.hidden = this.hidden;
      container.privateRecipients = this.privateRecipients;
      container.views = this.views;
      container.viewers = this.viewers;
      container.upvotes = this.upvotes;
      container.comments = this.comments;
      container.platform = this.platform;
      container.postedAt = this.postedAt;
      container.activeAt = this.activeAt;
      container.id = this._id;
      container.posterId = this.posterId;
      container.poster = this.poster;
      return container;
    }
  }
});

PostSchema.index({
  title: "text", 
  content: "text",
  poster: "text",
  tags: "text",
},{
  weights: {
    title: 5, 
    content: 2,
    poster: 2,
    tags: 3,
  },
  name: "post search"
});

const Posts = Mongoose.model("post", PostSchema);

Posts.on('index',console.log);

module.exports = Posts;