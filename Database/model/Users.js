const Mongoose = require("mongoose");

const NotificationSchema = new Mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    default: "",
  },
  link: {
    type: String,
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
  createdAt: {
    type: Number,
    required: true,
  },
});

const UserSchema = new Mongoose.Schema({
  username: {
    type: String,
    unique: true,
    collation: {
      locale: 'en',
      strength: 2
    },
    required: true,
    maxlength: 100,
  },
  email: {
    type: String,
    unique: true,
    maxlength: 500,
  },
  password: {
    type: String,
    minlength: 6,
    required: true,
  },
  avatar: {
    type: String,
    default: "/images/default_pfp.png",
    maxlength: 1000
  },
  banner: {
    type: String,
    default: "/images/default_banner.png",
    maxlength: 1000
  },
  biography: {
    type: String,
    default: "You can change your bio by going to your profile settings!",
    maxlength: 5000
  },
  badges: [ Number ],
  role: {
    type: String,
    default: "Basic",
    required: true,
  },
  favorites: [ String ],
  following: [ String ],
  followers: [ String ],
  joinedAt: {
    type: Number,
    required: true,
  },
  mature: {
    type: Boolean,
    default: false,
  },
  avatarpos: {
    x: { type: Number, default: 50 },
    y: { type: Number, default: 50 },
    zoom: { type: Number, default: 100 },
  },
  bannerpos: {
    x: { type: Number, default: 50 },
    y: { type: Number, default: 50 },
    zoom: { type: Number, default: 100 },
  },
  flair: {
    target: { type: String, default: "none" },
    style: { type: String, default: "rainbow" },
    color1: { type: String, default: "#ff5f6d" },
    color2: { type: String, default: "#4facfe" },
  },
  notifications: [ NotificationSchema ],
}, {
  //strict: false,
  methods: {
    pack: function(full) {
      const container = {};
      container.username = this.username;
      container.verified = !!this.email;
      container.avatar = this.avatar;
      container.banner = this.banner;
      container.biography = this.biography;
      container.badges = this.badges;
      container.role = this.role;
      container.favorites = this.favorites;
      container.following = this.following;
      container.followers = this.followers;
      container.joinedAt = this.joinedAt;
      container.mature = this.mature;
      container.avatarpos = this.avatarpos;
      container.bannerpos = this.bannerpos;
      container.flair = this.flair;
      container.id = this._id;
      if (full) {
        container.notifications = this.notifications;
      }
      return container;
    },
    notify: function(title,content,link,posterId,poster) {
      this.notifications.push({ 
        title,
        content,
        link,
        posterId,
        poster,
        createdAt: Date.now()
      });
    }
  }
});

const Users = Mongoose.model("user", UserSchema);

module.exports = Users;
