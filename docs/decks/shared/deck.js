/* EDD Slide Deck Controller
 *
 * Keyboard:
 *   →  Space  PgDn   Next slide
 *   ←  PgUp           Previous slide
 *   Home  End         First / last slide
 *   N or P            Toggle speaker notes
 *   F                 Fullscreen
 *   ?                 Toggle help overlay
 *
 * The deck auto-scales each 1920x1080 slide to fit the viewport
 * preserving 16:9 aspect ratio (letterboxing as needed).
 */
(function () {
  "use strict";

  const slides = Array.from(document.querySelectorAll(".slide"));
  const stage = document.querySelector(".stage");
  const hud = document.querySelector(".hud");
  const notesPane = document.querySelector(".notes");
  const notesTitle = notesPane && notesPane.querySelector(".notes__title");
  const notesBody = notesPane && notesPane.querySelector(".notes__body");
  const notesCounter = notesPane && notesPane.querySelector(".notes__counter");

  if (!slides.length) return;

  let current = 0;
  let notesOpen = false;

  // --- URL hash sync (deep-link to a slide via #s12) -----------------
  function readHash() {
    const m = /^#s(\d+)$/i.exec(window.location.hash);
    if (m) {
      const n = parseInt(m[1], 10) - 1;
      if (n >= 0 && n < slides.length) current = n;
    }
  }
  readHash();

  function show(i) {
    if (i < 0) i = 0;
    if (i >= slides.length) i = slides.length - 1;
    slides.forEach((s, idx) => s.classList.toggle("is-active", idx === i));
    current = i;
    updateHud();
    updateNotes();
    history.replaceState(null, "", "#s" + (i + 1));
  }

  function updateHud() {
    if (!hud) return;
    const slide = slides[current];
    const mod = slide.dataset.module || "";
    const padded = String(current + 1).padStart(2, "0");
    const total = String(slides.length).padStart(2, "0");
    hud.textContent = (mod ? mod + "  ·  " : "") + padded + " / " + total;
  }

  function updateNotes() {
    if (!notesPane) return;
    const slide = slides[current];
    const note = slide.querySelector(".speaker-notes");
    notesTitle.textContent = slide.dataset.title || "";
    notesCounter.textContent =
      "Slide " + (current + 1) + " of " + slides.length;
    notesBody.innerHTML = note ? note.innerHTML : "<p><em>No speaker notes for this slide.</em></p>";
  }

  // --- Scaling -------------------------------------------------------
  function fit() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const padBottom = notesOpen ? Math.min(vh * 0.38, 360) : 0;
    const availH = vh - padBottom;
    const scale = Math.min(vw / 1920, availH / 1080);
    slides.forEach((s) => {
      s.style.transform = "translate(-50%, -50%) scale(" + scale + ")";
      s.style.left = "50%";
      s.style.top = (padBottom > 0 ? (availH / 2) : (vh / 2)) + "px";
      s.style.position = "absolute";
    });
  }

  // --- Speaker notes -------------------------------------------------
  function toggleNotes(force) {
    notesOpen = typeof force === "boolean" ? force : !notesOpen;
    notesPane.classList.toggle("is-open", notesOpen);
    fit();
  }

  // --- Help overlay --------------------------------------------------
  let help = document.querySelector(".help-overlay");
  function toggleHelp() {
    if (!help) {
      help = document.createElement("div");
      help.className = "help-overlay";
      help.style.cssText =
        "position:fixed;inset:0;background:rgba(10,10,10,0.92);color:#fff;display:flex;align-items:center;justify-content:center;z-index:200;font-family:inherit;";
      help.innerHTML =
        '<div style="max-width:600px;font-size:18px;line-height:1.6;">' +
        '<h2 style="font-size:28px;margin-bottom:24px;color:#F5D130;letter-spacing:0.16em;text-transform:uppercase;">Keyboard</h2>' +
        '<div style="display:grid;grid-template-columns:auto 1fr;gap:14px 32px;">' +
        '<kbd>→ / Space / PgDn</kbd><span>Next slide</span>' +
        '<kbd>← / PgUp</kbd><span>Previous slide</span>' +
        '<kbd>Home / End</kbd><span>First / last</span>' +
        '<kbd>N or P</kbd><span>Toggle speaker notes</span>' +
        '<kbd>F</kbd><span>Fullscreen</span>' +
        '<kbd>?</kbd><span>This help</span>' +
        "</div>" +
        '<p style="margin-top:32px;opacity:0.6;font-size:14px;">Press any key to close.</p>' +
        "</div>";
      help.querySelectorAll("kbd").forEach((k) => {
        k.style.cssText =
          "font-family:monospace;background:#222;padding:6px 14px;border-radius:4px;border:1px solid #444;";
      });
      document.body.appendChild(help);
      const close = () => { help.remove(); help = null; document.removeEventListener("keydown", close); };
      setTimeout(() => document.addEventListener("keydown", close), 100);
    } else {
      help.remove(); help = null;
    }
  }

  // --- Keys ----------------------------------------------------------
  document.addEventListener("keydown", function (e) {
    if (help) return; // help overlay handles its own keys
    switch (e.key) {
      case "ArrowRight":
      case "PageDown":
      case " ":
        e.preventDefault();
        show(current + 1);
        break;
      case "ArrowLeft":
      case "PageUp":
        e.preventDefault();
        show(current - 1);
        break;
      case "Home":
        e.preventDefault();
        show(0);
        break;
      case "End":
        e.preventDefault();
        show(slides.length - 1);
        break;
      case "n":
      case "N":
      case "p":
      case "P":
        e.preventDefault();
        toggleNotes();
        break;
      case "f":
      case "F":
        e.preventDefault();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
        break;
      case "?":
        e.preventDefault();
        toggleHelp();
        break;
    }
  });

  // Click anywhere on the right half to advance, left half to go back.
  document.querySelector(".deck").addEventListener("click", function (e) {
    if (notesPane && notesPane.contains(e.target)) return;
    const x = e.clientX;
    show(x > window.innerWidth / 2 ? current + 1 : current - 1);
  });

  window.addEventListener("resize", fit);
  window.addEventListener("hashchange", function () {
    const prev = current;
    readHash();
    if (prev !== current) show(current);
  });

  // Boot --------------------------------------------------------------
  fit();
  show(current);
})();
