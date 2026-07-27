(function () {
  'use strict';

  /* =========================================================
     LSFFL MFL DATA BRIDGE
     Reads information already rendered by MFL on the page.
  ========================================================= */

  const MESSAGE_STORAGE_KEY = 'lsfflMflCommissionerMessages';
  const MAX_SAVED_MESSAGES = 5;

  const capturedMessages = new Set();
  const subscribers = new Set();

  let observer = null;
  let scanTimer = null;

  /* =========================================================
     GENERAL HELPERS
  ========================================================= */

  function cleanText(value) {
    return String(value || '')
      .replace(/\u00a0/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function isVisible(element) {
    if (!element || !(element instanceof Element)) {
      return false;
    }

    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();

    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      Number(style.opacity || 1) !== 0 &&
      rect.width > 0 &&
      rect.height > 0
    );
  }

  function isOurTicker(element) {
    return Boolean(
      element.closest &&
      element.closest('#lsffl-custom-ticker')
    );
  }

  function isIgnoredText(text) {
    const normalized = cleanText(text).toUpperCase();

    if (!normalized) {
      return true;
    }

    const ignoredExactValues = [
      'NAVY TIMES',
      'LATEST ARTICLES',
      'HOME',
      'LOCKER ROOM',
      'LATEST NEWS',
      'TRANSACTIONS',
      'HISTORY PAGE',
      'CALENDAR'
    ];

    if (ignoredExactValues.includes(normalized)) {
      return true;
    }

    const ignoredFragments = [
      'LAMAD SQUAD FANTASY FOOTBALL LEAGUE',
      'SUBMIT LINEUP',
      'ADD/DROP',
      'SCOREBOARD',
      'LEAGUE STANDINGS',
      'LIVE SCORING',
      'BULLDOGS DIVISION',
      'MY ACCOUNT',
      'PLAYER RESEARCH',
      'DRAFT/AUCTION'
    ];

    return ignoredFragments.some(function (fragment) {
      return normalized.includes(fragment);
    });
  }

  function isReasonableMessage(text) {
    const cleaned = cleanText(text);

    return (
      cleaned.length >= 3 &&
      cleaned.length <= 400 &&
      !isIgnoredText(cleaned)
    );
  }

  /* =========================================================
     SAVED MESSAGE CACHE
  ========================================================= */

  function loadSavedMessages() {
    try {
      const saved = JSON.parse(
        localStorage.getItem(MESSAGE_STORAGE_KEY)
      );

      if (!Array.isArray(saved)) {
        return [];
      }

      return saved
        .map(cleanText)
        .filter(isReasonableMessage)
        .slice(0, MAX_SAVED_MESSAGES);
    } catch (error) {
      return [];
    }
  }

  function saveMessages() {
    const messages = Array.from(capturedMessages)
      .filter(isReasonableMessage)
      .slice(0, MAX_SAVED_MESSAGES);

    localStorage.setItem(
      MESSAGE_STORAGE_KEY,
      JSON.stringify(messages)
    );
  }

  loadSavedMessages().forEach(function (message) {
    capturedMessages.add(message);
  });

  /* =========================================================
     MESSAGE DISCOVERY
  ========================================================= */

  function getLikelyScrollerElements() {
    const selectors = [
      'marquee',
      '[id*="scroll" i]',
      '[class*="scroll" i]',
      '[id*="marquee" i]',
      '[class*="marquee" i]',
      '[id*="applet" i]',
      '[class*="applet" i]'
    ];

    const elements = [];

    selectors.forEach(function (selector) {
      try {
        document.querySelectorAll(selector).forEach(function (element) {
          if (!elements.includes(element)) {
            elements.push(element);
          }
        });
      } catch (error) {
        // Ignore unsupported selectors in older browsers.
      }
    });

    return elements;
  }

  function extractTextCandidates(element) {
    const candidates = [];

    if (!element || isOurTicker(element)) {
      return candidates;
    }

    const directText = cleanText(element.textContent);

    if (isReasonableMessage(directText)) {
      candidates.push(directText);
    }

    element.querySelectorAll(
      'span, div, p, a, td, font'
    ).forEach(function (child) {
      if (!isVisible(child) || isOurTicker(child)) {
        return;
      }

      const childText = cleanText(child.textContent);

      if (
        isReasonableMessage(childText) &&
        child.children.length === 0
      ) {
        candidates.push(childText);
      }
    });

    return candidates;
  }

  function scanTopOfPage() {
    const candidates = [];

    document.querySelectorAll(
      'body *'
    ).forEach(function (element) {
      if (
        !isVisible(element) ||
        isOurTicker(element)
      ) {
        return;
      }

      const rect = element.getBoundingClientRect();

      if (
        rect.top < -10 ||
        rect.top > 220 ||
        rect.width < 350 ||
        rect.height < 10 ||
        rect.height > 85
      ) {
        return;
      }

      const text = cleanText(element.textContent);

      if (
        isReasonableMessage(text) &&
        element.children.length <= 3
      ) {
        candidates.push(text);
      }
    });

    return candidates;
  }

  function addMessages(messages) {
    let changed = false;

    messages.forEach(function (message) {
      const cleaned = cleanText(message);

      if (
        !isReasonableMessage(cleaned) ||
        capturedMessages.has(cleaned)
      ) {
        return;
      }

      capturedMessages.add(cleaned);
      changed = true;
    });

    while (capturedMessages.size > MAX_SAVED_MESSAGES) {
      const oldest = capturedMessages.values().next().value;
      capturedMessages.delete(oldest);
    }

    if (changed) {
      saveMessages();
      notifySubscribers();
    }

    return changed;
  }

  function scanForCommissionerMessages() {
    const found = [];

    getLikelyScrollerElements().forEach(function (element) {
      extractTextCandidates(element).forEach(function (text) {
        found.push(text);
      });
    });

    scanTopOfPage().forEach(function (text) {
      found.push(text);
    });

    addMessages(found);

    return getCommissionerMessages();
  }

  /* =========================================================
     SUBSCRIPTIONS
  ========================================================= */

  function notifySubscribers() {
    const messages = getCommissionerMessages();

    subscribers.forEach(function (callback) {
      try {
        callback(messages.slice());
      } catch (error) {
        console.error(
          'LSFFL commissioner message subscriber failed:',
          error
        );
      }
    });
  }

  function subscribeToCommissionerMessages(callback) {
    if (typeof callback !== 'function') {
      return function () {};
    }

    subscribers.add(callback);

    callback(getCommissionerMessages());

    return function unsubscribe() {
      subscribers.delete(callback);
    };
  }

  /* =========================================================
     PUBLIC DATA METHODS
  ========================================================= */

  function getCommissionerMessages() {
    return Array.from(capturedMessages)
      .filter(isReasonableMessage)
      .slice(0, MAX_SAVED_MESSAGES);
  }

  function clearCommissionerMessageCache() {
    capturedMessages.clear();
    localStorage.removeItem(MESSAGE_STORAGE_KEY);
    notifySubscribers();
    scanForCommissionerMessages();
  }

  /* =========================================================
     PAGE WATCHER
  ========================================================= */

  function scheduleScan() {
    clearTimeout(scanTimer);

    scanTimer = setTimeout(function () {
      scanForCommissionerMessages();
    }, 150);
  }

  function startObserver() {
    if (observer || !document.documentElement) {
      return;
    }

    observer = new MutationObserver(function () {
      scheduleScan();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  function initialize() {
    scanForCommissionerMessages();
    startObserver();

    /*
      MFL scrolling text may rotate messages without replacing
      the entire page element, so periodically scan the header.
    */
    setInterval(function () {
      scanForCommissionerMessages();
    }, 1000);
  }

  /* =========================================================
     EXPOSE DATA BRIDGE
  ========================================================= */

  window.LSFFL_MFL_DATA = {
    getCommissionerMessages:
      getCommissionerMessages,

    subscribeToCommissionerMessages:
      subscribeToCommissionerMessages,

    scanForCommissionerMessages:
      scanForCommissionerMessages,

    clearCommissionerMessageCache:
      clearCommissionerMessageCache
  };

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      initialize
    );
  } else {
    initialize();
  }
})();
