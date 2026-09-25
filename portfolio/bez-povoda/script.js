const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');

function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Открыть меню');
  navigation.classList.remove('is-open');
}

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Открыть меню' : 'Закрыть меню');
  navigation.classList.toggle('is-open', !isOpen);
});

navigation.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', closeMenu);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});

const filterButtons = [...document.querySelectorAll('.filter')];
const productCards = [...document.querySelectorAll('.product-card')];

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const mood = button.dataset.filter;
    filterButtons.forEach((other) => {
      const active = other === button;
      other.classList.toggle('is-active', active);
      other.setAttribute('aria-pressed', String(active));
    });
    productCards.forEach((card) => {
      card.hidden = mood !== 'all' && card.dataset.mood !== mood;
    });
  });
});

const bouquetSelect = document.querySelector('#bouquet-choice');
document.querySelectorAll('[data-select]').forEach((button) => {
  button.addEventListener('click', () => {
    bouquetSelect.value = button.dataset.select;
    document.querySelector('#request').scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
    window.setTimeout(() => bouquetSelect.focus({ preventScroll: true }), 300);
  });
});

const demoForm = document.querySelector('#demo-form');
const feedback = document.querySelector('#form-feedback');

demoForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = demoForm.elements.name.value.trim();
  if (!name) {
    feedback.hidden = false;
    feedback.textContent = 'Укажите, как к вам обращаться.';
    demoForm.elements.name.focus();
    return;
  }

  const bouquet = bouquetSelect.value || 'букет по вашей идее';
  feedback.hidden = false;
  feedback.textContent = `Спасибо, ${name}! Вы выбрали «${bouquet}». Это демонстрация: заявка не отправлена. На реальном сайте её можно направлять владельцу в Telegram.`;
});
