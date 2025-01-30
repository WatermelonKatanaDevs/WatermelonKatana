/*
  External Modules
*/
const express = require("express");
const cookieParser = require("cookie-parser");
const RateLimit = require("express-rate-limit");

/*
  Local Modules
*/
const makeLiteralChars = require('./util/js/makeLiteralChars');
const { logInfo, logDebug, logError, logWarn } = require('./util/js/logger');

const connectDB = require("./Database/connect");
const { adminAuth, userAuth, checkAuth, makeFormToken } = require("./Middleware/auth");
const sendFileReplace = require("./Middleware/replace");
const { Turbo } = require("./Turbo/index");

/*
  Constants
*/
const app = express();
const PORT = process.env.PORT || 3000;

/**
  Rate Limiting
  Should be 5 requests per second, until we can implement a more robust solution.
 */
const limiter = RateLimit({
  windowMs: 1000,
  max: 100,
  message: "Too many requests from this IP, please try again after 15 minutes",
});

/*
  Database Connection
*/
connectDB();

/*
  Middleware setup
*/
const bigPaths = new RegExp(`^/datablock_storage/[^/]+/(${["populate_key_values", "populate_tables"].join("|")})`);
app.use((req, res, next) => {
  const maxSize = req.path.match(bigPaths) !== null ? "10mb": "100kb";
  express.json({limit: maxSize})(req, res, next);
}); // Parse JSON request bodies
app.use(cookieParser()); // Parse cookies attached to the Client request

/**
 * Rate limiting middleware
 */
app.use(limiter);

/**
 * Serve static files from the Client directory
 */
app.use(express.static(__dirname + "/Assets"));

/**
 * Initialize TurboWarp with static dependencies
 */
const turbo = new Turbo(app, express.static("./Turbo/dependencies"));

/**
 * Define API routes
 */
app.use("/api/auth", require("./API/Auth/route")); // Authentication routes
app.use("/api/project", require("./API/Project/route")); // Project routes
app.use("/api/forum", require("./API/Forum/route")); // Project routes
app.use("/api/media", require("./API/Media/route")); // Media routes
app.use("/api/admin", require("./API/Admin/route")); // Admin command routes

/**
 * Client directory path
 */
const cldir = __dirname + "/Pages";

/**
 * Define route handlers for serving HTML files
 */
app.get("/", (req, res) => res.sendFile(cldir + "/home.html")); // Home page
app.get("/register", makeFormToken, (req, res) => res.sendFile(cldir + "/users/auth/register.html")); // Registration page
app.get("/login", (req, res) => res.sendFile(cldir + "/users/auth/login.html")); // Login page

/**
 * WatermelonKatana open-source libraries
 */
app.get("/lib/meloncanvas.js", (req, res) => res.sendFile(__dirname + "/lib/meloncanvas.js")); // MelonCanvas library

/**
 * WatermelonKatana FAQ pages
 */
app.get("/faq", (req, res) => res.sendFile(cldir + "/faq/faq.html")); // Faq

// Logout route: clear the JWT cookie and redirect to home
app.get("/logout", (req, res) => {
  res.cookie("jwt", "", { maxAge: "1" });
  res.redirect("/");
});

// Chat page, users only
app.get("/chat", userAuth, (req, res) => res.sendFile(cldir + "/chat.html"));

// Admin page, admins only
app.get("/admin", adminAuth, (req, res) => res.sendFile(cldir + "/users/admin.html"));
// Basic user page, users only
app.get("/userlist", userAuth, (req, res) => res.sendFile(cldir + "/users/list.html"));

// Media list
app.get("/uploadedmedia", (req, res) => res.sendFile(cldir + "/media.html"));

const Users = require("./Database/model/Users"); // Users

// Projects
app.get("/gamejams", (req, res) => res.sendFile(cldir + "/projects/gamejams.html")); // game jam page
app.get("/search", (req, res) => res.sendFile(cldir + "/projects/search.html")); // Search page
app.get("/publish", userAuth, makeFormToken, (req, res) => res.sendFile(cldir + "/projects/publish.html")); // Publish page, users only
const Projects = require("./Database/model/Projects");
app.get("/project/:id", checkAuth, async (req, res) => {
  // Project page with dynamic project ID
  var proj = await Projects.findOne({ _id: req.params.id });
  if (!proj) return res.status(404).sendFile(cldir + "/404.html");
  var tok = res.locals.userToken;
  var user = await Users.findOne({ _id: tok.id });
  if (proj.mature && (!tok || !user || !user.mature)) return res.status(403).sendFile(__dirname+"/Middleware/403.html");
  if (tok && !proj.viewers.includes(tok.id)) proj.viewers.push(tok.id);
  proj.views++;
  sendFileReplace(res, "./Pages/projects/project.html", (s) => s.replace("<!--og:meta-->",`
    <meta property="og:title" content="${makeLiteralChars(proj.title)}"/>
    <meta property="og:type" content="website"/>
    <meta property="og:image" content="${proj.thumbnail}"/>
    <meta property="og:description" content="${makeLiteralChars(proj.content)} \n By: ${proj.poster} \n Score: ${proj.score} Views: ${proj.views}"/>
  `).replace("<!--content-->",`
    ${makeLiteralChars(proj.title)}<br>
    By: ${proj.poster}<br>
    ${makeLiteralChars(proj.content)}<br>
    <a href="${proj.link}">${proj.link}</a><br>
    ${proj.tags.map(v=>"#"+v).join(", ")}<br>
    Score: ${proj.score} Views: ${proj.views} Platform: ${proj.platform} Featured: ${proj.featured}
  `).replace("<!--title-->",`
    <title>${makeLiteralChars(proj.title)} | WatermelonKatana</title>
  `));
  await proj.save();
});
app.get("/project/:id/edit", userAuth, async (req, res) => {
  const project = await Projects.findOne({ _id: req.params.id });
  const tok = res.locals.userToken;
  if (!tok || (project.posterId !== tok.id && tok.role !== "Admin")) 
    return res.status(403).sendFile(__dirname+"/Middleware/403.html");
  res.sendFile(cldir + "/projects/edit.html");
}); // Edit project page, users only
app.get("/project/:id/delete", userAuth, (req, res) => res.redirect("/api/project/delete/" + req.params.id)); // Delete project route, users only

// Authors
app.get("/authors", (req, res) => { res.sendFile(cldir + "/authors.html") });

// Posts
app.get("/forum", (req, res) => res.sendFile(cldir + "/forum/home.html")); // Forum Home/Search
app.get("/forum/post", userAuth, makeFormToken, (req, res) => res.sendFile(cldir + "/forum/publish.html")); // Publish page, users only
const Posts = require("./Database/model/Posts"); // Post page with dynamic post ID
app.get("/forum/discussion/:id", checkAuth, async (req, res) => {
  var post = await Posts.findOne({ _id: req.params.id });
  if (!post) return res.status(404).sendFile(cldir + "/404.html");
  var tok = res.locals.userToken;
  var user = await Users.findOne({ _id: tok.id });
  if (post.mature && (!tok || !user || !user.mature)) return res.status(403).sendFile(__dirname+"/Middleware/403.html");
  if (tok && !post.viewers.includes(tok.id)) post.viewers.push(tok.id);
  post.views++;
  sendFileReplace(res, "./Pages/forum/discussion.html", (s) => s.replace("<!--og:meta-->",`
    <meta property="og:title" content="${makeLiteralChars(post.title)}"/>
    <meta property="og:type" content="website"/>
    <meta property="og:description" content="${makeLiteralChars(post.content)} \n By: ${post.poster} \n Views: ${post.views}"/>
  `).replace("<!--content-->",`
    ${makeLiteralChars(post.title)}<br>
    By: ${post.poster}<br>
    ${makeLiteralChars(post.content)}<br>
    ${post.tags.map(v=>"#"+v).join(", ")}<br>
    Views: ${post.views} Featured: ${post.featured}
  `).replace("<!--title-->",`
    <title>${makeLiteralChars(post.title)} | WatermelonKatana Forum</title>
  `));
  await post.save();
});
app.get("/forum/discussion/:id/edit", userAuth, async (req, res) => {
  const post = await Posts.findOne({ _id: req.params.id });
  const tok = res.locals.userToken;
  if (!tok || (post.posterId !== tok.id && tok.role !== "Admin")) 
    return res.status(403).sendFile(__dirname+"/Middleware/403.html");
  res.sendFile(cldir + "/forum/edit.html");
}); // Edit post page, users only
app.get("/forum/discussion/:id/delete", userAuth, (req, res) => res.redirect("/api/forum/delete/" + req.params.id)); // Delete post route, users only

// User profile page with dynamic user name
app.get("/user/:name", async (req, res) => {
  var user = await Users.findOne({ username: req.params.name });
  if (!user) {
    res.status(404).sendFile(cldir + "/404.html");
    return;
  }
  sendFileReplace(res, "./Pages/users/user.html", (s) => s.replace("<!--og:meta-->",`
    <meta property="og:title" content="@${user.username} on WatermelonKatana"/>
    <meta property="og:type" content="website"/>
    <meta property="og:image" content="${user.avatar}"/>
    <meta property="og:description" content="${makeLiteralChars(user.biography)}"/>
  `).replace("<!--content-->",`
    ${user.username}<br>
    ${makeLiteralChars(user.biography)}<br>
    ${user.badges.join(", ")}<br>
    Role: ${user.role}
  `).replace("<!--title-->",`
    <title>${user.username} | WatermelonKatana</title>
  `));
});

// User self profile page, users only
app.get("/profile/edit", userAuth, (req, res) => res.sendFile(cldir + "/users/profile/edit.html"));
app.get("/profile/chpass", userAuth, (req, res) => res.sendFile(cldir + "/users/profile/chpass.html"));
app.get("/profile/verify", (req, res) => res.sendFile(cldir + "/users/profile/verification.html"));
app.get("/verified", (req, res) => res.sendFile(cldir + "/users/profile/verified.html"));
app.get("/resetpass/email", (req, res) => res.sendFile(cldir + "/users/profile/emailresetpass.html"));
app.get("/resetpass", (req, res) => res.sendFile(cldir + "/users/profile/resetpass.html"));
app.get("/verified", (req, res) => res.sendFile(cldir + "/users/profile/verified.html"));
// Notification
const { openNotification } = require("./API/Auth/auth");
app.get("/notification/:index", userAuth, openNotification);
// Report
const { openReport } = require("./API/Admin/admin");
app.get("/report/:id", adminAuth, openReport);

app.get('/sitemap.xml', async (req, res) => {
  const projects = await Projects.find({ hidden: false });
  const posts = await Posts.find({ hidden: false });
  const users = await Users.find({});

  var dynamics = `
  ${projects.map((e) => `
   <url>
    <loc>https://watermelonkatana.com/project/${e.id}/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
   </url>
  `).join('\n')}
  ${posts.map((e) => `
   <url>
    <loc>https://watermelonkatana.com/forum/discussion/${e.id}/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
   </url>
  `).join('\n')}
  ${users.map((e) => `
   <url>
    <loc>https://watermelonkatana.com/user/${e.username}/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
   </url>`).join('\n')}`;
  res.set('Content-Type', 'application/xml');
  sendFileReplace(res, './Pages/sitemap.xml', (s) => s.replace('<!--dynamics-->', dynamics), true);
})

// TurboWarp page
//app.get("/turbowarp", (req, res) => res.sendFile(cldir + "/turbowarp/index.html"));

// API Pages
app.get("/api", (req, res) => res.sendFile(cldir + "/api.txt"));
app.use("/api", (req, res) => res.status(404).json({ error:"Error: API Not Found", message:"404 Error. This API does not exist, check /api for a list of supported APIs" }));

/**
 * Start the server and listen on the specified port
 */
const server = app.listen(PORT, () => {
  console.log(logInfo(`Server running on port ${PORT}`));
});

// 404 response page
app.use((req, res) => res.status(404).sendFile(cldir + "/404.html"));

// Set server timeout to 30 seconds
server.setTimeout(30000);

/**
 * Handle unhandled promise rejections
 */
process.on("unhandledRejection", (err) => {
  console.log(logError(`An error occurred: ${err.message}`));
  console.log(logDebug(err));
  // server.close(() => process.exit(1));
});
