/* ===========================
   PARTIALS LOADER (Bulletproof)
   ---------------------------
   - Explicitly handles root vs /web/ (your structure)
   - Never requests /web/partials/ again
   =========================== */

document.addEventListener("DOMContentLoaded", () => {
  function resolvePath(relativePath) {
    const path = window.location.pathname;

    // If the page lives in /web/, always go up one level
    if (path.startsWith("/web/")) {
      return "../" + relativePath;
    }

    // Otherwise assume root
    return relativePath;
  }

  function loadPartial(path, targetId, callback) {
    const resolved = resolvePath(path);
    fetch(resolved)
      .then(response => {
        if (!response.ok) throw new Error(`Failed to load: ${resolved}`);
        return response.text();
      })
      .then(html => {
        document.getElementById(targetId).innerHTML = html;
        console.log(`✅ Loaded partial: ${resolved} → #${targetId}`);

        if (typeof callback === "function") callback();
      })
      .catch(err => console.error(`❌ Error loading partial: ${resolved}`, err));
  }

  // Load navigation bar
  loadPartial("partials/navigation-bar.html", "site-header", () => {
    const navScript = document.createElement("script");
    navScript.src = resolvePath("assets/scripts/partials/navigation-bar.js");
    navScript.defer = true;
    document.body.appendChild(navScript);
    console.log("🔄 Navigation bar script re-injected");
  });

  // Load footer
  loadPartial("partials/footer.html", "site-footer");
});
