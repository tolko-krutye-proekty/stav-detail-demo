const moodList = document.querySelector('.mood-list');
const moodChoices = [...document.querySelectorAll('.mood-choice')];
const bouquetPanels = [...document.querySelectorAll('.bouquet-panel')];
const bouquetSelect = document.querySelector('#bouquet-choice');
const chosenPhoto = document.querySelector('#chosen-photo');
const chosenName = document.querySelector('#chosen-name');
const demoForm = document.querySelector('#demo-form');
const feedback = document.querySelector('#form-feedback');
const nameInput = document.querySelector('#guest-name');
const compactLayout = window.matchMedia('(max-width: 1100px)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const bouquetViewer = document.querySelector('#bouquet-viewer');
const viewerPhoto = document.querySelector('#viewer-photo');
const viewerTitle = document.querySelector('#viewer-title');
let viewerTrigger = null;

function releaseViewer() {
  document.body.classList.remove('viewer-open');
  viewerTrigger?.focus({ preventScroll: true });
}
function closeViewer() {
  bouquetViewer.close();
  releaseViewer();
}

document.querySelectorAll('[data-view]').forEach((button) => {
  button.addEventListener('click', () => {
    const panel = button.closest('.bouquet-panel');
    const photo = panel.querySelector('.bouquet-photo img');
    viewerPhoto.src = photo.currentSrc || photo.src;
    viewerPhoto.alt = photo.alt;
    viewerTitle.textContent = panel.querySelector('h2').textContent.replace(/\s+/g, ' ').trim();
    viewerTrigger = button;
    document.body.classList.add('viewer-open');
    bouquetViewer.showModal();
  });
});
document.querySelector('[data-close-viewer]').addEventListener('click', closeViewer);
bouquetViewer.addEventListener('click', (event) => {
  if (event.target === bouquetViewer) closeViewer();
});
bouquetViewer.addEventListener('cancel', (event) => {
  event.preventDefault();
  closeViewer();
});
bouquetViewer.addEventListener('close', () => {
  if (!bouquetViewer.open) releaseViewer();
});

const bouquets = [
  { name: 'Тёплый день', photo: 'assets/bouquet-warm-cutout.webp' },
  { name: 'Тихий разговор', photo: 'assets/bouquet-light-cutout.webp' },
  { name: 'Без слов', photo: 'assets/bouquet-bright-cutout.webp' },
];

function showBouquet(index, moveFocus = false) {
  moodChoices.forEach((choice, position) => {
    const active = position === index;
    choice.setAttribute('aria-selected', String(active));
    choice.tabIndex = active ? 0 : -1;
    bouquetPanels[position].hidden = !active;
    bouquetPanels[position].classList.toggle('is-entering', active);
  });
  if (moveFocus) moodChoices[index].focus();
}

// Without JavaScript the links and all three bouquets remain readable.
moodList.setAttribute('role', 'tablist');
function setTabOrientation() {
  moodList.setAttribute('aria-orientation', compactLayout.matches ? 'horizontal' : 'vertical');
}
setTabOrientation();
compactLayout.addEventListener('change', setTabOrientation);
moodChoices.forEach((choice, index) => {
  choice.setAttribute('role', 'tab');
  choice.setAttribute('aria-controls', choice.dataset.panel);
  const panel = bouquetPanels[index];
  panel.setAttribute('role', 'tabpanel');
  panel.setAttribute('aria-labelledby', choice.id);
  panel.tabIndex = 0;
  choice.addEventListener('click', (event) => {
    event.preventDefault();
    showBouquet(index);
  });
  choice.addEventListener('keydown', (event) => {
    let targetIndex;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') targetIndex = (index + 1) % moodChoices.length;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') targetIndex = (index + moodChoices.length - 1) % moodChoices.length;
    if (event.key === 'Home') targetIndex = 0;
    if (event.key === 'End') targetIndex = moodChoices.length - 1;
    if (event.key === ' ') targetIndex = index;
    if (targetIndex !== undefined) {
      event.preventDefault();
      showBouquet(targetIndex, true);
    }
  });
});
document.body.classList.add('js-ready');
const initialIndex = bouquetPanels.findIndex((panel) => '#' + panel.id === window.location.hash);
showBouquet(initialIndex < 0 ? 0 : initialIndex);

function updateEnclosure() {
  const bouquet = bouquets.find((item) => item.name === bouquetSelect.value);
  chosenName.textContent = bouquet ? bouquet.name : 'Ваша идея';
  chosenPhoto.src = bouquet ? bouquet.photo : 'assets/bouquet-warm-cutout.webp';
  chosenPhoto.alt = bouquet ? 'Выбранный букет «' + bouquet.name + '»' : 'Цветы как вдохновение для вашего букета';
  feedback.hidden = true;
}
bouquetSelect.addEventListener('change', updateEnclosure);

function openLetter() {
  updateEnclosure();
  nameInput.focus({ preventScroll: true });
  document.querySelector('#request').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
}
document.querySelectorAll('[data-select]').forEach((button) => {
  button.addEventListener('click', () => {
    bouquetSelect.value = button.dataset.select;
    openLetter();
  });
});
document.querySelector('[data-own-idea]').addEventListener('click', (event) => {
  event.preventDefault();
  bouquetSelect.value = 'Хочу обсудить свою идею';
  openLetter();
});

demoForm.addEventListener('input', () => {
  feedback.hidden = true;
  nameInput.removeAttribute('aria-invalid');
});
demoForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = nameInput.value.trim();
  feedback.hidden = false;
  if (!name) {
    nameInput.setAttribute('aria-invalid', 'true');
    feedback.textContent = 'Напишите ваше имя — так флорист поймёт, как к вам обращаться.';
    nameInput.focus();
    return;
  }
  nameInput.removeAttribute('aria-invalid');
  const idea = demoForm.elements.message.value.trim();
  const bouquet = bouquetSelect.value === 'Хочу обсудить свою идею' ? 'Букет по вашей идее' : 'Букет «' + bouquetSelect.value + '»';
  feedback.textContent = name + ', вот ваша заявка:\n' + bouquet + '.' + (idea ? '\nПожелания: ' + idea : '') + '\n\nЭто демонстрация. Заявка не отправлена, данные не сохранены.';
});

// Enable input only after the no-network submit handler is attached.
document.querySelector('.letter-fields').disabled = false;
