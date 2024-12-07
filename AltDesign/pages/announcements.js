pages.announcements = {
  title: "What's New",
  wireframe: `
    <div class="updatePageTitle">What's New</div>
  `,
  code: async function () {
    let announcements = [
      {
        title: "Test Announcement",
        date: "December 7th, 2024",
        content: `heheheha`
      }
    ];
    
    function createUpdate(data) {
      let thisUpdate = createElement("update", "div", findI("main"));
      thisUpdate.innerHTML = `<div class="updateTitle">${data.title}</div>
      <div class="updateTime">${data.date}</div>
      <div>${data.content}</div>`;
    }
    announcements.reverse();
    for (let i in announcements) {
      createUpdate(announcements[i]);
    }
  },
  style: {
    ".updatePageTitle": `margin-block-start: 0.67em;
                         margin-block-end: 0.67em;
                         text-align: center;
                         font-size: 35px;
                         font-weight: bold;`,
    ".update": `background: var(--background);
                box-shadow: 0 3px 10px -1px rgba(0,0,0,0.2);
                margin: 10px;
                padding: 10px;
                border-radius: 10px;`,
    ".updateTitle": `font-size: 25px;
                     font-weight: bold;`,
    ".updateTime": `color: gray;`
  }
};
