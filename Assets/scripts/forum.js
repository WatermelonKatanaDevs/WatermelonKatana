async function createPost(post,data,txt,name,reload) {
  var u = await getUser(data.posterId);
  post.innerHTML = `
  <div id="display">
    <h2 class="post-name">${makeLiteralChars(data.title)}</h2>
    <p class="comment-data">${new Date(data.postedAt).toUTCString()}</p>
    <div class="comment-top">
      <a href="/user/${u.username}">
        <img class="comment-avatar" src="${u.avatar}">
        <p class="comment-username">${u.username}</p>
      </a>
    </div>
    ${convertMarkdown(data.content)} <br>
    ${txt}
    ${data.tags.map(t=>(t.length > 0 ? `<a href="/search?includeTags=${t}">#${t}</a>`: ""))} <br>
  </div>
  <div id="comments" class="comment-list">
  Comments:
  </div>
  `;
  var tok = await getAuth();
  const commentlist = document.querySelector("#comments");
  await listComments(commentlist,data.comments,tok.user,commentEvents(name,reload));
  const display = document.querySelector("#display");
  if (!tok.user) return;
  document.body.innerHTML += `
  <div id="reply">
    <div class="comment-top">
      <img class="comment-avatar" src="${tok.user.avatar}">
      <p class="comment-username">${tok.user.username}</p>
    </div>
    <textarea id="reply-textbox" oninput="growtextarea(this)" resize=false placeholder="Write a reply..."></textarea>
    <input type="button" class="pink-button" id="send-reply-btn" value="send" onclick="window.onreplysendclick()">
    <input type="button" class="pink-button" id="cancel-reply-btn"  value="cancel" onclick="window.onreplycancelclick()">
    <!--<button type="submit" class="send" title="Send">
      <svg fill="none" viewBox="0 0 24 24" height="18" width="18" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linejoin="round" stroke-linecap="round" stroke-width="2.5" stroke="#ffffff" d="M12 5L12 20"></path>
        <path stroke-linejoin="round" stroke-linecap="round" stroke-width="2.5" stroke="#ffffff" d="M7 9L11.2929 4.70711C11.6262 4.37377 11.7929 4.20711 12 4.20711C12.2071 4.20711 12.3738 4.37377 12.7071 4.70711L17 9"></path>
      </svg>
    </button>-->
  </div>`;
  markdownTextbox("#reply-textbox",true);
  if (tok.user.role === "Admin") { 
    display.innerHTML += `
    <label for="featured-btn">Featured:
      <input
        value="featured-button"
        name="featured-btn"
        id="featured-btn"
        type="checkbox"
        ${data.featured ? "checked" : ""}
        onclick="featurebtnclick(this.checked)"
      />
      <span class="checkbox"></span>
    </label><br>`;
  } else {
    display.innerHTML += `<b>Featured</b> => ${data.featured} <br>`;
  }
  display.innerHTML += `
  <div class="post-upvote">
    <button class="report-btn" onclick="window.onreportclick('main');">
      <svg viewBox="0 0 448 512" height="1em" xmlns="http://www.w3.org/2000/svg" class="report-icon"><path d="M64 32C64 14.3 49.7 0 32 0S0 14.3 0 32V64 368 480c0 17.7 14.3 32 32 32s32-14.3 32-32V352l64.3-16.1c41.1-10.3 84.6-5.5 122.5 13.4c44.2 22.1 95.5 24.8 141.7 7.4l34.7-13c12.5-4.7 20.8-16.6 20.8-30V66.1c0-23-24.2-38-44.8-27.7l-9.6 4.8c-46.3 23.2-100.8 23.2-147.1 0c-35.1-17.6-75.4-22-113.5-12.5L64 48V32z"></path></svg>
    </button>
    <label class="upvote-container">
      ${data.upvotes.length}
      <input class="comment-upvote-box" name="comment-vpvote" type="checkbox" value="reply" ${data.upvotes.includes(tok.user.id) ? "checked" : ""} onclick="window.onupvoteclick('main',this.checked);">
      <svg viewBox="0 0 512 512" height="1em" xmlns="http://www.w3.org/2000/svg" class="upvote-icon"><path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"></path></svg>
    </label>
  </div>`;
  if (tok.user.id !== data.posterId && tok.user.role !== "Admin") return;
  console.log(post);
  if (name == "forum") name = "forum/discussion";
  display.innerHTML += `<a class="edit button" href="/${name}/${pid}/edit">Edit</a>`;
}
async function listComments(list,comments,self,events) {
  var users = {};
  for (var i = 0; i < comments.length; i++) {
    var c = comments[i];
    var u = await getUser(c.posterId);
    if (self) {
      var options = `<input type="button" value="reply" onclick="window.onreplybtnclick(${i});">`;
      if (self.id == c.posterId) {
        options += `<input type="button" value="edit" onclick="window.oneditbtnclick(${i});">`;
      }
      if (self.id == c.posterId || self.role == "Admin") {
        options += `<input type="button" style="color:red;" value="delete" onclick="window.ondeletebtnclick(${i});">`;
      }
    }
    var div = `
    <div class="comment">
      ${self?`
      <div class="comment-menu">
        <img class="comment-menu-img" src="https://www.svgrepo.com/show/124304/three-dots.svg">
        <div class="comment-menu-options">
          ${options}
        </div>
      </div>`:""}
      <div class="comment-top">
        <a href="/user/${u.username}">
          <img class="comment-avatar" src="${u.avatar}">
          <p class="comment-username">${u.username}</p>
        </a>
        <p class="comment-data">${relativeDate(c.postedAt)}</p>
      </div>
      ${self?`<div class="comment-upvote">
        <button class="report-btn" onclick="window.onreportclick(${i});">
          <svg viewBox="0 0 448 512" height="1em" xmlns="http://www.w3.org/2000/svg" class="report-icon"><path d="M64 32C64 14.3 49.7 0 32 0S0 14.3 0 32V64 368 480c0 17.7 14.3 32 32 32s32-14.3 32-32V352l64.3-16.1c41.1-10.3 84.6-5.5 122.5 13.4c44.2 22.1 95.5 24.8 141.7 7.4l34.7-13c12.5-4.7 20.8-16.6 20.8-30V66.1c0-23-24.2-38-44.8-27.7l-9.6 4.8c-46.3 23.2-100.8 23.2-147.1 0c-35.1-17.6-75.4-22-113.5-12.5L64 48V32z"></path></svg>
        </button>
        <label class="upvote-container">
          ${c.upvotes.length}
          <input class="comment-upvote-box" type="checkbox" value="reply" ${c.upvotes.includes(self.id) ? "checked" : ""} onclick="window.onupvoteclick(${i},this.checked);">
          <svg viewBox="0 0 512 512" height="1em" xmlns="http://www.w3.org/2000/svg" class="upvote-icon"><path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"></path></svg>
        </label>
      </div>`:""}
      <p class="comment-content">${convertMarkdown(c.content)}</p>
      <br>
    </div>`;
    list.innerHTML += div;
  }
  if (!self) return;
  var repbtn = `
  <button class="comment" id="reply-btn"  onclick="window.onreplybtnclick()">
    <div class="comment-top">
      <img class="comment-avatar" src="${self.avatar}">
      <p class="comment-username">${self.username}</p>
    </div>
    <p class="comment-content">Write a reply...</p>
  </button>`;
  list.innerHTML += repbtn;
  window.editingMsg = false;
  var rep = setupReply(events,()=>{
    if (window.editingMsg) {
      var txt = document.querySelector("#reply-textbox");
      txt.value = window.editingMsg.oldmsg;
      window.editingMsg = false;
    }
    document.querySelector("#reply").style.display = "none";
  },self);
  window.onreplybtnclick = (i)=>{
    document.querySelector("#reply").style.display = "block";
    var txt = document.querySelector("#reply-textbox");
    txt.focus();
    if (!comments[i]) return;
    txt.value = "@"+comments[i].poster+" "+txt.value;
  };
  window.oneditbtnclick = (index)=>{
    document.querySelector("#reply").style.display = "block";
    var txt = document.querySelector("#reply-textbox");
    var oldmsg = txt.value;
    txt.value = comments[index].content;
    txt.focus();
    window.editingMsg = {index,oldmsg};
  };
  window.ondeletebtnclick = events.ondelete;
  window.onupvoteclick = events.onupvote;
  window.onreportclick = events.onreport;
}
function setupReply(events,oncancel,self) {
  window.onreplysendclick = ()=>{
    var txt = document.querySelector("#reply-textbox");
    if (window.editingMsg) {
      events.onedit(txt.value,window.editingMsg.index);
    } else {
      events.onsend(txt.value);
    }
    oncancel();
  };
  window.onreplycancelclick = oncancel;
}
function growtextarea(ta) {
  ta.style.height = ""; /* Reset the height*/
  ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
}
function commentEvents(name,reload) {
  return {
    onsend:async(content)=>{
      const res = await fetch("/api/"+name+"/comment/"+pid, {
        method: "POST",
        body: JSON.stringify({
          content
        }),
        headers: { "Content-Type": "application/json" },
      });
      reload();
    },
    onedit:async(content,index)=>{
      const res = await fetch("/api/"+name+"/comment/"+pid+"/edit", {
        method: "PUT",
        body: JSON.stringify({
          content,
          index
        }),
        headers: { "Content-Type": "application/json" },
      });
      reload();
    },
    ondelete:async(index)=>{
      const res = await fetch("/api/"+name+"/comment/"+pid+"/delete", {
        method: "DELETE",
        body: JSON.stringify({
          index
        }),
        headers: { "Content-Type": "application/json" },
      });
      reload();
    },
    onupvote:async(index,checked)=>{
      const res = await fetch("/api/"+name+"/comment/"+pid+"/"+(checked?"up":"down")+"vote?index="+index);
      reload();
    },
    onreport:async(index)=>{
      var content = prompt("Why are you reporting this?");
      if (!content) return;
      var link = "/"+{forum:"forum/discussion",project:"project"}[name]+"/"+pid;
      if (index !== "main") link += "?comment="+index;
      const res = await fetch("/api/admin/reports/create",{
        method: "POST",
        body: JSON.stringify({
          content,
          link
        }),
        headers: { "Content-Type": "application/json" },
      });
      reload();
    }
  };
}