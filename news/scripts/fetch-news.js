/**
 * LSFFL Fantasy Football News Builder
 * File location: news/scripts/fetch-news.js
 *
 * Runs in GitHub Actions with Node.js 20+.
 * Downloads fantasy-football headlines, cleans and deduplicates them,
 * then writes:
 *
 *   news/data/fantasy-news.json
 *
 * No API key and no npm package are required.
 */

"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");

const OUTPUT_FILE = path.resolve(
  process.cwd(),
  "news",
  "data",
  "fantasy-news.json"
);

const MAX_ARTICLES = 30;
const MAX_AGE_DAYS = 7;

/*
 * Multiple focused searches provide better coverage than one broad query.
 * Google News supports standard search operators inside its RSS searches.
 */
const SEARCHES = [
  {
    name: "Fantasy Football",
    query:
      '"fantasy football" ' +
      "(injury OR injuries OR waiver OR rankings OR sleeper OR breakout) " +
      "when:7d -soccer"
  },
  {
    name: "NFL Player News",
    query:
      '"NFL fantasy" ' +
      "(injury OR practice OR depth chart OR transaction OR suspension) " +
      "when:7d"
  },
  {
    name: "Draft Advice",
    query:
      '"fantasy football" ' +
      "(draft OR ADP OR rankings OR rookies OR sleepers) " +
      "when:7d"
  }
];

const BLOCKED_TERMS = [
  "soccer",
  "premier league",
  "fantasy baseball",
  "fantasy basketball",
  "fantasy hockey",
  "daily fantasy golf"
];

function buildFeedUrl(query) {
  return (
    "https://news.google.com/rss/search?q=" +
    encodeURIComponent(query) +
    "&hl=en-US&gl=US&ceid=US:en"
  );
}

function decodeXml(value = "") {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, number) =>
      String.fromCodePoint(Number(number))
    )
    .trim();
}

function stripTags(value = "") {
  return decodeXml(value.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function getTag(block, tagName) {
  const expression = new RegExp(
    `<${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tagName}>`,
    "i"
  );

  const match = block.match(expression);
  return match ? decodeXml(match[1]) : "";
}

function splitGoogleTitle(rawTitle) {
  const title = stripTags(rawTitle);
  const pieces = title.split(" - ");

  if (pieces.length < 2) {
    return {
      headline: title,
      source: "Fantasy Football News"
    };
  }

  const source = pieces.pop().trim();

  return {
    headline: pieces.join(" - ").trim(),
    source
  };
}

function normalizeHeadline(value = "") {
  return value
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function categoryFor(headline) {
  const text = headline.toLowerCase();

  if (
    /\binjur|\bout\b|\bir\b|questionable|doubtful|practice status/.test(text)
  ) {
    return "Injury";
  }

  if (
    /waiver|free agent|pickup|add\b|drop\b/.test(text)
  ) {
    return "Waivers";
  }

  if (
    /trade|signs?|signed|release|released|waived|transaction|suspension/.test(text)
  ) {
    return "Moves";
  }

  if (
    /rankings?|projection|start.?sit|breakout|bust|sleeper|adp/.test(text)
  ) {
    return "Advice";
  }

  if (
    /draft|rookie|combine|training camp|depth chart/.test(text)
  ) {
    return "Draft";
  }

  return "News";
}

function isRelevant(headline) {
  const lower = headline.toLowerCase();

  if (!headline || headline.length < 18) {
    return false;
  }

  if (BLOCKED_TERMS.some((term) => lower.includes(term))) {
    return false;
  }

  return (
    lower.includes("fantasy") ||
    /\bnfl\b/.test(lower) ||
    /quarterback|running back|wide receiver|tight end|waiver|adp/.test(lower)
  );
}

function isRecent(dateValue) {
  const timestamp = Date.parse(dateValue);

  if (!Number.isFinite(timestamp)) {
    return true;
  }

  const ageMilliseconds = Date.now() - timestamp;
  return ageMilliseconds <= MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
}

function parseFeed(xml, feedName) {
  const itemBlocks = xml.match(/<item\b[\s\S]*?<\/item>/gi) || [];

  return itemBlocks
    .map((itemBlock) => {
      const titleParts = splitGoogleTitle(getTag(itemBlock, "title"));
      const published = getTag(itemBlock, "pubDate");
      const link = stripTags(getTag(itemBlock, "link"));
      const description = stripTags(getTag(itemBlock, "description"));

      return {
        headline: titleParts.headline,
        source: titleParts.source,
        category: categoryFor(titleParts.headline),
        published,
        publishedIso: Number.isFinite(Date.parse(published))
          ? new Date(published).toISOString()
          : null,
        url: link,
        description,
        feed: feedName
      };
    })
    .filter((article) =>
      article.url &&
      isRelevant(article.headline) &&
      isRecent(article.published)
    );
}

async function fetchText(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "LSFFL-News-Builder/1.0 (+https://edmoak.github.io/LSFFL-Webpage/)",
        "Accept":
          "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8"
      },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

async function loadSearch(search) {
  const url = buildFeedUrl(search.query);
  const xml = await fetchText(url);
  const articles = parseFeed(xml, search.name);

  console.log(
    `${search.name}: ${articles.length} usable article(s)`
  );

  return articles;
}

function deduplicate(articles) {
  const seen = new Set();

  return articles.filter((article) => {
    const key = normalizeHeadline(article.headline);

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

async function writeOutput(articles, searchResults) {
  const payload = {
    generatedAt: new Date().toISOString(),
    articleCount: articles.length,
    refreshMinutes: 60,
    sourceMethod: "Google News RSS",
    feeds: searchResults.map((result) => ({
      name: result.name,
      status: result.status,
      articleCount: result.articleCount,
      error: result.error || null
    })),
    articles
  };

  await fs.mkdir(path.dirname(OUTPUT_FILE), {
    recursive: true
  });

  await fs.writeFile(
    OUTPUT_FILE,
    JSON.stringify(payload, null, 2) + "\n",
    "utf8"
  );

  console.log(`Wrote ${articles.length} article(s) to:`);
  console.log(OUTPUT_FILE);
}

async function main() {
  const settled = await Promise.allSettled(
    SEARCHES.map((search) => loadSearch(search))
  );

  const allArticles = [];
  const searchResults = [];

  settled.forEach((result, index) => {
    const search = SEARCHES[index];

    if (result.status === "fulfilled") {
      allArticles.push(...result.value);
      searchResults.push({
        name: search.name,
        status: "ok",
        articleCount: result.value.length
      });
      return;
    }

    const errorMessage =
      result.reason instanceof Error
        ? result.reason.message
        : String(result.reason);

    console.error(`${search.name} failed: ${errorMessage}`);

    searchResults.push({
      name: search.name,
      status: "error",
      articleCount: 0,
      error: errorMessage
    });
  });

  const articles = deduplicate(allArticles)
    .sort((a, b) => {
      const dateA = Date.parse(a.published) || 0;
      const dateB = Date.parse(b.published) || 0;
      return dateB - dateA;
    })
    .slice(0, MAX_ARTICLES);

  /*
   * Do not overwrite a previously working JSON file with an empty feed.
   * A failed Action run is preferable to publishing an empty news module.
   */
  if (articles.length === 0) {
    throw new Error(
      "No usable articles were returned. Existing news JSON was preserved."
    );
  }

  await writeOutput(articles, searchResults);
}

main().catch((error) => {
  console.error("LSFFL news build failed:");
  console.error(error);
  process.exitCode = 1;
});
