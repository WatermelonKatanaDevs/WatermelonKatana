
(async function () {
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

      --navbar-bg-color: var(--palette-background-card);
      --navbar-font-color: #f2f2f2;
      --navbar-hover-bg-color: #ddd;
      --navbar-hover-font-color: black;
      --signedin-bg-color: var(--palette-background-card);
      --signedin-border-color: #ddd;
      --signedin-font-color: #f2f2f2;
      --signedin-hover-bg-color: #ddd;
      --signedin-hover-font-color: black;
      --navbar-font-family: "Fugaz One", sans-serif;
      --navbar-svgicon-color: white;
      --navbar-svgicon-hover: #383838;
    }

    @media(prefers-color-scheme: light) {
      :root {
        --navbar-font-color: #555;
        --navbar-hover-bg-color: #AAA;
        --navbar-hover-font-color: white;
        --signedin-border-color: #222;
        --signedin-font-color: #555;
        --signedin-hover-bg-color: #AAA;
        --signedin-hover-font-color: white;
        --navbar-svgicon-color: black;
        --navbar-svgicon-hover: #c7c7c7;
      }
    }

    .topnav {
      overflow: scroll hidden;
      scrollbar-width: none;
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
      background: linear-gradient(90deg, var(--palette-textcolor), #777A, var(--palette-textcolor));
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
      position: fixed;
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
      cursor: url("/images/pointer.png"), pointer !important;
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
      fill: var(--navbar-font-color);
    }

    .dropdown-icon:hover {
      background-color: var(--navbar-svgicon-hover);
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
      <a class="nav-btn" href="/dashboard">Dashboard</a>
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

document.addEventListener("DOMContentLoaded", async () => {

  var nhtml = "";

  var auth = await getAuth();
  if (auth.user) {
    if (auth.user.role == "Admin") {
      const res = await fetch("/api/admin/reports/list");
      const data = await res.json();
      const reportCount = data.report.length;
      var reports = await Promise.all(data.report.sort((a, b) => b.postedAt - a.postedAt).map(reportHTML));
      nhtml += `
      <div id="report-icon" class="dropdown-icon" data-count="${reportCount}" onclick="openreportbtnclick()">
        <svg viewBox="0 0 448 512" id="flagsvg" class="iconsvg">
           <path d="M48 24C48 10.7 37.3 0 24 0S0 10.7 0 24V64 350.5 400v88c0 13.3 10.7 24 24 24s24-10.7 24-24V388l80.3-20.1c41.1-10.3 84.6-5.5 122.5 13.4c44.2 22.1 95.5 24.8 141.7 7.4l34.7-13c12.5-4.7 20.8-16.6 20.8-30V66.1c0-23-24.2-38-44.8-27.7l-9.6 4.8c-46.3 23.2-100.8 23.2-147.1 0c-35.1-17.6-75.4-22-113.5-12.5L48 52V24zm0 77.5l96.6-24.2c27-6.7 55.5-3.6 80.4 8.8c54.9 27.4 118.7 29.7 175 6.8V334.7l-24.4 9.1c-33.7 12.6-71.2 10.7-103.4-5.4c-48.2-24.1-103.3-30.1-155.6-17.1L48 338.5v-237z"></path>
        </svg>
      </div>
      <div id="report-dropdown" class="dropdown">
        ${reports.join('') || `<p class="none-dropdown">No Reports</p>`}
      </div>
        `;
    }
    const notificationCount = auth.user.notifications.length;
    var notifs = await Promise.all(auth.user.notifications.sort((a, b) => b.createdAt - a.createdAt).map(notificationHTML));
    async function notificationHTML(notif, index) {
      var user = await getUser(notif.posterId);
      return `<a class="user-panel" href="/notification/${notificationCount-index-1}">
        <div class="comment-top">
        <img class="comment-avatar" src="${user.avatar || "/images/blank_project.png"}">
        <div class="comment-username">${notif.title}</div>
        </div>
        <div style="display: flex">
          <span>${notif.content}<br>${new Date(notif.createdAt).toUTCString().replace(/\d\d:[^]+$/, "")}</span>
          <button class="notifDismiss" onclick="event.preventDefault(); container = document.getElementById('notification-dropdown'), link = event.srcElement.closest('.user-panel'); fetch(link.href); link.remove(); notifs = container.children; document.getElementById('notification-icon').dataset.count = notifs.length; if(notifs.length<1){container.textContent='No Notifications'}else{for(i=0;i<notifs.length;i++){notifs[i].href='/notification/'+(notifs.length-i-1)}}" style="position: absolute;right: 1vmin;">
            <svg xmlns="http://www.w3.org/2000/svg" class="iconsvg" viewBox="0 0 640 512" style="width: 2em;"><path d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7l-90.2-70.7c.2-.4 .4-.9 .6-1.3c5.2-11.5 3.1-25-5.3-34.4l-7.4-8.3C497.3 319.2 480 273.9 480 226.8l0-18.8c0-77.4-55-142-128-156.8L352 32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 19.2c-42.6 8.6-79 34.2-102 69.3L38.8 5.1zM406.2 416L160 222.1l0 4.8c0 47-17.3 92.4-48.5 127.6l-7.4 8.3c-8.4 9.4-10.4 22.9-5.3 34.4S115.4 416 128 416l278.2 0zm-40.9 77.3c12-12 18.7-28.3 18.7-45.3l-64 0-64 0c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7z"></path></svg>
          </button>
        </div>
      </a>`;
    }
    nhtml += `
    <div id="notification-icon" class="dropdown-icon" data-count="${notificationCount}" onclick="notificationbtnclick()">
      <svg viewBox="0 0 448 512" id="bellsvg" class="iconsvg">
         <path d="M224 0c-17.7 0-32 14.3-32 32V49.9C119.5 61.4 64 124.2 64 200v33.4c0 45.4-15.5 89.5-43.8 124.9L5.3 377c-5.8 7.2-6.9 17.1-2.9 25.4S14.8 416 24 416H424c9.2 0 17.6-5.3 21.6-13.6s2.9-18.2-2.9-25.4l-14.9-18.6C399.5 322.9 384 278.8 384 233.4V200c0-75.8-55.5-138.6-128-150.1V32c0-17.7-14.3-32-32-32zm0 96h8c57.4 0 104 46.6 104 104v33.4c0 47.9 13.9 94.6 39.7 134.6H72.3C98.1 328 112 281.3 112 233.4V200c0-57.4 46.6-104 104-104h8zm64 352H224 160c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7s18.7-28.3 18.7-45.3z"></path>
      </svg>
    </div>
    <div id="notification-dropdown" class="dropdown">
      ${notifs.join('') || `<p class="none-dropdown">No Notifications</p>`}
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
  navbarright.insertAdjacentHTML("afterbegin", nhtml);

});

async function reportHTML(report) {
  var user = await getUser(report.posterId);
  return `<a class="user-panel" href="/report/${report.id}">
    <div class="comment-top">
    <img class="comment-avatar" src="${user.avatar || "/images/blank_project.png"}">
    <div class="comment-username">New Report</div>
    </div>
    ${user.username} reported ${report.link} because ${report.content}
    <div>${new Date(report.postedAt).toUTCString().replace(/\d\d:[^]+$/, "")}</div>
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

document.addEventListener("DOMContentLoaded", () => {
  window.addEventListener("click", function (e) {
    const navbarRight = document.querySelector(".navbar-right");
    const notificationIcon = document.querySelector("#notification-icon");
    const notificationDropdown = document.querySelector("#notification-dropdown");
    const reportIcon = document.querySelector("#report-icon");
    const reportDropdown = document.querySelector("#report-dropdown");
    if (e.target === navbarRight || e.target.closest(".notifDismiss")) { return }
    if (notificationIcon && !notificationIcon.contains(e.target) && !notificationDropdown.contains(e.target)) {
      notificationDropdown.style.display = "none";
    }
    if (reportIcon && !reportIcon.contains(e.target) && !reportDropdown.contains(e.target)) {
      reportDropdown.style.display = "none";
    }
  });
});