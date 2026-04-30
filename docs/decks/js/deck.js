/* ============================================================
   EDD Weekly Deck — minimal slide controller
   Canonical script for all six weekly decks.

   - One slide visible at a time, hash-driven navigation.
   - Sets BOTH `.is-current` (Week 1 contract) and `.is-active`
     (Weeks 2-6 contract) on the active slide so any of the
     decks' CSS show/hide rules work without modification.
   - Reads speaker notes from the current slide via `.notes`,
     `.speaker-notes`, or `template.speaker-notes` (in that order).
   - Injects its own chrome (.deck-chrome) and notes panel (.deck-notes)
     unless the deck already provides one (#deck-chrome or #deck-notes).

   Keys:
     Right / Space / PgDn  -> next
     Left  / PgUp          -> prev
     Home                  -> first slide
     End                   -> last slide
     N                     -> toggle speaker notes panel
     F                     -> toggle fullscreen
     P                     -> open print dialog (one slide per page)
     Digits + Enter        -> jump to slide N

   URL params:
     #slide-12              -> open at slide 12
     ?notes=1               -> open with notes panel visible
     ?print=1               -> open in print-ready layout
     ?handout=1|2           -> printable handout: 2-up thumbnails + notes
     ?handout=4             -> printable handout: 4-up thumbnails + notes
       (combine with &print=1 to auto-open the print dialog)
   ============================================================ */
(function () {
  "use strict";

  var slides = Array.prototype.slice.call(document.querySelectorAll(".slide"));
  if (!slides.length) return;

  // ----- HANDOUT MODE -----
  // Renders all slides as scaled thumbnails alongside their speaker notes,
  // formatted as a single flowing document for printing/saving as PDF.
  // Returns early so the regular presenter controller (chrome, navigation,
  // single-slide visibility, fixed-frame auto-scaling) is bypassed.
  var handoutMatch = window.location.search.match(/[?&]handout=(\d*)/);
  if (handoutMatch) {
    var perPage = parseInt(handoutMatch[1], 10);
    if (perPage !== 4) perPage = 2;
    buildHandout(slides, perPage);
    if (/[?&]print=1\b/.test(window.location.search)) {
      setTimeout(function () { window.print(); }, 400);
    }
    return;
  }

  var total = slides.length;
  var current = 0;

  // ----- Build chrome (skip if deck already provides one) -----
  var chrome = document.getElementById("deck-chrome");
  if (!chrome) {
    chrome = document.createElement("div");
    chrome.id = "deck-chrome";
    chrome.className = "deck-chrome";
    chrome.innerHTML =
      '<button data-action="prev" aria-label="Previous slide">&larr; Prev</button>' +
      '<span class="deck-counter"><span id="deck-cur">1</span> / <span id="deck-total">' + total + '</span></span>' +
      '<button data-action="next" aria-label="Next slide">Next &rarr;</button>' +
      '<button data-action="notes" aria-label="Toggle speaker notes">Notes</button>' +
      '<button data-action="full" aria-label="Toggle fullscreen">Full</button>' +
      '<button data-action="print" aria-label="Print as PDF">Print</button>';
    document.body.appendChild(chrome);
  }

  var notesPanel = document.getElementById("deck-notes");
  if (!notesPanel) {
    notesPanel = document.createElement("aside");
    notesPanel.id = "deck-notes";
    notesPanel.className = "deck-notes";
    notesPanel.setAttribute("aria-label", "Speaker notes");
    notesPanel.innerHTML = '<h3>Speaker Notes</h3><div id="deck-notes-body"></div>';
    document.body.appendChild(notesPanel);
  }

  var notesBody = notesPanel.querySelector("#deck-notes-body") || notesPanel;
  var counterEl = chrome.querySelector("#deck-cur");

  // Assign positional ids if missing & set foot numbers (Week 1) and page-num (Weeks 2-6).
  slides.forEach(function (s, i) {
    if (!s.id) s.id = "slide-" + (i + 1);
    var foot = s.querySelector(".slide__foot .foot__num");
    if (foot && !foot.dataset.locked) {
      foot.textContent = String(i + 1).padStart(2, "0") + " / " + String(total).padStart(2, "0");
    }
    var pageNum = s.querySelector(".page-num");
    if (pageNum && !pageNum.dataset.locked) {
      pageNum.textContent = (i + 1) + " / " + total;
    }
  });

  // External-notes fallback (Week 4): single <aside id="notes"> with one
  // <div class="note-content"> per slide in slide order.
  var externalNotes = (function () {
    var aside = document.getElementById("notes");
    if (!aside) return null;
    var contents = aside.querySelectorAll(".note-content");
    return contents.length ? contents : null;
  })();

  function readNotes(slide, index) {
    // Prefer in-slide .notes (Week 1, 6); fall back to .speaker-notes (Week 3);
    // then <template class="speaker-notes"> (Weeks 2, 5);
    // finally external-notes block (Week 4).
    var note = slide.querySelector(".notes");
    if (note && note.tagName !== "TEMPLATE") return note.innerHTML;
    var sn = slide.querySelector(".speaker-notes");
    if (sn && sn.tagName !== "TEMPLATE") return sn.innerHTML;
    var tpl = slide.querySelector("template.speaker-notes, template.notes");
    if (tpl) return tpl.innerHTML;
    if (externalNotes && externalNotes[index]) return externalNotes[index].innerHTML;
    return "<p><em>No speaker notes for this slide.</em></p>";
  }

  // ----- Inject printable speaker-notes blocks (one per slide) -----
  // Add a <aside class="slide-print-notes"> immediately after each slide
  // so the browser's Print / Save-as-PDF view can render the slide and
  // its notes together. Hidden in normal view via CSS; revealed by the
  // @media print stylesheet in deck.css. This works uniformly for every
  // weekly deck regardless of whether the source notes live in
  // <aside class="notes">, <div class="speaker-notes" hidden>,
  // <template class="speaker-notes">, or an external <aside id="notes">.
  slides.forEach(function (slide, i) {
    var nextSibling = slide.nextElementSibling;
    if (nextSibling && nextSibling.classList.contains("slide-print-notes")) return;
    var aside = document.createElement("aside");
    aside.className = "slide-print-notes";
    aside.setAttribute("aria-hidden", "true");
    aside.dataset.printFor = slide.id || ("slide-" + (i + 1));
    aside.innerHTML = readNotes(slide, i);
    if (slide.parentNode) {
      slide.parentNode.insertBefore(aside, slide.nextSibling);
    }
  });

  function show(i) {
    if (i < 0) i = 0;
    if (i >= total) i = total - 1;
    slides[current].classList.remove("is-current");
    slides[current].classList.remove("is-active");
    current = i;
    slides[current].classList.add("is-current");
    slides[current].classList.add("is-active");
    if (counterEl) counterEl.textContent = String(current + 1);

    notesBody.innerHTML = readNotes(slides[current], current);

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

  function printDeck() {
    // Toggle a print-mode body class so all slides become visible
    // before opening the print dialog. The @media print stylesheet
    // does the same job, but this also helps preview-in-browser.
    document.body.classList.add("is-printing");
    slides.forEach(function (s) {
      s.classList.add("is-current");
      s.classList.add("is-active");
    });
    setTimeout(function () { window.print(); }, 50);
    var cleanup = function () {
      document.body.classList.remove("is-printing");
      slides.forEach(function (s, i) {
        if (i !== current) {
          s.classList.remove("is-current");
          s.classList.remove("is-active");
        }
      });
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
  }

  // ----- Fixed-frame auto-scaling (Weeks 2/4 use a 1920×1080 reference frame) -----
  // If a slide has an explicit pixel width/height (set by CSS), scale-to-fit
  // it via transform so the entire 16:9 stage fits the viewport.
  //   - Week 1 (body.deck-body) uses viewport-relative units already.
  //   - Week 3 (w3-deck) sizes its .deck to 100svw × 100svh and lets each
  //     slide fill it via inset:0; no JS scale needed.
  //   - Weeks 5/6 (w5-deck/w6-deck) wrap their deck in a self-scaling 16:9
  //     frame using CSS aspect-ratio, so JS scaling would double-fit them.
  var b = document.body;
  var needsScale = b.classList.contains("w2-deck") ||
                   b.classList.contains("w4-deck");
  function fit() {
    if (!needsScale) return;
    var first = slides[0];
    if (!first) return;
    // Only scale if the slide has the canonical 1920×1080 fixed size.
    var rect = first.getBoundingClientRect();
    // Use the CSS-declared dimensions as the reference, not getBoundingClientRect
    // (since we may have already applied transform).
    var W = 1920, H = 1080;
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var scale = Math.min(vw / W, vh / H);
    slides.forEach(function (s) {
      s.style.transform = "translate(-50%, -50%) scale(" + scale + ")";
      s.style.left = "50%";
      s.style.top = "50%";
      s.style.position = "absolute";
    });
  }
  if (needsScale) {
    window.addEventListener("resize", fit);
    // Defer first fit until layout is ready.
    requestAnimationFrame(fit);
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
      case "p":
      case "P":
        e.preventDefault(); printDeck(); break;
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
      case "print": printDeck(); break;
    }
  });

  // Click anywhere on the slide (but not on chrome / notes / links / buttons)
  // advances. Standard expectation for a presenter clicker.
  document.addEventListener("click", function (e) {
    if (e.target.closest("#deck-chrome, .deck-chrome")) return;
    if (e.target.closest("#deck-notes, .deck-notes")) return;
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
  if (/[?&]print=1\b/.test(window.location.search)) {
    setTimeout(printDeck, 250);
  }

  // ----- Handout view builder -----
  // Reorganises the document into a printable handout: each slide is moved
  // into a thumbnail frame and paired with the rendered speaker notes.
  // Notes resolution mirrors readNotes() above so every deck variant works:
  //   .notes  -> .speaker-notes  -> template.speaker-notes -> external #notes
  function buildHandout(allSlides, perPage) {
    var ext = (function () {
      var aside = document.getElementById("notes");
      if (!aside) return null;
      var c = aside.querySelectorAll(".note-content");
      return c.length ? c : null;
    })();

    function getNotes(slide, i) {
      var n = slide.querySelector(".notes");
      if (n && n.tagName !== "TEMPLATE") return n.innerHTML;
      var sn = slide.querySelector(".speaker-notes");
      if (sn && sn.tagName !== "TEMPLATE") return sn.innerHTML;
      var tpl = slide.querySelector("template.speaker-notes, template.notes");
      if (tpl) return tpl.innerHTML;
      if (ext && ext[i]) return ext[i].innerHTML;
      return "<p><em>No speaker notes for this slide.</em></p>";
    }

    function escape(s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    }

    document.body.classList.add("is-handout");
    document.body.classList.add("handout-" + perPage + "up");

    var total = allSlides.length;
    var container = document.createElement("div");
    container.className = "handout";

    var header = document.createElement("header");
    header.className = "handout__header";
    var docTitle = (document.title || "Slide deck handout").replace(/\s*\|.*$/, "");
    header.innerHTML =
      '<h1 class="handout__title">' + escape(docTitle) + '</h1>' +
      '<p class="handout__meta">' + total + ' slides &middot; ' + perPage +
      '-up handout with speaker notes &middot; print or save as PDF</p>';
    container.appendChild(header);

    allSlides.forEach(function (slide, i) {
      var notesHTML = getNotes(slide, i);

      var row = document.createElement("article");
      row.className = "handout-row";

      var slideCell = document.createElement("div");
      slideCell.className = "handout-row__slide";

      var frame = document.createElement("div");
      frame.className = "handout-row__frame";

      slide.classList.add("is-current", "is-active");
      // Strip any inline transform left over from prior fixed-frame scaling.
      slide.style.transform = "";
      slide.style.left = "";
      slide.style.top = "";
      slide.style.position = "";

      frame.appendChild(slide);
      slideCell.appendChild(frame);

      var notesCell = document.createElement("div");
      notesCell.className = "handout-row__notes";

      var titleAttr = slide.dataset.title || "";
      var moduleAttr = slide.dataset.module || "";
      var head =
        '<div class="handout-row__head">' +
          '<span class="handout-row__num">' +
            String(i + 1).padStart(2, "0") + " / " + String(total).padStart(2, "0") +
          '</span>' +
          (titleAttr ? '<span class="handout-row__title">' + escape(titleAttr) + '</span>' : "") +
          (moduleAttr ? '<span class="handout-row__module">' + escape(moduleAttr) + '</span>' : "") +
        '</div>';
      notesCell.innerHTML = head + '<div class="handout-row__body">' + notesHTML + '</div>';

      row.appendChild(slideCell);
      row.appendChild(notesCell);
      container.appendChild(row);
    });

    document.body.appendChild(container);
  }
})();
