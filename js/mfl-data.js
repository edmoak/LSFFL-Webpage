(function () {
  'use strict';

  /* =========================================================
     LSFFL MFL DATA BRIDGE
     LIVE COMMISSIONER SCROLLING TEXT
  ========================================================= */

  const CUSTOM_TICKER_ID = 'lsffl-custom-ticker';

  const STORAGE_KEY =
    'lsfflLiveCommissionerMessagesV1';

  const MAX_MESSAGES = 5;

  const messages = [];
  const subscribers = new Set();

  let observer = null;
  let scanTimer = null;

  /* =========================================================
     HELPERS
  ========================================================= */

  function cleanText(value) {
    return String(value || '')
      .replace(/\u00a0/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function getUpperText(element) {
    return cleanText(element.textContent).toUpperCase();
  }

  function isElementVisible(element) {
    if (
      !element ||
      !(element instanceof Element)
    ) {
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

  function belongsToCustomTicker(element) {
    return Boolean(
      element.closest &&
      element.closest('#' + CUSTOM_TICKER_ID)
    );
  }

  function belongsToOldNavyTimes(element) {
    if (!element || belongsToCustomTicker(element)) {
      return false;
    }

    let current = element;

    for (let level = 0; level < 6 && current; level += 1) {
      const text = getUpperText(current);

      if (
        text.includes('NAVY TIMES') &&
        (
          text.includes('LATEST ARTICLES') ||
          text.includes('FANTASY MATCHUPS') ||
          text.includes('WAIVER ORDER') ||
          text.includes('MARQUEE SETTINGS')
        )
      ) {
        return true;
      }

      current = current.parentElement;
    }

    return false;
  }

  function isRejectedPageText(text) {
    const upper = cleanText(text).toUpperCase();

    if (!upper) {
      return true;
    }

    const rejectedPhrases = [
      'NAVY TIMES',
      'LATEST ARTICLES',
      'FANTASY MATCHUPS',
      'WAIVER ORDER',
      'LEAGUE NEWS',
      'TRANSACTIONS',
      'NFL NEWS',
      'LAMAD SQUAD FANTASY FOOTBALL LEAGUE',
      'HOME AWAY FROM HOME',
      'SUBMIT LINEUP',
      'ADD/DROP',
      'TRADES',
      'ROSTERS',
      'SCOREBOARD',
      'RULES',
      'LEAGUE STANDINGS',
      'LIVE SCORING',
      'BULLDOGS DIVISION',
      'LOCKER ROOM',
      'HISTORY PAGE',
      'PLAYER RESEARCH',
      'DRAFT/AUCTION',
      'MY ACCOUNT',
      'WEEK 1',
      'WED SEP'
    ];

    return rejectedPhrases.some(function (phrase) {
      return upper.includes(phrase);
    });
  }

  function isValidCommissionerMessage(text) {
    const cleaned = cleanText(text);

    return (
      cleaned.length >= 3 &&
      cleaned.length <= 300 &&
      !isRejectedPageText(cleaned)
    );
  }

  /* =========================================================
     STORAGE
  ========================================================= */

  function loadStoredMessages() {
    try {
      const stored = JSON.parse(
        localStorage.getItem(STORAGE_KEY)
      );

      if (!Array.isArray(stored)) {
        return;
      }

      stored.forEach(function (message) {
        addMessage(message, false);
      });
    } catch (error) {
      // Ignore invalid saved data.
    }
  }

  function saveMessages() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(messages.slice(0, MAX_MESSAGES))
    );
  }

  /* =========================================================
     MESSAGE MANAGEMENT
  ========================================================= */

  function addMessage(value, shouldNotify) {
    const message = cleanText(value);

    if (!isValidCommissionerMessage(message)) {
      return false;
    }

    if (messages.includes(message)) {
      return false;
    }

    messages.push(message);

    while (messages.length > MAX_MESSAGES) {
      messages.shift();
    }

    saveMessages();

    if (shouldNotify !== false) {
      notifySubscribers();
    }

    return true;
  }

  function getCommissionerMessages() {
    return messages.slice();
  }

  function notifySubscribers() {
    const snapshot = getCommissionerMessages();

    subscribers.forEach(function (callback) {
      try {
        callback(snapshot.slice());
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

  function clearCommissionerMessageCache() {
    messages.length = 0;
    localStorage.removeItem(STORAGE_KEY);
    notifySubscribers();
  }

  /* =========================================================
     FIND THE REAL MFL SCROLLING TEXT
  ========================================================= */

  function getDirectText(element) {
    let text = '';

    element.childNodes.forEach(function (node) {
      if (node.nodeType === Node.TEXT_NODE) {
        text += ' ' + node.nodeValue;
      }
    });

    return cleanText(text);
  }

  function collectCandidateText(element) {
    const candidates = [];

    const directText = getDirectText(element);
    const fullText = cleanText(element.textContent);

    if (isValidCommissionerMessage(directText)) {
      candidates.push(directText);
    }

    if (
      isValidCommissionerMessage(fullText) &&
      element.children.length <= 3
    ) {
      candidates.push(fullText);
    }

    element.querySelectorAll(
      'span, div, td, font, p, a'
    ).forEach(function (child) {
      if (
        belongsToCustomTicker(child) ||
        belongsToOldNavyTimes(child) ||
        !isElementVisible(child) ||
        child.children.length > 1
      ) {
        return;
      }

      const childText = cleanText(child.textContent);

      if (isValidCommissionerMessage(childText)) {
        candidates.push(childText);
      }
    });

    return Array.from(new Set(candidates));
  }

  function findExplicitScrollerElements() {
    const selectors = [
      'marquee',
      '[id*="scroll" i]',
      '[class*="scroll" i]',
      '[id*="applet" i]',
      '[class*="applet" i]'
    ];

    const results = [];

    selectors.forEach(function (selector) {
      let found = [];

      try {
        found = document.querySelectorAll(selector);
      } catch (error) {
        return;
      }

      found.forEach(function (element) {
        if (
          belongsToCustomTicker(element) ||
          belongsToOldNavyTimes(element)
        ) {
          return;
        }

        const rect = element.getBoundingClientRect();

        if (
          rect.top >= 70 &&
          rect.top <= 210 &&
          rect.width >= 500 &&
          rect.height >= 8 &&
          rect.height <= 80
        ) {
          results.push(element);
        }
      });
    });

    return Array.from(new Set(results));
  }

  function findTopPageScrollerFallbacks() {
    const results = [];

    document.querySelectorAll(
      'body > div, body > table, body > span, body div, body td'
    ).forEach(function (element) {
      if (
        belongsToCustomTicker(element) ||
        belongsToOldNavyTimes(element) ||
        !isElementVisible(element)
      ) {
        return;
      }

      const rect = element.getBoundingClientRect();

      if (
        rect.top < 70 ||
        rect.top > 210 ||
        rect.width < 700 ||
        rect.height < 12 ||
        rect.height > 60
      ) {
        return;
      }

      const text = cleanText(element.textContent);

      if (
        isValidCommissionerMessage(text) &&
        element.children.length <= 3
      ) {
        results.push(element);
      }
    });

    return Array.from(new Set(results));
  }

  function scanForCommissionerMessages() {
    const candidateElements = [
      ...findExplicitScrollerElements(),
      ...findTopPageScrollerFallbacks()
    ];

    let changed = false;

    Array.from(new Set(candidateElements)).forEach(
      function (element) {
        collectCandidateText(element).forEach(
          function (text) {
            if (addMessage(text, false)) {
              changed = true;
            }
          }
        );
      }
    );

    if (changed) {
      notifySubscribers();
    }

    return getCommissionerMessages();
  }

  /* =========================================================
     WATCH FOR ROTATING MFL TEXT
  ========================================================= */

  function scheduleScan() {
    clearTimeout(scanTimer);

    scanTimer = setTimeout(function () {
      scanForCommissionerMessages();
    }, 100);
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
    loadStoredMessages();

    scanForCommissionerMessages();
    startObserver();

    /*
      The MFL message may move inside its scrolling container
      without replacing the whole page element. Recheck once
      per second so all five saved lines can be captured.
    */
    window.setInterval(function () {
      scanForCommissionerMessages();
    }, 1000);
  }

  /* =========================================================
     PUBLIC MODULE
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
