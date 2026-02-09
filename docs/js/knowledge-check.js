/**
 * EDD Knowledge Check Component
 * Interactive quiz widget for course modules
 * No external dependencies — vanilla ES5 only
 */
(function() {
  'use strict';

  var PASS_THRESHOLD = 0.8; // 80%
  var STORAGE_PREFIX = 'edd_kc_';

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

    var questions = quizEl.querySelectorAll('.knowledge-check__question');
    var submitBtn = quizEl.querySelector('.knowledge-check__submit');
    var resultEl = quizEl.querySelector('.knowledge-check__result');

    if (!questions.length || !submitBtn) {
      return;
    }

    // Assign unique radio names per question so they don't conflict
    for (var q = 0; q < questions.length; q++) {
      var radios = questions[q].querySelectorAll('input[type="radio"]');
      var groupName = 'kc_' + courseId + '_' + moduleId + '_q' + q;
      for (var r = 0; r < radios.length; r++) {
        radios[r].setAttribute('name', groupName);
      }
    }

    /**
     * Grade all questions, apply classes, show feedback, display score.
     */
    function gradeQuiz() {
      var score = 0;
      var total = questions.length;

      for (var i = 0; i < questions.length; i++) {
        var questionEl = questions[i];
        var correctIndex = parseInt(questionEl.getAttribute('data-correct'), 10);
        var options = questionEl.querySelectorAll('.knowledge-check__option');
        var radios = questionEl.querySelectorAll('input[type="radio"]');
        var feedback = questionEl.querySelector('.knowledge-check__feedback');
        var selectedIndex = -1;

        // Find which radio is selected
        for (var j = 0; j < radios.length; j++) {
          if (radios[j].checked) {
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

        // Show feedback
        if (feedback) {
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

      // Save to localStorage
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

      // Disable all radios and submit button
      var allRadios = quizEl.querySelectorAll('input[type="radio"]');
      for (var k = 0; k < allRadios.length; k++) {
        allRadios[k].disabled = true;
      }
      submitBtn.disabled = true;

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

      // Show the "Try Again" button
      showRetryButton();
    }

    /**
     * Create and show the "Try Again" button after submission.
     */
    function showRetryButton() {
      // Avoid duplicates
      var existing = quizEl.querySelector('.knowledge-check__retry');
      if (existing) {
        existing.removeAttribute('hidden');
        return;
      }

      var retryBtn = document.createElement('button');
      retryBtn.className = 'btn btn--secondary knowledge-check__retry';
      retryBtn.textContent = 'Try Again';
      retryBtn.setAttribute('type', 'button');

      retryBtn.addEventListener('click', function() {
        resetQuiz();
      });

      // Insert after the submit button
      if (submitBtn.parentNode) {
        submitBtn.parentNode.insertBefore(retryBtn, submitBtn.nextSibling);
      }
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

        var options = questionEl.querySelectorAll('.knowledge-check__option');
        for (var j = 0; j < options.length; j++) {
          options[j].classList.remove('knowledge-check__option--selected');
          options[j].classList.remove('knowledge-check__option--correct');
        }

        var feedback = questionEl.querySelector('.knowledge-check__feedback');
        if (feedback) {
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

      // Hide retry button
      var retryBtn = quizEl.querySelector('.knowledge-check__retry');
      if (retryBtn) {
        retryBtn.setAttribute('hidden', '');
      }

      // Clear saved results
      try {
        localStorage.removeItem(storageKey);
      } catch (e) {
        // fail silently
      }
    }

    // Bind submit
    submitBtn.addEventListener('click', function(e) {
      e.preventDefault();
      gradeQuiz();
    });
  }

  // Initialize all quiz blocks on the page
  for (var i = 0; i < quizzes.length; i++) {
    initQuiz(quizzes[i]);
  }
})();
