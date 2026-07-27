(function () {
  'use strict';

  const TICKER_ID = 'lsffl-custom-ticker';

  const tickerItems = [
    {
      category: 'League News',
      text: 'The new custom LSFFL ticker is now online.'
    },
    {
      category: 'Champion',
      text: 'Get Off My Ditka enters the 2026 season as the defending LSFFL champion.'
    },
    {
      category: 'Draft Center',
      text: 'The official 2026 LSFFL Draft Center is ready for the upcoming season.'
    },
    {
      category: 'Waiver Order',
      text: 'The live waiver order will appear here when MFL league data is connected.'
    },
    {
      category: 'Matchups',
      text: 'Weekly fantasy matchups and scoring updates will appear here during the season.'
    },
    {
      category: 'NFL News',
      text: 'Current NFL headlines will be added after the ticker design is approved.'
    }
  ];

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

  function addTickerStyles() {
    if (document.getElementById('lsffl-ticker-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'lsffl-ticker-styles';

    style.textContent = `
      #${TICKER_ID} {
        --ticker-navy-dark: #02111f;
        --ticker-navy-light: #082a46;
        --ticker-gold: #d4af37;
        --ticker-white: #ffffff;

        position: relative;
        z-index: 100;
        display: grid;
        grid-template-columns: 190px minmax(0, 1fr);
        width: 100%;
        min-height: 52px;
        margin: 0;
        overflow: hidden;
        border-top: 1px solid rgba(212, 175, 55, 0.72);
        border-bottom: 4px solid var(--ticker-gold);
        background: var(--ticker-navy-dark);
        box-shadow: 0 4px 10px rgba(2, 17, 31, 0.24);
        font-family: Montserrat, Arial, Helvetica, sans-serif;
      }

      #${TICKER_ID},
      #${TICKER_ID} * {
        box-sizing: border-box;
      }

      #${TICKER_ID} .lsffl-ticker-brand {
        position: relative;
        z-index: 3;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 9px;
        min-width: 0;
        padding: 7px 14px;
        border-right: 3px solid var(--ticker-gold);
        background: linear-gradient(
          135deg,
          var(--ticker-navy-light),
          var(--ticker-navy-dark)
        );
        box-shadow: 8px 0 14px rgba(2, 17, 31, 0.32);
      }

      #${TICKER_ID} .lsffl-ticker-logo {
        width: 39px;
        height: 39px;
        flex: 0 0 39px;
        object-fit: contain;
        filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.45));
      }

      #${TICKER_ID} .lsffl-ticker-brand-text {
        min-width: 0;
        color: var(--ticker-white);
        font-family: Cinzel, Georgia, serif;
        font-size: 13px;
        font-weight: 800;
        line-height: 1.05;
        letter-spacing: 0.055em;
        text-align: center;
        text-transform: uppercase;
        white-space: nowrap;
      }

      #${TICKER_ID} .lsffl-ticker-brand-text span {
        display: block;
        margin-top: 3px;
        color: var(--ticker-gold);
        font-family: Montserrat, Arial, sans-serif;
        font-size: 8px;
        font-weight: 800;
        letter-spacing: 0.16em;
      }

      #${TICKER_ID} .lsffl-ticker-window {
        position: relative;
        display: flex;
        align-items: center;
        min-width: 0;
        overflow: hidden;
        background: linear-gradient(
          90deg,
          rgba(8, 42, 70, 0.96),
          rgba(2, 17, 31, 0.98)
        );
      }

      #${TICKER_ID} .lsffl-ticker-window::before,
      #${TICKER_ID} .lsffl-ticker-window::after {
        content: "";
        position: absolute;
        top: 0;
        bottom: 0;
        z-index: 2;
        width: 45px;
        pointer-events: none;
      }

      #${TICKER_ID} .lsffl-ticker-window::before {
        left: 0;
        background: linear-gradient(
          90deg,
          var(--ticker-navy-light),
          transparent
        );
      }

      #${TICKER_ID} .lsffl-ticker-window::after {
        right: 0;
        background: linear-gradient(
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
        padding-left: 45px;
        animation: lsfflTickerScroll 48s linear infinite;
        will-change: transform;
      }

      #${TICKER_ID}:hover .lsffl-ticker-track,
      #${TICKER_ID}:focus-within .lsffl-ticker-track {
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
        min-height: 48px;
        color: var(--ticker-white);
        font-size: 13px;
        font-weight: 600;
        line-height: 1.2;
        white-space: nowrap;
      }

      #${TICKER_ID} .lsffl-ticker-category {
        display: inline-flex;
        align-items: center;
        min-height: 25px;
        margin-right: 10px;
        padding: 5px 9px;
        border: 1px solid rgba(212, 175, 55, 0.82);
        background: rgba(212, 175, 55, 0.12);
        color: var(--ticker-gold);
        font-size: 10px;
        font-weight: 900;
        line-height: 1;
        letter-spacing: 0.07em;
        text-transform: uppercase;
      }

      #${TICKER_ID} .lsffl-ticker-text {
        color: var(--ticker-white);
      }

      #${TICKER_ID} .lsffl-ticker-separator {
        display: inline-block;
        margin: 0 25px;
        color: var(--ticker-gold);
        font-size: 10px;
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
          min-height: 47px;
        }

        #${TICKER_ID} .lsffl-ticker-brand {
          gap: 6px;
          padding: 6px 8px;
        }

        #${TICKER_ID} .lsffl-ticker-logo {
          width: 31px;
          height: 31px;
          flex-basis: 31px;
        }

        #${TICKER_ID} .lsffl-ticker-brand-text {
          font-size: 10px;
        }

        #${TICKER_ID} .lsffl-ticker-brand-text span {
          font-size: 6px;
        }

        #${TICKER_ID} .lsffl-ticker-item {
          min-height: 43px;
          font-size: 11px;
        }

        #${TICKER_ID} .lsffl-ticker-category {
          min-height: 22px;
          margin-right: 8px;
          padding: 4px 7px;
          font-size: 8px;
        }

        #${TICKER_ID} .lsffl-ticker-separator {
          margin: 0 18px;
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

  function findInsertionPoint() {
    return (
      document.getElementById('container-wrap') ||
      document.getElementById('MFLMainContent') ||
      document.querySelector('.pagebody') ||
      document.querySelector('main')
    );
  }

  function buildTicker() {
    if (document.getElementById(TICKER_ID)) {
      return true;
    }

    const insertionPoint = findInsertionPoint();

    if (!insertionPoint || !insertionPoint.parentNode) {
      return false;
    }

    addTickerStyles();

    const ticker = document.createElement('section');
    ticker.id = TICKER_ID;
    ticker.setAttribute('aria-label', 'LSFFL league news ticker');

    const brand = document.createElement('div');
    brand.className = 'lsffl-ticker-brand';

    const logo = document.createElement('img');
    logo.className = 'lsffl-ticker-logo';
    logo.src =
      'https://edmoak.github.io/LSFFL-Webpage/images/logos/lsffl-logo-v1.png';
    logo.alt = 'LSFFL';

    const brandText = document.createElement('div');
    brandText.className = 'lsffl-ticker-brand-text';
    brandText.innerHTML = 'LSFFL Wire<span>League Updates</span>';

    brand.appendChild(logo);
    brand.appendChild(brandText);

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

    ticker.appendChild(brand);
    ticker.appendChild(tickerWindow);

    insertionPoint.parentNode.insertBefore(ticker, insertionPoint);

    console.log('LSFFL custom ticker loaded.');
    return true;
  }

  function startTicker() {
    if (buildTicker()) {
      return;
    }

    let attempts = 0;

    const retry = window.setInterval(function () {
      attempts += 1;

      if (buildTicker() || attempts >= 30) {
        window.clearInterval(retry);
      }

      if (
        attempts >= 30 &&
        !document.getElementById(TICKER_ID)
      ) {
        console.warn(
          'LSFFL ticker could not find an MFL content insertion point.'
        );
      }
    }, 300);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startTicker);
  } else {
    startTicker();
  }
})();
