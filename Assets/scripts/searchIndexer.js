const pageType = location.pathname === "/search" ? "project" : "forum";
const pageParser = pageType === "project" ? projHTML : forumHTML;
const cacheType = pageType === "project" ? "projects" : "posts";
const pages = {};
const projectsPerPage = 30;
let currentPage = location.search.match(/page=([\d]+)/);
let tok;

if (currentPage === null) { currentPage = 1; }
else { currentPage = parseInt(currentPage[1]); }

async function searchIndex(pageNumber) {
    if (typeof tok === "undefined") { tok = await getAuth() }
    const params = new URLSearchParams(location.search);
    const id = params.get("query") ? "QUERY:" + params.get("query") : "SORT:" + params.get("sort");
    const mature = tok.user?.mature;
    let maxPage, cachePage = pages[id] = pages[id] || { [cacheType]: [] };
    currentPage = pageNumber || currentPage;
    list.innerHTML = '';

    mainIndex(true).then(posts => {
        posts.forEach(post => pageParser(list, tok)(post));
        checkArrows();
    });

    previous.onclick = async e => await changePage(e, -1);

    next.onclick = async e => await changePage(e, 1);

    async function mainIndex(omitState) {
        let params = new URLSearchParams(location.search);
        let page = currentPage;
        if (mature) { params.set("showMature", mature) }
        if (!omitState) { params.set("page", currentPage); }
        else if (!Number.isSafeInteger(parseInt(params.get("page")))) { params.set("page", currentPage); }
        history.replaceState({}, "", buildUrl(params));
        if (cachePage[cacheType][page - 1] === undefined) {
            const endpoint = params.get("query") ? 'search' : 'list';
            const res = await fetch(`/api/${pageType}/${endpoint}?${params}`);
            const data = await res.json();
            cachePage.length = data.length;
            cachePage[cacheType][page - 1] = data[cacheType];
        }
        if (!params.get("total")) {
            params.set("total", cachePage.length);
            history.replaceState({}, "", buildUrl(params));
        }
        maxPage = Math.ceil(cachePage.length / projectsPerPage);
        return page === currentPage ? cachePage[cacheType][page - 1] : [];
    }

    function checkArrows() {
        if ((currentPage + 1) > maxPage) { next.style.visibility = "hidden"; }
        else { next.style.visibility = ""; }
        pageCounter.textContent = `${currentPage} / ${maxPage}`;
        if ((currentPage - 1) < 1) { previous.style.visibility = "hidden"; }
        else { previous.style.visibility = ""; }
    }

    async function changePage(e, amount) {
        e.preventDefault();
        list.innerHTML = '';
        currentPage += amount;
        checkArrows();
        let posts = await mainIndex();
        posts.forEach(post => pageParser(list, tok)(post));
    }

    window.onpopstate = async () => {
        let params = new URLSearchParams(location.search);
        let page = parseInt(params.get("page")) || 1;
        let oldCache = cachePage;
        cachePage = pages[(params.get("query") ? "QUERY:" + params.get("query") : "SORT:" + params.get("sort"))];
        if (page !== currentPage || oldCache !== cachePage) {
            list.innerHTML = '';
            currentPage = page;
            let projectPage = await mainIndex(true);
            checkArrows();
            projectPage.forEach(proj => pageParser(list, tok)(proj));
        }
    }
}

function buildUrl(params) {
    const url = new URL(window.location);
    url.search = new URLSearchParams(params).toString();
    return url;
}