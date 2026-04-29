/* ============================================================
   EDD Weekly Deck — minimal slide controller
   Shared by all six weekly decks. Single static HTML file,
   one slide visible at a time, hash-driven navigation.

   Keys:
     Right / Space / PgDn  -> next
     Left  / PgUp          -> prev
     Home                  -> first slide
     End                   -> last slide
     N                     -> toggle speaker notes panel
     F                     -> toggle fullscreen
     Digits + Enter        -> jump to slide N (e.g. type "12" then Enter)
                              digits buffer for ~700ms then auto-jump

   URL params:
     #slide-12              -> open at slide 12
     ?notes=1               -> open with notes panel visible
   ============================================================ */
(function () {
  "use strict";

  var slides = Array.prototype.slice.call(document.querySelectorAll(".slide"));
  if (!slides.length) return;

  var total = slides.length;
  var current = 0;

  // Build chrome
  var chrome = document.createElement("div");
  chrome.className = "deck-chrome";
  chrome.innerHTML =
    '<button data-action="prev" aria-label="Previous slide">&larr; Prev</button>' +
    '<span class="deck-counter"><span id="deck-cur">1</span> / <span id="deck-total">' + total + '</span></span>' +
    '<button data-action="next" aria-label="Next slide">Next &rarr;</button>' +
    '<button data-action="notes" aria-label="Toggle speaker notes">Notes</button>' +
    '<button data-action="full" aria-label="Toggle fullscreen">Full</button>';
  document.body.appendChild(chrome);

  // Build notes panel
  var notesPanel = document.createElement("aside");
  notesPanel.className = "deck-notes";
  notesPanel.setAttribute("aria-label", "Speaker notes");
  notesPanel.innerHTML = '<h3>Speaker Notes</h3><div id="deck-notes-body"></div>';
  document.body.appendChild(notesPanel);

  var notesBody = notesPanel.querySelector("#deck-notes-body");
  var counterEl = chrome.querySelector("#deck-cur");

  // Assign positional ids if missing & set foot numbers
  slides.forEach(function (s, i) {
    if (!s.id) s.id = "slide-" + (i + 1);
    var foot = s.querySelector(".slide__foot .foot__num");
    if (foot && !foot.dataset.locked) {
      foot.textContent = String(i + 1).padStart(2, "0") + " / " + String(total).padStart(2, "0");
    }
  });

  function show(i) {
    if (i < 0) i = 0;
    if (i >= total) i = total - 1;
    slides[current].classList.remove("is-current");
    current = i;
    slides[current].classList.add("is-current");
    counterEl.textContent = String(current + 1);

    // Pull notes for this slide
    var note = slides[current].querySelector(".notes");
    notesBody.innerHTML = note ? note.innerHTML : "<p><em>No speaker notes for this slide.</em></p>";

    // Sync hash (without scroll jumping)
    var newHash = "#" + slides[current].id;
    if (window.location.hash !== newHash) {
      history.replaceState(null, "", newHash);
    }
  }

  function next() { show(current + 1); }
  function prev() { show(current - 1); }
  function first() { show(0); }
  function last() { show(total - 1); }

  function toggleNotes() {
    notesPanel.classList.toggle("is-open");
  }

  function toggleFullscreen() {
    var doc = document;
    var el = document.documentElement;
    if (!doc.fullscreenElement && !doc.webkitFullscreenElement) {
      (el.requestFullscreen || el.webkitRequestFullscreen || function () {}).call(el);
    } else {
      (doc.exitFullscreen || doc.webkitExitFullscreen || function () {}).call(doc);
    }
  }

  // Buffered numeric input for jump-to-slide
  var numBuffer = "";
  var numTimer = null;
  function handleNumber(d) {
    numBuffer += d;
    clearTimeout(numTimer);
    numTimer = setTimeout(function () {
      var n = parseInt(numBuffer, 10);
      numBuffer = "";
      if (!isNaN(n) && n >= 1 && n <= total) show(n - 1);
    }, 700);
  }

  document.addEventListener("keydown", function (e) {
    // Ignore if user is typing in an input
    var t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;

    switch (e.key) {
      case "ArrowRight":
      case "PageDown":
      case " ":
        e.preventDefault(); next(); break;
      case "ArrowLeft":
      case "PageUp":
        e.preventDefault(); prev(); break;
      case "Home":
        e.preventDefault(); first(); break;
      case "End":
        e.preventDefault(); last(); break;
      case "n":
      case "N":
        e.preventDefault(); toggleNotes(); break;
      case "f":
      case "F":
        e.preventDefault(); toggleFullscreen(); break;
      case "Enter":
        if (numBuffer) {
          e.preventDefault();
          var n = parseInt(numBuffer, 10);
          numBuffer = "";
          clearTimeout(numTimer);
          if (!isNaN(n) && n >= 1 && n <= total) show(n - 1);
        }
        break;
      default:
        if (/^[0-9]$/.test(e.key)) {
          e.preventDefault();
          handleNumber(e.key);
        }
    }
  });

  chrome.addEventListener("click", function (e) {
    var btn = e.target.closest("button");
    if (!btn) return;
    switch (btn.dataset.action) {
      case "next": next(); break;
      case "prev": prev(); break;
      case "notes": toggleNotes(); break;
      case "full": toggleFullscreen(); break;
    }
  });

  // Click anywhere on the slide (but not on chrome / notes / links / buttons)
  // advances. Standard expectation for a presenter clicker.
  document.addEventListener("click", function (e) {
    if (e.target.closest(".deck-chrome")) return;
    if (e.target.closest(".deck-notes")) return;
    if (e.target.closest("a, button, input, textarea, select")) return;
    next();
  });

  // Initial state from URL
  var initial = 0;
  if (window.location.hash) {
    var idx = slides.findIndex(function (s) { return "#" + s.id === window.location.hash; });
    if (idx >= 0) initial = idx;
  }
  show(initial);

  if (/[?&]notes=1\b/.test(window.location.search)) {
    notesPanel.classList.add("is-open");
  }
})();
