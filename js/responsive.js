/* RESPONSIVE NAVIGATION (mobile / tablet drawer) */

document.addEventListener("DOMContentLoaded", () => {

    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.getElementById("sidebarOverlay");

    if (!menuToggle || !sidebar || !overlay) return;

    function openSidebar() {
        sidebar.classList.add("open");
        overlay.classList.add("active");
        document.body.classList.add("sidebar-locked");
    }

    function closeSidebar() {
        sidebar.classList.remove("open");
        overlay.classList.remove("active");
        document.body.classList.remove("sidebar-locked");
    }

    function toggleSidebar() {
        if (sidebar.classList.contains("open")) {
            closeSidebar();
        } else {
            openSidebar();
        }
    }

    menuToggle.addEventListener("click", toggleSidebar);
    overlay.addEventListener("click", closeSidebar);

    /* Close the drawer whenever a nav link is tapped (mobile UX) */
    sidebar.querySelectorAll(".menu-item").forEach((link) => {
        link.addEventListener("click", closeSidebar);
    });

    /* Close on Escape key */
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeSidebar();
    });

    /* If the viewport is resized back up to desktop, make sure the
       drawer state doesn't linger in a broken state */
    window.addEventListener("resize", () => {
        if (window.innerWidth > 1024) {
            closeSidebar();
        }
    });
});
