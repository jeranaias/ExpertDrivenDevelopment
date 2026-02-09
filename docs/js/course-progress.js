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

  /**
   * Scroll-based automatic progress tracking.
   * Uses IntersectionObserver to detect when a student scrolls past
   * a module section, then auto-checks the corresponding checklist item.
   */
  function initScrollTracker() {
    // Graceful degradation: bail if IntersectionObserver is not supported
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    // Collect all sections whose id could map to a module checklist item.
    // Pattern 1: id="module-1", id="module-2", etc.
    // Pattern 2: id="setup-review", id="build-1", etc. (platform.html style)
    var allSections = document.querySelectorAll('section[id]');
    if (!allSections.length) {
      return;
    }

    // Build a mapping from section id to the matching checkbox element(s).
    // We only map sections that have a corresponding module-prefixed data-item
    // in a .course-checklist on this page.
    var sectionMap = []; // array of { section: element, checkbox: element, itemEl: element }

    for (var s = 0; s < allSections.length; s++) {
      var section = allSections[s];
      var sectionId = section.getAttribute('id');

      // Skip non-module sections: overview, knowledge-check, capstone,
      // completion-checklist, and any exercises
      if (sectionId === 'overview' ||
          sectionId === 'knowledge-check' ||
          sectionId === 'capstone' ||
          sectionId === 'completion-checklist' ||
          sectionId === 'main-content') {
        continue;
      }

      // Try to find a matching checkbox in any course-checklist on the page.
      // Strategy 1: Direct match — data-item equals the section id (e.g., "module-1")
      var checkbox = null;
      var itemEl = null;
      var directMatch = document.querySelector(
        '.course-checklist input[data-item="' + sectionId + '"]'
      );
      if (directMatch) {
        checkbox = directMatch;
      } else {
        // Strategy 2: Suffix match — data-item ends with the section id
        // e.g., section id="setup-review" matches data-item="module-1-setup-review"
        var allCheckboxes = document.querySelectorAll('.course-checklist input[data-item]');
        for (var c = 0; c < allCheckboxes.length; c++) {
          var dataItem = allCheckboxes[c].getAttribute('data-item') || '';
          // Only match module items (data-item starts with "module-")
          if (dataItem.indexOf('module-') === 0 &&
              dataItem.length > sectionId.length &&
              dataItem.indexOf(sectionId, dataItem.length - sectionId.length) !== -1) {
            checkbox = allCheckboxes[c];
            break;
          }
        }
      }

      if (!checkbox) {
        continue;
      }

      // Only auto-check module items (data-item starting with "module-")
      var checkboxDataItem = checkbox.getAttribute('data-item') || '';
      if (checkboxDataItem.indexOf('module-') !== 0) {
        continue;
      }

      // Find the parent .course-checklist__item for the highlight animation
      itemEl = checkbox.closest
        ? checkbox.closest('.course-checklist__item')
        : (function(el) {
            while (el && el.parentNode) {
              el = el.parentNode;
              if (el.classList && el.classList.contains('course-checklist__item')) {
                return el;
              }
            }
            return null;
          })(checkbox);

      sectionMap.push({
        section: section,
        checkbox: checkbox,
        itemEl: itemEl
      });
    }

    // Nothing to observe if no mappings found
    if (!sectionMap.length) {
      return;
    }

    // Track which sections have already been auto-checked this session
    // to avoid re-triggering after manual uncheck
    var autoChecked = {};

    /**
     * Flash a highlight on the checklist row when auto-checked.
     */
    function flashHighlight(el) {
      if (!el) return;
      el.classList.add('is-auto-checked');
      // Force reflow so the transition starts from the gold background
      void el.offsetWidth;
      // After a brief moment, trigger the fade-out transition
      setTimeout(function() {
        el.classList.add('fade-out');
      }, 50);
      // Clean up classes after animation completes
      setTimeout(function() {
        el.classList.remove('is-auto-checked');
        el.classList.remove('fade-out');
      }, 1600);
    }

    /**
     * Auto-check a checkbox and trigger the save/update flow.
     */
    function autoCheck(entry) {
      var cb = entry.checkbox;
      var dataItem = cb.getAttribute('data-item') || '';

      // Already checked (manually or previously auto-checked) — do nothing
      if (cb.checked) {
        return;
      }

      // If the user manually unchecked this item, respect that —
      // only auto-check once per page load session
      if (autoChecked[dataItem]) {
        return;
      }

      // Mark as auto-checked
      autoChecked[dataItem] = true;
      cb.checked = true;

      // Trigger the same save/update flow as a manual checkbox change.
      // Dispatch a 'change' event so the existing listener picks it up.
      var evt;
      if (typeof Event === 'function') {
        evt = new Event('change', { bubbles: true });
      } else {
        // IE11 fallback
        evt = document.createEvent('Event');
        evt.initEvent('change', true, true);
      }
      cb.dispatchEvent(evt);

      // Flash the highlight animation
      flashHighlight(entry.itemEl);
    }

    // Create the IntersectionObserver.
    // rootMargin '0px 0px -20% 0px' means the bottom 20% of the viewport
    // is excluded, so the section bottom must scroll past that 20% zone.
    var observer = new IntersectionObserver(function(entries) {
      for (var i = 0; i < entries.length; i++) {
        var ioEntry = entries[i];
        // We observe sentinel elements placed at the bottom of sections.
        // When they become visible (intersecting), the user has scrolled past.
        if (ioEntry.isIntersecting) {
          // Find the corresponding mapping entry
          var sentinel = ioEntry.target;
          var mapEntry = sentinel._eddMapEntry;
          if (mapEntry) {
            autoCheck(mapEntry);
            // Stop observing this sentinel — it's done
            observer.unobserve(sentinel);
          }
        }
      }
    }, {
      rootMargin: '0px 0px -20% 0px',
      threshold: 0
    });

    // For each mapped section, create a sentinel element at the bottom
    // and observe it. This ensures the observer fires when the bottom
    // of the section scrolls into the observation zone.
    for (var m = 0; m < sectionMap.length; m++) {
      var sentinel = document.createElement('div');
      sentinel.setAttribute('aria-hidden', 'true');
      sentinel.style.height = '1px';
      sentinel.style.width = '1px';
      sentinel.style.overflow = 'hidden';
      sentinel.style.opacity = '0';
      sentinel.style.pointerEvents = 'none';
      sentinel._eddMapEntry = sectionMap[m];
      sectionMap[m].section.appendChild(sentinel);
      observer.observe(sentinel);
    }
  }

  // Initialize the scroll tracker
  initScrollTracker();
})();
