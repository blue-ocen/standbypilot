const APP_CORE_SRC = './app-core.js';
const BATTLE_CARD_SRC = './battle-card.js';

let appCoreLoaded = false;
let battleCardLoaded = false;

function showLoadError(message) {
  const error = document.getElementById('appLoadError');
  if (error) error.textContent = message;
  else console.warn(message);
}

function loadBattleCardRenderer() {
  if (battleCardLoaded) return;
  battleCardLoaded = true;
  const script = document.createElement('script');
  script.src = BATTLE_CARD_SRC;
  script.onerror = () => {
    battleCardLoaded = false;
    showLoadError('Could not load the Route Brief renderer. Refresh and try again.');
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
    showLoadError('Could not load the app. Refresh and try again.');
  };
  document.body.appendChild(script);
}

function initPrototypeApp() {
  document.getElementById('lockApp')?.addEventListener('click', () => {
    window.location.href = './login.html';
  });
  loadAppCore();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPrototypeApp);
} else {
  initPrototypeApp();
}
