(function () {
  'use strict';

  /* =========================================================
     LSFFL NAVY TIMES TICKER
     COMPLETE REPLACEMENT FILE
  ========================================================= */

  const TICKER_ID = 'lsffl-custom-ticker';
  const STYLE_ID = 'lsffl-custom-ticker-styles';
  const SETTINGS_ID = 'lsffl-ticker-settings';

  const STORAGE_KEY = 'lsfflNavyTimesSettingsV2';

  const DEFAULT_SETTINGS = {
    tickerSize: 'medium',
    delay: 3,
    speed: 55,
    paused: false,

    commissionerMessages: true,
    franchiseIcons: false,
    articleHeadlines: 5,

    topByStatCategory: 5,
    topFantasyPoints: 5,

    powerRank: false,
    alternatePowerRank: false,
    pointsScored: false,
    allPlayRecord: false,
    lastWeekResults: false,
    nextWeekMatchups: true,
    nflResults: false,
    nflMatchups: false,
    waiverOrder: true,
    draft: false,
    showEntireDraft: false,

    topPicksOnly: 0,
    picksMade: 5,
    picksPending: 5,

    fantasyMatchups: false,
    topLiveByCategory: 5,
    liveNFLMatchups: true,
    nflMatchupLeaders: true,

    leagueNews: true,
    transactions: true,
    nflNews: true
  };

  let settings = loadSettings();
  let tickerRoot = null;
  let tickerTrack = null;
  let settingsPanel = null;
  let oldTickerContainer = null;

  /* =========================================================
     SETTINGS STORAGE
  ========================================================= */

  function loadSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

      return Object.assign(
        {},
        DEFAULT_SETTINGS,
        saved && typeof saved === 'object' ? saved : {}
      );
    } catch (error) {
      return Object.assign({}, DEFAULT_SETTINGS);
    }
  }

  function saveSettings() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(settings)
    );
  }

  /* =========================================================
     SAMPLE CONTENT
     Live MFL data can replace these messages later.
  ========================================================= */

  function getTickerItems() {
    const items = [];

    if (settings.commissionerMessages) {
      items.push({
        category: 'Commissioner',
        text:
          'Welcome to the 2026 LSFFL season. League announcements and commissioner updates will appear here.'
      });
    }

    if (settings.leagueNews) {
      items.push({
        category: 'League News',
        text:
          'Get Off My Ditka enters the 2026 season as the defending LSFFL champion.'
      });
    }

    if (settings.waiverOrder) {
      items.push({
        category: 'Waiver Order',
        text:
          '1. Mustangs  2. Cougars  3. Mad Hatters  4. Purple Hooters  5. Avalanche'
      });
    }

    if (settings.nextWeekMatchups) {
      items.push({
        category: 'Next Week',
        text:
          'Upcoming LSFFL fantasy matchups will appear here when the season schedule is active.'
      });
    }

    if (settings.lastWeekResults) {
      items.push({
        category: 'Last Week',
        text:
          'Completed LSFFL matchup results will appear here after games are played.'
      });
    }

    if (settings.fantasyMatchups) {
      items.push({
        category: 'Live Fantasy',
        text:
          'Live LSFFL fantasy matchup scores will appear here during NFL games.'
      });
    }

    if (settings.transactions) {
      items.push({
        category: 'Transactions',
        text:
          'Recent trades, waiver claims and roster moves will appear here.'
      });
    }

    if (settings.powerRank) {
      items.push({
        category: 'Power Rank',
        text:
          'The current LSFFL power rankings will appear here.'
      });
    }

    if (settings.alternatePowerRank) {
      items.push({
        category: 'Alt Power Rank',
        text:
          'Alternate LSFFL power rankings will appear here.'
      });
    }

    if (settings.pointsScored) {
      items.push({
        category: 'Points Scored',
        text:
          'League leaders in total fantasy points scored will appear here.'
      });
    }

    if (settings.allPlayRecord) {
      items.push({
        category: 'All-Play',
        text:
          'Current LSFFL all-play records will appear here.'
      });
    }

    if (settings.topByStatCategory > 0) {
      items.push({
        category: 'Stat Leaders',
        text:
          'Top ' +
          settings.topByStatCategory +
          ' players by statistical category will appear here.'
      });
    }

    if (settings.topFantasyPoints > 0) {
      items.push({
        category: 'Fantasy Leaders',
        text:
          'Top ' +
          settings.topFantasyPoints +
          ' fantasy scorers by position will appear here.'
      });
    }

    if (settings.draft) {
      items.push({
        category: 'Draft',
        text: settings.showEntireDraft
          ? 'The complete LSFFL draft board will appear in the ticker.'
          : 'Recent and upcoming LSFFL draft selections will appear here.'
      });
    }

    if (settings.topPicksOnly > 0) {
      items.push({
        category: 'Top Picks',
        text:
          'Showing the top ' +
          settings.topPicksOnly +
          ' draft picks.'
      });
    }

    if (settings.picksMade > 0) {
      items.push({
        category: 'Picks Made',
        text:
          'The latest ' +
          settings.picksMade +
          ' completed draft selections will appear here.'
      });
    }

    if (settings.picksPending > 0) {
      items.push({
        category: 'Picks Pending',
        text:
          'The next ' +
          settings.picksPending +
          ' pending draft selections will appear here.'
      });
    }

    if (settings.nflResults) {
      items.push({
        category: 'NFL Results',
        text:
          'Completed NFL game results will appear here.'
      });
    }

    if (settings.nflMatchups) {
      items.push({
        category: 'NFL Matchups',
        text:
          'Upcoming NFL matchups will appear here.'
      });
    }

    if (settings.liveNFLMatchups) {
      items.push({
        category: 'Live NFL',
        text:
          'Live NFL game scores will appear here during games.'
      });
    }

    if (settings.nflMatchupLeaders) {
      items.push({
        category: 'NFL Leaders',
        text:
          'NFL matchup statistical leaders will appear here during games.'
      });
    }

    if (settings.topLiveByCategory > 0) {
      items.push({
        category: 'Live Leaders',
        text:
          'Top ' +
          settings.topLiveByCategory +
          ' live players by category will appear here.'
      });
    }

    if (settings.nflNews) {
      items.push({
        category: 'NFL News',
        text:
          'Current NFL headlines and breaking news will appear here.'
      });
    }

    if (!items.length) {
      items.push({
        category: 'Navy Times',
        text:
          'Open the settings cog to choose which information is displayed.'
      });
    }

    return items.slice(
      0,
      Math.max(1, Number(settings.articleHeadlines) || 5)
    );
  }

  /* =========================================================
     FIND AND REMOVE OLD MFL TICKER
  ========================================================= */

  function normalizedText(element) {
    return String(element.textContent || '')
      .replace(/\s+/g, ' ')
      .trim()
      .toUpperCase();
  }

  function findOldTicker() {
    const selectors = [
      '#marquee',
      '#marquee_wrapper',
      '#marquee-container',
      '#marqueeContainer',
      '#mfl-marquee',
      '.mfl-marquee',
      '.marquee-wrapper',
      '.marquee-container',
      '[id*="marquee"]',
      '[class*="marquee"]'
    ];

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);

      for (const element of elements) {
        if (
          element.id !== TICKER_ID &&
          !element.closest('#' + TICKER_ID)
        ) {
          const text = normalizedText(element);

          if (
            text.includes('NAVY TIMES') ||
            text.includes('LATEST ARTICLES')
          ) {
            return element;
          }
        }
      }
    }

    const candidates = document.querySelectorAll(
      'div, section, table, article'
    );

    for (const element of candidates) {
      if (
        element.id === TICKER_ID ||
        element.closest('#' + TICKER_ID)
      ) {
        continue;
      }

      const text = normalizedText(element);
      const rect = element.getBoundingClientRect();

      if (
        text.includes('NAVY TIMES') &&
        text.includes('LATEST ARTICLES') &&
        rect.width > 600 &&
        rect.height < 250
      ) {
        return element;
      }
    }

    return null;
  }

  function getOldTickerContainer(element) {
    if (!element) {
      return null;
    }

    const candidates = [
      element.closest('.mobile-wrap'),
      element.closest('.report'),
      element.closest('.homepagetabcontent'),
      element.closest('table'),
      element
    ].filter(Boolean);

    for (const candidate of candidates) {
      const rect = candidate.getBoundingClientRect();
      const text = normalizedText(candidate);

      if (
        text.includes('NAVY TIMES') &&
        rect.width > 600 &&
        rect.height < 300
      ) {
        return candidate;
      }
    }

    return element;
  }

  function hideOldTicker() {
    if (!oldTickerContainer) {
      return;
    }

    oldTickerContainer.style.setProperty(
      'display',
      'none',
      'important'
    );
  }

  /* =========================================================
     MATCH SCOREBOARD WIDTH
  ========================================================= */

  function findContentWidthReference() {
    const selectors = [
      '.homepagecolumns',
      '.homepagecolumn',
      '#body_options_01',
      '#body_home',
      '.homepagetabcontent',
      '.myfantasyleague_menu',
      '.reportnavigation',
      '.report'
    ];

    let bestElement = null;
    let bestWidth = 0;

    selectors.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (element) {
        if (
          element.closest('#' + TICKER_ID) ||
          element === oldTickerContainer
        ) {
          return;
        }

        const rect = element.getBoundingClientRect();

        if (
          rect.width > bestWidth &&
          rect.width >= 850 &&
          rect.width <= 1400
        ) {
          bestWidth = rect.width;
          bestElement = element;
        }
      });
    });

    return bestElement;
  }

  function matchTickerWidth() {
    if (!tickerRoot) {
      return;
    }

    const reference = findContentWidthReference();

    if (!reference) {
      tickerRoot.style.width = '100%';
      tickerRoot.style.maxWidth = '1135px';
      return;
    }

    const rect = reference.getBoundingClientRect();

    tickerRoot.style.width =
      Math.round(rect.width) + 'px';

    tickerRoot.style.maxWidth = 'none';
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
        --ticker-navy-dark: #031426;
        --ticker-navy: #082743;
        --ticker-blue: #0b3152;
        --ticker-gold: #c9a227;
        --ticker-white: #ffffff;

        position: relative;
        z-index: 1000;
        display: grid;
        grid-template-columns: 155px minmax(0, 1fr) 38px;
        width: 100%;
        max-width: 1135px;
        height: 47px;
        min-height: 47px;
        margin: 5px auto 7px;
        overflow: visible;
        border: 2px solid var(--ticker-gold);
        border-radius: 4px;
        background: var(--ticker-navy-dark);
        box-shadow: 0 5px 13px rgba(0, 0, 0, 0.24);
        font-family: Arial, Helvetica, sans-serif;
      }

      #${TICKER_ID}.ticker-size-small {
        height: 39px;
        min-height: 39px;
      }

      #${TICKER_ID}.ticker-size-large {
        height: 55px;
        min-height: 55px;
      }

      #${TICKER_ID} .lsffl-ticker-title {
        display: flex;
        align-items: center;
        height: 43px;
        padding: 0 14px;
        border-right: 1px solid rgba(201, 162, 39, 0.55);
        background:
          linear-gradient(
            180deg,
            #0d3559 0%,
            #061d34 100%
          );
        color: var(--ticker-gold);
        font-size: 14px;
        font-weight: 900;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        white-space: nowrap;
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
        height: 51px;
      }

      #${TICKER_ID} .lsffl-ticker-window {
        position: relative;
        display: flex;
        align-items: center;
        min-width: 0;
        height: 43px;
        overflow: hidden;
        background:
          linear-gradient(
            90deg,
            var(--ticker-blue),
            var(--ticker-navy-dark)
          );
      }

      #${TICKER_ID} .lsffl-ticker-window::before,
      #${TICKER_ID} .lsffl-ticker-window::after {
        content: "";
        position: absolute;
        top: 0;
        bottom: 0;
        z-index: 3;
        width: 25px;
        pointer-events: none;
      }

      #${TICKER_ID} .lsffl-ticker-window::before {
        left: 0;
        background:
          linear-gradient(
            90deg,
            var(--ticker-blue),
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
        height: 43px;
        animation-name: lsfflTickerScroll;
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
        height: 43px;
      }

      #${TICKER_ID} .lsffl-ticker-item {
        display: inline-flex;
        align-items: center;
        flex-shrink: 0;
        height: 43px;
        color: var(--ticker-white);
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
        height: 43px;
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
        width: 24px;
        height: 24px;
        margin: 0;
        padding: 0;
        border: 0;
        background: transparent;
        color: var(--ticker-gold);
        font-size: 18px;
        line-height: 1;
        cursor: pointer;
        transition:
          color 0.2s ease,
          transform 0.2s ease;
      }

      #${TICKER_ID} .lsffl-ticker-settings-button:hover,
      #${TICKER_ID} .lsffl-ticker-settings-button:focus {
        color: #ffffff;
        outline: none;
        transform: rotate(30deg);
      }

      #${SETTINGS_ID} {
        position: absolute;
        top: calc(100% + 5px);
        right: 0;
        z-index: 3000;
        display: none;
        width: 360px;
        max-height: 72vh;
        overflow-y: auto;
        padding: 10px;
        border: 2px solid var(--ticker-gold);
        border-radius: 4px;
        background: #061b30;
        color: #ffffff;
        box-shadow: 0 10px 28px rgba(0, 0, 0, 0.45);
        font-family: Arial, Helvetica, sans-serif;
      }

      #${SETTINGS_ID}.is-open {
        display: block;
      }

      #${SETTINGS_ID} .settings-title {
        margin: 0 0 9px;
        padding: 0 0 8px;
        border-bottom: 2px solid var(--ticker-gold);
        color: var(--ticker-gold);
        font-size: 15px;
        font-weight: 900;
        text-transform: uppercase;
      }

      #${SETTINGS_ID} .settings-group {
        margin-top: 10px;
        border: 1px solid rgba(201, 162, 39, 0.7);
      }

      #${SETTINGS_ID} .settings-group-title {
        padding: 6px;
        border-bottom: 1px solid rgba(201, 162, 39, 0.55);
        background: #0a2947;
        color: #ffffff;
        font-size: 11px;
        font-weight: 900;
        text-align: center;
        text-transform: uppercase;
      }

      #${SETTINGS_ID} .settings-group-content {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px 10px;
        padding: 9px;
      }

      #${SETTINGS_ID} .settings-full-row {
        grid-column: 1 / -1;
      }

      #${SETTINGS_ID} label {
        display: flex;
        align-items: center;
        gap: 5px;
        min-width: 0;
        color: #ffffff;
        font-size: 10px;
        font-weight: 700;
        line-height: 1.2;
      }

      #${SETTINGS_ID} input[type="checkbox"] {
        width: 14px;
        height: 14px;
        margin: 0;
        accent-color: var(--ticker-gold);
      }

      #${SETTINGS_ID} select {
        height: 25px;
        border: 1px solid var(--ticker-gold);
        background: #ffffff;
        color: #031426;
        font-size: 10px;
        font-weight: 700;
      }

      #${SETTINGS_ID} .settings-select-row {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 10px;
        font-weight: 700;
      }

      #${SETTINGS_ID} .settings-controls {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      #${SETTINGS_ID} button.settings-action {
        height: 27px;
        padding: 0 9px;
        border: 1px solid var(--ticker-gold);
        border-radius: 2px;
        background: #0b3152;
        color: #ffffff;
        font-size: 10px;
        font-weight: 900;
        cursor: pointer;
      }

      #${SETTINGS_ID} button.settings-action:hover {
        background: var(--ticker-gold);
        color: #031426;
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
          grid-template-columns: 110px minmax(0, 1fr) 34px;
          width: 100% !important;
          border-radius: 0;
        }

        #${TICKER_ID} .lsffl-ticker-title {
          padding: 0 8px;
          font-size: 10px;
        }

        #${TICKER_ID} .lsffl-ticker-item {
          font-size: 9px;
        }

        #${TICKER_ID} .lsffl-ticker-category {
          font-size: 8px;
        }

        #${SETTINGS_ID} {
          right: 2px;
          width: min(350px, calc(100vw - 14px));
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
     TICKER ITEMS
  ========================================================= */

  function createTickerItem(item) {
    const wrapper = document.createElement('span');
    wrapper.className = 'lsffl-ticker-item';

    const category = document.createElement('strong');
    category.className = 'lsffl-ticker-category';
    category.textContent = item.category + ':';

    const text = document.createElement('span');
    text.className = 'lsffl-ticker-text';
    text.textContent = item.text;

    const separator = document.createElement('span');
    separator.className = 'lsffl-ticker-separator';
    separator.textContent = '★';
    separator.setAttribute('aria-hidden', 'true');

    wrapper.appendChild(category);
    wrapper.appendChild(text);
    wrapper.appendChild(separator);

    return wrapper;
  }

  function rebuildTicker() {
    if (!tickerTrack || !tickerRoot) {
      return;
    }

    tickerTrack.innerHTML = '';

    const firstGroup = document.createElement('div');
    firstGroup.className = 'lsffl-ticker-group';

    const secondGroup = document.createElement('div');
    secondGroup.className = 'lsffl-ticker-group';
    secondGroup.setAttribute('aria-hidden', 'true');

    getTickerItems().forEach(function (item) {
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
      'ticker-size-' + settings.tickerSize
    );

    tickerTrack.style.animationDuration =
      Number(settings.speed) + 's';

    tickerTrack.style.animationDelay =
      Number(settings.delay) + 's';

    tickerTrack.classList.toggle(
      'is-paused',
      Boolean(settings.paused)
    );

    saveSettings();
  }

  /* =========================================================
     SETTINGS ELEMENT HELPERS
  ========================================================= */

  function createCheckbox(labelText, settingName) {
    const label = document.createElement('label');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = Boolean(settings[settingName]);

    checkbox.addEventListener('change', function () {
      settings[settingName] = checkbox.checked;
      rebuildTicker();
    });

    const text = document.createElement('span');
    text.textContent = labelText;

    label.appendChild(checkbox);
    label.appendChild(text);

    return label;
  }

  function createSelect(
    settingName,
    values,
    suffixText
  ) {
    const row = document.createElement('div');
    row.className = 'settings-select-row';

    const select = document.createElement('select');

    values.forEach(function (value) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      option.selected =
        String(settings[settingName]) === String(value);

      select.appendChild(option);
    });

    select.addEventListener('change', function () {
      const numericValue = Number(select.value);

      settings[settingName] = Number.isNaN(numericValue)
        ? select.value
        : numericValue;

      rebuildTicker();
    });

    const text = document.createElement('span');
    text.textContent = suffixText;

    row.appendChild(select);
    row.appendChild(text);

    return row;
  }

  function createGroup(titleText) {
    const group = document.createElement('div');
    group.className = 'settings-group';

    const title = document.createElement('div');
    title.className = 'settings-group-title';
    title.textContent = titleText;

    const content = document.createElement('div');
    content.className = 'settings-group-content';

    group.appendChild(title);
    group.appendChild(content);

    return {
      group: group,
      content: content
    };
  }

  /* =========================================================
     SETTINGS PANEL
  ========================================================= */

  function createSettingsPanel() {
    const panel = document.createElement('div');
    panel.id = SETTINGS_ID;

    const title = document.createElement('div');
    title.className = 'settings-title';
    title.textContent = 'Navy Times Settings';

    panel.appendChild(title);

    const globalGroup = createGroup('Global Display');

    globalGroup.content.appendChild(
      createCheckbox(
        'Commissioner Messages',
        'commissionerMessages'
      )
    );

    globalGroup.content.appendChild(
      createCheckbox(
        'Show Franchise Icons',
        'franchiseIcons'
      )
    );

    globalGroup.content.appendChild(
      createSelect(
        'tickerSize',
        ['small', 'medium', 'large'],
        'Ticker Size'
      )
    );

    globalGroup.content.appendChild(
      createSelect(
        'delay',
        [0, 1, 2, 3, 4, 5, 6],
        'Delay Before Scroll'
      )
    );

    globalGroup.content.appendChild(
      createSelect(
        'articleHeadlines',
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        '# of Headlines'
      )
    );

    const controls = document.createElement('div');
    controls.className =
      'settings-controls settings-full-row';

    const playButton = document.createElement('button');
    playButton.type = 'button';
    playButton.className = 'settings-action';

    function updatePlayButton() {
      playButton.textContent = settings.paused
        ? 'Play Ticker'
        : 'Pause Ticker';
    }

    playButton.addEventListener('click', function () {
      settings.paused = !settings.paused;
      updatePlayButton();
      rebuildTicker();
    });

    updatePlayButton();

    const fasterButton = document.createElement('button');
    fasterButton.type = 'button';
    fasterButton.className = 'settings-action';
    fasterButton.textContent = 'Faster';

    fasterButton.addEventListener('click', function () {
      settings.speed = Math.max(
        20,
        Number(settings.speed) - 5
      );

      rebuildTicker();
    });

    const slowerButton = document.createElement('button');
    slowerButton.type = 'button';
    slowerButton.className = 'settings-action';
    slowerButton.textContent = 'Slower';

    slowerButton.addEventListener('click', function () {
      settings.speed = Math.min(
        120,
        Number(settings.speed) + 5
      );

      rebuildTicker();
    });

    controls.appendChild(playButton);
    controls.appendChild(fasterButton);
    controls.appendChild(slowerButton);

    globalGroup.content.appendChild(controls);
    panel.appendChild(globalGroup.group);

    const standardGroup = createGroup('Standard Display');

    standardGroup.content.appendChild(
      createSelect(
        'topByStatCategory',
        [0, 3, 5, 10],
        '# Top by Stat Category'
      )
    );

    standardGroup.content.appendChild(
      createSelect(
        'topFantasyPoints',
        [0, 3, 5, 10],
        '# Top Fantasy Points'
      )
    );

    standardGroup.content.appendChild(
      createCheckbox('Power Rank', 'powerRank')
    );

    standardGroup.content.appendChild(
      createCheckbox(
        'Alt Power Rank',
        'alternatePowerRank'
      )
    );

    standardGroup.content.appendChild(
      createCheckbox(
        'Points Scored',
        'pointsScored'
      )
    );

    standardGroup.content.appendChild(
      createCheckbox(
        'All Play Record',
        'allPlayRecord'
      )
    );

    standardGroup.content.appendChild(
      createCheckbox(
        'Last Week Results',
        'lastWeekResults'
      )
    );

    standardGroup.content.appendChild(
      createCheckbox(
        'Next Week Matchups',
        'nextWeekMatchups'
      )
    );

    standardGroup.content.appendChild(
      createCheckbox(
        'NFL Results',
        'nflResults'
      )
    );

    standardGroup.content.appendChild(
      createCheckbox(
        'NFL Matchups',
        'nflMatchups'
      )
    );

    standardGroup.content.appendChild(
      createCheckbox(
        'Waiver Order',
        'waiverOrder'
      )
    );

    standardGroup.content.appendChild(
      createCheckbox('Draft', 'draft')
    );

    standardGroup.content.appendChild(
      createCheckbox(
        'Show Entire Draft',
        'showEntireDraft'
      )
    );

    standardGroup.content.appendChild(
      createSelect(
        'topPicksOnly',
        [0, 3, 5, 10],
        '# Top Picks Only'
      )
    );

    standardGroup.content.appendChild(
      createSelect(
        'picksMade',
        [0, 3, 5, 10],
        '# Picks Made'
      )
    );

    standardGroup.content.appendChild(
      createSelect(
        'picksPending',
        [0, 3, 5, 10],
        '# Picks Pending'
      )
    );

    panel.appendChild(standardGroup.group);

    const liveGroup = createGroup('Live Display');

    liveGroup.content.appendChild(
      createCheckbox(
        'Fantasy Matchups',
        'fantasyMatchups'
      )
    );

    liveGroup.content.appendChild(
      createSelect(
        'topLiveByCategory',
        [0, 3, 5, 10],
        '# Top Live by Category'
      )
    );

    liveGroup.content.appendChild(
      createCheckbox(
        'NFL Matchups',
        'liveNFLMatchups'
      )
    );

    liveGroup.content.appendChild(
      createCheckbox(
        'NFL Matchup Leaders',
        'nflMatchupLeaders'
      )
    );

    panel.appendChild(liveGroup.group);

    const additionalGroup = createGroup(
      'Additional Navy Times Content'
    );

    additionalGroup.content.appendChild(
      createCheckbox(
        'League News',
        'leagueNews'
      )
    );

    additionalGroup.content.appendChild(
      createCheckbox(
        'Transactions',
        'transactions'
      )
    );

    additionalGroup.content.appendChild(
      createCheckbox(
        'NFL News',
        'nflNews'
      )
    );

    panel.appendChild(additionalGroup.group);

    return panel;
  }

  /* =========================================================
     BUILD TICKER
  ========================================================= */

  function buildTicker() {
    if (
      !oldTickerContainer ||
      !oldTickerContainer.parentNode
    ) {
      return false;
    }

    addStyles();

    const existing = document.getElementById(TICKER_ID);

    if (existing) {
      tickerRoot = existing;
      hideOldTicker();
      matchTickerWidth();
      return true;
    }

    tickerRoot = document.createElement('section');
    tickerRoot.id = TICKER_ID;
    tickerRoot.setAttribute(
      'aria-label',
      'Navy Times league ticker'
    );

    const title = document.createElement('div');
    title.className = 'lsffl-ticker-title';
    title.textContent = 'Navy Times';

    const tickerWindow = document.createElement('div');
    tickerWindow.className = 'lsffl-ticker-window';

    tickerTrack = document.createElement('div');
    tickerTrack.className = 'lsffl-ticker-track';

    tickerWindow.appendChild(tickerTrack);

    const settingsCell = document.createElement('div');
    settingsCell.className =
      'lsffl-ticker-settings-cell';

    const settingsButton = document.createElement('button');
    settingsButton.type = 'button';
    settingsButton.className =
      'lsffl-ticker-settings-button';
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

    settingsPanel = createSettingsPanel();

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
        !tickerRoot.contains(event.target)
      ) {
        settingsPanel.classList.remove('is-open');

        settingsButton.setAttribute(
          'aria-expanded',
          'false'
        );
      }
    });

    tickerRoot.appendChild(title);
    tickerRoot.appendChild(tickerWindow);
    tickerRoot.appendChild(settingsCell);
    tickerRoot.appendChild(settingsPanel);

    oldTickerContainer.parentNode.insertBefore(
      tickerRoot,
      oldTickerContainer
    );

    hideOldTicker();
    rebuildTicker();
    matchTickerWidth();

    window.addEventListener('resize', matchTickerWidth);

    return true;
  }

  /* =========================================================
     INITIALIZE
  ========================================================= */

  let attempts = 0;

  function initialize() {
    attempts += 1;

    const oldTicker = findOldTicker();

    if (oldTicker) {
      oldTickerContainer =
        getOldTickerContainer(oldTicker);

      if (buildTicker()) {
        return;
      }
    }

    if (attempts < 40) {
      setTimeout(initialize, 500);
    } else {
      console.warn(
        'LSFFL Navy Times could not locate the old MFL ticker.'
      );
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      initialize
    );
  } else {
    initialize();
  }

  const observer = new MutationObserver(function () {
    const oldTicker = findOldTicker();

    if (oldTicker) {
      oldTickerContainer =
        getOldTickerContainer(oldTicker);

      hideOldTicker();

      if (!document.getElementById(TICKER_ID)) {
        buildTicker();
      }
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
