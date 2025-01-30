const Users = require("../../Database/model/Users");
const Discussions = require("../../Database/model/Projects");
const Posts = require("../../Database/model/Posts");
const Media = require("../../Database/model/Media");
const Profanity = require("../../util/js/censored");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const jwtSecret = process.env["JWT_SECRET"];
exports.register = async (req, res, next) => {
  const { username, password } = req.body;
  if (!username.match(/^[\w\d_-]+$/)) return res.status(400).json({ message: "Username can only contain letters, numbers, and underscores" });
  if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
  if (Profanity.isProfane(username)) { return res.status(400).json({ message: "Oh no! This violates our TOS, please try another name" }) }
  try {
    var hash = await bcrypt.hash(password, 10);
    const user = await Users.create({
      username,
      password: hash,
      joinedAt: Date.now(),
    });
    const maxAge = 3 * 60 * 60; // 3hrs
    const token = jwt.sign(
      { id: user._id, username, role: user.role },
      jwtSecret,
      {
        expiresIn: maxAge,
      }
    );
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: maxAge * 1000,
    });
    res.status(201).json({
      message: "User successfully created",
      user: user._id,
      role: user.role,
    });
  } catch(error) {
    res.status(400).json({
      message: "User not successful created",
      error: error.message.includes("E11000") ? "as there is an account already with this name": error.message,
    });
  }
};

exports.login = async (req, res, next) => {
  const { username, password } = req.body;

  // Check if username and password is provided
  if (!username || !password) return res.status(400).json({
    message: "Username or Password not present",
  });
  try {
    const user = await Users.findOne({ username });
    if (!user) return res.status(404).json({
      message: "Login not successful",
      error: "User not found",
    });
    // comparing given password with hashed password
    var result = await bcrypt.compare(password, user.password);
    if (!result) return res.status(400).json({ message: "Login not succesful" });
    const maxAge = 3 * 60 * 60;
    const token = jwt.sign(
      { id: user._id, username, role: user.role },
      jwtSecret,
      {
        expiresIn: maxAge, // 3hrs in sec
      }
    );
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: maxAge * 1000, // 3hrs in ms
    });
    res.status(201).json({
      message: "User successfully Logged in",
      user: user._id,
      role: user.role,
    });
  } catch (error) {
    res.status(400).json({
      message: "An error occurred",
      error: error.message,
    });
  }
};

exports.update = async (req, res, next) => {
  const { username, avatar, banner, biography, mature } = req.body;
  if (!username.match(/^[\w\d_-]+$/)) return res.status(400).json({ message: "Username can only contain letters, numbers, and underscores" });
  if (Profanity.isProfane(username)) { return res.status(400).json({ message: "Oh no! This violates our TOS, please try another name" }) }
  const userId = res.locals.userToken?.id;
  console.log(req.body);
  try {
    const user = await Users.findById(userId);
    if (!user) return res.status(404).json({
      message: "User not found",
    });
    if (user.username !== username) {
      const postedProjects = await Projects.find({ posterId: userId });
      for (var i = 0; i < postedProjects.length; i++) {
        postedProjects[i].poster = username;
        await postedProjects[i].save();
      }
      const postedDiscussions = await Discussions.find({ posterId: userId });
      for (var i = 0; i < postedDiscussions.length; i++) {
        postedDiscussions[i].poster = username;
        await postedDiscussions[i].save();
      }
      const postedMedia = await Media.find({ posterId: userId });
      for (var i = 0; i < postedMedia.length; i++) {
        postedMedia[i].poster = username;
        await postedMedia[i].save();
      }
    }
    user.username = username;
    user.avatar = avatar;
    user.banner = banner;
    user.biography = Profanity.censorText(biography);
    user.mature = mature;
    await user.save();
    res.status(201).json({
      message: "Update successful",
      user 
    });
  } catch(error) {
    res.status(400).json({
      message: "An error occurred",
      error: error.message
    });
  };
};

exports.updateRole = async (req, res) => {
  const { role, id } = req.body;
  if (!role || !id) return res.status(400).json({ message: 'Role or Id not present' });

  try {
    const user = await Users.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.role = role;
    await user.save();

    res.status(200).json({ message: 'Role updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating role', error: error.message });
  }
};

async function cleanDeleteUser(res, user) {
  for (const id of user.favorites) {
    const p = await Projects.findById(id);
    if (p) {
      p.score--;
      await p.save();
    }
  }

  await Users.deleteOne({_id: user._id});
  //await user.remove();
  res.status(200).json({ message: 'User successfully deleted', user });
}

exports.deleteSelf = async (req, res, next) => {
  const { confirmationPswd } = req.body;
  const userId = res.locals.userToken?.id;
  
  try {
    const user = await Users.findById(userId);
    if (!user) return res.status(404).json({
      message: "User not found",
    });
  
    const isMatch = await bcrypt.compare(confirmationPswd, user.password);
    if (!isMatch) return res.status(400).json({
      message: "Confirmation password is incorrect",
    });
    
    res.cookie("jwt", "", { maxAge: "1" });
    await cleanDeleteUser(res,user);
  } catch(error) {
    res.status(400).json({ message: "An error occurred", error: error.message })
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ message: 'User ID not present' });

  try {
    const user = await Users.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await cleanDeleteUser(res, user);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

exports.listUsers = async (req, res, next) => {
  try {
    var search = {};
    if (req.query.role) search.role = req.query.role;
    if (req.query.customQuery) search = req.query.customQuery;
    var users = await Users.find(search);
    const list = users.map(e=>e.pack());
    res.status(200).json({ user: list });
  } catch(err) {
    res.status(401).json({ message: "Not successful", error: err.message });
  }
};

exports.check = async (req, res, next) => {
  try {
    if (!res.locals.userToken) return res.status(200).json({auth:false});
    const uid = res.locals.userToken.id;
    var user = await Users.findOne({ _id: uid });
    if (!user) return res.status(404).json({
      message: "Fetch not successful",
      error: "User not found",
    });
    user = user.pack();
    res.status(200).json({auth:true,user});
  } catch(err) {
    res.status(401).json({ message: "Not successful", error: err.message });
    console.log(err.message);
  }
};

async function getUser(req) {
  const username = req.query.username;
  const uid = req.query.id;
  if ((uid && username) || (!uid && !username)) return res.status(404).json({
    message: "Fetch not successful",
    error: "Wrong query information",
  });
  if (username) return await Users.findOne({ username });
  if (uid) return await Users.findOne({ _id: uid });
  return false;
}

exports.userdata = async (req, res, next) => {
  try {
    var user = await getUser(req);
    if (!user) return res.status(404).json({
      message: "Fetch not successful",
      error: "User not found",
    });
    user = user.pack();
    res.status(200).json(user);
  } catch(err) {
    res.status(401).json({ message: "Not successful", error: err.message });
    console.log(err.message);
  }
};

exports.changePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const userId = res.locals.userToken?.id;
  
  if (!userId || !currentPassword || !newPassword) return res.status(400).json({
    message: "User ID, current password, and new password are required",
  });

  if (newPassword.length < 6) return res.status(400).json({
    message: "New password should be at least 6 characters long",
  });

  try {
    const user = await Users.findById(userId);
    if (!user) return res.status(404).json({
      message: "User not found",
    });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({
      message: "Current password is incorrect",
    });

    const hash = await bcrypt.hash(newPassword, 10);
    user.password = hash;
    await user.save();

    res.status(200).json({
      message: "Password successfully changed",
    });
  } catch (error) {
    res.status(400).json({
      message: "An error occurred",
      error: error.message,
    });
  }
};

exports.follow = async (req, res, next) => {
  try {
    var user = await getUser(req);
    if (!user) return res.status(404).json({
      message: "Fetch not successful",
      error: "User not found",
    });
    const uid = user._id;
    const sid = res.locals.userToken.id;
    if (uid === sid) return res.status(404).json({
      message: "Follow not successful",
      error: "You cannot follow yourself",
    });
    var self = await Users.findOne({ _id: sid });
    if (!self) return res.status(404).json({
      message: "Fetch not successful",
      error: "Self not found",
    });
    var uinc = user.followers.includes(sid);
    var sinc = self.following.includes(uid);
    if (uinc && sinc) return res.status(400).json({
      message: "Invalid",
      error: "Already following user",
    });
    if (!uinc) user.followers.push(sid);
    if (!sinc) self.following.push(uid);
    user.notify(self.username+" started following you!","","/user/"+self.username,sid,self.username);
    await Promise.all([user.save(),self.save()]);
    res.status(201).json({
      message: "Follow successful",
      user: self
    });
  } catch(error) {
    res.status(400).json({
      message: "An error occurred",
      error: error.message
    });
  };
};

exports.unfollow = async (req, res, next) => {
  try {
    var user = await getUser(req);
    if (!user) return res.status(404).json({
      message: "Fetch not successful",
      error: "User not found",
    });
    const uid = user._id;
    const sid = res.locals.userToken.id;
    var self = await Users.findOne({ _id: sid });
    if (!self) return res.status(404).json({
      message: "Fetch not successful",
      error: "Self not found",
    });
    var uindex = user.followers.indexOf(sid);
    var sindex = self.following.indexOf(uid);
    if (uindex === -1 && sindex === -1) return res.status(400).json({
      message: "Invalid",
      error: "Not following user",
    });
    if (uindex !== -1) user.followers.splice(uindex,1);
    if (sindex !== -1) self.following.splice(sindex,1);
    await Promise.all([user.save(),self.save()]);
    res.status(201).json({
      message: "Unfollow successful",
      user: self
    });
  } catch(error) {
    res.status(400).json({
      message: "An error occurred",
      error: error.message
    });
  };
};

exports.openNotification = async (req, res) => {
  var { index } = req.params;
  try {
    const uid = res.locals.userToken.id;
    var user = await Users.findOne({ _id: uid });
    if (!user) return res.status(404).json({
      message: "Not successful",
      error: "User not found",
    });
    var notif = user.notifications[index];
    if (!notif) return res.status(404).json({
      message: "Not successful",
      error: "Notification not found",
    });
    user.notifications.splice(index,1);
    await user.save();
    res.redirect(notif.link);
  } catch(err) {
    res.status(401).json({ message: "Not successful", error: err.message });
    console.log(err.message);
  }
};