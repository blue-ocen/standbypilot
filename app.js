// TEMPORARY PROTOTYPE PASSWORD ONLY. This is not production-grade security.
const PROTOTYPE_PASSWORD = 'standby2026';
const ACCESS_SESSION_KEY = 'standbypilot_access_unlocked';
const APP_CORE_SRC = './app-core.js?v=1.0.2';
const BATTLE_CARD_SRC = './battle-card.js?v=1.0.1';

let appCoreLoaded = false;
let battleCardLoaded = false;

function setAppVisible(isVisible) {
  ['appHeader', 'appMain', 'appFooter'].forEach((id) => {
    const element = document.getElementById(id);
    if (element) element.hidden = !isVisible;
  });
}

function setGateVisible(isVisible) {
  const gate = document.getElementById('accessGate');
  if (gate) gate.hidden = !isVisible;
}

function showAccessError(message) {
  const error = document.getElementById('accessError');
  if (error) error.textContent = message;
}

function loadBattleCardRenderer() {
  if (battleCardLoaded) return;
  battleCardLoaded = true;
  const script = document.createElement('script');
  script.src = BATTLE_CARD_SRC;
  script.onerror = () => {
    battleCardLoaded = false;
    showAccessError('Could not load the Battle Card renderer. Refresh and try again.');
  };
  document.body.appendChild(script);
}

function loadAppCore() {
  if (appCoreLoaded) return;
  appCoreLoaded = true;
  const script = document.createElement('script');
  script.src = APP_CORE_SRC;
  script.onload = loadBattleCardRenderer;
  script.onerror = () => {
    appCoreLoaded = false;
    showAccessError('Could not load the app. Refresh and try again.');
  };
  document.body.appendChild(script);
}

function unlockPrototype() {
  sessionStorage.setItem(ACCESS_SESSION_KEY, 'true');
  setGateVisible(false);
  setAppVisible(true);
  loadAppCore();
}

function lockPrototype() {
  sessionStorage.removeItem(ACCESS_SESSION_KEY);
  setAppVisible(false);
  setGateVisible(true);
  const passwordInput = document.getElementById('accessPassword');
  const error = document.getElementById('accessError');
  if (passwordInput) {
    passwordInput.value = '';
    passwordInput.focus();
  }
  if (error) error.textContent = '';
}

function initAccessGate() {
  const form = document.getElementById('accessForm');
  const passwordInput = document.getElementById('accessPassword');
  const error = document.getElementById('accessError');
  const lockButton = document.getElementById('lockApp');

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (passwordInput?.value === PROTOTYPE_PASSWORD) {
      unlockPrototype();
      return;
    }
    if (error) error.textContent = 'Incorrect prototype password.';
    passwordInput?.focus();
  });

  lockButton?.addEventListener('click', lockPrototype);

  if (sessionStorage.getItem(ACCESS_SESSION_KEY) === 'true') {
    unlockPrototype();
  } else {
    lockPrototype();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAccessGate);
} else {
  initAccessGate();
}
