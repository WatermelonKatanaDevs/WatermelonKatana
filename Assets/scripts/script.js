location.path = location.pathname.split("/");
if (localStorage.getItem("color-scheme") === null) {
  localStorage.setItem("color-scheme", window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
}
if (localStorage.getItem("cursor-scheme") === null) {
  localStorage.setItem("cursor-scheme", "default");
}
document.addEventListener("DOMContentLoaded", updateColorScheme.bind(this, null));
document.addEventListener("DOMContentLoaded", updateCursorScheme.bind(this, null));
var _authCache = false;
var _authwaiting = [];

function getAuth() {
  return new Promise(async (resolve) => {
    if (_authCache) return resolve(_authCache);
    _authwaiting.push(resolve);
    if (_authwaiting.length > 1) return;
    const res = await fetch("/api/auth/check");
    const data = await res.json();
    if (res.status > 206) throw Error(data);
    for (var i = 0; i < _authwaiting.length; i++) _authwaiting[i](data);
    _authCache = data;
    if (data.user) {
      _userCache[data.user.id] = data.user;
      let schema = data.user["color-scheme"]
      if (typeof schema === "string" && schema !== localStorage.getItem("color-scheme")) {
        updateColorScheme(schema);
      }
    }
  });
}

var _userCache = {};
async function getUser(id) {
  if (_userCache[id]) return _userCache[id];
  var res = await fetch("/api/auth/userdata?id=" + id);
  var u = await res.json();
  if (u.error) u = { "username": "Deleted User", "verified": false, "avatar": "/images/default_pfp.png", "banner": "/images/default_banner.png", "biography": "Deleted user.", "badges": [], "role": "Basic", "favorites": [], "following": [], "followers": [], "joinedAt": 0, "mature": false, "notifications": [], "id": id };
  _userCache[id] = u;
  return u;
}

// Answer is reversed because base color schemes are swapped https://mybyways.com/blog/forcing-dark-mode-with-prefs-color-scheme-media-query
function updateColorScheme(pref) {
  pref = pref || localStorage.getItem("color-scheme");
  localStorage.setItem("color-scheme", pref);
  for (var s = 0; s < document.styleSheets.length; s++) {
    for (var i = 0; i < document.styleSheets[s].cssRules.length; i++) {
      rule = document.styleSheets[s].cssRules[i];
      if (rule && rule.media && rule.media.mediaText.includes("prefers-color-scheme")) {

        switch (pref) {
          case "light":
            rule.media.appendMedium("(prefers-color-scheme: light)");
            rule.media.appendMedium("(prefers-color-scheme: dark)");
            if (rule.media.mediaText.includes("original")) rule.media.deleteMedium("original-prefers-color-scheme");
            break;
          case "dark":
            rule.media.appendMedium("original-prefers-color-scheme");
            if (rule.media.mediaText.includes("light")) rule.media.deleteMedium("(prefers-color-scheme: light)");
            if (rule.media.mediaText.includes("dark")) rule.media.deleteMedium("(prefers-color-scheme: dark)");
            break;
        }
      }
    }
  }
}

function updateCursorScheme(pref) {
  pref = pref || localStorage.getItem("cursor-scheme");
  localStorage.setItem("cursor-scheme", pref);
  switch (pref) {
    case "default":
      stylesheet = document.head.querySelector("#cursorPref");
      stylesheet?.remove();
      break;
    case "none":
      stylesheet = document.createElement("style");
      stylesheet.id = "cursorPref"
      stylesheet.innerText = `:root {--cursor: default; --cursor-pointer: pointer;}`;
      document.head.appendChild(stylesheet);
      break;
  }
}

function relativeDate(time) {
  var seconds = (Date.now() - time) / 1000;

  if (time == 0) return "never";

  var interval = Math.floor(seconds / (365.25 * 24 * 60 * 60));
  if (interval == 1) return "1 year ago";
  else if (interval > 1) return interval + " years ago";

  interval = Math.floor(seconds / (30.4375 * 24 * 60 * 60));
  if (interval == 1) return "1 month ago";
  else if (interval > 1) return interval + " months ago";

  interval = Math.floor(seconds / (7 * 24 * 60 * 60));
  if (interval == 1) return "1 week ago";
  else if (interval > 1) return interval + " weeks ago";

  interval = Math.floor(seconds / (24 * 60 * 60));
  if (interval == 1) return "1 day ago";
  else if (interval > 1) return interval + " days ago";

  interval = Math.floor(seconds / (60 * 60));
  if (interval == 1) return "1 hour ago";
  else if (interval > 1) return interval + " hours ago";

  interval = Math.floor(seconds / (60));
  if (interval == 1) return "1 minute ago";
  else if (interval > 1) return interval + " minutes ago";

  interval = Math.floor(seconds);
  if (interval == 1) return "1 second ago";
  return interval + " seconds ago";

  //return new Date(time).toUTCString();
}

function makeLiteralChars(string) {
  string = string.replace(/\&/g, "&amp;");
  string = string.replace(/</g, "&lt;");
  string = string.replace(/>/g, "&gt;");
  string = string.replace(/"/g, "&quot;");
  string = string.replace(/'/g, "&apos;");
  //string = string.replace(/ /g,"&nbsp;");
  return string;
}

function convertMarkdown(string) {
  string = makeLiteralChars(string);
  var escapable = "*_~`()[]\\!#@";
  for (var i = 0; i < escapable.length; i++) {
    string = string.replaceAll("\\" + escapable[i], "&#" + escapable.charCodeAt(i) + ";"); // make certain characters escapable
  }
  string = string.replace(/(?<![\[\(][^\]\)]+)\*\*([^*\n]+)\*\*/g, "<b>$1</b>"); // **bold**
  string = string.replace(/(?<![\[\(][^\]\)]+)\*([^*\n]+)\*/g, "<i>$1</i>"); // *italics*
  string = string.replace(/(?<![\[\(][^\]\)]+)__([^_\n]+)__/g, "<u>$1</u>"); // __underline__
  string = string.replace(/(?<![\[\(][^\]\)]+)_([^_\n]+)_/g, "<i>$1</i>"); // _italics_
  string = string.replace(/(?<![\[\(][^\]\)]+)~~([^~\n]+)~~/g, "<s>$1</s>"); // ~~strikethrough~~
  string = string.replace(/^-# ([^\n]+)$/gm, "<sub>$1</sub>"); // -# subtext
  string = string.replace(/^# ([^\n]+)$/gm, "<h1>$1</h1>"); // # header 1
  string = string.replace(/^## ([^\n]+)$/gm, "<h2>$1</h2>"); // # header 2
  string = string.replace(/^### ([^\n]+)$/gm, "<h3>$1</h3>"); // # header 3
  string = string.replace(/!\[([^\]"'>]*)\]\(((?:https?:\/\/|\/api\/media\/)[^\)"]+)\)/g, function (match, alt, url) {
    var attrs = "";
    var dims = alt.match(/(?:width|height)\s*=\s*\d+/g);
    if (dims) {
      for (var i = 0; i < dims.length; i++) {
        var pair = dims[i].split("=");
        attrs += " " + pair[0].trim() + '="' + parseInt(pair[1], 10) + '"';
      }
    }
    return '<img src="' + makeLiteralChars(url) + '"' + attrs + '>';
  }); // ![width=50 height=50](https://example.com/image)
  string = string.replace(/\[([^\]\n]+)\]\((https?:\/\/[^\)"\n]+)\)/g, `<a href="$2">$1</a>`); // [link](https://example.com)
  string = string.replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, `<a href="mailto:$1">$1</a>`); // user@example.com
  string = string.replace(/(?<![^\s])@([^\s]+)/g, `<a href="/user/$1">@$1</a>`); // @Username
  string = string.replace(/\n/g, "<br>"); // line breaks
  // still need to add: block quotes, lists, code, spoilers
  return string;
}

function previewContent(str, len) {
  return makeLiteralChars(str).replace(/\n[^]*$/, "").slice(0, len) + ((str.includes("\n") || str.length > len) ? "..." : "");
}

function authorpfp(anchor, posterId) {
  getUser(posterId).then((u) => {
    const pfp = anchor.querySelector(".author-pfp");
    if (pfp && u) pfp.innerHTML = focalimg(u.avatar || "/images/blank_project.png", u.avatarpos);
  });
}

function projHTML(list, tok) {
  return function (proj) {
    let classes = (proj.featured ? " featured" : "") + (proj.posterId == tok?.user?.id ? " published" : "") + (tok?.user?.favorites.includes(proj.id) ? " favorited" : "");
    const a = document.createElement("a");
    a.className = "project-panel";
    a.href = "/project/" + proj.id;
    if (proj.viewers.includes(tok?.user?.id)) a.style.color = "var(--palette-text-viewed)";
    a.innerHTML = `
      <div class="thumbnail-border ${classes}">
        <div class="panel-overlay">
          <div>Score: ${proj.score} Views: ${proj.views}</div>
          <div>${tagHTML(proj.tags)}</div>
        </div>
        <img class="project-thumbnail" src="${proj.thumbnail || "/images/blank_project.png"}" alt="">
      </div>
      <div class="project-link">${previewContent(proj.title, 100)}</div>
      <div>By: <object><a href="/user/${proj.poster}"><span class="comment-avatar author-pfp"></span><i>${proj.poster}</i></a></object></div>`;
    list.appendChild(a);
    const thumb = a.querySelector(".project-thumbnail");
    if (!thumb.getAttribute("src")) thumb.src = "/images/blank_project.png";
    authorpfp(a, proj.posterId);
  };
}

function forumHTML(list, tok) {
  return function (post) {
    const a = document.createElement("a");
    a.className = "post-panel";
    a.href = "/forum/discussion/" + post.id;
    if (post.viewers.includes(tok?.user?.id)) a.style.color = "var(--palette-text-viewed)";
    a.innerHTML = `
      <div class="post-top">
        <h2>${previewContent(post.title, 100)}</h2>
        <p style="display: inline;">${previewContent(post.content, 100)}
        <br>
      By: <object><a href="/user/${post.poster}"><span class="comment-avatar author-pfp"></span><i>${post.poster}</i></a></object> | Views: ${post.views} | Active ${relativeDate(post.activeAt)}</p>
      <div class="forum-tags">${tagHTML(post.tags)}</div>
      </div>`;
    list.appendChild(a);
    authorpfp(a, post.posterId);
  };
}

function userHTML(list) {
  return function (user) {
    let div = `<a class="user-panel" href="/user/${user.username}">
      <div class="comment-top">
      <span class="comment-avatar">${focalimg(user.avatar || "/images/blank_project.png", user.avatarpos)}</span>
      <div class="comment-username">${user.username}</div>
      </div>
      ${previewContent(user.biography, 100)}
      <div>Joined on ${new Date(user.joinedAt).toUTCString().replace(/\d\d:[^]+$/, "")} | ${user.role} </div>
    </a>`;
    list.innerHTML += div;
  };
}

// this will probably only be for the edit button tbh it's dynamic just in case we want other stuff tho
async function createActionButton(action, properties, permCheck) {
  return await fetch(`${location.href}/${permCheck || action}`)
    .then(response => {
      if (response.status === 200) {
        return `<button ${properties}> ${action.slice(0, 1).toUpperCase() + action.slice(1)} </button>`;
      } else {
        return "";
      }
    })
    .then(data => {
      return data;
    })
    .catch(error => {
      return error;
    })
}

// streamline the delete button in the edit & direct delete registry
async function createDeleteButton(topic, backpath) {
  return await createActionButton("delete", `id="deletebtn" onclick="(async () => {if(!confirm('Warning, this is permanent! Are you sure you want to continue?')) return;\
    await fetch('/api/${topic}/delete/${pid}', {\
      method: 'DELETE',\
      body: JSON.stringify({pid}),\
      headers: {'Content-Type': 'application/json'}\
    });\
    location.assign('/${backpath || topic}');\
  })()"`, "edit")
}

// checks if link is valid for storage population
let cdoPattern = /^https:\/\/studio\.code\.org\/projects\/(applab|gamelab)\/([^\/]+)/;
function isCDOStorage(url) {
  return typeof url !== "string" ? false : url.match(cdoPattern) !== null;
}

// global function allowing /update & /publish pages to run this
async function populateCDOStorage(url, data, rewrite) {
  const cdoType = url.match(cdoPattern);
  let cdoStorage = data;
  if (cdoStorage.length > 0 && cdoType !== null) {
    const cdoId = cdoType[2];
    if (rewrite) { await fetch(`/datablock_storage/${cdoId}/clear_all_data`, { method: "DELETE" }) }
    cdoStorage = JSON.parse(cdoStorage);
    switch (cdoType[1]) {
      case "applab":
        if (Object.keys(cdoStorage.tables).length > 0) {
          await fetch(`/datablock_storage/${cdoId}/populate_tables`, {
            method: "PUT",
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              tables_json: cdoStorage.tables
            })
          })
        }
      case "gamelab":
        if (Object.keys(cdoStorage.keys).length > 0) {
          await fetch(`/datablock_storage/${cdoId}/populate_key_values`, {
            method: "PUT",
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              key_values_json: cdoStorage.keys
            })
          })
        }
        break;
      default:
        throw "Unsupported CDO platform or invalid link project type"
    }
  }
}

// allow users to modify/update project data instead of having to republish
async function getCDOStorage(url) {
  const cdoType = url.match(cdoPattern);
  let cdoStorage = { keys: {}, tables: {} };
  if (cdoType !== null) {
    const cdoId = cdoType[2];
    const path = `/datablock_storage/${cdoId}/`
    switch (cdoType[1]) {
      case "applab":
        let tableNames = (await (await fetch(path + "get_table_names")).json())
        for (let name of tableNames) {
          try {
            cdoStorage.tables[name] = (await (await fetch(path + "read_records?table_name=" + name)).json())
          } catch (err) {
            throw `unable to append table "${name}" with code: ${err}`
          }
        }
      case "gamelab":
        try {
          cdoStorage.keys = (await (await fetch(path + "get_key_values")).json())
        } catch (err) {
          throw `unable to read data ERROR [${err}]`
        }
        break;
      default:
        throw "Unsupported CDO platform or invalid link project type"
    }
    return JSON.stringify(cdoStorage);
  }
}

function tagHTML(tags) {
  return tags.map(e => `#${makeLiteralChars(e)}`).join(", ");
}

function isadmin(role) {
  return role === "Admin" || role === "Uni Lover";
}

function clampnum(value, min, max, fallback) {
  value = Number(value);
  if (!isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, value));
}

function safeurl(url) {
  url = url || "";
  if (!/^(https?:\/\/|\/)/.test(url)) return "";
  if (/["'<>]/.test(url)) return "";
  return url;
}

function focalimg(url, pos, cls) {
  pos = pos || {};
  const x = clampnum(pos.x, 0, 100, 50);
  const y = clampnum(pos.y, 0, 100, 50);
  const zoom = clampnum(pos.zoom, 100, 400, 100);
  return `<img class="focal ${cls || ""}" src="${safeurl(url)}" style="object-position:${x}% ${y}%;transform:scale(${zoom / 100});transform-origin:${x}% ${y}%;">`;
}

function hexok(color) {
  return /^#[0-9a-fA-F]{6}$/.test(color || "");
}

function flairgradient(part) {
  const angle = clampnum(part.angle, 0, 360, 90);
  let list;
  if (part.style === "custom") {
    list = (Array.isArray(part.colors) ? part.colors.filter(hexok) : []);
    if (list.length === 0) list = ["#ff5f6d", "#4facfe"];
  } else {
    list = ["#ff5f6d", "#ffc371", "#47e891", "#4facfe", "#b06ab3"];
  }
  if (list.length === 1) list = [list[0], list[0]];
  return `linear-gradient(${angle}deg, ${list.join(", ")}, ${list[0]})`;
}

function flairborder(flair, target) {
  const part = flair && flair[target];
  if (!part || !part.enabled) return { cls: "", style: "" };
  const speed = clampnum(part.speed, 1, 30, 6);
  const width = clampnum(part.thickness, 1, 12, 4);
  let cls = "flair-border";
  let style = `--flair-grad:${flairgradient(part)};--flair-speed:${speed}s;--flair-w:${width}px;`;
  if (part.glow) {
    const glowc = (part.style === "custom" && Array.isArray(part.colors) && part.colors.filter(hexok)[0]) || "#ff66cc";
    cls += " flair-glow";
    style += `--flair-glow:${glowc};`;
  }
  return { cls, style };
}

function flairtext(part) {
  if (!part || !part.enabled) return "";
  const speed = clampnum(part.speed, 1, 30, 6);
  return `display:inline-block;background:${flairgradient(part)};background-size:300% 100%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;animation:flair-shift ${speed}s linear infinite;font-weight:bold;`;
}

function flairname(flair) {
  return flairtext(flair && flair.name);
}

JSON.safeParse = function (str, backup) {
  if (str === null || str === undefined) return backup;
  try {
    return JSON.parse(str);
  } catch (e) {
    return backup;
  }
};

var _rolesdata = null;
async function getroles() {
  if (_rolesdata) return _rolesdata;
  try {
    _rolesdata = ((await (await fetch("/data/badges.json")).json()).roles) || [];
  } catch (e) {
    _rolesdata = [];
  }
  return _rolesdata;
}

function rolestylefor(user, roles) {
  if (user.rolegradient === false) return "";
  if (isadmin(user.role) && user.flair && user.flair.role && user.flair.role.enabled) return flairtext(user.flair.role);
  const roledef = roles.find(r => r.name === user.role);
  if (roledef && roledef.colors && roledef.colors.length >= 2) return flairtext({ enabled: true, style: "custom", colors: roledef.colors, angle: 90, speed: 6 });
  return "";
}

var _previewcache = {};
async function getuserbyname(username) {
  if (_previewcache[username]) return _previewcache[username];
  try {
    var res = await fetch("/api/auth/userdata?username=" + encodeURIComponent(username));
    var u = await res.json();
    if (u.error) return null;
    _previewcache[username] = u;
    return u;
  } catch (e) {
    return null;
  }
}

var _previewcard = null;
var _previewtimer = null;
var _previewtoken = 0;

function ensurepreviewcard() {
  if (_previewcard) return _previewcard;
  const style = document.createElement("style");
  style.textContent = `
    @keyframes flair-shift { from { background-position: 0% 50%; } to { background-position: 300% 50%; } }
    .user-preview {
      position: absolute; z-index: 3000; width: 300px; max-width: 80vw;
      background: var(--palette-background-card); color: var(--palette-textcolor);
      border-radius: 10px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    }
    .user-preview .up-banner { width: 100%; height: 80px; overflow: hidden; background: var(--palette-background-item); }
    .user-preview .up-body { padding: 0 14px 14px; }
    .user-preview .up-avatar {
      width: 64px; height: 64px; border-radius: 50%; overflow: hidden;
      border: 4px solid var(--palette-background-card); margin-top: -34px; position: relative;
    }
    .user-preview .focal { width: 100%; height: 100%; object-fit: cover; display: block; }
    .user-preview .up-name { font-size: 18px; font-weight: bold; margin-top: 6px; display: inline-block; }
    .user-preview .up-role { font-size: 13px; opacity: 0.85; margin: 2px 0 8px; display: inline-block; }
    .user-preview .up-bio { font-size: 14px; max-height: 120px; overflow: auto; word-wrap: break-word; }
    .user-preview .flair-border { position: relative; }
    .user-preview .flair-border::after {
      content: ""; position: absolute; inset: 0; border-radius: inherit; padding: var(--flair-w, 4px);
      background-image: var(--flair-grad, linear-gradient(90deg, #ff5f6d, #4facfe, #ff5f6d)); background-size: 300% 100%;
      animation: flair-shift var(--flair-speed, 6s) linear infinite;
      -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
      -webkit-mask-composite: xor; mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); mask-composite: exclude;
      pointer-events: none;
    }
    .user-preview .flair-border.flair-glow { box-shadow: 0 0 12px var(--flair-glow, #ff66cc), 0 0 24px var(--flair-glow, #ff66cc); }
  `;
  document.head.appendChild(style);
  _previewcard = document.createElement("div");
  _previewcard.className = "user-preview";
  _previewcard.style.display = "none";
  _previewcard.addEventListener("mouseenter", () => clearTimeout(_previewtimer));
  _previewcard.addEventListener("mouseleave", hidepreview);
  document.body.appendChild(_previewcard);
  return _previewcard;
}

async function showpreview(anchor, username) {
  if (localStorage.getItem("user-preview") === "off") return;
  const token = ++_previewtoken;
  const card = ensurepreviewcard();
  const u = await getuserbyname(username);
  if (!u || token !== _previewtoken) return;
  const roles = await getroles();
  if (token !== _previewtoken) return;
  const canflair = isadmin(u.role);
  const avatarflair = canflair ? flairborder(u.flair, "avatar") : { cls: "", style: "" };
  const namecss = canflair ? flairname(u.flair) : "";
  const rolecss = rolestylefor(u, roles);
  card.innerHTML = `
    <div class="up-banner">${focalimg(u.banner, u.bannerpos)}</div>
    <div class="up-body">
      <div class="up-avatar ${avatarflair.cls}" style="${avatarflair.style}">${focalimg(u.avatar, u.avatarpos)}</div>
      <div><span class="up-name" style="${namecss}">${makeLiteralChars(u.username)}</span></div>
      <div><span class="up-role" style="${rolecss}">${makeLiteralChars(u.role)}</span></div>
      <div class="up-bio">${convertMarkdown(u.biography || "")}</div>
    </div>`;
  const rect = anchor.getBoundingClientRect();
  card.style.display = "block";
  let left = window.scrollX + rect.left;
  const cw = card.offsetWidth;
  const maxleft = window.scrollX + document.documentElement.clientWidth - cw - 8;
  if (left > maxleft) left = maxleft;
  card.style.top = (window.scrollY + rect.bottom + 6) + "px";
  card.style.left = Math.max(8, left) + "px";
}

function hidepreview() {
  clearTimeout(_previewtimer);
  _previewtimer = setTimeout(() => { if (_previewcard) _previewcard.style.display = "none"; }, 200);
}

document.addEventListener("mouseover", (e) => {
  if (!e.target || !e.target.closest) return;
  const a = e.target.closest('a[href^="/user/"]');
  if (!a) return;
  const m = a.getAttribute("href").match(/^\/user\/([^\/?#]+)/);
  if (!m) return;
  clearTimeout(_previewtimer);
  showpreview(a, decodeURIComponent(m[1]));
});

document.addEventListener("mouseout", (e) => {
  if (!e.target || !e.target.closest) return;
  if (!e.target.closest('a[href^="/user/"]')) return;
  hidepreview();
});
