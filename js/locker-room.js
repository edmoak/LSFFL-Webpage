/* =========================================================
   LSFFL LOCKER ROOM DROPDOWN + CENTERED POPUP WINDOWS
   File: js/locker-room.js
========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  const dropdown = document.querySelector(".locker-room-dropdown");
  const toggle = document.querySelector(".nav-dropdown-toggle");
  const menu = document.querySelector(".nav-dropdown-menu");

  if (!dropdown || !toggle || !menu) {
    return;
  }

  /* =======================================================
     DROPDOWN CONTROLS
  ======================================================= */

  function openDropdown() {
    dropdown.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
  }

  function closeDropdown() {
    dropdown.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }

  function toggleDropdown() {
    if (dropdown.classList.contains("is-open")) {
      closeDropdown();
    } else {
      openDropdown();
    }
  }

  toggle.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    toggleDropdown();
  });

  document.addEventListener("click", function (event) {
    if (!dropdown.contains(event.target)) {
      closeDropdown();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeDropdown();
      toggle.focus();
    }
  });

  /* =======================================================
     CENTERED POPUP WINDOW
  ======================================================= */

  function openLockerRoomPopup(url) {
    const screenWidth =
      window.screen.availWidth || window.screen.width || 1400;

    const screenHeight =
      window.screen.availHeight || window.screen.height || 900;

    const popupWidth = Math.min(
      1450,
      Math.floor(screenWidth * 0.92)
    );

    const popupHeight = Math.min(
      900,
      Math.floor(screenHeight * 0.88)
    );

    const left = Math.max(
      0,
      Math.floor((screenWidth - popupWidth) / 2)
    );

    const top = Math.max(
      0,
      Math.floor((screenHeight - popupHeight) / 2)
    );

    const popupFeatures = [
      "popup=yes",
      "resizable=yes",
      "scrollbars=yes",
      "toolbar=no",
      "menubar=no",
      "location=yes",
      "status=no",
      "width=" + popupWidth,
      "height=" + popupHeight,
      "left=" + left,
      "top=" + top
    ].join(",");

    const popupWindow = window.open(
      url,
      "LSFFL_Locker_Room",
      popupFeatures
    );

    if (popupWindow) {
      popupWindow.focus();
    } else {
      window.location.href = url;
    }
  }

  /* =======================================================
     APPLY POPUP TO LOCKER ROOM LINKS
  ======================================================= */

  const lockerRoomLinks = menu.querySelectorAll("a[href]");

  lockerRoomLinks.forEach(function (link) {
    link.removeAttribute("target");
    link.removeAttribute("rel");

    link.addEventListener("click", function (event) {
      const destination = link.getAttribute("href");

      if (!destination || destination === "#") {
        return;
      }

      event.preventDefault();
      closeDropdown();
      openLockerRoomPopup(destination);
    });
  });
});
