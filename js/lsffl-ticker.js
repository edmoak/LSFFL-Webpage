(function () {
  'use strict';

  /* =========================================================
     LSFFL NAVY TIMES
     FINAL UI MODULE
  ========================================================= */

  const TICKER_ID = 'lsffl-custom-ticker';
  const STYLE_ID = 'lsffl-custom-ticker-styles';

  const DATA_SCRIPT_URL =
    'https://edmoak.github.io/LSFFL-Webpage/js/mfl-data.js';

  const SETTINGS_SCRIPT_URL =
    'https://edmoak.github.io/LSFFL-Webpage/js/lsffl-settings.js';

  const SITE_GOLD = '#c9a227';
  const SITE_NAVY = '#071a2f';
  const SITE_NAVY_DARK = '#031426';

  let tickerRoot = null;
  let tickerTrack = null;
  let settingsPanel = null;
  let currentSettings = null;
  let commissionerMessages = [];

  let initializationStarted = false;
  let resizeTimer = null;

  /* =========================================================
     LOAD REQUIRED MODULES
  ========================================================= */

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
        const checkExisting = setInterval(function () {
          if (window[globalName]) {
            clearInterval(checkExisting);
            resolve(window[globalName]);
          }
        }, 100);

        setTimeout(function () {
          clearInterval(checkExisting);

          if (!window[globalName]) {
            reject(
              new Error(globalName + ' did not become available.')
            );
          }
        }, 10000);

        return;
      }

      const script = document.createElement('script');
      script.src = url;
      script.async = false;

      script.addEventListener('load', function () {
        if (window[globalName]) {
          resolve(window[globalName]);
        } else {
          reject(
            new Error(
              url + ' loaded, but ' + globalName +
              ' was not created.'
            )
          );
        }
      });

      script.addEventListener('error', function () {
        reject(new Error('Unable to load ' + url));
      });

      document.head.appendChild(script);
    });
  }

  function loadRequiredModules() {
    return Promise.all([
      loadScript(
        DATA_SCRIPT_URL,
        'LSFFL_MFL_DATA'
      ),
      loadScript(
        SETTINGS_SCRIPT_URL,
        'LSFFL_TICKER_SETTINGS'
      )
    ]);
  }

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

  /* =========================================================
     FIND MFL PAGE ELEMENTS
  ========================================================= */

  function findOldMarqueeTicker() {
    const selectors = [
      '#marquee',
      '#marquee_wrapper',
      '#marquee-container',
      '#marqueeContainer',
      '#mfl-marquee',
      '.mfl-marquee',
      '.marquee-wrapper',
      '.marquee-container',
      '[id*="marquee" i]',
      '[class*="marquee" i]'
    ];

    for (const selector of selectors) {
      let elements = [];

      try {
        elements = document.querySelectorAll(selector);
      } catch (error) {
        continue;
      }

      for (const element of elements) {
        if (
          element.id === TICKER_ID ||
          element.closest('#' + TICKER_ID)
        ) {
          continue;
        }

        const text = cleanText(element.textContent)
          .toUpperCase();

        const rect = element.getBoundingClientRect();

        if (
          rect.width > 500 &&
          rect.height > 15 &&
          rect.height < 300 &&
          (
            text.includes('NAVY TIMES') ||
            text.includes('LATEST ARTICLES') ||
            text.includes('MARQUEE SETTINGS')
          )
        ) {
          return element;
        }
      }
    }

    return null;
  }

  function findOldMarqueeContainer() {
    const marquee = findOldMarqueeTicker();

    if (!marquee) {
      return null;
    }

    const candidates = [
      marquee.closest('.mobile-wrap'),
      marquee.closest('.report'),
      marquee.closest('.homepagetabcontent'),
      marquee.closest('table'),
      marquee
    ].filter(Boolean);

    for (const candidate of candidates) {
      const rect = candidate.getBoundingClientRect();
      const text = cleanText(candidate.textContent)
        .toUpperCase();

      if (
        rect.width > 500 &&
        rect.height < 320 &&
        (
          text.includes('NAVY TIMES') ||
          text.includes('LATEST ARTICLES')
        )
      ) {
        return candidate;
      }
    }

    return marquee;
  }

  function findMflScrollingTextElements() {
    const results = [];

    const selectors = [
      'marquee',
      '[id*="scroll" i]',
      '[class*="scroll" i]',
      '[id*="applet" i]',
      '[class*="applet" i]'
    ];

    selectors.forEach(function (selector) {
      let elements = [];

      try {
        elements = document.querySelectorAll(selector);
      } catch (error) {
        return;
      }

      elements.forEach(function (element) {
        if (
          element.id === TICKER_ID ||
          element.closest('#' + TICKER_ID)
        ) {
          return;
        }

        const rect = element.getBoundingClientRect();
        const text = cleanText(element.textContent);

        if (
          rect.top < 230 &&
          rect.width > 300 &&
          rect.height > 5 &&
          rect.height < 100 &&
          text
        ) {
          results.push(element);
        }
      });
    });

    document.querySelectorAll('body > div, body > table').forEach(
      function (element) {
        if (
          element.id === TICKER_ID ||
          element.closest('#' + TICKER_ID)
        ) {
          return;
        }

        const rect = element.getBoundingClientRect();
        const text = cleanText(element.textContent);

        if (
          rect.top >= 100 &&
          rect.top < 190 &&
          rect.width > 700 &&
          rect.height > 15 &&
          rect.height < 60 &&
          text &&
          !text.toUpperCase().includes('LAMAD SQUAD')
        ) {
          results.push(element);
        }
      }
    );

    return Array.from(new Set(results));
  }

  function hideOriginalMflDisplays() {
    const oldMarquee = findOldMarqueeContainer();

    if (oldMarquee) {
      oldMarquee.style.setProperty(
        'display',
        'none',
        'important'
      );
    }

    findMflScrollingTextElements().forEach(function (element) {
      if (
        tickerRoot &&
        tickerRoot.contains(element)
      ) {
        return;
      }

      element.style.setProperty(
        'display',
        'none',
        'important'
      );
    });
  }

  /* =========================================================
     WIDTH AND PLACEMENT
  ========================================================= */

  function findWidthReference() {
    const selectors = [
      '.myfantasyleague_menu',
      '.reportnavigation',
      '.homepagecolumns',
      '.homepagetabcontent',
      '#body_home',
      '#body_options_01',
      '.report'
    ];

    let best = null;
    let bestWidth = 0;

    selectors.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(
        function (element) {
          if (
            element.closest('#' + TICKER_ID) ||
            !isVisible(element)
          ) {
            return;
          }

          const rect = element.getBoundingClientRect();

          if (
            rect.width >= 800 &&
            rect.width <= 1500 &&
            rect.width > bestWidth
          ) {
            best = element;
            bestWidth = rect.width;
          }
        }
      );
    });

    return best;
  }

  function matchTickerWidth() {
    if (!tickerRoot) {
      return;
    }

    const reference = findWidthReference();

    if (!reference) {
      tickerRoot.style.width = 'calc(100% - 24px)';
      tickerRoot.style.maxWidth = '1135px';
      return;
    }

    const rect = reference.getBoundingClientRect();

    tickerRoot.style.width =
      Math.round(rect.width) + 'px';

    tickerRoot.style.maxWidth = 'none';
  }

  function findInsertionReference() {
    const oldMarquee = findOldMarqueeContainer();

    if (oldMarquee && oldMarquee.parentNode) {
      return oldMarquee;
    }

    const matchupStrip =
      document.querySelector(
        '[class*="matchup"], [id*="matchup"]'
      );

    if (matchupStrip && matchupStrip.parentNode) {
      return matchupStrip;
    }

    const menu =
      document.querySelector('.myfantasyleague_menu');

    if (menu && menu.parentNode) {
      return menu;
    }

    return null;
  }

  /* =========================================================
     TICKER CONTENT
  ========================================================= */

  function addTickerItem(items, category, text) {
    const cleanedText = cleanText(text);

    if (!cleanedText) {
      return;
    }

    items.push({
      category: category,
      text: cleanedText
    });
  }

  function buildTickerItems() {
    const settings = currentSettings || {};
    const items = [];

    if (settings.commissionerMessages) {
      commissionerMessages.forEach(function (message) {
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
        'Upcoming LSFFL matchups will appear here when the active MFL schedule is connected.'
      );
    }

    if (settings.lastWeekResults) {
      addTickerItem(
        items,
        'Last Week',
        'Completed LSFFL matchup results will appear here after games are played.'
      );
    }

    if (settings.transactions) {
      addTickerItem(
        items,
        'Transactions',
        'Recent LSFFL trades, waiver claims and roster moves will appear here.'
      );
    }

    if (settings.powerRank) {
      addTickerItem(
        items,
        'Power Rank',
        'Current LSFFL power rankings will appear here.'
      );
    }

    if (settings.alternatePowerRank) {
      addTickerItem(
        items,
        'Alt Power Rank',
        'Alternate LSFFL power rankings will appear here.'
      );
    }

    if (settings.pointsScored) {
      addTickerItem(
        items,
        'Points Scored',
        'League leaders in total fantasy points will appear here.'
      );
    }

    if (settings.allPlayRecord) {
      addTickerItem(
        items,
        'All-Play',
        'Current LSFFL all-play records will appear here.'
      );
    }

    if (Number(settings.topByStatCategory) > 0) {
      addTickerItem(
        items,
        'Stat Leaders',
        'Top ' +
          settings.topByStatCategory +
          ' players by statistical category will appear here.'
      );
    }

    if (Number(settings.topFantasyPoints) > 0) {
      addTickerItem(
        items,
        'Fantasy Leaders',
        'Top ' +
          settings.topFantasyPoints +
          ' fantasy scorers by position will appear here.'
      );
    }

    if (settings.draft) {
      addTickerItem(
        items,
        'Draft',
        settings.showEntireDraft
          ? 'The full LSFFL draft board will appear here.'
          : 'Recent LSFFL draft selections will appear here.'
      );
    }

    if (settings.nflResults) {
      addTickerItem(
        items,
        'NFL Results',
        'Completed NFL game results will appear here.'
      );
    }

    if (settings.nflMatchups) {
      addTickerItem(
        items,
        'NFL Matchups',
        'Upcoming NFL matchups will appear here.'
      );
    }

    if (settings.fantasyMatchups) {
      addTickerItem(
        items,
        'Live Fantasy',
        'Live LSFFL matchup scores will appear here during games.'
      );
    }

    if (settings.liveNFLMatchups) {
      addTickerItem(
        items,
        'Live NFL',
        'Live NFL scores will appear here during games.'
      );
    }

    if (settings.nflMatchupLeaders) {
      addTickerItem(
        items,
        'NFL Leaders',
        'NFL matchup statistical leaders will appear here.'
      );
    }

    if (settings.nflNews) {
      addTickerItem(
        items,
        'NFL News',
        'Current NFL headlines will appear here when the NFL news source is connected.'
      );
    }

    if (!items.length) {
      addTickerItem(
        items,
        'Navy Times',
        'Open the settings cog to choose which information is displayed.'
      );
    }

    const maximum =
      Math.max(
        1,
        Number(settings.articleHeadlines) || 5
      );

    return items.slice(0, maximum);
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
  }

  /* =========================================================
     STYLES
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
        --ticker-gold: ${SITE_GOLD};
        --ticker-navy: ${SITE_NAVY};
        --ticker-navy-dark: ${SITE_NAVY_DARK};

        position: relative;
        z-index: 1000;
        display: grid;
        grid-template-columns: 145px minmax(0, 1fr) 34px;
        width: calc(100% - 24px);
        max-width: 1135px;
        height: 45px;
        min-height: 45px;
        margin: 5px auto 7px;
        overflow: visible;
        border: 2px solid var(--ticker-gold);
        border-radius: 3px;
        background: var(--ticker-navy-dark);
        box-shadow: 0 5px 12px rgba(0, 0, 0, 0.22);
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
            var(--ticker-navy-dark)
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
            var(--ticker-navy-dark),
            transparent
          );
      }

      #${TICKER_ID} .lsffl-ticker-track {
        display: flex;
        align-items: center;
        width: max-content;
        min-width: max-content;
        animation-name: lsfflNavyTimesScroll;
        animation-duration: 55s;
        animation-delay: 3s;
        animation-timing-function: linear;
        animation-iteration-count: infinite;
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

      #${TICKER_ID}.ticker-size-small .lsffl-ticker-item {
        font-size: 10px;
      }

      #${TICKER_ID}.ticker-size-large .lsffl-ticker-item {
        font-size: 12px;
      }

      #${TICKER_ID} .lsffl-ticker-category {
        margin-right: 7px;
        color: var(--ticker-gold);
        font-size: 10px;
        font-weight: 900;
        letter-spacing: 0.035em;
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
        margin: 0;
        padding: 0;
        border: 0;
        background: transparent;
        color: var(--ticker-gold);
        font-size: 16px;
        line-height: 1;
        cursor: pointer;
      }

      #${TICKER_ID} .lsffl-ticker-settings-button:hover,
      #${TICKER_ID} .lsffl-ticker-settings-button:focus {
        color: #ffffff;
        outline: none;
        transform: rotate(30deg);
      }

      #lsffl-ticker-settings-panel {
        position: absolute;
        top: calc(100% + 5px);
        right: 0;
        z-index: 4000;
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
        padding: 0 0 8px;
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
        border-bottom: 1px solid rgba(201, 162, 39, 0.55);
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
        min-width: 0;
        color: #ffffff;
        font-size: 10px;
        font-weight: 700;
        line-height: 1.2;
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
        color: var(--ticker-navy-dark);
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
        border-radius: 2px;
        background: #0b3152;
        color: #ffffff;
        font-size: 10px;
        font-weight: 900;
        cursor: pointer;
      }

      #lsffl-ticker-settings-panel
      .lsffl-settings-action:hover,
      #lsffl-ticker-settings-panel
      .lsffl-settings-footer button:hover {
        background: var(--ticker-gold);
        color: var(--ticker-navy-dark);
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
          width: 100% !important;
          border-radius: 0;
        }

        #${TICKER_ID} .lsffl-ticker-title {
          padding: 0 7px;
          font-size: 9px;
        }

        #${TICKER_ID} .lsffl-ticker-item {
          font-size: 9px;
        }

        #${TICKER_ID} .lsffl-ticker-category {
          font-size: 8px;
        }

        #lsffl-ticker-settings-panel {
          right: 1px;
          width: min(360px, calc(100vw - 8px));
        }
      }

      @media (prefers-reduced-motion: reduce) {
        #${TICKER_ID} .lsffl-ticker-track {
          animation-play-state: paused;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /* =========================================================
     BUILD UI
  ========================================================= */

  function buildTicker() {
    if (document.getElementById(TICKER_ID)) {
      tickerRoot =
        document.getElementById(TICKER_ID);

      tickerTrack =
        tickerRoot.querySelector(
          '.lsffl-ticker-track'
        );

      matchTickerWidth();
      hideOriginalMflDisplays();

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

    tickerRoot = createElement(
      'section',
      ''
    );

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

        const isOpen =
          settingsPanel.classList.toggle(
            'is-open'
          );

        settingsButton.setAttribute(
          'aria-expanded',
          String(isOpen)
        );
      }
    );

    document.addEventListener(
      'click',
      function (event) {
        if (
          settingsPanel &&
          tickerRoot &&
          !tickerRoot.contains(event.target)
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

    tickerRoot.appendChild(title);
    tickerRoot.appendChild(tickerWindow);
    tickerRoot.appendChild(settingsCell);
    tickerRoot.appendChild(settingsPanel);

    insertionReference.parentNode.insertBefore(
      tickerRoot,
      insertionReference
    );

    rebuildTickerTrack();
    matchTickerWidth();
    hideOriginalMflDisplays();

    return true;
  }

  /* =========================================================
     MODULE SUBSCRIPTIONS
  ========================================================= */

  function connectModules() {
    currentSettings =
      window.LSFFL_TICKER_SETTINGS
        .getSettings();

    commissionerMessages =
      window.LSFFL_MFL_DATA
        .getCommissionerMessages();

    window.LSFFL_TICKER_SETTINGS.subscribe(
      function (updatedSettings) {
        currentSettings = updatedSettings;
        rebuildTickerTrack();
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

          rebuildTickerTrack();

          setTimeout(
            hideOriginalMflDisplays,
            100
          );
        }
      );
  }

  /* =========================================================
     INITIALIZATION
  ========================================================= */

  function finishInitialization() {
    connectModules();

    let attempts = 0;

    function attemptBuild() {
      attempts += 1;

      window.LSFFL_MFL_DATA
        .scanForCommissionerMessages();

      if (buildTicker()) {
        setTimeout(
          hideOriginalMflDisplays,
          250
        );

        setTimeout(
          hideOriginalMflDisplays,
          1000
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

    window.addEventListener(
      'resize',
      function () {
        clearTimeout(resizeTimer);

        resizeTimer = setTimeout(
          matchTickerWidth,
          100
        );
      }
    );

    const pageObserver =
      new MutationObserver(function () {
        if (!document.getElementById(TICKER_ID)) {
          buildTicker();
        }

        hideOriginalMflDisplays();
      });

    pageObserver.observe(
      document.documentElement,
      {
        childList: true,
        subtree: true
      }
    );
  }

  function initialize() {
    if (initializationStarted) {
      return;
    }

    initializationStarted = true;

    loadRequiredModules()
      .then(finishInitialization)
      .catch(function (error) {
        console.error(
          'LSFFL Navy Times failed to start:',
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
