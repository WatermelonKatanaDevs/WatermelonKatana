const Users = require("../../Database/model/Users");
const crypto = require("crypto");
const { isadmin } = require("../../util/js/roles");
var PostAPI = require("../Forum/post.js");

function normalizeOptimalViewSize(value, fallback = null) {
  if (value == null) return fallback;
  const source = value && typeof value === "object" ? value : {};
  const width = Number(source.width);
  const height = Number(source.height);
  return {
    enabled: !!source.enabled,
    width: Number.isFinite(width) ? Math.max(1, Math.min(10000, width)) : 1,
    height: Number.isFinite(height) ? Math.max(1, Math.min(10000, height)) : 1,
    mode: source.mode === "fixed" ? "fixed" : "ratio",
  };
}

function normalizeGithubRepository(value) {
  try {
    const url = new URL(String(value || "").trim());
    if (!/^https?:$/i.test(url.protocol) || !/^(www\.)?github\.com$/i.test(url.hostname)) return "";
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length !== 2 || parts.some(part => !/^[A-Za-z0-9_.-]+$/.test(part))) return "";
    return `https://github.com/${parts[0]}/${parts[1]}`;
  } catch (_) {
    return "";
  }
}

function normalizeEditorDeployment(value, fallback = null) {
  if (value == null) return null;
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Editor deployment must be an object.");
  }

  const source = { ...(fallback || {}), ...value };
  const mode = source.mode === "third-party" ? "third-party" : "editor";
  const branch = String(source.branch || "").trim();
  const commit = String(source.commit || "latest").trim() || "latest";
  const url = String(source.url || "/").trim() || "/";
  const usePeerServer = source.usePeerServer === true;
  const peerLayer = String(source.peerLayer || "peer").trim() || "peer";
  const externalUrl = String(source.externalUrl || "").trim();
  const externalMode = source.externalMode === "emulate" ? "emulate" : "iframe";
  const hookUrl = String(source.hookUrl || "").trim();

  if (!branch) throw new Error("Editor deployment branch is required.");
  if (!/^(latest|[0-9a-f]{7,40})$/i.test(commit)) {
    throw new Error("Editor deployment commit must be "latest" or a commit SHA.");
  }
  if (!/^\//.test(url) && !/^https?:\/\//i.test(url)) {
    throw new Error("Editor deployment URL must be a path or HTTP(S) URL.");
  }
  if (mode === "third-party" && !externalUrl) {
    throw new Error("Third-party Editor deployments require a deployment URL.");
  }

  for (const [label, raw, allowBlank] of [
    ["third-party deployment URL", externalUrl, true],
    ["deployment hook URL", hookUrl, true]
  ]) {
    if (!raw && allowBlank) continue;
    try {
      const parsed = new URL(raw);
      if (!/^https?:$/i.test(parsed.protocol)) throw new Error();
    } catch (_) {
      throw new Error(`Editor ${label} must be a valid HTTP(S) URL.`);
    }
  }

  return {
    mode,
    branch,
    commit,
    url,
    usePeerServer,
    peerLayer,
    externalUrl,
    externalMode,
    hookUrl,
    saveEnvironmentVariables: source.saveEnvironmentVariables === true
  };
}

module.exports = class extends PostAPI {
  constructor(model) {
    super(model,"projects")
  }

processLink(link,thumbnail) {
  const iscdo = link.match(/^https?:\/\/studio\.code\.org\/projects\/(applab|gamelab)\/([^/]+)/);
  const isscratch = link.match(/^https?:\/\/scratch\.mit\.edu\/projects\/(\d+)/) || link.match(/^https?:\/\/turbowarp\.org\/(\d+)/);
  const iskhan = link.match(/^https?:\/\/www\.khanacademy\.org\/computer-programming\/([^/]+\/\d+)/);
  const iswk = link.match(/^https?:\/\/raw\.githubusercontent\.com\/WatermelonKatanaDevs\/symmetrical-telegram\/refs\/heads\/main\/js-games\/[^\s]*\.wk$/);
  const isswf = link.match(/^https?:\/\/[^\s]*\.swf$/);
  if (!thumbnail && iscdo) thumbnail = `https://studio.code.org/v3/files/${iscdo[2]}/.metadata/thumbnail.png`;
  if (!thumbnail && isscratch) thumbnail = `https://uploads.scratch.mit.edu/get_image/project/${isscratch[1]}_432x288.png`;
  //if (!thumbnail && iskhan) thumbnail = `https://www.khanacademy.org/computer-programming/${iskhan[1]}/???.png`;
  var platform = "embed"
  if (iscdo) {
    link = iscdo[0];
    platform = "cdo";
  }
  if (isscratch) {
    link = isscratch[0];
    platform = "scratch";
  }
  if (iskhan) {
    link = iskhan[0];
    platform = "khan";
  }
  if (iswk) {
    link = iswk[0];
    platform = "wk";
  }
  if (isswf) {
    link = isswf[0];
    platform = "swf";
  }
  return { link, platform, thumbnail }
}
  
async publish(req, res, next) {
  var { title, link, content, thumbnail, tags, mature, hidden, privateRecipients, platform, editorProject, editorRepository, editorDeployment, optimalViewSize } = req.body;
  console.log(title,link,thumbnail);
  try {
    const uid = res.locals.userToken.id;
    const user = await Users.findOne({ _id: uid });
    if (!user) return res.status(404).json({
      message: "Project not successfully published",
      error: "User not found",
    });
    editorProject = !!editorProject;
    if (editorProject) {
      editorRepository = normalizeGithubRepository(editorRepository || link);
      if (!editorRepository) return res.status(400).json({
        message: "Project not successfully published",
        error: "A valid GitHub repository is required for an Editor project",
      });
      link = editorRepository;
      try {
        editorDeployment = normalizeEditorDeployment(editorDeployment);
      } catch (error) {
        return res.status(400).json({
          message: "Project not successfully published",
          error: error.message,
        });
      }
    } else {
      editorRepository = "";
      editorDeployment = null;
    }
    if (!link.match(/^https?:\/\/[^\s"'<>]+$/)) return res.status(400).json({
      message: "Project not successfully published",
      error: "Link is not a valid url",
    });
    if (thumbnail && !String(thumbnail).match(/^(https?:\/\/|\/)[^"'<>]+$/)) return res.status(400).json({
      message: "Project not successfully published",
      error: "Thumbnail is not a valid url",
    });
    var e = this.processLink(link,thumbnail);
    const project = await this.model.create({
      title,
      link: e.link,
      content,
      tags,
      thumbnail: e.thumbnail,
      mature,
      hidden,
      privateRecipients,
      platform: editorProject ? "editor" : e.platform,
      editorProject,
      editorRepository,
      editorDeployment,
      optimalViewSize: e.platform === "cdo"
        ? (normalizeOptimalViewSize(optimalViewSize, {enabled:true,width:1,height:1,mode:"ratio"}))
        : normalizeOptimalViewSize(optimalViewSize, null),
      postedAt: Date.now(),
      activeAt: Date.now(),
      posterId: user.id,
      poster: user.username, //convert to ref eventually
    });
    await this.notifyUserFollowers(user.username+" published a project",user,title,"/project/"+project._id);
    await this.notifyUserMentions(content,user,title,"/project/"+project._id);
    console.log(project);
    res.locals.clearCookie();
    res.status(201).json({
      message: "Project successfully published",
      id: project._id,
      title: project.title,
    });
    console.log("done!");
  } catch(error) {
    res.locals.clearCookie();
    res.status(400).json({
      message: "Project not successfully published",
      error: error.message,
    });
    console.log(error.message);
  }
};

async update(req, res, next) {
  var { title, link, content, thumbnail, tags, mature, hidden, privateRecipients, platform, editorProject, editorRepository, editorDeployment, optimalViewSize } = req.body;
  console.log(title,link,thumbnail);
  try {
    const pid = req.params.id;
    const project = await this.model.findOne({ _id: pid });
    if (!project) return res.status(404).json({
      message: "Fetch not successful",
      error: "Project not found",
    });
    const user = res.locals.userToken;
    if (project.posterId !== user.id && !isadmin(user.role)) return res.status(403).json({
      message: "Not Authorized. You do not own this project",
    });
    editorProject = editorProject === undefined ? !!project.editorProject : !!editorProject;
    if (editorProject) {
      editorRepository = normalizeGithubRepository(editorRepository || project.editorRepository || link);
      if (!editorRepository) return res.status(400).json({
        message: "Project not successfully updated",
        error: "A valid GitHub repository is required for an Editor project",
      });
      link = editorRepository;
      if (editorDeployment !== undefined) {
        try {
          editorDeployment = normalizeEditorDeployment(editorDeployment, project.editorDeployment);
        } catch (error) {
          return res.status(400).json({
            message: "Project not successfully updated",
            error: error.message,
          });
        }
      } else {
        editorDeployment = project.editorDeployment || normalizeEditorDeployment({branch:"main", commit:"latest"});
      }
    } else {
      editorRepository = "";
      editorDeployment = null;
    }
    if (!link.match(/^https?:\/\/[^\s"'<>]+$/)) return res.status(400).json({
      message: "Project not successfully updated",
      error: "Link is not a valid url",
    });
    if (thumbnail && !String(thumbnail).match(/^(https?:\/\/|\/)[^"'<>]+$/)) return res.status(400).json({
      message: "Project not successfully updated",
      error: "Thumbnail is not a valid url",
    });
    var e = this.processLink(link,thumbnail);
    project.title = title;
    project.link = e.link;
    project.content = content;
    project.tags = tags;
    project.thumbnail = e.thumbnail;
    project.mature = mature;
    project.hidden = hidden;
    project.privateRecipients = privateRecipients;
    project.platform = editorProject ? "editor" : e.platform;
    project.editorProject = editorProject;
    project.editorRepository = editorRepository;
    project.editorDeployment = editorDeployment;
    if (optimalViewSize !== undefined) {
      project.optimalViewSize = normalizeOptimalViewSize(optimalViewSize, project.optimalViewSize);
    }
    project.activeAt = Date.now();
    await project.save();
    res.status(201).json({
      message: "Project successfully updated",
      id: project._id,
      title: project.title,
    });
    console.log("done!");
  } catch(error) {
    res.status(400).json({
      message: "Project not successfully updated",
      error: error.message,
    });
    console.log(error.message);
  }
};

async delete(req, res, next) {
  try {
    const pid = req.params.id;
    const project = await this.model.findOne({ _id: pid });
    if (!project) return res.status(404).json({
      message: "Fetch not successful",
      error: "Project not found",
    });
    const user = res.locals.userToken;
    if (project.posterId !== user.id && !isadmin(user.role)) return res.status(403).json({
      message: "Not Authorized. You do not own this project",
    });
    var users = await Users.find({ favorites: { $all: [ pid ] } });
    for (var i = 0; i < users.length; i++) {
      users[i].favorites.splice(users[i].favorites.indexOf(pid),1);
      await users[i].save();
    }
    //await project.remove();
    await this.model.deleteOne({_id: pid});
    console.log("deleted "+pid);
    res.status(201).json({
      message: "Project successfully deleted",
      id: project._id,
      title: project.title,
    });
    console.log("done!");
  } catch(error) {
    res.status(400).json({
      message: "Project not successfully deleted",
      error: error.message,
    });
    console.log(error.message);
  }
};

async editorRepositoryRename(req, res, next) {
  try {
    const oldRepository = normalizeGithubRepository(req.body?.oldRepository);
    const newRepository = normalizeGithubRepository(req.body?.newRepository);
    if (!oldRepository || !newRepository) {
      return res.status(400).json({
        message: "Repository rename not recorded",
        error: "Both oldRepository and newRepository must be valid GitHub repository URLs",
      });
    }
    if (oldRepository === newRepository) {
      return res.status(200).json({
        message: "Repository rename already synchronized",
        matched: 0,
        modified: 0,
      });
    }

    const user = res.locals.userToken;
    if (!user?.id) return res.status(401).json({
      message: "Repository rename not recorded",
      error: "Authentication required",
    });

    const result = await this.model.updateMany(
      {
        posterId: String(user.id),
        editorProject: true,
        editorRepository: oldRepository,
      },
      {
        $set: {
          editorRepository: newRepository,
          activeAt: Date.now(),
        },
      },
    );

    const modified = Number(result.modifiedCount || 0);
    res.status(200).json({
      message: "Repository rename synchronized",
      matched: Number(result.matchedCount || 0),
      modified,
      oldRepository,
      newRepository,
    });
  } catch (error) {
    res.status(400).json({
      message: "Repository rename not recorded",
      error: error.message,
    });
    console.log(error.message);
  }
}

async verify(req, res, next) {
  try {
    const pid = req.params.id;
    const project = await this.model.findOne({ _id: pid });
    if (!project) return res.status(404).json({
      message: "Fetch not successful",
      error: "Project not found",
    });
    project.verified = true;
    await project.save();
    res.status(201).json({
      message: "Project successfully verified",
      id: project._id,
      title: project.title,
    });
  } catch(error) {
    res.status(400).json({
      message: "Project not successfully verified",
      error: error.message,
    });
    console.log(error.message);
  }
};

async unverify(req, res, next) {
  try {
    const pid = req.params.id;
    const project = await this.model.findOne({ _id: pid });
    if (!project) return res.status(404).json({
      message: "Fetch not successful",
      error: "Project not found",
    });
    project.verified = false;
    await project.save();
    res.status(201).json({
      message: "Project successfully unverified",
      id: project._id,
      title: project.title,
    });
  } catch(error) {
    res.status(400).json({
      message: "Project not successfully unverified",
      error: error.message,
    });
    console.log(error.message);
  }
};

async play(req, res, next) {
  try {
    const pid = req.params.id;
    const project = await this.model.findOne({ _id: pid });
    if (!project) return res.status(404).json({
      message: "Play not recorded",
      error: "Project not found",
    });

    const now = Date.now();
    const cooldown = 60 * 1000;
    const forwarded = req.headers["x-forwarded-for"];
    const ip = String(Array.isArray(forwarded) ? forwarded[0] : (forwarded || req.socket?.remoteAddress || "")).split(",")[0].trim();
    const accountId = res.locals.userToken?.id ? String(res.locals.userToken.id) : "";
    const identity = crypto.createHash("sha256")
      .update(accountId ? "user:" + accountId + "|ip:" + ip : "ip:" + ip)
      .digest("hex");
    const lastPlayed = Number(project.playCooldowns?.get(identity) || 0);

    if (now - lastPlayed < cooldown) {
      return res.status(200).json({
        message: "Play ignored during cooldown",
        plays: project.plays,
        counted: false,
      });
    }

    project.plays++;

    // Keep the per-project cooldown map bounded to recently active players.
    for (const [playerId, timestamp] of project.playCooldowns) {
      if (now - Number(timestamp) >= cooldown) project.playCooldowns.delete(playerId);
    }
    project.playCooldowns.set(identity, now);
    await project.save();

    res.status(201).json({
      message: "Play recorded",
      id: project._id,
      plays: project.plays,
      counted: true,
    });
  } catch(error) {
    res.status(400).json({
      message: "Play not recorded",
      error: error.message,
    });
    console.log(error.message);
  }
};

async favorite(req, res, next) {
  try {
    const pid = req.params.id;
    const project = await this.model.findOne({ _id: pid });
    if (!project) return res.status(404).json({
      message: "Fetch not successful",
      error: "Project not found",
    });
    const uid = res.locals.userToken.id;
    const user = await Users.findOne({ _id: uid });
    if (!user) return res.status(404).json({
      message: "Fetch not successful",
      error: "User not found",
    });
    if (user.favorites.includes(pid)) return res.status(400).json({
      message: "Invalid",
      error: "Already favorited project",
    });
    user.favorites.push(pid);
    project.score++;
    await user.save();
    await project.save();
    const owner = await Users.findOne({ _id: project.posterId });
    if (!owner) return res.status(404).json({
      message: "Fetch not successful",
      error: "Owner not found",
    });
    owner.notify(user.username+" favorited your project!",project.title,"/project/"+project._id,user._id,user.username);
    await owner.save();
    res.status(201).json({
      message: "Project successfully updated",
      id: project._id,
      title: project.title,
    });
    console.log("done!");
  } catch(error) {
    res.status(400).json({
      message: "Project not successfully updated",
      error: error.message,
    });
    console.log(error.message);
  }
};
async unfavorite(req, res, next) {
  try {
    const pid = req.params.id;
    const project = await this.model.findOne({ _id: pid });
    if (!project) return res.status(404).json({
      message: "Fetch not successful",
      error: "Project not found",
    });
    const uid = res.locals.userToken.id;
    const user = await Users.findOne({ _id: uid });
    if (!user) return res.status(404).json({
      message: "Fetch not successful",
      error: "User not found",
    });
    const index = user.favorites.indexOf(pid);
    if (index === -1) return res.status(400).json({
      message: "Invalid",
      error: "Haven't favorited project yet",
    });
    user.favorites.splice(index,1);
    project.score--;
    await user.save();
    await project.save();
    res.status(201).json({
      message: "Project successfully updated",
      id: project._id,
      title: project.title,
    });
    console.log("done!");
  } catch(error) {
    res.status(400).json({
      message: "Project not successfully updated",
      error: error.message,
    });
    console.log(error.message);
  }
};

};
