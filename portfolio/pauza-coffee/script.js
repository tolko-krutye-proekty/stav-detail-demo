const tabs = document.querySelectorAll("[data-category]");
const menuItems = document.querySelectorAll("[data-item-category]");
const receiptDate = document.querySelector("[data-receipt-date]");
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const bookingForm = document.querySelector("[data-booking-form]");
const formResult = document.querySelector("[data-form-result]");
const openStatus = document.querySelector("[data-open-status]");

if (receiptDate) {
  receiptDate.textContent = new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(new Date());
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const selectedCategory = tab.dataset.category;

    tabs.forEach((item) => {
      const isSelected = item === tab;
      item.classList.toggle("is-active", isSelected);
      item.setAttribute("aria-pressed", String(isSelected));
    });

    menuItems.forEach((item) => {
      item.hidden = item.dataset.itemCategory !== selectedCategory;
    });
  });
});

if (menuToggle && siteNav) {
  const menuLabel = menuToggle.querySelector(".sr-only");

  const closeMenu = () => {
    menuToggle.setAttribute("aria-expanded", "false");
    siteNav.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    if (menuLabel) menuLabel.textContent = "Открыть меню";
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    siteNav.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("menu-open", !isOpen);
    if (menuLabel) menuLabel.textContent = isOpen ? "Открыть меню" : "Закрыть меню";
    if (!isOpen) setTimeout(() => siteNav.querySelector("a")?.focus(), 170);
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });

  document.addEventListener("keydown", (event) => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";

    if (event.key === "Escape" && isOpen) {
      closeMenu();
      menuToggle.focus();
    }

    if (event.key === "Tab" && isOpen) {
      const focusable = [...siteNav.querySelectorAll("a"), menuToggle];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  window.matchMedia("(min-width: 761px)").addEventListener("change", (event) => {
    if (event.matches) closeMenu();
  });
}

if (openStatus) {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  const openingHours = [9, 8, 8, 8, 8, 8, 9];
  const opensAt = openingHours[day];
  const isOpen = hour >= opensAt && hour < 22;

  if (isOpen) {
    openStatus.textContent = "Сейчас открыто до 22:00";
  } else if (hour < opensAt) {
    openStatus.textContent = `Сейчас закрыто · откроемся сегодня в ${opensAt}:00`;
  } else {
    const tomorrowOpensAt = openingHours[(day + 1) % 7];
    openStatus.textContent = `Сейчас закрыто · откроемся завтра в ${tomorrowOpensAt}:00`;
  }
  openStatus.parentElement?.classList.toggle("is-closed", !isOpen);
}

if (bookingForm && formResult) {
  bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(bookingForm);
    const name = String(formData.get("name") || "Гость").trim();

    formResult.textContent = `${name}, демо-заявка готова. В реальном проекте она отправится администратору в Telegram.`;
    formResult.hidden = false;
    bookingForm.reset();
  });
}
