(function () {
  'use strict';

  /* =========================================================
     LSFFL NAVY TIMES SETTINGS
  ========================================================= */

  const STORAGE_KEY = 'lsfflNavyTimesSettingsV3';

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

  const subscribers = new Set();

  let settings = loadSettings();

  /* =========================================================
     HELPERS
  ========================================================= */

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function normalizeSettings(input) {
    const normalized = Object.assign(
      {},
      DEFAULT_SETTINGS,
      input && typeof input === 'object' ? input : {}
    );

    normalized.tickerSize = [
      'small',
      'medium',
      'large'
    ].includes(normalized.tickerSize)
      ? normalized.tickerSize
      : DEFAULT_SETTINGS.tickerSize;

    normalized.delay = Math.min(
      10,
      Math.max(0, Number(normalized.delay) || 0)
    );

    normalized.speed = Math.min(
      120,
      Math.max(20, Number(normalized.speed) || 55)
    );

    normalized.articleHeadlines = Math.min(
      10,
      Math.max(
        1,
        Number(normalized.articleHeadlines) || 5
      )
    );

    normalized.topByStatCategory = Math.max(
      0,
      Number(normalized.topByStatCategory) || 0
    );

    normalized.topFantasyPoints = Math.max(
      0,
      Number(normalized.topFantasyPoints) || 0
    );

    normalized.topPicksOnly = Math.max(
      0,
      Number(normalized.topPicksOnly) || 0
    );

    normalized.picksMade = Math.max(
      0,
      Number(normalized.picksMade) || 0
    );

    normalized.picksPending = Math.max(
      0,
      Number(normalized.picksPending) || 0
    );

    normalized.topLiveByCategory = Math.max(
      0,
      Number(normalized.topLiveByCategory) || 0
    );

    return normalized;
  }

  function loadSettings() {
    try {
      const saved = JSON.parse(
        localStorage.getItem(STORAGE_KEY)
      );

      return normalizeSettings(saved);
    } catch (error) {
      return normalizeSettings(DEFAULT_SETTINGS);
    }
  }

  function saveSettings() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(settings)
    );
  }

  function notifySubscribers() {
    const snapshot = getSettings();

    subscribers.forEach(function (callback) {
      try {
        callback(snapshot);
      } catch (error) {
        console.error(
          'LSFFL settings subscriber failed:',
          error
        );
      }
    });
  }

  /* =========================================================
     PUBLIC METHODS
  ========================================================= */

  function getSettings() {
    return clone(settings);
  }

  function updateSettings(updates) {
    settings = normalizeSettings(
      Object.assign({}, settings, updates || {})
    );

    saveSettings();
    notifySubscribers();

    return getSettings();
  }

  function updateSetting(name, value) {
    if (!(name in DEFAULT_SETTINGS)) {
      return getSettings();
    }

    const update = {};
    update[name] = value;

    return updateSettings(update);
  }

  function resetSettings() {
    settings = normalizeSettings(DEFAULT_SETTINGS);

    saveSettings();
    notifySubscribers();

    return getSettings();
  }

  function subscribe(callback) {
    if (typeof callback !== 'function') {
      return function () {};
    }

    subscribers.add(callback);
    callback(getSettings());

    return function unsubscribe() {
      subscribers.delete(callback);
    };
  }

  /* =========================================================
     SETTINGS PANEL HELPERS
  ========================================================= */

  function createGroup(titleText) {
    const group = document.createElement('section');
    group.className = 'lsffl-settings-group';

    const heading = document.createElement('button');
    heading.type = 'button';
    heading.className = 'lsffl-settings-group-heading';
    heading.setAttribute('aria-expanded', 'true');

    const headingText = document.createElement('span');
    headingText.textContent = titleText;

    const arrow = document.createElement('span');
    arrow.className = 'lsffl-settings-group-arrow';
    arrow.textContent = '▴';

    heading.appendChild(headingText);
    heading.appendChild(arrow);

    const content = document.createElement('div');
    content.className = 'lsffl-settings-group-content';

    heading.addEventListener('click', function () {
      const isOpen =
        heading.getAttribute('aria-expanded') === 'true';

      heading.setAttribute(
        'aria-expanded',
        String(!isOpen)
      );

      content.hidden = isOpen;
      arrow.textContent = isOpen ? '▾' : '▴';
    });

    group.appendChild(heading);
    group.appendChild(content);

    return {
      group: group,
      content: content
    };
  }

  function createCheckbox(labelText, settingName) {
    const label = document.createElement('label');
    label.className = 'lsffl-settings-checkbox';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = Boolean(settings[settingName]);

    input.addEventListener('change', function () {
      updateSetting(settingName, input.checked);
    });

    const text = document.createElement('span');
    text.textContent = labelText;

    label.appendChild(input);
    label.appendChild(text);

    return label;
  }

  function createSelect(
    labelText,
    settingName,
    values
  ) {
    const label = document.createElement('label');
    label.className = 'lsffl-settings-select-row';

    const select = document.createElement('select');

    values.forEach(function (entry) {
      const value =
        typeof entry === 'object'
          ? entry.value
          : entry;

      const text =
        typeof entry === 'object'
          ? entry.label
          : entry;

      const option = document.createElement('option');
      option.value = value;
      option.textContent = text;
      option.selected =
        String(settings[settingName]) ===
        String(value);

      select.appendChild(option);
    });

    select.addEventListener('change', function () {
      const rawValue = select.value;
      const numericValue = Number(rawValue);

      updateSetting(
        settingName,
        Number.isNaN(numericValue)
          ? rawValue
          : numericValue
      );
    });

    const text = document.createElement('span');
    text.textContent = labelText;

    label.appendChild(select);
    label.appendChild(text);

    return label;
  }

  function createActionButton(text, onClick) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'lsffl-settings-action';
    button.textContent = text;
    button.addEventListener('click', onClick);

    return button;
  }

  /* =========================================================
     BUILD SETTINGS PANEL
  ========================================================= */

  function buildSettingsPanel() {
    const panel = document.createElement('div');
    panel.id = 'lsffl-ticker-settings-panel';

    const title = document.createElement('div');
    title.className = 'lsffl-settings-panel-title';
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
        'Ticker Size',
        'tickerSize',
        [
          { value: 'small', label: 'Small' },
          { value: 'medium', label: 'Medium' },
          { value: 'large', label: 'Large' }
        ]
      )
    );

    globalGroup.content.appendChild(
      createSelect(
        'Delay Before Scroll',
        'delay',
        [0, 1, 2, 3, 4, 5, 6]
      )
    );

    globalGroup.content.appendChild(
      createSelect(
        '# of Article Headlines',
        'articleHeadlines',
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      )
    );

    const controlRow = document.createElement('div');
    controlRow.className =
      'lsffl-settings-action-row lsffl-settings-full-row';

    const pauseButton = createActionButton(
      settings.paused ? 'Play' : 'Pause',
      function () {
        const updated = updateSetting(
          'paused',
          !settings.paused
        );

        pauseButton.textContent =
          updated.paused ? 'Play' : 'Pause';
      }
    );

    const fasterButton = createActionButton(
      'Faster',
      function () {
        updateSetting(
          'speed',
          Math.max(20, settings.speed - 5)
        );
      }
    );

    const slowerButton = createActionButton(
      'Slower',
      function () {
        updateSetting(
          'speed',
          Math.min(120, settings.speed + 5)
        );
      }
    );

    controlRow.appendChild(pauseButton);
    controlRow.appendChild(fasterButton);
    controlRow.appendChild(slowerButton);

    globalGroup.content.appendChild(controlRow);
    panel.appendChild(globalGroup.group);

    const standardGroup = createGroup(
      'Standard Display'
    );

    standardGroup.content.appendChild(
      createSelect(
        '# Top by Stat Category',
        'topByStatCategory',
        [0, 3, 5, 10]
      )
    );

    standardGroup.content.appendChild(
      createSelect(
        '# Top Fantasy Points by Position',
        'topFantasyPoints',
        [0, 3, 5, 10]
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
        '# Top Picks Only',
        'topPicksOnly',
        [0, 3, 5, 10]
      )
    );

    standardGroup.content.appendChild(
      createSelect(
        '# Picks Made',
        'picksMade',
        [0, 3, 5, 10]
      )
    );

    standardGroup.content.appendChild(
      createSelect(
        '# Picks Pending',
        'picksPending',
        [0, 3, 5, 10]
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
        '# Top Live by Category',
        'topLiveByCategory',
        [0, 3, 5, 10]
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
      'Additional Content'
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

    const footer = document.createElement('div');
    footer.className = 'lsffl-settings-footer';

    const resetButton = createActionButton(
      'Reset Defaults',
      function () {
        resetSettings();
      }
    );

    footer.appendChild(resetButton);
    panel.appendChild(footer);

    return panel;
  }

  /* =========================================================
     EXPOSE SETTINGS MODULE
  ========================================================= */

  window.LSFFL_TICKER_SETTINGS = {
    getSettings: getSettings,
    updateSettings: updateSettings,
    updateSetting: updateSetting,
    resetSettings: resetSettings,
    subscribe: subscribe,
    buildSettingsPanel: buildSettingsPanel
  };
})();
