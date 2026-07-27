(function () {
  'use strict';

  /* =========================================================
     LSFFL NAVY TIMES
     COMPLETE REPLACEMENT FILE
     POSITION AND WIDTH CORRECTION
  ========================================================= */

  const TICKER_ID = 'lsffl-custom-ticker';
  const STYLE_ID = 'lsffl-custom-ticker-styles';

  const SETTINGS_URL =
    'https://edmoak.github.io/LSFFL-Webpage/js/lsffl-settings.js';

  const capturedCommissionerMessages = new Set();

  let tickerRoot = null;
  let tickerTrack = null;
  let settingsPanel = null;
  let currentSettings = null;
  let resizeTimer = null;

  /* =========================================================
     GENERAL HELPERS
  ========================================================= */

  function cleanText(value) {
    return String(value || '')
      .replace(/\u00a0/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function normalizedText(element) {
    return cleanText(element.textContent).toUpperCase();
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

  function createElement(tagName, className, text) {
    const element = document.createElement(tagName);

    if (className) {
      element.className = className;
    }

    if (typeof text === 'string') {
      element.textContent = text;
    }

    return element;
  }

  function loadScript(url, globalName) {
    return new Promise(function (resolve, reject) {
      if (window[globalName]) {
        resolve(window[globalName]);
        return;
      }

      const existingScript = Array.from(
        document.querySelectorAll('script[src]')
      ).find(function (script) {
        return script.src === url;
      });

      if (existingScript) {
        let checks = 0;

        const checker = setInterval(function () {
          checks += 1;

          if (window[globalName]) {
            clearInterval(checker);
            resolve(window[globalName]);
          }

          if (checks >= 100) {
            clearInterval(checker);

            if (!window[globalName]) {
              reject(
                new Error(
                  globalName + ' did not become available.'
                )
              );
            }
          }
        }, 100);

        return;
      }

      const script = document.createElement('script');
      script.src = url;
      script.async = false;

      script.onload = function () {
        if (window[globalName]) {
          resolve(window[globalName]);
        } else {
          reject(
            new Error(globalName + ' was not created.')
          );
        }
      };

      script.onerror = function () {
        reject(new Error('Could not load ' + url));
      };

      document.head.appendChild(script);
    });
  }

  /* =========================================================
     LOCATE THE ORIGINAL MFL NAVY TIMES TICKER
  ========================================================= */

  function isOldMflTickerElement(element) {
    if (
      !element ||
      element.id === TICKER_ID ||
      element.closest('#' + TICKER_ID)
    ) {
      return false;
    }

    const text = normalizedText(element);
    const rect = element.getBoundingClientRect();

    const containsTickerTitle =
      text.includes('NAVY TIMES');

    const containsTickerMaterial =
      text.includes('LATEST ARTICLES') ||
      text.includes('FANTASY MATCHUPS') ||
      text.includes('WAIVER ORDER') ||
      text.includes('MARQUEE SETTINGS');

    return (
      containsTickerTitle &&
      containsTickerMaterial &&
      rect.width > 500 &&
      rect.height >= 25 &&
      rect.height < 320
    );
  }

  function findOldMflTicker() {
    const selectors = [
      '[id*="marquee" i]',
      '[class*="marquee" i]',
      '[id*="ticker" i]',
      '[class*="ticker" i]',
      'table',
      'section',
      'article',
      'div'
    ];

    for (const selector of selectors) {
      let elements = [];

      try {
        elements = document.querySelectorAll(selector);
      } catch (error) {
        continue;
      }

      for (const element of elements) {
        if (isOldMflTickerElement(element)) {
          return element;
        }
      }
    }

    return null;
  }

  function findOldMflTickerContainer() {
    const ticker = findOldMflTicker();

    if (!ticker) {
      return null;
    }

    const candidates = [
      ticker.closest('.mobile-wrap'),
      ticker.closest('.report'),
      ticker.closest('.homepagetabcontent'),
      ticker.closest('table'),
      ticker
    ].filter(Boolean);

    for (const candidate of candidates) {
      if (isOldMflTickerElement(candidate)) {
        return candidate;
      }
    }

    return ticker;
  }

  function hideOldMflTicker() {
    const oldTicker = findOldMflTickerContainer();

    if (!oldTicker) {
      return;
    }

    oldTicker.setAttribute(
      'data-lsffl-hidden-old-ticker',
      'true'
    );

    oldTicker.style.setProperty(
      'display',
      'none',
      'important'
    );

    oldTicker.style.setProperty(
      'visibility',
      'hidden',
      'important'
    );

    oldTicker.style.setProperty(
      'height',
      '0',
      'important'
    );

    oldTicker.style.setProperty(
      'min-height',
      '0',
      'important'
    );

    oldTicker.style.setProperty(
      'margin',
      '0',
      'important'
    );

    oldTicker.style.setProperty(
      'padding',
      '0',
      'important'
    );

    oldTicker.style.setProperty(
      'border',
      '0',
      'important'
    );

    oldTicker.style.setProperty(
      'overflow',
      'hidden',
      'important'
    );
  }

  /* =========================================================
     READ MFL COMMISSIONER SCROLLING TEXT
  ========================================================= */

  function isValidCommissionerMessage(text) {
    const cleaned = cleanText(text);
    const upper = cleaned.toUpperCase();

    if (
      cleaned.length < 3 ||
      cleaned.length > 300
    ) {
      return false;
    }

    const rejectedPhrases = [
      'NAVY TIMES',
      'LATEST ARTICLES',
      'FANTASY MATCHUPS',
      'WAIVER ORDER',
      'LAMAD SQUAD FANTASY',
      'SUBMIT LINEUP',
      'ADD/DROP',
      'TRANSACTIONS',
      'LEAGUE STANDINGS',
      'LIVE SCORING',
      'BULLDOGS DIVISION',
      'LOCKER ROOM',
      'HISTORY PAGE',
      'PLAYER RESEARCH'
    ];

    return !rejectedPhrases.some(function (phrase) {
      return upper.includes(phrase);
    });
  }

  function findMflScrollingTextElements() {
    const found = [];

    document.querySelectorAll(
      'marquee, [id*="scroll" i], [class*="scroll" i]'
    ).forEach(function (element) {
      if (
        element.id === TICKER_ID ||
        element.closest('#' + TICKER_ID) ||
        element.closest(
          '[data-lsffl-hidden-old-ticker="true"]'
        )
      ) {
        return;
      }

      const rect = element.getBoundingClientRect();
      const text = cleanText(element.textContent);

      if (
        rect.top < 210 &&
        rect.width > 400 &&
        rect.height > 5 &&
        rect.height < 90 &&
        isValidCommissionerMessage(text)
      ) {
        found.push(element);
      }
    });

    document.querySelectorAll(
      'body div, body td, body span'
    ).forEach(function (element) {
      if (
        element.id === TICKER_ID ||
        element.closest('#' + TICKER_ID) ||
        element.closest(
          '[data-lsffl-hidden-old-ticker="true"]'
        )
      ) {
        return;
      }

      if (!isVisible(element)) {
        return;
      }

      const rect = element.getBoundingClientRect();
      const text = cleanText(element.textContent);

      if (
        rect.top >= 90 &&
        rect.top < 190 &&
        rect.width > 650 &&
        rect.height >= 15 &&
        rect.height <= 55 &&
        element.children.length <= 2 &&
        isValidCommissionerMessage(text)
      ) {
        found.push(element);
      }
    });

    return Array.from(new Set(found));
  }

  function captureMflScrollingMessages() {
    let changed = false;

    findMflScrollingTextElements().forEach(function (element) {
      const text = cleanText(element.textContent);

      if (
        isValidCommissionerMessage(text) &&
        !capturedCommissionerMessages.has(text)
      ) {
        capturedCommissionerMessages.add(text);
        changed = true;
      }
    });

    while (capturedCommissionerMessages.size > 5) {
      const oldest =
        capturedCommissionerMessages.values().next().value;

      capturedCommissionerMessages.delete(oldest);
    }

    if (changed) {
      rebuildTickerTrack();
    }
  }

  function hideOriginalMflScrollingText() {
    findMflScrollingTextElements().forEach(function (element) {
      element.style.setProperty(
        'display',
        'none',
        'important'
      );

      const parent = element.parentElement;

      if (parent) {
        const rect = parent.getBoundingClientRect();

        if (
          rect.height < 90 &&
          rect.width > 650
        ) {
          parent.style.setProperty(
            'display',
            'none',
            'important'
          );
        }
      }
    });
  }

  /* =========================================================
     FIND THE SCOREBOARD/STANDINGS WIDTH
  ========================================================= */

  function findLeagueStandingsElement() {
    const candidates = document.querySelectorAll(
      'table, section, article, div'
    );

    let best = null;
    let bestWidth = 0;

    candidates.forEach(function (element) {
      if (
        element.id === TICKER_ID ||
        element.closest('#' + TICKER_ID) ||
        !isVisible(element)
      ) {
        return;
      }

      const text = normalizedText(element);
      const rect = element.getBoundingClientRect();

      if (
        text.includes('LEAGUE STANDINGS') &&
        text.includes('LIVE SCORING') &&
        rect.width > 800 &&
        rect.width < 1500 &&
        rect.height > 80 &&
        rect.width > bestWidth
      ) {
        best = element;
        bestWidth = rect.width;
      }
    });

    return best;
  }

  function findScoreboardRow() {
    const leagueStandings = findLeagueStandingsElement();

    if (leagueStandings) {
      return leagueStandings;
    }

    const candidates = [
      document.querySelector('.homepagecolumns'),
      document.querySelector('#body_home'),
      document.querySelector('.homepagetabcontent'),
      document.querySelector('.reportnavigation')
    ].filter(Boolean);

    let best = null;
    let bestWidth = 0;

    candidates.forEach(function (element) {
      if (!isVisible(element)) {
        return;
      }

      const rect = element.getBoundingClientRect();

      if (
        rect.width > 800 &&
        rect.width < 1500 &&
        rect.width > bestWidth
      ) {
        best = element;
        bestWidth = rect.width;
      }
    });

    return best;
  }

  /*
    This is the important correction.

    The ticker may be inserted inside an MFL container that is
    narrower than the standings area. This measures the exact
    scoreboard width and shifts the ticker relative to its own
    parent so both left and right edges line up.
  */
  function alignTickerToScoreboard() {
    if (!tickerRoot) {
      return;
    }

    if (window.innerWidth <= 760) {
      tickerRoot.style.width = '100%';
      tickerRoot.style.maxWidth = 'none';
      tickerRoot.style.marginLeft = '0';
      tickerRoot.style.marginRight = '0';
      tickerRoot.style.left = '0';
      return;
    }

    const scoreboard = findScoreboardRow();

    if (!scoreboard) {
      tickerRoot.style.width =
        'min(1135px, calc(100vw - 40px))';

      tickerRoot.style.maxWidth = 'none';
      tickerRoot.style.marginLeft = 'auto';
      tickerRoot.style.marginRight = 'auto';
      tickerRoot.style.left = '0';

      return;
    }

    const scoreboardRect =
      scoreboard.getBoundingClientRect();

    const tickerParent = tickerRoot.parentElement;

    if (!tickerParent) {
      return;
    }

    const parentRect =
      tickerParent.getBoundingClientRect();

    const requiredLeft =
      scoreboardRect.left - parentRect.left;

    tickerRoot.style.width =
      Math.round(scoreboardRect.width) + 'px';

    tickerRoot.style.maxWidth = 'none';
    tickerRoot.style.marginLeft = '0';
    tickerRoot.style.marginRight = '0';
    tickerRoot.style.left =
      Math.round(requiredLeft) + 'px';
  }

  /* =========================================================
     TICKER CONTENT
  ========================================================= */

  function addTickerItem(items, category, text) {
    const cleaned = cleanText(text);

    if (!cleaned) {
      return;
    }

    items.push({
      category: category,
      text: cleaned
    });
  }

  function buildTickerItems() {
    const settings = currentSettings || {};
    const items = [];

    if (settings.commissionerMessages) {
      Array.from(capturedCommissionerMessages)
        .slice(0, 5)
        .forEach(function (message) {
          addTickerItem(
            items,
            'Commissioner',
            message
          );
        });
    }

    if (settings.leagueNews) {
      addTickerItem(
        items,
        'League News',
        'Get Off My Ditka enters the 2026 season as the defending LSFFL champion.'
      );
    }

    if (settings.waiverOrder) {
      addTickerItem(
        items,
        'Waiver Order',
        '1. Mustangs  2. Cougars  3. Mad Hatters  4. Purple Hooters  5. Avalanche'
      );
    }

    if (settings.nextWeekMatchups) {
      addTickerItem(
        items,
        'Next Week',
        'Upcoming LSFFL matchups will appear here when the live schedule connection is completed.'
      );
    }

    if (settings.transactions) {
      addTickerItem(
        items,
        'Transactions',
        'Recent LSFFL trades, waiver claims and roster moves will appear here.'
      );
    }

    if (settings.nflNews) {
      addTickerItem(
        items,
        'NFL News',
        'Current NFL headlines will appear here when the NFL news connection is completed.'
      );
    }

    if (!items.length) {
      addTickerItem(
        items,
        'Navy Times',
        'Open the settings cog to select the information displayed.'
      );
    }

    const limit = Math.max(
      1,
      Number(settings.articleHeadlines) || 5
    );

    return items.slice(0, limit);
  }

  function createTickerItem(item) {
    const wrapper = createElement(
      'span',
      'lsffl-ticker-item'
    );

    const category = createElement(
      'strong',
      'lsffl-ticker-category',
      item.category + ':'
    );

    const text = createElement(
      'span',
      'lsffl-ticker-text',
      item.text
    );

    const separator = createElement(
      'span',
      'lsffl-ticker-separator',
      '★'
    );

    separator.setAttribute('aria-hidden', 'true');

    wrapper.appendChild(category);
    wrapper.appendChild(text);
    wrapper.appendChild(separator);

    return wrapper;
  }

  function rebuildTickerTrack() {
    if (
      !tickerRoot ||
      !tickerTrack ||
      !currentSettings
    ) {
      return;
    }

    tickerTrack.innerHTML = '';

    const firstGroup = createElement(
      'div',
      'lsffl-ticker-group'
    );

    const secondGroup = createElement(
      'div',
      'lsffl-ticker-group'
    );

    secondGroup.setAttribute('aria-hidden', 'true');

    buildTickerItems().forEach(function (item) {
      firstGroup.appendChild(createTickerItem(item));
      secondGroup.appendChild(createTickerItem(item));
    });

    tickerTrack.appendChild(firstGroup);
    tickerTrack.appendChild(secondGroup);

    tickerRoot.classList.remove(
      'ticker-size-small',
      'ticker-size-medium',
      'ticker-size-large'
    );

    tickerRoot.classList.add(
      'ticker-size-' + currentSettings.tickerSize
    );

    tickerTrack.style.animationDuration =
      Number(currentSettings.speed || 55) + 's';

    tickerTrack.style.animationDelay =
      Number(currentSettings.delay || 0) + 's';

    tickerTrack.classList.toggle(
      'is-paused',
      Boolean(currentSettings.paused)
    );

    setTimeout(alignTickerToScoreboard, 50);
  }

  /* =========================================================
     TICKER STYLES
  ========================================================= */

  function addStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const style = document.createElement('style');
    style.id = STYLE_ID;

    style.textContent = `
      #${TICKER_ID},
      #${TICKER_ID} * {
        box-sizing: border-box;
      }

      #${TICKER_ID} {
        --ticker-gold: #c9a227;
        --ticker-navy: #071a2f;
        --ticker-dark: #031426;

        position: relative;
        left: 0;
        z-index: 1500;
        display: grid;
        grid-template-columns: 145px minmax(0, 1fr) 34px;

        width: 1135px;
        max-width: none;
        height: 45px;
        min-height: 45px;

        margin-top: 5px;
        margin-bottom: 7px;
        margin-left: 0;
        margin-right: 0;

        overflow: visible;
        border: 2px solid var(--ticker-gold);
        border-radius: 3px;
        background: var(--ticker-dark);
        box-shadow: 0 5px 12px rgba(0, 0, 0, 0.24);
        font-family: Arial, Helvetica, sans-serif;
      }

      #${TICKER_ID}.ticker-size-small {
        height: 39px;
        min-height: 39px;
      }

      #${TICKER_ID}.ticker-size-large {
        height: 53px;
        min-height: 53px;
      }

      #${TICKER_ID} .lsffl-ticker-title,
      #${TICKER_ID} .lsffl-ticker-window,
      #${TICKER_ID} .lsffl-ticker-track,
      #${TICKER_ID} .lsffl-ticker-group,
      #${TICKER_ID} .lsffl-ticker-item,
      #${TICKER_ID} .lsffl-ticker-settings-cell {
        height: 41px;
      }

      #${TICKER_ID}.ticker-size-small .lsffl-ticker-title,
      #${TICKER_ID}.ticker-size-small .lsffl-ticker-window,
      #${TICKER_ID}.ticker-size-small .lsffl-ticker-track,
      #${TICKER_ID}.ticker-size-small .lsffl-ticker-group,
      #${TICKER_ID}.ticker-size-small .lsffl-ticker-item,
      #${TICKER_ID}.ticker-size-small .lsffl-ticker-settings-cell {
        height: 35px;
      }

      #${TICKER_ID}.ticker-size-large .lsffl-ticker-title,
      #${TICKER_ID}.ticker-size-large .lsffl-ticker-window,
      #${TICKER_ID}.ticker-size-large .lsffl-ticker-track,
      #${TICKER_ID}.ticker-size-large .lsffl-ticker-group,
      #${TICKER_ID}.ticker-size-large .lsffl-ticker-item,
      #${TICKER_ID}.ticker-size-large .lsffl-ticker-settings-cell {
        height: 49px;
      }

      #${TICKER_ID} .lsffl-ticker-title {
        display: flex;
        align-items: center;
        padding: 0 12px;
        border-right: 1px solid rgba(201, 162, 39, 0.55);
        background:
          linear-gradient(
            180deg,
            #0d3559,
            #061d34
          );
        color: var(--ticker-gold);
        font-size: 13px;
        font-weight: 900;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        white-space: nowrap;
      }

      #${TICKER_ID} .lsffl-ticker-window {
        position: relative;
        display: flex;
        align-items: center;
        min-width: 0;
        overflow: hidden;
        background:
          linear-gradient(
            90deg,
            #0b3152,
            var(--ticker-dark)
          );
      }

      #${TICKER_ID} .lsffl-ticker-window::before,
      #${TICKER_ID} .lsffl-ticker-window::after {
        content: "";
        position: absolute;
        top: 0;
        bottom: 0;
        z-index: 4;
        width: 25px;
        pointer-events: none;
      }

      #${TICKER_ID} .lsffl-ticker-window::before {
        left: 0;
        background:
          linear-gradient(
            90deg,
            #0b3152,
            transparent
          );
      }

      #${TICKER_ID} .lsffl-ticker-window::after {
        right: 0;
        background:
          linear-gradient(
            270deg,
            var(--ticker-dark),
            transparent
          );
      }

      #${TICKER_ID} .lsffl-ticker-track {
        display: flex;
        align-items: center;
        width: max-content;
        min-width: max-content;
        animation:
          lsfflNavyTimesScroll 55s linear 3s infinite;
        will-change: transform;
      }

      #${TICKER_ID} .lsffl-ticker-track.is-paused {
        animation-play-state: paused;
      }

      #${TICKER_ID} .lsffl-ticker-group {
        display: flex;
        align-items: center;
        flex-shrink: 0;
      }

      #${TICKER_ID} .lsffl-ticker-item {
        display: inline-flex;
        align-items: center;
        flex-shrink: 0;
        color: #ffffff;
        font-size: 11px;
        font-weight: 600;
        white-space: nowrap;
      }

      #${TICKER_ID} .lsffl-ticker-category {
        margin-right: 7px;
        color: var(--ticker-gold);
        font-size: 10px;
        font-weight: 900;
        text-transform: uppercase;
      }

      #${TICKER_ID} .lsffl-ticker-separator {
        margin: 0 20px;
        color: var(--ticker-gold);
        font-size: 9px;
      }

      #${TICKER_ID} .lsffl-ticker-settings-cell {
        display: flex;
        align-items: center;
        justify-content: center;
        border-left: 1px solid rgba(201, 162, 39, 0.55);
        background:
          linear-gradient(
            180deg,
            #0d3559,
            #061d34
          );
      }

      #${TICKER_ID} .lsffl-ticker-settings-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 21px;
        height: 21px;
        padding: 0;
        border: 0;
        background: transparent;
        color: var(--ticker-gold);
        font-size: 16px;
        cursor: pointer;
      }

      #${TICKER_ID}
      .lsffl-ticker-settings-button:hover,
      #${TICKER_ID}
      .lsffl-ticker-settings-button:focus {
        color: #ffffff;
        outline: none;
        transform: rotate(30deg);
      }

      #lsffl-ticker-settings-panel {
        position: absolute;
        top: calc(100% + 5px);
        right: 0;
        z-index: 5000;
        display: none;
        width: 365px;
        max-height: 72vh;
        overflow-y: auto;
        padding: 9px;
        border: 2px solid var(--ticker-gold);
        border-radius: 3px;
        background: #061b30;
        color: #ffffff;
        box-shadow: 0 10px 28px rgba(0, 0, 0, 0.45);
      }

      #lsffl-ticker-settings-panel.is-open {
        display: block;
      }

      #lsffl-ticker-settings-panel
      .lsffl-settings-panel-title {
        padding-bottom: 8px;
        border-bottom: 2px solid var(--ticker-gold);
        color: var(--ticker-gold);
        font-size: 15px;
        font-weight: 900;
        text-transform: uppercase;
      }

      #lsffl-ticker-settings-panel
      .lsffl-settings-group {
        margin-top: 9px;
        border: 1px solid rgba(201, 162, 39, 0.7);
      }

      #lsffl-ticker-settings-panel
      .lsffl-settings-group-heading {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        min-height: 28px;
        padding: 5px 7px;
        border: 0;
        background: #0a2947;
        color: #ffffff;
        font-size: 11px;
        font-weight: 900;
        text-transform: uppercase;
        cursor: pointer;
      }

      #lsffl-ticker-settings-panel
      .lsffl-settings-group-content {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px 10px;
        padding: 9px;
      }

      #lsffl-ticker-settings-panel
      .lsffl-settings-checkbox,
      #lsffl-ticker-settings-panel
      .lsffl-settings-select-row {
        display: flex;
        align-items: center;
        gap: 5px;
        color: #ffffff;
        font-size: 10px;
        font-weight: 700;
      }

      #lsffl-ticker-settings-panel
      .lsffl-settings-checkbox input {
        width: 14px;
        height: 14px;
        margin: 0;
        accent-color: var(--ticker-gold);
      }

      #lsffl-ticker-settings-panel select {
        height: 25px;
        min-width: 48px;
        border: 1px solid var(--ticker-gold);
        background: #ffffff;
        color: var(--ticker-dark);
        font-size: 10px;
        font-weight: 700;
      }

      #lsffl-ticker-settings-panel
      .lsffl-settings-action-row {
        display: flex;
        grid-column: 1 / -1;
        gap: 6px;
      }

      #lsffl-ticker-settings-panel
      .lsffl-settings-action,
      #lsffl-ticker-settings-panel
      .lsffl-settings-footer button {
        min-height: 27px;
        padding: 0 9px;
        border: 1px solid var(--ticker-gold);
        background: #0b3152;
        color: #ffffff;
        font-size: 10px;
        font-weight: 900;
        cursor: pointer;
      }

      #lsffl-ticker-settings-panel
      .lsffl-settings-footer {
        display: flex;
        justify-content: flex-end;
        margin-top: 9px;
      }

      @keyframes lsfflNavyTimesScroll {
        from {
          transform: translateX(0);
        }

        to {
          transform: translateX(-50%);
        }
      }

      @media screen and (max-width: 760px) {
        #${TICKER_ID} {
          grid-template-columns: 105px minmax(0, 1fr) 31px;
          left: 0 !important;
          width: 100% !important;
          max-width: none !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
          border-radius: 0;
        }

        #lsffl-ticker-settings-panel {
          right: 1px;
          width: min(360px, calc(100vw - 8px));
        }
      }
    `;

    document.head.appendChild(style);
  }

  /* =========================================================
     FIND INSERTION POINT
  ========================================================= */

  function findInsertionReference() {
    const oldTicker = findOldMflTickerContainer();

    if (oldTicker && oldTicker.parentNode) {
      return oldTicker;
    }

    const matchupCandidates = document.querySelectorAll(
      '[id*="matchup" i], [class*="matchup" i]'
    );

    for (const element of matchupCandidates) {
      const rect = element.getBoundingClientRect();

      if (
        rect.width > 700 &&
        rect.height > 50
      ) {
        return element;
      }
    }

    return document.querySelector(
      '.myfantasyleague_menu'
    );
  }

  /* =========================================================
     BUILD THE TICKER
  ========================================================= */

  function buildTicker() {
    const existing =
      document.getElementById(TICKER_ID);

    if (existing) {
      tickerRoot = existing;

      tickerTrack = existing.querySelector(
        '.lsffl-ticker-track'
      );

      alignTickerToScoreboard();

      return true;
    }

    const insertionReference =
      findInsertionReference();

    if (
      !insertionReference ||
      !insertionReference.parentNode
    ) {
      return false;
    }

    addStyles();

    tickerRoot = createElement('section');
    tickerRoot.id = TICKER_ID;

    tickerRoot.setAttribute(
      'aria-label',
      'Navy Times league ticker'
    );

    const title = createElement(
      'div',
      'lsffl-ticker-title',
      'Navy Times'
    );

    const tickerWindow = createElement(
      'div',
      'lsffl-ticker-window'
    );

    tickerTrack = createElement(
      'div',
      'lsffl-ticker-track'
    );

    tickerWindow.appendChild(tickerTrack);

    const settingsCell = createElement(
      'div',
      'lsffl-ticker-settings-cell'
    );

    const settingsButton = createElement(
      'button',
      'lsffl-ticker-settings-button'
    );

    settingsButton.type = 'button';
    settingsButton.innerHTML = '&#9881;';

    settingsButton.setAttribute(
      'aria-label',
      'Open Navy Times settings'
    );

    settingsCell.appendChild(settingsButton);

    settingsPanel =
      window.LSFFL_TICKER_SETTINGS
        .buildSettingsPanel();

    settingsButton.addEventListener(
      'click',
      function (event) {
        event.preventDefault();
        event.stopPropagation();

        settingsPanel.classList.toggle(
          'is-open'
        );
      }
    );

    document.addEventListener(
      'click',
      function (event) {
        if (
          tickerRoot &&
          !tickerRoot.contains(event.target)
        ) {
          settingsPanel.classList.remove(
            'is-open'
          );
        }
      }
    );

    tickerRoot.appendChild(title);
    tickerRoot.appendChild(tickerWindow);
    tickerRoot.appendChild(settingsCell);
    tickerRoot.appendChild(settingsPanel);

    insertionReference.parentNode.insertBefore(
      tickerRoot,
      insertionReference
    );

    rebuildTickerTrack();

    setTimeout(alignTickerToScoreboard, 50);
    setTimeout(alignTickerToScoreboard, 300);
    setTimeout(alignTickerToScoreboard, 1000);

    return true;
  }

  /* =========================================================
     SETTINGS CONNECTION
  ========================================================= */

  function connectSettings() {
    currentSettings =
      window.LSFFL_TICKER_SETTINGS
        .getSettings();

    window.LSFFL_TICKER_SETTINGS.subscribe(
      function (updatedSettings) {
        currentSettings = updatedSettings;
        rebuildTickerTrack();
      }
    );
  }

  /* =========================================================
     PAGE WATCHER
  ========================================================= */

  function startPageWatcher() {
    setInterval(function () {
      captureMflScrollingMessages();

      setTimeout(function () {
        hideOriginalMflScrollingText();
        hideOldMflTicker();
        alignTickerToScoreboard();
      }, 50);
    }, 1000);

    const observer = new MutationObserver(function () {
      captureMflScrollingMessages();

      if (!document.getElementById(TICKER_ID)) {
        buildTicker();
      }

      setTimeout(function () {
        hideOriginalMflScrollingText();
        hideOldMflTicker();
        alignTickerToScoreboard();
      }, 50);
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true
    });

    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);

      resizeTimer = setTimeout(
        alignTickerToScoreboard,
        100
      );
    });
  }

  /* =========================================================
     INITIALIZE
  ========================================================= */

  function initialize() {
    loadScript(
      SETTINGS_URL,
      'LSFFL_TICKER_SETTINGS'
    )
      .then(function () {
        connectSettings();
        captureMflScrollingMessages();

        let attempts = 0;

        function attemptBuild() {
          attempts += 1;

          if (buildTicker()) {
            rebuildTickerTrack();
            startPageWatcher();

            setTimeout(
              alignTickerToScoreboard,
              1500
            );

            return;
          }

          if (attempts < 40) {
            setTimeout(attemptBuild, 500);
          } else {
            console.warn(
              'LSFFL Navy Times could not find its insertion point.'
            );
          }
        }

        attemptBuild();
      })
      .catch(function (error) {
        console.error(
          'LSFFL Navy Times failed:',
          error
        );
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      initialize
    );
  } else {
    initialize();
  }
})();
