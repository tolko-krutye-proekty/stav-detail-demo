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
      item.setAttribute("aria-selected", String(isSelected));
    });

    menuItems.forEach((item) => {
      item.hidden = item.dataset.itemCategory !== selectedCategory;
    });
  });
});

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    siteNav.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("menu-open", !isOpen);
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.setAttribute("aria-expanded", "false");
      siteNav.classList.remove("is-open");
      document.body.classList.remove("menu-open");
    });
  });
}

if (openStatus) {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  const weekend = day === 0 || day === 6;
  const opensAt = weekend ? 9 : 8;
  const isOpen = hour >= opensAt && hour < 22;

  openStatus.textContent = isOpen ? "Сейчас открыто до 22:00" : `Сейчас закрыто · откроемся в ${opensAt}:00`;
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
