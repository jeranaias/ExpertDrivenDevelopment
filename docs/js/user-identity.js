/**
 * EDD User Identity System
 * Stores user info in localStorage and provides personalization across the site.
 * ES5 compatible, no external dependencies.
 */
(function () {
    'use strict';

    var STORAGE_KEY = 'edd_user';
    var DISMISSED_KEY = 'edd_user_dismissed';

    // ── Helpers ──────────────────────────────────────────────

    function getUser() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                return JSON.parse(raw);
            }
        } catch (e) { /* ignore */ }
        return null;
    }

    function saveUser(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) { /* ignore */ }
    }

    function isDismissed() {
        try {
            return localStorage.getItem(DISMISSED_KEY) === 'true';
        } catch (e) { return false; }
    }

    function setDismissed() {
        try {
            localStorage.setItem(DISMISSED_KEY, 'true');
        } catch (e) { /* ignore */ }
    }

    function isCoursePage() {
        return window.location.pathname.indexOf('/courses/') !== -1;
    }

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    function displayName(user) {
        var parts = [];
        if (user.rank) { parts.push(user.rank); }
        if (user.name) { parts.push(user.name); }
        return parts.join(' ');
    }

    // ── Dispatch custom event ────────────────────────────────

    function dispatchUserReady(userData) {
        try {
            var evt = new CustomEvent('edd-user-ready', { detail: userData });
            document.dispatchEvent(evt);
        } catch (e) {
            // IE fallback
            var fallback = document.createEvent('CustomEvent');
            fallback.initCustomEvent('edd-user-ready', true, true, userData);
            document.dispatchEvent(fallback);
        }
    }

    // ── Welcome indicator in header ──────────────────────────

    function buildIndicator(user) {
        var headerContainer = document.querySelector('.site-header .container');
        if (!headerContainer) { return; }

        var indicator = document.createElement('div');
        indicator.className = 'edd-user-indicator';
        indicator.setAttribute('role', 'button');
        indicator.setAttribute('tabindex', '0');
        indicator.setAttribute('aria-label', 'User menu for ' + displayName(user));
        indicator.textContent = displayName(user);

        // Dropdown
        var dropdown = document.createElement('div');
        dropdown.className = 'edd-user-dropdown';
        dropdown.style.display = 'none';
        dropdown.setAttribute('role', 'menu');

        var info = '';
        info += '<div style="margin-bottom:0.5rem;font-weight:600;">' + escapeHtml(displayName(user)) + '</div>';
        if (user.unit) {
            info += '<div style="margin-bottom:0.75rem;color:var(--color-text-muted);font-size:0.8rem;">' + escapeHtml(user.unit) + '</div>';
        }
        info += '<div style="border-top:1px solid var(--color-border);padding-top:0.5rem;margin-top:0.25rem;">';
        info += '<a href="#" class="edd-user-edit" style="display:block;padding:0.25rem 0;color:var(--color-link);text-decoration:none;font-size:0.8rem;" role="menuitem">Edit Info</a>';
        info += '<a href="#" class="edd-user-clear" style="display:block;padding:0.25rem 0;color:var(--color-scarlet);text-decoration:none;font-size:0.8rem;" role="menuitem">Clear All Data</a>';
        info += '</div>';
        dropdown.innerHTML = info;

        indicator.appendChild(dropdown);

        // Insert before the nav-toggle button (so it's between nav and hamburger)
        var toggle = headerContainer.querySelector('.nav-toggle');
        if (toggle) {
            headerContainer.insertBefore(indicator, toggle);
        } else {
            headerContainer.appendChild(indicator);
        }

        // Toggle dropdown
        var isOpen = false;

        function openDropdown() {
            dropdown.style.display = 'block';
            isOpen = true;
        }

        function closeDropdown() {
            dropdown.style.display = 'none';
            isOpen = false;
        }

        indicator.addEventListener('click', function (e) {
            if (e.target.classList.contains('edd-user-edit') || e.target.classList.contains('edd-user-clear')) {
                return; // Let the link handlers fire
            }
            e.stopPropagation();
            if (isOpen) {
                closeDropdown();
            } else {
                openDropdown();
            }
        });

        indicator.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (isOpen) { closeDropdown(); } else { openDropdown(); }
            }
            if (e.key === 'Escape') { closeDropdown(); }
        });

        // Close on outside click
        document.addEventListener('click', function () {
            closeDropdown();
        });

        dropdown.addEventListener('click', function (e) {
            e.stopPropagation();
        });

        // Edit handler
        var editLink = dropdown.querySelector('.edd-user-edit');
        if (editLink) {
            editLink.addEventListener('click', function (e) {
                e.preventDefault();
                closeDropdown();
                showEditBanner(user);
            });
        }

        // Clear data handler
        var clearLink = dropdown.querySelector('.edd-user-clear');
        if (clearLink) {
            clearLink.addEventListener('click', function (e) {
                e.preventDefault();
                closeDropdown();
                if (confirm('This will clear your user profile and all saved progress (checklists, knowledge check scores). Continue?')) {
                    clearAllData();
                    // Remove the indicator and reload
                    if (indicator.parentNode) {
                        indicator.parentNode.removeChild(indicator);
                    }
                    window.location.reload();
                }
            });
        }
    }

    // ── Clear all EDD data ───────────────────────────────────

    function clearAllData() {
        var keysToRemove = [];
        try {
            for (var i = 0; i < localStorage.length; i++) {
                var key = localStorage.key(i);
                if (key && (
                    key === STORAGE_KEY ||
                    key === DISMISSED_KEY ||
                    key.indexOf('edd_checklist_') === 0 ||
                    key.indexOf('edd_kc_') === 0
                )) {
                    keysToRemove.push(key);
                }
            }
            for (var j = 0; j < keysToRemove.length; j++) {
                localStorage.removeItem(keysToRemove[j]);
            }
        } catch (e) { /* ignore */ }
    }

    // ── Registration banner ──────────────────────────────────

    function showRegistrationBanner() {
        var main = document.querySelector('.site-main');
        if (!main) { return; }

        // Find the first child container or insert at the top
        var firstChild = main.firstElementChild || main.firstChild;

        var banner = document.createElement('div');
        banner.className = 'edd-identity-banner';
        banner.setAttribute('role', 'region');
        banner.setAttribute('aria-label', 'User registration');

        banner.innerHTML =
            '<div class="edd-identity-banner__text">Track your progress across all EDD courses</div>' +
            '<input type="text" id="edd-reg-name" placeholder="Name" aria-label="Name (required)" required>' +
            '<input type="text" id="edd-reg-rank" placeholder="Rank" aria-label="Rank (optional)">' +
            '<input type="text" id="edd-reg-unit" placeholder="Unit" aria-label="Unit (optional)">' +
            '<div class="edd-identity-banner__actions">' +
            '  <button type="button" class="btn btn--primary btn--sm" id="edd-reg-save">Save</button>' +
            '  <button type="button" class="btn btn--ghost btn--sm" id="edd-reg-skip">Skip</button>' +
            '</div>';

        main.insertBefore(banner, firstChild);

        // Save handler
        var saveBtn = document.getElementById('edd-reg-save');
        saveBtn.addEventListener('click', function () {
            var nameVal = document.getElementById('edd-reg-name').value.trim();
            if (!nameVal) {
                document.getElementById('edd-reg-name').focus();
                return;
            }
            var userData = {
                name: nameVal,
                rank: document.getElementById('edd-reg-rank').value.trim(),
                unit: document.getElementById('edd-reg-unit').value.trim()
            };
            saveUser(userData);
            replaceBannerWithWelcome(banner, userData);
            buildIndicator(userData);
            dispatchUserReady(userData);
        });

        // Skip handler
        var skipBtn = document.getElementById('edd-reg-skip');
        skipBtn.addEventListener('click', function () {
            setDismissed();
            banner.style.transition = 'opacity 0.3s ease';
            banner.style.opacity = '0';
            setTimeout(function () {
                if (banner.parentNode) {
                    banner.parentNode.removeChild(banner);
                }
            }, 300);
        });
    }

    function replaceBannerWithWelcome(banner, user) {
        var welcome = document.createElement('div');
        welcome.className = 'edd-identity-banner';
        welcome.style.justifyContent = 'center';
        welcome.style.fontWeight = '600';
        welcome.style.transition = 'opacity 0.5s ease';
        welcome.textContent = 'Welcome, ' + displayName(user);

        if (banner.parentNode) {
            banner.parentNode.replaceChild(welcome, banner);
        }

        // Fade out after 3 seconds
        setTimeout(function () {
            welcome.style.opacity = '0';
            setTimeout(function () {
                if (welcome.parentNode) {
                    welcome.parentNode.removeChild(welcome);
                }
            }, 500);
        }, 3000);
    }

    // ── Edit banner (shown from dropdown) ────────────────────

    function showEditBanner(currentUser) {
        // Remove any existing edit banner
        var existing = document.getElementById('edd-edit-banner');
        if (existing && existing.parentNode) {
            existing.parentNode.removeChild(existing);
        }

        var main = document.querySelector('.site-main');
        if (!main) { return; }

        var firstChild = main.firstElementChild || main.firstChild;

        var banner = document.createElement('div');
        banner.className = 'edd-identity-banner';
        banner.id = 'edd-edit-banner';
        banner.setAttribute('role', 'region');
        banner.setAttribute('aria-label', 'Edit user information');

        banner.innerHTML =
            '<div class="edd-identity-banner__text">Update your information</div>' +
            '<input type="text" id="edd-edit-name" placeholder="Name" aria-label="Name (required)" value="' + escapeHtml(currentUser.name || '') + '" required>' +
            '<input type="text" id="edd-edit-rank" placeholder="Rank" aria-label="Rank (optional)" value="' + escapeHtml(currentUser.rank || '') + '">' +
            '<input type="text" id="edd-edit-unit" placeholder="Unit" aria-label="Unit (optional)" value="' + escapeHtml(currentUser.unit || '') + '">' +
            '<div class="edd-identity-banner__actions">' +
            '  <button type="button" class="btn btn--primary btn--sm" id="edd-edit-save">Save</button>' +
            '  <button type="button" class="btn btn--ghost btn--sm" id="edd-edit-cancel">Cancel</button>' +
            '</div>';

        main.insertBefore(banner, firstChild);
        document.getElementById('edd-edit-name').focus();

        document.getElementById('edd-edit-save').addEventListener('click', function () {
            var nameVal = document.getElementById('edd-edit-name').value.trim();
            if (!nameVal) {
                document.getElementById('edd-edit-name').focus();
                return;
            }
            var userData = {
                name: nameVal,
                rank: document.getElementById('edd-edit-rank').value.trim(),
                unit: document.getElementById('edd-edit-unit').value.trim()
            };
            saveUser(userData);

            // Update the indicator text
            var indicator = document.querySelector('.edd-user-indicator');
            if (indicator) {
                // Update the text node (first child)
                var firstText = indicator.firstChild;
                if (firstText && firstText.nodeType === 3) {
                    firstText.textContent = displayName(userData);
                }
                // Update dropdown info
                var dropdownInfo = indicator.querySelector('.edd-user-dropdown');
                if (dropdownInfo) {
                    var nameDiv = dropdownInfo.querySelector('div:first-child');
                    if (nameDiv) {
                        nameDiv.textContent = displayName(userData);
                    }
                }
            }

            replaceBannerWithWelcome(banner, userData);
            dispatchUserReady(userData);
        });

        document.getElementById('edd-edit-cancel').addEventListener('click', function () {
            banner.style.transition = 'opacity 0.3s ease';
            banner.style.opacity = '0';
            setTimeout(function () {
                if (banner.parentNode) {
                    banner.parentNode.removeChild(banner);
                }
            }, 300);
        });
    }

    // ── Initialize on DOM ready ──────────────────────────────

    function init() {
        var user = getUser();

        if (user && user.name) {
            // User exists: show indicator and dispatch event
            buildIndicator(user);
            dispatchUserReady(user);
        } else if (!isDismissed() && isCoursePage()) {
            // No user and on course page: show registration banner
            showRegistrationBanner();
        }
    }

    // Run init when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
