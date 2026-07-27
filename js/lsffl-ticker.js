(function () {
  'use strict';

  /* =========================================================
     LSFFL NAVY TIMES
     Complete Replacement File
  ========================================================= */

  const TICKER_ID = 'lsffl-custom-ticker';
  const STYLE_ID = 'lsffl-custom-ticker-styles';
  const SETTINGS_ID = 'lsffl-ticker-settings';

  const STORAGE_SPEED = 'lsfflTickerSpeed';
  const STORAGE_PAUSED = 'lsfflTickerPaused';
  const STORAGE_CATEGORIES = 'lsfflTickerCategories';

  const DEFAULT_SPEED = 55;

  const tickerItems = [
    {
      category: 'League News',
      text: 'Get Off My Ditka enters the 2026 season as the defending LSFFL champion.'
    },
    {
      category: 'Draft Center',
      text: 'The official 2026 LSFFL Draft Center is ready for the upcoming season.'
    },
    {
      category: 'Waiver Order',
      text: 'The live LSFFL waiver order will appear here when league data is connected.'
    },
    {
      category: 'Matchups',
      text: 'Weekly LSFFL fantasy matchups and scoring updates will appear here during the season.'
    },
    {
      category: 'Transactions',
      text: 'Recent trades, waiver claims and roster moves will appear here.'
    },
    {
      category: 'NFL News',
      text: 'Current NFL headlines will appear here when the news feed is connected.'
    }
  ];

  let tickerRoot = null;
  let tickerTrack = null;
  let settingsPanel = null;

  /* =========================================================
     SAVED SETTINGS
  ========================================================= */

  function getSavedSpeed() {
    const saved = Number(localStorage.getItem(STORAGE_SPEED));

    if (!Number.isFinite(saved)) {
      return DEFAULT_SPEED;
    }

    return Math.min(120, Math.max(20, saved));
  }

  function getSavedPaused() {
    return localStorage.getItem(STORAGE_PAUSED) === 'true';
  }

  function getSavedCategories() {
    const fallback = {};

    tickerItems.forEach(function (item) {
      fallback[item.category] = true;
    });

    try {
      const saved = JSON.parse(
        localStorage.getItem(STORAGE_CATEGORIES)
      );

      if (!saved || typeof saved !== 'object') {
        return fallback;
      }

      tickerItems.forEach(function (item) {
        if (typeof saved[item.category] !== 'boolean') {
          saved[item.category] = true;
        }
      });

      return saved;
    } catch (error) {
      return fallback;
    }
  }

  function saveCategories(categories) {
    localStorage.setItem(
      STORAGE_CATEGORIES,
      JSON.stringify(categories)
    );
  }

  /* =========================================================
     LOCATE OLD MFL TICKER
  ========================================================= */

  function normalizeText(element) {
    return String(element.textContent || '')
      .replace(/\s+/g, ' ')
      .trim()
      .toUpperCase();
  }

  function isLikelyOldTicker(element) {
    if (!element || element.id === TICKER_ID) {
      return false;
    }

    if (element.closest('#' + TICKER_ID)) {
      return false;
    }

    const text = normalizeText(element);

    const hasNavyTimes =
      text.includes('NAVY TIMES');

    const hasTickerContent =
      text.includes('LATEST ARTICLES') ||
      text.includes('LATEST NEWS') ||
      text.includes('PLAY') ||
      text.includes('PAUSE') ||
      text.includes('MARQUEE SETTINGS');

    return hasNavyTimes && hasTickerContent;
  }

  function findOldTickerElement() {
    const preferredSelectors = [
      '#marquee',
      '#marquee_wrapper',
      '#marquee-container',
      '#marqueeContainer',
      '#mfl-marquee',
      '#mflMarquee',
      '.mfl-marquee',
      '.marquee-wrapper',
      '.marquee-container',
      '.marquee',
      '[id*="marquee"]',
      '[class*="marquee"]'
    ];

    for (const selector of preferredSelectors) {
      const candidates = document.querySelectorAll(selector);

      for (const candidate of candidates) {
        if (isLikelyOldTicker(candidate)) {
          return candidate;
        }
      }
    }

    const candidates = document.querySelectorAll(
      'div, section, article, table, form'
    );

    for (const candidate of candidates) {
      if (!isLikelyOldTicker(candidate)) {
        continue;
      }

      const rect = candidate.getBoundingClientRect();

      if (
        rect.width > 500 &&
        rect.height > 20 &&
        rect.height < 300
      ) {
        return candidate;
      }
    }

    return null;
  }

  function getOldTickerContainer(oldTicker) {
    if (!oldTicker) {
      return null;
    }

    const possibleContainers = [
      oldTicker.closest('.mobile-wrap'),
      oldTicker.closest('.report'),
      oldTicker.closest('.homepagetabcontent'),
      oldTicker.closest('.homepagecolumn'),
      oldTicker.closest('table'),
      oldTicker
    ].filter(Boolean);

    for (const container of possibleContainers) {
      const rect = container.getBoundingClientRect();
      const text = normalizeText(container);

      if (
        text.includes('NAVY TIMES') &&
        rect.width > 500 &&
        rect.height < 320
      ) {
        return container;
      }
    }

    return oldTicker;
  }

  function hideOldTicker(oldContainer) {
    if (!oldContainer) {
      return;
    }

    oldContainer.setAttribute(
      'data-lsffl-old-ticker',
      'hidden'
    );

    oldContainer.style.setProperty(
      'display',
      'none',
      'important'
    );

    oldContainer.style.setProperty(
      'visibility',
      'hidden',
      'important'
    );

    oldContainer.style.setProperty(
      'height',
      '0',
      'important'
    );

    oldContainer.style.setProperty(
      'min-height',
      '0',
      'important'
    );

    oldContainer.style.setProperty(
      'margin',
      '0',
      'important'
    );

    oldContainer.style.setProperty(
      'padding',
      '0',
      'important'
    );

    oldContainer.style.setProperty(
      'border',
      '0',
      'important'
    );

    oldContainer.style.setProperty(
      'overflow',
      'hidden',
      'important'
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
        --lsffl-ticker-dark: #031426;
        --lsffl-ticker-navy: #082743;
        --lsffl-ticker-blue: #0c3153;
        --lsffl-ticker-gold: #d5ad24;
        --lsffl-ticker-white: #ffffff;

        position: relative;
        z-index: 1000;
        display: grid;
        grid-template-columns: 190px minmax(0, 1fr);
        width: 100%;
        max-width: 1135px;
        height: 54px;
        min-height: 54px;
        margin: 5px auto 6px;
        overflow: visible;
        border: 1px solid var(--lsffl-ticker-gold);
        border-radius: 5px;
        background: var(--lsffl-ticker-dark);
        box-shadow: 0 5px 13px rgba(0, 0, 0, 0.24);
        font-family: Arial, Helvetica, sans-serif;
      }

      #${TICKER_ID} .lsffl-ticker-brand {
        position: relative;
        z-index: 5;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 52px;
        padding: 0 10px;
        border-right: 2px solid var(--lsffl-ticker-gold);
        border-radius: 4px 0 0 4px;
        background:
          linear-gradient(
            135deg,
            #d9b52d 0%,
            #c99e13 100%
          );
      }

      #${TICKER_ID} .lsffl-ticker-title {
        color: #031426;
        font-size: 14px;
        font-weight: 900;
        line-height: 1;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        white-space: nowrap;
      }

      #${TICKER_ID} .lsffl-ticker-controls {
        display: flex;
        align-items: center;
        margin-left: 9px;
        padding-left: 9px;
        border-left: 1px solid rgba(3, 20, 38, 0.35);
      }

      #${TICKER_ID} .lsffl-ticker-settings-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 27px;
        height: 27px;
        margin: 0;
        padding: 0;
        border: 0;
        background: transparent;
        color: #031426;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 21px;
        font-weight: 900;
        line-height: 1;
        cursor: pointer;
        transition:
          transform 0.2s ease,
          color 0.2s ease;
      }

      #${TICKER_ID} .lsffl-ticker-settings-button:hover,
      #${TICKER_ID} .lsffl-ticker-settings-button:focus {
        color: #ffffff;
        outline: none;
        transform: rotate(35deg);
      }

      #${TICKER_ID} .lsffl-ticker-window {
        position: relative;
        display: flex;
        align-items: center;
        min-width: 0;
        height: 52px;
        overflow: hidden;
        border-radius: 0 4px 4px 0;
        background:
          linear-gradient(
            90deg,
            var(--lsffl-ticker-blue) 0%,
            var(--lsffl-ticker-dark) 100%
          );
      }

      #${TICKER_ID} .lsffl-ticker-window::before,
      #${TICKER_ID} .lsffl-ticker-window::after {
        content: "";
        position: absolute;
        top: 0;
        bottom: 0;
        z-index: 4;
        width: 40px;
        pointer-events: none;
      }

      #${TICKER_ID} .lsffl-ticker-window::before {
        left: 0;
        background:
          linear-gradient(
            90deg,
            var(--lsffl-ticker-blue),
            transparent
          );
      }

      #${TICKER_ID} .lsffl-ticker-window::after {
        right: 0;
        background:
          linear-gradient(
            270deg,
            var(--lsffl-ticker-dark),
            transparent
          );
      }

      #${TICKER_ID} .lsffl-ticker-track {
        display: flex;
        align-items: center;
        width: max-content;
        min-width: max-content;
        height: 52px;
        animation-name: lsfflNavyTimesScroll;
        animation-duration: ${DEFAULT_SPEED}s;
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
        height: 52px;
      }

      #${TICKER_ID} .lsffl-ticker-item {
        display: inline-flex;
        align-items: center;
        flex-shrink: 0;
        height: 52px;
        color: var(--lsffl-ticker-white);
        font-size: 12px;
        font-weight: 600;
        line-height: 1;
        white-space: nowrap;
      }

      #${TICKER_ID} .lsffl-ticker-category {
        display: inline-flex;
        align-items: center;
        height: 25px;
        margin-right: 9px;
        padding: 0 9px;
        border: 1px solid rgba(213, 173, 36, 0.76);
        background: rgba(213, 173, 36, 0.11);
        color: var(--lsffl-ticker-gold);
        font-size: 10px;
        font-weight: 900;
        line-height: 1;
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }

      #${TICKER_ID} .lsffl-ticker-separator {
        display: inline-block;
        margin: 0 24px;
        color: var(--lsffl-ticker-gold);
        font-size: 10px;
      }

      #${SETTINGS_ID} {
        position: absolute;
        top: 58px;
        left: 0;
        z-index: 2000;
        display: none;
        width: 290px;
        padding: 13px;
        border: 2px solid var(--lsffl-ticker-gold);
        border-radius: 5px;
        background: #051a2f;
        color: #ffffff;
        box-shadow: 0 10px 24px rgba(0, 0, 0, 0.42);
        font-family: Arial, Helvetica, sans-serif;
      }

      #${SETTINGS_ID}.is-open {
        display: block;
      }

      #${SETTINGS_ID} .lsffl-settings-title {
        margin: 0 0 10px;
        padding: 0 0 9px;
        border-bottom: 1px solid rgba(213, 173, 36, 0.5);
        color: var(--lsffl-ticker-gold);
        font-size: 13px;
        font-weight: 900;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      #${SETTINGS_ID} .lsffl-settings-section {
        margin-top: 12px;
      }

      #${SETTINGS_ID} .lsffl-settings-heading {
        margin-bottom: 7px;
        color: #ffffff;
        font-size: 10px;
        font-weight: 900;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      #${SETTINGS_ID} .lsffl-settings-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-top: 8px;
      }

      #${SETTINGS_ID} .lsffl-settings-label {
        font-size: 11px;
        font-weight: 700;
      }

      #${SETTINGS_ID} .lsffl-settings-button {
        min-width: 40px;
        height: 29px;
        padding: 0 9px;
        border: 1px solid var(--lsffl-ticker-gold);
        border-radius: 3px;
        background: #0a2d4d;
        color: #ffffff;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 11px;
        font-weight: 900;
        cursor: pointer;
      }

      #${SETTINGS_ID} .lsffl-settings-button:hover {
        background: var(--lsffl-ticker-gold);
        color: #031426;
      }

      #${SETTINGS_ID} .lsffl-speed-controls {
        display: flex;
        align-items: center;
        gap: 5px;
      }

      #${SETTINGS_ID} .lsffl-speed-value {
        display: inline-block;
        min-width: 50px;
        color: var(--lsffl-ticker-gold);
        font-size: 11px;
        font-weight: 900;
        text-align: center;
      }

      #${SETTINGS_ID} .lsffl-category-list {
        display: grid;
        grid-template-columns: 1fr;
        gap: 7px;
      }

      #${SETTINGS_ID} .lsffl-category-option {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #ffffff;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
      }

      #${SETTINGS_ID} .lsffl-category-option input {
        width: 15px;
        height: 15px;
        margin: 0;
        accent-color: var(--lsffl-ticker-gold);
        cursor: pointer;
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
          grid-template-columns: 135px minmax(0, 1fr);
          height: 48px;
          min-height: 48px;
          margin: 3px auto 5px;
          border-radius: 0;
        }

        #${TICKER_ID} .lsffl-ticker-brand,
        #${TICKER_ID} .lsffl-ticker-window,
        #${TICKER_ID} .lsffl-ticker-track,
        #${TICKER_ID} .lsffl-ticker-group,
        #${TICKER_ID} .lsffl-ticker-item {
          height: 46px;
        }

        #${TICKER_ID} .lsffl-ticker-title {
          font-size: 10px;
          letter-spacing: 0.08em;
        }

        #${TICKER_ID} .lsffl-ticker-controls {
          margin-left: 5px;
          padding-left: 5px;
        }

        #${TICKER_ID} .lsffl-ticker-settings-button {
          width: 22px;
          height: 22px;
          font-size: 17px;
        }

        #${TICKER_ID} .lsffl-ticker-item {
          font-size: 10px;
        }

        #${TICKER_ID} .lsffl-ticker-category {
          height: 22px;
          margin-right: 7px;
          padding: 0 7px;
          font-size: 8px;
        }

        #${TICKER_ID} .lsffl-ticker-separator {
          margin: 0 16px;
        }

        #${SETTINGS_ID} {
          top: 52px;
          width: 275px;
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
     TICKER CONTENT
  ========================================================= */

  function createTickerItem(item) {
    const wrapper = document.createElement('span');
    wrapper.className = 'lsffl-ticker-item';

    const category = document.createElement('strong');
    category.className = 'lsffl-ticker-category';
    category.textContent = item.category;

    const text = document.createElement('span');
    text.className = 'lsffl-ticker-text';
    text.textContent = item.text;

    const separator = document.createElement('span');
    separator.className = 'lsffl-ticker-separator';
    separator.setAttribute('aria-hidden', 'true');
    separator.textContent = '★';

    wrapper.appendChild(category);
    wrapper.appendChild(text);
    wrapper.appendChild(separator);

    return wrapper;
  }

  function rebuildTickerTrack() {
    if (!tickerTrack) {
      return;
    }

    const enabledCategories = getSavedCategories();

    let visibleItems = tickerItems.filter(function (item) {
      return enabledCategories[item.category] !== false;
    });

    if (!visibleItems.length) {
      visibleItems = [
        {
          category: 'Navy Times',
          text: 'Open the settings cog to select ticker categories.'
        }
      ];
    }

    tickerTrack.innerHTML = '';

    const firstGroup = document.createElement('div');
    firstGroup.className = 'lsffl-ticker-group';

    const secondGroup = document.createElement('div');
    secondGroup.className = 'lsffl-ticker-group';
    secondGroup.setAttribute('aria-hidden', 'true');

    visibleItems.forEach(function (item) {
      firstGroup.appendChild(createTickerItem(item));
      secondGroup.appendChild(createTickerItem(item));
    });

    tickerTrack.appendChild(firstGroup);
    tickerTrack.appendChild(secondGroup);

    tickerTrack.style.animationDuration =
      getSavedSpeed() + 's';

    tickerTrack.classList.toggle(
      'is-paused',
      getSavedPaused()
    );
  }

  /* =========================================================
     SETTINGS PANEL
  ========================================================= */

  function createSettingsPanel() {
    const panel = document.createElement('div');
    panel.id = SETTINGS_ID;

    const title = document.createElement('div');
    title.className = 'lsffl-settings-title';
    title.textContent = 'Navy Times Settings';

    panel.appendChild(title);

    const controlSection = document.createElement('div');
    controlSection.className = 'lsffl-settings-section';

    const controlHeading = document.createElement('div');
    controlHeading.className = 'lsffl-settings-heading';
    controlHeading.textContent = 'Ticker Controls';

    const playRow = document.createElement('div');
    playRow.className = 'lsffl-settings-row';

    const playLabel = document.createElement('span');
    playLabel.className = 'lsffl-settings-label';
    playLabel.textContent = 'Scrolling';

    const playButton = document.createElement('button');
    playButton.type = 'button';
    playButton.className = 'lsffl-settings-button';

    function updatePlayButton() {
      playButton.textContent =
        getSavedPaused() ? 'Play' : 'Pause';
    }

    playButton.addEventListener('click', function () {
      const nextPaused = !getSavedPaused();

      localStorage.setItem(
        STORAGE_PAUSED,
        String(nextPaused)
      );

      tickerTrack.classList.toggle(
        'is-paused',
        nextPaused
      );

      updatePlayButton();
    });

    updatePlayButton();

    playRow.appendChild(playLabel);
    playRow.appendChild(playButton);

    const speedRow = document.createElement('div');
    speedRow.className = 'lsffl-settings-row';

    const speedLabel = document.createElement('span');
    speedLabel.className = 'lsffl-settings-label';
    speedLabel.textContent = 'Scroll Speed';

    const speedControls = document.createElement('div');
    speedControls.className = 'lsffl-speed-controls';

    const fasterButton = document.createElement('button');
    fasterButton.type = 'button';
    fasterButton.className = 'lsffl-settings-button';
    fasterButton.textContent = '−';
    fasterButton.title = 'Faster';

    const speedValue = document.createElement('span');
    speedValue.className = 'lsffl-speed-value';

    const slowerButton = document.createElement('button');
    slowerButton.type = 'button';
    slowerButton.className = 'lsffl-settings-button';
    slowerButton.textContent = '+';
    slowerButton.title = 'Slower';

    function updateSpeedDisplay() {
      const speed = getSavedSpeed();

      speedValue.textContent = speed + ' sec';
      tickerTrack.style.animationDuration = speed + 's';
    }

    fasterButton.addEventListener('click', function () {
      const speed = Math.max(
        20,
        getSavedSpeed() - 5
      );

      localStorage.setItem(
        STORAGE_SPEED,
        String(speed)
      );

      updateSpeedDisplay();
    });

    slowerButton.addEventListener('click', function () {
      const speed = Math.min(
        120,
        getSavedSpeed() + 5
      );

      localStorage.setItem(
        STORAGE_SPEED,
        String(speed)
      );

      updateSpeedDisplay();
    });

    updateSpeedDisplay();

    speedControls.appendChild(fasterButton);
    speedControls.appendChild(speedValue);
    speedControls.appendChild(slowerButton);

    speedRow.appendChild(speedLabel);
    speedRow.appendChild(speedControls);

    controlSection.appendChild(controlHeading);
    controlSection.appendChild(playRow);
    controlSection.appendChild(speedRow);

    panel.appendChild(controlSection);

    const categorySection = document.createElement('div');
    categorySection.className = 'lsffl-settings-section';

    const categoryHeading = document.createElement('div');
    categoryHeading.className = 'lsffl-settings-heading';
    categoryHeading.textContent = 'Displayed Categories';

    const categoryList = document.createElement('div');
    categoryList.className = 'lsffl-category-list';

    const savedCategories = getSavedCategories();

    tickerItems.forEach(function (item) {
      const label = document.createElement('label');
      label.className = 'lsffl-category-option';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked =
        savedCategories[item.category] !== false;

      const text = document.createElement('span');
      text.textContent = item.category;

      checkbox.addEventListener('change', function () {
        const currentCategories =
          getSavedCategories();

        currentCategories[item.category] =
          checkbox.checked;

        saveCategories(currentCategories);
        rebuildTickerTrack();
      });

      label.appendChild(checkbox);
      label.appendChild(text);

      categoryList.appendChild(label);
    });

    categorySection.appendChild(categoryHeading);
    categorySection.appendChild(categoryList);

    panel.appendChild(categorySection);

    return panel;
  }

  /* =========================================================
     BUILD NEW TICKER
  ========================================================= */

  function buildTicker(oldContainer) {
    if (document.getElementById(TICKER_ID)) {
      hideOldTicker(oldContainer);
      return true;
    }

    addStyles();

    const ticker = document.createElement('section');
    ticker.id = TICKER_ID;
    ticker.setAttribute(
      'aria-label',
      'Navy Times league news ticker'
    );

    const brand = document.createElement('div');
    brand.className = 'lsffl-ticker-brand';

    const title = document.createElement('div');
    title.className = 'lsffl-ticker-title';
    title.textContent = 'Navy Times';

    const controls = document.createElement('div');
    controls.className = 'lsffl-ticker-controls';

    const settingsButton = document.createElement('button');
    settingsButton.type = 'button';
    settingsButton.className =
      'lsffl-ticker-settings-button';
    settingsButton.setAttribute(
      'aria-label',
      'Open Navy Times settings'
    );
    settingsButton.setAttribute(
      'aria-expanded',
      'false'
    );
    settingsButton.innerHTML = '&#9881;';

    controls.appendChild(settingsButton);

    brand.appendChild(title);
    brand.appendChild(controls);

    const windowElement = document.createElement('div');
    windowElement.className = 'lsffl-ticker-window';

    tickerTrack = document.createElement('div');
    tickerTrack.className = 'lsffl-ticker-track';

    windowElement.appendChild(tickerTrack);

    settingsPanel = createSettingsPanel();

    ticker.appendChild(brand);
    ticker.appendChild(windowElement);
    ticker.appendChild(settingsPanel);

    settingsButton.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();

      const isOpen =
        settingsPanel.classList.toggle('is-open');

      settingsButton.setAttribute(
        'aria-expanded',
        String(isOpen)
      );
    });

    document.addEventListener('click', function (event) {
      if (
        settingsPanel &&
        !ticker.contains(event.target)
      ) {
        settingsPanel.classList.remove('is-open');

        settingsButton.setAttribute(
          'aria-expanded',
          'false'
        );
      }
    });

    oldContainer.parentNode.insertBefore(
      ticker,
      oldContainer
    );

    hideOldTicker(oldContainer);

    tickerRoot = ticker;

    rebuildTickerTrack();

    return true;
  }

  /* =========================================================
     INITIALIZE
  ========================================================= */

  function initialize() {
    const oldTicker = findOldTickerElement();

    if (!oldTicker) {
      return false;
    }

    const oldContainer =
      getOldTickerContainer(oldTicker);

    if (!oldContainer || !oldContainer.parentNode) {
      return false;
    }

    return buildTicker(oldContainer);
  }

  let attemptCount = 0;
  const maximumAttempts = 40;

  function attemptInitialization() {
    attemptCount += 1;

    if (initialize()) {
      return;
    }

    if (attemptCount < maximumAttempts) {
      setTimeout(attemptInitialization, 500);
    } else {
      console.warn(
        'LSFFL Navy Times could not locate the original MFL ticker.'
      );
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      attemptInitialization
    );
  } else {
    attemptInitialization();
  }

  const observer = new MutationObserver(function () {
    const oldTicker = findOldTickerElement();

    if (!oldTicker) {
      return;
    }

    const oldContainer =
      getOldTickerContainer(oldTicker);

    if (!oldContainer) {
      return;
    }

    if (!document.getElementById(TICKER_ID)) {
      buildTicker(oldContainer);
    } else {
      hideOldTicker(oldContainer);
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
