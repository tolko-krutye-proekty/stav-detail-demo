"use strict";

const form = document.querySelector("#lead-form");
const statusBox = document.querySelector("#form-status");
const submitButton = form.querySelector("button[type='submit']");

document.querySelectorAll("[data-service]").forEach((link) => {
  link.addEventListener("click", () => {
    form.elements.service.value = link.dataset.service;
  });
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  statusBox.className = "form-status";

  if (window.location.protocol === "file:") {
    statusBox.textContent = "Для отправки заявки запустите проект через сервер по инструкции в README.";
    statusBox.classList.add("error");
    return;
  }

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const originalText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = "Отправляем…";

  try {
    const payload = Object.fromEntries(new FormData(form).entries());
    const response = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json();

    if (!response.ok || !result.ok) {
      throw new Error(result.message || "Неизвестная ошибка");
    }

    statusBox.textContent = result.message;
    statusBox.classList.add("success");
    form.reset();
  } catch (error) {
    statusBox.textContent = error.message || "Не удалось отправить заявку. Попробуйте ещё раз.";
    statusBox.classList.add("error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalText;
  }
});
