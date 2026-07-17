/* =========================================================
   LSFFL LOCKER ROOM DROPDOWN
   Save as: js/locker-room.js
========================================================= */

(() => {
  "use strict";

  const dropdown = document.querySelector(".locker-room-dropdown");

  if (!dropdown) {
    return;
  }

  const toggle = dropdown.querySelector(".nav-dropdown-toggle");
  const menu = dropdown.querySelector(".nav-dropdown-menu");

  if (!toggle || !menu) {
    return;
  }

  const closeDropdown = () => {
    dropdown.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  const openDropdown = () => {
    dropdown.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
  };

  toggle.addEventListener("click", () => {
    const isOpen = dropdown.classList.contains("is-open");

    if (isOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  });

  document.addEventListener("click", (event) => {
    if (!dropdown.contains(event.target)) {
      closeDropdown();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeDropdown();
      toggle.focus();
    }
  });

  menu.addEventListener("click", (event) => {
    const link = event.target.closest("a");

    if (link) {
      closeDropdown();
    }
  });
})();
