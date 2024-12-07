const footer = document.createElement('footer');
footer.className = "footer";
footer.innerHTML = `
<div class="social-buttons">
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
</div>
<div class="footer-info">
    <p>Email: <a href="mailto:admin@watermelonkatana.com">admin@watermelonkatana.com</a></p>
    <p>&copy; 2024 WatermelonKatana. All rights reserved.</p>
    <p>Stay updated with our <a href="/news">latest news</a>!</p>
</div>
`;

document.body.appendChild(footer);