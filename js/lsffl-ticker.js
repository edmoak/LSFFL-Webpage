<script>
(function () {
  'use strict';

  /* =========================================================
     LSFFL NAVY TIMES TICKER
  ========================================================= */

  const TICKER_ID = 'lsffl-custom-ticker';
  const SETTINGS_ID = 'lsffl-ticker-settings';

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
      text: 'The live waiver order will appear here when the 2026 season begins.'
    },
    {
      category: 'Week 1 Matchups',
      text: 'Cougars vs G-Men, Get Off My Ditka vs Spartans, Dawgs vs Purple Hooters and more.'
    },
    {
      category: 'Transactions',
      text: 'Recent LSFFL trades, waiver claims and roster moves will appear here.'
    },
    {
      category: 'NFL News',
      text: 'Current NFL headlines will appear here when the news feed is connected.'
    }
  ];

  /* =========================================================
     REMOVE OLD MFL MARQUEE
  ========================================================= */

  function hideOldMFLMarquee() {
    const directSelectors = [
      '#marquee',
      '#marquee_wrapper',
      '#marquee-container',
      '#marqueeContainer',
      '#mfl-marquee',
      '#mflMarquee',
      '.mfl-marquee',
      '.marquee-wrapper',
      '.marquee-container',
      '.marquee_settings',
      '.marquee-settings'
    ];

    directSelectors.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (element) {
        if (!element.closest('#' + TICKER_ID)) {
          element.style.setProperty('display', 'none', 'important');
        }
      });
    });

    document.querySelectorAll(
      'table, section, article, div, form'
    ).forEach(function (element) {
      if (element.closest('#' + TICKER_ID)) {
        return;
      }

      const text = element.textContent
        .replace(/\s+/g, ' ')
        .trim()
        .toUpperCase();

      const isOldTicker =
        text.includes('LATEST ARTICLES') &&
        text.includes('NAVY TIMES');

      const isSettings =
        text.includes('MARQUEE SETTINGS') &&
        (
          text.includes('CONTROL TICKER SPEED') ||
          text.includes('PLAY / PAUSE / SKIP')
        );

      if (isOldTicker || isSettings) {
        const container =
          element.closest('.mobile-wrap') ||
          element.closest('.report') ||
          element.closest('.homepagetabcontent') ||
          element.closest('table') ||
          element;

        container.style.setProperty('display', 'none', 'important');
      }
    });
  }

  /* =========================================================
     CREATE INDIVIDUAL TICKER ITEM
  ========================================================= */

  function createTickerItem(item) {
    const tickerItem = document.createElement('span');
    tickerItem.className = 'lsffl-ticker-item';

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

    tickerItem.appendChild(category);
    tickerItem.appendChild(text);
    tickerItem.appendChild(separator);

    return tickerItem;
  }

  /* =========================================================
     STYLES
  ========================================================= */

  function addTickerStyles() {
    if (document.getElementById('lsffl-ticker-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'lsffl-ticker-styles';

    style.textContent = `
      #${TICKER_ID},
      #${TICKER_ID} * {
        box-sizing: border-box;
      }

      #${TICKER_ID} {
        --ticker-navy-dark: #031426;
        --ticker-navy: #082743;
        --ticker-gold: #d5ad24;
        --ticker-white: #ffffff;

        position: relative;
        z-index: 999;
        display: grid;
        grid-template-columns: 190px minmax(0, 1fr);
        width: 100%;
        height: 49px;
        min-height: 49px;
        margin: 0;
        overflow: visible;
        border-top: 1px solid var(--ticker-gold);
        border-bottom: 3px solid var(--ticker-gold);
        background: var(--ticker-navy-dark);
        box-shadow: 0 5px 12px rgba(0, 0, 0, 0.25);
        font-family: Arial, Helvetica, sans-serif;
      }

      #${TICKER_ID} .lsffl-ticker-brand {
        position: relative;
        z-index: 5;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 0;
        height: 46px;
        padding: 0 10px;
        border-right: 2px solid var(--ticker-gold);
        background:
          linear-gradient(
            135deg,
            #0d3152 0%,
            #04182b 100%
          );
      }

      #${TICKER_ID} .lsffl-ticker-brand-text {
        color: var(--ticker-white);
        font-size: 15px;
        font-weight: 900;
        line-height: 1;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        white-space: nowrap;
      }

      #${TICKER_ID} .lsffl-ticker-brand-text span {
        color: var(--ticker-gold);
      }

      #${TICKER_ID} .lsffl-ticker-cog {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 31px;
        height: 31px;
        margin-left: 10px;
        padding: 0;
        border: 0;
        background: transparent;
        color: var(--ticker-gold);
        font-size: 22px;
        line-height: 1;
        cursor: pointer;
        transition:
          transform 0.2s ease,
          color 0.2s ease;
      }

      #${TICKER_ID} .lsffl-ticker-cog:hover,
      #${TICKER_ID} .lsffl-ticker-cog:focus {
        color: #ffffff;
        transform: rotate(35deg);
        outline: none;
      }

      #${TICKER_ID} .lsffl-ticker-window {
        position: relative;
        display: flex;
        align-items: center;
        min-width: 0;
        height: 46px;
        overflow: hidden;
        background:
          linear-gradient(
            90deg,
            #082743 0%,
            #031426 100%
          );
      }

      #${TICKER_ID} .lsffl-ticker-window::before,
      #${TICKER_ID} .lsffl-ticker-window::after {
        content: "";
        position: absolute;
        top: 0;
        bottom: 0;
        z-index: 3;
        width: 32px;
        pointer-events: none;
      }

      #${TICKER_ID} .lsffl-ticker-window::before {
        left: 0;
        background:
          linear-gradient(
            90deg,
            #082743,
            transparent
          );
      }

      #${TICKER_ID} .lsffl-ticker-window::after {
        right: 0;
        background:
          linear-gradient(
            270deg,
            #031426,
            transparent
          );
      }

      #${TICKER_ID} .lsffl-ticker-track {
        display: flex;
        align-items: center;
        width: max-content;
        min-width: max-content;
        height: 46px;
        animation-name: lsfflTickerScroll;
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
        height: 46px;
      }

      #${TICKER_ID} .lsffl-ticker-item {
        display: inline-flex;
        align-items: center;
        flex-shrink: 0;
        height: 46px;
        color: var(--ticker-white);
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
        border: 1px solid rgba(213, 173, 36, 0.75);
        background: rgba(213, 173, 36, 0.1);
        color: var(--ticker-gold);
        font-size: 10px;
        font-weight: 900;
        line-height: 1;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }

      #${TICKER_ID} .lsffl-ticker-text {
        color: var(--ticker-white);
      }

      #${TICKER_ID} .lsffl-ticker-separator {
        display: inline-block;
        margin: 0 24px;
        color: var(--ticker-gold);
        font-size: 10px;
      }

      #${SETTINGS_ID} {
        position: absolute;
        top: 53px;
        left: 8px;
        z-index: 1000;
        display: none;
        width: 265px;
        padding: 12px;
        border: 2px solid var(--ticker-gold);
        border-radius: 4px;
        background: #061b30;
        color: #ffffff;
        box-shadow: 0 8px 22px rgba(0, 0, 0, 0.4);
        font-family: Arial, Helvetica, sans-serif;
      }

      #${SETTINGS_ID}.is-open {
        display: block;
      }

      #${SETTINGS_ID} .lsffl-settings-title {
        margin: 0 0 11px;
        padding-bottom: 8px;
        border-bottom: 1px solid rgba(213, 173, 36, 0.55);
        color: var(--ticker-gold);
        font-size: 13px;
        font-weight: 900;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }

      #${SETTINGS_ID} .lsffl-settings-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-top: 9px;
      }

      #${SETTINGS_ID} .lsffl-settings-label {
        font-size: 11px;
        font-weight: 700;
      }

      #${SETTINGS_ID} button {
        min-width: 34px;
        height: 29px;
        padding: 0 9px;
        border: 1px solid var(--ticker-gold);
        border-radius: 3px;
        background: #0a2c4c;
        color: #ffffff;
        font-size: 12px;
        font-weight: 800;
        cursor: pointer;
      }

      #${SETTINGS_ID} button:hover {
        background: var(--ticker-gold);
        color: #031426;
      }

      #${SETTINGS_ID} .lsffl-speed-value {
        display: inline-block;
        min-width: 53px;
        color: var(--ticker-gold);
        font-size: 11px;
        font-weight: 800;
        text-align: center;
      }

      @keyframes lsfflTickerScroll {
        from {
          transform: translateX(0);
        }

        to {
          transform: translateX(-50%);
        }
      }

      @media screen and (max-width: 760px) {
        #${TICKER_ID} {
          grid-template-columns: 132px minmax(0, 1fr);
          height: 45px;
          min-height: 45px;
        }

        #${TICKER_ID} .lsffl-ticker-brand,
        #${TICKER_ID} .lsffl-ticker-window,
        #${TICKER_ID} .lsffl-ticker-track,
        #${TICKER_ID} .lsffl-ticker-group,
        #${TICKER_ID} .lsffl-ticker-item {
          height: 42px;
        }

        #${TICKER_ID} .lsffl-ticker-brand-text {
          font-size: 11px;
        }

        #${TICKER_ID} .lsffl-ticker-cog {
          width: 25px;
          height: 25px;
          margin-left: 5px;
          font-size: 18px;
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
          top: 48px;
          left: 4px;
          width: 245px;
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
     SETTINGS CONTROLS
  ========================================================= */

  function createSettingsPanel(track) {
    const panel = document.createElement('div');
    panel.id = SETTINGS_ID;

    const title = document.createElement('div');
    title.className = 'lsffl-settings-title';
    title.textContent = 'Navy Times Settings';

    const playRow = document.createElement('div');
    playRow.className = 'lsffl-settings-row';

    const playLabel = document.createElement('span');
    playLabel.className = 'lsffl-settings-label';
    playLabel.textContent = 'Ticker';

    const playButton = document.createElement('button');
    playButton.type = 'button';
    playButton.textContent = 'Pause';

    const speedRow = document.createElement('div');
    speedRow.className = 'lsffl-settings-row';

    const speedLabel = document.createElement('span');
    speedLabel.className = 'lsffl-settings-label';
    speedLabel.textContent = 'Speed';

    const speedControls = document.createElement('div');

    const fasterButton = document.createElement('button');
    fasterButton.type = 'button';
    fasterButton.textContent = '−';
    fasterButton.title = 'Faster';

    const speedValue = document.createElement('span');
    speedValue.className = 'lsffl-speed-value';

    const slowerButton = document.createElement('button');
    slowerButton.type = 'button';
    slowerButton.textContent = '+';
    slowerButton.title = 'Slower';

    let duration = Number(
      localStorage.getItem('lsfflTickerSpeed') || DEFAULT_SPEED
    );

    const savedPaused =
      localStorage.getItem('lsfflTickerPaused') === 'true';

    function updateSpeed() {
      track.style.animationDuration = duration + 's';
      speedValue.textContent = duration + ' sec';
      localStorage.setItem('lsfflTickerSpeed', String(duration));
    }

    function updatePausedState(paused) {
      track.classList.toggle('is-paused', paused);
      playButton.textContent = paused ? 'Play' : 'Pause';
      localStorage.setItem('lsfflTickerPaused', String(paused));
    }

    playButton.addEventListener('click', function () {
      updatePausedState(
        !track.classList.contains('is-paused')
      );
    });

    fasterButton.addEventListener('click', function () {
      duration = Math.max(20, duration - 5);
      updateSpeed();
    });

    slowerButton.addEventListener('click', function () {
      duration = Math.min(120, duration + 5);
      updateSpeed();
    });

    speedControls.appendChild(fasterButton);
    speedControls.appendChild(speedValue);
    speedControls.appendChild(slowerButton);

    playRow.appendChild(playLabel);
    playRow.appendChild(playButton);

    speedRow.appendChild(speedLabel);
    speedRow.appendChild(speedControls);

    panel.appendChild(title);
    panel.appendChild(playRow);
    panel.appendChild(speedRow);

    updateSpeed();
    updatePausedState(savedPaused);

    return panel;
  }

  /* =========================================================
     FIND CORRECT HEADER LOCATION
  ========================================================= */

  function findLSFFLHeader() {
    return (
      document.querySelector('.lsffl-header') ||
      document.querySelector('.site-header') ||
      document.querySelector('[class*="lsffl-header"]') ||
      document.querySelector('#lsffl-header')
    );
  }

  /* =========================================================
     BUILD TICKER
  ========================================================= */

  function buildTicker() {
    hideOldMFLMarquee();

    const existingTicker = document.getElementById(TICKER_ID);

    if (existingTicker) {
      existingTicker.remove();
    }

    addTickerStyles();

    const header = findLSFFLHeader();

    if (!header) {
      console.warn(
        'The Navy Times ticker could not locate the LSFFL header.'
      );
      return;
    }

    const ticker = document.createElement('section');
    ticker.id = TICKER_ID;
    ticker.setAttribute(
      'aria-label',
      'Navy Times league news ticker'
    );

    const brand = document.createElement('div');
    brand.className = 'lsffl-ticker-brand';

    const brandText = document.createElement('div');
    brandText.className = 'lsffl-ticker-brand-text';
    brandText.innerHTML = '<span>Navy</span> Times';

    const cogButton = document.createElement('button');
    cogButton.type = 'button';
    cogButton.className = 'lsffl-ticker-cog';
    cogButton.setAttribute(
      'aria-label',
      'Open Navy Times settings'
    );
    cogButton.setAttribute('aria-expanded', 'false');
    cogButton.innerHTML = '&#9881;';

    brand.appendChild(brandText);
    brand.appendChild(cogButton);

    const tickerWindow = document.createElement('div');
    tickerWindow.className = 'lsffl-ticker-window';

    const tickerTrack = document.createElement('div');
    tickerTrack.className = 'lsffl-ticker-track';

    const firstGroup = document.createElement('div');
    firstGroup.className = 'lsffl-ticker-group';

    const secondGroup = document.createElement('div');
    secondGroup.className = 'lsffl-ticker-group';
    secondGroup.setAttribute('aria-hidden', 'true');

    tickerItems.forEach(function (item) {
      firstGroup.appendChild(createTickerItem(item));
      secondGroup.appendChild(createTickerItem(item));
    });

    tickerTrack.appendChild(firstGroup);
    tickerTrack.appendChild(secondGroup);
    tickerWindow.appendChild(tickerTrack);

    const settingsPanel = createSettingsPanel(tickerTrack);

    cogButton.addEventListener('click', function (event) {
      event.stopPropagation();

      const isOpen =
        settingsPanel.classList.toggle('is-open');

      cogButton.setAttribute(
        'aria-expanded',
        String(isOpen)
      );
    });

    document.addEventListener('click', function (event) {
      if (!ticker.contains(event.target)) {
        settingsPanel.classList.remove('is-open');
        cogButton.setAttribute('aria-expanded', 'false');
      }
    });

    ticker.appendChild(brand);
    ticker.appendChild(tickerWindow);
    ticker.appendChild(settingsPanel);

    header.insertAdjacentElement('afterend', ticker);
  }

  /* =========================================================
     START
  ========================================================= */

  function initializeTicker() {
    buildTicker();

    setTimeout(hideOldMFLMarquee, 500);
    setTimeout(hideOldMFLMarquee, 1500);
    setTimeout(hideOldMFLMarquee, 3000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      initializeTicker
    );
  } else {
    initializeTicker();
  }
})();
</script>
