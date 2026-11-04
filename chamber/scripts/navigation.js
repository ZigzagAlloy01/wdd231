const menuButton = document.querySelector("#menu-toggle");
const primaryNavigation = document.querySelector("#primary-navigation");
const themeButton = document.querySelector("#theme-toggle");

const closeNavigation = () => {
    if (!menuButton || !primaryNavigation) return;
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation menu");
    primaryNavigation.classList.remove("is-open");
};

if (menuButton && primaryNavigation) {
    menuButton.addEventListener("click", () => {
        const isExpanded = menuButton.getAttribute("aria-expanded") === "true";
        menuButton.setAttribute("aria-expanded", String(!isExpanded));
        menuButton.setAttribute("aria-label", isExpanded ? "Open navigation menu" : "Close navigation menu");
        primaryNavigation.classList.toggle("is-open", !isExpanded);
    });

    primaryNavigation.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", closeNavigation);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeNavigation();
    });

    window.addEventListener("resize", () => {
        if (window.matchMedia("(min-width: 48rem)").matches) closeNavigation();
    });
}

if (themeButton) {
    themeButton.addEventListener("click", () => {
        const isDark = document.documentElement.dataset.theme === "dark";
        document.documentElement.dataset.theme = isDark ? "light" : "dark";
        themeButton.setAttribute("aria-pressed", String(!isDark));
        themeButton.setAttribute("aria-label", isDark ? "Switch to dark theme" : "Switch to light theme");
    });
}