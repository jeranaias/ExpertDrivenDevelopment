/**
 * EDD Site Enhancements
 * Interactive UX improvements for Expert-Driven Development
 * No external dependencies — vanilla JS only
 */

// 1. Back to Top Button
(function() {
  'use strict';

  var SCROLL_THRESHOLD = 500;
  var CLASS_VISIBLE = 'is-visible';

  var btn = document.createElement('button');
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.textContent = '\u2191';
  document.body.appendChild(btn);

  var ticking = false;

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(function() {
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > SCROLL_THRESHOLD) {
          btn.classList.add(CLASS_VISIBLE);
        } else {
          btn.classList.remove(CLASS_VISIBLE);
        }
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  btn.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

// 2. Reading Progress Bar
(function() {
  'use strict';

  var CLASS_VISIBLE = 'is-visible';
  var SHOW_THRESHOLD = 100;

  var wrapper = document.createElement('div');
  wrapper.className = 'progress-reading';

  var bar = document.createElement('div');
  bar.className = 'progress-reading__bar';
  wrapper.appendChild(bar);

  var header = document.querySelector('.site-header');
  if (header && header.nextSibling) {
    header.parentNode.insertBefore(wrapper, header.nextSibling);
  } else if (document.body.firstChild) {
    document.body.insertBefore(wrapper, document.body.firstChild);
  } else {
    document.body.appendChild(wrapper);
  }

  var ticking = false;

  function updateProgress() {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var scrollHeight = document.documentElement.scrollHeight;
    var clientHeight = document.documentElement.clientHeight;
    var maxScroll = scrollHeight - clientHeight;
    var percentage = 0;

    if (maxScroll > 0) {
      percentage = (scrollTop / maxScroll) * 100;
      if (percentage > 100) {
        percentage = 100;
      }
      if (percentage < 0) {
        percentage = 0;
      }
    }

    bar.style.width = percentage + '%';

    if (scrollTop > SHOW_THRESHOLD) {
      wrapper.classList.add(CLASS_VISIBLE);
    } else {
      wrapper.classList.remove(CLASS_VISIBLE);
    }

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(updateProgress);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();

// 3. Code Copy Buttons
(function() {
  'use strict';

  var COPIED_DURATION = 2000;
  var CLASS_COPIED = 'code-block__copy--copied';

  var blocks = document.querySelectorAll('.code-block, .prompt-block');

  if (!blocks.length) {
    return;
  }

  function getTextContent(block) {
    var pre = block.querySelector('pre');
    if (pre) {
      return pre.textContent;
    }
    var code = block.querySelector('code');
    if (code) {
      return code.textContent;
    }
    return block.textContent;
  }

  function fallbackCopy(text) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    var success = false;
    try {
      success = document.execCommand('copy');
    } catch (e) {
      success = false;
    }

    document.body.removeChild(textarea);
    return success;
  }

  function handleCopy(btn, block) {
    var text = getTextContent(block);

    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(text).then(function() {
        showCopied(btn);
      }, function() {
        if (fallbackCopy(text)) {
          showCopied(btn);
        }
      });
    } else {
      if (fallbackCopy(text)) {
        showCopied(btn);
      }
    }
  }

  function showCopied(btn) {
    btn.textContent = 'Copied!';
    btn.classList.add(CLASS_COPIED);

    setTimeout(function() {
      btn.textContent = 'Copy';
      btn.classList.remove(CLASS_COPIED);
    }, COPIED_DURATION);
  }

  for (var i = 0; i < blocks.length; i++) {
    (function(block) {
      block.style.position = 'relative';

      var btn = document.createElement('button');
      btn.className = 'code-block__copy';
      btn.setAttribute('aria-label', 'Copy code to clipboard');
      btn.textContent = 'Copy';

      btn.addEventListener('click', function() {
        handleCopy(btn, block);
      });

      block.appendChild(btn);
    })(blocks[i]);
  }
})();

// 4. TOC Scroll Spy
(function() {
  'use strict';

  if (typeof IntersectionObserver === 'undefined') {
    return;
  }

  var tocLinks = document.querySelectorAll('.toc__list a');

  if (!tocLinks.length) {
    return;
  }

  var CLASS_ACTIVE = 'active';
  var sections = [];
  var linkMap = {};

  for (var i = 0; i < tocLinks.length; i++) {
    var href = tocLinks[i].getAttribute('href');
    if (href && href.charAt(0) === '#') {
      var id = href.substring(1);
      var section = document.getElementById(id);
      if (section) {
        sections.push(section);
        linkMap[id] = tocLinks[i];
      }
    }
  }

  if (!sections.length) {
    return;
  }

  function clearActive() {
    for (var j = 0; j < tocLinks.length; j++) {
      tocLinks[j].classList.remove(CLASS_ACTIVE);
    }
  }

  var observer = new IntersectionObserver(function(entries) {
    for (var k = 0; k < entries.length; k++) {
      if (entries[k].isIntersecting) {
        var entryId = entries[k].target.id;
        if (linkMap[entryId]) {
          clearActive();
          linkMap[entryId].classList.add(CLASS_ACTIVE);
        }
      }
    }
  }, {
    rootMargin: '-20% 0px -70% 0px'
  });

  for (var m = 0; m < sections.length; m++) {
    observer.observe(sections[m]);
  }
})();

// 5. Mobile Nav Close on Link Click
(function() {
  'use strict';

  var mobileNav = document.getElementById('mobile-nav');

  if (!mobileNav) {
    return;
  }

  var links = mobileNav.querySelectorAll('a');

  if (!links.length) {
    return;
  }

  var CLASS_OPEN = 'is-open';

  function closeNav() {
    mobileNav.classList.remove(CLASS_OPEN);

    var toggle = document.querySelector('.nav-toggle, [aria-controls="mobile-nav"]');
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
    }
  }

  for (var i = 0; i < links.length; i++) {
    links[i].addEventListener('click', closeNav);
  }
})();

// 6. Smooth Scroll for Anchor Links
(function() {
  'use strict';

  var anchorLinks = document.querySelectorAll('a[href^="#"]');

  if (!anchorLinks.length) {
    return;
  }

  function getHeaderHeight() {
    var header = document.querySelector('.site-header, header');
    if (header) {
      return header.offsetHeight;
    }
    return 0;
  }

  function handleClick(e) {
    var href = this.getAttribute('href');

    if (!href || href === '#') {
      return;
    }

    var targetId = href.substring(1);
    var target = document.getElementById(targetId);

    if (!target) {
      return;
    }

    e.preventDefault();

    var headerOffset = getHeaderHeight();
    var elementPosition = target.getBoundingClientRect().top;
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var offsetPosition = scrollTop + elementPosition - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }

  for (var i = 0; i < anchorLinks.length; i++) {
    anchorLinks[i].addEventListener('click', handleClick);
  }
})();
