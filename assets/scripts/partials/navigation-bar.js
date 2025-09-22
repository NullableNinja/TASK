/* ===========================
   NAVIGATION BAR BEHAVIOR
   ---------------------------
   - Highlights the current nav link as the user scrolls
   - Runs after the DOM is fully loaded
   =========================== */

document.addEventListener("DOMContentLoaded", () => {
  /* ---------------------------------------
     1. Grab all sections in <main> with IDs
        (e.g., #home, #programs, #carousel)
     --------------------------------------- */
  const sections = document.querySelectorAll("main section[id]");

  /* ---------------------------------------
     2. Grab all nav links (<a>) inside .nav-links
     --------------------------------------- */
  const navLinks = document.querySelectorAll(".nav-links a");

  /* ---------------------------------------
     3. Watch for scroll events
        - Determines which section is currently in view
        - Updates nav link classes accordingly
     --------------------------------------- */
  window.addEventListener("scroll", () => {
    let current = "";

    // Loop through each section
    sections.forEach(section => {
      const top = section.offsetTop - 80; // 80px offset for fixed navbar
      if (scrollY >= top) {
        current = section.getAttribute("id"); // store current section ID
      }
    });

    // Loop through nav links and update "active" state
    navLinks.forEach(link => {
      link.classList.remove("active"); // reset all links
      if (link.getAttribute("href").includes(`#${current}`)) {
        link.classList.add("active"); // highlight current link
      }
    });
  });
});
