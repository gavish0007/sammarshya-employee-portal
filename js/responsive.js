const menuToggle = document.getElementById("menuToggle");
const sidebar = document.querySelector(".sidebar");

if (menuToggle) {

    menuToggle.addEventListener("click", () => {

        sidebar.classList.toggle("active");

    });

}

document.querySelectorAll(".menu-item").forEach(item => {

    item.addEventListener("click", () => {

        if (window.innerWidth <= 768) {

            sidebar.classList.remove("active");

        }

    });

});