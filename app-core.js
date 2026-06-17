const $ = (id) => document.getElementById(id);

const STORAGE_KEY = 'standbypilot_route_trips_v1';
const ACTIVE_KEY = 'standbypilot_route_active_trip_id';
const NO_LOAD_CONFIDENCE = 'Risk is based on route, timing, flexibility, and trip type. Add load tracking for a sharper rating.';
const LOAD_CONFIDENCE = 'Load notes included. Recheck close to departure before relying on this route.';

const airportMetadataFields = [
  'originAirportCode', 'originAirportName', 'originAirportCity', 'originAirportCountry', 'originAirportRegion',
  'destinationAirportCode', 'destinationAirportName', 'destinationAirportCity', 'destinationAirportCountry', 'destinationAirportRegion'
];

const fields = [
  'tripName', 'origin', 'destination', 'earliestDeparture', 'mustArriveBy',
  'tripDirection', 'tripType', 'connections', 'scope', 'nearbyAirports',
  'returnDate', 'priority', 'notes', 'openSeats', 'standbyCount',
  'cabinNotes', 'lastChecked', 'loadNotes', ...airportMetadataFields
];

const AIRPORTS = [
  { code: 'SEA', name: 'Seattle-Tacoma', city: 'Seattle', country: 'United States', region: 'Pacific Northwest' },
  { code: 'PDX', name: 'Portland', city: 'Portland', country: 'United States', region: 'Pacific Northwest' },
  { code: 'YVR', name: 'Vancouver', city: 'Vancouver', country: 'Canada', region: 'British Columbia' },
  { code: 'SFO', name: 'San Francisco', city: 'San Francisco', country: 'United States', region: 'California' },
  { code: 'LAX', name: 'Los Angeles', city: 'Los Angeles', country: 'United States', region: 'California' },
  { code: 'JFK', name: 'New York JFK', city: 'New York', country: 'United States', region: 'New York City' },
  { code: 'EWR', name: 'Newark', city: 'Newark', country: 'United States', region: 'New York City' },
  { code: 'LGA', name: 'New York LaGuardia', city: 'New York', country: 'United States', region: 'New York City' },
  { code: 'BOS', name: 'Boston', city: 'Boston', country: 'United States', region: 'Northeast' },
  { code: 'MIA', name: 'Miami', city: 'Miami', country: 'United States', region: 'South Florida' },
  { code: 'FLL', name: 'Fort Lauderdale', city: 'Fort Lauderdale', country: 'United States', region: 'South Florida' },
  { code: 'LHR', name: 'London Heathrow', city: 'London', country: 'United Kingdom', region: 'London' },
  { code: 'LGW', name: 'London Gatwick', city: 'London', country: 'United Kingdom', region: 'London' },
  { code: 'AMS', name: 'Amsterdam', city: 'Amsterdam', country: 'Netherlands', region: 'Europe' },
  { code: 'CDG', name: 'Paris Charles de Gaulle', city: 'Paris', country: 'France', region: 'Europe' },
  { code: 'FRA', name: 'Frankfurt', city: 'Frankfurt', country: 'Germany', region: 'Europe' },
  { code: 'MUC', name: 'Munich', city: 'Munich', country: 'Germany', region: 'Europe' },
  { code: 'DUB', name: 'Dublin', city: 'Dublin', country: 'Ireland', region: 'Europe' },
  { code: 'LIS', name: 'Lisbon', city: 'Lisbon', country: 'Portugal', region: 'Portugal' },
  { code: 'FAO', name: 'Faro', city: 'Faro', country: 'Portugal', region: 'Algarve' },
  { code: 'OPO', name: 'Porto', city: 'Porto', country: 'Portugal', region: 'Portugal' },
  { code: 'NBO', name: 'Nairobi', city: 'Nairobi', country: 'Kenya', region: 'East Africa' }
];

const AIRPORTS_BY_CODE = Object.fromEntries(AIRPORTS.map((airport) => [airport.code, airport]));

const NEARBY_GROUPS = [
  { label: 'SEA nearby', resultLabel: 'Nearby alternatives', matchCodes: ['SEA'], matchText: ['seattle', 'sea'], alternatives: ['PDX', 'YVR'] },
  { label: 'NYC nearby', resultLabel: 'Nearby alternatives', matchCodes: ['JFK', 'EWR', 'LGA'], matchText: ['new york', 'nyc', 'jfk', 'ewr', 'lga'], alternatives: ['JFK', 'EWR', 'LGA'] },
  { label: 'Miami nearby', resultLabel: 'Nearby alternatives', matchCodes: ['MIA', 'FLL'], matchText: ['miami', 'fort lauderdale'], alternatives: ['MIA', 'FLL'] },
  { label: 'Portugal nearby', resultLabel: 'Portugal alternatives', matchCodes: ['LIS', 'FAO', 'OPO'], matchText: ['portugal', 'lisbon', 'faro', 'porto', 'algarve'], alternatives: ['LIS', 'FAO', 'OPO'] },
  { label: 'London nearby', resultLabel: 'London alternatives', matchCodes: ['LHR', 'LGW'], matchText: ['london', 'heathrow', 'gatwick'], alternatives: ['LHR', 'LGW'] },
  { label: 'California nearby', resultLabel: 'California alternatives', matchCodes: ['SFO', 'LAX'], matchText: ['california', 'san francisco', 'los angeles'], alternatives: ['SFO', 'LAX'] }
];

const portugalSample = {
  tripName: 'Portugal route check',
  origin: 'SEA',
  destination: 'LIS / FAO / Portugal',
  earliestDeparture: '2026-06-30T18:00',
  mustArriveBy: '2026-07-02T18:00',
  tripDirection: 'roundtrip',
  tripType: 'event',
  connections: 'yes',
  scope: 'auto',
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
    tripName: 'NYC route check',
    origin: 'SEA',
    destination: 'JFK / New York',
    earliestDeparture: '2026-06-27T09:00',
    mustArriveBy: '2026-06-28T01:00',
    tripDirection: 'one-way',
    tripType: 'casual',
    connections: 'yes',
    scope: 'auto',
    nearbyAirports: 'yes',
    returnDate: '',
    priority: 'fastest',
    notes: 'NYC airport flexibility is acceptable if ground timing works.',
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
    scope: 'auto',
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
    scope: 'auto',
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
    scope: 'auto',
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
    originAirportCode: '', originAirportName: '', originAirportCity: '', originAirportCountry: '', originAirportRegion: '',
    destinationAirportCode: '', destinationAirportName: '', destinationAirportCity: '', destinationAirportCountry: '', destinationAirportRegion: '',
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

function normalizeText(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function firstAirportCode(value) {
  const match = String(value || '').toUpperCase().match(/\b[A-Z]{3}\b/);
  return match ? match[0] : '';
}

function airportSearchText(airport) {
  return normalizeText(`${airport.code} ${airport.name} ${airport.city} ${airport.country} ${airport.region}`);
}

function airportMatchesQuery(airport, query) {
  const normalized = normalizeText(query);
  if (!normalized) return false;
  const tokens = normalized.split(' ').filter(Boolean);
  const search = airportSearchText(airport);
  return tokens.every((token) => search.includes(token));
}

function airportScore(airport, query) {
  const normalized = normalizeText(query);
  if (!normalized) return 0;
  if (airport.code.toLowerCase() === normalized) return 100;
  if (normalizeText(airport.city) === normalized) return 90;
  if (normalizeText(airport.name) === normalized) return 80;
  if (normalizeText(airport.country) === normalized) return 70;
  if (airportSearchText(airport).startsWith(normalized)) return 60;
  return 40;
}

function airportSuggestions(query, limit = 6) {
  const normalized = normalizeText(query);
  if (!normalized) return [];
  return AIRPORTS
    .filter((airport) => airportMatchesQuery(airport, normalized))
    .sort((a, b) => airportScore(b, normalized) - airportScore(a, normalized) || a.code.localeCompare(b.code))
    .slice(0, limit);
}

function findAirportFromInput(value) {
  const code = firstAirportCode(value);
  if (code && AIRPORTS_BY_CODE[code]) return AIRPORTS_BY_CODE[code];
  return airportSuggestions(value, 1)[0] || null;
}

function airportDisplayValue(airport) {
  return `${airport.code} - ${airport.city}`;
}

function metadataKeys(side) {
  const prefix = side === 'origin' ? 'originAirport' : 'destinationAirport';
  return {
    code: `${prefix}Code`,
    name: `${prefix}Name`,
    city: `${prefix}City`,
    country: `${prefix}Country`,
    region: `${prefix}Region`
  };
}

function writeAirportMetadata(side, airport, updateInput = true) {
  const keys = metadataKeys(side);
  if (updateInput && $(side)) $(side).value = airport ? airportDisplayValue(airport) : '';
  if ($(keys.code)) $(keys.code).value = airport?.code || '';
  if ($(keys.name)) $(keys.name).value = airport?.name || '';
  if ($(keys.city)) $(keys.city).value = airport?.city || '';
  if ($(keys.country)) $(keys.country).value = airport?.country || '';
  if ($(keys.region)) $(keys.region).value = airport?.region || '';
  updateAirportMeta(side, airport);
}

function clearAirportMetadata(side) {
  writeAirportMetadata(side, null, false);
}

function airportFromData(data, side) {
  const keys = metadataKeys(side);
  const code = String(data[keys.code] || '').toUpperCase();
  if (code && AIRPORTS_BY_CODE[code]) return AIRPORTS_BY_CODE[code];
  return findAirportFromInput(data[side]);
}

function enrichAirportData(data, side) {
  const airport = airportFromData(data, side);
  const keys = metadataKeys(side);
  if (airport) {
    data[keys.code] = airport.code;
    data[keys.name] = airport.name;
    data[keys.city] = airport.city;
    data[keys.country] = airport.country;
    data[keys.region] = airport.region;
  }
  return data;
}

function updateStoredAirportFromInput(side) {
  const input = $(side);
  if (!input) return;
  const airport = findAirportFromInput(input.value);
  if (airport && normalizeText(input.value).length >= 3) writeAirportMetadata(side, airport, false);
  else clearAirportMetadata(side);
}

function updateAirportMeta(side, airport) {
  const meta = $(`${side}AirportMeta`);
  if (!meta) return;
  if (airport) {
    meta.textContent = `${airport.code} selected: ${airport.city}, ${airport.country}`;
  } else {
    meta.textContent = side === 'origin'
      ? 'Type an airport code, city, airport name, or country.'
      : 'Suggestions are local and work without live flight data.';
  }
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
  enrichAirportData(data, 'origin');
  enrichAirportData(data, 'destination');
  return data;
}

function setFormData(data = {}) {
  const normalized = { ...emptyTrip(), ...data };
  for (const id of fields) {
    if ($(id)) $(id).value = normalized[id] ?? '';
  }
  updateStoredAirportFromInput('origin');
  updateStoredAirportFromInput('destination');
  updateScopeHint();
  updateTripSummary(getFormData(), null, null);
}

function detectScope(data) {
  const originAirport = airportFromData(data, 'origin');
  const destinationAirport = airportFromData(data, 'destination');
  if (!originAirport || !destinationAirport) {
    return { value: 'unknown', inferred: true, uncertain: true, originAirport, destinationAirport };
  }
  const value = originAirport.country === destinationAirport.country ? 'domestic' : 'international';
  return { value, inferred: true, uncertain: false, originAirport, destinationAirport };
}

function effectiveScope(data) {
  if (data.scope === 'domestic' || data.scope === 'international') {
    return { ...detectScope(data), value: data.scope, inferred: false, uncertain: false };
  }
  return detectScope(data);
}

function updateScopeHint() {
  const hint = $('scopeHint');
  if (!hint) return;
  const data = getFormData();
  const scope = effectiveScope(data);
  if (data.scope !== 'auto') {
    hint.textContent = `Manual scope selected: ${titleCase(data.scope)}.`;
  } else if (scope.value === 'unknown') {
    hint.textContent = 'Scope could not be detected. Choose domestic or international for better accuracy.';
  } else {
    const originCountry = scope.originAirport?.country || 'origin';
    const destinationCountry = scope.destinationAirport?.country || 'destination';
    hint.textContent = `Auto-detected ${titleCase(scope.value)}: ${originCountry} -> ${destinationCountry}.`;
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
  if (score <= 25) return { grade: 'A', label: 'Low', className: 'green', colorName: 'Green', summary: 'Strong non-rev setup if loads do not deteriorate.' };
  if (score <= 45) return { grade: 'B', label: 'Moderate', className: 'yellow', colorName: 'Yellow', summary: 'Playable route. Keep the backup active.' };
  if (score <= 65) return { grade: 'C', label: 'Elevated', className: 'orange', colorName: 'Orange', summary: 'Risky enough that Plan B matters.' };
  return { grade: 'D', label: 'High', className: 'red', colorName: 'Red', summary: 'Do not let this depend on one standby path.' };
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
  const loadEntered = hasLoadData(data);

  if (scope.value === 'international') {
    score += 15;
    reasons.push('International route adds recovery risk.');
  } else if (scope.value === 'domestic') {
    credits.push('Domestic route keeps recovery simpler.');
  } else {
    score += 5;
    reasons.push('Unknown domestic/international scope.');
  }

  if (gapHours !== null && gapHours <= 12) {
    score += 24;
    reasons.push('Very tight must-arrive window.');
  } else if (gapHours !== null && gapHours <= 24) {
    score += 16;
    reasons.push('Must-arrive window is inside 24 hours.');
  } else if (gapHours !== null && gapHours <= 36) {
    score += 8;
    reasons.push('Arrival buffer is workable but thin.');
  } else if (gapHours !== null && gapHours >= 48) {
    score -= 8;
    credits.push('Flexible 48+ hour arrival window.');
  }

  if (['event', 'work', 'family'].includes(data.tripType)) {
    score += data.tripType === 'family' ? 16 : 12;
    reasons.push('Deadline-sensitive trip type.');
  }

  if (data.connections === 'no') {
    score += 12;
    reasons.push('No connections allowed.');
  } else {
    score -= 5;
    credits.push('Connections allowed.');
  }

  if (data.nearbyAirports === 'yes') {
    score -= 7;
    credits.push('Nearby airports available.');
  } else if (data.nearbyAirports === 'no') {
    score += 7;
    reasons.push('Weak alternate-airport flexibility.');
  }

  if (data.tripDirection === 'one-way') {
    credits.push('One-way trip keeps the plan simpler.');
  }

  if (margin !== null) {
    if (margin >= 4) {
      score -= 18;
      credits.push('Load snapshot shows a healthy seat margin.');
    } else if (margin >= 1) {
      score -= 8;
      credits.push('Load snapshot is workable.');
    } else if (margin >= 0) {
      score += 5;
      reasons.push('Load snapshot has almost no cushion.');
    } else {
      score += 22;
      reasons.push('Load snapshot shows standby pressure.');
    }
  } else if (loadEntered) {
    credits.push('Load tracking added.');
  } else {
    reasons.push('No load tracking entered.');
  }

  score = Math.round(clamp(score, 0, 100));
  const level = riskLevel(score);
  return {
    score,
    level,
    reasons,
    credits,
    finalCall: finalCall(level, data),
    confidence: loadEntered ? LOAD_CONFIDENCE : NO_LOAD_CONFIDENCE,
    scope
  };
}

function routeType(data) {
  const text = `${data.origin} ${data.destination} ${data.notes}`.toLowerCase();
  if (/portugal|lis|faro|fao|opo|algarve/.test(text)) return 'portugal';
  if (/london|lhr|lgw/.test(text)) return 'london';
  if (/nairobi|nbo/.test(text)) return 'nairobi';
  if (/muc|vie|munich|vienna|christmas/.test(text)) return 'europe-return';
  return effectiveScope(data).value === 'international' ? 'international' : 'domestic';
}

function nearbyAlternatives(data) {
  const text = normalizeText(`${data.origin} ${data.destination} ${data.notes}`);
  const originAirport = airportFromData(data, 'origin');
  const destinationAirport = airportFromData(data, 'destination');
  const codes = [originAirport?.code, destinationAirport?.code].filter(Boolean);
  return NEARBY_GROUPS.find((group) => {
    const codeMatch = codes.some((code) => group.matchCodes.includes(code));
    const textMatch = group.matchText.some((item) => text.includes(normalizeText(item)));
    return codeMatch || textMatch;
  }) || null;
}

function nearbyText(group) {
  if (!group) return '';
  return `${group.resultLabel}: ${group.alternatives.join(', ')}`;
}

function generateRoutes(data) {
  const origin = (data.origin || 'Origin').toUpperCase();
  const dest = data.destination || 'Destination';
  const type = routeType(data);
  const canConnect = data.connections === 'yes';
  const routes = [];

  if (type === 'portugal') {
    routes.push({ kind: 'recommended', title: `${origin} -> major Europe gateway -> LIS/FAO`, body: 'Strongest first play keeps both Portugal airports alive.' });
    routes.push({ kind: 'backup', title: `${origin} -> LHR/AMS/CDG/FRA -> Portugal`, body: 'Safer if one hub has multiple same-day Portugal exits.' });
    routes.push({ kind: 'backup', title: `${origin} -> East Coast/SFO -> LIS`, body: 'Useful only when the transatlantic load is clearly stronger.' });
  } else if (type === 'london') {
    routes.push({ kind: 'recommended', title: `${origin} -> LHR nonstop`, body: 'Best first look if the nonstop has a later recovery path.' });
    routes.push({ kind: 'backup', title: `${origin} -> AMS/CDG/DUB/FRA -> London`, body: 'Safer when LHR tightens and another gateway has frequency.' });
    routes.push({ kind: 'backup', title: 'Alternate London arrival', body: 'Good only if ground timing still protects the arrival deadline.' });
  } else if (type === 'nairobi') {
    routes.push({ kind: 'recommended', title: `${origin} -> AMS/CDG/FRA/IST/DOH -> NBO`, body: 'Best overall because the gateway choice drives recovery.' });
    routes.push({ kind: 'backup', title: `${origin} -> JFK -> NBO`, body: 'Worth it only when JFK has a clear long-haul load advantage.' });
    routes.push({ kind: 'backup', title: 'Buy final gateway-to-NBO leg', body: 'Protects the trip if the final long-haul segment becomes the blocker.' });
  } else if (type === 'europe-return') {
    routes.push({ kind: 'recommended', title: `${origin} -> FRA/LHR/AMS/CDG -> SEA`, body: 'Best overall because it preserves multiple transatlantic exits.' });
    routes.push({ kind: 'backup', title: 'Rail or position to stronger Europe hub', body: 'Safer if the first departure bank starts closing.' });
    routes.push({ kind: 'backup', title: 'Confirmed positioning or overnight reset', body: 'Last-resort reset when holiday loads remove same-day options.' });
  } else if (type === 'international') {
    routes.push({ kind: 'recommended', title: `${origin} -> strongest long-haul gateway -> ${dest}`, body: 'Best overall because gateway frequency matters most.' });
    routes.push({ kind: 'backup', title: 'Alliance-friendly hub backup', body: 'Safer when pass access and onward frequency are better.' });
    routes.push({ kind: 'backup', title: 'Nearby destination airport', body: 'Good alternate if ground transport still protects arrival.' });
  } else {
    routes.push({ kind: 'recommended', title: `${origin} -> ${dest}`, body: 'Best first play if it has later same-day backup flights.' });
    routes.push({ kind: 'backup', title: canConnect ? 'Hub reroute' : 'Earlier nonstop backup', body: canConnect ? 'Safer if the direct route starts filling.' : 'Faster but riskier when later nonstops disappear.' });
    routes.push({ kind: 'backup', title: 'Nearby airport or confirmed rescue', body: 'Use when the direct path no longer protects the deadline.' });
  }

  const nearby = nearbyAlternatives(data);
  if (nearby && data.nearbyAirports !== 'no') {
    routes.push({ kind: 'alternate', title: nearbyText(nearby), body: 'Good alternate airport play if ground transport still works.' });
  } else if (data.nearbyAirports === 'yes') {
    routes.push({ kind: 'alternate', title: 'Alternate airport option', body: 'Good alternate airport play when timing still works.' });
  }

  return routes.slice(0, 4);
}

function switchTrigger(data, scoreObj, routes) {
  if (scoreObj.score >= 66) return 'Switch or buy confirmed when Plan B no longer protects the must-arrive time.';
  if (data.connections === 'no') return 'Move earlier if the direct route loses later same-day backups.';
  if (effectiveScope(data).value === 'international') return 'Switch before the final international connection becomes the only path left.';
  return `Switch before ${routes[1]?.title || 'Plan B'} stops being usable.`;
}

function routeCardRating(route, index, scoreObj, data, routes) {
  if (index === 0) {
    return {
      label: 'Best Overall',
      reason: route.body,
      trigger: switchTrigger(data, scoreObj, routes)
    };
  }
  if (route.kind === 'alternate') {
    return {
      label: 'Good Alternate Airport Play',
      reason: route.body,
      trigger: 'Use if the main airport path no longer protects arrival time.'
    };
  }
  if (/buy|confirmed|overnight|rescue/i.test(route.title) || index >= 3) {
    return {
      label: 'Last Resort',
      reason: route.body,
      trigger: 'Use when standby options stop protecting the deadline.'
    };
  }
  if (/east coast|sfo|jfk|nonstop|position/i.test(route.title) || data.priority === 'fastest') {
    return {
      label: 'Faster but Riskier',
      reason: route.body,
      trigger: 'Use only if the load advantage is clear before leaving.'
    };
  }
  return {
    label: 'Safer Backup',
    reason: route.body,
    trigger: 'Switch here before Plan A loses same-day recovery.'
  };
}

function routeRating(scoreObj) {
  return `${scoreObj.level.grade} / ${scoreObj.level.label}`;
}

function topItems(items, fallback) {
  const visible = items.filter(Boolean).slice(0, 3);
  return visible.length ? visible : [fallback];
}

function buildRouteBriefModel(data, scoreObj, routes) {
  return {
    finalCall: scoreObj.finalCall,
    riskGrade: routeRating(scoreObj),
    recommended: routes[0],
    backups: routes.slice(1),
    switchTrigger: switchTrigger(data, scoreObj, routes),
    why: topItems(scoreObj.reasons, 'No major risk driver entered yet.'),
    credits: topItems(scoreObj.credits, 'Add flexibility or load tracking to improve confidence.'),
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

function renderRiskExplanation(data, scoreObj) {
  const drivers = topItems(scoreObj.reasons, 'No major risk driver entered yet.');
  const reducers = topItems(scoreObj.credits, 'Add flexibility or load tracking to improve confidence.');
  $('riskExplanation').className = 'risk-explanation';
  $('riskExplanation').innerHTML = `
    <div class="risk-explanation-header">
      <div>
        <p class="eyebrow">Why this rating?</p>
        <h3>${escapeHtml(scoreObj.level.colorName)} / ${escapeHtml(scoreObj.level.label)}</h3>
      </div>
      <div class="risk-score-line"><span class="risk-badge ${escapeHtml(scoreObj.level.className)}">${escapeHtml(scoreObj.level.grade)}</span><strong>${scoreObj.score}/100</strong></div>
    </div>
    <div class="risk-factor-grid">
      <div class="risk-factor-card"><h4>Top risk drivers</h4><ul>${drivers.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div>
      <div class="risk-factor-card"><h4>Top risk reducers</h4><ul>${reducers.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div>
    </div>
    <p class="confidence-note">${escapeHtml(scoreObj.confidence)}</p>
  `;
}

function renderRouteCards(data, scoreObj, routes) {
  $('routeStrategy').className = 'route-card-grid';
  $('routeStrategy').innerHTML = routes.map((route, index) => {
    const label = index === 0 ? 'Recommended Route' : route.kind === 'alternate' ? 'Alternate Airport' : `Backup Route ${index}`;
    const rating = routeCardRating(route, index, scoreObj, data, routes);
    return `<article class="route-card route-card-${escapeHtml(route.kind)}">
      <span class="route-label">${escapeHtml(label)}</span>
      <span class="route-rating">${escapeHtml(rating.label)}</span>
      <h3>${escapeHtml(route.title)}</h3>
      <p><strong>Reason:</strong> ${escapeHtml(rating.reason)}</p>
      <p><strong>Switch:</strong> ${escapeHtml(rating.trigger)}</p>
    </article>`;
  }).join('');
}

function renderMoreDetails(data, scoreObj, routes) {
  const loadText = hasLoadData(data)
    ? 'Load notes included. Recheck close to departure before relying on this route.'
    : NO_LOAD_CONFIDENCE;
  const scopeText = effectiveScope(data);
  const nearby = nearbyAlternatives(data);
  $('moreDetails').innerHTML = `
    <div class="details-grid">
      <div><h3>Risk factors</h3><ul>${scoreObj.reasons.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div>
      <div><h3>Risk reducers</h3><ul>${scoreObj.credits.length ? scoreObj.credits.map((item) => `<li>${escapeHtml(item)}</li>`).join('') : '<li>Add flexibility or load tracking to improve confidence.</li>'}</ul></div>
    </div>
    <p><strong>Nearby airports:</strong> ${nearby ? escapeHtml(nearbyText(nearby)) : data.nearbyAirports === 'yes' ? 'Keep alternate airports open if ground transport still works.' : data.nearbyAirports === 'maybe' ? 'Use nearby airports only if timing still works.' : 'No alternate airport flexibility entered.'}</p>
    <p><strong>Connection risk:</strong> ${data.connections === 'yes' ? 'Connections are allowed. Prefer hubs with multiple onward exits.' : 'No connections selected. Direct route timing matters more.'}</p>
    <p><strong>Load tracking:</strong> ${escapeHtml(loadText)}</p>
    <p><strong>Scope:</strong> ${escapeHtml(titleCase(scopeText.value))}${scopeText.value === 'unknown' ? ' (choose manually for better accuracy)' : ''}.</p>
    <p><strong>Travel documents:</strong> ${scopeText.value === 'international' ? 'Verify passport, visa/transit rules, onward/return proof, and entry requirements before listing.' : scopeText.value === 'domestic' ? 'Verify ID requirements and airline standby procedures.' : 'Choose domestic or international to show the right document reminder.'}</p>
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
  renderRiskExplanation(data, scoreObj);
  renderRouteCards(data, scoreObj, routes);
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
  const data = getFormData();
  const score = scoreTrip(data);
  const routes = generateRoutes(data);
  state.currentScore = score;
  state.currentRoutes = routes;
  renderPlan(data, score, routes);
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
  $('riskExplanation').className = 'risk-explanation empty-state';
  $('riskExplanation').textContent = 'Generate a Route Brief to see why this route is rated.';
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
  const blob = new Blob([JSON.stringify({ version: 3, exportedAt: nowIso(), trips: state.trips }, null, 2)], { type: 'application/json' });
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
    const data = { ...emptyTrip(), ...sample };
    const score = scoreTrip(data);
    const routes = generateRoutes(data);
    return {
      ...data,
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

function hideAirportSuggestions(side) {
  const suggestions = $(`${side}Suggestions`);
  if (suggestions) suggestions.classList.remove('open');
}

function renderAirportSuggestions(side) {
  const input = $(side);
  const suggestions = $(`${side}Suggestions`);
  if (!input || !suggestions) return;
  const matches = airportSuggestions(input.value);
  if (!matches.length) {
    suggestions.classList.remove('open');
    suggestions.innerHTML = '';
    return;
  }
  suggestions.innerHTML = matches.map((airport) => `
    <button type="button" class="airport-suggestion" role="option" data-airport-code="${airport.code}">
      <span class="airport-code">${airport.code}</span>
      <span class="airport-copy"><strong>${escapeHtml(airport.city)} - ${escapeHtml(airport.name)}</strong><span>${escapeHtml(airport.country)}${airport.region ? ` · ${escapeHtml(airport.region)}` : ''}</span></span>
    </button>`).join('');
  suggestions.classList.add('open');
  suggestions.querySelectorAll('[data-airport-code]').forEach((button) => {
    button.addEventListener('mousedown', (event) => event.preventDefault());
    button.addEventListener('click', () => {
      const airport = AIRPORTS_BY_CODE[button.dataset.airportCode];
      writeAirportMetadata(side, airport, true);
      hideAirportSuggestions(side);
      updateScopeHint();
      updateTripSummary(getFormData(), state.currentScore, state.currentRoutes);
      $('saveStatus').textContent = state.activeTripId ? 'Unsaved changes' : 'Unsaved';
    });
  });
}

function setupAirportAutocomplete(side) {
  const input = $(side);
  if (!input) return;
  input.addEventListener('input', () => {
    updateStoredAirportFromInput(side);
    renderAirportSuggestions(side);
  });
  input.addEventListener('focus', () => renderAirportSuggestions(side));
  input.addEventListener('blur', () => window.setTimeout(() => hideAirportSuggestions(side), 120));
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') hideAirportSuggestions(side);
  });
}

function initEvents() {
  setupAirportAutocomplete('origin');
  setupAirportAutocomplete('destination');

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
