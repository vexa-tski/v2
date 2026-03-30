/**
 * Keyboard Navigation — shortcuts for power users.
 *
 * ? — show/hide shortcut help overlay
 * b — go to Browse
 * r — go to Read (Rulebook Chapters)
 * m — go to Bestiary (Monsters)
 * Escape — close overlay
 *
 * All shortcuts are suppressed when an input/textarea/select is focused.
 * The search shortcut (/) is handled natively by MkDocs Material.
 */
(function () {
  "use strict";

  var overlay = null;
  var HINT_KEY = "mkdocs:kbHintShown";

  /* ── Navigation targets (relative to site root) ── */
  var NAV = {
    b: "Browse/",
    r: "Read/",
    m: "Bestiary/",
  };

  /* ── Overlay ── */

  function createOverlay() {
    if (overlay) return overlay;

    overlay = document.createElement("div");
    overlay.className = "kb-shortcut-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-label", "Keyboard shortcuts");

    overlay.innerHTML =
      '<div class="kb-shortcut-dialog">' +
        '<h3>Keyboard Shortcuts</h3>' +
        '<table>' +
          '<tr><td><kbd>/</kbd></td><td>Focus search</td></tr>' +
          '<tr><td><kbd>b</kbd></td><td>Browse rules</td></tr>' +
          '<tr><td><kbd>r</kbd></td><td>Rulebook chapters</td></tr>' +
          '<tr><td><kbd>m</kbd></td><td>Bestiary / Monsters</td></tr>' +
          '<tr><td><kbd>?</kbd></td><td>Toggle this help</td></tr>' +
          '<tr><td><kbd>Esc</kbd></td><td>Close overlay</td></tr>' +
        '</table>' +
        '<p class="kb-shortcut-hint">Shortcuts are disabled while typing in search or inputs.</p>' +
      '</div>';

    // Inline styles
    var s = overlay.style;
    s.display = "none";
    s.position = "fixed";
    s.inset = "0";
    s.zIndex = "9998";
    s.background = "rgba(0, 0, 0, 0.6)";
    s.alignItems = "center";
    s.justifyContent = "center";

    var dialog = overlay.querySelector(".kb-shortcut-dialog");
    var ds = dialog.style;
    ds.background = "var(--md-default-bg-color, #fff)";
    ds.color = "var(--md-default-fg-color, #333)";
    ds.borderRadius = "0.6em";
    ds.padding = "1.5em 2em";
    ds.maxWidth = "24em";
    ds.boxShadow = "0 8px 32px rgba(0,0,0,0.3)";

    var h3 = dialog.querySelector("h3");
    h3.style.margin = "0 0 0.8em";
    h3.style.fontSize = "1.2em";

    var table = dialog.querySelector("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";

    var tds = dialog.querySelectorAll("td");
    for (var i = 0; i < tds.length; i++) {
      tds[i].style.padding = "0.3em 0.5em";
      tds[i].style.borderBottom = "1px solid var(--md-default-fg-color--lightest)";
    }

    var kbds = dialog.querySelectorAll("kbd");
    for (var j = 0; j < kbds.length; j++) {
      var ks = kbds[j].style;
      ks.display = "inline-block";
      ks.padding = "0.15em 0.5em";
      ks.fontSize = "0.85em";
      ks.fontFamily = "var(--md-code-font, monospace)";
      ks.background = "var(--md-code-bg-color, #f5f5f5)";
      ks.border = "1px solid var(--md-default-fg-color--lightest)";
      ks.borderRadius = "0.25em";
      ks.minWidth = "1.5em";
      ks.textAlign = "center";
    }

    var hint = dialog.querySelector(".kb-shortcut-hint");
    hint.style.marginTop = "1em";
    hint.style.fontSize = "0.8em";
    hint.style.color = "var(--md-default-fg-color--light)";

    // Close on backdrop click
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) toggleOverlay(false);
    });

    document.body.appendChild(overlay);
    return overlay;
  }

  function toggleOverlay(show) {
    var el = createOverlay();
    if (typeof show === "undefined") {
      show = el.style.display === "none";
    }
    el.style.display = show ? "flex" : "none";
  }

  /* ── Helpers ── */

  function isInputFocused() {
    var tag = document.activeElement.tagName;
    return (
      tag === "INPUT" ||
      tag === "TEXTAREA" ||
      tag === "SELECT" ||
      document.activeElement.isContentEditable
    );
  }

  function navigateTo(path) {
    // Build absolute URL from site root
    var base = document.querySelector('meta[name="site_url"]');
    var siteUrl = base ? base.getAttribute("content") : "";

    if (!siteUrl) {
      // Fallback: guess from current path structure
      var loc = window.location.pathname;
      var v2Idx = loc.indexOf("/v2/");
      siteUrl = v2Idx !== -1 ? loc.slice(0, v2Idx + 4) : "/";
    }

    if (siteUrl.charAt(siteUrl.length - 1) !== "/") siteUrl += "/";
    window.location.href = siteUrl + path;
  }

  /* ── First-visit hint ── */

  function showFirstVisitHint() {
    if (localStorage.getItem(HINT_KEY)) return;

    var hint = document.createElement("div");
    hint.className = "kb-first-hint";
    hint.textContent = "Press ? for keyboard shortcuts";

    var hs = hint.style;
    hs.position = "fixed";
    hs.bottom = "1em";
    hs.right = "1em";
    hs.padding = "0.5em 1em";
    hs.background = "var(--md-accent-fg-color, #448aff)";
    hs.color = "#fff";
    hs.borderRadius = "0.4em";
    hs.fontSize = "0.85em";
    hs.zIndex = "9000";
    hs.opacity = "1";
    hs.transition = "opacity 0.5s ease";
    hs.cursor = "pointer";
    hs.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";

    hint.addEventListener("click", function () {
      hint.remove();
      toggleOverlay(true);
    });

    document.body.appendChild(hint);
    localStorage.setItem(HINT_KEY, "1");

    // Auto-dismiss after 6 seconds
    setTimeout(function () {
      hs.opacity = "0";
      setTimeout(function () { hint.remove(); }, 600);
    }, 6000);
  }

  /* ── Key handler ── */

  function onKeyDown(e) {
    // Ignore if modifier keys are held (except shift for ?)
    if (e.ctrlKey || e.altKey || e.metaKey) return;

    // Close overlay on Escape
    if (e.key === "Escape") {
      if (overlay && overlay.style.display !== "none") {
        toggleOverlay(false);
        e.preventDefault();
      }
      return;
    }

    // Don't intercept when typing
    if (isInputFocused()) return;

    if (e.key === "?") {
      toggleOverlay();
      e.preventDefault();
      return;
    }

    var key = e.key.toLowerCase();
    if (NAV[key]) {
      navigateTo(NAV[key]);
      e.preventDefault();
    }
  }

  /* ── Init ── */

  function init() {
    // Remove previous listeners (instant navigation)
    document.removeEventListener("keydown", onKeyDown);
    document.addEventListener("keydown", onKeyDown);

    showFirstVisitHint();
  }

  if (typeof document$ !== "undefined") {
    document$.subscribe(function () { init(); });
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }
})();
