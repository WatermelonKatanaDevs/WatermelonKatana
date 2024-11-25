
(async function() {
  const style = document.createElement("style");
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Fugaz+One&display=swap');

    :root {
      --palette-primary: #de6c83;
      --palette-secondary: #2cf6b3;
      --spill-color1: #de6c83;
      --spill-color2: #ff2e58;
      --spill-color3: #2cf6b3;
      --spill-color4: #00b377;

      --navbar-bg-color: #333;
      --navbar-font-color: #f2f2f2;
      --navbar-hover-bg-color: #ddd;
      --navbar-hover-font-color: black;
      --signedin-bg-color: #333;
      --signedin-border-color: #ddd;
      --signedin-font-color: #f2f2f2;
      --signedin-hover-bg-color: #ddd;
      --signedin-hover-font-color: black;
      --navbar-font-family: "Fugaz One", sans-serif;
    }

    .topnav {
      overflow: visible;
      background-color: var(--navbar-bg-color);
      color: var(--navbar-font-color);
      height: 2.5em;
      font-size: 1em;
      font-family: var(--navbar-font-family);
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      position: fixed;
      top: 0;
      left: 0;
      z-index: 1000;
      padding-left: 1em;
      padding-right: 1em;
    }

    .navbar-left {
      display: flex;
      align-items: center;
    }

    .navbar-right {
      display: flex;
      align-items: center;
    }

    .navbar-name {
      font-family: var(--navbar-font-family);
      font-size: 1.5em;
      background: linear-gradient(90deg, var(--spill-color1), var(--spill-color2), var(--spill-color3), var(--spill-color4));
      background-size: 200% 200%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      color: transparent;
      margin-right: 2em;
      position: relative;
      animation: liquidSpill 4s ease-in-out infinite;
      transition: color 0.5s ease, background 0.5s ease;
    }

    @keyframes liquidSpill {
      0% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
      }
      100% {
        background-position: 0% 50%;
      }
    }

    .navbar-name::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: inherit;
      filter: blur(15px);
      opacity: 0.7;
      z-index: -1;
      animation: liquidSpill 4s ease-in-out infinite;
    }

    .navbar-name:hover {
      background: linear-gradient(90deg, #fff, rgba(255, 255, 255, 0.5), #fff);
      background-size: 200% 200%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      color: transparent;
      animation: shimmer 2s linear infinite;
    }

    @keyframes shimmer {
      0% {
        background-position: -100% 0;
      }
      100% {
        background-position: 100% 0;
      }
    }

    .nav-btn {
      float: left;
      display: block;
      color: var(--navbar-font-color);
      text-align: center;
      padding: 10px 14px;
      text-decoration: none;
      border-radius: 15px;
      transition: background-color 0.3s ease, color 0.3s ease;
      margin-right: 0.5em;
    }

    .nav-btn:hover {
      background-color: var(--navbar-hover-bg-color);
      color: var(--navbar-hover-font-color);
    }

    .signedin {
      height: calc(2.5em - 7px);
      margin-right: calc(1em + 5px);
      border: 1px solid var(--signedin-border-color);
      border-radius: 10px;
      z-index: 1001;
      color: var(--signedin-font-color);
      background-color: var(--signedin-bg-color);
      text-align: center;
      text-decoration: none;
      display: flex;
      align-items: center;
      transition: background-color 0.3s ease, color 0.3s ease;
    }

    .signedin:hover {
      background-color: var(--palette-primary);
      color: var(--signedin-hover-font-color);
    }

    .signedin-avatar {
      width: 2em;
      height: 2em;
      border-radius: 50%;
      padding: 0px;
      margin: 0px;
      display: inline-flex;
    }

    .signedin-username {
      padding: 0px;
      margin: 7px;
      display: inline-flex;
    }

    .dropdown {
      display: none;
      position: absolute;
      right: 0;
      top: 2.5em;
      background-color: var(--navbar-bg-color);
      color: var(--navbar-font-color);
      max-height: 400px;
      min-height: 130px;
      min-width: 335px;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
      z-index: 1002;
      border-radius: 5px;
      overflow: scroll;
    }

    .dropdown a {
      padding: 12px 16px;
      text-decoration: none;
      display: block;
      color: var(--navbar-font-color);
      border-bottom: 1px solid var(--navbar-hover-bg-color);
    }

    .dropdown a:hover {
      background-color: var(--navbar-hover-bg-color);
      color: var(--navbar-hover-font-color);
    }
    
    .dropdown-icon {
      position: relative;
      margin-right: 5px;
      cursor: pointer;
      width: 2em;
      height: 2em;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      cursor: pointer;
      transition-duration: .3s;
      box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.13);
      border: none;
    }

    .dropdown-icon::after {
      content: attr(data-count);
      position: absolute;
      top: -5px;
      right: -5px;
      background-color: var(--palette-primary);
      color: white;
      font-size: 0.7em;
      padding: 2px 5px;
      border-radius: 50%;
      line-height: 1;
      text-align: center;
    }

    .iconsvg {
      width: 18px;
    }

    .iconsvg path {
      fill: white;
    }

    .dropdown-icon:hover {
      background-color: rgb(56, 56, 56);
    }

    #notification-icon:hover #bellsvg {
      animation: bellRing 0.9s both;
    }

    #report-icon:hover #flagsvg {
      animation: flagMove 0.5s both;
    }

    /* bell ringing animation keyframes*/
    @keyframes bellRing {
      0%,
      100% {
        transform-origin: top;
      }

      15% {
        transform: rotateZ(10deg);
      }

      30% {
        transform: rotateZ(-10deg);
      }

      45% {
        transform: rotateZ(5deg);
      }

      60% {
        transform: rotateZ(-5deg);
      }

      75% {
        transform: rotateZ(2deg);
      }
    }

    /* ------ Animation ------ */
    @keyframes flagMove {
      33% {
        transform: rotate(0deg) scale(0.8);
      }
    
      66% {
        transform: rotate(-10deg) scale(1.2);
      }
    }

    .dropdown-icon:active {
      transform: scale(0.8);
    }

    .none-dropdown: {
      /*center somehow*/
      text-align: center;
    }

    #block {
      height: 2.5em;
      width: 100%;
    }
  `;
  document.head.append(style);

  var navbarHtml = `
  <div class="topnav">
    <div class="navbar-left">
      <h2 class="navbar-name"><a href="/">WatermelonKatana</a></h2>
      <a class="nav-btn" href="/chat">Chat</a>
      <a class="nav-btn" href="/search">Project Gallery</a>
      <a class="nav-btn" href="/forum">Forum</a>
      ${window.location.pathname.startsWith("/project") ? `
      <a class="nav-btn" onclick="l=document.getElementById('game'); l.src=l.src"> 
      Replay
      </a>`: ""}
    </div>
    <div class="navbar-right">
    </div>
  </div>
  <div id="block"></div>
  `;

  const navbarContainer = document.createElement("div");
  navbarContainer.innerHTML = navbarHtml;

  document.body.prepend(navbarContainer);

})();

document.addEventListener("DOMContentLoaded", async ()=>{

  var nhtml = "";

  var auth = await getAuth();
  if (auth.user) {
    if (auth.user.role == "Admin") {
      const res = await fetch("/api/admin/reports/list");
      const data = await res.json();
      const reportCount = data.report.length;
      var reports = await Promise.all(data.report.sort((a,b)=>b.postedAt-a.postedAt).map(reportHTML));
      nhtml += `
      <div id="report-icon" class="dropdown-icon" data-count="${reportCount}" onclick="openreportbtnclick()">
        <svg viewBox="0 0 448 512" id="flagsvg" class="iconsvg">
           <path d="M48 24C48 10.7 37.3 0 24 0S0 10.7 0 24V64 350.5 400v88c0 13.3 10.7 24 24 24s24-10.7 24-24V388l80.3-20.1c41.1-10.3 84.6-5.5 122.5 13.4c44.2 22.1 95.5 24.8 141.7 7.4l34.7-13c12.5-4.7 20.8-16.6 20.8-30V66.1c0-23-24.2-38-44.8-27.7l-9.6 4.8c-46.3 23.2-100.8 23.2-147.1 0c-35.1-17.6-75.4-22-113.5-12.5L48 52V24zm0 77.5l96.6-24.2c27-6.7 55.5-3.6 80.4 8.8c54.9 27.4 118.7 29.7 175 6.8V334.7l-24.4 9.1c-33.7 12.6-71.2 10.7-103.4-5.4c-48.2-24.1-103.3-30.1-155.6-17.1L48 338.5v-237z"></path>
        </svg>
        <div id="report-dropdown" class="dropdown">
          ${reports.join('')||`<p class="none-dropdown">No Reports</p>`}
        </div>
      </div>
      `;
    }
    const notificationCount = auth.user.notifications.length;
    var notifs = await Promise.all(auth.user.notifications.sort((a,b)=>b.createdAt-a.createdAt).map(notificationHTML));
    nhtml += `
    <div id="notification-icon" class="dropdown-icon" data-count="${notificationCount}" onclick="notificationbtnclick()">
      <svg viewBox="0 0 448 512" id="bellsvg" class="iconsvg">
         <path d="M224 0c-17.7 0-32 14.3-32 32V49.9C119.5 61.4 64 124.2 64 200v33.4c0 45.4-15.5 89.5-43.8 124.9L5.3 377c-5.8 7.2-6.9 17.1-2.9 25.4S14.8 416 24 416H424c9.2 0 17.6-5.3 21.6-13.6s2.9-18.2-2.9-25.4l-14.9-18.6C399.5 322.9 384 278.8 384 233.4V200c0-75.8-55.5-138.6-128-150.1V32c0-17.7-14.3-32-32-32zm0 96h8c57.4 0 104 46.6 104 104v33.4c0 47.9 13.9 94.6 39.7 134.6H72.3C98.1 328 112 281.3 112 233.4V200c0-57.4 46.6-104 104-104h8zm64 352H224 160c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7s18.7-28.3 18.7-45.3z"></path>
      </svg>
      <div id="notification-dropdown" class="dropdown">
        ${notifs.join('')||`<p class="none-dropdown">No Notifications</p>`}
      </div>
    </div>
    <a class="signedin" href="/user/${auth.user.username}">
      <img class="signedin-avatar" src="${auth.user.avatar}">
      <p class="signedin-username">${auth.user.username}</p>
    </a>
    `;
  } else if (window.location.pathname.match(/^\/(register|login)/i) === null) {
    nhtml += `
    <a class="nav-btn" href="/login">Login</a>
    <a class="nav-btn" href="/register">Create Account</a>
    `;
  }

  const navbarright = document.querySelector(".navbar-right")
  navbarright.insertAdjacentHTML("afterbegin",nhtml);

});

async function notificationHTML(notif,index) {
  var user = await getUser(notif.posterId);
  return `<a class="user-panel" href="/notification/${index}">
    <div class="comment-top">
    <img class="comment-avatar" src="${user.avatar || "/images/blank_project.png"}">
    <div class="comment-username">${notif.title}</div>
    </div>
    ${notif.content}
    <div>${new Date(notif.createdAt).toUTCString().replace(/\d\d:[^]+$/,"")}</div>
  </a>`;
}

async function reportHTML(report) {
  var user = await getUser(report.posterId);
  return `<a class="user-panel" href="/report/${report.id}">
    <div class="comment-top">
    <img class="comment-avatar" src="${user.avatar || "/images/blank_project.png"}">
    <div class="comment-username">New Report</div>
    </div>
    ${user.username} reported ${report.link} because ${report.content}
    <div>${new Date(report.postedAt).toUTCString().replace(/\d\d:[^]+$/,"")}</div>
  </a>`;
}

function notificationbtnclick() {
  var dropdown = document.querySelector("#notification-dropdown");
  dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
}

function openreportbtnclick() {
  var dropdown = document.querySelector("#report-dropdown");
  dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
}

document.addEventListener("DOMContentLoaded", ()=>{
  window.addEventListener("click", function(e) {
    const notificationIcon = document.querySelector("#notification-icon");
    if (!notificationIcon.contains(e.target)) {
      var dropdown = document.querySelector("#notification-dropdown");
      dropdown.style.display = "none";
    }
    const reportIcon = document.querySelector("#report-icon");
    if (!reportIcon.contains(e.target)) {
      var dropdown = document.querySelector("#report-dropdown");
      dropdown.style.display = "none";
    }
  });
});
  
