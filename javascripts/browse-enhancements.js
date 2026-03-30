/**
 * Browse Enhancements — category item counts and card improvements.
 *
 * On the Browse index page, fetches each category's index page and
 * adds an item count badge to each grid card.
 */
(function () {
  "use strict";

  function isBrowseIndex() {
    // Match /Browse/ or /Browse/index.html
    var path = window.location.pathname;
    return /\/Browse\/?(?:index\.html)?$/.test(path);
  }

  function extractCount(html) {
    // Count list items in the browse-index div or grid cards
    var parser = new DOMParser();
    var doc = parser.parseFromString(html, "text/html");

    // browse-index ul li pattern (used by _Index.md pages)
    var items = doc.querySelectorAll(".browse-index li");
    if (items.length > 0) return items.length;

    // Fallback: count links in the main content
    var links = doc.querySelectorAll(".md-content a[href]");
    return links.length > 0 ? links.length : null;
  }

  function addCountBadge(card, count) {
    if (!count) return;
    var h3 = card.querySelector("h3");
    if (!h3) return;

    var badge = document.createElement("span");
    badge.className = "browse-card-count";
    badge.textContent = count;
    badge.title = count + " items";
    h3.appendChild(badge);
  }

  function enhanceBrowseCards() {
    if (!isBrowseIndex()) return;

    var cards = document.querySelectorAll(".grid.cards > ul > li");
    if (cards.length === 0) return;

    cards.forEach(function (card) {
      var link = card.querySelector("a[href]");
      if (!link) return;

      var href = link.getAttribute("href");
      if (!href) return;

      // Resolve relative URL
      var url = new URL(href, window.location.href);

      fetch(url.href, { credentials: "same-origin" })
        .then(function (res) {
          if (!res.ok) return null;
          return res.text();
        })
        .then(function (html) {
          if (html) {
            var count = extractCount(html);
            addCountBadge(card, count);
          }
        })
        .catch(function () {
          // Silently fail — counts are a nice-to-have
        });
    });
  }

  // MkDocs Material instant navigation support
  if (typeof document$ !== "undefined") {
    document$.subscribe(function () {
      enhanceBrowseCards();
    });
  } else {
    document.addEventListener("DOMContentLoaded", enhanceBrowseCards);
  }
})();
