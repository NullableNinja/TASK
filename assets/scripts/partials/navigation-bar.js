/* ===========================
   NAVIGATION BAR BEHAVIOR
   ---------------------------
   - Scroll highlighting
   - Mobile hamburger toggle
   - Safe with partial injection
   =========================== */

// Wrap everything in a function we can call after nav loads
function initNavBar() {
  console.log("✅ initNavBar() running");

  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".nav-links a");
  const hamburger = document.querySelector(".navbar .hamburger");
  const navList = document.querySelector(".navbar .nav-links");

  if (!hamburger || !navList) {
    console.warn("❌ Navbar elements not found, aborting initNavBar");
    return;
  }

  /* ---------------------------------------
     1. Scroll highlighting
     --------------------------------------- */
  window.addEventListener("scroll", () => {
    let current = "";

    sections.forEach(section => {
      const top = section.offsetTop - 80;
      if (scrollY >= top) {
        current = section.getAttribute("id");
      }
    });

    navLinks.forEach(link => {
      link.classList.remove("active");
      if (current && link.getAttribute("href").includes(`#${current}`)) {
        link.classList.add("active");
      }
    });
  });

  /* ---------------------------------------
     2. Mobile hamburger toggle
     --------------------------------------- */
  hamburger.addEventListener("click", () => {
    console.log("🍔 Hamburger clicked");
    navList.classList.toggle("active");
    hamburger.classList.toggle("open");
  });

  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      navList.classList.remove("active");
      hamburger.classList.remove("open");
    });
  });
}

// ✅ Option A: if partials.js fires a custom event when it injects nav
document.addEventListener("partialsLoaded:navbar", initNavBar);

// ✅ Option B fallback: observe #site-header until .navbar appears
const headerObserver = new MutationObserver(() => {
  if (document.querySelector(".navbar .hamburger")) {
    initNavBar();
    headerObserver.disconnect();
  }
});
headerObserver.observe(document.getElementById("site-header"), { childList: true });
