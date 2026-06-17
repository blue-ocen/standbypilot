const APP_CORE_SRC = './app-core.js';
const PAID_RESCUE_SRC = './paid-rescue.js';
const ROUTE_RECOMMENDATIONS_SRC = './route-recommendations.js';
const ROUTE_DETAILS_SRC = './route-details.js';
const ROUTE_DETAILS_CSS = './route-details.css';
const OUTCOME_TRACKER_SRC = './outcome-tracker.js';
const OUTCOME_TRACKER_CSS = './outcome-tracker.css';
const BATTLE_CARD_SRC = './battle-card.js';

let appCoreLoaded = false;
let paidRescueLoaded = false;
let routeRecommendationsLoaded = false;
let routeDetailsLoaded = false;
let outcomeTrackerLoaded = false;
let battleCardLoaded = false;
let routeDetailsStylesLoaded = false;
let outcomeTrackerStylesLoaded = false;

function showLoadError(message) {
  const error = document.getElementById('appLoadError');
  if (error) error.textContent = message;
  else console.warn(message);
}

function loadRouteDetailsStyles() {
  if (routeDetailsStylesLoaded) return;
  routeDetailsStylesLoaded = true;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = ROUTE_DETAILS_CSS;
  document.head.appendChild(link);
}

function loadOutcomeTrackerStyles() {
  if (outcomeTrackerStylesLoaded) return;
  outcomeTrackerStylesLoaded = true;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = OUTCOME_TRACKER_CSS;
  document.head.appendChild(link);
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

function loadOutcomeTracker() {
  if (outcomeTrackerLoaded) return;
  outcomeTrackerLoaded = true;
  loadOutcomeTrackerStyles();
  const script = document.createElement('script');
  script.src = OUTCOME_TRACKER_SRC;
  script.onload = loadBattleCardRenderer;
  script.onerror = () => {
    outcomeTrackerLoaded = false;
    showLoadError('Could not load the Outcome Tracker. Refresh and try again.');
  };
  document.body.appendChild(script);
}

function loadRouteDetailsDrawers() {
  if (routeDetailsLoaded) return;
  routeDetailsLoaded = true;
  loadRouteDetailsStyles();
  const script = document.createElement('script');
  script.src = ROUTE_DETAILS_SRC;
  script.onload = loadOutcomeTracker;
  script.onerror = () => {
    routeDetailsLoaded = false;
    showLoadError('Could not load route details drawers. Refresh and try again.');
  };
  document.body.appendChild(script);
}

function loadRouteRecommendations() {
  if (routeRecommendationsLoaded) return;
  routeRecommendationsLoaded = true;
  const script = document.createElement('script');
  script.src = ROUTE_RECOMMENDATIONS_SRC;
  script.onload = loadRouteDetailsDrawers;
  script.onerror = () => {
    routeRecommendationsLoaded = false;
    showLoadError('Could not load refined route recommendations. Refresh and try again.');
  };
  document.body.appendChild(script);
}

function loadPaidRescuePreference() {
  if (paidRescueLoaded) return;
  paidRescueLoaded = true;
  const script = document.createElement('script');
  script.src = PAID_RESCUE_SRC;
  script.onload = loadRouteRecommendations;
  script.onerror = () => {
    paidRescueLoaded = false;
    showLoadError('Could not load paid rescue preference behavior. Refresh and try again.');
  };
  document.body.appendChild(script);
}

function loadAppCore() {
  if (appCoreLoaded) return;
  appCoreLoaded = true;
  const script = document.createElement('script');
  script.src = APP_CORE_SRC;
  script.onload = loadPaidRescuePreference;
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
