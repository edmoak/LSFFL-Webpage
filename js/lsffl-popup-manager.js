/*
 * LSFFL POPUP MANAGER — POP-UP 3.0 CLEAN REBUILD
 * File location: js/lsffl-popup-manager.js
 *
 * Fresh architecture. One job per handler:
 * 1) Commissioner articles -> LSFFL modal
 * 2) Message-board topics -> LSFFL modal
 * 3) Franchise pages -> LSFFL modal
 * 4) Homepage Announcement Center -> once per browser session
 * 5) Header utility buttons -> centered browser popups
 *
 * No Cloudflare dependency for league content.
 * No legacy retry chains from Pop-Up 2.2.
 */
(function () {
  "use strict";

  if (window.top !== window.self) return;

  var LEAGUE_ID = "23135";
  var YEAR = "2026";

  var modal = null;
  var modalFrame = null;
  var modalTitle = null;
  var modalClose = null;
  var modalType = "content";
  var previousFocus = null;
  var nativeWindowOpen = window.open.bind(window);

  var ANNOUNCEMENT_SESSION_KEY = "lsffl-popup3-auto-shown-2026-23135";
  var ANNOUNCEMENT_DISMISS_KEY = "lsffl-popup3-dismissed-until";

  function absUrl(value, base) {
    try {
      return new URL(value, base || window.location.href);
    } catch (e) {
      return null;
    }
  }

  function normalizeFranchiseId(value) {
    var digits = String(value || "").replace(/\D/g, "");
    return digits ? digits.padStart(4, "0").slice(-4) : "";
  }

  function isMflUrl(url) {
    return Boolean(
      url &&
      /myfantasyleague\.com$/i.test(url.hostname) &&
      url.pathname.indexOf("/" + YEAR + "/") !== -1
    );
  }

  function classifyUrl(value) {
    var url = absUrl(value);
    if (!url) return null;

    if (
      url.hostname === "edmoak.github.io" &&
      url.pathname.indexOf("/LSFFL-Webpage/") === 0
    ) {
      var fileName = String(url.pathname || "")
        .split("/")
        .pop()
        .replace(/\.html?$/i, "")
        .replace(/[-_]+/g, " ")
        .trim();

      return {
        type: "github",
        title: fileName
          ? fileName.replace(/\b\w/g, function (c) {
              return c.toUpperCase();
            })
          : "LSFFL",
        url: url.href
      };
    }

    if (!isMflUrl(url)) return null;

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
    if (document.getElementById("lsffl-popup3-modal-styles")) return;

    var style = document.createElement("style");
    style.id = "lsffl-popup3-modal-styles";

    style.textContent = [
      "body.lsffl-popup3-open{overflow:hidden!important;}",
      "#lsffl-popup3-modal[hidden]{display:none!important;}",
      "#lsffl-popup3-modal{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(0,7,18,.86);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);}",
      "#lsffl-popup3-dialog{width:min(1180px,96vw);height:min(850px,94vh);display:flex;flex-direction:column;overflow:hidden;border:2px solid #c9a227;border-radius:11px;background:#061426;box-shadow:0 22px 70px rgba(0,0,0,.72);}",
      "#lsffl-popup3-bar{min-height:48px;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:8px 10px 8px 15px;border-bottom:2px solid #c9a227;background:linear-gradient(180deg,#123755 0%,#071a2f 100%);}",
      "#lsffl-popup3-title{min-width:0;overflow:hidden;color:#fff;font-family:'Barlow Condensed','Roboto Condensed','Arial Narrow',Arial,sans-serif;font-size:18px;line-height:22px;font-weight:800;letter-spacing:.65px;text-overflow:ellipsis;text-transform:uppercase;white-space:nowrap;}",
      "#lsffl-popup3-close{width:34px!important;min-width:34px!important;height:34px!important;min-height:34px!important;padding:0!important;display:grid!important;place-items:center!important;border:1px solid #e1c45a!important;border-radius:6px!important;background:#061426!important;color:#fff!important;font-family:Arial,sans-serif!important;font-size:26px!important;line-height:26px!important;font-weight:400!important;cursor:pointer!important;box-shadow:none!important;}",
      "#lsffl-popup3-close:hover{background:#c9a227!important;color:#061426!important;}",
      "#lsffl-popup3-frame{width:100%;height:100%;flex:1 1 auto;border:0;background:#061426;opacity:0;transition:opacity .12s ease;}",
      "@media(max-width:700px){#lsffl-popup3-modal{padding:7px;}#lsffl-popup3-dialog{width:100%;height:96vh;border-radius:8px;}#lsffl-popup3-bar{min-height:44px;padding-left:11px;}#lsffl-popup3-title{font-size:16px;}}"
    ].join("");

    document.head.appendChild(style);
  }

  function createModal() {
    if (modal) return;

    injectModalStyles();

    modal = document.createElement("div");
    modal.id = "lsffl-popup3-modal";
    modal.hidden = true;
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "lsffl-popup3-title");

    var dialog = document.createElement("div");
    dialog.id = "lsffl-popup3-dialog";

    var bar = document.createElement("div");
    bar.id = "lsffl-popup3-bar";

    modalTitle = document.createElement("div");
    modalTitle.id = "lsffl-popup3-title";
    modalTitle.textContent = "LSFFL";

    modalClose = document.createElement("button");
    modalClose.id = "lsffl-popup3-close";
    modalClose.type = "button";
    modalClose.setAttribute("aria-label", "Close popup");
    modalClose.textContent = "×";

    modalFrame = document.createElement("iframe");
    modalFrame.id = "lsffl-popup3-frame";
    modalFrame.name = "lsffl-popup3-frame";
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
      if (modalType === "github") {
        modalFrame.style.opacity = "1";
        return;
      }

      cleanLoadedMflPage();

      window.setTimeout(cleanLoadedMflPage, 100);
      window.setTimeout(cleanLoadedMflPage, 350);
      window.setTimeout(cleanLoadedMflPage, 800);

      window.setTimeout(function () {
        if (modalFrame) {
          modalFrame.style.opacity = "1";
        }
      }, 500);
    });
  }

  function hide(el) {
    if (!el) return;

    el.style.setProperty("display", "none", "important");
    el.style.setProperty("visibility", "hidden", "important");
  }

  function injectIframeTheme(doc) {
    if (doc.getElementById("lsffl-popup3-frame-style")) return;

    var style = doc.createElement("style");
    style.id = "lsffl-popup3-frame-style";

    style.textContent = [
      "html.lsffl-popup3-doc,html.lsffl-popup3-doc body{margin:0!important;padding:0!important;min-height:100%!important;background:#061426!important;background-image:url('https://github.com/edmoak/LSFFL-Webpage/blob/main/images/backgrounds/lsfflbackground.png?raw=true')!important;background-position:center top!important;background-size:cover!important;background-attachment:fixed!important;color:#fff!important;overflow-x:hidden!important;}",
      "html.lsffl-popup3-doc body{padding:10px!important;box-sizing:border-box!important;}",
      "html.lsffl-popup3-doc #container-wrap,html.lsffl-popup3-doc .pagebody,html.lsffl-popup3-doc .report,html.lsffl-popup3-doc .module{max-width:100%!important;width:100%!important;margin:0 auto!important;box-sizing:border-box!important;}",
      "html.lsffl-popup3-doc img{max-width:100%!important;height:auto!important;}",
      "html.lsffl-popup3-doc body.lsffl-popup3-franchise img.lsffl-popup3-team-logo{display:block!important;width:auto!important;height:auto!important;max-width:min(612px,75%)!important;max-height:374px!important;margin:10px auto 18px!important;object-fit:contain!important;object-position:center!important;}",
      "html.lsffl-popup3-doc .lsffl-popup3-team-brand{width:min(700px,92%)!important;margin:18px auto 0!important;text-align:center!important;background:transparent!important;border:0!important;}",
      "html.lsffl-popup3-doc .lsffl-popup3-team-name{color:#fff!important;font-family:'Oswald','Barlow Condensed','Arial Narrow',Arial,sans-serif!important;font-size:clamp(28px,4vw,42px)!important;line-height:1.05!important;font-weight:800!important;letter-spacing:1.2px!important;text-transform:uppercase!important;text-shadow:0 3px 8px rgba(0,0,0,.55)!important;}",
      "html.lsffl-popup3-doc .lsffl-popup3-team-line{width:130px!important;height:3px!important;margin:10px auto 0!important;background:linear-gradient(90deg,transparent,#c9a227,#e1c45a,#c9a227,transparent)!important;}",
      "html.lsffl-popup3-doc a{cursor:pointer!important;}"
    ].join("");

    doc.head.appendChild(style);
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
        hide
      );
    });
  }

  function getFranchiseName(doc) {
    var bodyText = String(
      (doc.body &&
        (doc.body.innerText || doc.body.textContent)) ||
        ""
    )
      .replace(/\s+/g, " ")
      .trim();

    var match = bodyText.match(
      /(?:^|\s)([A-Za-z0-9][A-Za-z0-9'’&. \/_-]{1,45}?):\s*Main\b/i
    );

    if (match && match[1]) {
      return match[1]
        .replace(/\s+/g, " ")
        .trim();
    }

    var headings =
      Array.prototype.slice.call(
        doc.querySelectorAll(
          ".modulehead,.moduleheader,h1,h2,h3,caption,th"
        )
      );

    for (
      var i = 0;
      i < headings.length;
      i += 1
    ) {
      var text = String(
        headings[i].textContent || ""
      )
        .replace(/\s+/g, " ")
        .trim();

      if (
        text.length >= 2 &&
        text.length <= 45 &&
        !/^(main|roster|roster w\/?stats|scoring history|transactions|schedule|accounting|series records|box score|my options|franchise center)$/i.test(
          text
        )
      ) {
        return text
          .replace(/:\s*main.*$/i, "")
          .trim();
      }
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
      "lsffl-popup3-franchise"
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
          "lsffl-popup3-team-logo"
        );
      }
    });

    var logo =
      doc.querySelector(
        "img.lsffl-popup3-team-logo"
      );

    if (
      !logo ||
      !name ||
      logo.dataset.lsfflPopup3Branded ===
        "1"
    ) {
      return;
    }

    logo.dataset.lsfflPopup3Branded =
      "1";

    var brand =
      doc.createElement("div");

    brand.className =
      "lsffl-popup3-team-brand";

    var nameEl =
      doc.createElement("div");

    nameEl.className =
      "lsffl-popup3-team-name";

    nameEl.textContent =
      name;

    var line =
      doc.createElement("div");

    line.className =
      "lsffl-popup3-team-line";

    brand.appendChild(nameEl);
    brand.appendChild(line);

    if (logo.parentNode) {
      logo.parentNode.insertBefore(
        brand,
        logo
      );
    }
  }

  function cleanLoadedMflPage() {
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

      doc.documentElement.classList.add(
        "lsffl-popup3-doc"
      );

      doc.body.classList.add(
        "lsffl-popup3-doc"
      );

      injectIframeTheme(doc);
      hideMflChrome(doc);
      decorateFranchise(doc);

      if (
        !doc.documentElement.dataset
          .lsfflPopup3Links
      ) {
        doc.documentElement.dataset
          .lsfflPopup3Links = "1";

        doc.addEventListener(
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
              event.altKey
            ) {
              return;
            }

            var dest =
              absUrl(
                link.getAttribute(
                  "href"
                ),
                win.location.href
              );

            if (!isMflUrl(dest)) {
              return;
            }

            event.preventDefault();

            win.location.href =
              dest.href;
          },
          true
        );
      }

      modalFrame.style.opacity =
        "1";
    } catch (e) {
      modalFrame.style.opacity =
        "1";
    }
  }

  function addBaseTag(
    html,
    pageUrl
  ) {
    var baseTag =
      '<base href="' +
      String(pageUrl)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;") +
      '">';

    if (
      /<head(?:\s[^>]*)?>/i.test(
        html
      )
    ) {
      return html.replace(
        /<head(?:\s[^>]*)?>/i,
        function (match) {
          return match + baseTag;
        }
      );
    }

    return baseTag + html;
  }

  async function loadGitHubPage(url) {
    try {
      var response =
        await fetch(url, {
          cache: "no-store",
          credentials: "omit"
        });

      if (!response.ok) {
        throw new Error(
          "HTTP " + response.status
        );
      }

      var html =
        await response.text();

      modalFrame.removeAttribute(
        "src"
      );

      modalFrame.srcdoc =
        addBaseTag(
          html,
          url
        );
    } catch (e) {
      modalFrame.removeAttribute(
        "srcdoc"
      );

      modalFrame.src =
        url;

      window.setTimeout(
        function () {
          if (modalFrame) {
            modalFrame.style.opacity =
              "1";
          }
        },
        700
      );
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

    modalFrame.removeAttribute(
      "srcdoc"
    );

    if (modalType === "github") {
      modalFrame.src =
        "about:blank";

      loadGitHubPage(url);
    } else {
      modalFrame.src =
        url;
    }

    modal.hidden =
      false;

    document.body.classList.add(
      "lsffl-popup3-open"
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

    modalFrame.removeAttribute(
      "srcdoc"
    );

    modalFrame.src =
      "about:blank";

    document.body.classList.remove(
      "lsffl-popup3-open"
    );

    if (
      previousFocus &&
      typeof previousFocus.focus ===
        "function"
    ) {
      previousFocus.focus();
    }
  }

  function openCenteredToolPopup(
    url,
    name,
    width,
    height
  ) {
    var screenLeft =
      window.screenLeft !== undefined
        ? window.screenLeft
        : window.screenX;

    var screenTop =
      window.screenTop !== undefined
        ? window.screenTop
        : window.screenY;

    var viewportWidth =
      window.innerWidth ||
      document.documentElement
        .clientWidth ||
      screen.width;

    var viewportHeight =
      window.innerHeight ||
      document.documentElement
        .clientHeight ||
      screen.height;

    var left =
      Math.max(
        0,
        screenLeft +
          Math.round(
            (viewportWidth - width) /
              2
          )
      );

    var top =
      Math.max(
        0,
        screenTop +
          Math.round(
            (viewportHeight - height) /
              2
          )
      );

    var features = [
      "popup=yes",
      "resizable=yes",
      "scrollbars=yes",
      "status=yes",
      "toolbar=no",
      "menubar=no",
      "location=no",
      "width=" + width,
      "height=" + height,
      "left=" + left,
      "top=" + top
    ].join(",");

    var popup =
      nativeWindowOpen(
        url,
        name,
        features
      );

    if (popup) {
      popup.focus();
    }

    return popup;
  }

  function popupName(link) {
    var label =
      (
        link.querySelector(
          ".svg-text"
        ) || {}
      ).textContent ||
      link.getAttribute("title") ||
      "LSFFL Tool";

    return (
      "LSFFL_" +
      label
        .replace(
          /[^a-z0-9]+/gi,
          "_"
        )
        .replace(
          /^_+|_+$/g,
          ""
        )
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
        classifyUrl(
          link.href
        );

      if (match) {
        event.preventDefault();
        event.stopPropagation();

        openModal(
          match.url,
          match.type,
          match.title
        );

        return;
      }

      if (
        link.matches(
          ".banner-rightside a.svg-iconlink"
        ) &&
        !link.classList.contains(
          "icon-chat"
        ) &&
        !link.getAttribute(
          "onclick"
        )
      ) {
        event.preventDefault();
        event.stopPropagation();

        var popup =
          openCenteredToolPopup(
            link.href,
            popupName(link),
            1180,
            820
          );

        if (!popup) {
          window.location.href =
            link.href;
        }
      }
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

      var id =
        normalizeFranchiseId(
          data.franchiseId
        );

      if (!id) {
        return;
      }

      openModal(
        "https://www48.myfantasyleague.com/" +
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

      openModal(
        "https://www48.myfantasyleague.com/" +
          YEAR +
          "/options?L=" +
          LEAGUE_ID +
          "&F=" +
          encodeURIComponent(id) +
          "&O=01",
        "franchise",
        "Franchise Center"
      );
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
        classifyUrl(url);

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
    function (franchiseId) {
      var id =
        normalizeFranchiseId(
          franchiseId
        );

      if (!id) {
        return false;
      }

      return openModal(
        "https://www48.myfantasyleague.com/" +
          YEAR +
          "/options?L=" +
          LEAGUE_ID +
          "&F=" +
          encodeURIComponent(id) +
          "&O=01",
        "franchise",
        "Franchise Center"
      );
    };

  window.lsfflCloseContentPopup =
    closeModal;

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

    var q =
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
        q.get("L") ===
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
    var moduleTable =
      document.querySelector(
        moduleSelector +
          " table#" +
          id +
          "," +
          moduleSelector +
          " table"
      );

    if (moduleTable) {
      return moduleTable;
    }

    return document.querySelector(
      "table#" + id
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

    var title =
      cleanText(
        link
          ? link.textContent
          : row.textContent
      );

    var date =
      cells.length
        ? cleanText(
            cells[
              cells.length - 1
            ].textContent
          )
        : "";

    var url =
      link
        ? absUrl(
            link.getAttribute(
              "href"
            ),
            window.location.href
          )
        : null;

    if (!title) {
      return null;
    }

    return {
      eyebrow:
        "COMMISSIONER ARTICLE",

      title:
        title,

      body:
        "A Commissioner Article is available in League Central.",

      meta:
        date,

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

    var cells =
      row.querySelectorAll(
        "td"
      );

    var title =
      cleanText(
        link
          ? link.textContent
          : row.textContent
      );

    var meta =
      [];

    for (
      var i = 1;
      i < cells.length;
      i += 1
    ) {
      var text =
        cleanText(
          cells[i].textContent
        );

      if (
        text &&
        meta.indexOf(text) ===
          -1
      ) {
        meta.push(text);
      }
    }

    var url =
      link
        ? absUrl(
            link.getAttribute(
              "href"
            ),
            window.location.href
          )
        : null;

    if (!title) {
      return null;
    }

    return {
      eyebrow:
        "MESSAGE BOARD",

      title:
        title,

      body:
        "There is an LSFFL message-board topic available to read.",

      meta:
        meta.join(" • "),

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
      items.push(article);
    }

    if (message) {
      items.push(message);
    }

    return items;
  }

  function injectAnnouncementStyles() {
    if (
      document.getElementById(
        "lsffl-popup3-announcement-styles"
      )
    ) {
      return;
    }

    var style =
      document.createElement(
        "style"
      );

    style.id =
      "lsffl-popup3-announcement-styles";

    style.textContent = [
      "#lsffl-popup3-announcement[hidden]{display:none!important;}",
      "#lsffl-popup3-announcement{position:fixed;inset:0;z-index:2147483100;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(0,7,18,.88);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);}",
      "#lsffl-popup3-announcement-card{width:min(760px,96vw);max-height:94vh;overflow:auto;border:2px solid #c9a227;border-radius:14px;background:linear-gradient(180deg,#0c2846 0%,#061426 52%,#02091a 100%);color:#fff;box-shadow:0 24px 90px rgba(0,0,0,.78);}",
      "#lsffl-popup3-announcement-top{height:6px;background:linear-gradient(90deg,#c9a227,#f0d776,#c9a227);}",
      "#lsffl-popup3-announcement-head{display:flex;justify-content:space-between;gap:16px;padding:22px 22px 8px;}",
      "#lsffl-popup3-announcement-eyebrow{margin-bottom:5px;color:#e1c45a;font-family:'Barlow Condensed',Arial,sans-serif;font-size:13px;font-weight:900;letter-spacing:1.7px;text-transform:uppercase;}",
      "#lsffl-popup3-announcement-title{margin:0;color:#fff;font-family:'Oswald','Barlow Condensed',Arial,sans-serif;font-size:clamp(25px,4vw,36px);line-height:1.03;font-weight:900;letter-spacing:.4px;text-transform:uppercase;}",
      "#lsffl-popup3-announcement-close{width:38px!important;min-width:38px!important;height:38px!important;padding:0!important;border:1px solid rgba(225,196,90,.8)!important;border-radius:8px!important;background:#061426!important;color:#fff!important;font:400 28px/1 Arial,sans-serif!important;cursor:pointer!important;}",
      "#lsffl-popup3-announcement-body{padding:12px 22px 8px;color:#eef4fb;font-family:Arial,sans-serif;font-size:17px;line-height:1.58;}",
      "#lsffl-popup3-announcement-meta{margin-top:12px;color:#aebdcd;font-size:13px;font-weight:700;}",
      "#lsffl-popup3-announcement-actions{display:flex;gap:10px;flex-wrap:wrap;padding:14px 22px 12px;}",
      "#lsffl-popup3-announcement-open{display:none;align-items:center;justify-content:center;min-height:42px;padding:9px 18px;border:1px solid #e1c45a;border-radius:8px;background:#c9a227;color:#061426!important;text-decoration:none!important;font-family:'Barlow Condensed',Arial,sans-serif;font-size:16px;font-weight:900;text-transform:uppercase;}",
      "#lsffl-popup3-announcement-nav{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 22px;border-top:1px solid rgba(201,162,39,.3);background:rgba(0,0,0,.18);}",
      ".lsffl-popup3-announcement-navbtn{min-width:86px!important;min-height:36px!important;padding:7px 12px!important;border:1px solid rgba(225,196,90,.7)!important;border-radius:7px!important;background:#071a2f!important;color:#fff!important;font-family:'Barlow Condensed',Arial,sans-serif!important;font-size:14px!important;font-weight:900!important;text-transform:uppercase!important;cursor:pointer!important;}",
      ".lsffl-popup3-announcement-navbtn:disabled{opacity:.35;cursor:default!important;}",
      "#lsffl-popup3-announcement-counter{color:#e1c45a;font-family:'Barlow Condensed',Arial,sans-serif;font-size:14px;font-weight:900;}",
      "#lsffl-popup3-announcement-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 22px 14px;color:#aebdcd;font-family:Arial,sans-serif;font-size:12px;}",
      "#lsffl-popup3-announcement-footer label{display:flex;align-items:center;gap:7px;}",
      "#lsffl-popup3-announcement-footer input{width:16px;height:16px;accent-color:#c9a227;}",
      "@media(max-width:600px){#lsffl-popup3-announcement{padding:8px;}#lsffl-popup3-announcement-card{width:100%;}#lsffl-popup3-announcement-head{padding:17px 15px 8px;}#lsffl-popup3-announcement-body,#lsffl-popup3-announcement-actions,#lsffl-popup3-announcement-nav,#lsffl-popup3-announcement-footer{padding-left:15px;padding-right:15px;}#lsffl-popup3-announcement-footer{align-items:flex-start;flex-direction:column;}}"
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
      "lsffl-popup3-announcement";

    announcementModal.hidden =
      true;

    announcementModal.innerHTML =
      '<div id="lsffl-popup3-announcement-card">' +
        '<div id="lsffl-popup3-announcement-top"></div>' +

        '<div id="lsffl-popup3-announcement-head">' +
          '<div>' +
            '<div id="lsffl-popup3-announcement-eyebrow">LSFFL</div>' +
            '<h2 id="lsffl-popup3-announcement-title">League Update</h2>' +
          '</div>' +

          '<button id="lsffl-popup3-announcement-close" type="button" aria-label="Close announcement">×</button>' +
        '</div>' +

        '<div id="lsffl-popup3-announcement-body">' +
          '<div id="lsffl-popup3-announcement-text"></div>' +
          '<div id="lsffl-popup3-announcement-meta"></div>' +
        '</div>' +

        '<div id="lsffl-popup3-announcement-actions">' +
          '<a id="lsffl-popup3-announcement-open" href="#">Read More</a>' +
        '</div>' +

        '<div id="lsffl-popup3-announcement-nav">' +
          '<button class="lsffl-popup3-announcement-navbtn" id="lsffl-popup3-announcement-prev" type="button">Previous</button>' +

          '<span id="lsffl-popup3-announcement-counter">1 / 1</span>' +

          '<button class="lsffl-popup3-announcement-navbtn" id="lsffl-popup3-announcement-next" type="button">Next</button>' +
        '</div>' +

        '<div id="lsffl-popup3-announcement-footer">' +
          '<label>' +
            '<input id="lsffl-popup3-announcement-dontshow" type="checkbox"> ' +
            'Don\'t show announcements again for 24 hours' +
          '</label>' +

          '<span>NAVY TIMES • LSFFL 3.0</span>' +
        '</div>' +
      '</div>';

    document.body.appendChild(
      announcementModal
    );

    document
      .getElementById(
        "lsffl-popup3-announcement-close"
      )
      .addEventListener(
        "click",
        closeAnnouncement
      );

    document
      .getElementById(
        "lsffl-popup3-announcement-prev"
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
        "lsffl-popup3-announcement-next"
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
        "lsffl-popup3-announcement-open"
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
            classifyUrl(
              item.buttonUrl
            );

          if (match) {
            event.preventDefault();

            closeAnnouncement();

            openModal(
              match.url,
              match.type,
              match.title
            );
          }
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
      "lsffl-popup3-announcement-eyebrow"
    ).textContent =
      item.eyebrow ||
      "LSFFL";

    document.getElementById(
      "lsffl-popup3-announcement-title"
    ).textContent =
      item.title ||
      "League Update";

    document.getElementById(
      "lsffl-popup3-announcement-text"
    ).textContent =
      item.body ||
      "";

    document.getElementById(
      "lsffl-popup3-announcement-meta"
    ).textContent =
      item.meta ||
      "";

    var open =
      document.getElementById(
        "lsffl-popup3-announcement-open"
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
      "lsffl-popup3-announcement-counter"
    ).textContent =
      (
        announcementIndex + 1
      ) +
      " / " +
      announcementItems.length;

    document.getElementById(
      "lsffl-popup3-announcement-prev"
    ).disabled =
      announcementIndex === 0;

    document.getElementById(
      "lsffl-popup3-announcement-next"
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

    announcementIndex =
      0;

    document.getElementById(
      "lsffl-popup3-announcement-dontshow"
    ).checked =
      false;

    announcementModal.hidden =
      false;

    showAnnouncement(0);

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
        "lsffl-popup3-announcement-dontshow"
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
      } catch (e) {}
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
          ) ||
            0
        );

      if (
        dismissedUntil &&
        Date.now() <
          dismissedUntil
      ) {
        return false;
      }
    } catch (e) {}

    try {
      if (
        sessionStorage.getItem(
          ANNOUNCEMENT_SESSION_KEY
        ) === "1"
      ) {
        return false;
      }

      sessionStorage.setItem(
        ANNOUNCEMENT_SESSION_KEY,
        "1"
      );
    } catch (e) {}

    return true;
  }

  function bootAnnouncement() {
    if (!isHomepage()) {
      return;
    }

    if (
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
      window.lsfflOpenFranchisePopup,

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
