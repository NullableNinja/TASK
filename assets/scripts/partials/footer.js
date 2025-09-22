/* ===========================
   FOOTER.JS — Enhancements
   ---------------------------
   - Example: auto-update copyright year
   =========================== */
document.addEventListener("DOMContentLoaded", () => {
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
});
