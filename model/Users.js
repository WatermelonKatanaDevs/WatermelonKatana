const Mongoose = require("mongoose");

const UserSchema = new Mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    minlength: 6,
    required: true,
  },
  /*
  avatar: {
    type: String,
    default: "https://fakeimg.pl/300x300",
    required: true,
  },
  banner: {
    type: String,
    default: "https://fakeimg.pl/720x360",
    required: true,
  },
  biography: {
    type: String,
    default: "This user has not added a biography yet.",
    required: true,
  },
  badges: [ number ],
  */
  role: {
    type: String,
    default: "Basic",
    required: true,
  },
  favorites: [ String ],
}, {
  methods: {
    pack: function() {
      const container = {};
      container.username = this.username;
      container.role = this.role;
      container.id = this._id;
      container.favorites = this.favorites;
      return container;
    }
  }
});

const Users = Mongoose.model("user", UserSchema);

module.exports = Users;
