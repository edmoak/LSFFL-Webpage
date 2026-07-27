(function () {
  'use strict';

  const TICKER_ID = 'lsffl-custom-ticker';
  const STYLE_ID = 'lsffl-custom-ticker-styles';

  const DATA_URL =
    'https://edmoak.github.io/LSFFL-Webpage/js/mfl-data.js';

  const SETTINGS_URL =
    'https://edmoak.github.io/LSFFL-Webpage/js/lsffl-settings.js';

  let ticker = null;
  let tickerTrack = null;
  let settingsPanel = null;
  let currentSettings = null;
  let commissionerMessages = [];
  let resizeTimer = null;
  let started = false;

  /* =========================================================
     BASIC HELPERS
  ========================================================= */

  function cleanText(value) {
    return String(value || '')
      .replace(/\u00a0/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function upperText(element) {
    return cleanText(element.textContent).toUpperCase();
  }

  function visible(element) {
    if (!element || !(element instanceof Element)) {
      return false;
    }

    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();

    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      rect.width > 0 &&
      rect.height > 0
    );
  }

  function makeElement(tag, className, text) {
    const element = document.createElement(tag);

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

      const existing = Array.from(
        document.querySelectorAll('script[src]')
      ).find(function (script) {
        return script.src === url;
      });

      if (existing) {
        let checks = 0;

        const timer = window.setInterval(function () {
          checks += 1;

          if (window[globalName]) {
            window.clearInterval(timer);
            resolve(window[globalName]);
            return;
          }

          if (checks >= 100) {
            window.clearInterval(timer);
            reject(
              new Error(globalName + ' did not load.')
            );
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
        reject(new Error('Unable to load ' + url));
      };

      document.head.appendChild(script);
    });
  }

  /* =========================================================
     FIND THE CORRECT HOME TAB NAVIGATION
  ========================================================= */

  function hasRequiredTabLabels(element) {
    const text = upperText(element);

    return (
      text.includes('HOME') &&
      text.includes('LOCKER ROOM') &&
      text.includes('LATEST NEWS') &&
      text.includes('TRANSACTIONS') &&
      text.includes('HISTORY PAGE') &&
      text.includes('CALENDAR')
    );
  }

  function findHomeTabNavigation() {
    const candidates = [];

    document.querySelectorAll(
      'nav, table, div, ul'
    ).forEach(function (element) {
      if (
        !visible(element) ||
        !hasRequiredTabLabels(element)
      ) {
        return;
      }

      const rect = element.getBoundingClientRect();

      /*
        Reject page-sized ancestors and the top global menu.
        The correct tab bar is a short horizontal row below
        the matchup tiles.
      */
      if (
        rect.width >= 700 &&
        rect.width <= 1400 &&
        rect.height >= 30 &&
        rect.height <= 85 &&
        rect.top >= 300
      ) {
        candidates.push(element);
      }
    });

    if (!candidates.length) {
      return null;
    }

    candidates.sort(function (a, b) {
      const aRect = a.getBoundingClientRect();
      const bRect = b.getBoundingClientRect();

      return (
        aRect.height - bRect.height ||
        aRect.width - bRect.width
      );
    });

    return candidates[0];
  }

  /* =========================================================
     FIND STANDINGS + LIVE SCORING ROW
  ========================================================= */

  function findSmallestTextElement(phrase) {
    const matches = [];

    document.querySelectorAll(
      'div, table, section, article, h1, h2, h3, td'
    ).forEach(function (element) {
      if (
        visible(element) &&
        upperText(element).includes(phrase)
      ) {
        const rect = element.getBoundingClientRect();

        matches.push({
          element: element,
          area: rect.width * rect.height
        });
      }
    });

    matches.sort(function (a, b) {
      return a.area - b.area;
    });

    return matches.length
      ? matches[0].element
      : null;
  }

  function getAncestors(element) {
    const ancestors = [];
    let current = element;

    while (current && current !== document.body) {
      ancestors.push(current);
      current = current.parentElement;
    }

    return ancestors;
  }

  function findStandingsScoringRow() {
    const standingsTitle =
      findSmallestTextElement('LEAGUE STANDINGS');

    const scoringTitle =
      findSmallestTextElement('LIVE SCORING');

    if (!standingsTitle || !scoringTitle) {
      return null;
    }

    const scoringAncestors =
      new Set(getAncestors(scoringTitle));

    const commonAncestors =
      getAncestors(standingsTitle).filter(function (ancestor) {
        return scoringAncestors.has(ancestor);
      });

    const usable = commonAncestors.filter(function (element) {
      const rect = element.getBoundingClientRect();

      return (
        visible(element) &&
        rect.width >= 900 &&
        rect.width <= 1450 &&
        rect.height >= 80 &&
        rect.height <= 1200
      );
    });

    if (!usable.length) {
      return null;
    }

    usable.sort(function (a, b) {
      const aRect = a.getBoundingClientRect();
      const bRect = b.getBoundingClientRect();

      return (
        aRect.width * aRect.height -
        bRect.width * bRect.height
      );
    });

    return usable[0];
  }

  /* =========================================================
     POSITION AND SIZE
  ========================================================= */

  function positionTicker() {
    if (!ticker) {
      return;
    }

    if (window.innerWidth <= 760) {
      ticker.style.left = '0';
      ticker.style.width = '100%';
      ticker.style.maxWidth = 'none';
      ticker.style.marginLeft = '0';
      ticker.style.marginRight = '0';
      return;
    }

    const widthReference =
      findStandingsScoringRow();

    const navigation =
      findHomeTabNavigation();

    if (!navigation || !ticker.parentElement) {
      return;
    }

    const reference =
      widthReference || navigation;

    const referenceRect =
      reference.getBoundingClientRect();

    const parentRect =
      ticker.parentElement.getBoundingClientRect();

    ticker.style.width =
      Math.round(referenceRect.width) + 'px';

    ticker.style.maxWidth = 'none';
    ticker.style.marginLeft = '0';
    ticker.style.marginRight = '0';

    ticker.style.left =
      Math.round(
        referenceRect.left - parentRect.left
      ) + 'px';
  }

  /* =========================================================
     TICKER CONTENT
  ========================================================= */

  function addItem(items, category, text) {
    const cleaned = cleanText(text);

    if (!cleaned) {
      return;
    }

    items.push({
      category: category,
      text: cleaned
    });
  }

  function buildItems() {
    const settings = currentSettings || {};
    const items = [];

    if (settings.commissionerMessages) {
      commissionerMessages.forEach(function (message) {
        addItem(
          items,
          'Commissioner',
          message
        );
      });
    }

    /*
      These remain temporary until each live source
      is connected. Positioning is the only concern
      in this replacement.
    */

    if (settings.leagueNews) {
      addItem(
        items,
        'League News',
        'Get Off My Ditka enters the 2026 season as the defending LSFFL champion.'
      );
    }

    if (settings.waiverOrder) {
      addItem(
        items,
        'Waiver Order',
        '1. Mustangs  2. Cougars  3. Mad Hatters  4. Purple Hooters  5. Avalanche'
      );
    }

    if (settings.nextWeekMatchups) {
      addItem(
        items,
        'Next Week',
        'Upcoming LSFFL matchups will appear here when the live schedule feed is connected.'
      );
    }

    if (settings.transactions) {
      addItem(
        items,
        'Transactions',
        'Recent LSFFL transactions will appear here when the live transaction feed is connected.'
      );
    }

    if (settings.nflNews) {
      addItem(
        items,
        'NFL News',
        'Current NFL headlines will appear here when the NFL news feed is connected.'
      );
    }

    if (!items.length) {
      addItem(
        items,
        'Navy Times',
        'Open the settings cog to select displayed information.'
      );
    }

    const limit = Math.max(
      1,
      Number(settings.articleHeadlines) || 5
    );

    return items.slice(0, limit);
  }

  function createTickerItem(item) {
    const wrapper = makeElement(
      'span',
      'lsffl-ticker-item'
    );

    const category = makeElement(
      'strong',
      'lsffl-ticker-category',
      item.category + ':'
    );

    const text = makeElement(
      'span',
      'lsffl-ticker-text',
      item.text
    );

    const separator = makeElement(
      'span',
      'lsffl-ticker-separator',
      '★'
    );

    separator.setAttribute(
      'aria-hidden',
      'true'
    );

    wrapper.appendChild(category);
    wrapper.appendChild(text);
    wrapper.appendChild(separator);

    return wrapper;
  }

  function rebuildTicker() {
    if (
      !ticker ||
      !tickerTrack ||
      !currentSettings
    ) {
      return;
    }

    tickerTrack.innerHTML = '';

    const firstGroup = makeElement(
      'div',
      'lsffl-ticker-group'
    );

    const secondGroup = makeElement(
      'div',
      'lsffl-ticker-group'
    );

    secondGroup.setAttribute(
      'aria-hidden',
      'true'
    );

    buildItems().forEach(function (item) {
      firstGroup.appendChild(
        createTickerItem(item)
      );

      secondGroup.appendChild(
        createTickerItem(item)
      );
    });

    tickerTrack.appendChild(firstGroup);
    tickerTrack.appendChild(secondGroup);

    ticker.classList.remove(
      'ticker-size-small',
      'ticker-size-medium',
      'ticker-size-large'
    );

    ticker.classList.add(
      'ticker-size-' +
      currentSettings.tickerSize
    );

    tickerTrack.style.animationDuration =
      Number(currentSettings.speed || 55) +
      's';

    tickerTrack.style.animationDelay =
      Number(currentSettings.delay || 0) +
      's';

    tickerTrack.classList.toggle(
      'is-paused',
      Boolean(currentSettings.paused)
    );

    window.setTimeout(
      positionTicker,
      50
    );
  }

  /* =========================================================
     CSS
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
        --ticker-dark: #031426;

        position: relative;
        left: 0;
        z-index: 1500;

        display: grid;
        grid-template-columns:
          145px minmax(0, 1fr) 34px;

        width: 1135px;
        max-width: none;

        height: 45px;
        min-height: 45px;

        margin-top: 5px;
        margin-bottom: 7px;
        margin-left: 0;
        margin-right: 0;

        overflow: visible;

        border:
          2px solid var(--ticker-gold);

        border-radius: 3px;

        background: var(--ticker-dark);

        box-shadow:
          0 5px 12px rgba(0, 0, 0, 0.24);

        font-family:
          Arial, Helvetica, sans-serif;
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
      #${TICKER_ID} .lsffl-settings-cell {
        height: 41px;
      }

      #${TICKER_ID}.ticker-size-small
      .lsffl-ticker-title,
      #${TICKER_ID}.ticker-size-small
      .lsffl-ticker-window,
      #${TICKER_ID}.ticker-size-small
      .lsffl-ticker-track,
      #${TICKER_ID}.ticker-size-small
      .lsffl-ticker-group,
      #${TICKER_ID}.ticker-size-small
      .lsffl-ticker-item,
      #${TICKER_ID}.ticker-size-small
      .lsffl-settings-cell {
        height: 35px;
      }

      #${TICKER_ID}.ticker-size-large
      .lsffl-ticker-title,
      #${TICKER_ID}.ticker-size-large
      .lsffl-ticker-window,
      #${TICKER_ID}.ticker-size-large
      .lsffl-ticker-track,
      #${TICKER_ID}.ticker-size-large
      .lsffl-ticker-group,
      #${TICKER_ID}.ticker-size-large
      .lsffl-ticker-item,
      #${TICKER_ID}.ticker-size-large
      .lsffl-settings-cell {
        height: 49px;
      }

      #${TICKER_ID} .lsffl-ticker-title {
        display: flex;
        align-items: center;

        padding: 0 12px;

        border-right:
          1px solid rgba(201, 162, 39, 0.55);

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

      #${TICKER_ID}
      .lsffl-ticker-window::before,
      #${TICKER_ID}
      .lsffl-ticker-window::after {
        content: "";

        position: absolute;
        top: 0;
        bottom: 0;

        z-index: 4;

        width: 25px;

        pointer-events: none;
      }

      #${TICKER_ID}
      .lsffl-ticker-window::before {
        left: 0;

        background:
          linear-gradient(
            90deg,
            #0b3152,
            transparent
          );
      }

      #${TICKER_ID}
      .lsffl-ticker-window::after {
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

        animation-name:
          lsfflNavyTimesScroll;

        animation-duration: 55s;
        animation-delay: 3s;
        animation-timing-function: linear;
        animation-iteration-count: infinite;

        will-change: transform;
      }

      #${TICKER_ID}
      .lsffl-ticker-track.is-paused {
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

      #${TICKER_ID} .lsffl-settings-cell {
        display: flex;
        align-items: center;
        justify-content: center;

        border-left:
          1px solid rgba(201, 162, 39, 0.55);

        background:
          linear-gradient(
            180deg,
            #0d3559,
            #061d34
          );
      }

      #${TICKER_ID} .lsffl-settings-button {
        display: flex;
        align-items: center;
        justify-content: center;

        width: 21px;
        height: 21px;

        margin: 0;
        padding: 0;

        border: 0;

        background: transparent;
        color: var(--ticker-gold);

        font-size: 16px;
        line-height: 1;

        cursor: pointer;
      }

      #${TICKER_ID}
      .lsffl-settings-button:hover,
      #${TICKER_ID}
      .lsffl-settings-button:focus {
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

        border:
          2px solid var(--ticker-gold);

        border-radius: 3px;

        background: #061b30;
        color: #ffffff;

        box-shadow:
          0 10px 28px rgba(0, 0, 0, 0.45);
      }

      #lsffl-ticker-settings-panel.is-open {
        display: block;
      }

      #lsffl-ticker-settings-panel
      .lsffl-settings-panel-title {
        padding-bottom: 8px;

        border-bottom:
          2px solid var(--ticker-gold);

        color: var(--ticker-gold);

        font-size: 15px;
        font-weight: 900;

        text-transform: uppercase;
      }

      #lsffl-ticker-settings-panel
      .lsffl-settings-group {
        margin-top: 9px;

        border:
          1px solid rgba(201, 162, 39, 0.7);
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

        border:
          1px solid var(--ticker-gold);

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

        border:
          1px solid var(--ticker-gold);

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
          grid-template-columns:
            105px minmax(0, 1fr) 31px;

          left: 0 !important;

          width: 100% !important;
          max-width: none !important;

          margin-left: 0 !important;
          margin-right: 0 !important;

          border-radius: 0;
        }

        #lsffl-ticker-settings-panel {
          right: 1px;

          width:
            min(360px, calc(100vw - 8px));
        }
      }
    `;

    document.head.appendChild(style);
  }

  /* =========================================================
     BUILD UI
  ========================================================= */

  function buildTicker() {
    const existing =
      document.getElementById(TICKER_ID);

    if (existing) {
      ticker = existing;

      tickerTrack = existing.querySelector(
        '.lsffl-ticker-track'
      );

      positionTicker();
      return true;
    }

    const navigation =
      findHomeTabNavigation();

    if (
      !navigation ||
      !navigation.parentNode
    ) {
      return false;
    }

    addStyles();

    ticker = makeElement('section');
    ticker.id = TICKER_ID;

    ticker.setAttribute(
      'aria-label',
      'Navy Times league ticker'
    );

    const title = makeElement(
      'div',
      'lsffl-ticker-title',
      'Navy Times'
    );

    const tickerWindow = makeElement(
      'div',
      'lsffl-ticker-window'
    );

    tickerTrack = makeElement(
      'div',
      'lsffl-ticker-track'
    );

    tickerWindow.appendChild(tickerTrack);

    const settingsCell = makeElement(
      'div',
      'lsffl-settings-cell'
    );

    const settingsButton = makeElement(
      'button',
      'lsffl-settings-button'
    );

    settingsButton.type = 'button';
    settingsButton.innerHTML = '&#9881;';

    settingsButton.setAttribute(
      'aria-label',
      'Open Navy Times settings'
    );

    settingsButton.setAttribute(
      'aria-expanded',
      'false'
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

        const open =
          settingsPanel.classList.toggle(
            'is-open'
          );

        settingsButton.setAttribute(
          'aria-expanded',
          String(open)
        );
      }
    );

    document.addEventListener(
      'click',
      function (event) {
        if (
          ticker &&
          !ticker.contains(event.target)
        ) {
          settingsPanel.classList.remove(
            'is-open'
          );

          settingsButton.setAttribute(
            'aria-expanded',
            'false'
          );
        }
      }
    );

    ticker.appendChild(title);
    ticker.appendChild(tickerWindow);
    ticker.appendChild(settingsCell);
    ticker.appendChild(settingsPanel);

    navigation.parentNode.insertBefore(
      ticker,
      navigation
    );

    rebuildTicker();

    window.setTimeout(
      positionTicker,
      50
    );

    window.setTimeout(
      positionTicker,
      300
    );

    window.setTimeout(
      positionTicker,
      1000
    );

    return true;
  }

  /* =========================================================
     CONNECT MODULES
  ========================================================= */

  function connectModules() {
    currentSettings =
      window.LSFFL_TICKER_SETTINGS
        .getSettings();

    commissionerMessages =
      window.LSFFL_MFL_DATA
        .getCommissionerMessages()
        .map(cleanText)
        .filter(Boolean)
        .slice(0, 5);

    window.LSFFL_TICKER_SETTINGS.subscribe(
      function (updatedSettings) {
        currentSettings = updatedSettings;
        rebuildTicker();
      }
    );

    window.LSFFL_MFL_DATA
      .subscribeToCommissionerMessages(
        function (updatedMessages) {
          commissionerMessages =
            updatedMessages
              .map(cleanText)
              .filter(Boolean)
              .slice(0, 5);

          rebuildTicker();
        }
      );
  }

  /* =========================================================
     WATCH PAGE CHANGES
  ========================================================= */

  function watchPage() {
    const observer = new MutationObserver(function () {
      if (!document.getElementById(TICKER_ID)) {
        buildTicker();
      }

      window.setTimeout(
        positionTicker,
        75
      );
    });

    observer.observe(
      document.documentElement,
      {
        childList: true,
        subtree: true
      }
    );

    window.addEventListener(
      'resize',
      function () {
        window.clearTimeout(resizeTimer);

        resizeTimer =
          window.setTimeout(
            positionTicker,
            100
          );
      }
    );
  }

  /* =========================================================
     START
  ========================================================= */

  function initialize() {
    if (started) {
      return;
    }

    started = true;

    Promise.all([
      loadScript(
        DATA_URL,
        'LSFFL_MFL_DATA'
      ),
      loadScript(
        SETTINGS_URL,
        'LSFFL_TICKER_SETTINGS'
      )
    ])
      .then(function () {
        connectModules();

        let attempts = 0;

        function tryBuild() {
          attempts += 1;

          if (buildTicker()) {
            watchPage();
            return;
          }

          if (attempts < 40) {
            window.setTimeout(
              tryBuild,
              500
            );
          } else {
            console.warn(
              'LSFFL ticker could not locate the Home tab navigation.'
            );
          }
        }

        tryBuild();
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
