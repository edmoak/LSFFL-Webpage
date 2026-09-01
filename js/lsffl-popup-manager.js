/*
 * ============================================================
 * LSFFL POPUP MANAGER — POP-UP 4.4
 * ============================================================
 * File:
 *   js/lsffl-popup-manager.js
 *
 * League:
 *   2026 / 23135
 *
 * Owns ONLY:
 *   - Commissioner Article popups
 * *   - Franchise popups
 *   - Homepage Announcement Center
 *   - Owner manager alerts harvested from MFL's hidden native notifications
 *   - Week 1 lineup reminder
 *
 * DOES NOT own:
 *   - Standings page
 *   - Hall of Fame page
 *   - Retired Franchises page
 *   - Other GitHub LSFFL pages
 *
 * No Cloudflare dependency for MFL league content.
 * ============================================================
 */

(function () {
  "use strict";

  if (window.top !== window.self) {
    return;
  }

  var YEAR = "2026";
  var LEAGUE_ID = "23135";
  var MFL_ORIGIN = "https://www48.myfantasyleague.com";

  var modal = null;
  var modalDialog = null;
  var modalFrame = null;
  var modalTitle = null;
  var modalClose = null;

  var modalType = "content";
  var previousFocus = null;

  var ANNOUNCEMENT_SESSION_KEY =
    "lsffl-popup41-week1-auto-shown-2026-23135";

  var ANNOUNCEMENT_DISMISS_KEY =
    "lsffl-popup41-week1-dismissed-until";


  /* ============================================================
     BASIC HELPERS
     ============================================================ */

  function absoluteUrl(value, base) {
    try {
      return new URL(
        value,
        base || window.location.href
      );
    } catch (error) {
      return null;
    }
  }


  function normalizeFranchiseId(value) {
    var digits =
      String(value || "")
        .replace(/\D/g, "");

    if (!digits) {
      return "";
    }

    return digits
      .padStart(4, "0")
      .slice(-4);
  }


  function isMfl2026(url) {
    return Boolean(
      url &&
      /myfantasyleague\.com$/i.test(
        url.hostname
      ) &&
      url.pathname.indexOf(
        "/" + YEAR + "/"
      ) !== -1
    );
  }


  /* ============================================================
     URL CLASSIFICATION

     IMPORTANT:
     GitHub pages are intentionally NOT classified.
     ============================================================ */

  function classifyMflUrl(value) {
    var url = absoluteUrl(value);

    if (!isMfl2026(url)) {
      return null;
    }

    var option = String(
      url.searchParams.get("O") || ""
    ).replace(/^0+/, "");

    var franchiseId =
      normalizeFranchiseId(
        url.searchParams.get("F")
      );

    if (
      /\/options\/?$/i.test(url.pathname) &&
      option === "73"
    ) {
      return {
        type: "article",
        title: "League Article",
        url: url.href
      };
    }

    if (
      franchiseId &&
      /\/options\/?$/i.test(url.pathname)
    ) {
      return {
        type: "franchise",
        title: "Franchise Center",
        url: url.href
      };
    }

    return null;
  }


  /* ============================================================
     MAIN POPUP STYLES
     ============================================================ */

  function injectModalStyles() {
    if (
      document.getElementById(
        "lsffl-popup41-modal-styles"
      )
    ) {
      return;
    }

    var style =
      document.createElement(
        "style"
      );

    style.id =
      "lsffl-popup41-modal-styles";

    style.textContent = [

      "body.lsffl-popup41-open{" +
        "overflow:hidden!important;" +
      "}",


      "#lsffl-popup41-modal[hidden]{" +
        "display:none!important;" +
      "}",


      "#lsffl-popup41-modal{" +
        "position:fixed;" +
        "inset:0;" +
        "z-index:2147483000;" +
        "display:flex;" +
        "align-items:center;" +
        "justify-content:center;" +
        "padding:18px;" +
        "background:rgba(0,7,18,.86);" +
        "backdrop-filter:blur(4px);" +
        "-webkit-backdrop-filter:blur(4px);" +
      "}",


      "#lsffl-popup41-dialog{" +
        "width:min(1180px,96vw);" +
        "height:min(850px,94vh);" +
        "display:flex;" +
        "flex-direction:column;" +
        "overflow:hidden;" +
        "border:2px solid #c9a227;" +
        "border-radius:11px;" +
        "background:#061426;" +
        "box-shadow:0 22px 70px rgba(0,0,0,.72);" +
      "}",


      "#lsffl-popup41-bar{" +
        "min-height:48px;" +
        "display:flex;" +
        "align-items:center;" +
        "justify-content:space-between;" +
        "gap:16px;" +
        "padding:8px 10px 8px 15px;" +
        "border-bottom:2px solid #c9a227;" +
        "background:linear-gradient(180deg,#123755 0%,#071a2f 100%);" +
      "}",


      "#lsffl-popup41-title{" +
        "min-width:0;" +
        "overflow:hidden;" +
        "color:#fff;" +
        "font-family:'Barlow Condensed','Roboto Condensed','Arial Narrow',Arial,sans-serif;" +
        "font-size:18px;" +
        "line-height:22px;" +
        "font-weight:800;" +
        "letter-spacing:.65px;" +
        "text-overflow:ellipsis;" +
        "text-transform:uppercase;" +
        "white-space:nowrap;" +
      "}",


      "#lsffl-popup41-close{" +
        "width:34px!important;" +
        "min-width:34px!important;" +
        "height:34px!important;" +
        "min-height:34px!important;" +
        "padding:0!important;" +
        "display:grid!important;" +
        "place-items:center!important;" +
        "border:1px solid #e1c45a!important;" +
        "border-radius:6px!important;" +
        "background:#061426!important;" +
        "color:#fff!important;" +
        "font:400 26px/26px Arial,sans-serif!important;" +
        "cursor:pointer!important;" +
      "}",


      "#lsffl-popup41-close:hover{" +
        "background:#c9a227!important;" +
        "color:#061426!important;" +
      "}",


      "#lsffl-popup41-frame{" +
        "width:100%;" +
        "height:100%;" +
        "flex:1 1 auto;" +
        "border:0;" +
        "background:#061426;" +
        "opacity:0;" +
        "transition:opacity .12s ease;" +
      "}",


      "@media(max-width:700px){" +

        "#lsffl-popup41-modal{" +
          "padding:7px;" +
        "}" +

        "#lsffl-popup41-dialog{" +
          "width:100%;" +
          "height:96vh;" +
          "border-radius:8px;" +
        "}" +

        "#lsffl-popup41-title{" +
          "font-size:16px;" +
        "}" +

      "}"

    ].join("");

    document.head.appendChild(
      style
    );
  }


  /* ============================================================
     CREATE MAIN POPUP
     ============================================================ */

  function createModal() {
    if (modal) {
      return;
    }

    injectModalStyles();


    modal =
      document.createElement(
        "div"
      );

    modal.id =
      "lsffl-popup41-modal";

    modal.hidden =
      true;

    modal.setAttribute(
      "role",
      "dialog"
    );

    modal.setAttribute(
      "aria-modal",
      "true"
    );


    modalDialog =
      document.createElement(
        "div"
      );

    modalDialog.id =
      "lsffl-popup41-dialog";


    var bar =
      document.createElement(
        "div"
      );

    bar.id =
      "lsffl-popup41-bar";


    modalTitle =
      document.createElement(
        "div"
      );

    modalTitle.id =
      "lsffl-popup41-title";

    modalTitle.textContent =
      "LSFFL";


    modalClose =
      document.createElement(
        "button"
      );

    modalClose.id =
      "lsffl-popup41-close";

    modalClose.type =
      "button";

    modalClose.setAttribute(
      "aria-label",
      "Close popup"
    );

    modalClose.textContent =
      "×";


    modalFrame =
      document.createElement(
        "iframe"
      );

    modalFrame.id =
      "lsffl-popup41-frame";

    modalFrame.title =
      "LSFFL content";

    modalFrame.setAttribute(
      "loading",
      "eager"
    );


    bar.appendChild(
      modalTitle
    );

    bar.appendChild(
      modalClose
    );


    modalDialog.appendChild(
      bar
    );

    modalDialog.appendChild(
      modalFrame
    );


    modal.appendChild(
      modalDialog
    );

    document.body.appendChild(
      modal
    );


    modalClose.addEventListener(
      "click",
      closeModal
    );


    modal.addEventListener(
      "click",
      function (event) {

        if (
          event.target === modal
        ) {
          closeModal();
        }

      }
    );


    modalFrame.addEventListener(
      "load",
      function () {

        cleanModalPage();

        window.setTimeout(
          cleanModalPage,
          75
        );

        window.setTimeout(
          cleanModalPage,
          200
        );

        window.setTimeout(
          cleanModalPage,
          450
        );

        window.setTimeout(
          cleanModalPage,
          900
        );

        window.setTimeout(
          function () {

            if (modalFrame) {
              modalFrame.style.opacity =
                "1";
            }

          },
          800
        );

      }
    );
  }


  /* ============================================================
     HIDE ELEMENT
     ============================================================ */

  function hideElement(element) {
    if (!element) {
      return;
    }

    element.style.setProperty(
      "display",
      "none",
      "important"
    );

    element.style.setProperty(
      "visibility",
      "hidden",
      "important"
    );

    element.style.setProperty(
      "height",
      "0",
      "important"
    );

    element.style.setProperty(
      "min-height",
      "0",
      "important"
    );

    element.style.setProperty(
      "margin",
      "0",
      "important"
    );

    element.style.setProperty(
      "padding",
      "0",
      "important"
    );

    element.style.setProperty(
      "overflow",
      "hidden",
      "important"
    );
  }


  /* ============================================================
     REMOVE MFL / LSFFL HEADER CHROME FROM IFRAME

     This is the main Pop-Up 4.0 fix.
     ============================================================ */

  function hideMflChrome(doc) {

    var selectors = [

      /* MFL top navigation */

      ".myfantasyleague_menu",

      "#myfantasyleague_menu",

      ".mfl-menu",

      ".mflmenu",

      ".topmenu",

      ".top-menu",


      /* Main LSFFL banner */

      ".banner-container",

      ".banner-container-wrap",

      ".banner-leftside",

      ".banner-rightside",

      ".bannerlinkicons",

      ".icon-bar",

      ".lsffl-banner",

      ".lsffl-header",

      ".header-wrapper",


      /* Standard MFL header containers */

      "#header",

      "#pageheader",

      "#MFLHeader",

      "#mflheader",

      ".pageheader",

      ".page-header",

      ".mfl-header",


      /* Scoreboard / ticker */

      ".ticker-wrapper",

      ".lsffl-ticker-wrapper",

      ".lsffl-scoreboard",

      ".scoreboard-wrapper",

      "#scoreboard",

      "#MFLScoreboard",


      /* MFL utility chrome */

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


      /* Footer */

      "#footer",

      ".footer",

      ".pagefooter",

      "#pagefooter"

    ];


    selectors.forEach(
      function (selector) {

        Array.prototype.forEach.call(
          doc.querySelectorAll(
            selector
          ),
          hideElement
        );

      }
    );


    /*
     * Some MFL skins wrap the banner/menu in a parent
     * that has no useful class.
     *
     * If one of the known banner pieces survives,
     * hide the nearest large wrapper too.
     */

    var bannerPieces =
      doc.querySelectorAll(
        ".banner-leftside," +
        ".banner-rightside," +
        ".bannerlinkicons"
      );


    Array.prototype.forEach.call(
      bannerPieces,
      function (piece) {

        var parent =
          piece.parentElement;

        if (
          parent &&
          parent !== doc.body
        ) {
          hideElement(parent);
        }

      }
    );
  }


  /* ============================================================
     CLEAN IFRAME THEME
     ============================================================ */

  function injectFrameTheme(doc) {

    if (
      doc.getElementById(
        "lsffl-popup41-frame-style"
      )
    ) {
      return;
    }


    var style =
      doc.createElement(
        "style"
      );

    style.id =
      "lsffl-popup41-frame-style";


    style.textContent = [

      "html.lsffl-popup41-doc," +
      "html.lsffl-popup41-doc body{" +

        "margin:0!important;" +
        "padding:0!important;" +
        "min-height:100%!important;" +

        "background:#061426!important;" +

        "background-image:url('https://github.com/edmoak/LSFFL-Webpage/blob/main/images/backgrounds/lsfflbackground.png?raw=true')!important;" +

        "background-position:center top!important;" +
        "background-size:cover!important;" +
        "background-attachment:fixed!important;" +

        "color:#fff!important;" +
        "overflow-x:hidden!important;" +

      "}",


      "html.lsffl-popup41-doc body{" +
        "padding:10px!important;" +
        "box-sizing:border-box!important;" +
      "}",


      "html.lsffl-popup41-doc #container-wrap," +
      "html.lsffl-popup41-doc .pagebody," +
      "html.lsffl-popup41-doc .report," +
      "html.lsffl-popup41-doc .module{" +

        "max-width:100%!important;" +
        "width:100%!important;" +
        "margin:0 auto!important;" +
        "box-sizing:border-box!important;" +

      "}",


      "html.lsffl-popup41-doc img{" +
        "max-width:100%!important;" +
        "height:auto!important;" +
      "}",


      /* Franchise logo */

      "html.lsffl-popup41-doc " +
      "body.lsffl-popup41-franchise " +
      "img.lsffl-popup41-team-logo{" +

        "display:block!important;" +
        "width:auto!important;" +
        "height:auto!important;" +
        "max-width:min(612px,75%)!important;" +
        "max-height:374px!important;" +
        "margin:10px auto 18px!important;" +
        "object-fit:contain!important;" +

      "}",


      /* Franchise name */

      "html.lsffl-popup41-doc " +
      ".lsffl-popup41-team-brand{" +

        "width:min(700px,92%)!important;" +
        "margin:18px auto 0!important;" +
        "text-align:center!important;" +

      "}",


      "html.lsffl-popup41-doc " +
      ".lsffl-popup41-team-name{" +

        "color:#fff!important;" +

        "font-family:'Oswald','Barlow Condensed','Arial Narrow',Arial,sans-serif!important;" +

        "font-size:clamp(28px,4vw,42px)!important;" +
        "line-height:1.05!important;" +
        "font-weight:800!important;" +
        "letter-spacing:1.2px!important;" +
        "text-transform:uppercase!important;" +

        "text-shadow:0 3px 8px rgba(0,0,0,.55)!important;" +

      "}",


      "html.lsffl-popup41-doc " +
      ".lsffl-popup41-team-line{" +

        "width:130px!important;" +
        "height:3px!important;" +
        "margin:10px auto 0!important;" +

        "background:linear-gradient(" +
          "90deg," +
          "transparent," +
          "#c9a227," +
          "#e1c45a," +
          "#c9a227," +
          "transparent" +
        ")!important;" +

      "}"

    ].join("");


    doc.head.appendChild(
      style
    );
  }


  /* ============================================================
     FRANCHISE NAME
     ============================================================ */

  function getFranchiseName(doc) {

    if (!doc || !doc.body) {
      return "";
    }

    var bodyText = String(
      doc.body.innerText ||
      doc.body.textContent ||
      ""
    )
      .replace(/\s+/g, " ")
      .trim();

    /*
     * Most MFL franchise pages expose the team name in text such as:
     *   COUGARS: Main | Roster | ...
     */

    var navMatch = bodyText.match(
      /(?:^|\s)([A-Za-z0-9][A-Za-z0-9'’&. \/_-]{1,45}?):\s*Main\b/i
    );

    if (
      navMatch &&
      navMatch[1]
    ) {
      return navMatch[1]
        .replace(/\s+/g, " ")
        .trim();
    }


    /*
     * Some MFL skins render only the franchise name as a heading.
     * Read visible headings/cells and reject MFL navigation labels.
     */

    var rejected =
      /^(main|home|roster|roster w\/?stats|scoring history|transactions|schedule|accounting|series records|box score|my options|franchise center|league|standings|reports|players|draft|communications|league message board|message board|team|owner|record|points|power rank|all|submit|go)$/i;


    var candidates =
      Array.prototype.slice.call(
        doc.querySelectorAll(
          ".modulehead,.moduleheader,.reportnavigation,h1,h2,h3,caption,th,td,strong,b"
        )
      );


    for (
      var i = 0;
      i < candidates.length;
      i += 1
    ) {

      var node =
        candidates[i];

      if (
        !node ||
        !node.textContent
      ) {
        continue;
      }

      var text =
        String(node.textContent)
          .replace(/\s+/g, " ")
          .replace(
            /:\s*Main.*$/i,
            ""
          )
          .trim();


      if (
        text.length < 2 ||
        text.length > 45 ||
        rejected.test(text) ||
        /^(2026|LSFFL|LAMAD SQUAD)/i.test(text) ||
        /\b(?:week|points|record|rank|division|league)\b/i.test(text)
      ) {
        continue;
      }


      var style;

      try {
        style =
          doc.defaultView
            .getComputedStyle(
              node
            );
      } catch (error) {
        style = null;
      }


      if (
        style &&
        (
          style.display === "none" ||
          style.visibility === "hidden"
        )
      ) {
        continue;
      }


      if (
        /^[A-Z0-9][A-Z0-9'’&. \-_/]{1,44}$/.test(text) ||
        node.matches(
          ".modulehead,.moduleheader,h1,h2,h3,caption"
        )
      ) {
        return text;
      }
    }


    var title =
      String(
        doc.title || ""
      )
        .replace(
          /MyFantasyLeague\.com/ig,
          ""
        )
        .replace(
          /2026/ig,
          ""
        )
        .replace(
          /LSFFL/ig,
          ""
        )
        .replace(
          /[|\-–—]+/g,
          " "
        )
        .replace(
          /\s+/g,
          " "
        )
        .trim();


    if (
      title.length >= 2 &&
      title.length <= 45 &&
      !rejected.test(title)
    ) {
      return title;
    }


    return "";
  }


  /* ============================================================
     FRANCHISE BRANDING
     ============================================================ */

  function decorateFranchise(doc) {

    if (
      modalType !== "franchise" ||
      !doc ||
      !doc.body
    ) {
      return;
    }

    doc.body.classList.add(
      "lsffl-popup41-franchise"
    );

    if (
      doc.getElementById(
        "lsffl-popup41-team-brand"
      )
    ) {
      return;
    }

    var name =
      getFranchiseName(
        doc
      );

    if (!name) {
      return;
    }


    if (modalTitle) {
      modalTitle.textContent =
        "Franchise Center — " +
        name;
    }


    var images =
      Array.prototype.slice.call(
        doc.querySelectorAll(
          "img"
        )
      );

    var logo =
      null;

    var bestScore =
      0;


    images.forEach(
      function (img) {

        try {

          var style =
            doc.defaultView
              .getComputedStyle(
                img
              );

          var rect =
            img.getBoundingClientRect();


          if (
            style.display === "none" ||
            style.visibility === "hidden" ||
            rect.width < 140 ||
            rect.height < 80
          ) {
            return;
          }


          if (
            img.closest(
              ".banner-container,.banner-container-wrap,.banner-leftside,.banner-rightside,.bannerlinkicons,.icon-bar,.myfantasyleague_menu,#header,#pageheader,#MFLHeader,.lsffl-header,.ticker-wrapper,.lsffl-ticker-wrapper,.lsffl-scoreboard,.scoreboard-wrapper"
            )
          ) {
            return;
          }


          var nw =
            img.naturalWidth ||
            rect.width;

          var nh =
            img.naturalHeight ||
            rect.height;

          var ratio =
            nw /
            Math.max(
              nh,
              1
            );


          if (
            ratio > 3.2
          ) {
            return;
          }


          var score =
            Math.max(
              nw * nh,
              rect.width *
              rect.height
            );


          if (
            score > bestScore
          ) {
            bestScore =
              score;

            logo =
              img;
          }

        } catch (error) {
          /* Ignore an image that cannot be measured. */
        }

      }
    );


    if (!logo) {
      return;
    }


    logo.classList.add(
      "lsffl-popup41-team-logo"
    );


    var brand =
      doc.createElement(
        "div"
      );

    brand.id =
      "lsffl-popup41-team-brand";

    brand.className =
      "lsffl-popup41-team-brand";


    var nameElement =
      doc.createElement(
        "div"
      );

    nameElement.className =
      "lsffl-popup41-team-name";

    nameElement.textContent =
      name;


    var line =
      doc.createElement(
        "div"
      );

    line.className =
      "lsffl-popup41-team-line";


    brand.appendChild(
      nameElement
    );

    brand.appendChild(
      line
    );


    if (
      logo.parentNode
    ) {

      logo.parentNode.insertBefore(
        brand,
        logo
      );

    }
  }


  /* ============================================================
     CLEAN CURRENT POPUP PAGE
     ============================================================ */

  function cleanDocumentTree(
    doc,
    win,
    depth
  ) {

    if (
      !doc ||
      !doc.documentElement ||
      !doc.body ||
      depth > 4
    ) {
      return;
    }


    doc.documentElement
      .classList.add(
        "lsffl-popup41-doc"
      );


    doc.body.classList.add(
      "lsffl-popup41-doc"
    );


    injectFrameTheme(
      doc
    );

    hideMflChrome(
      doc
    );

    decorateFranchise(
      doc
    );


    if (
      modalType ===
      "franchise"
    ) {

      window.setTimeout(
        function () {

          try {
            decorateFranchise(
              doc
            );
          } catch (error) {}

        },
        250
      );


      window.setTimeout(
        function () {

          try {
            decorateFranchise(
              doc
            );
          } catch (error) {}

        },
        700
      );

    }


    var frames =
      Array.prototype.slice.call(
        doc.querySelectorAll(
          "iframe,frame"
        )
      );


    frames.forEach(
      function (nestedFrame) {

        try {

          var nestedDoc =
            nestedFrame
              .contentDocument;

          var nestedWin =
            nestedFrame
              .contentWindow;


          if (
            nestedDoc &&
            nestedWin
          ) {

            cleanDocumentTree(
              nestedDoc,
              nestedWin,
              depth + 1
            );

          }


          if (
            !nestedFrame.dataset
              .lsfflPopup41Cleaner
          ) {

            nestedFrame.dataset
              .lsfflPopup41Cleaner =
              "1";


            nestedFrame.addEventListener(

              "load",

              function () {

                window.setTimeout(

                  function () {

                    try {

                      cleanDocumentTree(
                        nestedFrame
                          .contentDocument,
                        nestedFrame
                          .contentWindow,
                        depth + 1
                      );

                    } catch (error) {}

                  },

                  30

                );

              }

            );

          }

        } catch (error) {
          /* Ignore inaccessible nested frames. */
        }

      }
    );
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
        modalFrame
          .contentDocument;

      var win =
        modalFrame
          .contentWindow;


      if (
        !doc ||
        !doc.documentElement ||
        !doc.body
      ) {
        return;
      }


      cleanDocumentTree(
        doc,
        win,
        0
      );


      modalFrame.style.opacity =
        "1";


    } catch (error) {

      modalFrame.style.opacity =
        "1";

    }
  }


  /* ============================================================
     OPEN / CLOSE MAIN MODAL
     ============================================================ */

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
      "lsffl-popup41-open"
    );


    window.setTimeout(
      function () {

        if (
          modalClose
        ) {
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
      "lsffl-popup41-open"
    );


    if (
      previousFocus &&
      typeof previousFocus.focus ===
        "function"
    ) {

      previousFocus.focus();

    }
  }


  /* ============================================================
     FRANCHISE POPUP
     ============================================================ */

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
        encodeURIComponent(
          id
        ) +
        "&O=01",

      "franchise",

      "Franchise Center"

    );
  }


  /* ============================================================
     TOP-LEVEL MFL LINK INTERCEPTION

     ONLY commissioner-article and franchise URLs.
     GitHub links are ignored.
     ============================================================ */

  document.addEventListener(

    "click",

    function (event) {

      var link =
        event.target.closest(
          "a[href]"
        );


      /*
       * The Announcement Center owns its own action links.
       * Do not let the global capture-phase MFL interceptor
       * steal those clicks before the announcement handler runs.
       */
      if (
        announcementModal &&
        !announcementModal.hidden &&
        announcementModal.contains(event.target)
      ) {
        return;
      }


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


  /* ============================================================
     STANDINGS -> PARENT FRANCHISE BRIDGE
     ============================================================ */

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


  /* ============================================================
     DIRECT data-mfl-franchise SUPPORT
     ============================================================ */

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


      openFranchise(
        id
      );

    },

    true
  );


  /* ============================================================
     ESCAPE KEY
     ============================================================ */

  document.addEventListener(

    "keydown",

    function (event) {

      if (
        event.key ===
          "Escape" &&
        modal &&
        !modal.hidden
      ) {

        closeModal();

      }

    }
  );


  /* ============================================================
     PUBLIC FUNCTIONS
     ============================================================ */

  window.lsfflOpenContentPopup =
    function (
      url,
      title
    ) {

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
        title ||
          match.title
      );
    };


  window.lsfflOpenFranchisePopup =
    openFranchise;


  window.lsfflCloseContentPopup =
    closeModal;


  /* ============================================================
     ANNOUNCEMENT CENTER
     ============================================================ */

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
      .replace(
        /\s+/g,
        " "
      )
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
        "table#" +
        id
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
        /view all articles|write new article/i.test(
          text
        )
      ) {
        continue;
      }


      if (
        row.querySelector(
          "th"
        ) &&
        !row.querySelector(
          "td"
        )
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


  /* ============================================================
     COMMISSIONER ARTICLE ANNOUNCEMENT
     ============================================================ */

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


  /* ============================================================
     OWNER MANAGER ALERTS

     MFL remains the rule engine. Its native notification popup is hidden,
     but we read the generated notification text and convert relevant owner
     issues into LSFFL announcement cards.
     ============================================================ */

  function getNativeNotificationRoot() {
    return (
      document.getElementById(
        "MFLPlayerPopupNotificationContainer"
      ) ||
      document.getElementById(
        "MFLPlayerPopupContainer"
      )
    );
  }


  function nativeNotificationText() {
    var root =
      getNativeNotificationRoot();

    if (!root) {
      return "";
    }

    return cleanText(
      root.innerText ||
      root.textContent ||
      ""
    );
  }


  function findNativeNotificationLink(pattern) {
    var root =
      getNativeNotificationRoot();

    if (!root) {
      return "";
    }

    var links =
      Array.prototype.slice.call(
        root.querySelectorAll(
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

      var haystack =
        cleanText(
          (link.textContent || "") +
          " " +
          (link.getAttribute("href") || "")
        );

      if (
        pattern.test(
          haystack
        )
      ) {
        var url =
          absoluteUrl(
            link.getAttribute(
              "href"
            ),
            window.location.href
          );

        return url
          ? url.href
          : "";
      }
    }

    return "";
  }


  function ownerAlertCard(
    eyebrow,
    title,
    body,
    buttonText,
    buttonUrl
  ) {
    return {
      eyebrow:
        eyebrow,

      title:
        title,

      body:
        body,

      meta:
        "Owner Action Required",

      buttonText:
        buttonText,

      buttonUrl:
        buttonUrl
    };
  }


  function extractOwnerManagerAlerts() {
    var text =
      nativeNotificationText();

    if (!text) {
      return [];
    }

    var alerts = [];

    /*
     * Keep the matching deliberately broad because MFL's wording can vary
     * by league settings and by the exact type of roster problem.
     */

    if (
      /\btrade\b/i.test(text) &&
      /\b(pending|proposal|proposed|offer|respond|response|approve|reject|accept)\b/i.test(text)
    ) {
      alerts.push(
        ownerAlertCard(
          "TRADE ALERT",
          "Trade Offer Pending",
          "You have a trade proposal waiting for your attention.",
          "View Trade",
          findNativeNotificationLink(
            /trade|O=0?5\b/i
          ) ||
          MFL_ORIGIN +
            "/" +
            YEAR +
            "/options?L=" +
            LEAGUE_ID +
            "&O=05"
        )
      );
    }


    if (
      /\b(injured reserve|injury reserve|\bIR\b)\b/i.test(text) &&
      /\b(illegal|invalid|ineligible|violation|must|remove|activate|error)\b/i.test(text)
    ) {
      alerts.push(
        ownerAlertCard(
          "ROSTER ALERT",
          "IR Violation",
          "Your roster has an injured-reserve violation that needs to be corrected.",
          "Fix IR",
          findNativeNotificationLink(
            /injured|reserve|\bIR\b/i
          ) ||
          MFL_ORIGIN +
            "/" +
            YEAR +
            "/options?L=" +
            LEAGUE_ID +
            "&O=07"
        )
      );
    }


    if (
      /\b(taxi|taxi squad|taxicab)\b/i.test(text) &&
      /\b(illegal|invalid|ineligible|violation|must|remove|activate|error)\b/i.test(text)
    ) {
      alerts.push(
        ownerAlertCard(
          "ROSTER ALERT",
          "Taxi Squad Violation",
          "Your taxi squad has a violation that needs to be corrected.",
          "Fix Taxi Squad",
          findNativeNotificationLink(
            /taxi/i
          ) ||
          MFL_ORIGIN +
            "/" +
            YEAR +
            "/options?L=" +
            LEAGUE_ID +
            "&O=07"
        )
      );
    }


    if (
      /\b(roster|players?|position)\b/i.test(text) &&
      /\b(illegal|invalid|violation|too many|too few|over limit|under limit|minimum|maximum|must|error)\b/i.test(text) &&
      !(
        /\b(injured reserve|injury reserve|\bIR\b)\b/i.test(text) &&
        alerts.some(
          function (item) {
            return item.title ===
              "IR Violation";
          }
        )
      )
    ) {
      alerts.push(
        ownerAlertCard(
          "ROSTER ALERT",
          "Roster Violation",
          "Your active roster does not currently meet the league roster requirements.",
          "View Roster",
          findNativeNotificationLink(
            /roster|O=0?7\b/i
          ) ||
          MFL_ORIGIN +
            "/" +
            YEAR +
            "/options?L=" +
            LEAGUE_ID +
            "&O=07"
        )
      );
    }


    if (
      /\b(lineup|starter|starting lineup)\b/i.test(text) &&
      /\b(empty|missing|incomplete|illegal|invalid|violation|hole|must|submit|not submitted|error)\b/i.test(text)
    ) {
      alerts.push(
        ownerAlertCard(
          "LINEUP ALERT",
          "Starting Lineup Incomplete",
          "You have an empty or invalid starting-lineup position that needs attention.",
          "Fix Lineup",
          findNativeNotificationLink(
            /lineup|starter/i
          ) ||
          MFL_ORIGIN +
            "/" +
            YEAR +
            "/lineup?L=" +
            LEAGUE_ID
        )
      );
    }


    /*
     * De-duplicate cards in case MFL repeats the same warning in multiple
     * elements inside its hidden notification container.
     */
    var seen =
      Object.create(null);

    return alerts.filter(
      function (item) {
        if (
          seen[
            item.title
          ]
        ) {
          return false;
        }

        seen[
          item.title
        ] =
          true;

        return true;
      }
    );
  }


  /* ============================================================
     LOAD ANNOUNCEMENT CARDS
     ============================================================ */

  function loadAnnouncementItems() {

    var items = [

      {

        eyebrow:
          "COMMISSIONER'S DESK",


        title:
          "Week 1 Is Here — Set Your Lineup",


        body:
          "NFL regular-season games begin Wednesday, September 9. Make sure your starting lineup is submitted before your players lock. Reminder: LSFFL now starts TWO FLEX players instead of one. Your weekly lineup should have 9 starters total: 1 QB, 1 RB, 2 WR, 1 TE, 2 FLEX, 1 K, and 1 Defense.",


        meta:
          "9 STARTERS • 2 FLEX • GET YOUR LINEUP IN",


        buttonText:
          "Submit Lineup",


        buttonUrl:
          "https://www48.myfantasyleague.com/2026/options?L=23135&O=02"

      }

    ];


    var ownerAlerts =
      extractOwnerManagerAlerts();

    ownerAlerts.forEach(
      function (alert) {
        items.push(
          alert
        );
      }
    );


    var article =
      extractArticleAnnouncement();


    if (
      article &&
      !/draft/i.test(
        article.title || ""
      )
    ) {

      items.push(
        article
      );

    }


    return items;
  }


  /* ============================================================
     ANNOUNCEMENT STYLES
     ============================================================ */

  function injectAnnouncementStyles() {

    if (
      document.getElementById(
        "lsffl-popup41-announcement-styles"
      )
    ) {
      return;
    }


    var style =
      document.createElement(
        "style"
      );


    style.id =
      "lsffl-popup41-announcement-styles";


    style.textContent = [

      "#lsffl-popup41-announcement[hidden]{" +
        "display:none!important;" +
      "}",


      "#lsffl-popup41-announcement{" +
        "position:fixed;" +
        "inset:0;" +
        "z-index:2147483100;" +
        "display:flex;" +
        "align-items:center;" +
        "justify-content:center;" +
        "padding:18px;" +
        "background:rgba(0,7,18,.88);" +
        "backdrop-filter:blur(5px);" +
        "-webkit-backdrop-filter:blur(5px);" +
      "}",


      "#lsffl-popup41-announcement-card{" +
        "width:min(760px,96vw);" +
        "max-height:94vh;" +
        "overflow:auto;" +
        "border:2px solid #c9a227;" +
        "border-radius:14px;" +
        "background:linear-gradient(180deg,#0c2846 0%,#061426 52%,#02091a 100%);" +
        "color:#fff;" +
        "box-shadow:0 24px 90px rgba(0,0,0,.78);" +
      "}",


      "#lsffl-popup41-announcement-head{" +
        "display:flex;" +
        "justify-content:space-between;" +
        "gap:16px;" +
        "padding:22px 22px 8px;" +
        "border-top:6px solid #c9a227;" +
      "}",


      "#lsffl-popup41-announcement-eyebrow{" +
        "margin-bottom:5px;" +
        "color:#e1c45a;" +
        "font-family:'Barlow Condensed',Arial,sans-serif;" +
        "font-size:13px;" +
        "font-weight:900;" +
        "letter-spacing:1.7px;" +
        "text-transform:uppercase;" +
      "}",


      "#lsffl-popup41-announcement-title{" +
        "margin:0;" +
        "color:#fff;" +
        "font-family:'Oswald','Barlow Condensed',Arial,sans-serif;" +
        "font-size:clamp(25px,4vw,36px);" +
        "line-height:1.03;" +
        "font-weight:900;" +
        "text-transform:uppercase;" +
      "}",


      "#lsffl-popup41-announcement-close{" +
        "width:38px!important;" +
        "min-width:38px!important;" +
        "height:38px!important;" +
        "padding:0!important;" +
        "border:1px solid #e1c45a!important;" +
        "border-radius:8px!important;" +
        "background:#061426!important;" +
        "color:#fff!important;" +
        "font:400 28px/1 Arial,sans-serif!important;" +
        "cursor:pointer!important;" +
      "}",


      "#lsffl-popup41-announcement-body{" +
        "padding:12px 22px 8px;" +
        "color:#eef4fb;" +
        "font-family:Arial,sans-serif;" +
        "font-size:17px;" +
        "line-height:1.58;" +
      "}",


      "#lsffl-popup41-announcement-meta{" +
        "margin-top:12px;" +
        "color:#aebdcd;" +
        "font-size:13px;" +
        "font-weight:700;" +
      "}",


      "#lsffl-popup41-announcement-actions{" +
        "display:flex;" +
        "padding:14px 22px 12px;" +
      "}",


      "#lsffl-popup41-announcement-open{" +
        "display:none;" +
        "align-items:center;" +
        "justify-content:center;" +
        "min-height:42px;" +
        "padding:9px 18px;" +
        "border:1px solid #e1c45a;" +
        "border-radius:8px;" +
        "background:#c9a227;" +
        "color:#061426!important;" +
        "text-decoration:none!important;" +
        "font-family:'Barlow Condensed',Arial,sans-serif;" +
        "font-size:16px;" +
        "font-weight:900;" +
        "text-transform:uppercase;" +
      "}",


      "#lsffl-popup41-announcement-nav{" +
        "display:flex;" +
        "align-items:center;" +
        "justify-content:space-between;" +
        "gap:12px;" +
        "padding:12px 22px;" +
        "border-top:1px solid rgba(201,162,39,.3);" +
        "background:rgba(0,0,0,.18);" +
      "}",


      ".lsffl-popup41-announcement-navbtn{" +
        "min-width:86px!important;" +
        "min-height:36px!important;" +
        "padding:7px 12px!important;" +
        "border:1px solid #c9a227!important;" +
        "border-radius:7px!important;" +
        "background:#071a2f!important;" +
        "color:#fff!important;" +
        "font-family:'Barlow Condensed',Arial,sans-serif!important;" +
        "font-size:14px!important;" +
        "font-weight:900!important;" +
        "text-transform:uppercase!important;" +
        "cursor:pointer!important;" +
      "}",


      ".lsffl-popup41-announcement-navbtn:disabled{" +
        "opacity:.35;" +
        "cursor:default!important;" +
      "}",


      "#lsffl-popup41-announcement-counter{" +
        "color:#e1c45a;" +
        "font-family:'Barlow Condensed',Arial,sans-serif;" +
        "font-size:14px;" +
        "font-weight:900;" +
      "}",


      "#lsffl-popup41-announcement-footer{" +
        "display:flex;" +
        "align-items:center;" +
        "justify-content:space-between;" +
        "gap:12px;" +
        "padding:11px 22px 14px;" +
        "color:#aebdcd;" +
        "font-family:Arial,sans-serif;" +
        "font-size:12px;" +
      "}",


      "#lsffl-popup41-announcement-footer label{" +
        "display:flex;" +
        "align-items:center;" +
        "gap:7px;" +
      "}",


      "#lsffl-popup41-announcement-footer input{" +
        "width:16px;" +
        "height:16px;" +
        "accent-color:#c9a227;" +
      "}"

    ].join("");


    document.head.appendChild(
      style
    );
  }


  /* ============================================================
     CREATE ANNOUNCEMENT MODAL
     ============================================================ */

  function createAnnouncementModal() {

    if (
      announcementModal
    ) {
      return;
    }


    injectAnnouncementStyles();


    announcementModal =
      document.createElement(
        "div"
      );


    announcementModal.id =
      "lsffl-popup41-announcement";


    announcementModal.hidden =
      true;


    announcementModal.innerHTML =

      '<div id="lsffl-popup41-announcement-card">' +

        '<div id="lsffl-popup41-announcement-head">' +

          '<div>' +

            '<div id="lsffl-popup41-announcement-eyebrow">' +
              'LSFFL' +
            '</div>' +

            '<h2 id="lsffl-popup41-announcement-title">' +
              'League Update' +
            '</h2>' +

          '</div>' +


          '<button ' +
            'id="lsffl-popup41-announcement-close" ' +
            'type="button" ' +
            'aria-label="Close announcement">' +
            '×' +
          '</button>' +

        '</div>' +


        '<div id="lsffl-popup41-announcement-body">' +

          '<div id="lsffl-popup41-announcement-text"></div>' +

          '<div id="lsffl-popup41-announcement-meta"></div>' +

        '</div>' +


        '<div id="lsffl-popup41-announcement-actions">' +

          '<a ' +
            'id="lsffl-popup41-announcement-open" ' +
            'href="#">' +
            'Read More' +
          '</a>' +

        '</div>' +


        '<div id="lsffl-popup41-announcement-nav">' +

          '<button ' +
            'class="lsffl-popup41-announcement-navbtn" ' +
            'id="lsffl-popup41-announcement-prev" ' +
            'type="button">' +
            'Previous' +
          '</button>' +


          '<span id="lsffl-popup41-announcement-counter">' +
            '1 / 1' +
          '</span>' +


          '<button ' +
            'class="lsffl-popup41-announcement-navbtn" ' +
            'id="lsffl-popup41-announcement-next" ' +
            'type="button">' +
            'Next' +
          '</button>' +

        '</div>' +


        '<div id="lsffl-popup41-announcement-footer">' +

          '<label>' +

            '<input ' +
              'id="lsffl-popup41-announcement-dontshow" ' +
              'type="checkbox">' +

            ' Don\'t show announcements again for 24 hours' +

          '</label>' +


          '<span>' +
            'LSFFL • 2026 SEASON' +
          '</span>' +

        '</div>' +

      '</div>';


    document.body.appendChild(
      announcementModal
    );


    document.getElementById(
      "lsffl-popup41-announcement-close"
    ).addEventListener(
      "click",
      closeAnnouncement
    );


    document.getElementById(
      "lsffl-popup41-announcement-prev"
    ).addEventListener(
      "click",
      function () {

        showAnnouncement(
          announcementIndex -
          1
        );

      }
    );


    document.getElementById(
      "lsffl-popup41-announcement-next"
    ).addEventListener(
      "click",
      function () {

        showAnnouncement(
          announcementIndex +
          1
        );

      }
    );


    document.getElementById(
      "lsffl-popup41-announcement-open"
    ).addEventListener(

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

          closeAnnouncement();

          return;
        }


        event.preventDefault();

        event.stopPropagation();

        event.stopImmediatePropagation();


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


  /* ============================================================
     SHOW ANNOUNCEMENT CARD
     ============================================================ */

  function showAnnouncement(index) {

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
      "lsffl-popup41-announcement-eyebrow"
    ).textContent =
      item.eyebrow ||
      "LSFFL";


    document.getElementById(
      "lsffl-popup41-announcement-title"
    ).textContent =
      item.title ||
      "League Update";


    document.getElementById(
      "lsffl-popup41-announcement-text"
    ).textContent =
      item.body ||
      "";


    document.getElementById(
      "lsffl-popup41-announcement-meta"
    ).textContent =
      item.meta ||
      "";


    var open =
      document.getElementById(
        "lsffl-popup41-announcement-open"
      );


    if (
      item.buttonUrl
    ) {

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
      "lsffl-popup41-announcement-counter"
    ).textContent =
      (
        announcementIndex +
        1
      ) +
      " / " +
      announcementItems.length;


    document.getElementById(
      "lsffl-popup41-announcement-prev"
    ).disabled =
      announcementIndex ===
      0;


    document.getElementById(
      "lsffl-popup41-announcement-next"
    ).disabled =
      announcementIndex ===
      announcementItems.length -
      1;
  }


  /* ============================================================
     OPEN / CLOSE ANNOUNCEMENT CENTER
     ============================================================ */

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
      "lsffl-popup41-announcement-dontshow"
    ).checked =
      false;


    announcementModal.hidden =
      false;


    showAnnouncement(
      0
    );


    /*
     * Only mark this session as shown AFTER
     * the popup has actually opened.
     */

    try {

      sessionStorage.setItem(
        ANNOUNCEMENT_SESSION_KEY,
        "1"
      );

    } catch (error) {
      /* Storage unavailable. */
    }


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
        "lsffl-popup41-announcement-dontshow"
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

      } catch (error) {
        /* Storage unavailable. */
      }
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

    } catch (error) {
      /* Storage unavailable. */
    }


    try {

      if (
        sessionStorage.getItem(
          ANNOUNCEMENT_SESSION_KEY
        ) ===
        "1"
      ) {
        return false;
      }

    } catch (error) {
      /* Storage unavailable. */
    }


    return true;
  }


  /* ============================================================
     DISABLE MFL NATIVE LEAGUE NOTIFICATION POPUP
     ============================================================ */

  function disableMflNativeNotificationPopup() {

    function killPopup() {

      var popup =
        document.getElementById(
          "MFLPlayerPopupContainer"
        );


      var notification =
        document.getElementById(
          "MFLPlayerPopupNotificationContainer"
        );


      if (
        notification
      ) {

        notification.style.setProperty(
          "display",
          "none",
          "important"
        );

        notification.style.setProperty(
          "visibility",
          "hidden",
          "important"
        );

      }


      if (
        popup
      ) {

        popup.style.setProperty(
          "display",
          "none",
          "important"
        );

        popup.style.setProperty(
          "visibility",
          "hidden",
          "important"
        );

      }
    }


    /*
     * Kill MFL's notification popup immediately if it
     * already exists when our popup manager starts.
     */

    killPopup();


    /*
     * MFL can activate the popup after our JavaScript
     * has loaded, so watch the DOM briefly and kill it
     * if MFL changes or recreates the popup.
     */

    var observer =
      new MutationObserver(
        killPopup
      );


    observer.observe(
      document.documentElement,
      {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: [
          "style",
          "class"
        ]
      }
    );


    window.setTimeout(
      function () {

        observer.disconnect();

        killPopup();

      },
      15000
    );
  }


  /* ============================================================
     ANNOUNCEMENT BOOT
     ============================================================ */

  function bootAnnouncement() {

    if (
      !isHomepage()
    ) {
      return;
    }


    /*
     * IMPORTANT:
     * Do not suppress MFL's popup container here.
     *
     * MFL reuses MFLPlayerPopupContainer for legitimate player/news
     * popups. Hiding that container causes the page to dim while the
     * player popup itself never appears.
     *
     * Native automatic notifications are already disabled by the
     * LSFFL header, so no DOM suppression is needed here.
     */


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

      var managerAlertReady =
        Boolean(
          nativeNotificationText()
        );


      if (
        articleReady ||
        managerAlertReady ||
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


  /* ============================================================
     PUBLIC POP-UP 4.4 API
     ============================================================ */

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


  /* ============================================================
     START
     ============================================================ */

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

})()
