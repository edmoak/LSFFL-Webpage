/*
 * LSFFL POPUP MANAGER — POP-UP 2.2
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
  var messageReadRetries = 0;
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
      /*
       * GitHub pages are cross-origin, so their document cannot be inspected
       * from MFL. Reveal them immediately when the iframe finishes loading.
       */
      if (currentType === "github") {
        revealFrame();
        return;
      }

      cleanIframe();
      window.setTimeout(cleanIframe, 100);
      window.setTimeout(cleanIframe, 400);
      window.setTimeout(cleanIframe, 900);
      window.setTimeout(cleanIframe, 1600);

      /*
       * Do not reveal message pages until the intermediate Read Message page
       * has been replaced and the real topic page has been cleaned.
       */
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

        try {
          decorateFranchiseLogo(image.ownerDocument || document);
        } catch (error) {
          /* Branding is cosmetic; never block the franchise page. */
        }
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

    decorateFranchiseLogo(doc);
  }

  function getFranchiseName(doc) {
    if (!doc || !doc.body) {
      return "";
    }

    /*
     * MFL's franchise navigation normally includes text such as
     * "Cougars: Main | Roster | ...". That is the cleanest source because
     * it is generated from MFL's real franchise name and requires no hard-code.
     */
    var bodyText = String(doc.body.innerText || doc.body.textContent || "")
      .replace(/\s+/g, " ")
      .trim();

    var navMatch = bodyText.match(
      /(?:^|\s)([A-Za-z0-9][A-Za-z0-9'’&. \/_-]{1,45}?):\s*Main\b/i
    );

    if (navMatch && navMatch[1]) {
      return navMatch[1].replace(/\s+/g, " ").trim();
    }

    /*
     * Fallback for skins that place the franchise name in a module heading.
     */
    var candidates = Array.prototype.slice.call(
      doc.querySelectorAll(
        ".modulehead, .moduleheader, h1, h2, h3, caption, th"
      )
    );

    for (var index = 0; index < candidates.length; index += 1) {
      var text = String(candidates[index].textContent || "")
        .replace(/\s+/g, " ")
        .trim();

      if (
        text.length >= 2 &&
        text.length <= 45 &&
        !/^(main|roster|roster w\/?stats|scoring history|transactions|schedule|accounting|series records|box score|my options|franchise center)$/i.test(text)
      ) {
        return text.replace(/:\s*main.*$/i, "").trim();
      }
    }

    return "";
  }

  function decorateFranchiseLogo(doc) {
    if (currentType !== "franchise" || !doc || !doc.body) {
      return;
    }

    var franchiseName = getFranchiseName(doc);

    if (!franchiseName) {
      return;
    }

    Array.prototype.forEach.call(
      doc.querySelectorAll("img.lsffl-popup-large-franchise-image"),
      function (image) {
        if (image.dataset.lsfflFranchiseBrandAdded === "true") {
          return;
        }

        image.dataset.lsfflFranchiseBrandAdded = "true";

        var brand = doc.createElement("div");
        brand.className = "lsffl-popup-franchise-brand";

        var name = doc.createElement("div");
        name.className = "lsffl-popup-franchise-brand-name";
        name.textContent = franchiseName;

        var line = doc.createElement("div");
        line.className = "lsffl-popup-franchise-brand-line";

        brand.appendChild(name);
        brand.appendChild(line);

        if (image.parentNode) {
          image.parentNode.insertBefore(brand, image);
        }
      }
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

      "html.lsffl-popup-document body.lsffl-popup-franchise .lsffl-popup-franchise-brand{display:block!important;width:min(700px,92%)!important;margin:18px auto 4px!important;padding:0 10px!important;text-align:center!important;background:transparent!important;border:0!important;box-shadow:none!important;}",

      "html.lsffl-popup-document body.lsffl-popup-franchise .lsffl-popup-franchise-brand-name{margin:0!important;padding:0!important;color:#fff!important;font-family:'Oswald','Barlow Condensed','Arial Narrow',Arial,sans-serif!important;font-size:clamp(28px,4vw,42px)!important;line-height:1.05!important;font-weight:800!important;letter-spacing:1.2px!important;text-transform:uppercase!important;text-shadow:0 3px 8px rgba(0,0,0,.55)!important;}",

      "html.lsffl-popup-document body.lsffl-popup-franchise .lsffl-popup-franchise-brand-line{width:130px!important;height:3px!important;margin:10px auto 0!important;background:linear-gradient(90deg,transparent,#c9a227,#e1c45a,#c9a227,transparent)!important;border:0!important;}",

      "html.lsffl-popup-document body.lsffl-popup-franchise .lsffl-popup-franchise-brand + img.lsffl-popup-large-franchise-image{margin-top:10px!important;}",

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
          "GitHub page returned HTTP " + response.status
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

    doc.documentElement.classList.add("lsffl-popup-document");

    if (body) {
      body.classList.add("lsffl-popup-document");

      if (currentType === "message") {
        body.classList.add("lsffl-popup-message");
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
              /*
               * Cross-origin nested frames are left untouched.
               */
            }
          }

          cleanNested();

          if (
            !nestedFrame.dataset.lsfflNestedCleanerBound
          ) {
            nestedFrame.dataset.lsfflNestedCleanerBound =
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
    if (!frame || !frame.contentWindow) {
      revealFrame();
      return;
    }

    if (!frame.contentDocument) {
      revealFrame();
      return;
    }

    try {
      var doc = frame.contentDocument;
      var win = frame.contentWindow;
      var currentHref = String(
        win.location.href || ""
      );

      /*
       * MFL's O=28 page embeds a large "Read Message" graphic,
       * sometimes inside another iframe. Find the real PID link
       * recursively and replace the outer popup iframe with the
       * actual message page.
       */
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
            readTarget.url.searchParams.get(
              "pid"
            );

          /*
           * MFL sometimes serves the giant yellow "Read Message"
           * page at the same PID URL. A normal redirect changes
           * nothing, so activate the actual Read Message link.
           */
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
              !doc.documentElement.dataset
                .lsfflReadMessageClicked
            ) {
              doc.documentElement.dataset
                .lsfflReadMessageClicked =
                "true";

              messageReadRetries += 1;

              window.setTimeout(
                function () {
                  try {
                    readTarget.link.click();
                  } catch (error) {
                    /*
                     * MFL sometimes uses the same PID URL
                     * for the Read Message gate.
                     */
                  }
                },
                40
              );

              /*
               * Clicking MFL's yellow Read Message link may
               * only mark the post read and leave the gate.
               *
               * Automatically reload the PID once or twice
               * so the real message replaces the intermediary.
               */
              if (messageReadRetries <= 2) {
                window.setTimeout(
                  function () {
                    try {
                      var stillBlocked =
                        findReadMessageTarget(
                          doc,
                          win.location.href
                        );

                      if (stillBlocked) {
                        win.location.reload();
                      }
                    } catch (error) {
                      win.location.href =
                        readTarget.url.href;
                    }
                  },
                  220
                );
              } else {
                /*
                 * Safety net: never leave an invisible frame.
                 */
                window.setTimeout(
                  revealFrame,
                  350
                );
              }
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
        !doc.documentElement.dataset
          .lsfflPopupLinksBound
      ) {
        doc.documentElement.dataset
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
        !doc.documentElement.dataset
          .lsfflPopupObserver
      ) {
        doc.documentElement.dataset
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

    /*
     * Reset the special Message Board gate counter
     * every time a new popup is opened.
     */
    messageReadRetries = 0;

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

    /*
     * Final safety net: even if a browser blocks iframe
     * inspection or MFL changes its message-page structure,
     * loaded content will still appear.
     */
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

    frame.src =
      "about:blank";

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
          (viewportWidth - width) / 2
        )
    );

    var top = Math.max(
      0,
      screenTop +
        Math.round(
          (viewportHeight - height) / 2
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


  /* =========================================================
     LSFFL POP-UP 2.2 — NATIVE MFL ANNOUNCEMENT CENTER
     ========================================================= */

  var POPUP2_CONFIG = {
    enabled: true,
    autoOpen: true,

    /*
     * Delay after the homepage data is ready.
     */
    autoOpenDelayMs: 1200,

    /*
     * "Don't show announcements again" duration.
     */
    dismissHours: 24,

    leagueId: "23135",
    year: "2026",

    maxBodyLength: 900,

    /*
     * How long Pop-Up 2.2 waits for the native MFL
     * article and message-board tables.
     */
    sourceWaitMs: 20000,
    sourceRetryMs: 250,

    /*
     * Manual commissioner announcements can be
     * added here later without changing the
     * MFL article/message-board system.
     */
    manualAnnouncements: [
      {
        id: "welcome-2026",
        priority: "normal",
        eyebrow: "COMMISSIONER'S DESK",
        title: "Welcome to the 2026 LSFFL Season",

        body:
          "The Lamad Squad Fantasy Football League is back. " +
          "Check Navy Times and League Central throughout the season " +
          "for commissioner updates, league news, message-board activity, " +
          "and everything happening around the LSFFL.",

        buttonText: "",
        buttonUrl: "",

        start:
          "2026-08-01T00:00:00-04:00",

        end:
          "2026-09-15T23:59:59-04:00"
      }
    ]
  };

  var popup2 = null;
  var popup2Dialog = null;
  var popup2Title = null;
  var popup2Eyebrow = null;
  var popup2Body = null;
  var popup2Meta = null;
  var popup2Image = null;
  var popup2Action = null;
  var popup2Prev = null;
  var popup2Next = null;
  var popup2Counter = null;
  var popup2DontShow = null;
  var popup2Close = null;

  var popup2Announcements = [];
  var popup2Index = 0;
  var popup2PreviousFocus = null;
  var popup2CountdownTimer = null;

  function popup2StorageKey() {
    return "lsffl-popup2-dismissed-until";
  }

  function popup2SeenKey(id) {
    return (
      "lsffl-popup2-seen-" +
      String(
        id || "announcement"
      )
    );
  }

  function popup2SafeStorageGet(
    key
  ) {
    try {
      return window.localStorage.getItem(
        key
      );
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
      /*
       * Storage unavailable.
       */
    }
  }

  function popup2Escape(value) {
    return String(
      value == null
        ? ""
        : value
    );
  }

  function popup2IsActive(
    item,
    now
  ) {
    if (!item) {
      return false;
    }

    var start =
      item.start
        ? Date.parse(item.start)
        : NaN;

    var end =
      item.end
        ? Date.parse(item.end)
        : NaN;

    if (
      !isNaN(start) &&
      now < start
    ) {
      return false;
    }

    if (
      !isNaN(end) &&
      now > end
    ) {
      return false;
    }

    return true;
  }

  function popup2IsPriority(
    item
  ) {
    return Boolean(
      item &&
      String(
        item.priority || ""
      ).toLowerCase() ===
        "priority"
    );
  }

  function popup2ShouldAutoOpen(
    items
  ) {
    if (
      !POPUP2_CONFIG.enabled ||
      !POPUP2_CONFIG.autoOpen ||
      !items.length
    ) {
      return false;
    }

    /*
     * Unseen priority announcements override
     * a normal 24-hour dismissal.
     */
    var priorityItem =
      items.some(
        function (item) {
          return (
            popup2IsPriority(
              item
            ) &&
            !popup2SafeStorageGet(
              popup2SeenKey(
                item.id
              )
            )
          );
        }
      );

    if (priorityItem) {
      return true;
    }

    var dismissedUntil =
      Number(
        popup2SafeStorageGet(
          popup2StorageKey()
        ) || 0
      );

    return (
      !dismissedUntil ||
      Date.now() >=
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

      "#lsffl-popup2{position:fixed;inset:0;z-index:2147483100;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(0,7,18,.88);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);font-family:'Barlow Condensed','Roboto Condensed','Arial Narrow',Arial,sans-serif;}",

      "#lsffl-popup2-dialog{position:relative;width:min(760px,96vw);max-height:min(780px,94vh);display:flex;flex-direction:column;overflow:hidden;border:2px solid #c9a227;border-radius:14px;background:linear-gradient(180deg,#0c2846 0%,#061426 52%,#02091a 100%);color:#fff;box-shadow:0 24px 90px rgba(0,0,0,.78);}",

      "#lsffl-popup2-topline{height:6px;flex:0 0 6px;background:linear-gradient(90deg,#c9a227,#f0d776,#c9a227);}",

      "#lsffl-popup2-header{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;padding:22px 22px 10px;}",

      "#lsffl-popup2-heading{min-width:0;}",

      "#lsffl-popup2-eyebrow{margin:0 0 5px;color:#e1c45a;font-size:13px;font-weight:900;letter-spacing:1.7px;text-transform:uppercase;}",

      "#lsffl-popup2-title{margin:0;color:#fff;font-size:clamp(25px,4vw,36px);line-height:1.03;font-weight:900;letter-spacing:.4px;text-transform:uppercase;}",

      "#lsffl-popup2-close{width:38px!important;min-width:38px!important;height:38px!important;padding:0!important;display:grid!important;place-items:center!important;border:1px solid rgba(225,196,90,.8)!important;border-radius:8px!important;background:#061426!important;color:#fff!important;font:400 28px/1 Arial,sans-serif!important;cursor:pointer!important;}",

      "#lsffl-popup2-close:hover{background:#c9a227!important;color:#061426!important;}",

      "#lsffl-popup2-media{padding:4px 22px 0;}",

      "#lsffl-popup2-image{display:none;width:100%;max-height:285px;object-fit:contain;border:1px solid rgba(201,162,39,.36);border-radius:10px;background:rgba(0,0,0,.2);}",

      "#lsffl-popup2-content{overflow:auto;padding:14px 22px 8px;}",

      "#lsffl-popup2-meta{margin:0 0 11px;color:#aebdcd;font-size:14px;font-weight:700;letter-spacing:.3px;}",

      "#lsffl-popup2-body{margin:0;color:#eef4fb;font-family:Arial,sans-serif;font-size:17px;line-height:1.58;white-space:pre-line;}",

      "#lsffl-popup2-countdown{display:none;margin:18px 0 2px;padding:12px 14px;border:1px solid rgba(201,162,39,.45);border-radius:9px;background:rgba(201,162,39,.09);color:#e1c45a;text-align:center;font-size:19px;font-weight:900;letter-spacing:.5px;}",

      "#lsffl-popup2-actions{display:flex;flex-wrap:wrap;align-items:center;gap:10px;padding:16px 22px 12px;}",

      "#lsffl-popup2-action{display:none;align-items:center;justify-content:center;min-height:42px;padding:9px 18px;border:1px solid #e1c45a;border-radius:8px;background:#c9a227;color:#061426!important;text-decoration:none!important;font-size:16px;font-weight:900;letter-spacing:.5px;text-transform:uppercase;}",

      "#lsffl-popup2-action:hover{background:#e1c45a;}",

      "#lsffl-popup2-nav{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 22px;border-top:1px solid rgba(201,162,39,.3);background:rgba(0,0,0,.18);}",

      ".lsffl-popup2-navbtn{min-width:86px!important;min-height:36px!important;padding:7px 12px!important;border:1px solid rgba(225,196,90,.7)!important;border-radius:7px!important;background:#071a2f!important;color:#fff!important;font-size:14px!important;font-weight:900!important;letter-spacing:.45px!important;text-transform:uppercase!important;cursor:pointer!important;}",

      ".lsffl-popup2-navbtn:disabled{opacity:.35;cursor:default!important;}",

      "#lsffl-popup2-counter{color:#e1c45a;font-size:14px;font-weight:900;letter-spacing:.8px;}",

      "#lsffl-popup2-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 22px 14px;color:#aebdcd;font-family:Arial,sans-serif;font-size:12px;}",

      "#lsffl-popup2-dontshow{display:flex;align-items:center;gap:7px;cursor:pointer;}",

      "#lsffl-popup2-dontshow input{width:16px;height:16px;accent-color:#c9a227;}",

      "#lsffl-popup2-brand{font-weight:700;letter-spacing:.3px;}",

      "@media(max-width:600px){#lsffl-popup2{padding:8px;}#lsffl-popup2-dialog{width:100%;max-height:96vh;border-radius:10px;}#lsffl-popup2-header{padding:17px 15px 8px;}#lsffl-popup2-media,#lsffl-popup2-content,#lsffl-popup2-actions{padding-left:15px;padding-right:15px;}#lsffl-popup2-nav,#lsffl-popup2-footer{padding-left:15px;padding-right:15px;}#lsffl-popup2-body{font-size:16px;}#lsffl-popup2-footer{align-items:flex-start;flex-direction:column;}}"
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

    popup2.innerHTML =
      '' +

      '<div id="lsffl-popup2-dialog">' +

        '<div id="lsffl-popup2-topline"></div>' +

        '<header id="lsffl-popup2-header">' +

          '<div id="lsffl-popup2-heading">' +
            '<div id="lsffl-popup2-eyebrow">LSFFL</div>' +
            '<h2 id="lsffl-popup2-title">League Update</h2>' +
          '</div>' +

          '<button id="lsffl-popup2-close" type="button" aria-label="Close announcement">×</button>' +

        '</header>' +

        '<div id="lsffl-popup2-media">' +
          '<img id="lsffl-popup2-image" alt="">' +
        '</div>' +

        '<div id="lsffl-popup2-content">' +
          '<div id="lsffl-popup2-meta"></div>' +
          '<p id="lsffl-popup2-body"></p>' +
          '<div id="lsffl-popup2-countdown"></div>' +
        '</div>' +

        '<div id="lsffl-popup2-actions">' +
          '<a id="lsffl-popup2-action" href="#">Read More</a>' +
        '</div>' +

        '<div id="lsffl-popup2-nav">' +

          '<button class="lsffl-popup2-navbtn" id="lsffl-popup2-prev" type="button">' +
            'Previous' +
          '</button>' +

          '<span id="lsffl-popup2-counter">' +
            '1 / 1' +
          '</span>' +

          '<button class="lsffl-popup2-navbtn" id="lsffl-popup2-next" type="button">' +
            'Next' +
          '</button>' +

        '</div>' +

        '<div id="lsffl-popup2-footer">' +

          '<label id="lsffl-popup2-dontshow">' +
            '<input type="checkbox"> ' +
            'Don\\'t show announcements again for 24 hours' +
          '</label>' +

          '<span id="lsffl-popup2-brand">' +
            'NAVY TIMES • LSFFL 2.2' +
          '</span>' +

        '</div>' +

      '</div>';

    document.body.appendChild(
      popup2
    );

    popup2Dialog =
      document.getElementById(
        "lsffl-popup2-dialog"
      );

    popup2Title =
      document.getElementById(
        "lsffl-popup2-title"
      );

    popup2Eyebrow =
      document.getElementById(
        "lsffl-popup2-eyebrow"
      );

    popup2Body =
      document.getElementById(
        "lsffl-popup2-body"
      );

    popup2Meta =
      document.getElementById(
        "lsffl-popup2-meta"
      );

    popup2Image =
      document.getElementById(
        "lsffl-popup2-image"
      );

    popup2Action =
      document.getElementById(
        "lsffl-popup2-action"
      );

    popup2Prev =
      document.getElementById(
        "lsffl-popup2-prev"
      );

    popup2Next =
      document.getElementById(
        "lsffl-popup2-next"
      );

    popup2Counter =
      document.getElementById(
        "lsffl-popup2-counter"
      );

    popup2DontShow =
      document.querySelector(
        "#lsffl-popup2-dontshow input"
      );

    popup2Close =
      document.getElementById(
        "lsffl-popup2-close"
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
      popup2CleanText(
        value
      );

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
     * the cleaned copy already sitting in League Central.
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
     * MFL's original native table elsewhere on the page.
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
      popup2UsableRows(
        table
      );

    if (!rows.length) {
      return null;
    }

    var row =
      rows[0];

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

      priority:
        "normal",

      eyebrow:
        "COMMISSIONER ARTICLE",

      title:
        title,

      body:
        "A new Commissioner Article is available in League Central. Open the full article for the complete update.",

      meta:
        date,

      buttonText:
        "Open Full Article",

      buttonUrl:
        url
    };
  }

  function popup2ExtractMessage() {
    var table =
      popup2FindNativeTable(
        "message_board_summary",
        ".lsffl-message-board-module"
      );

    var rows =
      popup2UsableRows(
        table
      );

    if (!rows.length) {
      return null;
    }

    var row =
      rows[0];

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
        metaParts.push(
          part
        );
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

      priority:
        "normal",

      eyebrow:
        "MESSAGE BOARD",

      title:
        title,

      body:
        "There is a new LSFFL message-board topic. Open the full message to read the discussion and reply.",

      meta:
        metaParts.join(
          " • "
        ),

      buttonText:
        "Open Full Message",

      buttonUrl:
        url
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
    var now =
      Date.now();

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

          finished =
            true;

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
            finish(
              nativeItems
            );

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
        item.body || ""
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
      popup2Announcements.length;

    popup2Prev.disabled =
      popup2Index === 0;

    popup2Next.disabled =
      popup2Index ===
      popup2Announcements.length - 1;

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

  /*
   * ==========================================================
   * HOME-PAGE-ONLY / ONCE-PER-SESSION AUTO OPEN
   * ==========================================================
   */

  function popup2IsLeagueHomepage() {
    var path =
      String(
        window.location.pathname ||
        ""
      );

    var league =
      String(
        new URLSearchParams(
          window.location.search ||
          ""
        ).get("L") ||
        ""
      );

    /*
     * Standard live LSFFL homepage:
     *
     * /2026/home/23135
     */
    if (
      /\/2026\/home\/23135\/?$/i.test(
        path
      )
    ) {
      return true;
    }

    /*
     * Compatibility with an alternate MFL home route
     * that passes the league as ?L=23135.
     */
    return (
      /\/2026\/home\/?$/i.test(
        path
      ) &&
      league === "23135"
    );
  }

  function popup2SessionShownKey() {
    return (
      "lsffl-popup2-auto-shown-2026-23135"
    );
  }

  function popup2WasAutoShownThisSession() {
    try {
      return (
        window.sessionStorage.getItem(
          popup2SessionShownKey()
        ) === "1"
      );
    } catch (error) {
      return false;
    }
  }

  function popup2MarkAutoShownThisSession() {
    try {
      window.sessionStorage.setItem(
        popup2SessionShownKey(),
        "1"
      );
    } catch (error) {
      /*
       * Session storage unavailable.
       */
    }
  }

  function popup2Boot() {
    if (
      !POPUP2_CONFIG.enabled ||
      window.top !== window.self
    ) {
      return;
    }

    /*
     * IMPORTANT:
     *
     * The Announcement Center auto-opens ONLY
     * from the LSFFL league homepage.
     *
     * The normal popup manager remains active on
     * every MFL page so article/franchise/message
     * links still open in our LSFFL modal.
     */
    if (
      !popup2IsLeagueHomepage()
    ) {
      return;
    }

    /*
     * Do not replay the Announcement Center when
     * the owner navigates away and comes back
     * during the same browser session.
     */
    if (
      popup2WasAutoShownThisSession()
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

          /*
           * Mark it BEFORE opening.
           *
           * That protects us if MFL changes the page
           * while the popup is being displayed.
           */
          popup2MarkAutoShownThisSession();

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

  /*
   * Public controls.
   *
   * This lets us manually reopen the Announcement
   * Center later from another LSFFL button if desired:
   *
   * window.lsfflPopup2.open()
   */
  window.lsfflPopup2 = {
    open: function () {
      if (
        popup2Announcements.length
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

  /*
   * Announcement Center keyboard controls.
   */
  document.addEventListener(
    "keydown",
    function (event) {
      if (
        event.key === "Escape" &&
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

  /*
   * Start Pop-Up 2.2.
   */
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

  /*
   * Preserve original public close function.
   */
  window.lsfflCloseContentPopup =
    closeModal;

})();
