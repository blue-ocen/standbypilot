const $ = (id) => document.getElementById(id);

const STORAGE_KEY = 'standbypilot_route_trips_v1';
const ACTIVE_KEY = 'standbypilot_route_active_trip_id';

const fields = [
  'tripName', 'origin', 'destination', 'earliestDeparture', 'mustArriveBy',
  'tripDirection', 'tripType', 'connections', 'scope', 'nearbyAirports',
  'returnDate', 'priority', 'notes', 'openSeats', 'standbyCount',
  'cabinNotes', 'lastChecked', 'loadNotes'
];

const US_AIRPORTS = new Set([
  'ATL', 'AUS', 'BNA', 'BOS', 'BUR', 'BWI', 'CLT', 'DAL', 'DCA', 'DEN', 'DFW',
  'DTW', 'EWR', 'FLL', 'HNL', 'IAD', 'IAH', 'JFK', 'LAS', 'LAX', 'LGA', 'MCO',
  'MDW', 'MIA', 'MSP', 'OAK', 'ONT', 'ORD', 'PDX', 'PHL', 'PHX', 'SAN', 'SEA',
  'SFO', 'SJC', 'SLC', 'SNA', 'TPA'
]);

const portugalSample = {
  tripName: 'Portugal route check',
  origin: 'SEA',
  destination: 'LIS / Faro / Portugal',
  earliestDeparture: '2026-06-30T18:00',
  mustArriveBy: '2026-07-02T18:00',
  tripDirection: 'roundtrip',
  tripType: 'event',
  connections: 'yes',
  scope: 'international',
  nearbyAirports: 'yes',
  returnDate: '2026-07-07',
  priority: 'highest-arrival-chance',
  notes: 'Algarve destination. Lisbon is acceptable with ground transfer; Faro is ideal.',
  openSeats: '',
  standbyCount: '',
  cabinNotes: '',
  lastChecked: '',
  loadNotes: 'Summer Europe final-leg risk. Add current load notes close to departure.'
};

const testTrips = [
  portugalSample,
  {
    tripName: 'LAX to SEA late return',
    origin: 'LAX',
    destination: 'SEA',
    earliestDeparture: '2026-06-27T21:00',
    mustArriveBy: '2026-06-28T01:00',
    tripDirection: 'one-way',
    tripType: 'casual',
    connections: 'no',
    scope: 'domestic',
    nearbyAirports: 'maybe',
    returnDate: '',
    priority: 'fastest',
    notes: 'Late nonstop window with last-flight risk.',
    openSeats: '',
    standbyCount: '',
    cabinNotes: '',
    lastChecked: '',
    loadNotes: ''
  },
  {
    tripName: 'London summer route',
    origin: 'SEA',
    destination: 'LHR / London',
    earliestDeparture: '2026-07-20T12:00',
    mustArriveBy: '2026-07-22T15:00',
    tripDirection: 'roundtrip',
    tripType: 'event',
    connections: 'yes',
    scope: 'international',
    nearbyAirports: 'yes',
    returnDate: '2026-07-26',
    priority: 'highest-arrival-chance',
    notes: 'Strong nonstop route, but summer timing needs backup airports.',
    openSeats: '',
    standbyCount: '',
    cabinNotes: '',
    lastChecked: '',
    loadNotes: ''
  },
  {
    tripName: 'Nairobi gateway route',
    origin: 'SEA',
    destination: 'NBO / Nairobi',
    earliestDeparture: '2026-09-10T08:00',
    mustArriveBy: '2026-09-12T18:00',
    tripDirection: 'roundtrip',
    tripType: 'casual',
    connections: 'yes',
    scope: 'international',
    nearbyAirports: 'maybe',
    returnDate: '2026-09-15',
    priority: 'highest-arrival-chance',
    notes: 'Long-haul gateway planning matters more than the first leg.',
    openSeats: '',
    standbyCount: '',
    cabinNotes: '',
    lastChecked: '',
    loadNotes: ''
  },
  {
    tripName: 'Christmas Europe return',
    origin: 'MUC / VIE',
    destination: 'SEA',
    earliestDeparture: '2026-12-25T08:00',
    mustArriveBy: '2026-12-26T23:00',
    tripDirection: 'one-way',
    tripType: 'work',
    connections: 'yes',
    scope: 'international',
    nearbyAirports: 'yes',
    returnDate: '',
    priority: 'highest-arrival-chance',
    notes: 'Holiday return window. Use multiple transatlantic gateways.',
    openSeats: '',
    standbyCount: '',
    cabinNotes: '',
    lastChecked: '',
    loadNotes: ''
  }
];

let state = {
  trips: [],
  activeTripId: null,
  currentScore: null,
  currentRoutes: []
};

function uid() {
  return `route_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatDateTime(value) {
  if (!value) return 'Not specified';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}

function hoursBetween(start, end) {
  if (!start || !end) return null;
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (Number.isNaN(s) || Number.isNaN(e)) return null;
  return (e - s) / (1000 * 60 * 60);
}

function clamp(num, min, max) {
  return Math.max(min, Math.min(max, num));
}

function titleCase(value) {
  return String(value || '')
    .replaceAll('-', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function emptyTrip() {
  return {
    tripName: '', origin: '', destination: '', earliestDeparture: '', mustArriveBy: '',
    tripDirection: 'roundtrip', tripType: 'casual', connections: 'yes', scope: 'auto',
    nearbyAirports: 'yes', returnDate: '', priority: 'highest-arrival-chance', notes: '',
    openSeats: '', standbyCount: '', cabinNotes: '', lastChecked: '', loadNotes: '',
    loadChecks: []
  };
}

function loadState() {
  try {
    state.trips = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    state.activeTripId = localStorage.getItem(ACTIVE_KEY) || null;
  } catch (err) {
    console.warn('Could not load saved routes.', err);
    state.trips = [];
    state.activeTripId = null;
  }
}

function persistState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.trips));
  if (state.activeTripId) localStorage.setItem(ACTIVE_KEY, state.activeTripId);
  else localStorage.removeItem(ACTIVE_KEY);
  renderSavedTrips();
}

function getFormData() {
  const data = Object.fromEntries(fields.map((id) => [id, $(id)?.value?.trim() ?? '']));
  data.tripDirection = data.tripDirection || 'roundtrip';
  data.tripType = data.tripType || 'casual';
  data.connections = data.connections || 'yes';
  data.scope = data.scope || 'auto';
  data.nearbyAirports = data.nearbyAirports || 'yes';
  data.priority = data.priority || 'highest-arrival-chance';
  data.travelers = '1';
  data.bags = 'carry-on';
  return data;
}

function setFormData(data = {}) {
  const normalized = { ...emptyTrip(), ...data };
  for (const id of fields) {
    if ($(id)) $(id).value = normalized[id] ?? '';
  }
  updateScopeHint();
  updateTripSummary(normalized, null, null);
}

function firstAirportCode(value) {
  const match = String(value || '').toUpperCase().match(/\b[A-Z]{3}\b/);
  return match ? match[0] : '';
}

function inferScope(data) {
  const originCode = firstAirportCode(data.origin);
  const destCode = firstAirportCode(data.destination);
  const text = `${data.destination || ''} ${data.notes || ''}`.toLowerCase();
  if (/(portugal|london|nairobi|europe|lis|faro|fao|lhr|nbo|cdg|ams|fra|muc|vie|tokyo|paris|mexico|canada)/i.test(text)) return 'international';
  if (originCode && destCode && US_AIRPORTS.has(originCode) && US_AIRPORTS.has(destCode)) return 'domestic';
  if (originCode && destCode && US_AIRPORTS.has(originCode) && !US_AIRPORTS.has(destCode)) return 'international';
  if (originCode && destCode && !US_AIRPORTS.has(originCode) && US_AIRPORTS.has(destCode)) return 'international';
  return 'uncertain';
}

function effectiveScope(data) {
  if (data.scope === 'domestic' || data.scope === 'international') {
    return { value: data.scope, inferred: false, uncertain: false };
  }
  const inferred = inferScope(data);
  if (inferred === 'uncertain') return { value: 'domestic', inferred: true, uncertain: true };
  return { value: inferred, inferred: true, uncertain: false };
}

function updateScopeHint() {
  const hint = $('scopeHint');
  if (!hint) return;
  const data = getFormData();
  const scope = effectiveScope(data);
  if (data.scope !== 'auto') {
    hint.textContent = `Manual scope selected: ${titleCase(data.scope)}.`;
  } else if (scope.uncertain) {
    hint.textContent = 'Scope is uncertain. Choose Domestic or International in More details for a sharper rating.';
  } else {
    hint.textContent = `Auto-detected scope: ${titleCase(scope.value)}.`;
  }
}

function hasLoadData(data) {
  return data.openSeats !== '' || data.standbyCount !== '' || data.cabinNotes || data.loadNotes;
}

function loadMargin(data) {
  const openSeats = data.openSeats === '' ? null : Number(data.openSeats);
  const standbyCount = data.standbyCount === '' ? null : Number(data.standbyCount);
  if (!Number.isFinite(openSeats) || !Number.isFinite(standbyCount)) return null;
  return openSeats - standbyCount - 1;
}

function riskLevel(score) {
  if (score <= 25) return { grade: 'A', label: 'Low', className: 'green', summary: 'Strong non-rev setup if loads do not deteriorate.' };
  if (score <= 45) return { grade: 'B', label: 'Moderate', className: 'yellow', summary: 'Playable route. Keep the backup active.' };
  if (score <= 65) return { grade: 'C', label: 'Elevated', className: 'orange', summary: 'Risky enough that Plan B matters.' };
  return { grade: 'D', label: 'High', className: 'red', summary: 'Do not let this depend on one standby path.' };
}

function finalCall(level, data) {
  if (level.grade === 'D') return 'Switch route or buy fallback';
  if (level.grade === 'C') return data.connections === 'yes' ? 'Go early with backups' : 'Find a backup before going';
  if (level.grade === 'B') return 'Monitor and keep Plan B ready';
  return 'Go with monitoring';
}

function scoreTrip(data) {
  let score = 24;
  const reasons = [];
  const credits = [];
  const scope = effectiveScope(data);
  const gapHours = hoursBetween(data.earliestDeparture, data.mustArriveBy);
  const margin = loadMargin(data);

  if (scope.value === 'international') {
    score += 15;
    reasons.push('International route adds document, connection, and recovery risk.');
  } else {
    credits.push('Domestic route keeps recovery simpler.');
  }
  if (scope.uncertain) {
    score += 5;
    reasons.push('Domestic/international scope is uncertain; choose manually for a sharper rating.');
  }

  if (gapHours !== null && gapHours <= 12) {
    score += 24;
    reasons.push('Very tight arrival window.');
  } else if (gapHours !== null && gapHours <= 24) {
    score += 16;
    reasons.push('Arrival deadline is inside 24 hours.');
  } else if (gapHours !== null && gapHours <= 36) {
    score += 8;
    reasons.push('Arrival buffer is workable but not generous.');
  } else if (gapHours !== null && gapHours >= 48) {
    score -= 8;
    credits.push('Useful 48+ hour travel buffer.');
  }

  if (['event', 'work', 'family'].includes(data.tripType)) {
    score += data.tripType === 'family' ? 16 : 12;
    reasons.push('Trip type is deadline-sensitive.');
  }

  if (data.connections === 'no') {
    score += 12;
    reasons.push('No-connection preference limits backup routes.');
  } else {
    score -= 5;
    credits.push('Connection flexibility creates more usable routes.');
  }

  if (data.nearbyAirports === 'yes') {
    score -= 7;
    credits.push('Nearby-airport flexibility improves route options.');
  } else if (data.nearbyAirports === 'no') {
    score += 7;
    reasons.push('No alternate-airport flexibility increases dependency on Plan A.');
  }

  if (margin !== null) {
    if (margin >= 4) {
      score -= 18;
      credits.push('Load snapshot shows a healthy seat margin.');
    } else if (margin >= 1) {
      score -= 8;
      credits.push('Load snapshot is workable but should be rechecked.');
    } else if (margin >= 0) {
      score += 5;
      reasons.push('Load snapshot has almost no cushion.');
    } else {
      score += 22;
      reasons.push('Load snapshot shows standby pressure.');
    }
  } else {
    reasons.push('Risk is based on route, timing, flexibility, and trip type. Add load tracking for a sharper rating.');
  }

  score = Math.round(clamp(score, 0, 100));
  const level = riskLevel(score);
  return {
    score,
    level,
    reasons,
    credits,
    finalCall: finalCall(level, data),
    confidence: hasLoadData(data) ? 'Medium. Recheck loads close to departure.' : 'Planning estimate. Add load tracking for a sharper rating.',
    scope
  };
}

function routeType(data) {
  const text = `${data.origin} ${data.destination} ${data.notes}`.toLowerCase();
  if (/portugal|lis|faro|fao|algarve/.test(text)) return 'portugal';
  if (/london|lhr|lgw/.test(text)) return 'london';
  if (/nairobi|nbo/.test(text)) return 'nairobi';
  if (/muc|vie|munich|vienna|christmas/.test(text)) return 'europe-return';
  return effectiveScope(data).value === 'international' ? 'international' : 'domestic';
}

function generateRoutes(data) {
  const origin = (data.origin || 'Origin').toUpperCase();
  const dest = data.destination || 'Destination';
  const type = routeType(data);
  const canConnect = data.connections === 'yes';
  const routes = [];

  if (type === 'portugal') {
    routes.push({ kind: 'recommended', title: `${origin} -> major Europe gateway -> LIS/FAO`, body: 'Use the strongest long-haul gateway first. Keep Lisbon and Faro both viable.' });
    routes.push({ kind: 'backup', title: `${origin} -> LHR/AMS/CDG/FRA -> Portugal`, body: 'Switch to the hub with the most same-day Portugal exits.' });
    routes.push({ kind: 'backup', title: `${origin} -> East Coast/SFO -> LIS`, body: 'Use positioning only if the transatlantic load is clearly stronger.' });
    routes.push({ kind: 'alternate', title: 'Alternate airport: Lisbon plus ground transfer', body: 'If Faro tightens, Lisbon with ground transport may save the trip.' });
  } else if (type === 'london') {
    routes.push({ kind: 'recommended', title: `${origin} -> LHR nonstop`, body: 'Start with the strongest nonstop load and monitor alternate London-area arrivals.' });
    routes.push({ kind: 'backup', title: `${origin} -> AMS/CDG/DUB/FRA -> London`, body: 'Use a gateway with multiple onward flights if LHR tightens.' });
    routes.push({ kind: 'backup', title: 'Alternate London arrival', body: 'LGW or nearby airports are useful only if ground timing still works.' });
  } else if (type === 'nairobi') {
    routes.push({ kind: 'recommended', title: `${origin} -> AMS/CDG/FRA/IST/DOH -> NBO`, body: 'Pick the gateway with the best same-day Nairobi recovery path.' });
    routes.push({ kind: 'backup', title: `${origin} -> JFK -> NBO`, body: 'Use JFK only when the long-haul load advantage justifies positioning.' });
    routes.push({ kind: 'backup', title: 'Buy final gateway-to-NBO leg', body: 'If the long-haul clears but NBO fails, paid final segment may protect the trip.' });
  } else if (type === 'europe-return') {
    routes.push({ kind: 'recommended', title: `${origin} -> FRA/LHR/AMS/CDG -> SEA`, body: 'Choose the gateway with the most transatlantic backup paths.' });
    routes.push({ kind: 'backup', title: 'Rail or position to stronger Europe hub', body: 'Move before the last useful transatlantic bank closes.' });
    routes.push({ kind: 'backup', title: 'Confirmed positioning or overnight reset', body: 'Holiday returns reward early rescue decisions.' });
  } else if (type === 'international') {
    routes.push({ kind: 'recommended', title: `${origin} -> strongest long-haul gateway -> ${dest}`, body: 'Choose the gateway with the most same-day onward options.' });
    routes.push({ kind: 'backup', title: 'Alliance-friendly hub backup', body: 'Use the hub where pass access and onward frequency are strongest.' });
    routes.push({ kind: 'backup', title: 'Nearby destination airport', body: 'Arriving close and using ground transport can beat waiting for the perfect flight.' });
  } else {
    routes.push({ kind: 'recommended', title: `${origin} -> ${dest}`, body: 'Use the direct route if it has later same-day backup flights.' });
    routes.push({ kind: 'backup', title: canConnect ? 'Hub reroute' : 'Earlier nonstop backup', body: canConnect ? 'Pick a hub with multiple onward flights.' : 'Move earlier if the last useful nonstop starts filling.' });
    routes.push({ kind: 'backup', title: 'Nearby airport or confirmed rescue', body: 'Define the switch point before the last useful option disappears.' });
  }

  if (data.nearbyAirports === 'yes' && !routes.some((route) => route.kind === 'alternate')) {
    routes.push({ kind: 'alternate', title: 'Alternate airport option', body: 'Use nearby airports when ground transport still protects the arrival time.' });
  }

  return routes.slice(0, 4);
}

function switchTrigger(data, scoreObj, routes) {
  if (scoreObj.score >= 66) return 'Switch or buy confirmed when Plan B no longer protects the must-arrive time.';
  if (data.connections === 'no') return 'Move earlier if the direct route loses later same-day backups.';
  if (effectiveScope(data).value === 'international') return 'Switch before the final international connection becomes the only path left.';
  return `Switch before ${routes[1]?.title || 'Plan B'} stops being usable.`;
}

function routeRating(scoreObj) {
  return `${scoreObj.level.grade} / ${scoreObj.level.label}`;
}

function buildRouteBriefModel(data, scoreObj, routes) {
  return {
    finalCall: scoreObj.finalCall,
    riskGrade: routeRating(scoreObj),
    recommended: routes[0],
    backups: routes.slice(1),
    switchTrigger: switchTrigger(data, scoreObj, routes),
    why: scoreObj.reasons.slice(0, 3),
    credits: scoreObj.credits.slice(0, 3),
    confidence: scoreObj.confidence
  };
}

function renderRouteBrief(data, scoreObj, routes) {
  const model = buildRouteBriefModel(data, scoreObj, routes);
  $('routeBrief').className = 'route-brief';
  $('routeBrief').innerHTML = `
    <section><h3>Final Call</h3><p class="brief-call">${escapeHtml(model.finalCall)}</p></section>
    <section><h3>Risk Grade</h3><p><strong>${escapeHtml(model.riskGrade)}</strong> (${scoreObj.score}/100). ${escapeHtml(scoreObj.level.summary)}</p></section>
    <section><h3>Recommended Route</h3><p>${escapeHtml(model.recommended.title)}</p></section>
    <section><h3>Backup Routes</h3><ul>${model.backups.map((route) => `<li>${escapeHtml(route.title)}</li>`).join('')}</ul></section>
    <section><h3>Switch Trigger</h3><p>${escapeHtml(model.switchTrigger)}</p></section>
    <section><h3>Why This Rating</h3><ul>${model.why.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></section>
    <section><h3>More Details</h3><p>${escapeHtml(model.confidence)}</p></section>
  `;
}

function renderRouteCards(routes) {
  $('routeStrategy').className = 'route-card-grid';
  $('routeStrategy').innerHTML = routes.map((route, index) => {
    const label = index === 0 ? 'Recommended Route' : route.kind === 'alternate' ? 'Alternate Airport' : `Backup Route ${index}`;
    return `<article class="route-card route-card-${escapeHtml(route.kind)}">
      <span class="route-label">${escapeHtml(label)}</span>
      <h3>${escapeHtml(route.title)}</h3>
      <p>${escapeHtml(route.body)}</p>
    </article>`;
  }).join('');
}

function renderMoreDetails(data, scoreObj, routes) {
  const loadText = hasLoadData(data)
    ? `Latest load snapshot: ${data.openSeats || 'unknown'} open seats, ${data.standbyCount || 'unknown'} standbys. ${data.cabinNotes || ''}`
    : 'Risk is based on route, timing, flexibility, and trip type. Add load tracking for a sharper rating.';
  const scopeText = effectiveScope(data);
  $('moreDetails').innerHTML = `
    <div class="details-grid">
      <div><h3>Risk factors</h3><ul>${scoreObj.reasons.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div>
      <div><h3>Risk reducers</h3><ul>${scoreObj.credits.length ? scoreObj.credits.map((item) => `<li>${escapeHtml(item)}</li>`).join('') : '<li>Add flexibility or load tracking to improve confidence.</li>'}</ul></div>
    </div>
    <p><strong>Nearby airports:</strong> ${data.nearbyAirports === 'yes' ? 'Keep alternate airports open if ground transport still works.' : data.nearbyAirports === 'maybe' ? 'Use nearby airports only if timing still works.' : 'No alternate airport flexibility entered.'}</p>
    <p><strong>Connection risk:</strong> ${data.connections === 'yes' ? 'Connections are allowed. Prefer hubs with multiple onward exits.' : 'No connections selected. Direct route timing matters more.'}</p>
    <p><strong>Load tracking:</strong> ${escapeHtml(loadText)}</p>
    <p><strong>Scope:</strong> ${escapeHtml(titleCase(scopeText.value))}${scopeText.uncertain ? ' (uncertain; choose manually for sharper rating)' : ''}.</p>
    <p><strong>Travel documents:</strong> ${scopeText.value === 'international' ? 'Verify passport, visa/transit rules, onward/return proof, and entry requirements before listing.' : 'Verify ID requirements and airline standby procedures.'}</p>
    <p><strong>Route notes:</strong> ${escapeHtml(data.notes || 'None added.')}</p>
  `;
}

function updateTripSummary(data, scoreObj, routes) {
  setText('summaryOrigin', (data.origin || 'Origin').toUpperCase());
  setText('summaryDestination', data.destination || 'Destination');
  setText('summaryTripName', data.tripName || `${data.origin || 'Origin'} to ${data.destination || 'Destination'}`);
  setText('summaryScore', scoreObj ? String(scoreObj.score) : '-');
  setText('summaryFinalCall', scoreObj ? scoreObj.finalCall : 'Add trip basics');
  setText('summaryScope', titleCase(effectiveScope(data).value));
  setText('summaryTripType', titleCase(data.tripType || 'casual'));
  setText('summaryConnections', data.connections === 'no' ? 'No' : 'Yes');
  setText('summaryLoadStatus', hasLoadData(data) ? 'Loads added' : 'No loads yet');
  const badge = $('summaryRiskBadge');
  if (badge && scoreObj) {
    badge.textContent = scoreObj.level.grade;
    badge.className = `risk-badge ${scoreObj.level.className}`;
  } else if (badge) {
    badge.textContent = 'Unscored';
    badge.className = 'risk-badge yellow';
  }
}

function setText(id, value) {
  const node = $(id);
  if (node) node.textContent = value;
}

function renderPlan(data, scoreObj, routes) {
  updateTripSummary(data, scoreObj, routes);
  renderRouteBrief(data, scoreObj, routes);
  renderRouteCards(routes);
  renderMoreDetails(data, scoreObj, routes);
}

function upsertTrip(data, silent = false) {
  const existing = getActiveTrip();
  const score = scoreTrip(data);
  const routes = generateRoutes(data);
  const base = existing || { id: uid(), createdAt: nowIso(), loadChecks: [] };
  const trip = {
    ...base,
    ...data,
    updatedAt: nowIso(),
    score: score.score,
    riskLabel: score.level.grade,
    routeTitles: routes.map((route) => route.title),
    loadChecks: existing?.loadChecks || data.loadChecks || []
  };
  const index = state.trips.findIndex((item) => item.id === trip.id);
  if (index >= 0) state.trips[index] = trip;
  else state.trips.unshift(trip);
  state.activeTripId = trip.id;
  state.currentScore = score;
  state.currentRoutes = routes;
  persistState();
  renderPlan(trip, score, routes);
  renderLoadLog(trip.loadChecks || []);
  $('saveStatus').textContent = silent ? 'Saved' : 'Route saved';
  return trip;
}

function getActiveTrip() {
  return state.trips.find((trip) => trip.id === state.activeTripId) || null;
}

function renderSavedTrips() {
  $('tripCount').textContent = state.trips.length;
  if (!state.trips.length) {
    $('savedTrips').className = 'saved-list empty-state';
    $('savedTrips').textContent = 'No saved routes yet.';
    return;
  }
  $('savedTrips').className = 'saved-list';
  $('savedTrips').innerHTML = state.trips.map((trip) => `
    <button class="saved-item ${trip.id === state.activeTripId ? 'active' : ''}" data-trip-id="${trip.id}">
      <strong>${escapeHtml(trip.tripName || `${trip.origin || 'Origin'} to ${trip.destination || 'Destination'}`)}</strong>
      <small>${escapeHtml(trip.origin || 'Origin')} -> ${escapeHtml(trip.destination || 'Destination')}</small>
      <small>Grade ${trip.riskLabel || '-'} · updated ${new Date(trip.updatedAt || trip.createdAt).toLocaleDateString()}</small>
    </button>`).join('');
  document.querySelectorAll('.saved-item').forEach((button) => {
    button.addEventListener('click', () => openTrip(button.dataset.tripId));
  });
}

function openTrip(id) {
  const trip = state.trips.find((item) => item.id === id);
  if (!trip) return;
  state.activeTripId = id;
  localStorage.setItem(ACTIVE_KEY, id);
  setFormData(trip);
  const score = scoreTrip(trip);
  const routes = generateRoutes(trip);
  state.currentScore = score;
  state.currentRoutes = routes;
  renderPlan(trip, score, routes);
  renderLoadLog(trip.loadChecks || []);
  renderSavedTrips();
  $('saveStatus').textContent = 'Loaded saved route';
}

function newTrip() {
  state.activeTripId = null;
  localStorage.removeItem(ACTIVE_KEY);
  const blank = emptyTrip();
  setFormData(blank);
  state.currentScore = null;
  state.currentRoutes = [];
  $('saveStatus').textContent = 'Unsaved';
  $('routeBrief').className = 'route-brief empty-state';
  $('routeBrief').textContent = 'Enter trip basics and generate a Route Brief.';
  $('routeStrategy').className = 'route-card-grid empty-state';
  $('routeStrategy').textContent = 'Recommended and backup routes will appear here.';
  $('moreDetails').innerHTML = '<p>Generate a Route Brief to see risk factors, alternate airport logic, connection risk, and document reminders.</p>';
  renderLoadLog([]);
  renderSavedTrips();
}

function deleteActiveTrip() {
  if (!state.activeTripId) {
    newTrip();
    return;
  }
  const active = getActiveTrip();
  if (!window.confirm(`Delete "${active?.tripName || 'this route'}"?`)) return;
  state.trips = state.trips.filter((trip) => trip.id !== state.activeTripId);
  state.activeTripId = null;
  persistState();
  newTrip();
}

function addLoadCheck() {
  const data = getFormData();
  const trip = upsertTrip(data, true);
  const check = {
    id: uid(),
    createdAt: nowIso(),
    openSeats: data.openSeats,
    standbyCount: data.standbyCount,
    cabinNotes: data.cabinNotes,
    lastChecked: data.lastChecked || nowIso(),
    loadNotes: data.loadNotes
  };
  trip.loadChecks = [check, ...(trip.loadChecks || [])];
  const index = state.trips.findIndex((item) => item.id === trip.id);
  state.trips[index] = trip;
  persistState();
  renderLoadLog(trip.loadChecks);
  $('saveStatus').textContent = 'Load check saved';
}

function renderLoadLog(loadChecks) {
  if (!loadChecks || !loadChecks.length) {
    $('loadLog').className = 'timeline empty-state';
    $('loadLog').textContent = 'No load checks logged yet.';
    return;
  }
  $('loadLog').className = 'timeline';
  $('loadLog').innerHTML = loadChecks.map((check) => `
    <div class="timeline-item">
      <p><strong>${formatDateTime(check.lastChecked || check.createdAt)}</strong><br>
      Open seats: ${escapeHtml(check.openSeats || '-')} · Standbys: ${escapeHtml(check.standbyCount || '-')}<br>
      ${escapeHtml(check.cabinNotes || 'No cabin notes')} ${check.loadNotes ? `· ${escapeHtml(check.loadNotes)}` : ''}</p>
      <button class="danger" data-load-id="${check.id}">Remove</button>
    </div>`).join('');
  document.querySelectorAll('[data-load-id]').forEach((button) => {
    button.addEventListener('click', () => removeLoadCheck(button.dataset.loadId));
  });
}

function removeLoadCheck(checkId) {
  const trip = getActiveTrip();
  if (!trip) return;
  trip.loadChecks = (trip.loadChecks || []).filter((check) => check.id !== checkId);
  trip.updatedAt = nowIso();
  persistState();
  renderLoadLog(trip.loadChecks);
}

function buildRouteBriefText() {
  const data = getFormData();
  const scoreObj = state.currentScore || scoreTrip(data);
  const routes = state.currentRoutes.length ? state.currentRoutes : generateRoutes(data);
  const model = buildRouteBriefModel(data, scoreObj, routes);
  return [
    'STANDBYPILOT ROUTE BRIEF',
    '',
    `Route: ${data.origin || 'Origin'} -> ${data.destination || 'Destination'}`,
    `Final Call: ${model.finalCall}`,
    `Risk Grade: ${model.riskGrade} (${scoreObj.score}/100)`,
    `Recommended Route: ${model.recommended.title}`,
    '',
    'Backup Routes:',
    ...model.backups.map((route) => `- ${route.title}`),
    '',
    `Switch Trigger: ${model.switchTrigger}`,
    '',
    'Why this rating:',
    ...model.why.map((item) => `- ${item}`),
    '',
    model.confidence
  ].join('\n');
}

function exportTrips() {
  const blob = new Blob([JSON.stringify({ version: 2, exportedAt: nowIso(), trips: state.trips }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `standbypilot-routes-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

async function importTrips(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const incomingTrips = Array.isArray(parsed) ? parsed : parsed.trips;
    if (!Array.isArray(incomingTrips)) throw new Error('JSON does not include a trips array.');
    const existingIds = new Set(state.trips.map((trip) => trip.id));
    const normalized = incomingTrips.map((trip) => ({
      ...emptyTrip(),
      ...trip,
      id: existingIds.has(trip.id) ? uid() : (trip.id || uid()),
      createdAt: trip.createdAt || nowIso(),
      updatedAt: nowIso(),
      loadChecks: trip.loadChecks || []
    }));
    state.trips = [...normalized, ...state.trips];
    state.activeTripId = normalized[0]?.id || state.activeTripId;
    persistState();
    if (state.activeTripId) openTrip(state.activeTripId);
  } catch (err) {
    alert(`Import failed: ${err.message}`);
  } finally {
    event.target.value = '';
  }
}

function loadFiveTestTrips() {
  if (state.trips.length && !window.confirm('Load the 5 simplified test routes? This adds them without deleting saved routes.')) return;
  const created = testTrips.map((sample) => {
    const score = scoreTrip(sample);
    const routes = generateRoutes(sample);
    return {
      ...emptyTrip(),
      ...sample,
      id: uid(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      loadChecks: [],
      score: score.score,
      riskLabel: score.level.grade,
      routeTitles: routes.map((route) => route.title)
    };
  });
  state.trips = [...created, ...state.trips];
  state.activeTripId = created[0].id;
  persistState();
  openTrip(state.activeTripId);
  $('saveStatus').textContent = '5 test routes loaded';
}

function initEvents() {
  $('tripForm').addEventListener('submit', (event) => {
    event.preventDefault();
    upsertTrip(getFormData());
    document.getElementById('route-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  $('saveTrip').addEventListener('click', () => upsertTrip(getFormData()));
  $('newTrip').addEventListener('click', newTrip);
  $('deleteTrip').addEventListener('click', deleteActiveTrip);
  $('loadPortugal').addEventListener('click', () => {
    state.activeTripId = null;
    setFormData(portugalSample);
    upsertTrip(getFormData());
  });
  $('loadTestSuite').addEventListener('click', loadFiveTestTrips);
  $('addLoadCheck').addEventListener('click', addLoadCheck);
  $('copyRouteBrief').addEventListener('click', async () => {
    const text = buildRouteBriefText();
    try {
      await navigator.clipboard.writeText(text);
      $('saveStatus').textContent = 'Route Brief copied';
    } catch {
      alert(text);
    }
  });
  $('printRouteBrief').addEventListener('click', () => window.print());
  $('exportTrips').addEventListener('click', exportTrips);
  $('importTrips').addEventListener('change', importTrips);

  fields.forEach((field) => {
    $(field)?.addEventListener('input', () => {
      $('saveStatus').textContent = state.activeTripId ? 'Unsaved changes' : 'Unsaved';
      updateScopeHint();
      updateTripSummary(getFormData(), state.currentScore, state.currentRoutes);
    });
  });
}

function init() {
  loadState();
  initEvents();
  renderSavedTrips();
  if (state.activeTripId && state.trips.some((trip) => trip.id === state.activeTripId)) {
    openTrip(state.activeTripId);
  } else {
    newTrip();
  }
}

init();
