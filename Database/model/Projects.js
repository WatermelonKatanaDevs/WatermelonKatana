const Mongoose = require("mongoose");

const CommentSchema = require("./Comments");

const ProjectSchema = new Mongoose.Schema({
  title: {
    type: String,
    minlength: 2,
    required: true,
    maxlength: 100,
  },
  link: {
    type: String,
    minlength: 6,
    required: true,
  },
  thumbnail: {
    type: String,
    default: "",
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
  verified: {
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
  score: {
    type: Number,
    default: 0,
  },
  views: {
    type: Number,
    default: 0,
  },
  plays: {
    type: Number,
    default: 0,
  },
  viewers: [ String ],
  playCooldowns: {
    type: Map,
    of: Number,
    default: {},
  },
  upvotes: [ String ],
  gamejam: {
    type: String,
    default: "none",
  },
  platform: {
    type: String,
    default: "embed",
  },
  editorProject: {
    type: Boolean,
    default: false,
  },
  editorRepository: {
    type: String,
    default: "",
  },
  editorDeployment: {
    thirdParty: {
      type: Boolean,
      default: false,
    },
    branch: String,
    commit: String,
    path: String,
    externalUrl: String,
  },
  optimalViewSize: {
    enabled: { type: Boolean, default: false },
    width: { type: Number, default: 1 },
    height: { type: Number, default: 1 },
    mode: { type: String, enum: ["ratio", "fixed"], default: "ratio" },
  },
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
  //strict:false,
  methods: {
    pack: function() {
      const container = {};
      container.title = this.title;
      container.link = this.link;
      container.content = this.content;
      container.featured = this.featured;
      container.verified = this.verified;
      container.thumbnail = this.thumbnail;
      container.tags = this.tags || [];
      container.mature = this.mature;
      container.hidden = this.hidden;
      container.privateRecipients = this.privateRecipients;
      container.score = this.score;
      container.views = this.views;
      container.plays = this.plays;
      container.viewers = this.viewers;
      container.upvotes = this.upvotes;
      container.gamejam = this.gamejam;
      container.comments = this.comments;
      container.platform = this.platform;
      container.editorProject = this.editorProject;
      container.editorRepository = this.editorRepository;
      if (this.editorDeployment) {
        const deployment = this.editorDeployment.toObject
          ? this.editorDeployment.toObject()
          : { ...this.editorDeployment };
        container.editorDeployment = {
          thirdParty: deployment.thirdParty === true,
          externalUrl: String(deployment.externalUrl || ''),
          branch: String(deployment.branch || ''),
          commit: String(deployment.commit || ''),
          path: String(deployment.path || '/')
        };
      } else {
        container.editorDeployment = null;
      }
      container.optimalViewSize = {
        enabled: !!this.optimalViewSize?.enabled,
        width: Number(this.optimalViewSize?.width) || 1,
        height: Number(this.optimalViewSize?.height) || 1,
        mode: this.optimalViewSize?.mode === "fixed" ? "fixed" : "ratio",
      };
      container.postedAt = this.postedAt;
      container.activeAt = this.activeAt;
      container.id = this._id;
      container.posterId = this.posterId;
      container.poster = this.poster;
      return container;
    }
  }
});

ProjectSchema.index({
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
  name: "project search"
});

const Projects = Mongoose.model("project", ProjectSchema);

Projects.on('index',console.log);

module.exports = Projects;