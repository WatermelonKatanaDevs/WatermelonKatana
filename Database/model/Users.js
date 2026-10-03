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
  signedinbanner: {
    type: Boolean,
    default: false,
  },
  rolegradient: {
    type: Boolean,
    default: true,
  },
  verifiedbadge: {
    type: Boolean,
    default: false,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  showEmail: {
    type: Boolean,
    default: false,
  },
  anonymous: {
    type: Boolean,
    default: false,
  },
  anonname: {
    type: String,
    default: "",
    maxlength: 100,
  },
  // allowuserdata: {
  //   type: Boolean,
  //   default: false,
  // },
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
    name: {
      enabled: { type: Boolean, default: false },
      style: { type: String, default: "rainbow" },
      colors: [ String ],
      angle: { type: Number, default: 90 },
      speed: { type: Number, default: 6 },
    },
    role: {
      enabled: { type: Boolean, default: false },
      style: { type: String, default: "rainbow" },
      colors: [ String ],
      angle: { type: Number, default: 90 },
      speed: { type: Number, default: 6 },
    },
    avatar: {
      enabled: { type: Boolean, default: false },
      style: { type: String, default: "rainbow" },
      colors: [ String ],
      angle: { type: Number, default: 90 },
      speed: { type: Number, default: 6 },
      thickness: { type: Number, default: 4 },
      glow: { type: Boolean, default: false },
    },
    banner: {
      enabled: { type: Boolean, default: false },
      style: { type: String, default: "rainbow" },
      colors: [ String ],
      angle: { type: Number, default: 90 },
      speed: { type: Number, default: 6 },
      thickness: { type: Number, default: 4 },
      glow: { type: Boolean, default: false },
    },
  },
  notifications: [ NotificationSchema ],
}, {
  //strict: false,
  methods: {
    pack: function(full) {
      const container = {};
      container.username = this.username;
      container.emailVerified = this.emailVerified === true || (this.emailVerified === undefined && !!this.email);
      container.verified = container.emailVerified;
      container.showEmail = !!this.showEmail;
      if (full || this.showEmail) container.email = this.email || "";
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
      container.signedinbanner = this.signedinbanner;
      container.rolegradient = this.rolegradient;
      container.verifiedbadge = this.verifiedbadge;
      if (full) {
        container.anonymous = this.anonymous;
        container.anonname = this.anonname;
      }
      // container.allowuserdata = this.allowuserdata;
      container.avatarpos = this.avatarpos;
      container.bannerpos = this.bannerpos;
      container.flair = this.flair;
      container.id = this._id;
      if (full) {
        container.notifications = this.notifications;
      }
      return container;
    },
    anonpack: function() {
      return {
        username: this.anonname || ("anon-" + String(this._id).slice(-4)),
        verified: false,
        avatar: "/images/anon_pfp.png",
        banner: "/images/anon_banner.png",
        biography: "",
        badges: [],
        role: "Basic",
        favorites: [],
        following: [],
        followers: [],
        joinedAt: this.joinedAt,
        mature: false,
        signedinbanner: false,
        rolegradient: false,
        avatarpos: { x: 50, y: 50, zoom: 100 },
        bannerpos: { x: 50, y: 50, zoom: 100 },
        flair: {},
        anonymous: true,
        id: "anon-" + String(this._id).slice(-8),
      };
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
