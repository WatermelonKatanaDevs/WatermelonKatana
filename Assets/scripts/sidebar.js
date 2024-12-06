const sidebar = document.getElementById('sidebar');
const hamburger = document.getElementById('hamburger');

sidebar.innerHTML = `
    <div class="sidebar-header">
        <img class="katana_logo" src="/images/watermelonexplode.png" alt="Sidebar Logo">
    </div>
    <a href="#" class="active">Home</a>
    <a href="#" class="inactive">Games</a>
    <a href="#" class="inactive">Chat</a>
    <a href="#" class="inactive">Profile</a>
`;

document.body.appendChild(sidebar);

hamburger.addEventListener('click', () => {
    sidebar.classList.toggle('open');
});
