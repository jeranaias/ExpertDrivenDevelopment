// Ask EDD - floating chat widget for the EDD site.
// Configure via script tag: <script src="..." data-api="https://ask-edd.<you>.workers.dev"></script>
// Everything is self-contained: styles, DOM, and state all inject from here.

(function () {
  'use strict';

  const SCRIPT = document.currentScript || (function () {
    const s = document.getElementsByTagName('script');
    return s[s.length - 1];
  })();

  const CONFIG = {
    apiBase: (SCRIPT && SCRIPT.dataset.api) || 'https://ask-edd.workers.dev',
    maxClientMsgsPerHour: 10,
    maxHistory: 40,
    storageKeys: {
      disclaimer: 'eddChat.disclaimerAccepted',
      conversation: 'eddChat.conversation',
      collapsed: 'eddChat.collapsed',
      sessionId: 'eddChat.sessionId',
      rateLog: 'eddChat.rateLog',
    },
  };

  const SYSTEM_PROMPT = [
    'You are the EDD Assistant for Marines at MCCES learning Expert-Driven Development.',
    'Keep responses tight: bullets over prose, lead with the actionable answer.',
    'Tie answers back to EDD concepts (Five Phases, mastery metrics, CRT methodology) when relevant.',
    'This runs on a personal-device channel, not on any DoD network.',
    'Refuse CUI, PII, classification markings, or operational content from official systems. Say "That belongs in a .mil environment" and decline.',
    'If you do not know, say so. Do not invent.',
  ].join(' ');

  const DISCLAIMER_LINES = [
    'Personal-device channel, hosted outside DoD networks.',
    'Do not enter CUI, PII, classified material, or operational content.',
    'Responses are AI-generated. Verify anything actionable before using it.',
    'Treat conversations as informal and temporary.',
  ];

  // ------------------------------------------------------------------
  // Styles
  // ------------------------------------------------------------------
  const CSS = `
  .edd-chat-launcher {
    position: fixed;
    right: 20px;
    bottom: 20px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #CC0000;
    color: #fff;
    border: none;
    box-shadow: 0 6px 18px rgba(0,0,0,0.25);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2147483600;
    transition: transform 0.15s ease, background 0.15s ease;
  }
  .edd-chat-launcher:hover { background: #a30000; transform: scale(1.05); }
  .edd-chat-launcher:focus { outline: 3px solid #F5D130; outline-offset: 2px; }
  .edd-chat-launcher svg { width: 28px; height: 28px; }

  .edd-chat-panel {
    position: fixed;
    right: 20px;
    bottom: 88px;
    width: 380px;
    max-width: calc(100vw - 40px);
    height: 560px;
    max-height: calc(100vh - 120px);
    background: #fff;
    border: 1px solid #d9d8d4;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.18);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    z-index: 2147483600;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 14px;
    color: #1a1a1a;
  }
  .edd-chat-panel[hidden] { display: none; }

  .edd-chat-header {
    padding: 12px 14px;
    background: #CC0000;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
  }
  .edd-chat-header__title { flex: 1; }
  .edd-chat-header__btn {
    background: transparent;
    border: none;
    color: #fff;
    padding: 4px 6px;
    border-radius: 4px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .edd-chat-header__btn:hover { background: rgba(255,255,255,0.15); }
  .edd-chat-header__btn svg { width: 18px; height: 18px; }

  .edd-chat-body {
    flex: 1;
    overflow-y: auto;
    padding: 14px;
    background: #f8f7f5;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .edd-chat-msg {
    max-width: 88%;
    padding: 8px 12px;
    border-radius: 10px;
    line-height: 1.45;
    white-space: pre-wrap;
    word-wrap: break-word;
  }
  .edd-chat-msg--user {
    align-self: flex-end;
    background: #CC0000;
    color: #fff;
    border-bottom-right-radius: 2px;
  }
  .edd-chat-msg--assistant {
    align-self: flex-start;
    background: #fff;
    color: #1a1a1a;
    border: 1px solid #e8e7e3;
    border-bottom-left-radius: 2px;
  }
  .edd-chat-msg--system {
    align-self: center;
    background: #fef7e0;
    color: #5f4b08;
    border: 1px solid #f9ab00;
    font-size: 12px;
    max-width: 100%;
    text-align: center;
  }
  .edd-chat-msg--error {
    align-self: center;
    background: #fce8e8;
    color: #5c0000;
    border: 1px solid #CC0000;
    font-size: 12px;
    max-width: 100%;
  }

  .edd-chat-footer {
    border-top: 1px solid #e8e7e3;
    padding: 10px;
    background: #fff;
    display: flex;
    gap: 8px;
    align-items: flex-end;
  }
  .edd-chat-input {
    flex: 1;
    min-height: 38px;
    max-height: 120px;
    padding: 8px 10px;
    border: 1px solid #d9d8d4;
    border-radius: 6px;
    font-family: inherit;
    font-size: 14px;
    resize: none;
    background: #fff;
    color: #1a1a1a;
  }
  .edd-chat-input:focus { outline: 2px solid #CC0000; border-color: #CC0000; }
  .edd-chat-send {
    background: #CC0000;
    color: #fff;
    border: none;
    border-radius: 6px;
    padding: 0 14px;
    height: 38px;
    cursor: pointer;
    font-weight: 600;
  }
  .edd-chat-send:hover:not(:disabled) { background: #a30000; }
  .edd-chat-send:disabled { background: #d9d8d4; color: #6e6e6e; cursor: not-allowed; }

  .edd-chat-disclaimer {
    padding: 18px;
    overflow-y: auto;
    background: #fff;
    flex: 1;
  }
  .edd-chat-disclaimer h3 {
    margin: 0 0 10px 0;
    font-size: 16px;
    color: #1a1a1a;
  }
  .edd-chat-disclaimer ul {
    margin: 0 0 16px 18px;
    padding: 0;
    color: #4a4a4a;
    line-height: 1.5;
  }
  .edd-chat-disclaimer li { margin-bottom: 6px; }
  .edd-chat-disclaimer__accept {
    background: #CC0000;
    color: #fff;
    border: none;
    border-radius: 6px;
    padding: 10px 16px;
    cursor: pointer;
    font-weight: 600;
    width: 100%;
  }
  .edd-chat-disclaimer__accept:hover { background: #a30000; }

  .edd-chat-typing {
    align-self: flex-start;
    color: #6e6e6e;
    font-size: 12px;
    font-style: italic;
    padding: 4px 8px;
  }

  @media (max-width: 480px) {
    .edd-chat-panel {
      right: 10px;
      left: 10px;
      bottom: 78px;
      width: auto;
      height: calc(100vh - 100px);
    }
    .edd-chat-launcher { right: 14px; bottom: 14px; }
  }
  `;

  // ------------------------------------------------------------------
  // Icons
  // ------------------------------------------------------------------
  const ICONS = {
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>',
  };

  // ------------------------------------------------------------------
  // State helpers
  // ------------------------------------------------------------------
  function storageGet(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return v === null ? fallback : JSON.parse(v);
    } catch { return fallback; }
  }
  function storageSet(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }
  function getOrMakeSessionId() {
    let id = storageGet(CONFIG.storageKeys.sessionId, null);
    if (!id) {
      id = (crypto.randomUUID && crypto.randomUUID()) ||
           ('s-' + Date.now() + '-' + Math.random().toString(36).slice(2));
      storageSet(CONFIG.storageKeys.sessionId, id);
    }
    return id;
  }

  // Rolling rate limit: log timestamps, prune older than 1h, block if >= cap.
  function rateCheck() {
    const now = Date.now();
    const cutoff = now - 60 * 60 * 1000;
    let log = storageGet(CONFIG.storageKeys.rateLog, []);
    log = log.filter(t => t > cutoff);
    if (log.length >= CONFIG.maxClientMsgsPerHour) {
      const oldest = log[0];
      const waitMin = Math.ceil((oldest + 60 * 60 * 1000 - now) / 60000);
      return { ok: false, waitMin };
    }
    log.push(now);
    storageSet(CONFIG.storageKeys.rateLog, log);
    return { ok: true };
  }

  // ------------------------------------------------------------------
  // DOM construction
  // ------------------------------------------------------------------
  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        if (k === 'class') node.className = attrs[k];
        else if (k === 'html') node.innerHTML = attrs[k];
        else if (k.startsWith('on') && typeof attrs[k] === 'function') node.addEventListener(k.slice(2), attrs[k]);
        else if (attrs[k] === true) node.setAttribute(k, '');
        else if (attrs[k] !== false && attrs[k] != null) node.setAttribute(k, attrs[k]);
      }
    }
    if (children) {
      (Array.isArray(children) ? children : [children]).forEach(c => {
        if (c == null) return;
        node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
      });
    }
    return node;
  }

  function injectStyles() {
    if (document.getElementById('edd-chat-styles')) return;
    const style = document.createElement('style');
    style.id = 'edd-chat-styles';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  // ------------------------------------------------------------------
  // Widget
  // ------------------------------------------------------------------
  function buildWidget() {
    injectStyles();
    const sessionId = getOrMakeSessionId();

    let conversation = storageGet(CONFIG.storageKeys.conversation, []);
    let isStreaming = false;
    let abortController = null;

    const launcher = el('button', {
      class: 'edd-chat-launcher',
      'aria-label': 'Open Ask EDD chat',
      html: ICONS.shield,
    });

    const header = el('div', { class: 'edd-chat-header' }, [
      el('span', { class: 'edd-chat-header__title' }, 'Ask EDD'),
      el('button', {
        class: 'edd-chat-header__btn',
        'aria-label': 'Clear conversation',
        title: 'Clear conversation',
        html: ICONS.trash,
        onclick: () => {
          if (!confirm('Clear the current conversation?')) return;
          conversation = [];
          storageSet(CONFIG.storageKeys.conversation, conversation);
          renderConversation();
        },
      }),
      el('button', {
        class: 'edd-chat-header__btn',
        'aria-label': 'Close',
        title: 'Close',
        html: ICONS.close,
        onclick: closePanel,
      }),
    ]);

    const body = el('div', { class: 'edd-chat-body', role: 'log', 'aria-live': 'polite' });

    const input = el('textarea', {
      class: 'edd-chat-input',
      placeholder: 'Ask about EDD, prompting, Power Platform...',
      rows: 1,
      'aria-label': 'Message',
    });
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });

    const sendBtn = el('button', {
      class: 'edd-chat-send',
      onclick: handleSend,
    }, 'Send');

    const footer = el('div', { class: 'edd-chat-footer' }, [input, sendBtn]);

    const disclaimerAccept = el('button', {
      class: 'edd-chat-disclaimer__accept',
      onclick: () => {
        storageSet(CONFIG.storageKeys.disclaimer, true);
        showChatView();
      },
    }, 'I understand, continue');

    const disclaimer = el('div', { class: 'edd-chat-disclaimer' }, [
      el('h3', null, 'Before you chat'),
      el('ul', null, DISCLAIMER_LINES.map(line => el('li', null, line))),
      disclaimerAccept,
    ]);

    const panel = el('div', {
      class: 'edd-chat-panel',
      role: 'dialog',
      'aria-label': 'Ask EDD chat',
    }, [header, body, footer]);
    panel.hidden = true;

    launcher.addEventListener('click', openPanel);

    document.body.appendChild(launcher);
    document.body.appendChild(panel);

    // ----------------------------------------------------------------
    // View switching
    // ----------------------------------------------------------------
    function showDisclaimerView() {
      if (panel.contains(body)) panel.removeChild(body);
      if (panel.contains(footer)) panel.removeChild(footer);
      if (!panel.contains(disclaimer)) panel.appendChild(disclaimer);
    }
    function showChatView() {
      if (panel.contains(disclaimer)) panel.removeChild(disclaimer);
      if (!panel.contains(body)) panel.appendChild(body);
      if (!panel.contains(footer)) panel.appendChild(footer);
      renderConversation();
      setTimeout(() => input.focus(), 50);
    }
    function openPanel() {
      panel.hidden = false;
      launcher.style.display = 'none';
      storageSet(CONFIG.storageKeys.collapsed, false);
      if (storageGet(CONFIG.storageKeys.disclaimer, false)) {
        showChatView();
      } else {
        showDisclaimerView();
      }
    }
    function closePanel() {
      if (isStreaming && abortController) abortController.abort();
      panel.hidden = true;
      launcher.style.display = 'flex';
      storageSet(CONFIG.storageKeys.collapsed, true);
    }

    // ----------------------------------------------------------------
    // Conversation rendering
    // ----------------------------------------------------------------
    function renderConversation() {
      body.innerHTML = '';
      if (conversation.length === 0) {
        body.appendChild(el('div', {
          class: 'edd-chat-msg edd-chat-msg--system',
        }, 'Ask anything about Expert-Driven Development, prompting, Power Platform, or AI work patterns.'));
        return;
      }
      conversation.forEach(m => body.appendChild(renderMsg(m)));
      body.scrollTop = body.scrollHeight;
    }
    function renderMsg(m) {
      const cls = 'edd-chat-msg edd-chat-msg--' + (m.role === 'user' ? 'user' : 'assistant');
      return el('div', { class: cls }, m.content || '');
    }

    // ----------------------------------------------------------------
    // Send + stream
    // ----------------------------------------------------------------
    async function handleSend() {
      const text = input.value.trim();
      if (!text || isStreaming) return;

      const limit = rateCheck();
      if (!limit.ok) {
        body.appendChild(el('div', {
          class: 'edd-chat-msg edd-chat-msg--system',
        }, `Take a breath. You have hit the local rate limit. Try again in about ${limit.waitMin} minute(s).`));
        body.scrollTop = body.scrollHeight;
        return;
      }

      const userMsg = { role: 'user', content: text };
      conversation.push(userMsg);
      if (conversation.length > CONFIG.maxHistory) {
        conversation = conversation.slice(-CONFIG.maxHistory);
      }
      storageSet(CONFIG.storageKeys.conversation, conversation);

      input.value = '';
      input.style.height = 'auto';
      input.focus();

      body.appendChild(renderMsg(userMsg));

      const assistantNode = el('div', { class: 'edd-chat-msg edd-chat-msg--assistant' }, '');
      body.appendChild(assistantNode);

      const typing = el('div', { class: 'edd-chat-typing' }, 'thinking...');
      body.appendChild(typing);
      body.scrollTop = body.scrollHeight;

      isStreaming = true;
      sendBtn.disabled = true;
      abortController = new AbortController();

      const payload = {
        model: 'local',
        stream: true,
        max_tokens: 1024,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...conversation,
        ],
      };

      let assembled = '';

      try {
        const res = await fetch(CONFIG.apiBase.replace(/\/+$/, '') + '/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Session-ID': sessionId,
          },
          body: JSON.stringify(payload),
          signal: abortController.signal,
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let sepIdx;
          while ((sepIdx = buffer.indexOf('\n')) !== -1) {
            const line = buffer.slice(0, sepIdx).trim();
            buffer = buffer.slice(sepIdx + 1);
            if (!line.startsWith('data:')) continue;
            const data = line.slice(5).trim();
            if (data === '[DONE]') { buffer = ''; break; }
            try {
              const chunk = JSON.parse(data);
              const delta = chunk.choices && chunk.choices[0] && chunk.choices[0].delta;
              const content = delta && delta.content;
              if (content) {
                assembled += content;
                assistantNode.textContent = assembled;
                body.scrollTop = body.scrollHeight;
              }
            } catch {
              // Ignore malformed chunks; keep reading.
            }
          }
        }

        if (typing.parentNode) typing.parentNode.removeChild(typing);

        if (assembled) {
          conversation.push({ role: 'assistant', content: assembled });
          if (conversation.length > CONFIG.maxHistory) {
            conversation = conversation.slice(-CONFIG.maxHistory);
          }
          storageSet(CONFIG.storageKeys.conversation, conversation);
        } else {
          assistantNode.parentNode.removeChild(assistantNode);
          showFailure('Empty response from server.');
        }

      } catch (err) {
        if (typing.parentNode) typing.parentNode.removeChild(typing);
        if (assistantNode.parentNode && !assembled) assistantNode.parentNode.removeChild(assistantNode);
        if (err.name === 'AbortError') {
          // Intentional close; do nothing.
        } else {
          showFailure('Not reachable from this network. Try from a personal device or mobile data.');
        }
      } finally {
        isStreaming = false;
        sendBtn.disabled = false;
        abortController = null;
      }
    }

    function showFailure(msg) {
      const fail = el('div', { class: 'edd-chat-msg edd-chat-msg--error' }, msg);
      body.appendChild(fail);
      body.scrollTop = body.scrollHeight;
    }

    // If the user was previously open, keep launcher visible anyway; they can reopen.
    // Always start collapsed on page load so the widget is not intrusive.
    panel.hidden = true;
    launcher.style.display = 'flex';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildWidget);
  } else {
    buildWidget();
  }
})();
