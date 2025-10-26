import { Storage } from '../shared/storage';

// ================================
// Constants
// ================================
const SELECTORS = {
  popup: '[class^="Content__StyledContentElement"]',
  popupStats: '[class^="styles__MenuContainer"]',
  popupName: '[class^="HeadingBase"][class*="styles__Name"]',
  playerCard: '[class^="styles__Container-sc-5688573a-0"]',
  playerName: '[class^="styles__Container-sc-3441c003-0"]'
};

const COLORS = {
  good: '#a0f3a0',
  bad: '#f3a0a0',
  neutral: 'rgba(6, 6, 6, 0.6)'
};

// ================================
// Utility Functions
// ================================
function createButton(type, size = 24) {
  const btn = document.createElement('button');
  btn.className = `mark-${type}`;
  btn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">
      <path fill="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="${type === 'good'
          ? 'M7 11v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3a4 4 0 0 0 4-4V6a2 2 0 0 1 4 0v5h3a2 2 0 0 1 2 2l-1 5a2 3 0 0 1-2 2h-7a3 3 0 0 1-3-3'
          : 'M7 13V5a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h3a4 4 0 0 1 4 4v1a2 2 0 0 0 4 0v-5h3a2 2 0 0 0 2-2l-1-5a2 3 0 0 0-2-2h-7a3 3 0 0 0-3 3'}" />
    </svg>
  `;
  return btn;
}

function createButtonContainer(name, size = 24, wrapperClass = 'player-card-marker-buttons') {
  const container = document.createElement('div');
  container.className = wrapperClass;
  container.id = name;
  container.append(createButton('good', size), createButton('bad', size));
  return container;
}

async function loadAndApplyState(name, goodBtn, badBtn, container) {
  const data = await Storage.get(name);
  const value = data[name];

  if (value === 'good') {
    goodBtn.classList.add('active');
    if (container) container.style.borderColor = COLORS.good;
  } else if (value === 'bad') {
    badBtn.classList.add('active');
    if (container) container.style.borderColor = COLORS.bad;
  }
}

function handleButtonClick(name, type) {
  return async () => {
    const data = await Storage.get(name);
    if (data && data[name] === type) {
      Storage.remove(name);
    } else {
      Storage.set({ [name]: type });
    }
  };
}

// ================================
// Observers
// ================================
function observePopup() {
  const observer = new MutationObserver(async () => {
    const elem = document.querySelector(SELECTORS.popup);
    if (!elem || elem.querySelector('.popup-marker-buttons')) return;

    const statsElem = elem.querySelector(SELECTORS.popupStats);
    const nameElem = elem.querySelector(SELECTORS.popupName);
    if (!statsElem || !nameElem) return;

    const name = nameElem.textContent.trim();
    const container = createButtonContainer(name, 24, 'popup-marker-buttons');
    statsElem.parentNode.insertBefore(container, statsElem);

    const goodBtn = container.querySelector('.mark-good');
    const badBtn = container.querySelector('.mark-bad');

    await loadAndApplyState(name, goodBtn, badBtn);

    goodBtn.addEventListener('click', handleButtonClick(name, 'good'));
    badBtn.addEventListener('click', handleButtonClick(name, 'bad'));
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

function observePlayerCards() {
  const observer = new MutationObserver(() => {
    const players = document.querySelectorAll(SELECTORS.playerCard);

    players.forEach(async playerEl => {
      const parent = playerEl.parentElement;
      const nameElem = parent.querySelector(SELECTORS.playerName);
      if (!nameElem) return;

      const name = nameElem.textContent.trim();
      if (parent.querySelector('.player-card-marker-buttons')) return;

      const container = createButtonContainer(name, 20, 'player-card-marker-buttons');
      parent.append(container);

      const goodBtn = container.querySelector('.mark-good');
      const badBtn = container.querySelector('.mark-bad');

      await loadAndApplyState(name, goodBtn, badBtn, container);

      goodBtn.addEventListener('click', handleButtonClick(name, 'good'));
      badBtn.addEventListener('click', handleButtonClick(name, 'bad'));
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// ================================
// Storage Change Handler
// ================================
function updateButtons(changes) {
  const name = Object.keys(changes)[0];
  const { newValue, oldValue } = changes[name];

  const allContainers = document.querySelectorAll('.player-card-marker-buttons, .popup-marker-buttons');
  allContainers.forEach(container => {
    if (container.id !== name) return;

    const goodBtn = container.querySelector('.mark-good');
    const badBtn = container.querySelector('.mark-bad');

    const setState = (value) => {
      goodBtn.classList.toggle('active', value === 'good');
      badBtn.classList.toggle('active', value === 'bad');
      if (container.classList.contains('player-card-marker-buttons')) {
        container.style.borderColor =
          value === 'good' ? COLORS.good :
          value === 'bad' ? COLORS.bad : COLORS.neutral;
      }
    };

    if (!newValue && oldValue) setState(null);
    else if (newValue) setState(newValue);
  });
}

Storage.onChange(updateButtons);

// ================================
// Initialize
// ================================
observePopup();
observePlayerCards();
