(function () {
  "use strict";

  const slides = Array.from(document.querySelectorAll(".slide"));
  const counter = document.getElementById("deck-counter");
  const notesPanel = document.getElementById("deck-notes");
  const notesBody = document.getElementById("deck-notes-body");
  const notesTitle = document.getElementById("deck-notes-title");
  const hint = document.getElementById("deck-hint");
  let current = 0;
  let notesVisible = false;

  function updateNotes() {
    const slide = slides[current];
    const noteEl = slide.querySelector(".speaker-notes");
    if (noteEl && notesBody) {
      notesBody.innerHTML = noteEl.innerHTML;
      notesTitle.textContent =
        "Speaker notes — " + (slide.dataset.title || "Slide " + (current + 1));
    }
  }

  function show(index) {
    if (index < 0) index = 0;
    if (index >= slides.length) index = slides.length - 1;
    slides[current].classList.remove("is-active");
    current = index;
    slides[current].classList.add("is-active");
    if (counter) {
      counter.textContent = (current + 1) + " / " + slides.length;
    }
    if (location.hash !== "#" + (current + 1)) {
      history.replaceState(null, "", "#" + (current + 1));
    }
    updateNotes();
    if (hint) hint.style.display = current === 0 ? "block" : "none";
  }

  function next() { show(current + 1); }
  function prev() { show(current - 1); }

  function toggleNotes() {
    notesVisible = !notesVisible;
    if (notesPanel) notesPanel.classList.toggle("is-visible", notesVisible);
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
      e.preventDefault(); next();
    } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
      e.preventDefault(); prev();
    } else if (e.key === "Home") {
      e.preventDefault(); show(0);
    } else if (e.key === "End") {
      e.preventDefault(); show(slides.length - 1);
    } else if (e.key === "n" || e.key === "N") {
      e.preventDefault(); toggleNotes();
    } else if (e.key === "p" || e.key === "P") {
      e.preventDefault(); window.print();
    }
  });

  document.addEventListener("click", function (e) {
    if (e.target.closest("a, button, input, textarea, select, .notes, .deck__chrome, .deck__hint")) return;
    const w = window.innerWidth;
    if (e.clientX < w * 0.25) prev(); else next();
  });

  window.addEventListener("hashchange", function () {
    const n = parseInt(location.hash.slice(1), 10);
    if (!isNaN(n)) show(n - 1);
  });

  const initial = parseInt(location.hash.slice(1), 10);
  show(!isNaN(initial) && initial > 0 ? initial - 1 : 0);
})();
