/**
 * Ability Cards — runtime DOM enhancements for Draw Steel content.
 *
 * 1. Classifies blockquote ability cards by emoji prefix (data-ability-type).
 * 2. Color-codes power roll tier list items (≤11 / 12-16 / 17+).
 * 3. Wraps wide tables in scroll containers for mobile.
 */
(function () {
  "use strict";

  /* ── Emoji → ability type mapping ── */
  var EMOJI_MAP = [
    { pattern: "\uD83D\uDDE1",  type: "strike"    },  // 🗡
    { pattern: "\uD83C\uDFF9",  type: "ranged"    },  // 🏹
    { pattern: "\uD83D\uDC64",  type: "maneuver"  },  // 👤
    { pattern: "\u2757",         type: "triggered" },  // ❗
    { pattern: "\u2747",         type: "area"      },  // ❇
    { pattern: "\u2B50",         type: "passive"   },  // ⭐
    { pattern: "\u2620",         type: "villain"   },  // ☠
    { pattern: "\uD83C\uDF00",  type: "special"   },  // 🌀
  ];

  /* Text-based fallback patterns for ability type detection */
  var TEXT_PATTERNS = [
    { pattern: /\bSignature Ability\b/i,  type: "strike"    },
    { pattern: /\bVillain Action\b/i,     type: "villain"   },
    { pattern: /\bTriggered [Aa]ction\b/, type: "triggered" },
  ];

  /* ── Power roll tier patterns ── */
  var TIER_LOW  = /^≤\s*11\s*:/;
  var TIER_MID  = /^12[\s\u2013\u2014-]+16\s*:/;
  var TIER_HIGH = /^17\+?\s*:/;

  /* ── Helpers ── */

  function getTextStart(el) {
    // Get the first ~80 chars of text content, trimmed
    return (el.textContent || "").slice(0, 80).trim();
  }

  function detectAbilityType(blockquote) {
    var text = getTextStart(blockquote);
    var i;

    // Check emoji prefixes first
    for (i = 0; i < EMOJI_MAP.length; i++) {
      if (text.indexOf(EMOJI_MAP[i].pattern) !== -1) {
        return EMOJI_MAP[i].type;
      }
    }

    // Fallback to text patterns
    for (i = 0; i < TEXT_PATTERNS.length; i++) {
      if (TEXT_PATTERNS[i].pattern.test(text)) {
        return TEXT_PATTERNS[i].type;
      }
    }

    return null;
  }

  /* ── Main enhancement functions ── */

  function classifyAbilityCards() {
    var blockquotes = document.querySelectorAll(".md-typeset blockquote");
    for (var i = 0; i < blockquotes.length; i++) {
      var bq = blockquotes[i];
      var type = detectAbilityType(bq);
      if (type) {
        bq.setAttribute("data-ability-type", type);
      }
    }
  }

  function colorPowerRollTiers() {
    // Target list items that contain bold text starting with tier patterns
    var listItems = document.querySelectorAll(".md-typeset li");
    for (var i = 0; i < listItems.length; i++) {
      var li = listItems[i];
      var strong = li.querySelector("strong:first-child");
      if (!strong) continue;

      var strongText = strong.textContent.trim();

      if (TIER_LOW.test(strongText)) {
        li.classList.add("power-tier-low");
      } else if (TIER_MID.test(strongText)) {
        li.classList.add("power-tier-mid");
      } else if (TIER_HIGH.test(strongText)) {
        li.classList.add("power-tier-high");
      }
    }
  }

  function wrapWideTables() {
    var tables = document.querySelectorAll(".md-typeset table:not([class])");
    for (var i = 0; i < tables.length; i++) {
      var table = tables[i];
      // Skip if already wrapped
      if (table.parentElement &&
          table.parentElement.classList.contains("table-scroll-wrapper")) {
        continue;
      }

      var wrapper = document.createElement("div");
      wrapper.className = "table-scroll-wrapper";
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);

      // Check if actually scrollable and add hint class
      checkScrollable(wrapper);
    }
  }

  function checkScrollable(wrapper) {
    if (wrapper.scrollWidth > wrapper.clientWidth) {
      wrapper.classList.add("is-scrollable");
      wrapper.addEventListener("scroll", function () {
        var atEnd = this.scrollLeft + this.clientWidth >= this.scrollWidth - 2;
        this.classList.toggle("scrolled-right", atEnd);
      });
    }
  }

  /* ── Initialization ── */

  function init() {
    classifyAbilityCards();
    colorPowerRollTiers();
    wrapWideTables();
  }

  // MkDocs Material uses instant loading — subscribe to its navigation event
  if (typeof document$ !== "undefined") {
    document$.subscribe(function () {
      init();
    });
  } else {
    // Fallback for non-instant navigation
    document.addEventListener("DOMContentLoaded", init);
  }
})();
