// Pages and Modules
let pages = {};
let modules = {};
async function setPage(id, params) {
  findI("main").style.opacity = 0;
  setTimeout(async function () {
    findI("main").style.opacity = 1;
    findI("main").innerHTML = `<div class="loading"></div>`;
    if (pages[id] == undefined) {
      await loadScript("pages/" + id + ".js");
      findI("main").innerHTML = pages[id].wireframe;
      pages[id].code();
      addCSS(pages[id].style);
    } else {
      findI("main").innerHTML = pages[id].wireframe;
      pages[id].code();
    }
    window.location.hash = "#" + id;
    findI("title").innerHTML = pages[id].title + " | KatanaClient";
  }, 200);
}
async function getModule(id) {
  if (modules[id] == null) {
    await loadScript("modules/" + id + ".js");
    addCSS(modules[id].style);
  }
  return modules[id].code;
}
let stylesheet = findI("stylesheet").sheet;
function addCSS(newRules) {
  let ruleKeys = Object.keys(newRules);
  for (let i = 0; i < ruleKeys.length; i++) {
    stylesheet.insertRule(ruleKeys[i] + "{" + newRules[ruleKeys[i]] + "}", stylesheet.cssRules.length);
  }
}
async function loadScript(url) {
  return new Promise(function(resolve) {
    let loaded = getScript(url);
    if (loaded) {
      if (loaded.hasAttribute("done")) {
        resolve(loaded);
      } else {
        loaded.addEventListener("load", function() {
          resolve(loaded);
        });
      }
      return;
    }
    let newScript = document.createElement('script');
    newScript.addEventListener("load", function() {
      newScript.setAttribute("done", "");
      resolve(newScript);
    });
    newScript.src = url;
    document.body.appendChild(newScript);
  });
}
function getScript(url) {
  return document.querySelector("[src='" + url + "'");
}
function modifyParams(key, value) {
  const Url = new URL(window.location);
  if (value != null) {
    Url.searchParams.set(key, value);
  } else {
    Url.searchParams.delete(key);
  }
  window.history.pushState({}, '', Url);
}
function getParam(key) {
  let queryString = window.location.search;
  let urlParams = new URLSearchParams(queryString);
  return urlParams.get(key);
}

// Elements
function findI(id) {
  return document.getElementById(id);
}
function createElement(name, type, parent, attributes) {
  if (attributes == null) {
    attributes = [];
  }
  if (parent == null) {
    return null;
  } else {
    if (typeof parent === "string" || typeof parent === "number") {
      parent = findI(parent);
    }
  }
  let newElement = document.createElement(type);
  if (parent === null) {
    document.body.appendChild(newElement);
  } else {
    parent.appendChild(newElement);
  }
  let setStyle = "";
  let keys = Object.keys(attributes);
  for (let i = 0; i < keys.length; i++) {
    setStyle += keys[i] + ": " + attributes[keys[i]] + "; ";
  }
  newElement.setAttribute("style", setStyle);
  newElement.setAttribute("class", name);
  return newElement;
}
function updateAuth() {
  
}

// Requests
let serverURL = "https://watermelonkatana.com/api/";
async function sendRequest(method, path, body) {
	try {
		let sendData = {
			method: method,
			headers: {
				"cache": "no-cache"
			}
		};
		if (body != null) {
			if (typeof body == "object" && body instanceof FormData == false) {
				body = JSON.stringify(body);
			}
			sendData.body = body;
		}
		let response = await fetch(serverURL + path, sendData);
		return [response.status, await response.text()];
	} catch (err) {
		return [0, "Fetch Error"];
	}
}

// Sidebar
findI("sidebar.logo").addEventListener("click", function () {
  setPage("home");
});
findI("sidebar.home").addEventListener("click", function () {
  setPage("home");
});
findI("sidebar.announcements").addEventListener("click", function () {
  setPage("announcements");
});

// Ready!
if (window.location.hash != "") {
  setPage(window.location.hash.substring(1, window.location.hash.length));
} else {
  setPage("home");
}