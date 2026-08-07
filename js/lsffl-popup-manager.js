/*
 * LSFFL POPUP MANAGER — POP-UP 3.1 CLEAN
 * File: js/lsffl-popup-manager.js
 * League: 23135 / 2026
 *
 * Owns only:
 * - MFL Commissioner Articles
 * - MFL Message Board topics
 * - MFL Franchise pages
 * - Homepage Welcome / Announcement Center
 * - Header utility browser popups
 *
 * It intentionally does NOT intercept GitHub pages such as Standings,
 * Hall of Fame, Retired Franchises, History, etc.
 */
(function () {
  "use strict";

  if (window.top !== window.self) return;

  var LEAGUE_ID = "23135";
  var YEAR = "2026";
  var MFL_ORIGIN = "https://www48.myfantasyleague.com";

  var modal = null;
  var modalFrame = null;
  var modalTitle = null;
  var modalClose = null;
  var modalType = "content";
  var previousFocus = null;
  var nativeWindowOpen = window.open.bind(window);

  var ANNOUNCEMENT_SESSION_KEY = "lsffl-popup31-auto-shown-2026-23135";
  var ANNOUNCEMENT_DISMISS_KEY = "lsffl-popup31-dismissed-until";

  function absoluteUrl(value, base) {
    try {
      return new URL(value, base || window.location.href);
    } catch (error) {
      return null;
    }
  }

  function normalizeFranchiseId(value) {
    var digits = String(value || "").replace(/\D/g, "");
    return digits ? digits.padStart(4, "0").slice(-4) : "";
  }

  function isMfl2026(url) {
    return Boolean(
      url &&
      /myfantasyleague\.com$/i.test(url.hostname) &&
      url.pathname.indexOf("/" + YEAR + "/") !== -1
    );
  }

  function classifyMflUrl(value) {
    var url = absoluteUrl(value);
    if (!isMfl2026(url)) return null;

    var option = String(url.searchParams.get("O") || "").replace(/^0+/, "");
    var franchiseId = normalizeFranchiseId(url.searchParams.get("F"));

    if (franchiseId && /\/options\/?$/i.test(url.pathname)) {
      return {
        type: "franchise",
        title: "Franchise Center",
        url: url.href
      };
    }

    if (/\/options\/?$/i.test(url.pathname) && option === "73") {
      return {
        type: "article",
        title: "League Article",
        url: url.href
      };
    }

    if (
      (/\/options\/?$/i.test(url.pathname) && option === "28") ||
      /\/mb\/(?:board_show|topic_show)\.pl$/i.test(url.pathname)
    ) {
      return {
        type: "message",
        title: "League Message Board",
        url: url.href
      };
    }

    return null;
  }

  function injectModalStyles() {
    if (document.getElementById("lsffl-popup31-modal-styles")) return;

    var style = document.createElement("style");
    style.id = "lsffl-popup31-modal-styles";

    style.textContent = [
      "body.lsffl-popup31-open{overflow:hidden!important;}",
      "#lsffl-popup31-modal[hidden]{display:none!important;}",
      "#lsffl-popup31-modal{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(0,7,18,.86);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);}",
      "#lsffl-popup31-dialog{width:min(1180px,96vw);height:min(850px,94vh);display:flex;flex-direction:column;overflow:hidden;border:2px solid #c9a227;border-radius:11px;background:#061426;box-shadow:0 22px 70px rgba(0,0,0,.72);}",
      "#lsffl-popup31-bar{min-height:48px;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:8px 10px 8px 15px;border-bottom:2px solid #c9a227;background:linear-gradient(180deg,#123755 0%,#071a2f 100%);}",
      "#lsffl-popup31-title{min-width:0;overflow:hidden;color:#fff;font-family:'Barlow Condensed','Roboto Condensed','Arial Narrow',Arial,sans-serif;font-size:18px;line-height:22px;font-weight:800;letter-spacing:.65px;text-overflow:ellipsis;text-transform:uppercase;white-space:nowrap;}",
      "#lsffl-popup31-close{width:34px!important;min-width:34px!important;height:34px!important;padding:0!important;display:grid!important;place-items:center!important;border:1px solid #e1c45a!important;border-radius:6px!important;background:#061426!important;color:#fff!important;font:400 26px/26px Arial,sans-serif!important;cursor:pointer!important;}",
      "#lsffl-popup31-close:hover{background:#c9a227!important;color:#061426!important;}",
      "#lsffl-popup31-frame{width:100%;height:100%;flex:1 1 auto;border:0;background:#061426;opacity:0;transition:opacity .12s ease;}",
      "@media(max-width:700px){#lsffl-popup31-modal{padding:7px;}#lsffl-popup31-dialog{width:100%;height:96vh;border-radius:8px;}#lsffl-popup31-title{font-size:16px;}}"
    ].join("");

    document.head.appendChild(style);
  }

  function createModal() {
    if (modal) return;

    injectModalStyles();

    modal = document.createElement("div");
    modal.id = "lsffl-popup31-modal";
    modal.hidden = true;
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");

    var dialog = document.createElement("div");
    dialog.id = "lsffl-popup31-dialog";

    var bar = document.createElement("div");
    bar.id = "lsffl-popup31-bar";

    modalTitle = document.createElement("div");
    modalTitle.id = "lsffl-popup31-title";
    modalTitle.textContent = "LSFFL";

    modalClose = document.createElement("button");
    modalClose.id = "lsffl-popup31-close";
    modalClose.type = "button";
    modalClose.setAttribute("aria-label", "Close popup");
    modalClose.textContent = "×";

    modalFrame = document.createElement("iframe");
    modalFrame.id = "lsffl-popup31-frame";
    modalFrame.title = "LSFFL content";
    modalFrame.setAttribute("loading", "eager");

    bar.appendChild(modalTitle);
    bar.appendChild(modalClose);

    dialog.appendChild(bar);
    dialog.appendChild(modalFrame);

    modal.appendChild(dialog);
    document.body.appendChild(modal);

    modalClose.addEventListener("click", closeModal);

    modal.addEventListener("click", function (event) {
      if (event.target === modal) {
        closeModal();
      }
    });

    modalFrame.addEventListener("load", function () {
      cleanModalPage();

      window.setTimeout(cleanModalPage, 100);
      window.setTimeout(cleanModalPage, 350);
      window.setTimeout(cleanModalPage, 800);

      window.setTimeout(function () {
        if (modalFrame) {
          modalFrame.style.opacity = "1";
        }
      }, 700);
    });
  }

  function hideElement(element) {
    if (!element) return;

    element.style.setProperty("display", "none", "important");
    element.style.setProperty("visibility", "hidden", "important");
  }

  function hideMflChrome(doc) {
    [
      ".myfantasyleague_menu",
      ".banner-container",
      "#header",
      "#pageheader",
      "#MFLHeader",
      ".pageheader",
      ".header-wrapper",
      ".lsffl-header",
      ".ticker-wrapper",
      ".lsffl-ticker-wrapper",
      "#MFLBoxWrapper",
      ".MFLSkinSelection",
      "#menu-trigger",
      "#menu-overlay",
      "#click-blocker",
      "#myfantasyleague_mobile_menu",
      ".mobile-menu",
      ".mobile_menu",
      ".mobilemenu",
      ".mfl-mobile-menu",
      "#footer",
      ".footer",
      ".pagefooter",
      "#pagefooter"
    ].forEach(function (selector) {
      Array.prototype.forEach.call(
        doc.querySelectorAll(selector),
        hideElement
      );
    });
  }

  function injectFrameTheme(doc) {
    if (doc.getElementById("lsffl-popup31-frame-style")) return;

    var style = doc.createElement("style");
    style.id = "lsffl-popup31-frame-style";

    style.textContent = [
      "html.lsffl-popup31-doc,html.lsffl-popup31-doc body{margin:0!important;padding:0!important;min-height:100%!important;background:#061426!important;background-image:url('https://github.com/edmoak/LSFFL-Webpage/blob/main/images/backgrounds/lsfflbackground.png?raw=true')!important;background-position:center top!important;background-size:cover!important;background-attachment:fixed!important;color:#fff!important;overflow-x:hidden!important;}",
      "html.lsffl-popup31-doc body{padding:10px!important;box-sizing:border-box!important;}",
      "html.lsffl-popup31-doc #container-wrap,html.lsffl-popup31-doc .pagebody,html.lsffl-popup31-doc .report,html.lsffl-popup31-doc .module{max-width:100%!important;width:100%!important;margin:0 auto!important;box-sizing:border-box!important;}",
      "html.lsffl-popup31-doc img{max-width:100%!important;height:auto!important;}",
      "html.lsffl-popup31-doc body.lsffl-popup31-franchise img.lsffl-popup31-team-logo{display:block!important;width:auto!important;height:auto!important;max-width:min(612px,75%)!important;max-height:374px!important;margin:10px auto 18px!important;object-fit:contain!important;}",
      "html.lsffl-popup31-doc .lsffl-popup31-team-brand{width:min(700px,92%)!important;margin:18px auto 0!important;text-align:center!important;}",
      "html.lsffl-popup31-doc .lsffl-popup31-team-name{color:#fff!important;font-family:'Oswald','Barlow Condensed','Arial Narrow',Arial,sans-serif!important;font-size:clamp(28px,4vw,42px)!important;line-height:1.05!important;font-weight:800!important;letter-spacing:1.2px!important;text-transform:uppercase!important;text-shadow:0 3px 8px rgba(0,0,0,.55)!important;}",
      "html.lsffl-popup31-doc .lsffl-popup31-team-line{width:130px!important;height:3px!important;margin:10px auto 0!important;background:linear-gradient(90deg,transparent,#c9a227,#e1c45a,#c9a227,transparent)!important;}"
    ].join("");

    doc.head.appendChild(style);
  }

  function getFranchiseName(doc) {
    var text = String(
      (doc.body &&
        (doc.body.innerText || doc.body.textContent)) ||
        ""
    )
      .replace(/\s+/g, " ")
      .trim();

    var match = text.match(
      /(?:^|\s)([A-Za-z0-9][A-Za-z0-9'’&. \/_-]{1,45}?):\s*Main\b/i
    );

    if (match && match[1]) {
      return match[1]
        .replace(/\s+/g, " ")
        .trim();
    }

    return "";
  }

  function decorateFranchise(doc) {
    if (
      modalType !== "franchise" ||
      !doc.body
    ) {
      return;
    }

    doc.body.classList.add(
      "lsffl-popup31-franchise"
    );

    var name =
      getFranchiseName(doc);

    var images =
      Array.prototype.slice.call(
        doc.querySelectorAll("img")
      );

    images.forEach(function (img) {
      var nw =
        img.naturalWidth || 0;

      var nh =
        img.naturalHeight || 0;

      var rw =
        img.getBoundingClientRect().width ||
        0;

      var rh =
        img.getBoundingClientRect().height ||
        0;

      if (
        nw >= 500 ||
        nh >= 350 ||
        rw >= 500 ||
        rh >= 350
      ) {
        img.classList.add(
          "lsffl-popup31-team-logo"
        );
      }
    });

    var logo =
      doc.querySelector(
        "img.lsffl-popup31-team-logo"
      );

    if (
      !logo ||
      !name ||
      logo.dataset.lsfflPopup31Branded === "1"
    ) {
      return;
    }

    logo.dataset.lsfflPopup31Branded =
      "1";

    var brand =
      doc.createElement("div");

    brand.className =
      "lsffl-popup31-team-brand";

    var nameEl =
      doc.createElement("div");

    nameEl.className =
      "lsffl-popup31-team-name";

    nameEl.textContent =
      name;

    var line =
      doc.createElement("div");

    line.className =
      "lsffl-popup31-team-line";

    brand.appendChild(nameEl);
    brand.appendChild(line);

    if (logo.parentNode) {
      logo.parentNode.insertBefore(
        brand,
        logo
      );
    }
  }

  function findReadMessageTarget(
    doc,
    baseHref,
    depth
  ) {
    depth =
      depth || 0;

    if (
      !doc ||
      depth > 4
    ) {
      return null;
    }

    var links =
      Array.prototype.slice.call(
        doc.querySelectorAll(
          "a[href]"
        )
      );

    for (
      var i = 0;
      i < links.length;
      i += 1
    ) {
      var link =
        links[i];

      var url =
        absoluteUrl(
          link.getAttribute("href"),
          baseHref
        );

      if (
        !url ||
        !/\/mb\/topic_show\.pl$/i.test(
          url.pathname
        ) ||
        !url.searchParams.get("pid")
      ) {
        continue;
      }

      var label =
        String(
          link.textContent ||
          link.getAttribute("title") ||
          link.getAttribute("aria-label") ||
          ""
        )
          .replace(/\s+/g, " ")
          .trim();

      if (
        /read message/i.test(label) ||
        link.querySelector("img")
      ) {
        return {
          link: link,
          url: url
        };
      }
    }

    var frames =
      Array.prototype.slice.call(
        doc.querySelectorAll(
          "iframe,frame"
        )
      );

    for (
      var j = 0;
      j < frames.length;
      j += 1
    ) {
      try {
        var nestedDoc =
          frames[j].contentDocument;

        var nestedWin =
          frames[j].contentWindow;

        if (
          !nestedDoc ||
          !nestedWin
        ) {
          continue;
        }

        var found =
          findReadMessageTarget(
            nestedDoc,
            nestedWin.location.href,
            depth + 1
          );

        if (found) {
          return found;
        }
      } catch (error) {}
    }

    return null;
  }

  function bypassMessageGate(
    doc,
    win
  ) {
    if (
      modalType !== "message"
    ) {
      return false;
    }

    var target =
      findReadMessageTarget(
        doc,
        win.location.href,
        0
      );

    if (!target) {
      return false;
    }

    if (
      doc.documentElement.dataset
        .lsfflPopup31Gate === "1"
    ) {
      return true;
    }

    doc.documentElement.dataset
      .lsfflPopup31Gate = "1";

    window.setTimeout(
      function () {
        try {
          target.link.click();
        } catch (error) {
          win.location.href =
            target.url.href;
        }
      },
      60
    );

    window.setTimeout(
      function () {
        try {
          if (
            findReadMessageTarget(
              doc,
              win.location.href,
              0
            )
          ) {
            win.location.href =
              target.url.href;
          }
        } catch (error) {}
      },
      500
    );

    return true;
  }

  function cleanModalPage() {
    if (
      !modalFrame ||
      !modalFrame.contentDocument ||
      !modalFrame.contentWindow
    ) {
      return;
    }

    try {
      var doc =
        modalFrame.contentDocument;

      var win =
        modalFrame.contentWindow;

      if (
        !doc ||
        !doc.documentElement ||
        !doc.body
      ) {
        return;
      }

      if (
        bypassMessageGate(
          doc,
          win
        )
      ) {
        return;
      }

      doc.documentElement.classList.add(
        "lsffl-popup31-doc"
      );

      doc.body.classList.add(
        "lsffl-popup31-doc"
      );

      injectFrameTheme(doc);
      hideMflChrome(doc);
      decorateFranchise(doc);

      modalFrame.style.opacity =
        "1";
    } catch (error) {
      modalFrame.style.opacity =
        "1";
    }
  }

  function openModal(
    url,
    type,
    title
  ) {
    createModal();

    previousFocus =
      document.activeElement;

    modalType =
      type || "content";

    modalTitle.textContent =
      title || "LSFFL";

    modalFrame.style.opacity =
      "0";

    modalFrame.src =
      url;

    modal.hidden =
      false;

    document.body.classList.add(
      "lsffl-popup31-open"
    );

    window.setTimeout(
      function () {
        if (modalClose) {
          modalClose.focus();
        }
      },
      0
    );

    return true;
  }

  function closeModal() {
    if (
      !modal ||
      modal.hidden
    ) {
      return;
    }

    modal.hidden =
      true;

    modalFrame.src =
      "about:blank";

    document.body.classList.remove(
      "lsffl-popup31-open"
    );

    if (
      previousFocus &&
      typeof previousFocus.focus ===
        "function"
    ) {
      previousFocus.focus();
    }
  }

  function openFranchise(
    franchiseId
  ) {
    var id =
      normalizeFranchiseId(
        franchiseId
      );

    if (!id) {
      return false;
    }

    return openModal(
      MFL_ORIGIN +
        "/" +
        YEAR +
        "/options?L=" +
        LEAGUE_ID +
        "&F=" +
        encodeURIComponent(id) +
        "&O=01",
      "franchise",
      "Franchise Center"
    );
  }

  document.addEventListener(
    "click",
    function (event) {
      var link =
        event.target.closest(
          "a[href]"
        );

      if (
        !link ||
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey ||
        link.hasAttribute(
          "download"
        )
      ) {
        return;
      }

      var match =
        classifyMflUrl(
          link.href
        );

      if (!match) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      openModal(
        match.url,
        match.type,
        match.title
      );
    },
    true
  );

  window.addEventListener(
    "message",
    function (event) {
      var data =
        event.data;

      if (
        !data ||
        data.type !==
          "LSFFL_OPEN_FRANCHISE"
      ) {
        return;
      }

      openFranchise(
        data.franchiseId
      );
    }
  );

  document.addEventListener(
    "click",
    function (event) {
      var trigger =
        event.target.closest(
          "[data-mfl-franchise]"
        );

      if (!trigger) {
        return;
      }

      var id =
        normalizeFranchiseId(
          trigger.getAttribute(
            "data-mfl-franchise"
          )
        );

      if (!id) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      openFranchise(id);
    },
    true
  );

  document.addEventListener(
    "keydown",
    function (event) {
      if (
        event.key === "Escape" &&
        modal &&
        !modal.hidden
      ) {
        closeModal();
      }
    }
  );

  window.lsfflOpenContentPopup =
    function (url, title) {
      var match =
        classifyMflUrl(
          url
        );

      if (!match) {
        return false;
      }

      return openModal(
        match.url,
        match.type,
        title || match.title
      );
    };

  window.lsfflOpenFranchisePopup =
    openFranchise;

  window.lsfflCloseContentPopup =
    closeModal;

  /* ---------- Announcement Center ---------- */

  var announcementModal =
    null;

  var announcementItems =
    [];

  var announcementIndex =
    0;

  function isHomepage() {
    var path =
      String(
        window.location.pathname ||
        ""
      );

    var query =
      new URLSearchParams(
        window.location.search ||
        ""
      );

    return (
      /\/2026\/home\/23135\/?$/i.test(
        path
      ) ||
      (
        /\/2026\/home\/?$/i.test(
          path
        ) &&
        query.get("L") ===
          LEAGUE_ID
      )
    );
  }

  function cleanText(value) {
    return String(
      value || ""
    )
      .replace(/\s+/g, " ")
      .trim();
  }

  function findSourceTable(
    id,
    moduleSelector
  ) {
    return (
      document.querySelector(
        moduleSelector +
          " table#" +
          id +
          "," +
          moduleSelector +
          " table"
      ) ||
      document.querySelector(
        "table#" + id
      )
    );
  }

  function firstUsableRow(
    table
  ) {
    if (!table) {
      return null;
    }

    var rows =
      Array.prototype.slice.call(
        table.querySelectorAll(
          "tr"
        )
      );

    for (
      var i = 0;
      i < rows.length;
      i += 1
    ) {
      var row =
        rows[i];

      var text =
        cleanText(
          row.textContent
        );

      if (!text) {
        continue;
      }

      if (
        /view all articles|write new article|post new topic|new messages|view message board/i.test(
          text
        )
      ) {
        continue;
      }

      if (
        row.querySelector("th") &&
        !row.querySelector("td")
      ) {
        continue;
      }

      if (
        row.querySelector(
          "a[href]"
        )
      ) {
        return row;
      }
    }

    return null;
  }

  function extractArticleAnnouncement() {
    var row =
      firstUsableRow(
        findSourceTable(
          "article_summary",
          ".lsffl-article-module"
        )
      );

    if (!row) {
      return null;
    }

    var link =
      row.querySelector(
        "a[href]"
      );

    var cells =
      row.querySelectorAll(
        "td"
      );

    var url =
      link
        ? absoluteUrl(
            link.getAttribute(
              "href"
            ),
            window.location.href
          )
        : null;

    return {
      eyebrow:
        "COMMISSIONER ARTICLE",

      title:
        cleanText(
          link
            ? link.textContent
            : row.textContent
        ) ||
        "Commissioner Article",

      body:
        "A Commissioner Article is available in League Central.",

      meta:
        cells.length
          ? cleanText(
              cells[
                cells.length - 1
              ].textContent
            )
          : "",

      buttonText:
        "Open Full Article",

      buttonUrl:
        url
          ? url.href
          : ""
    };
  }

  function extractMessageAnnouncement() {
    var row =
      firstUsableRow(
        findSourceTable(
          "message_board_summary",
          ".lsffl-message-board-module"
        )
      );

    if (!row) {
      return null;
    }

    var link =
      row.querySelector(
        "a[href]"
      );

    var url =
      link
        ? absoluteUrl(
            link.getAttribute(
              "href"
            ),
            window.location.href
          )
        : null;

    return {
      eyebrow:
        "MESSAGE BOARD",

      title:
        cleanText(
          link
            ? link.textContent
            : row.textContent
        ) ||
        "Message Board",

      body:
        "There is an LSFFL message-board topic available to read.",

      meta:
        "",

      buttonText:
        "Open Full Message",

      buttonUrl:
        url
          ? url.href
          : ""
    };
  }

  function loadAnnouncementItems() {
    var items = [
      {
        eyebrow:
          "COMMISSIONER'S DESK",

        title:
          "Welcome to the 2026 LSFFL Season",

        body:
          "The Lamad Squad Fantasy Football League is back. Check Navy Times and League Central throughout the season for commissioner updates, league news, message-board activity, and everything happening around the LSFFL.",

        meta:
          "A Tradition Born Across the Sea",

        buttonText:
          "",

        buttonUrl:
          ""
      }
    ];

    var article =
      extractArticleAnnouncement();

    var message =
      extractMessageAnnouncement();

    if (article) {
      items.push(
        article
      );
    }

    if (message) {
      items.push(
        message
      );
    }

    return items;
  }

  function injectAnnouncementStyles() {
    if (
      document.getElementById(
        "lsffl-popup31-announcement-styles"
      )
    ) {
      return;
    }

    var style =
      document.createElement(
        "style"
      );

    style.id =
      "lsffl-popup31-announcement-styles";

    style.textContent = [
      "#lsffl-popup31-announcement[hidden]{display:none!important;}",
      "#lsffl-popup31-announcement{position:fixed;inset:0;z-index:2147483100;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(0,7,18,.88);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);}",
      "#lsffl-popup31-announcement-card{width:min(760px,96vw);max-height:94vh;overflow:auto;border:2px solid #c9a227;border-radius:14px;background:linear-gradient(180deg,#0c2846 0%,#061426 52%,#02091a 100%);color:#fff;box-shadow:0 24px 90px rgba(0,0,0,.78);}",
      "#lsffl-popup31-announcement-head{display:flex;justify-content:space-between;gap:16px;padding:22px 22px 8px;border-top:6px solid #c9a227;}",
      "#lsffl-popup31-announcement-eyebrow{margin-bottom:5px;color:#e1c45a;font-family:'Barlow Condensed',Arial,sans-serif;font-size:13px;font-weight:900;letter-spacing:1.7px;text-transform:uppercase;}",
      "#lsffl-popup31-announcement-title{margin:0;color:#fff;font-family:'Oswald','Barlow Condensed',Arial,sans-serif;font-size:clamp(25px,4vw,36px);line-height:1.03;font-weight:900;text-transform:uppercase;}",
      "#lsffl-popup31-announcement-close{width:38px!important;min-width:38px!important;height:38px!important;padding:0!important;border:1px solid #e1c45a!important;border-radius:8px!important;background:#061426!important;color:#fff!important;font:400 28px/1 Arial,sans-serif!important;cursor:pointer!important;}",
      "#lsffl-popup31-announcement-body{padding:12px 22px 8px;color:#eef4fb;font-family:Arial,sans-serif;font-size:17px;line-height:1.58;}",
      "#lsffl-popup31-announcement-meta{margin-top:12px;color:#aebdcd;font-size:13px;font-weight:700;}",
      "#lsffl-popup31-announcement-actions{display:flex;padding:14px 22px 12px;}",
      "#lsffl-popup31-announcement-open{display:none;align-items:center;justify-content:center;min-height:42px;padding:9px 18px;border:1px solid #e1c45a;border-radius:8px;background:#c9a227;color:#061426!important;text-decoration:none!important;font-family:'Barlow Condensed',Arial,sans-serif;font-size:16px;font-weight:900;text-transform:uppercase;}",
      "#lsffl-popup31-announcement-nav{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 22px;border-top:1px solid rgba(201,162,39,.3);background:rgba(0,0,0,.18);}",
      ".lsffl-popup31-announcement-navbtn{min-width:86px!important;min-height:36px!important;padding:7px 12px!important;border:1px solid #c9a227!important;border-radius:7px!important;background:#071a2f!important;color:#fff!important;font-family:'Barlow Condensed',Arial,sans-serif!important;font-size:14px!important;font-weight:900!important;text-transform:uppercase!important;cursor:pointer!important;}",
      ".lsffl-popup31-announcement-navbtn:disabled{opacity:.35;cursor:default!important;}",
      "#lsffl-popup31-announcement-counter{color:#e1c45a;font-family:'Barlow Condensed',Arial,sans-serif;font-size:14px;font-weight:900;}",
      "#lsffl-popup31-announcement-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 22px 14px;color:#aebdcd;font-family:Arial,sans-serif;font-size:12px;}",
      "#lsffl-popup31-announcement-footer label{display:flex;align-items:center;gap:7px;}",
      "#lsffl-popup31-announcement-footer input{width:16px;height:16px;accent-color:#c9a227;}"
    ].join("");

    document.head.appendChild(
      style
    );
  }

  function createAnnouncementModal() {
    if (announcementModal) {
      return;
    }

    injectAnnouncementStyles();

    announcementModal =
      document.createElement(
        "div"
      );

    announcementModal.id =
      "lsffl-popup31-announcement";

    announcementModal.hidden =
      true;

    announcementModal.innerHTML =
      '<div id="lsffl-popup31-announcement-card">' +

        '<div id="lsffl-popup31-announcement-head">' +

          '<div>' +
            '<div id="lsffl-popup31-announcement-eyebrow">LSFFL</div>' +
            '<h2 id="lsffl-popup31-announcement-title">League Update</h2>' +
          '</div>' +

          '<button id="lsffl-popup31-announcement-close" type="button" aria-label="Close announcement">×</button>' +

        '</div>' +

        '<div id="lsffl-popup31-announcement-body">' +
          '<div id="lsffl-popup31-announcement-text"></div>' +
          '<div id="lsffl-popup31-announcement-meta"></div>' +
        '</div>' +

        '<div id="lsffl-popup31-announcement-actions">' +
          '<a id="lsffl-popup31-announcement-open" href="#">Read More</a>' +
        '</div>' +

        '<div id="lsffl-popup31-announcement-nav">' +

          '<button class="lsffl-popup31-announcement-navbtn" id="lsffl-popup31-announcement-prev" type="button">Previous</button>' +

          '<span id="lsffl-popup31-announcement-counter">1 / 1</span>' +

          '<button class="lsffl-popup31-announcement-navbtn" id="lsffl-popup31-announcement-next" type="button">Next</button>' +

        '</div>' +

        '<div id="lsffl-popup31-announcement-footer">' +

          '<label>' +
            '<input id="lsffl-popup31-announcement-dontshow" type="checkbox"> Don\'t show announcements again for 24 hours' +
          '</label>' +

          '<span>NAVY TIMES • LSFFL 3.1</span>' +

        '</div>' +

      '</div>';

    document.body.appendChild(
      announcementModal
    );

    document
      .getElementById(
        "lsffl-popup31-announcement-close"
      )
      .addEventListener(
        "click",
        closeAnnouncement
      );

    document
      .getElementById(
        "lsffl-popup31-announcement-prev"
      )
      .addEventListener(
        "click",
        function () {
          showAnnouncement(
            announcementIndex - 1
          );
        }
      );

    document
      .getElementById(
        "lsffl-popup31-announcement-next"
      )
      .addEventListener(
        "click",
        function () {
          showAnnouncement(
            announcementIndex + 1
          );
        }
      );

    document
      .getElementById(
        "lsffl-popup31-announcement-open"
      )
      .addEventListener(
        "click",
        function (event) {
          var item =
            announcementItems[
              announcementIndex
            ];

          if (
            !item ||
            !item.buttonUrl
          ) {
            return;
          }

          var match =
            classifyMflUrl(
              item.buttonUrl
            );

          if (!match) {
            return;
          }

          event.preventDefault();
          event.stopPropagation();

          closeAnnouncement();

          openModal(
            match.url,
            match.type,
            match.title
          );
        }
      );

    announcementModal.addEventListener(
      "click",
      function (event) {
        if (
          event.target ===
          announcementModal
        ) {
          closeAnnouncement();
        }
      }
    );
  }

  function showAnnouncement(
    index
  ) {
    if (
      !announcementItems.length
    ) {
      return;
    }

    announcementIndex =
      Math.max(
        0,
        Math.min(
          index,
          announcementItems.length -
            1
        )
      );

    var item =
      announcementItems[
        announcementIndex
      ];

    document.getElementById(
      "lsffl-popup31-announcement-eyebrow"
    ).textContent =
      item.eyebrow ||
      "LSFFL";

    document.getElementById(
      "lsffl-popup31-announcement-title"
    ).textContent =
      item.title ||
      "League Update";

    document.getElementById(
      "lsffl-popup31-announcement-text"
    ).textContent =
      item.body ||
      "";

    document.getElementById(
      "lsffl-popup31-announcement-meta"
    ).textContent =
      item.meta ||
      "";

    var open =
      document.getElementById(
        "lsffl-popup31-announcement-open"
      );

    if (item.buttonUrl) {
      open.href =
        item.buttonUrl;

      open.textContent =
        item.buttonText ||
        "Read More";

      open.style.display =
        "inline-flex";
    } else {
      open.removeAttribute(
        "href"
      );

      open.style.display =
        "none";
    }

    document.getElementById(
      "lsffl-popup31-announcement-counter"
    ).textContent =
      (
        announcementIndex + 1
      ) +
      " / " +
      announcementItems.length;

    document.getElementById(
      "lsffl-popup31-announcement-prev"
    ).disabled =
      announcementIndex === 0;

    document.getElementById(
      "lsffl-popup31-announcement-next"
    ).disabled =
      announcementIndex ===
      announcementItems.length -
        1;
  }

  function openAnnouncement() {
    createAnnouncementModal();

    announcementItems =
      loadAnnouncementItems();

    if (
      !announcementItems.length
    ) {
      return false;
    }

    document.getElementById(
      "lsffl-popup31-announcement-dontshow"
    ).checked =
      false;

    announcementModal.hidden =
      false;

    showAnnouncement(0);

    try {
      sessionStorage.setItem(
        ANNOUNCEMENT_SESSION_KEY,
        "1"
      );
    } catch (error) {}

    return true;
  }

  function closeAnnouncement() {
    if (
      !announcementModal ||
      announcementModal.hidden
    ) {
      return;
    }

    var dontShow =
      document.getElementById(
        "lsffl-popup31-announcement-dontshow"
      );

    if (
      dontShow &&
      dontShow.checked
    ) {
      try {
        localStorage.setItem(
          ANNOUNCEMENT_DISMISS_KEY,
          String(
            Date.now() +
              24 *
                60 *
                60 *
                1000
          )
        );
      } catch (error) {}
    }

    announcementModal.hidden =
      true;
  }

  function shouldAutoOpenAnnouncement() {
    try {
      var dismissedUntil =
        Number(
          localStorage.getItem(
            ANNOUNCEMENT_DISMISS_KEY
          ) || 0
        );

      if (
        dismissedUntil &&
        Date.now() <
          dismissedUntil
      ) {
        return false;
      }
    } catch (error) {}

    try {
      if (
        sessionStorage.getItem(
          ANNOUNCEMENT_SESSION_KEY
        ) === "1"
      ) {
        return false;
      }
    } catch (error) {}

    return true;
  }

  function bootAnnouncement() {
    if (
      !isHomepage() ||
      !shouldAutoOpenAnnouncement()
    ) {
      return;
    }

    var started =
      Date.now();

    (function waitForSources() {
      var articleReady =
        Boolean(
          findSourceTable(
            "article_summary",
            ".lsffl-article-module"
          )
        );

      var messageReady =
        Boolean(
          findSourceTable(
            "message_board_summary",
            ".lsffl-message-board-module"
          )
        );

      if (
        (
          articleReady &&
          messageReady
        ) ||
        Date.now() -
          started >
          8000
      ) {
        window.setTimeout(
          openAnnouncement,
          500
        );

        return;
      }

      window.setTimeout(
        waitForSources,
        200
      );
    })();
  }

  window.lsfflPopup3 = {
    openAnnouncement:
      openAnnouncement,

    closeAnnouncement:
      closeAnnouncement,

    openFranchise:
      openFranchise,

    openContent:
      window.lsfflOpenContentPopup
  };

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      bootAnnouncement,
      {
        once: true
      }
    );
  } else {
    bootAnnouncement();
  }
})();
