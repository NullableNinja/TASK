/* ===========================
   BASE.JS — GLOBAL HELPERS
   =========================== */

/* ===========================
   1. SMOOTH SCROLL FOR ANCHOR LINKS
   =========================== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", e => {
    e.preventDefault();

    const target = document.querySelector(anchor.getAttribute("href"));
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});

/* ===========================
   2. RETURN TO TOP BUTTON
   =========================== */
const toTopBtn = document.getElementById("toTopBtn");

if (toTopBtn) {
  console.log("✅ ToTop button found");

  // Check visibility on load
  if (window.scrollY > 200) {
    toTopBtn.classList.add("show");
  }

  // Show/hide on scroll
  window.addEventListener("scroll", () => {
    if (window.scrollY > 200) {
      toTopBtn.classList.add("show");
    } else {
      toTopBtn.classList.remove("show");
    }
  });

  // Scroll back to top on click
  toTopBtn.addEventListener("click", () => {
    console.log("⬆️ ToTop clicked");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
} else {
  console.warn("❌ ToTop button NOT found in DOM");
}

/* ===========================
   3. SCROLL INDICATOR BELT BAR
   =========================== */
const scrollBar = document.getElementById("scroll-indicator");

if (scrollBar) {
  const belts = [
    "white",   // White
    "#FFD700", // Gold
    "#FF8C00", // Orange
    "#228B22", // Green
    "#800080", // Purple
    "#1E90FF", // Blue
    "#B22222", // Red
    "#8B4513", // Brown
    "#000000"  // Black
  ];

  window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = (scrollTop / docHeight) * 100;

    // Update width
    scrollBar.style.width = scrolled + "%";

    // Pick belt color by dividing scroll progress into 9 equal parts
    const index = Math.min(Math.floor((scrolled / 100) * belts.length), belts.length - 1);
    scrollBar.style.background = belts[index];
  });
}
