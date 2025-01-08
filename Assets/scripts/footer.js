const footer = document.createElement('footer');
footer.className = "footer";
footer.innerHTML = `
<div class="social-buttons">
    <button id="dismiss-footer" style="position: absolute; top: 0px; left: 0px; background-image: none"> 
    X 
    </button>
    <a href="https://discord.gg/S8XTzKEz5f" target="_blank" class="social-btn discord-btn">
        <i class="fab fa-discord"></i> Discord
    </a>
    <a href="https://github.com/watermelonkatanadevs" target="_blank" class="social-btn github-btn">
        <i class="fab fa-github"></i> GitHub
    </a>
    <a href="https://www.linkedin.com/company/watermelonkatana/" target="_blank" class="social-btn linkedin-btn">
        <i class="fab fa-linkedin"></i> LinkedIn
    </a>
    <a href="https://twitter.com/WatermelonKatana" target="_blank" class="social-btn twitter-btn">
        <i class="fab fa-twitter"></i> Twitter
    </a>
    <a href="https://buymeacoffee.com/watermelonkatana" target="_blank" class="social-btn coffee-btn">
        <i class="fas fa-coffee"></i> BuyMeCoffee
    </a>
    <a href="https://www.patreon.com/watermelonkatana?utm_medium=unknown&amp;utm_source=join_link&amp;utm_campaign=creatorshare_creator&amp;utm_content=copyLink" target="_blank" class="social-btn patreon-btn">
        <i class="fab fa-patreon"></i> Patreon  
    </a>
</div>
<div class="footer-info">
    <p>Email: <a href="mailto:admin@watermelonkatana.com">admin@watermelonkatana.com</a></p>
    <p>&copy; 2024 - 2025 WatermelonKatana. All rights reserved.</p>
    <p>Stay updated with our <a href="/faq">FAQ</a>!</p>
</div>
`;
footer.onclick = function() {
    let target = document.querySelector(".container");
    document.querySelector("#dismiss-footer").remove();
    target.innerHTML += `<div class="${footer.className}" style="position: inherit">${footer.innerHTML}</div>`;
    document.getElementsByTagName("footer")[0].remove();
    localStorage.footerDissmissed = true;
}
document.body.appendChild(footer);
if(localStorage.footerDissmissed) { document.querySelector("button").click(); }