/*
 * LSFFL POPUP MANAGER
 * File location: js/lsffl-popup-manager.js
 *
 * Owns all custom popup behavior for:
 * - Commissioner articles
 * - Message-board topics
 * - Franchise pages
 * - Header action-button browser popups
 *
 * This file intentionally runs only in the top page, never inside its own iframe.
 */

(function () {
  "use strict";

  if (window.top !== window.self) {
    return;
  }

  var modal = null;
  var frame = null;
  var titleElement = null;
  var closeButton = null;
  var previousFocus = null;
  var currentType = "content";
  var nativeWindowOpen = window.open.bind(window);

  function normalizeFranchiseId(value) {
    var digits = String(value || "").replace(/\D/g, "");
    return digits ? digits.padStart(4, "0").slice(-4) : "";
  }

  function makeAbsoluteURL(value, base) {
    try {
      return new URL(value, base || window.location.href);
    } catch (error) {
      return null;
    }
  }

  function isMfl2026URL(url) {
    return Boolean(
      url &&
      /myfantasyleague\.com$/i.test(url.hostname) &&
      url.pathname.indexOf("/2026/") !== -1
    );
  }

  function githubPageTitle(url) {
    var fileName = String(url.pathname || "")
      .split("/")
      .pop()
      .replace(/\.html?$/i, "")
      .replace(/[-_]+/g, " ")
      .trim();

    if (!fileName || fileName.toLowerCase() === "index") {
      return "LSFFL";
    }

    return fileName.replace(/\b\w/g, function (letter) {
      return letter.toUpperCase();
    });
  }

  function isLsfflGitHubPage(url) {
    if (
      !url ||
      url.hostname !== "edmoak.github.io" ||
      url.pathname.indexOf("/LSFFL-Webpage/") !== 0
    ) {
      return false;
    }

    var fileName = String(url.pathname || "")
      .split("/")
      .pop()
      .toLowerCase();

    if (fileName === "standings.html") {
      return false;
    }

    return true;
  }

  function classifyContentURL(value) {
    var url = makeAbsoluteURL(value);

    if (isLsfflGitHubPage(url)) {
      return {
        type: "github",
        title: githubPageTitle(url),
        url: url.href
      };
    }

    if (!isMfl2026URL(url)) {
      return null;
    }

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
      /\/options\/?$/i.test(url.pathname) &&
      option === "28" &&
      url.searchParams.get("TOPIC_ID")
    ) {
      return {
        type: "message",
        title: "League Message Board",
        url: url.href
      };
    }

    if (/\/mb\/(?:board_show|topic_show)\.pl$/i.test(url.pathname)) {
      return {
        type: "message",
        title: "League Message Board",
        url: url.href
      };
    }

    return null;
  }

  function injectStyles() {
    if (document.getElementById("lsffl-popup-manager-styles")) {
      return;
    }

    var style = document.createElement("style");
    style.id = "lsffl-popup-manager-styles";
    style.textContent = [
      "body.lsffl-content-popup-open{overflow:hidden!important;}",
      "#lsffl-content-popup[hidden]{display:none!important;}",
      "#lsffl-content-popup{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(0,7,18,.86);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);}",
      "#lsffl-content-popup-dialog{width:min(1180px,96vw);height:min(850px,94vh);display:flex;flex-direction:column;overflow:hidden;border:2px solid #c9a227;border-radius:11px;background:#061426;box-shadow:0 22px 70px rgba(0,0,0,.72);}",
      "#lsffl-content-popup-bar{min-height:48px;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:8px 10px 8px 15px;border-bottom:2px solid #c9a227;background:linear-gradient(180deg,#123755 0%,#071a2f 100%);}",
      "#lsffl-content-popup-title{min-width:0;overflow:hidden;color:#fff;font-family:'Barlow Condensed','Roboto Condensed','Arial Narrow',Arial,sans-serif;font-size:18px;line-height:22px;font-weight:800;letter-spacing:.65px;text-overflow:ellipsis;text-transform:uppercase;white-space:nowrap;}",
      "#lsffl-content-popup-close{width:34px!important;min-width:34px!important;height:34px!important;min-height:34px!important;padding:0!important;display:grid!important;place-items:center!important;border:1px solid #e1c45a!important;border-radius:6px!important;background:#061426!important;color:#fff!important;font-family:Arial,sans-serif!important;font-size:26px!important;line-height:26px!important;font-weight:400!important;text-transform:none!important;cursor:pointer;box-shadow:none!important;}",
      "#lsffl-content-popup-close:hover{background:#c9a227!important;color:#061426!important;}",
      "#lsffl-content-popup-frame{width:100%;height:100%;flex:1 1 auto;border:0;background:#061426;opacity:0;transition:opacity .12s ease;}",
      "@media(max-width:700px){#lsffl-content-popup{padding:7px;}#lsffl-content-popup-dialog{width:100%;height:96vh;border-radius:8px;}#lsffl-content-popup-bar{min-height:44px;padding-left:11px;}#lsffl-content-popup-title{font-size:16px;}}"
    ].join("");
    document.head.appendChild(style);
  }

  function createModal() {
    if (modal) {
      return;
    }

    injectStyles();

    modal = document.createElement("div");
    modal.id = "lsffl-content-popup";
    modal.hidden = true;
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "lsffl-content-popup-title");

    var dialog = document.createElement("div");
    dialog.id = "lsffl-content-popup-dialog";

    var bar = document.createElement("div");
    bar.id = "lsffl-content-popup-bar";

    titleElement = document.createElement("div");
    titleElement.id = "lsffl-content-popup-title";
    titleElement.textContent = "LSFFL";

    closeButton = document.createElement("button");
    closeButton.id = "lsffl-content-popup-close";
    closeButton.type = "button";
    closeButton.setAttribute("aria-label", "Close popup");
    closeButton.textContent = "×";

    frame = document.createElement("iframe");
    frame.id = "lsffl-content-popup-frame";
    frame.name = "lsffl-content-popup-frame";
    frame.title = "LSFFL content";
    frame.setAttribute("loading", "eager");

    bar.appendChild(titleElement);
    bar.appendChild(closeButton);
    dialog.appendChild(bar);
    dialog.appendChild(frame);
    modal.appendChild(dialog);
    document.body.appendChild(modal);

    closeButton.addEventListener("click", closeModal);

    modal.addEventListener("click", function (event) {
      if (event.target === modal) {
        closeModal();
      }
    });

    frame.addEventListener("load", function () {
      cleanIframe();
      window.setTimeout(cleanIframe, 100);
      window.setTimeout(cleanIframe, 400);
      window.setTimeout(cleanIframe, 900);
      window.setTimeout(cleanIframe, 1600);
    });
  }

  function hideElement(element) {
    if (!element) {
      return;
    }

    element.style.setProperty("display", "none", "important");
    element.style.setProperty("visibility", "hidden", "important");
    element.style.setProperty("pointer-events", "none", "important");
  }

  function findReadMessageTarget(doc, baseHref) {
    var links = Array.prototype.slice.call(
      doc.querySelectorAll("a[href]")
    );

    for (var index = 0; index < links.length; index += 1) {
      var link = links[index];
      var url = makeAbsoluteURL(link.getAttribute("href"), baseHref);
      var label = (
        link.textContent ||
        link.getAttribute("title") ||
        link.getAttribute("aria-label") ||
        ""
      ).replace(/\s+/g, " ").trim();

      if (
        url &&
        /\/mb\/topic_show\.pl$/i.test(url.pathname) &&
        url.searchParams.get("pid") &&
        (
          /read message/i.test(label) ||
          /#pid\d+$/i.test(url.hash) ||
          link.querySelector("img")
        )
      ) {
        return {
          link: link,
          url: url
        };
      }
    }

    var nestedFrames = Array.prototype.slice.call(
      doc.querySelectorAll("iframe,frame")
    );

    for (var frameIndex = 0; frameIndex < nestedFrames.length; frameIndex += 1) {
      try {
        var nestedWindow = nestedFrames[frameIndex].contentWindow;
        var nestedDocument = nestedFrames[frameIndex].contentDocument;

        if (!nestedDocument || !nestedWindow) {
          continue;
        }

        var nestedResult = findReadMessageTarget(
          nestedDocument,
          nestedWindow.location.href
        );

        if (nestedResult) {
          return nestedResult;
        }
      } catch (error) {
        /* Retry after the nested page finishes loading. */
      }
    }

    return null;
  }

  function markLargeFranchiseImage(image) {
    if (!image || image.dataset.lsfflFranchiseImageChecked === "true") {
      return;
    }

    image.dataset.lsfflFranchiseImageChecked = "true";

    function applyLimit() {
      var renderedWidth = image.getBoundingClientRect().width;
      var renderedHeight = image.getBoundingClientRect().height;
      var naturalWidth = image.naturalWidth || 0;
      var naturalHeight = image.naturalHeight || 0;

      if (
        naturalWidth >= 650 ||
        naturalHeight >= 500 ||
        renderedWidth >= 650 ||
        renderedHeight >= 500
      ) {
        image.classList.add("lsffl-popup-large-franchise-image");
      }
    }

    if (image.complete) {
      applyLimit();
    } else {
      image.addEventListener("load", applyLimit, { once: true });
    }
  }

  function constrainFranchiseImages(doc) {
    if (currentType !== "franchise") {
      return;
    }

    doc.body.classList.add("lsffl-popup-franchise");

    Array.prototype.forEach.call(
      doc.querySelectorAll("img"),
      markLargeFranchiseImage
    );
  }

  function hideSiteChrome(doc) {
    Array.prototype.forEach.call(
      doc.querySelectorAll(
        ".myfantasyleague_menu," +
        ".banner-container," +
        "#header," +
        "#pageheader," +
        "#MFLHeader," +
        ".pageheader," +
        ".header-wrapper," +
        ".lsffl-header," +
        ".ticker-wrapper," +
        ".lsffl-ticker-wrapper," +
        "#MFLBoxWrapper," +
        ".MFLSkinSelection," +
        "#menu-trigger," +
        "#menu-overlay," +
        "#click-blocker," +
        "#myfantasyleague_mobile_menu," +
        ".mobile-menu," +
        ".mobile_menu," +
        ".mobilemenu," +
        ".mfl-mobile-menu," +
        "#footer," +
        ".footer," +
        ".pagefooter," +
        "#pagefooter"
      ),
      hideElement
    );
  }

  function injectIframeTheme(doc) {
    if (doc.getElementById("lsffl-popup-clean-style")) {
      return;
    }

    var style = doc.createElement("style");
    style.id = "lsffl-popup-clean-style";
    style.textContent = [
      "html.lsffl-popup-document,html.lsffl-popup-document body{margin:0!important;padding:0!important;min-height:100%!important;background:#061426!important;background-image:url('https://github.com/edmoak/LSFFL-Webpage/blob/main/images/backgrounds/lsfflbackground.png?raw=true')!important;background-position:center top!important;background-size:cover!important;background-attachment:fixed!important;color:#fff!important;overflow-x:hidden!important;}",
      "html.lsffl-popup-document body{padding:10px!important;box-sizing:border-box!important;}",
      "html.lsffl-popup-document #container-wrap,html.lsffl-popup-document #body_options_01,html.lsffl-popup-document #body_options_73,html.lsffl-popup-document .pagebody,html.lsffl-popup-document .report,html.lsffl-popup-document .module{max-width:100%!important;width:100%!important;margin:0 auto!important;box-sizing:border-box!important;}",
      "html.lsffl-popup-document img{max-width:100%!important;height:auto!important;}",
      "html.lsffl-popup-document body.lsffl-popup-franchise img.lsffl-popup-large-franchise-image{display:block!important;width:auto!important;height:auto!important;max-width:min(612px,75%)!important;max-height:374px!important;margin:18px auto!important;object-fit:contain!important;object-position:center!important;}",
      "html.lsffl-popup-document a{cursor:pointer!important;}"
    ].join("");

    doc.head.appendChild(style);
  }

  function revealFrame() {
    if (frame) {
      frame.style.opacity = "1";
    }
  }

  function cleanIframe() {
    if (!frame || !frame.contentDocument || !frame.contentWindow) {
      return;
    }

    try {
      var doc = frame.contentDocument;
      var win = frame.contentWindow;
      var currentHref = String(win.location.href || "");

      /*
       * MFL's O=28 page embeds a large "Read Message" graphic, sometimes
       * inside another iframe. Find the real PID link recursively and replace
       * the outer popup iframe with the actual message page.
       */
      if (currentType === "message") {
        var currentUrl = makeAbsoluteURL(currentHref);
        var readTarget = findReadMessageTarget(doc, currentHref);

        if (readTarget) {
          var currentPid =
            currentUrl &&
            currentUrl.searchParams.get("pid");

          var targetPid =
            readTarget.url.searchParams.get("pid");

          /*
           * MFL sometimes serves the giant yellow "Read Message" page at the
           * same PID URL. A normal redirect changes nothing, so activate the
           * actual Read Message link instead.
           */
          if (
            currentPid &&
            targetPid &&
            currentPid === targetPid
          ) {
            if (
              readTarget.url.hash &&
              readTarget.url.hash !== win.location.hash
            ) {
              win.location.hash = readTarget.url.hash;
            }

            if (!doc.documentElement.dataset.lsfflReadMessageClicked) {
              doc.documentElement.dataset.lsfflReadMessageClicked = "true";

              window.setTimeout(function () {
                try {
                  readTarget.link.click();
                } catch (error) {
                  win.location.href = readTarget.url.href;
                }
              }, 40);
            }

            return;
          }

          win.location.replace(readTarget.url.href);
          return;
        }
      }

      doc.documentElement.classList.add("lsffl-popup-document");
      doc.body.classList.add("lsffl-popup-document");

      injectIframeTheme(doc);
      hideSiteChrome(doc);
      constrainFranchiseImages(doc);
      revealFrame();

      if (currentType !== "franchise") {
        Array.prototype.forEach.call(
          doc.querySelectorAll(
            ".reportnavigation," +
            ".reportnavigationheader," +
            ".myfantasyleague_tabmenu," +
            ".homepagetabs," +
            ".homepage-tabs"
          ),
          hideElement
        );
      }

      Array.prototype.forEach.call(
        doc.querySelectorAll("select"),
        function (select) {
          var labels = Array.prototype.map.call(
            select.options || [],
            function (option) {
              return (option.textContent || "").trim();
            }
          );

          if (
            currentType !== "franchise" ||
            labels.indexOf("Main") !== -1
          ) {
            hideElement(
              select.closest("tr") ||
              select.parentElement ||
              select
            );
          }
        }
      );

      if (!doc.documentElement.dataset.lsfflPopupLinksBound) {
        doc.documentElement.dataset.lsfflPopupLinksBound = "true";

        doc.addEventListener(
          "click",
          function (event) {
            var link = event.target.closest("a[href]");

            if (
              !link ||
              event.button !== 0 ||
              event.ctrlKey ||
              event.metaKey ||
              event.shiftKey ||
              event.altKey ||
              link.hasAttribute("download")
            ) {
              return;
            }

            var destination = makeAbsoluteURL(
              link.getAttribute("href"),
              win.location.href
            );

            if (!isMfl2026URL(destination)) {
              return;
            }

            event.preventDefault();
            win.location.href = destination.href;
          },
          true
        );
      }

      if (!doc.documentElement.dataset.lsfflPopupObserver) {
        doc.documentElement.dataset.lsfflPopupObserver = "true";

        var queued = false;
        var observer = new win.MutationObserver(function () {
          if (queued) {
            return;
          }

          queued = true;

          win.requestAnimationFrame(function () {
            queued = false;
            cleanIframe();
          });
        });

        observer.observe(doc.body, {
          childList: true,
          subtree: true
        });
      }
    } catch (error) {
      revealFrame();

      if (currentType !== "github") {
        console.warn("LSFFL Popup Manager could not clean popup content.", error);
      }
    }
  }

  function openContentPopup(url, type, title) {
    createModal();

    previousFocus = document.activeElement;
    currentType = type || "content";
    titleElement.textContent = title || "LSFFL";
    frame.style.opacity = "0";
    frame.src = url;
    modal.hidden = false;
    document.body.classList.add("lsffl-content-popup-open");

    window.setTimeout(function () {
      closeButton.focus();
    }, 0);

    return true;
  }

  function closeModal() {
    if (!modal || modal.hidden) {
      return;
    }

    modal.hidden = true;
    frame.src = "about:blank";
    document.body.classList.remove("lsffl-content-popup-open");

    if (
      previousFocus &&
      typeof previousFocus.focus === "function"
    ) {
      previousFocus.focus();
    }
  }

  function openCenteredToolPopup(url, name, width, height) {
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
      document.documentElement.clientWidth ||
      screen.width;

    var viewportHeight =
      window.innerHeight ||
      document.documentElement.clientHeight ||
      screen.height;

    var left = Math.max(
      0,
      screenLeft + Math.round((viewportWidth - width) / 2)
    );

    var top = Math.max(
      0,
      screenTop + Math.round((viewportHeight - height) / 2)
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

    var popup = nativeWindowOpen(url, name, features);

    if (popup) {
      popup.focus();
    }

    return popup;
  }

  function popupName(link) {
    var label =
      (link.querySelector(".svg-text") || {}).textContent ||
      link.getAttribute("title") ||
      "LSFFL Tool";

    return "LSFFL_" +
      label
        .replace(/[^a-z0-9]+/gi, "_")
        .replace(/^_+|_+$/g, "");
  }

  document.addEventListener(
    "pointerdown",
    function (event) {
      var link = event.target.closest("a[href]");

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

      if (classifyContentURL(link.href)) {
        event.stopPropagation();
        event.stopImmediatePropagation();
      }
    },
    true
  );

  document.addEventListener(
    "click",
    function (event) {
      var link = event.target.closest("a[href]");

      if (
        !link ||
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey ||
        link.hasAttribute("download")
      ) {
        return;
      }

      var contentMatch = classifyContentURL(link.href);

      if (contentMatch) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        openContentPopup(
          contentMatch.url,
          contentMatch.type,
          contentMatch.title
        );

        return;
      }

      if (
        link.matches(".banner-rightside a.svg-iconlink") &&
        !link.classList.contains("icon-chat") &&
        !link.getAttribute("onclick")
      ) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var popup = openCenteredToolPopup(
          link.href,
          popupName(link),
          1180,
          820
        );

        if (!popup) {
          window.location.href = link.href;
        }
      }
    },
    true
  );

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && modal && !modal.hidden) {
      closeModal();
    }
  });

  window.addEventListener("message", function (event) {
    var data = event.data;

    if (!data || data.type !== "LSFFL_OPEN_FRANCHISE") {
      return;
    }

    var franchiseId = normalizeFranchiseId(data.franchiseId);

    if (!franchiseId) {
      return;
    }

    openContentPopup(
      "https://www48.myfantasyleague.com/2026/options" +
        "?L=23135&F=" +
        encodeURIComponent(franchiseId) +
        "&O=01",
      "franchise",
      "Franchise Center"
    );
  });

  window.lsfflOpenContentPopup = function (url, title) {
    var match = classifyContentURL(url);

    if (!match) {
      return false;
    }

    return openContentPopup(
      match.url,
      match.type,
      title || match.title
    );
  };

  window.lsfflCloseContentPopup = closeModal;
})();
