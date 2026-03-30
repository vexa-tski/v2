/**
 * Reading Progress Bar — thin accent-colored bar at top of viewport
 * for long pages (Full Book, Read chapters).
 *
 * Only shows on pages taller than 3x the viewport height.
 */
(function () {
  "use strict";

  var bar = null;
  var ticking = false;

  function createBar() {
    if (bar) return bar;

    bar = document.createElement("div");
    bar.className = "reading-progress-bar";
    bar.setAttribute("role", "progressbar");
    bar.setAttribute("aria-valuemin", "0");
    bar.setAttribute("aria-valuemax", "100");
    bar.setAttribute("aria-valuenow", "0");

    // Inline styles to avoid needing a separate CSS file
    var s = bar.style;
    s.position = "fixed";
    s.top = "0";
    s.left = "0";
    s.width = "0%";
    s.height = "3px";
    s.zIndex = "9999";
    s.transition = "width 0.1s linear";
    s.pointerEvents = "none";

    // Use accent color from Material theme
    s.background = "var(--md-accent-fg-color, #448aff)";

    document.body.appendChild(bar);
    return bar;
  }

  function updateProgress() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight;
    var winHeight = window.innerHeight;
    var scrollable = docHeight - winHeight;

    if (scrollable <= 0) {
      if (bar) bar.style.width = "0%";
      return;
    }

    var pct = Math.min(100, Math.round((scrollTop / scrollable) * 100));

    if (bar) {
      bar.style.width = pct + "%";
      bar.setAttribute("aria-valuenow", String(pct));
    }

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateProgress);
    }
  }

  function init() {
    // Clean up previous bar (instant navigation reloads)
    if (bar) {
      bar.remove();
      bar = null;
    }
    window.removeEventListener("scroll", onScroll);

    // Only show on pages taller than 3x viewport
    var docHeight = document.documentElement.scrollHeight;
    var winHeight = window.innerHeight;

    if (docHeight < winHeight * 3) return;

    createBar();
    window.addEventListener("scroll", onScroll, { passive: true });
    updateProgress();
  }

  // MkDocs Material instant navigation support
  if (typeof document$ !== "undefined") {
    document$.subscribe(function () {
      init();
    });
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }
})();
