/* ===========================
   PARTIALS LOADER (Your Structure)
   ---------------------------
   - Injects nav/footer partials into index.html
   - Uses ./partials/ (not ./assets/partials/)
   =========================== */

document.addEventListener("DOMContentLoaded", () => {
  function loadPartial(path, targetId, callback) {
    fetch(path)
      .then(response => {
        if (!response.ok) throw new Error(`Failed to load: ${path}`);
        return response.text();
      })
      .then(html => {
        document.getElementById(targetId).innerHTML = html;
        console.log(`✅ Loaded partial: ${path} → #${targetId}`);

        if (typeof callback === "function") callback();
      })
      .catch(err => console.error(`❌ Error loading partial: ${path}`, err));
  }

  // Load navigation bar
  loadPartial("partials/navigation-bar.html", "site-header", () => {
    const navScript = document.createElement("script");
    navScript.src = "assets/scripts/partials/navigation-bar.js";
    navScript.defer = true;
    document.body.appendChild(navScript);
    console.log("🔄 Navigation bar script re-injected");
  });

  // Load footer
  loadPartial("partials/footer.html", "site-footer");
});
