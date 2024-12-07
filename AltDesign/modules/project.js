modules.project = {
  code: async function (parent, data) {
    let thisProject = createElement("project", "div", parent);
    thisProject.innerHTML = `<div class="projectImg" style="background-image: url('${data.thumbnail}')"">
      <div class="projectCounts">
        <div class="projectCount" style="display: ${data.featured ? "flex" : "none"};">
          <span class="symbol">verified</span>
          Featured
        </div>
      </div>
      <div class="spacer"></div>
      <div class="projectCounts">
        <div class="projectCount">
          <span class="symbol">visibility</span>
          ${data.views}
        </div>
        <div class="spacer"></div>
        <div class="projectCount">
          <span class="symbol">favorite</span>
          ${data.score}
        </div>
      </div>
    </div>
    <div class="projectName">${data.title}</div>
    <div class="projectAttr">
      <img src="https://cdn.glitch.global/a1c05868-7ceb-4518-88e4-37695b4b056d/Notloggedin.jpg?v=1733171207174" class="projectPfp">
      <div class="projectUsername">${data.poster}</div>
    </div>`;
  },
  style: {
    ".project": `display: flex;
                 flex-direction: column;
                 background: var(--background);
                 padding: 5px;
                 width: 170px;
                 flex-shrink: 0;
                 box-shadow: 0 3px 10px -1px rgba(0,0,0,0.2);
                 border-radius: 5px;
                 gap: 5px;
                 cursor: pointer;
                 user-select: none;
                 transition: 0.1s;`,
    ".project:active:hover": `transform: scale(0.95);`,
    ".projectImg": `display: flex;
                    flex-direction: column;
                    height: 160px;
                    background-size: cover;
                    border-radius: 5px;
                    -webkit-user-drag: none;
                    padding: 5px;`,
    ".projectImg .spacer": `flex-grow: 1;`,
    ".projectName": `font-weight: bold;
                     overflow: hidden;
                     text-overflow: ellipsis;
                     white-space: nowrap;`,
    ".projectCount": `background: rgba(0,0,0,0.7);
                      backdrop-filter: blur(10px);
                      -webkit-backdrop-filter: blur(10px);
                      padding: 3px 6px;
                      font-weight: bold;
                      font-size: 13px;
                      border-radius: 100px;
                      color: white;
                      display: flex;
                      align-items: flex-end;
                      gap: 3px`,
    ".projectCount .symbol": `font-weight: normal;`,
    ".projectCounts": `display: flex;
                       gap: 5px;`,
    ".projectCounts .spacer": `flex-grow: 1;`,
    ".projectAttr": `display: flex;
                     gap: 5px;
                     align-items: center;`,
    ".projectPfp": `width: 20px;
                    height: 20px;
                    border-radius: 100px;
                    object-fit: cover;`,
    ".projectUsername": `font-weight: bold;
                         font-size: 13px;
                         flex-grow: 1;
                         overflow: hidden;
                         text-overflow: ellipsis;
                         white-space: nowrap;`
  }
};
