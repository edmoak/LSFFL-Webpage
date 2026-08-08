  /* ============================================================
     SUPPRESS MFL'S NATIVE DAILY HOMEPAGE POPUP

     Prevents MFL's original once-per-day homepage popup from
     appearing underneath or alongside the LSFFL Announcement
     Center.

     IMPORTANT:
     - Homepage only.
     - Does NOT touch LSFFL popups.
     - Does NOT affect franchise popups.
     - Does NOT affect Commissioner Article popups.
     ============================================================ */

  var nativeMflPopupObserver = null;
  var nativeMflPopupStopTimer = null;


  function isLsfflPopupElement(element) {

    if (
      !element ||
      element.nodeType !== 1
    ) {
      return false;
    }


    if (
      element.id &&
      /^lsffl-popup41-/i.test(
        element.id
      )
    ) {
      return true;
    }


    if (
      element.closest &&
      element.closest(
        "#lsffl-popup41-modal," +
        "#lsffl-popup41-announcement"
      )
    ) {
      return true;
    }


    if (
      element.querySelector &&
      element.querySelector(
        "#lsffl-popup41-modal," +
        "#lsffl-popup41-announcement"
      )
    ) {
      return true;
    }


    return false;
  }


  function looksLikeNativeMflPopup(
    element
  ) {

    if (
      !element ||
      element.nodeType !== 1 ||
      isLsfflPopupElement(
        element
      )
    ) {
      return false;
    }


    var style;


    try {

      style =
        window.getComputedStyle(
          element
        );

    } catch (error) {

      return false;

    }


    if (
      !style ||
      style.display === "none" ||
      style.visibility === "hidden" ||
      Number(
        style.opacity || 1
      ) === 0
    ) {
      return false;
    }


    var rect;


    try {

      rect =
        element.getBoundingClientRect();

    } catch (error) {

      return false;

    }


    if (
      rect.width < 180 ||
      rect.height < 90
    ) {
      return false;
    }


    var position =
      String(
        style.position || ""
      ).toLowerCase();


    var zIndex =
      parseInt(
        style.zIndex,
        10
      );


    var name =
      (
        String(
          element.id || ""
        ) +
        " " +
        String(
          element.className || ""
        ) +
        " " +
        String(
          element.getAttribute(
            "role"
          ) || ""
        )
      ).toLowerCase();


    var popupNamed =
      /popup|modal|dialog|lightbox|overlay/.test(
        name
      );


    var dialogRole =
      String(
        element.getAttribute(
          "role"
        ) || ""
      ).toLowerCase() ===
      "dialog";


    var floating =
      position === "fixed" ||
      position === "absolute";


    var highLayer =
      !isNaN(
        zIndex
      ) &&
      zIndex >= 100;


    return (
      dialogRole ||
      (
        popupNamed &&
        floating &&
        highLayer
      )
    );
  }


  function hideNativeMflPopup(
    element
  ) {

    if (
      !looksLikeNativeMflPopup(
        element
      )
    ) {
      return false;
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


    element.setAttribute(
      "aria-hidden",
      "true"
    );


    return true;
  }


  function suppressNativeMflPopups() {

    if (
      !isHomepage()
    ) {
      return;
    }


    var selectors = [

      '[role="dialog"]',

      '[id*="popup" i]',

      '[class*="popup" i]',

      '[id*="modal" i]',

      '[class*="modal" i]',

      '[id*="lightbox" i]',

      '[class*="lightbox" i]',

      '[id*="overlay" i]',

      '[class*="overlay" i]'

    ];


    var candidates =
      [];


    selectors.forEach(
      function (selector) {

        try {

          candidates =
            candidates.concat(

              Array.prototype.slice.call(

                document.querySelectorAll(
                  selector
                )

              )

            );

        } catch (error) {}

      }
    );


    candidates.forEach(
      hideNativeMflPopup
    );
  }


  function watchForNativeMflPopup() {

    if (
      !isHomepage() ||
      nativeMflPopupObserver
    ) {
      return;
    }


    suppressNativeMflPopups();


    nativeMflPopupObserver =
      new MutationObserver(

        function (mutations) {


          mutations.forEach(

            function (mutation) {


              Array.prototype.forEach.call(

                mutation.addedNodes ||
                  [],

                function (node) {


                  if (
                    !node ||
                    node.nodeType !== 1
                  ) {
                    return;
                  }


                  hideNativeMflPopup(
                    node
                  );


                  if (
                    node.querySelectorAll
                  ) {


                    var descendants =
                      node.querySelectorAll(

                        '[role="dialog"],' +

                        '[id*="popup" i],' +

                        '[class*="popup" i],' +

                        '[id*="modal" i],' +

                        '[class*="modal" i],' +

                        '[id*="lightbox" i],' +

                        '[class*="lightbox" i],' +

                        '[id*="overlay" i],' +

                        '[class*="overlay" i]'

                      );


                    Array.prototype.forEach.call(

                      descendants,

                      hideNativeMflPopup

                    );

                  }

                }

              );

            }

          );


          suppressNativeMflPopups();

        }

      );


    nativeMflPopupObserver.observe(

      document.documentElement,

      {

        childList: true,

        subtree: true

      }

    );


    nativeMflPopupStopTimer =
      window.setTimeout(

        function () {


          if (
            nativeMflPopupObserver
          ) {

            nativeMflPopupObserver.disconnect();

            nativeMflPopupObserver =
              null;

          }


          nativeMflPopupStopTimer =
            null;

        },

        12000

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
     * Start blocking MFL's original daily popup BEFORE
     * our LSFFL Announcement Center opens.
     */

    watchForNativeMflPopup();


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


      if (
        articleReady ||
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
