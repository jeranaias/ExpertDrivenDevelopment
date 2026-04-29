/* EDD Weekly Decks — shared slide navigation
 * Keyboard:  ← →   PageUp/PageDn   Space (next)   Home/End   N (notes)   F (fullscreen)   ? (help)
 * Click:     left-half = back, right-half = forward
 */
(function () {
  var stage = document.querySelector('.stage');
  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  if (!slides.length) return;

  var notes = document.querySelector('.notes');
  var noteContents = Array.prototype.slice.call(document.querySelectorAll('.note-content'));
  var counter = document.querySelector('.hud .counter');
  var help = document.querySelector('.help-overlay');

  var index = 0;
  var total = slides.length;

  // ---- read deep-link from hash on load (#3) ----
  function readHash() {
    var m = (location.hash || '').match(/^#(\d+)$/);
    if (m) {
      var n = parseInt(m[1], 10) - 1;
      if (n >= 0 && n < total) return n;
    }
    return 0;
  }

  function show(i) {
    if (i < 0) i = 0;
    if (i > total - 1) i = total - 1;
    slides[index].classList.remove('is-active');
    if (noteContents[index]) noteContents[index].classList.remove('is-current');
    index = i;
    slides[index].classList.add('is-active');
    if (noteContents[index]) noteContents[index].classList.add('is-current');
    if (counter) counter.textContent = (index + 1) + ' / ' + total;
    history.replaceState(null, '', '#' + (index + 1));
    fitToStage();
  }

  function next() { show(index + 1); }
  function prev() { show(index - 1); }
  function first() { show(0); }
  function last()  { show(total - 1); }

  // ---- scale 1920x1080 slide to fit any window ----
  function fitToStage() {
    var slide = slides[index];
    if (!slide) return;
    var sw = window.innerWidth;
    var sh = window.innerHeight;
    var notesOpen = notes && notes.classList.contains('is-open');
    if (notesOpen) sh = Math.round(sh * 0.62);
    var scale = Math.min(sw / 1920, sh / 1080);
    slide.style.transform = 'scale(' + scale + ')';
  }

  // ---- keyboard ----
  document.addEventListener('keydown', function (e) {
    if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
    switch (e.key) {
      case 'ArrowRight':
      case 'PageDown':
      case ' ':
        e.preventDefault(); next(); break;
      case 'ArrowLeft':
      case 'PageUp':
        e.preventDefault(); prev(); break;
      case 'Home':
        e.preventDefault(); first(); break;
      case 'End':
        e.preventDefault(); last(); break;
      case 'n': case 'N':
        e.preventDefault();
        if (notes) { notes.classList.toggle('is-open'); fitToStage(); }
        break;
      case 'f': case 'F':
        e.preventDefault();
        if (!document.fullscreenElement) {
          (document.documentElement.requestFullscreen || function(){}).call(document.documentElement);
        } else {
          (document.exitFullscreen || function(){}).call(document);
        }
        break;
      case '?':
        e.preventDefault();
        if (help) help.classList.toggle('is-open');
        break;
      case 'Escape':
        if (help && help.classList.contains('is-open')) {
          help.classList.remove('is-open');
        }
        break;
    }
  });

  // ---- click navigation ----
  if (stage) {
    stage.addEventListener('click', function (e) {
      // Ignore clicks on HUD buttons
      if (e.target && e.target.closest('.hud, .notes, .help-overlay')) return;
      var x = e.clientX;
      if (x < window.innerWidth * 0.35) prev();
      else next();
    });
  }

  // ---- HUD wiring ----
  document.querySelectorAll('[data-action]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var a = btn.getAttribute('data-action');
      if (a === 'prev') prev();
      else if (a === 'next') next();
      else if (a === 'notes' && notes) { notes.classList.toggle('is-open'); fitToStage(); }
      else if (a === 'help' && help) help.classList.toggle('is-open');
      else if (a === 'fullscreen') {
        if (!document.fullscreenElement) {
          (document.documentElement.requestFullscreen || function(){}).call(document.documentElement);
        } else {
          (document.exitFullscreen || function(){}).call(document);
        }
      }
    });
  });

  // ---- responsive fit ----
  window.addEventListener('resize', fitToStage);
  window.addEventListener('orientationchange', fitToStage);

  // ---- init ----
  show(readHash());
  // refit after fonts settle
  setTimeout(fitToStage, 100);
  setTimeout(fitToStage, 500);
})();
