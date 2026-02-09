/**
 * EDD Knowledge Check Component
 * Interactive quiz widget for course modules
 * No external dependencies — vanilla ES5 only
 *
 * Anti-cheat hardening notes:
 * - Correct answer indices are read from the DOM at init, then the
 *   data-correct attributes are removed so they cannot be found via
 *   Inspect Element.
 * - Feedback HTML is stripped from the DOM at init and only restored
 *   when the quiz is submitted.
 * - All answers and feedback live exclusively inside this closure;
 *   nothing is exposed on the global scope.
 * - A minimum-time gate and per-attempt cooldown discourage brute-force
 *   guessing.
 *
 * While a determined user can always locate answers in client-side
 * code (breakpoints, network inspection, reading the source file),
 * these measures raise the bar significantly above casual cheating
 * such as right-click > Inspect.
 */
(function() {
  'use strict';

  var PASS_THRESHOLD = 0.8; // 80 %
  var STORAGE_PREFIX = 'edd_kc_';
  var ATTEMPTS_PREFIX = 'edd_kc_attempts_';
  var MIN_SECONDS = 120;    // 2-minute minimum before submission
  var COOLDOWN_SECONDS = 30; // seconds to wait after a failed attempt

  var quizzes = document.querySelectorAll('.knowledge-check');

  if (!quizzes.length) {
    return;
  }

  /**
   * Initialize a single knowledge-check block.
   */
  function initQuiz(quizEl) {
    var courseId = quizEl.getAttribute('data-course') || '';
    var moduleId = quizEl.getAttribute('data-module') || '';
    var storageKey = STORAGE_PREFIX + courseId + '_' + moduleId;
    var attemptsKey = ATTEMPTS_PREFIX + courseId;

    var questions = quizEl.querySelectorAll('.knowledge-check__question');
    var submitBtn = quizEl.querySelector('.knowledge-check__submit');
    var resultEl = quizEl.querySelector('.knowledge-check__result');

    if (!questions.length || !submitBtn) {
      return;
    }

    // ------------------------------------------------------------------
    // 1a. Read correct-answer indices into memory, then scrub from DOM
    // ------------------------------------------------------------------
    var correctAnswers = [];
    for (var q = 0; q < questions.length; q++) {
      var idx = parseInt(questions[q].getAttribute('data-correct'), 10);
      correctAnswers.push(isNaN(idx) ? -1 : idx);
      questions[q].removeAttribute('data-correct');
    }

    // ------------------------------------------------------------------
    // 1b. Read feedback HTML into memory, then blank it in the DOM
    // ------------------------------------------------------------------
    var feedbackContents = [];
    for (var f = 0; f < questions.length; f++) {
      var fb = questions[f].querySelector('.knowledge-check__feedback');
      if (fb) {
        feedbackContents.push(fb.innerHTML);
        fb.innerHTML = '';
      } else {
        feedbackContents.push('');
      }
    }

    // Record initialization time for minimum-time gate (1d)
    var initTime = Date.now();

    // Assign unique radio names per question so they don't conflict
    for (var n = 0; n < questions.length; n++) {
      var radios = questions[n].querySelectorAll('input[type="radio"]');
      var groupName = 'kc_' + courseId + '_' + moduleId + '_q' + n;
      for (var r = 0; r < radios.length; r++) {
        radios[r].setAttribute('name', groupName);
      }
    }

    // ------------------------------------------------------------------
    // Helper: create or find the status message element above the submit
    // ------------------------------------------------------------------
    var statusMsgEl = null;
    function ensureStatusMsg() {
      if (!statusMsgEl) {
        statusMsgEl = document.createElement('div');
        statusMsgEl.className = 'knowledge-check__status-msg';
        statusMsgEl.setAttribute('role', 'alert');
        if (submitBtn.parentNode) {
          submitBtn.parentNode.insertBefore(statusMsgEl, submitBtn);
        }
      }
      return statusMsgEl;
    }

    function showStatus(text) {
      var el = ensureStatusMsg();
      el.textContent = text;
      el.removeAttribute('hidden');
    }

    function hideStatus() {
      if (statusMsgEl) {
        statusMsgEl.textContent = '';
        statusMsgEl.setAttribute('hidden', '');
      }
    }

    // ------------------------------------------------------------------
    // 1e. Attempt tracking helpers
    // ------------------------------------------------------------------
    function loadAttempts() {
      try {
        var raw = localStorage.getItem(attemptsKey);
        if (raw) {
          var parsed = JSON.parse(raw);
          if (parsed && parsed.attempts) {
            return parsed;
          }
        }
      } catch (e) { /* fail silently */ }
      return { attempts: [] };
    }

    function saveAttempt(score, total, passed) {
      var record = loadAttempts();
      record.attempts.push({
        date: new Date().toISOString(),
        score: score,
        total: total,
        passed: passed
      });
      try {
        localStorage.setItem(attemptsKey, JSON.stringify(record));
      } catch (e) { /* fail silently */ }
    }

    /**
     * Grade all questions, apply classes, show feedback, display score.
     */
    function gradeQuiz() {
      var score = 0;
      var total = questions.length;

      for (var i = 0; i < questions.length; i++) {
        var questionEl = questions[i];
        var correctIndex = correctAnswers[i];
        var options = questionEl.querySelectorAll('.knowledge-check__option');
        var qRadios = questionEl.querySelectorAll('input[type="radio"]');
        var feedback = questionEl.querySelector('.knowledge-check__feedback');
        var selectedIndex = -1;

        // Remove the unanswered highlight if present
        questionEl.classList.remove('is-unanswered');

        // Find which radio is selected
        for (var j = 0; j < qRadios.length; j++) {
          if (qRadios[j].checked) {
            selectedIndex = j;
            break;
          }
        }

        // Mark the correct option
        if (options[correctIndex]) {
          options[correctIndex].classList.add('knowledge-check__option--correct');
        }

        // Mark the selected option
        if (selectedIndex >= 0 && options[selectedIndex]) {
          options[selectedIndex].classList.add('knowledge-check__option--selected');
        }

        // Determine correct or incorrect
        if (selectedIndex === correctIndex) {
          questionEl.classList.add('is-correct');
          score++;
        } else {
          questionEl.classList.add('is-incorrect');
        }

        // 1b. Restore feedback content and show it
        if (feedback) {
          feedback.innerHTML = feedbackContents[i];
          feedback.removeAttribute('hidden');
        }
      }

      // Calculate results
      var percentage = total > 0 ? Math.round((score / total) * 100) : 0;
      var passed = percentage >= (PASS_THRESHOLD * 100);

      // Display result
      if (resultEl) {
        resultEl.textContent = 'You scored ' + score + ' out of ' + total + ' (' + percentage + '%)';
        resultEl.removeAttribute('hidden');

        // Remove any previous result class
        resultEl.classList.remove('knowledge-check__result--pass');
        resultEl.classList.remove('knowledge-check__result--fail');

        if (passed) {
          resultEl.classList.add('knowledge-check__result--pass');
        } else {
          resultEl.classList.add('knowledge-check__result--fail');
        }
      }

      // Save score snapshot to localStorage (legacy per-module key)
      try {
        var data = JSON.stringify({
          score: score,
          total: total,
          passed: passed
        });
        localStorage.setItem(storageKey, data);
      } catch (e) {
        // localStorage may be unavailable; fail silently
      }

      // 1e. Save to attempt history
      saveAttempt(score, total, passed);

      // Disable all radios and submit button
      var allRadios = quizEl.querySelectorAll('input[type="radio"]');
      for (var k = 0; k < allRadios.length; k++) {
        allRadios[k].disabled = true;
      }
      submitBtn.disabled = true;
      hideStatus();

      // Dispatch custom event if passed (for course-progress.js integration)
      if (passed) {
        try {
          var event = new CustomEvent('edd-kc-pass', {
            detail: {
              course: courseId,
              module: moduleId,
              score: score,
              total: total
            }
          });
          document.dispatchEvent(event);
        } catch (e) {
          // CustomEvent not supported in very old browsers; fail silently
        }
      }

      // Show the "Try Again" button (with cooldown if failed)
      showRetryButton(passed);
    }

    /**
     * Create and show the "Try Again" button after submission.
     * If the attempt failed, enforce a cooldown (1f).
     */
    function showRetryButton(passed) {
      // Avoid duplicates
      var existing = quizEl.querySelector('.knowledge-check__retry');
      if (existing) {
        existing.parentNode.removeChild(existing);
      }

      var retryBtn = document.createElement('button');
      retryBtn.className = 'btn btn--secondary knowledge-check__retry';
      retryBtn.setAttribute('type', 'button');

      // Insert after the submit button
      if (submitBtn.parentNode) {
        submitBtn.parentNode.insertBefore(retryBtn, submitBtn.nextSibling);
      }

      if (!passed) {
        // 1f. Cooldown on retry after failure
        retryBtn.disabled = true;
        var remaining = COOLDOWN_SECONDS;
        retryBtn.textContent = 'Try again in ' + remaining + 's\u2026';

        var cooldownInterval = setInterval(function() {
          remaining--;
          if (remaining <= 0) {
            clearInterval(cooldownInterval);
            retryBtn.disabled = false;
            retryBtn.textContent = 'Try Again';
          } else {
            retryBtn.textContent = 'Try again in ' + remaining + 's\u2026';
          }
        }, 1000);
      } else {
        retryBtn.textContent = 'Try Again';
      }

      retryBtn.addEventListener('click', function() {
        if (!retryBtn.disabled) {
          resetQuiz();
        }
      });
    }

    /**
     * Reset the quiz to its initial state so the user can retake it.
     */
    function resetQuiz() {
      // Remove grading classes and option markers
      for (var i = 0; i < questions.length; i++) {
        var questionEl = questions[i];
        questionEl.classList.remove('is-correct');
        questionEl.classList.remove('is-incorrect');
        questionEl.classList.remove('is-unanswered');

        var options = questionEl.querySelectorAll('.knowledge-check__option');
        for (var j = 0; j < options.length; j++) {
          options[j].classList.remove('knowledge-check__option--selected');
          options[j].classList.remove('knowledge-check__option--correct');
        }

        // 1b. Hide feedback and blank its content again
        var feedback = questionEl.querySelector('.knowledge-check__feedback');
        if (feedback) {
          feedback.innerHTML = '';
          feedback.setAttribute('hidden', '');
        }
      }

      // Re-enable and uncheck all radios
      var allRadios = quizEl.querySelectorAll('input[type="radio"]');
      for (var k = 0; k < allRadios.length; k++) {
        allRadios[k].disabled = false;
        allRadios[k].checked = false;
      }

      // Re-enable submit, hide result
      submitBtn.disabled = false;

      if (resultEl) {
        resultEl.setAttribute('hidden', '');
        resultEl.classList.remove('knowledge-check__result--pass');
        resultEl.classList.remove('knowledge-check__result--fail');
        resultEl.textContent = '';
      }

      // Hide / remove retry button
      var retryBtn = quizEl.querySelector('.knowledge-check__retry');
      if (retryBtn && retryBtn.parentNode) {
        retryBtn.parentNode.removeChild(retryBtn);
      }

      // Clear saved results (legacy per-module key only; attempts persist)
      try {
        localStorage.removeItem(storageKey);
      } catch (e) {
        // fail silently
      }

      // Reset the minimum-time gate so it counts from now
      initTime = Date.now();

      hideStatus();
    }

    // ------------------------------------------------------------------
    // Bind submit with pre-submission checks
    // ------------------------------------------------------------------
    submitBtn.addEventListener('click', function(e) {
      e.preventDefault();

      // 1c. Require all questions answered
      var unansweredCount = 0;
      for (var i = 0; i < questions.length; i++) {
        var qRadios = questions[i].querySelectorAll('input[type="radio"]');
        var answered = false;
        for (var j = 0; j < qRadios.length; j++) {
          if (qRadios[j].checked) {
            answered = true;
            break;
          }
        }
        if (!answered) {
          unansweredCount++;
          questions[i].classList.add('is-unanswered');
        } else {
          questions[i].classList.remove('is-unanswered');
        }
      }

      if (unansweredCount > 0) {
        showStatus('Please answer all questions before submitting.');
        return;
      }

      // 1d. Minimum time requirement
      var elapsed = Math.floor((Date.now() - initTime) / 1000);
      if (elapsed < MIN_SECONDS) {
        var wait = MIN_SECONDS - elapsed;
        showStatus(
          'Please take time to read the questions carefully. You can submit in ' +
          wait + ' seconds.'
        );
        return;
      }

      // All checks passed — grade the quiz
      gradeQuiz();
    });
  }

  // Initialize all quiz blocks on the page
  for (var i = 0; i < quizzes.length; i++) {
    initQuiz(quizzes[i]);
  }
})();
