/**
 * EDD Course Progress Component
 * Checklist-based progress tracking with localStorage persistence
 * No external dependencies — vanilla ES5 only
 */
(function() {
  'use strict';

  var STORAGE_PREFIX = 'edd_checklist_';

  var checklists = document.querySelectorAll('.course-checklist');

  if (!checklists.length) {
    return;
  }

  /**
   * Initialize a single course-checklist block.
   */
  function initChecklist(checklistEl) {
    var courseId = checklistEl.getAttribute('data-course') || '';
    var storageKey = STORAGE_PREFIX + courseId;

    var items = checklistEl.querySelectorAll('.course-checklist__item');
    var fillEl = checklistEl.querySelector('.course-progress-bar__fill');
    var textEl = checklistEl.querySelector('.course-progress-bar__text');
    var completeEl = checklistEl.querySelector('.course-checklist__complete');

    if (!items.length) {
      return;
    }

    /**
     * Read saved state from localStorage.
     * Returns an object mapping item keys to booleans.
     */
    function loadState() {
      try {
        var raw = localStorage.getItem(storageKey);
        if (raw) {
          return JSON.parse(raw);
        }
      } catch (e) {
        // fail silently
      }
      return {};
    }

    /**
     * Save the current state of all checkboxes to localStorage.
     */
    function saveState() {
      var state = {};
      for (var i = 0; i < items.length; i++) {
        var checkbox = items[i].querySelector('input[type="checkbox"]');
        if (checkbox) {
          var itemKey = checkbox.getAttribute('data-item') || ('item_' + i);
          state[itemKey] = checkbox.checked;
        }
      }

      try {
        localStorage.setItem(storageKey, JSON.stringify(state));
      } catch (e) {
        // fail silently
      }
    }

    /**
     * Restore checkbox states from localStorage.
     */
    function restoreState() {
      var state = loadState();

      for (var i = 0; i < items.length; i++) {
        var checkbox = items[i].querySelector('input[type="checkbox"]');
        if (checkbox) {
          var itemKey = checkbox.getAttribute('data-item') || ('item_' + i);
          if (state[itemKey] === true) {
            checkbox.checked = true;
          }
        }
      }
    }

    /**
     * Update the progress bar and completion message.
     */
    function updateProgress() {
      var total = items.length;
      var checked = 0;

      for (var i = 0; i < items.length; i++) {
        var checkbox = items[i].querySelector('input[type="checkbox"]');
        if (checkbox && checkbox.checked) {
          checked++;
        }
      }

      var percentage = total > 0 ? Math.round((checked / total) * 100) : 0;

      // Update progress bar fill
      if (fillEl) {
        fillEl.style.width = percentage + '%';
      }

      // Update progress text
      if (textEl) {
        textEl.textContent = percentage + '% Complete (' + checked + ' of ' + total + ' items)';
      }

      // Show or hide completion message
      if (completeEl) {
        if (checked === total && total > 0) {
          completeEl.removeAttribute('hidden');
        } else {
          completeEl.setAttribute('hidden', '');
        }
      }
    }

    /**
     * Handle checkbox change events.
     */
    function onCheckboxChange() {
      saveState();
      updateProgress();
    }

    // Bind change listeners to all checkboxes
    for (var i = 0; i < items.length; i++) {
      var checkbox = items[i].querySelector('input[type="checkbox"]');
      if (checkbox) {
        checkbox.addEventListener('change', onCheckboxChange);
      }
    }

    // Restore saved state and update progress on load
    restoreState();
    updateProgress();

    /**
     * Listen for knowledge-check pass events to auto-check the KC item.
     * The KC checkbox should have data-item="knowledge-check" (convention).
     */
    document.addEventListener('edd-kc-pass', function(e) {
      var detail = e.detail || {};
      var eventCourse = detail.course || '';

      // Only react if this event is for our course
      if (eventCourse !== courseId) {
        return;
      }

      // Find and check the knowledge-check item in this checklist
      for (var j = 0; j < items.length; j++) {
        var cb = items[j].querySelector('input[type="checkbox"]');
        if (cb) {
          var itemKey = cb.getAttribute('data-item') || '';
          if (itemKey === 'knowledge-check') {
            if (!cb.checked) {
              cb.checked = true;
              saveState();
              updateProgress();
            }
            break;
          }
        }
      }
    });
  }

  // Initialize all checklist blocks on the page
  for (var i = 0; i < checklists.length; i++) {
    initChecklist(checklists[i]);
  }
})();
