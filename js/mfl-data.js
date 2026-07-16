/* =========================================================
   LSFFL LIVE MFL DATA
   League: 46007
   Season: 2026
========================================================= */

const MFL_SEASON = "2026";
const MFL_LEAGUE_ID = "46007";
const MFL_LEAGUE_URL = "data/league.json";

/* =========================================================
   FETCH LEAGUE DATA
========================================================= */

async function fetchMflLeagueData() {
  const response = await fetch(`${MFL_LEAGUE_URL}?_=${Date.now()}`, {
    method: "GET",
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(
      `Local MFL data request failed with status ${response.status}`
    );
  }

  return response.json();
}

/* =========================================================
   NORMALIZE FRANCHISE DATA
========================================================= */

function getFranchises(data) {
  const franchises = data?.league?.franchises?.franchise;

  if (!franchises) {
    return [];
  }

  return Array.isArray(franchises)
    ? franchises
    : [franchises];
}

/* =========================================================
   ESCAPE TEXT FOR SAFE HTML
========================================================= */

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* =========================================================
   CREATE ONE FRANCHISE CARD
========================================================= */

function createFranchiseCard(franchise) {
  const name = escapeHtml(franchise.name || "Unknown Franchise");
  const owner = escapeHtml(franchise.owner_name || "Owner unavailable");
  const division = escapeHtml(franchise.division || "");
  const logo = franchise.logo || franchise.icon || "";

  const logoMarkup = logo
    ? `
      <img
        class="mfl-franchise-logo"
        src="${escapeHtml(logo)}"
        alt="${name} logo"
        loading="lazy"
      >
    `
    : `
      <div class="mfl-franchise-logo-placeholder">
        LSFFL
      </div>
    `;

  return `
    <article class="mfl-franchise-card">
      <div class="mfl-franchise-logo-wrap">
        ${logoMarkup}
      </div>

      <div class="mfl-franchise-info">
        <h3>${name}</h3>
        <p class="mfl-franchise-owner">${owner}</p>
        <p class="mfl-franchise-division">
          Division ${division}
        </p>
      </div>
    </article>
  `;
}

/* =========================================================
   RENDER FRANCHISES
========================================================= */

function renderFranchises(franchises) {
  const container = document.getElementById("mfl-franchise-grid");

  if (!container) {
    console.warn(
      'MFL data loaded, but no element with id="mfl-franchise-grid" was found.'
    );
    return;
  }

  if (franchises.length === 0) {
    container.innerHTML = `
      <p class="mfl-data-message">
        No franchise data was returned by MFL.
      </p>
    `;
    return;
  }

  const sortedFranchises = [...franchises].sort((a, b) => {
    return String(a.name || "").localeCompare(String(b.name || ""));
  });

  container.innerHTML = sortedFranchises
    .map(createFranchiseCard)
    .join("");
}

/* =========================================================
   SHOW ERROR
========================================================= */

function renderMflError(error) {
  console.error("Unable to load MFL league data:", error);

  const container = document.getElementById("mfl-franchise-grid");

  if (!container) {
    return;
  }

  container.innerHTML = `
    <p class="mfl-data-message mfl-data-error">
      Live league data could not be loaded right now.
    </p>
  `;
}

/* =========================================================
   INITIALIZE
========================================================= */

async function initializeMflData() {
  try {
    const data = await fetchMflLeagueData();
    const franchises = getFranchises(data);

    console.log("MFL league data loaded:", data);
    console.log("MFL franchises loaded:", franchises);

    renderFranchises(franchises);
  } catch (error) {
    renderMflError(error);
  }
}

document.addEventListener("DOMContentLoaded", initializeMflData);
