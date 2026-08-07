/*
 * LSFFL POPUP MANAGER — POP-UP 2.1
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
      if (currentType === "github") {
        revealFrame();
        return;
      }

      cleanIframe();
      window.setTimeout(cleanIframe, 100);
      window.setTimeout(cleanIframe, 400);
      window.setTimeout(cleanIframe, 900);
      window.setTimeout(cleanIframe, 1600);

      if (currentType !== "message") {
        window.setTimeout(revealFrame, 700);
      }
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

    for (
      var frameIndex = 0;
      frameIndex < nestedFrames.length;
      frameIndex += 1
    ) {
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
        /* Retry later. */
      }
    }

    return null;
  }

  function markLargeFranchiseImage(image) {
    if (
      !image ||
      image.dataset.lsfflFranchiseImageChecked === "true"
    ) {
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
        image.classList.add(
          "lsffl-popup-large-franchise-image"
        );
      }
    }

    if (image.complete) {
      applyLimit();
    } else {
      image.addEventListener("load", applyLimit, {
        once: true
      });
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
    if (
      doc.getElementById("lsffl-popup-clean-style")
    ) {
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
      "html.lsffl-popup-document body.lsffl-popup-message .myfantasyleague_menu,html.lsffl-popup-document body.lsffl-popup-message .banner-container,html.lsffl-popup-document body.lsffl-popup-message .banner-container-wrap,html.lsffl-popup-document body.lsffl-popup-message .banner-leftside,html.lsffl-popup-document body.lsffl-popup-message .banner-rightside,html.lsffl-popup-document body.lsffl-popup-message .bannerlinkicons,html.lsffl-popup-document body.lsffl-popup-message .icon-bar,html.lsffl-popup-document body.lsffl-popup-message #MFLBoxWrapper{display:none!important;visibility:hidden!important;height:0!important;min-height:0!important;margin:0!important;padding:0!important;overflow:hidden!important;}",
      "html.lsffl-popup-document a{cursor:pointer!important;}"
    ].join("");

    doc.head.appendChild(style);
  }

  function revealFrame() {
    if (frame) {
      frame.style.opacity = "1";
    }
  }

  function addBaseTag(html, pageUrl) {
    var baseTag =
      '<base href="' +
      String(pageUrl)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;") +
      '">';

    if (/<head(?:\s[^>]*)?>/i.test(html)) {
      return html.replace(
        /<head(?:\s[^>]*)?>/i,
        function (match) {
          return match + baseTag;
        }
      );
    }

    return baseTag + html;
  }

  async function loadGitHubPageIntoFrame(url) {
    try {
      var response = await fetch(url, {
        cache: "no-store",
        credentials: "omit"
      });

      if (!response.ok) {
        throw new Error(
          "GitHub page returned HTTP " +
            response.status
        );
      }

      var html = await response.text();

      frame.removeAttribute("src");
      frame.srcdoc = addBaseTag(html, url);
    } catch (error) {
      console.warn(
        "LSFFL Popup Manager could not fetch GitHub page; using direct iframe.",
        error
      );

      frame.removeAttribute("srcdoc");
      frame.src = url;

      window.setTimeout(revealFrame, 900);
    }
  }

  function cleanSameOriginDocument(doc, win, depth) {
    if (!doc || !doc.documentElement) {
      return;
    }

    var body = doc.body;
    var head = doc.head || doc.documentElement;

    doc.documentElement.classList.add(
      "lsffl-popup-document"
    );

    if (body) {
      body.classList.add("lsffl-popup-document");

      if (currentType === "message") {
        body.classList.add(
          "lsffl-popup-message"
        );
      }
    }

    if (head && body) {
      injectIframeTheme(doc);
      hideSiteChrome(doc);
      constrainFranchiseImages(doc);

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
          var labels =
            Array.prototype.map.call(
              select.options || [],
              function (option) {
                return (
                  option.textContent || ""
                ).trim();
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
    }

    if (
      currentType === "message" &&
      depth < 4
    ) {
      Array.prototype.forEach.call(
        doc.querySelectorAll("iframe,frame"),
        function (nestedFrame) {
          function cleanNested() {
            try {
              var nestedDoc =
                nestedFrame.contentDocument;

              var nestedWin =
                nestedFrame.contentWindow;

              if (nestedDoc && nestedWin) {
                cleanSameOriginDocument(
                  nestedDoc,
                  nestedWin,
                  depth + 1
                );
              }
            } catch (error) {
              /* Cross-origin nested frame. */
            }
          }

          cleanNested();

          if (
            !nestedFrame.dataset
              .lsfflNestedCleanerBound
          ) {
            nestedFrame.dataset
              .lsfflNestedCleanerBound =
              "true";

            nestedFrame.addEventListener(
              "load",
              function () {
                window.setTimeout(
                  cleanNested,
                  25
                );

                window.setTimeout(
                  cleanNested,
                  180
                );
              }
            );
          }
        }
      );
    }
  }

  function cleanIframe() {
    if (
      !frame ||
      !frame.contentWindow
    ) {
      revealFrame();
      return;
    }

    if (!frame.contentDocument) {
      revealFrame();
      return;
    }

    try {
      var doc =
        frame.contentDocument;

      var win =
        frame.contentWindow;

      var currentHref =
        String(
          win.location.href || ""
        );

      if (currentType === "message") {
        var currentUrl =
          makeAbsoluteURL(currentHref);

        var readTarget =
          findReadMessageTarget(
            doc,
            currentHref
          );

        if (readTarget) {
          var currentPid =
            currentUrl &&
            currentUrl.searchParams.get(
              "pid"
            );

          var targetPid =
            readTarget.url
              .searchParams
              .get("pid");

          if (
            currentPid &&
            targetPid &&
            currentPid === targetPid
          ) {
            if (
              readTarget.url.hash &&
              readTarget.url.hash !==
                win.location.hash
            ) {
              win.location.hash =
                readTarget.url.hash;
            }

            if (
              !doc.documentElement
                .dataset
                .lsfflReadMessageClicked
            ) {
              doc.documentElement
                .dataset
                .lsfflReadMessageClicked =
                "true";

              window.setTimeout(
                function () {
                  try {
                    readTarget.link.click();
                  } catch (error) {
                    win.location.href =
                      readTarget.url.href;
                  }
                },
                40
              );
            }

            return;
          }

          win.location.replace(
            readTarget.url.href
          );

          return;
        }
      }

      cleanSameOriginDocument(
        doc,
        win,
        0
      );

      if (currentType === "message") {
        window.setTimeout(
          function () {
            cleanSameOriginDocument(
              doc,
              win,
              0
            );
          },
          120
        );

        window.setTimeout(
          function () {
            cleanSameOriginDocument(
              doc,
              win,
              0
            );
          },
          350
        );
      }

      revealFrame();

      if (
        !doc.documentElement
          .dataset
          .lsfflPopupLinksBound
      ) {
        doc.documentElement
          .dataset
          .lsfflPopupLinksBound =
          "true";

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
              event.altKey ||
              link.hasAttribute(
                "download"
              )
            ) {
              return;
            }

            var destination =
              makeAbsoluteURL(
                link.getAttribute(
                  "href"
                ),
                win.location.href
              );

            if (
              !isMfl2026URL(
                destination
              )
            ) {
              return;
            }

            event.preventDefault();

            win.location.href =
              destination.href;
          },
          true
        );
      }

      if (
        doc.body &&
        !doc.documentElement
          .dataset
          .lsfflPopupObserver
      ) {
        doc.documentElement
          .dataset
          .lsfflPopupObserver =
          "true";

        var queued = false;

        var observer =
          new win.MutationObserver(
            function () {
              if (queued) {
                return;
              }

              queued = true;

              win.requestAnimationFrame(
                function () {
                  queued = false;

                  cleanSameOriginDocument(
                    doc,
                    win,
                    0
                  );
                }
              );
            }
          );

        observer.observe(
          doc.body,
          {
            childList: true,
            subtree: true
          }
        );
      }
    } catch (error) {
      revealFrame();

      if (
        currentType !== "github"
      ) {
        console.warn(
          "LSFFL Popup Manager could not clean popup content.",
          error
        );
      }
    }
  }

  function openContentPopup(
    url,
    type,
    title
  ) {
    createModal();

    previousFocus =
      document.activeElement;

    currentType =
      type || "content";

    titleElement.textContent =
      title || "LSFFL";

    frame.style.opacity = "0";
    frame.removeAttribute("srcdoc");

    if (currentType === "github") {
      frame.src = "about:blank";
      loadGitHubPageIntoFrame(url);
    } else {
      frame.src = url;
    }

    modal.hidden = false;

    if (
      currentType !== "message"
    ) {
      window.setTimeout(
        revealFrame,
        1200
      );
    }

    document.body.classList.add(
      "lsffl-content-popup-open"
    );

    window.setTimeout(
      function () {
        closeButton.focus();
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

    modal.hidden = true;

    frame.removeAttribute(
      "srcdoc"
    );

    frame.src = "about:blank";

    document.body.classList.remove(
      "lsffl-content-popup-open"
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

    var left = Math.max(
      0,
      screenLeft +
        Math.round(
          (viewportWidth - width) /
            2
        )
    );

    var top = Math.max(
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
    "pointerdown",
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

      if (
        classifyContentURL(
          link.href
        )
      ) {
        event.stopPropagation();
        event.stopImmediatePropagation();
      }
    },
    true
  );

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

      var contentMatch =
        classifyContentURL(
          link.href
        );

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
        event.stopImmediatePropagation();

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

  window.addEventListener(
    "message",
    function (event) {
      var data = event.data;

      if (
        !data ||
        data.type !==
          "LSFFL_OPEN_FRANCHISE"
      ) {
        return;
      }

      var franchiseId =
        normalizeFranchiseId(
          data.franchiseId
        );

      if (!franchiseId) {
        return;
      }

      openContentPopup(
        "https://www48.myfantasyleague.com/2026/options" +
          "?L=23135&F=" +
          encodeURIComponent(
            franchiseId
          ) +
          "&O=01",
        "franchise",
        "Franchise Center"
      );
    }
  );

  window.lsfflOpenContentPopup =
    function (url, title) {
      var match =
        classifyContentURL(url);

      if (!match) {
        return false;
      }

      return openContentPopup(
        match.url,
        match.type,
        title || match.title
      );
    };

  /*
   * ============================================================
   * LSFFL POP-UP 2.1 ANNOUNCEMENT CENTER
   * ============================================================
   *
   * This layer reads league information directly from the
   * MFL homepage DOM.
   *
   * It does NOT require Cloudflare for Commissioner Articles
   * or Message Board topics.
   * ============================================================
   */

  var POPUP2_CONFIG = {
    enabled: true,

    /*
     * Time before the popup automatically opens after
     * the homepage is ready.
     */
    autoOpenDelayMs: 900,

    /*
     * How long we wait for MFL's native article/message
     * summary tables to appear.
     */
    sourceWaitMs: 20000,
    sourceRetryMs: 250,

    /*
     * "Don't show again today" duration.
     */
    dismissHours: 24,

    /*
     * Prevent excessively long text from overflowing the card.
     */
    maxBodyLength: 700,

    /*
     * Manual announcements can be added here.
     *
     * Example:
     *
     * {
     *   id: "draft-2026",
     *   priority: "priority",
     *   eyebrow: "DRAFT ALERT",
     *   title: "2026 LSFFL Draft",
     *   body: "The draft begins August 23 at 1800 EST.",
     *   meta: "Commissioner Notice",
     *   countdownTo: "2026-08-23T18:00:00-04:00",
     *   countdownLabel: "DRAFT BEGINS IN",
     *   buttonText: "Open Draft Room",
     *   buttonUrl: "https://www48.myfantasyleague.com/2026/options?L=23135&O=17"
     * }
     */
    manualAnnouncements: []
  };

  var popup2 = null;
  var popup2Dialog = null;
  var popup2Close = null;
  var popup2Eyebrow = null;
  var popup2Title = null;
  var popup2Body = null;
  var popup2Meta = null;
  var popup2Image = null;
  var popup2Countdown = null;
  var popup2Action = null;
  var popup2Counter = null;
  var popup2Prev = null;
  var popup2Next = null;
  var popup2DontShow = null;

  var popup2Announcements = [];
  var popup2Index = 0;
  var popup2PreviousFocus = null;
  var popup2CountdownTimer = null;

  function popup2Escape(value) {
    return String(
      value == null
        ? ""
        : value
    );
  }

  function popup2StorageKey() {
    return (
      "lsffl_popup2_dismissed_" +
      String(
        window.location.pathname ||
          "home"
      )
    );
  }

  function popup2SeenKey(id) {
    return (
      "lsffl_popup2_seen_" +
      String(id || "")
    );
  }

  function popup2SafeStorageGet(
    key
  ) {
    try {
      return window.localStorage
        .getItem(key);
    } catch (error) {
      return null;
    }
  }

  function popup2SafeStorageSet(
    key,
    value
  ) {
    try {
      window.localStorage.setItem(
        key,
        value
      );
    } catch (error) {
      /* Storage unavailable. */
    }
  }

  function popup2IsPriority(item) {
    return (
      item &&
      String(
        item.priority || ""
      ).toLowerCase() ===
        "priority"
    );
  }

  function popup2IsActive(
    item,
    now
  ) {
    if (!item) {
      return false;
    }

    if (
      item.startAt &&
      Date.parse(item.startAt) >
        now
    ) {
      return false;
    }

    if (
      item.endAt &&
      Date.parse(item.endAt) <
        now
    ) {
      return false;
    }

    return true;
  }

  function popup2HasUnseenPriority(
    items
  ) {
    return items.some(
      function (item) {
        if (
          !popup2IsPriority(item)
        ) {
          return false;
        }

        var seen =
          popup2SafeStorageGet(
            popup2SeenKey(
              item.id
            )
          );

        return !seen;
      }
    );
  }

  function popup2ShouldAutoOpen(
    items
  ) {
    if (
      !items ||
      !items.length
    ) {
      return false;
    }

    /*
     * Priority announcements can bypass the normal
     * 24-hour dismissal if they have not been seen.
     */
    if (
      popup2HasUnseenPriority(
        items
      )
    ) {
      return true;
    }

    var dismissedUntil =
      Number(
        popup2SafeStorageGet(
          popup2StorageKey()
        ) || 0
      );

    return (
      Date.now() >
      dismissedUntil
    );
  }

  function popup2InjectStyles() {
    if (
      document.getElementById(
        "lsffl-popup2-styles"
      )
    ) {
      return;
    }

    var style =
      document.createElement(
        "style"
      );

    style.id =
      "lsffl-popup2-styles";

    style.textContent = [
      "body.lsffl-popup2-open{overflow:hidden!important;}",

      "#lsffl-popup2[hidden]{display:none!important;}",

      "#lsffl-popup2,#lsffl-popup2 *{box-sizing:border-box;}",

      "#lsffl-popup2{position:fixed;inset:0;z-index:2147483100;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(0,6,16,.88);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);}",

      "#lsffl-popup2-dialog{position:relative;width:min(920px,96vw);max-height:min(760px,94vh);overflow:hidden;border:2px solid #c9a227;border-radius:14px;background:linear-gradient(145deg,#0b2949 0%,#061426 48%,#020b18 100%);box-shadow:0 26px 80px rgba(0,0,0,.78),0 0 28px rgba(201,162,39,.12);color:#fff;}",

      "#lsffl-popup2-topbar{display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:54px;padding:8px 10px 8px 18px;border-bottom:2px solid #c9a227;background:linear-gradient(180deg,#153f64 0%,#071a2f 100%);}",

      "#lsffl-popup2-brand{min-width:0;display:flex;align-items:center;gap:10px;font-family:'Oswald','Barlow Condensed','Arial Narrow',Arial,sans-serif;font-size:20px;line-height:1;font-weight:700;letter-spacing:.8px;text-transform:uppercase;}",

      "#lsffl-popup2-brand-mark{color:#e1c45a;font-size:20px;}",

      "#lsffl-popup2-close{width:36px!important;min-width:36px!important;height:36px!important;min-height:36px!important;padding:0!important;display:grid!important;place-items:center!important;border:1px solid #e1c45a!important;border-radius:6px!important;background:#061426!important;color:#fff!important;font-family:Arial,sans-serif!important;font-size:26px!important;line-height:26px!important;font-weight:400!important;cursor:pointer!important;}",

      "#lsffl-popup2-close:hover{background:#c9a227!important;color:#061426!important;}",

      "#lsffl-popup2-content{max-height:calc(min(760px,94vh) - 54px);overflow-y:auto;padding:28px 30px 24px;scrollbar-width:thin;scrollbar-color:#c9a227 #061426;}",

      "#lsffl-popup2-content::-webkit-scrollbar{width:9px;}",

      "#lsffl-popup2-content::-webkit-scrollbar-track{background:#061426;}",

      "#lsffl-popup2-content::-webkit-scrollbar-thumb{background:#c9a227;border:2px solid #061426;border-radius:8px;}",

      "#lsffl-popup2-eyebrow{margin:0 0 8px;color:#e1c45a;font-family:'Oswald','Barlow Condensed',Arial,sans-serif;font-size:15px;line-height:1.1;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;}",

      "#lsffl-popup2-title{margin:0;color:#fff;font-family:'Oswald','Barlow Condensed','Arial Narrow',Arial,sans-serif;font-size:clamp(30px,5vw,48px);line-height:1.05;font-weight:700;letter-spacing:.2px;text-transform:uppercase;text-shadow:0 3px 8px rgba(0,0,0,.5);}",

      "#lsffl-popup2-divider{width:110px;height:3px;margin:16px 0 18px;background:linear-gradient(90deg,#e1c45a,#c9a227,transparent);}",

      "#lsffl-popup2-image{display:none;width:100%;max-height:330px;margin:0 0 20px;border:1px solid rgba(225,196,90,.65);border-radius:9px;object-fit:contain;background:#020b18;}",

      "#lsffl-popup2-body{margin:0;color:#f4f7fb;font-family:Arial,sans-serif;font-size:16px;line-height:1.6;white-space:pre-line;}",

      "#lsffl-popup2-meta{display:none;margin:16px 0 0;color:#aebdcd;font-family:Arial,sans-serif;font-size:13px;line-height:1.4;}",

      "#lsffl-popup2-countdown{display:none;margin:20px 0 0;padding:13px 14px;border:1px solid rgba(225,196,90,.75);border-radius:7px;background:rgba(2,12,26,.72);color:#e1c45a;font-family:'Oswald','Barlow Condensed',Arial,sans-serif;font-size:18px;line-height:1.2;font-weight:700;letter-spacing:.6px;text-align:center;text-transform:uppercase;}",

      "#lsffl-popup2-action-row{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:22px;}",

      "#lsffl-popup2-action{display:none;align-items:center;justify-content:center;min-height:42px;padding:9px 18px;border:1px solid #e1c45a;border-radius:6px;background:linear-gradient(180deg,#e1c45a,#c9a227);color:#061426!important;font-family:'Barlow Condensed',Arial,sans-serif;font-size:16px;font-weight:800;letter-spacing:.4px;text-decoration:none!important;text-transform:uppercase;box-shadow:0 5px 16px rgba(0,0,0,.28);}",

      "#lsffl-popup2-action:hover{filter:brightness(1.08);}",

      "#lsffl-popup2-controls{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:26px;padding-top:16px;border-top:1px solid rgba(201,162,39,.35);}",

      "#lsffl-popup2-nav{display:flex;align-items:center;gap:8px;}",

      ".lsffl-popup2-nav-btn{min-width:82px!important;min-height:36px!important;padding:6px 11px!important;border:1px solid #c9a227!important;border-radius:5px!important;background:#061426!important;color:#fff!important;font-family:'Barlow Condensed',Arial,sans-serif!important;font-size:14px!important;font-weight:800!important;text-transform:uppercase!important;cursor:pointer!important;}",

      ".lsffl-popup2-nav-btn:hover:not(:disabled){background:#c9a227!important;color:#061426!important;}",

      ".lsffl-popup2-nav-btn:disabled{opacity:.35!important;cursor:default!important;}",

      "#lsffl-popup2-counter{min-width:48px;color:#e1c45a;font-family:'Oswald',Arial,sans-serif;font-size:14px;text-align:center;}",

      "#lsffl-popup2-dismiss{display:flex;align-items:center;gap:8px;color:#d8e0ea;font-family:Arial,sans-serif;font-size:13px;cursor:pointer;}",

      "#lsffl-popup2-dismiss input{width:16px;height:16px;accent-color:#c9a227;}",

      "@media(max-width:700px){#lsffl-popup2{padding:7px;}#lsffl-popup2-dialog{width:100%;max-height:96vh;border-radius:9px;}#lsffl-popup2-content{padding:20px 16px 18px;max-height:calc(96vh - 50px);}#lsffl-popup2-topbar{min-height:50px;padding-left:12px;}#lsffl-popup2-brand{font-size:17px;}#lsffl-popup2-body{font-size:15px;}#lsffl-popup2-controls{align-items:flex-start;flex-direction:column;}#lsffl-popup2-nav{width:100%;justify-content:space-between;}.lsffl-popup2-nav-btn{flex:1;}#lsffl-popup2-counter{min-width:52px;}}"
    ].join("");

    document.head.appendChild(
      style
    );
  }

  function popup2Create() {
    if (popup2) {
      return;
    }

    popup2InjectStyles();

    popup2 =
      document.createElement(
        "div"
      );

    popup2.id =
      "lsffl-popup2";

    popup2.hidden = true;

    popup2.setAttribute(
      "role",
      "dialog"
    );

    popup2.setAttribute(
      "aria-modal",
      "true"
    );

    popup2.setAttribute(
      "aria-labelledby",
      "lsffl-popup2-title"
    );

    popup2Dialog =
      document.createElement(
        "div"
      );

    popup2Dialog.id =
      "lsffl-popup2-dialog";

    var topBar =
      document.createElement(
        "div"
      );

    topBar.id =
      "lsffl-popup2-topbar";

    var brand =
      document.createElement(
        "div"
      );

    brand.id =
      "lsffl-popup2-brand";

    var brandMark =
      document.createElement(
        "span"
      );

    brandMark.id =
      "lsffl-popup2-brand-mark";

    brandMark.textContent =
      "★";

    var brandText =
      document.createElement(
        "span"
      );

    brandText.textContent =
      "Navy Times • LSFFL Announcement Center";

    brand.appendChild(
      brandMark
    );

    brand.appendChild(
      brandText
    );

    popup2Close =
      document.createElement(
        "button"
      );

    popup2Close.id =
      "lsffl-popup2-close";

    popup2Close.type =
      "button";

    popup2Close.setAttribute(
      "aria-label",
      "Close announcement"
    );

    popup2Close.textContent =
      "×";

    topBar.appendChild(
      brand
    );

    topBar.appendChild(
      popup2Close
    );

    var content =
      document.createElement(
        "div"
      );

    content.id =
      "lsffl-popup2-content";

    popup2Eyebrow =
      document.createElement(
        "div"
      );

    popup2Eyebrow.id =
      "lsffl-popup2-eyebrow";

    popup2Title =
      document.createElement(
        "h2"
      );

    popup2Title.id =
      "lsffl-popup2-title";

    var divider =
      document.createElement(
        "div"
      );

    divider.id =
      "lsffl-popup2-divider";

    popup2Image =
      document.createElement(
        "img"
      );

    popup2Image.id =
      "lsffl-popup2-image";

    popup2Body =
      document.createElement(
        "p"
      );

    popup2Body.id =
      "lsffl-popup2-body";

    popup2Meta =
      document.createElement(
        "div"
      );

    popup2Meta.id =
      "lsffl-popup2-meta";

    popup2Countdown =
      document.createElement(
        "div"
      );

    popup2Countdown.id =
      "lsffl-popup2-countdown";

    var actionRow =
      document.createElement(
        "div"
      );

    actionRow.id =
      "lsffl-popup2-action-row";

    popup2Action =
      document.createElement(
        "a"
      );

    popup2Action.id =
      "lsffl-popup2-action";

    popup2Action.href =
      "#";

    actionRow.appendChild(
      popup2Action
    );

    var controls =
      document.createElement(
        "div"
      );

    controls.id =
      "lsffl-popup2-controls";

    var nav =
      document.createElement(
        "div"
      );

    nav.id =
      "lsffl-popup2-nav";

    popup2Prev =
      document.createElement(
        "button"
      );

    popup2Prev.type =
      "button";

    popup2Prev.className =
      "lsffl-popup2-nav-btn";

    popup2Prev.textContent =
      "Previous";

    popup2Counter =
      document.createElement(
        "span"
      );

    popup2Counter.id =
      "lsffl-popup2-counter";

    popup2Next =
      document.createElement(
        "button"
      );

    popup2Next.type =
      "button";

    popup2Next.className =
      "lsffl-popup2-nav-btn";

    popup2Next.textContent =
      "Next";

    nav.appendChild(
      popup2Prev
    );

    nav.appendChild(
      popup2Counter
    );

    nav.appendChild(
      popup2Next
    );

    var dismissLabel =
      document.createElement(
        "label"
      );

    dismissLabel.id =
      "lsffl-popup2-dismiss";

    popup2DontShow =
      document.createElement(
        "input"
      );

    popup2DontShow.type =
      "checkbox";

    var dismissText =
      document.createElement(
        "span"
      );

    dismissText.textContent =
      "Don't show again today";

    dismissLabel.appendChild(
      popup2DontShow
    );

    dismissLabel.appendChild(
      dismissText
    );

    controls.appendChild(
      nav
    );

    controls.appendChild(
      dismissLabel
    );

    content.appendChild(
      popup2Eyebrow
    );

    content.appendChild(
      popup2Title
    );

    content.appendChild(
      divider
    );

    content.appendChild(
      popup2Image
    );

    content.appendChild(
      popup2Body
    );

    content.appendChild(
      popup2Meta
    );

    content.appendChild(
      popup2Countdown
    );

    content.appendChild(
      actionRow
    );

    content.appendChild(
      controls
    );

    popup2Dialog.appendChild(
      topBar
    );

    popup2Dialog.appendChild(
      content
    );

    popup2.appendChild(
      popup2Dialog
    );

    document.body.appendChild(
      popup2
    );

    popup2Close.addEventListener(
      "click",
      popup2CloseModal
    );

    popup2Prev.addEventListener(
      "click",
      function () {
        popup2ShowIndex(
          popup2Index - 1
        );
      }
    );

    popup2Next.addEventListener(
      "click",
      function () {
        popup2ShowIndex(
          popup2Index + 1
        );
      }
    );

    popup2.addEventListener(
      "click",
      function (event) {
        if (
          event.target === popup2
        ) {
          popup2CloseModal();
        }
      }
    );

    popup2Action.addEventListener(
      "click",
      function (event) {
        var item =
          popup2Announcements[
            popup2Index
          ];

        if (
          !item ||
          !item.buttonUrl
        ) {
          return;
        }

        var match =
          classifyContentURL(
            item.buttonUrl
          );

        if (match) {
          event.preventDefault();

          popup2CloseModal();

          openContentPopup(
            match.url,
            match.type,
            match.title
          );
        }
      }
    );
  }

  function popup2CleanText(value) {
    return String(
      value || ""
    )
      .replace(/\s+/g, " ")
      .trim();
  }

  function popup2TrimBody(value) {
    var body =
      popup2CleanText(value);

    if (
      body.length >
      POPUP2_CONFIG.maxBodyLength
    ) {
      body =
        body
          .slice(
            0,
            POPUP2_CONFIG
              .maxBodyLength
          )
          .replace(
            /\s+\S*$/,
            ""
          ) +
        "…";
    }

    return body;
  }

  function popup2AbsoluteUrl(
    value
  ) {
    try {
      return new URL(
        value,
        window.location.href
      ).href;
    } catch (error) {
      return "";
    }
  }

  function popup2FindNativeTable(
    id,
    moduleSelector
  ) {
    /*
     * First preference:
     * the cleaned copy already placed inside League Central.
     */
    var moduleTable =
      document.querySelector(
        moduleSelector +
          " table#" +
          id +
          ", " +
          moduleSelector +
          " table"
      );

    if (moduleTable) {
      return moduleTable;
    }

    /*
     * Fallback:
     * native MFL source table rendered elsewhere on the page.
     */
    var tables =
      document.querySelectorAll(
        "table#" + id
      );

    if (tables.length) {
      return tables[0];
    }

    return null;
  }

  function popup2UsableRows(
    table
  ) {
    if (!table) {
      return [];
    }

    return Array.prototype.filter.call(
      table.querySelectorAll(
        "tr"
      ),
      function (row) {
        var text =
          popup2CleanText(
            row.textContent
          );

        if (!text) {
          return false;
        }

        if (
          /view all articles|write new article|post new topic|new messages|view message board/i.test(
            text
          )
        ) {
          return false;
        }

        if (
          row.querySelector("th") &&
          !row.querySelector("td")
        ) {
          return false;
        }

        return Boolean(
          row.querySelector(
            "a[href]"
          )
        );
      }
    );
  }

  function popup2ExtractArticle() {
    var table =
      popup2FindNativeTable(
        "article_summary",
        ".lsffl-article-module"
      );

    var rows =
      popup2UsableRows(table);

    if (!rows.length) {
      return null;
    }

    var row = rows[0];

    var link =
      row.querySelector(
        "a[href]"
      );

    var cells =
      row.querySelectorAll(
        "td"
      );

    var title =
      popup2CleanText(
        link
          ? link.textContent
          : (
              cells[0] ||
              row
            ).textContent
      );

    var date =
      cells.length
        ? popup2CleanText(
            cells[
              cells.length - 1
            ].textContent
          )
        : "";

    var url =
      link
        ? popup2AbsoluteUrl(
            link.getAttribute(
              "href"
            )
          )
        : "";

    if (!title) {
      return null;
    }

    return {
      id:
        "article-" +
        popup2CleanText(
          url || title
        )
          .replace(
            /\W+/g,
            "-"
          )
          .toLowerCase(),

      priority: "normal",

      eyebrow:
        "COMMISSIONER ARTICLE",

      title: title,

      body:
        "A new Commissioner Article is available in League Central. Open the full article for the complete update.",

      meta: date,

      buttonText:
        "Open Full Article",

      buttonUrl: url
    };
  }

  function popup2ExtractMessage() {
    var table =
      popup2FindNativeTable(
        "message_board_summary",
        ".lsffl-message-board-module"
      );

    var rows =
      popup2UsableRows(table);

    if (!rows.length) {
      return null;
    }

    var row = rows[0];

    var link =
      row.querySelector(
        "a[href]"
      );

    var cells =
      row.querySelectorAll(
        "td"
      );

    var title =
      popup2CleanText(
        link
          ? link.textContent
          : (
              cells[0] ||
              row
            ).textContent
      );

    var metaParts = [];

    for (
      var i = 1;
      i < cells.length;
      i += 1
    ) {
      var part =
        popup2CleanText(
          cells[i].textContent
        );

      if (
        part &&
        metaParts.indexOf(
          part
        ) === -1
      ) {
        metaParts.push(part);
      }
    }

    var url =
      link
        ? popup2AbsoluteUrl(
            link.getAttribute(
              "href"
            )
          )
        : "";

    if (!title) {
      return null;
    }

    return {
      id:
        "message-" +
        popup2CleanText(
          url || title
        )
          .replace(
            /\W+/g,
            "-"
          )
          .toLowerCase(),

      priority: "normal",

      eyebrow:
        "MESSAGE BOARD",

      title: title,

      body:
        "There is a new LSFFL message-board topic. Open the full message to read the discussion and reply.",

      meta:
        metaParts.join(
          " • "
        ),

      buttonText:
        "Open Full Message",

      buttonUrl: url
    };
  }

  function popup2ReadNativeSources() {
    var nativeItems = [];

    var article =
      popup2ExtractArticle();

    var message =
      popup2ExtractMessage();

    if (article) {
      nativeItems.push(
        article
      );
    }

    if (message) {
      nativeItems.push(
        message
      );
    }

    return nativeItems;
  }

  function popup2LoadAnnouncements() {
    var now = Date.now();

    var manual =
      (
        POPUP2_CONFIG
          .manualAnnouncements ||
        []
      ).filter(
        function (item) {
          return popup2IsActive(
            item,
            now
          );
        }
      );

    return new Promise(
      function (resolve) {
        var startedAt =
          Date.now();

        var finished =
          false;

        function finish(
          nativeItems
        ) {
          if (finished) {
            return;
          }

          finished = true;

          var combined =
            manual.concat(
              nativeItems || []
            );

          var ids =
            Object.create(null);

          popup2Announcements =
            combined
              .filter(
                function (item) {
                  if (
                    !item ||
                    !item.id ||
                    ids[item.id]
                  ) {
                    return false;
                  }

                  ids[item.id] =
                    true;

                  return true;
                }
              )
              .sort(
                function (a, b) {
                  return (
                    Number(
                      popup2IsPriority(
                        b
                      )
                    ) -
                    Number(
                      popup2IsPriority(
                        a
                      )
                    )
                  );
                }
              );

          resolve(
            popup2Announcements
          );
        }

        function check() {
          var nativeItems =
            popup2ReadNativeSources();

          var articleReady =
            Boolean(
              popup2FindNativeTable(
                "article_summary",
                ".lsffl-article-module"
              )
            );

          var messageReady =
            Boolean(
              popup2FindNativeTable(
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
              startedAt >=
              POPUP2_CONFIG
                .sourceWaitMs
          ) {
            finish(nativeItems);
            return;
          }

          window.setTimeout(
            check,
            POPUP2_CONFIG
              .sourceRetryMs
          );
        }

        check();
      }
    );
  }

  function popup2RenderCountdown(
    item
  ) {
    var el =
      document.getElementById(
        "lsffl-popup2-countdown"
      );

    if (
      popup2CountdownTimer
    ) {
      window.clearInterval(
        popup2CountdownTimer
      );

      popup2CountdownTimer =
        null;
    }

    if (
      !el ||
      !item ||
      !item.countdownTo
    ) {
      if (el) {
        el.style.display =
          "none";
      }

      return;
    }

    function update() {
      var remaining =
        Date.parse(
          item.countdownTo
        ) -
        Date.now();

      if (
        isNaN(remaining) ||
        remaining <= 0
      ) {
        el.textContent =
          item.countdownFinishedText ||
          "The countdown is complete.";

        return;
      }

      var days =
        Math.floor(
          remaining /
            86400000
        );

      var hours =
        Math.floor(
          (
            remaining %
            86400000
          ) /
            3600000
        );

      var minutes =
        Math.floor(
          (
            remaining %
            3600000
          ) /
            60000
        );

      var seconds =
        Math.floor(
          (
            remaining %
            60000
          ) /
            1000
        );

      el.textContent =
        (
          item.countdownLabel ||
          "COUNTDOWN"
        ) +
        ": " +
        days +
        "d " +
        hours +
        "h " +
        minutes +
        "m " +
        seconds +
        "s";
    }

    el.style.display =
      "block";

    update();

    popup2CountdownTimer =
      window.setInterval(
        update,
        1000
      );
  }

  function popup2ShowIndex(
    index
  ) {
    if (
      !popup2Announcements.length
    ) {
      return;
    }

    popup2Index =
      Math.max(
        0,
        Math.min(
          index,
          popup2Announcements
            .length - 1
        )
      );

    var item =
      popup2Announcements[
        popup2Index
      ];

    popup2Eyebrow.textContent =
      popup2Escape(
        item.eyebrow ||
          (
            popup2IsPriority(
              item
            )
              ? "PRIORITY COMMISSIONER ALERT"
              : "LSFFL LEAGUE UPDATE"
          )
      );

    popup2Title.textContent =
      popup2Escape(
        item.title ||
          "LSFFL Update"
      );

    popup2Body.textContent =
      popup2Escape(
        popup2TrimBody(
          item.body || ""
        )
      );

    popup2Meta.textContent =
      popup2Escape(
        item.meta || ""
      );

    popup2Meta.style.display =
      item.meta
        ? "block"
        : "none";

    if (item.imageUrl) {
      popup2Image.src =
        item.imageUrl;

      popup2Image.alt =
        item.imageAlt ||
        item.title ||
        "LSFFL announcement image";

      popup2Image.style.display =
        "block";
    } else {
      popup2Image.removeAttribute(
        "src"
      );

      popup2Image.style.display =
        "none";
    }

    if (item.buttonUrl) {
      popup2Action.href =
        item.buttonUrl;

      popup2Action.textContent =
        item.buttonText ||
        "Read More";

      popup2Action.style.display =
        "inline-flex";
    } else {
      popup2Action.removeAttribute(
        "href"
      );

      popup2Action.style.display =
        "none";
    }

    popup2Counter.textContent =
      (
        popup2Index + 1
      ) +
      " / " +
      popup2Announcements
        .length;

    popup2Prev.disabled =
      popup2Index === 0;

    popup2Next.disabled =
      popup2Index ===
      popup2Announcements
        .length - 1;

    popup2RenderCountdown(
      item
    );

    if (
      popup2IsPriority(item)
    ) {
      popup2SafeStorageSet(
        popup2SeenKey(
          item.id
        ),
        String(
          Date.now()
        )
      );
    }
  }

  function popup2Open(
    items,
    startIndex
  ) {
    if (
      Array.isArray(items)
    ) {
      popup2Announcements =
        items;
    }

    if (
      !popup2Announcements.length
    ) {
      return false;
    }

    popup2Create();

    popup2PreviousFocus =
      document.activeElement;

    popup2DontShow.checked =
      false;

    popup2.hidden =
      false;

    document.body.classList.add(
      "lsffl-popup2-open"
    );

    popup2ShowIndex(
      Number(startIndex) || 0
    );

    window.setTimeout(
      function () {
        popup2Close.focus();
      },
      0
    );

    return true;
  }

  function popup2CloseModal() {
    if (
      !popup2 ||
      popup2.hidden
    ) {
      return;
    }

    if (
      popup2DontShow &&
      popup2DontShow.checked
    ) {
      popup2SafeStorageSet(
        popup2StorageKey(),
        String(
          Date.now() +
            POPUP2_CONFIG
              .dismissHours *
              60 *
              60 *
              1000
        )
      );
    }

    popup2.hidden =
      true;

    document.body.classList.remove(
      "lsffl-popup2-open"
    );

    if (
      popup2CountdownTimer
    ) {
      window.clearInterval(
        popup2CountdownTimer
      );

      popup2CountdownTimer =
        null;
    }

    if (
      popup2PreviousFocus &&
      typeof popup2PreviousFocus
        .focus ===
        "function"
    ) {
      popup2PreviousFocus.focus();
    }
  }

  function popup2Boot() {
    if (
      !POPUP2_CONFIG.enabled ||
      window.top !== window.self
    ) {
      return;
    }

    popup2LoadAnnouncements()
      .then(
        function (items) {
          if (
            !popup2ShouldAutoOpen(
              items
            )
          ) {
            return;
          }

          window.setTimeout(
            function () {
              popup2Open(
                items,
                0
              );
            },
            POPUP2_CONFIG
              .autoOpenDelayMs
          );
        }
      );
  }

  window.lsfflPopup2 = {
    open: function () {
      if (
        popup2Announcements
          .length
      ) {
        return popup2Open(
          popup2Announcements,
          0
        );
      }

      return popup2LoadAnnouncements()
        .then(
          function (items) {
            return popup2Open(
              items,
              0
            );
          }
        );
    },

    close:
      popup2CloseModal,

    reload:
      popup2LoadAnnouncements,

    config:
      POPUP2_CONFIG
  };

  document.addEventListener(
    "keydown",
    function (event) {
      if (
        event.key ===
          "Escape" &&
        popup2 &&
        !popup2.hidden
      ) {
        popup2CloseModal();
      }

      if (
        !popup2 ||
        popup2.hidden
      ) {
        return;
      }

      if (
        event.key ===
        "ArrowLeft"
      ) {
        popup2ShowIndex(
          popup2Index - 1
        );
      }

      if (
        event.key ===
        "ArrowRight"
      ) {
        popup2ShowIndex(
          popup2Index + 1
        );
      }
    }
  );

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      popup2Boot,
      {
        once: true
      }
    );
  } else {
    popup2Boot();
  }

  window.lsfflCloseContentPopup =
    closeModal;
})();
