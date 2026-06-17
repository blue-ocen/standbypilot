const $ = (id) => document.getElementById(id);

const STORAGE_KEY = 'standbypilot_v12_trips';
const ACTIVE_KEY = 'standbypilot_v12_active_trip_id';

const fields = [
  'tripName', 'travelerName', 'origin', 'destination', 'finalDestination',
  'earliestDeparture', 'mustArriveBy', 'returnDate', 'travelers', 'bags',
  'tripType', 'scope', 'connections', 'nearbyAirports', 'splitGroup',
  'backupBudget', 'passSystem', 'passPriority', 'priority', 'openSeats',
  'standbyCount', 'cabinNotes', 'loadNotes', 'notes'
];

const portugalSample = {
  tripName: 'Portugal / Algarve Summer Trip',
  travelerName: 'Robert',
  origin: 'SEA',
  destination: 'LIS / FAO / Portugal',
  finalDestination: 'Portimão / Praia da Rocha',
  earliestDeparture: '2026-06-30T18:00',
  mustArriveBy: '2026-07-02T18:00',
  returnDate: '2026-07-07',
  travelers: '4',
  bags: 'carry-on',
  tripType: 'event',
  scope: 'international',
  connections: 'yes',
  nearbyAirports: 'yes',
  splitGroup: 'maybe',
  backupBudget: '1000',
  passSystem: 'Airline employee / non-rev pass access',
  passPriority: 'Enter priority when known',
  priority: 'highest-arrival-chance',
  openSeats: '',
  standbyCount: '',
  cabinNotes: '',
  loadNotes: 'Use StaffTraveler / employee portal manually. Do not depend on one SEA-Europe option.',
  notes: 'Final destination is Algarve. Treat Faro as ideal, Lisbon as acceptable with ground transfer. Leave early and stay carry-on only.'
};

const testTrips = [
  portugalSample,
  {
    tripName: 'London Group Trip / Southwark Park',
    travelerName: 'Robert',
    origin: 'SEA',
    destination: 'LHR / London',
    finalDestination: 'Southwark Park / Central London',
    earliestDeparture: '2026-07-20T12:00',
    mustArriveBy: '2026-07-22T15:00',
    returnDate: '2026-07-26',
    travelers: '4',
    bags: 'carry-on',
    tripType: 'event',
    scope: 'international',
    connections: 'yes',
    nearbyAirports: 'yes',
    splitGroup: 'maybe',
    backupBudget: '800',
    passSystem: 'Airline employee / non-rev pass access',
    passPriority: 'Enter priority when known',
    priority: 'highest-arrival-chance',
    openSeats: '',
    standbyCount: '',
    cabinNotes: '',
    loadNotes: 'SEA-LHR has multiple nonstop operators, but summer and a group of 4 still require backup options.',
    notes: 'Good test of a route with strong nonstop depth but group-size pressure. Include LGW/Europe rail or short-haul fallback only as backup.'
  },
  {
    tripName: 'Nairobi 2-Day Efficiency Run',
    travelerName: 'Robert',
    origin: 'SEA',
    destination: 'NBO / Nairobi',
    finalDestination: 'Nairobi city center',
    earliestDeparture: '2026-09-10T08:00',
    mustArriveBy: '2026-09-12T18:00',
    returnDate: '2026-09-15',
    travelers: '1',
    bags: 'carry-on',
    tripType: 'casual',
    scope: 'international',
    connections: 'yes',
    nearbyAirports: 'maybe',
    splitGroup: 'yes',
    backupBudget: '1200',
    passSystem: 'Airline employee / non-rev pass access; likely partner/ZED logic',
    passPriority: 'Enter priority when known',
    priority: 'highest-arrival-chance',
    openSeats: '',
    standbyCount: '',
    cabinNotes: '',
    loadNotes: 'Use Europe or Middle East gateways; do not depend on a single long-haul connection.',
    notes: 'Good test of long-haul international complexity where solo travel helps but recovery time is expensive.'
  },
  {
    tripName: 'Munich/Vienna Christmas Return',
    travelerName: 'Robert',
    origin: 'MUC / VIE',
    destination: 'SEA / Seattle',
    finalDestination: 'Home after Christmas Europe trip',
    earliestDeparture: '2026-12-25T08:00',
    mustArriveBy: '2026-12-26T23:00',
    returnDate: '2026-12-25',
    travelers: '2',
    bags: 'mixed',
    tripType: 'work',
    scope: 'international',
    connections: 'yes',
    nearbyAirports: 'yes',
    splitGroup: 'maybe',
    backupBudget: '1500',
    passSystem: 'Airline employee / non-rev pass access',
    passPriority: 'Enter priority when known',
    priority: 'highest-arrival-chance',
    openSeats: '',
    standbyCount: '',
    cabinNotes: '',
    loadNotes: 'Christmas return risk: monitor MUC/FRA/LHR/AMS/CDG options and avoid last-useful flight traps.',
    notes: 'Good test of holiday demand, return deadline pressure, and multi-airport recovery planning.'
  },
  {
    tripName: 'LAX to SEA Late Return',
    travelerName: 'Robert',
    origin: 'LAX',
    destination: 'SEA / Seattle',
    finalDestination: 'Home',
    earliestDeparture: '2026-06-27T21:00',
    mustArriveBy: '2026-06-28T01:00',
    returnDate: '2026-06-27',
    travelers: '1',
    bags: 'carry-on',
    tripType: 'casual',
    scope: 'domestic',
    connections: 'no',
    nearbyAirports: 'maybe',
    splitGroup: 'yes',
    backupBudget: '300',
    passSystem: 'Airline employee / non-rev pass access',
    passPriority: 'Enter priority when known',
    priority: 'fastest',
    openSeats: '',
    standbyCount: '',
    cabinNotes: '',
    loadNotes: 'Good domestic test: many airlines operate LAX-SEA, but the late-night window has last-flight risk.',
    notes: 'Use this to test whether the engine penalizes tight arrival windows even on a strong domestic city pair.'
  }
];

let state = {
  trips: [],
  activeTripId: null,
  currentScore: null,
  currentRoutes: []
};

function uid() {
  return `trip_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function loadState() {
  try {
    state.trips = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    state.activeTripId = localStorage.getItem(ACTIVE_KEY) || null;
  } catch (err) {
    console.warn('Could not load saved trips.', err);
    state.trips = [];
    state.activeTripId = null;
  }
}

function persistState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.trips));
  if (state.activeTripId) localStorage.setItem(ACTIVE_KEY, state.activeTripId);
  renderSavedTrips();
  renderMetrics();
}

function getFormData() {
  const data = Object.fromEntries(fields.map((id) => [id, $(id)?.value?.trim() ?? '']));
  data.travelers = data.travelers || '1';
  return data;
}

function setFormData(data = {}) {
  for (const id of fields) {
    if ($(id)) $(id).value = data[id] ?? '';
  }
  if (!$('travelers').value) $('travelers').value = '1';
  if (!$('bags').value) $('bags').value = 'carry-on';
  if (!$('tripType').value) $('tripType').value = 'casual';
  if (!$('scope').value) $('scope').value = 'domestic';
  if (!$('connections').value) $('connections').value = 'yes';
  if (!$('nearbyAirports').value) $('nearbyAirports').value = 'yes';
  if (!$('splitGroup').value) $('splitGroup').value = 'yes';
  if (!$('priority').value) $('priority').value = 'highest-arrival-chance';
}

function emptyTrip() {
  return {
    tripName: '', travelerName: '', origin: '', destination: '', finalDestination: '',
    earliestDeparture: '', mustArriveBy: '', returnDate: '', travelers: '1', bags: 'carry-on',
    tripType: 'casual', scope: 'domestic', connections: 'yes', nearbyAirports: 'yes',
    splitGroup: 'yes', backupBudget: '', passSystem: '', passPriority: '', priority: 'highest-arrival-chance',
    openSeats: '', standbyCount: '', cabinNotes: '', loadNotes: '', notes: ''
  };
}

function formatDateTime(value) {
  if (!value) return 'Not specified';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}

function formatDate(value) {
  if (!value) return 'Not specified';
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString([], { dateStyle: 'medium' });
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

function scoreTrip(data) {
  let score = 25;
  const reasons = [];
  const credits = [];
  const travelers = Math.max(1, Number(data.travelers || 1));
  const backupBudget = Number(data.backupBudget || 0);
  const gapHours = hoursBetween(data.earliestDeparture, data.mustArriveBy);
  const openSeats = data.openSeats === '' ? null : Number(data.openSeats);
  const standbyCount = data.standbyCount === '' ? null : Number(data.standbyCount);
  const destinationText = `${data.origin} ${data.destination} ${data.finalDestination} ${data.tripName || ''}`.toLowerCase();
  const dateText = `${data.earliestDeparture || ''} ${data.mustArriveBy || ''} ${data.returnDate || ''}`;
  const peakSummerEurope = data.scope === 'international' && /(portugal|lis|fao|lhr|ams|cdg|europe|july|summer)/i.test(destinationText + ' ' + dateText);
  const christmasPeak = data.scope === 'international' && (/12-(2[0-9]|3[01])/.test(dateText) || /christmas|xmas|holiday/.test(destinationText));
  const complexNoDirect = data.scope === 'international' && /(nairobi|nbo|kenya|faro|fao|algarve|portim|praia da rocha)/i.test(destinationText);
  const domesticLateWindow = data.scope === 'domestic' && gapHours !== null && gapHours <= 6;

  if (data.scope === 'international') {
    score += 10;
    reasons.push('International travel adds document, connection, and recovery risk.');
  }
  if (peakSummerEurope) {
    score += 15;
    reasons.push('Summer Europe demand can make standby clearance less forgiving.');
  }
  if (christmasPeak) {
    score += 15;
    reasons.push('Holiday return windows are less forgiving and rescue fares/hotels can spike.');
  }
  if (complexNoDirect) {
    score += /nairobi|nbo|kenya/i.test(destinationText) ? 55 : 14;
    reasons.push('This destination usually requires a gateway strategy rather than a simple nonstop fallback.');
  }
  if (domesticLateWindow) {
    score += 10;
    reasons.push('Late domestic window creates last-flight and overnight-reset risk.');
  }
  if (['event', 'wedding', 'cruise', 'work', 'family'].includes(data.tripType)) {
    score += 15;
    reasons.push('Trip purpose is deadline-sensitive, so missed flights matter more.');
  }
  if (gapHours !== null && gapHours <= 24) {
    score += 15;
    reasons.push('Arrival deadline is within 24 hours of earliest departure.');
  } else if (gapHours !== null && gapHours >= 48) {
    score -= 10;
    credits.push('You have a useful travel buffer of roughly 48+ hours.');
  }
  if (travelers > 1) {
    const partyPenalty = Math.min(25, (travelers - 1) * 5);
    score += partyPenalty;
    reasons.push(`Party size of ${travelers} makes clearing together harder.`);
  }
  if (data.bags === 'checked') {
    score += 15;
    reasons.push('Checked bags reduce reroute flexibility.');
  } else if (data.bags === 'mixed') {
    score += 8;
    reasons.push('Mixed or uncertain bag plans create reroute friction.');
  } else {
    score -= 5;
    credits.push('Carry-on only preserves reroute flexibility.');
  }
  if (data.connections === 'no') {
    score += 10;
    reasons.push('Not being willing to connect limits backup paths.');
  } else if (data.connections === 'yes') {
    score -= 5;
    credits.push('Willingness to connect creates more standby paths.');
  }
  if (data.nearbyAirports === 'yes') {
    score -= 10;
    credits.push('Nearby airports give you alternate exits.');
  } else if (data.nearbyAirports === 'no') {
    score += 10;
    reasons.push('No nearby-airport flexibility increases route dependency.');
  }
  if (data.splitGroup === 'yes') {
    score -= 10;
    credits.push('Willingness to split the party improves clearance odds.');
  } else if (data.splitGroup === 'maybe') {
    score -= 3;
    credits.push('You may be open to splitting the group if the route tightens.');
  } else if (travelers > 1) {
    score += 10;
    reasons.push('Not splitting the group makes standby harder.');
  }
  if (backupBudget >= 1000) {
    score -= 10;
    credits.push('Strong backup budget supports rescue fares or hotels.');
  } else if (backupBudget >= 500) {
    score -= 5;
    credits.push('Moderate backup budget helps if the plan breaks.');
  } else if (backupBudget === 0 || Number.isNaN(backupBudget)) {
    score += 10;
    reasons.push('No stated backup budget raises the cost of getting stuck.');
  }
  if (openSeats !== null && standbyCount !== null && !Number.isNaN(openSeats) && !Number.isNaN(standbyCount)) {
    const seatMargin = openSeats - standbyCount - travelers;
    if (seatMargin >= 4) {
      score -= 15;
      credits.push('Manual load input shows a healthy seat margin.');
    } else if (seatMargin >= 0) {
      score -= 5;
      credits.push('Manual load input is workable but should be monitored.');
    } else {
      score += 20;
      reasons.push('Manual load input shows more demand than likely open seats.');
    }
  }

  score = Math.round(clamp(score, 0, 100));
  const level = getRiskLevel(score);
  const recommendation = getRecommendation(score, data, reasons, credits);
  return { score, level, reasons, credits, recommendation };
}

function getRiskLevel(score) {
  if (score <= 25) return { label: 'Green', className: 'green', summary: 'Good non-rev setup if load data stays favorable.' };
  if (score <= 50) return { label: 'Yellow', className: 'yellow', summary: 'Reasonable, but monitor loads and keep backup routes ready.' };
  if (score <= 75) return { label: 'Orange', className: 'orange', summary: 'Risky enough that the backup plan matters as much as Plan A.' };
  return { label: 'Red', className: 'red', summary: 'Do not rely on standby if arrival time truly matters.' };
}

function getRecommendation(score, data) {
  const travelers = Number(data.travelers || 1);
  const gapHours = hoursBetween(data.earliestDeparture, data.mustArriveBy);
  if (score >= 76) return 'Buy confirmed, leave earlier, or radically change route/flexibility. This is not a clean non-rev setup.';
  if (score >= 51) {
    if (travelers >= 3) return 'Leave early, stay carry-on only, and be ready to split the group or buy the final segment.';
    return 'Try standby only with Plan B and a paid rescue trigger already set.';
  }
  if (gapHours !== null && gapHours < 36) return 'Proceed, but add more buffer if the trip has a hard deadline.';
  return 'Proceed with monitoring. Keep the Battle Card handy and update loads close to departure.';
}

function destinationMatches(data, regex) {
  return regex.test(`${data.destination || ''} ${data.finalDestination || ''}`.toLowerCase());
}

function generateRoutes(data) {
  const origin = (data.origin || 'Origin').toUpperCase();
  const dest = data.destination || 'Destination';
  const portugal = destinationMatches(data, /(portugal|lis|fao|faro|porto|opo|portim|algarve|praia da rocha)/i);
  const london = destinationMatches(data, /(london|lhr|lgw|southwark)/i);
  const nairobi = destinationMatches(data, /(nairobi|nbo|kenya)/i);
  const munichVienna = destinationMatches(data, /(munich|muc|vienna|vie|christmas)/i);
  const laxSea = /lax/i.test(data.origin || '') && /sea|seattle/i.test(data.destination || '');
  const europe = portugal || london || munichVienna || destinationMatches(data, /(europe|lhr|ams|cdg|fra|muc|dublin|dub|madrid|mad|barcelona|bcn|rome|fco)/i) || data.scope === 'international';

  if (laxSea) {
    return [
      {
        title: 'Plan A: LAX → SEA nonstop on the strongest load',
        body: 'Use the best nonstop load first, but do not ignore departure time. A late window can turn a normally easy domestic route into a last-flight trap.'
      },
      {
        title: 'Plan B: earlier same-day LAX → SEA option',
        body: 'If the late flight looks tight, move earlier rather than waiting for the perfect departure time.'
      },
      {
        title: 'Plan C: nearby airport fallback',
        body: 'Consider BUR/SNA/LGB/ONT to SEA-area options only if the time and ground transport still beat waiting overnight at LAX.'
      }
    ];
  }

  if (nairobi) {
    return [
      {
        title: `Plan A: ${origin} → AMS/CDG/FRA/IST/DOH/DXB → NBO`,
        body: 'Prioritize a gateway with a reliable same-day Nairobi exit and strong recovery options. The long-haul connection is the trip.'
      },
      {
        title: 'Plan B: SEA → JFK → NBO if a confirmed or favorable partner option appears',
        body: 'JFK can be useful because it has nonstop Nairobi service, but positioning adds risk and should be justified by better loads.'
      },
      {
        title: 'Plan C: buy the final Africa/Middle East-to-Nairobi leg',
        body: 'If you clear to a strong gateway but NBO standby fails, a paid final segment may be cheaper than losing a short trip day.'
      }
    ];
  }

  if (london) {
    return [
      {
        title: `Plan A: ${origin} → LHR nonstop`,
        body: 'London is one of Seattle’s strongest international routes, so start with nonstop options and rank by pass priority and open-seat margin.'
      },
      {
        title: 'Plan B: SEA → AMS/CDG/DUB/FRA → London',
        body: 'If nonstop LHR tightens, use another European gateway and buy or standby the short hop into London.'
      },
      {
        title: 'Plan C: alternate London-area arrival',
        body: 'Use LGW/STN/LCY only when onward transport still works for the final London destination.'
      }
    ];
  }

  if (munichVienna) {
    return [
      {
        title: 'Plan A: MUC/FRA/LHR/AMS/CDG → SEA',
        body: 'Treat Christmas return as a recovery problem. Choose the route with the most same-day backup exits, not the prettiest itinerary.'
      },
      {
        title: 'Plan B: VIE → FRA/MUC/LHR/AMS/CDG → SEA',
        body: 'Use Vienna as the origin if it improves rail/air timing, but keep Munich and Frankfurt in play as stronger transatlantic gateways.'
      },
      {
        title: 'Plan C: confirmed positioning or overnight reset',
        body: 'Holiday returns punish late decisions. Define the paid rescue trigger before Christmas Day.'
      }
    ];
  }

  if (portugal) {
    return [
      {
        title: `Plan A: ${origin} → major Europe gateway → LIS/FAO`,
        body: 'Use the strongest long-haul gateway first, then treat Lisbon and Faro as flexible arrival targets. For Algarve, Faro is ideal, Lisbon is a strong backup.'
      },
      {
        title: `Plan B: ${origin} → LHR/AMS/CDG/FRA/MUC → Portugal`,
        body: 'Rank the hub based on your pass priority, load picture, and same-day onward options. Avoid arriving after the last useful Portugal connection.'
      },
      {
        title: `Plan C: ${origin} → East Coast/SFO positioning → LIS`,
        body: 'Use a U.S. positioning route only if the transatlantic load is clearly better. It adds a failure point, so it should not be the first choice by default.'
      },
      {
        title: 'Paid rescue rule: buy the short Europe-to-Portugal leg if needed',
        body: 'The highest-value non-rev leg is the long-haul. If you clear to Europe but the Portugal leg collapses, buying the final short-haul can save the trip.'
      }
    ];
  }

  if (europe) {
    return [
      {
        title: `Plan A: ${origin} → strongest long-haul gateway → ${dest}`,
        body: 'Pick the gateway with multiple onward exits, not simply the shortest route.'
      },
      {
        title: 'Plan B: alliance-friendly hub backup',
        body: 'Use the hub where your pass priority, airline access, and partner availability give you the best optionality.'
      },
      {
        title: 'Plan C: nearby destination airport',
        body: 'For international standby, arriving close and using rail/bus/short-haul rescue can beat waiting all day for the perfect flight.'
      }
    ];
  }

  return [
    {
      title: `Plan A: ${origin} → ${dest}`,
      body: 'Use the direct route if loads are favorable and there are later same-day backup flights.'
    },
    {
      title: 'Plan B: hub reroute',
      body: 'Choose a hub with several onward flights so one missed standby does not strand you.'
    },
    {
      title: 'Plan C: nearby airport or confirmed rescue',
      body: 'If your arrival deadline matters, define the moment when you stop waiting and buy confirmed.'
    }
  ];
}

function getSwitchTriggers(data, scoreObj) {
  const travelers = Number(data.travelers || 1);
  const triggers = [];
  triggers.push('Switch away from Plan A if the route loses same-day backup options.');
  if (travelers >= 3) triggers.push('If seats open are fewer than the travel party plus 2-4 buffer seats, consider splitting or rerouting.');
  if (data.bags === 'checked') triggers.push('If checking bags, do not hop across multiple route ideas without confirming bag handling.');
  if (data.scope === 'international') triggers.push('If the long-haul clears but the final leg does not, price the short-haul rescue immediately.');
  if (scoreObj.score >= 51) triggers.push('If the standby list worsens inside the final 2-3 hours, move to Plan B instead of hoping.');
  triggers.push('Buy confirmed when hotel/event loss plus delay cost is greater than the rescue fare.');
  return triggers;
}

function getActiveTrip() {
  return state.trips.find((trip) => trip.id === state.activeTripId) || null;
}

function validationFields() {
  return ['clarityScore', 'trustScore', 'actionScore', 'stressScore', 'payScore', 'payAmount', 'testOutcome', 'testerName', 'validationNotes'];
}

function getValidationData() {
  const data = Object.fromEntries(validationFields().map((id) => [id, $(id)?.value?.trim() ?? '']));
  const scores = ['clarityScore', 'trustScore', 'actionScore', 'stressScore', 'payScore']
    .map((id) => Number(data[id]))
    .filter((value) => Number.isFinite(value) && value > 0);
  const average = scores.length ? Number((scores.reduce((sum, value) => sum + value, 0) / scores.length).toFixed(1)) : null;
  return {
    ...data,
    average,
    updatedAt: nowIso()
  };
}

function validationLabel(validation) {
  if (!validation || validation.average === null || validation.average === undefined) return 'Untested';
  if (validation.testOutcome && validation.testOutcome !== 'untested') return validation.testOutcome.replaceAll('-', ' ').replace(/^./, (c) => c.toUpperCase());
  if (validation.average >= 4 && Number(validation.payScore || 0) >= 4) return 'Strong signal';
  if (validation.average >= 3.5) return 'Needs polish';
  return 'Weak signal';
}

function setValidationData(validation = {}) {
  for (const id of validationFields()) {
    if ($(id)) $(id).value = validation[id] ?? (id === 'testOutcome' ? 'untested' : '');
  }
  if ($('validationStatus')) $('validationStatus').textContent = validationLabel(validation);
}

function saveValidation() {
  const trip = getActiveTrip();
  if (!trip) {
    alert('Save or open a trip before adding validation feedback.');
    return;
  }
  const validation = getValidationData();
  trip.validation = validation;
  trip.validationAvg = validation.average;
  trip.validationStatus = validation.testOutcome && validation.testOutcome !== 'untested'
    ? validation.testOutcome
    : validationLabel(validation).toLowerCase().replaceAll(' ', '-');
  trip.updatedAt = nowIso();
  persistState();
  renderValidationPanel(trip);
  $('saveStatus').textContent = 'Validation saved';
}

function clearValidation() {
  const trip = getActiveTrip();
  if (!trip) return;
  if (!window.confirm('Clear validation feedback for this trip?')) return;
  delete trip.validation;
  delete trip.validationAvg;
  trip.validationStatus = 'untested';
  trip.updatedAt = nowIso();
  persistState();
  renderValidationPanel(trip);
  $('saveStatus').textContent = 'Validation cleared';
}

function renderValidationPanel(trip) {
  if (!document.getElementById('validationPanel')) return;
  setValidationData(trip?.validation || {});
  const label = validationLabel(trip?.validation);
  $('validationStatus').textContent = label;
}

function renderValidationDashboard() {
  if (!$('metricValidated')) return;
  const trips = state.trips;
  const validated = trips.filter((trip) => trip.validation && trip.validation.average !== null && trip.validation.average !== undefined);
  const avgUseful = validated.length
    ? (validated.reduce((sum, trip) => sum + Number(trip.validation.clarityScore || 0), 0) / validated.length).toFixed(1)
    : '—';
  const avgAction = validated.length
    ? (validated.reduce((sum, trip) => sum + Number(trip.validation.actionScore || 0), 0) / validated.length).toFixed(1)
    : '—';
  const paidSignals = validated.filter((trip) => Number(trip.validation.payScore || 0) >= 4).length;
  $('metricValidated').textContent = validated.length;
  $('metricAvgUseful').textContent = avgUseful;
  $('metricAvgAction').textContent = avgAction;
  $('metricPaidInterest').textContent = paidSignals;

  if (!trips.length) {
    $('validationQueue').className = 'validation-list empty-state';
    $('validationQueue').textContent = 'Load or save trips to start validation.';
    return;
  }

  $('validationQueue').className = 'validation-list';
  $('validationQueue').innerHTML = trips.map((trip) => {
    const label = validationLabel(trip.validation);
    const avg = trip.validation?.average ?? '—';
    return `<button class="validation-item ${trip.id === state.activeTripId ? 'active' : ''}" data-trip-id="${trip.id}">
      <strong>${escapeHtml(trip.tripName || 'Untitled trip')}</strong>
      <small>${escapeHtml(label)} · avg ${avg}</small>
    </button>`;
  }).join('');
  document.querySelectorAll('.validation-item').forEach((button) => {
    button.addEventListener('click', () => {
      openTrip(button.dataset.tripId);
      document.getElementById('validationPanel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}


function upsertTrip(data, silent = false) {
  const existing = getActiveTrip();
  const score = scoreTrip(data);
  const routes = generateRoutes(data);
  const base = existing || { id: uid(), createdAt: nowIso(), loadChecks: [], outcome: '' };
  const trip = {
    ...base,
    ...data,
    updatedAt: nowIso(),
    score: score.score,
    riskLabel: score.level.label,
    routeTitles: routes.map((route) => route.title)
  };
  const index = state.trips.findIndex((item) => item.id === trip.id);
  if (index >= 0) state.trips[index] = trip;
  else state.trips.unshift(trip);
  state.activeTripId = trip.id;
  state.currentScore = score;
  state.currentRoutes = routes;
  persistState();
  renderPlan(data, score, routes);
  renderLoadLog(trip.loadChecks || []);
  $('saveStatus').textContent = silent ? 'Saved' : 'Saved just now';
  return trip;
}

function renderPlan(data, scoreObj, routes) {
  $('riskScore').textContent = scoreObj.score;
  $('riskBadge').textContent = scoreObj.level.label;
  $('riskBadge').className = `risk-badge ${scoreObj.level.className}`;
  $('riskSummary').textContent = scoreObj.level.summary;
  $('recommendedMove').textContent = scoreObj.recommendation;
  renderList('riskReasons', scoreObj.reasons.length ? scoreObj.reasons : ['No major risk drivers added yet.']);
  renderList('riskCredits', scoreObj.credits.length ? scoreObj.credits : ['No risk reducers added yet.']);
  $('routeStrategy').className = 'route-list';
  $('routeStrategy').innerHTML = routes.map((route) => `
    <div class="route-card">
      <strong>${escapeHtml(route.title)}</strong>
      <p>${escapeHtml(route.body)}</p>
    </div>
  `).join('');
  $('battleCard').className = 'battle-card';
  $('battleCard').innerHTML = buildBattleCardHtml(data, scoreObj, routes);
}

function renderList(id, items) {
  $(id).innerHTML = items.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
}

function buildBattleCardHtml(data, scoreObj, routes) {
  const triggers = getSwitchTriggers(data, scoreObj);
  const routeItems = routes.map((route) => `<li><strong>${escapeHtml(route.title)}:</strong> ${escapeHtml(route.body)}</li>`).join('');
  const triggerItems = triggers.map((trigger) => `<li>${escapeHtml(trigger)}</li>`).join('');
  const bagRule = data.bags === 'carry-on'
    ? 'Carry-on only is the correct setup. Keep it that way.'
    : data.bags === 'checked'
      ? 'Checked bags are a major reroute risk. Use checked bags only if the route is stable.'
      : 'Mixed baggage is a caution flag. Decide before departure because bags affect rerouting.';
  const docRule = data.scope === 'international'
    ? 'Verify passport validity, visa/transit rules, onward/return proof, and destination entry requirements before listing.'
    : 'Domestic trip: verify ID requirements and airport-specific standby procedures.';
  const groupRule = Number(data.travelers || 1) > 1
    ? `Party of ${data.travelers}. Splitting the group should remain an option if the list tightens.`
    : 'Solo traveler. You have more flexibility than a group.';
  return `
    <h2>StandbyPilot Non-Rev Battle Card</h2>
    <p class="risk-line">Risk: ${scoreObj.level.label} / ${scoreObj.score} — ${escapeHtml(scoreObj.level.summary)}</p>
    <div class="mini-grid">
      <div><strong>Trip:</strong><br>${escapeHtml(data.tripName || 'Untitled trip')}</div>
      <div><strong>Traveler:</strong><br>${escapeHtml(data.travelerName || 'Not specified')}</div>
      <div><strong>Origin:</strong><br>${escapeHtml(data.origin || 'Not specified')}</div>
      <div><strong>Destination:</strong><br>${escapeHtml(data.destination || 'Not specified')}</div>
      <div><strong>Final destination:</strong><br>${escapeHtml(data.finalDestination || 'Not specified')}</div>
      <div><strong>Return:</strong><br>${formatDate(data.returnDate)}</div>
      <div><strong>Earliest departure:</strong><br>${formatDateTime(data.earliestDeparture)}</div>
      <div><strong>Must arrive by:</strong><br>${formatDateTime(data.mustArriveBy)}</div>
      <div><strong>Travelers:</strong><br>${escapeHtml(data.travelers || '1')}</div>
      <div><strong>Backup budget:</strong><br>$${escapeHtml(data.backupBudget || '0')}</div>
    </div>

    <h3>Recommended Move</h3>
    <p>${escapeHtml(scoreObj.recommendation)}</p>

    <h3>Route Strategy</h3>
    <ul>${routeItems}</ul>

    <h3>Switch-Plan Triggers</h3>
    <ul>${triggerItems}</ul>

    <h3>Non-Rev Rules for This Trip</h3>
    <ul>
      <li>${escapeHtml(bagRule)}</li>
      <li>${escapeHtml(groupRule)}</li>
      <li>${escapeHtml(docRule)}</li>
      <li>Use live/manual load checks close to departure; this tool is a decision framework, not a live airline source.</li>
    </ul>

    <h3>Notes</h3>
    <p><strong>Pass system:</strong> ${escapeHtml(data.passSystem || 'Not specified')}</p>
    <p><strong>Pass priority:</strong> ${escapeHtml(data.passPriority || 'Not specified')}</p>
    <p><strong>Load notes:</strong> ${escapeHtml(data.loadNotes || 'None')}</p>
    <p><strong>Trip notes:</strong> ${escapeHtml(data.notes || 'None')}</p>
  `;
}

function buildBattleCardText() {
  const data = getFormData();
  const scoreObj = state.currentScore || scoreTrip(data);
  const routes = state.currentRoutes.length ? state.currentRoutes : generateRoutes(data);
  const triggers = getSwitchTriggers(data, scoreObj);
  return [
    'STANDBYPILOT NON-REV BATTLE CARD',
    '',
    `Trip: ${data.tripName || 'Untitled trip'}`,
    `Traveler: ${data.travelerName || 'Not specified'}`,
    `Origin: ${data.origin || 'Not specified'}`,
    `Destination: ${data.destination || 'Not specified'}`,
    `Final destination: ${data.finalDestination || 'Not specified'}`,
    `Earliest departure: ${formatDateTime(data.earliestDeparture)}`,
    `Must arrive by: ${formatDateTime(data.mustArriveBy)}`,
    `Return date: ${formatDate(data.returnDate)}`,
    `Travelers: ${data.travelers || '1'}`,
    `Bags: ${data.bags || 'Not specified'}`,
    `Risk: ${scoreObj.level.label} / ${scoreObj.score}`,
    '',
    `Recommended move: ${scoreObj.recommendation}`,
    '',
    'Route strategy:',
    ...routes.map((route, index) => `${index + 1}. ${route.title} — ${route.body}`),
    '',
    'Switch-plan triggers:',
    ...triggers.map((trigger) => `- ${trigger}`),
    '',
    `Load notes: ${data.loadNotes || 'None'}`,
    `Trip notes: ${data.notes || 'None'}`
  ].join('\n');
}


function loadFiveTestTrips() {
  const ok = state.trips.length
    ? window.confirm('Load the 5-trip validation suite? This will add the sample trips to your saved trips without deleting existing trips.')
    : true;
  if (!ok) return;

  const created = testTrips.map((sample, index) => {
    const score = scoreTrip(sample);
    const routes = generateRoutes(sample);
    return {
      ...sample,
      id: uid(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      loadChecks: [],
      outcome: '',
      validationStatus: 'untested',
      score: score.score,
      riskLabel: score.level.label,
      routeTitles: routes.map((route) => route.title),
      testCaseNumber: index + 1
    };
  });

  state.trips = [...created, ...state.trips];
  state.activeTripId = created[0].id;
  persistState();
  openTrip(state.activeTripId);
  $('saveStatus').textContent = '5-trip test suite loaded';
}

function renderSavedTrips() {
  $('tripCount').textContent = state.trips.length;
  if (!state.trips.length) {
    $('savedTrips').className = 'saved-list empty-state';
    $('savedTrips').textContent = 'No saved trips yet.';
    return;
  }
  $('savedTrips').className = 'saved-list';
  $('savedTrips').innerHTML = state.trips.map((trip) => `
    <button class="saved-item ${trip.id === state.activeTripId ? 'active' : ''}" data-trip-id="${trip.id}">
      <strong>${escapeHtml(trip.tripName || 'Untitled trip')}</strong>
      <small>${escapeHtml(trip.origin || 'Origin')} → ${escapeHtml(trip.destination || 'Destination')}</small>
      <small>${trip.riskLabel || 'Unscored'} risk · ${validationLabel(trip.validation)} · updated ${new Date(trip.updatedAt || trip.createdAt).toLocaleDateString()}</small>
    </button>
  `).join('');
  document.querySelectorAll('.saved-item').forEach((button) => {
    button.addEventListener('click', () => openTrip(button.dataset.tripId));
  });
}

function renderMetrics() {
  const trips = state.trips;
  $('metricTrips').textContent = trips.length;
  if (!trips.length) {
    $('metricAvgRisk').textContent = '—';
    $('metricOrangeRed').textContent = '0';
    $('metricLoadChecks').textContent = '0';
    renderValidationDashboard();
    return;
  }
  const scored = trips.filter((trip) => typeof trip.score === 'number');
  const avg = scored.length ? Math.round(scored.reduce((sum, trip) => sum + trip.score, 0) / scored.length) : 0;
  const orangeRed = scored.filter((trip) => trip.score >= 51).length;
  const loadChecks = trips.reduce((sum, trip) => sum + (trip.loadChecks?.length || 0), 0);
  $('metricAvgRisk').textContent = scored.length ? avg : '—';
  $('metricOrangeRed').textContent = orangeRed;
  $('metricLoadChecks').textContent = loadChecks;
  renderValidationDashboard();
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
  renderValidationPanel(trip);
  renderSavedTrips();
  $('saveStatus').textContent = 'Loaded saved trip';
}

function newTrip() {
  state.activeTripId = null;
  localStorage.removeItem(ACTIVE_KEY);
  setFormData(emptyTrip());
  state.currentScore = null;
  state.currentRoutes = [];
  $('formTitle').textContent = 'Create Battle Plan';
  $('saveStatus').textContent = 'Unsaved';
  $('riskScore').textContent = '—';
  $('riskBadge').textContent = 'Yellow';
  $('riskBadge').className = 'risk-badge yellow';
  $('riskSummary').textContent = 'Complete the form and generate a plan.';
  $('recommendedMove').textContent = 'Recommended move will appear here.';
  $('riskReasons').innerHTML = '';
  $('riskCredits').innerHTML = '';
  $('routeStrategy').className = 'route-list empty-state';
  $('routeStrategy').textContent = 'Generate a plan to see route strategy.';
  $('battleCard').className = 'battle-card empty-state';
  $('battleCard').textContent = 'Generate a plan to create the Battle Card.';
  renderLoadLog([]);
  renderValidationPanel(null);
  renderSavedTrips();
}

function duplicateTrip() {
  const data = getFormData();
  const trip = {
    ...data,
    id: uid(),
    tripName: `${data.tripName || 'Untitled trip'} Copy`,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    loadChecks: [],
    validationStatus: 'untested'
  };
  delete trip.validation;
  delete trip.validationAvg;
  state.trips.unshift(trip);
  state.activeTripId = trip.id;
  setFormData(trip);
  upsertTrip(trip, true);
}

function deleteActiveTrip() {
  if (!state.activeTripId) {
    newTrip();
    return;
  }
  const active = getActiveTrip();
  const ok = window.confirm(`Delete "${active?.tripName || 'this trip'}"?`);
  if (!ok) return;
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
    flight: $('loadFlight').value.trim() || 'Unspecified flight/route',
    openSeats: $('loadOpenSeats').value.trim(),
    standbys: $('loadStandbys').value.trim(),
    cabin: $('loadCabin').value.trim()
  };
  trip.loadChecks = [check, ...(trip.loadChecks || [])];
  const index = state.trips.findIndex((item) => item.id === trip.id);
  state.trips[index] = trip;
  persistState();
  renderLoadLog(trip.loadChecks);
  $('loadFlight').value = '';
  $('loadOpenSeats').value = '';
  $('loadStandbys').value = '';
  $('loadCabin').value = '';
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
      <p>
        <strong>${escapeHtml(check.flight)}</strong><br>
        ${new Date(check.createdAt).toLocaleString()} · Open seats: ${escapeHtml(check.openSeats || '—')} · Standbys: ${escapeHtml(check.standbys || '—')}<br>
        ${escapeHtml(check.cabin || 'No cabin notes')}
      </p>
      <button class="danger" data-load-id="${check.id}">Remove</button>
    </div>
  `).join('');
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

function exportTrips() {
  const blob = new Blob([JSON.stringify({ version: 1, exportedAt: nowIso(), trips: state.trips }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `standbypilot-trips-${new Date().toISOString().slice(0, 10)}.json`;
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

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function initEvents() {
  $('tripForm').addEventListener('submit', (event) => {
    event.preventDefault();
    upsertTrip(getFormData());
  });
  $('saveTrip').addEventListener('click', () => upsertTrip(getFormData()));
  $('newTrip').addEventListener('click', newTrip);
  $('duplicateTrip').addEventListener('click', duplicateTrip);
  $('deleteTrip').addEventListener('click', deleteActiveTrip);
  $('loadPortugal').addEventListener('click', () => {
    state.activeTripId = null;
    setFormData(portugalSample);
    upsertTrip(getFormData());
  });
  $('loadTestSuite').addEventListener('click', loadFiveTestTrips);
  $('jumpValidation')?.addEventListener('click', () => document.getElementById('validationPanel')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  $('saveValidation')?.addEventListener('click', saveValidation);
  $('clearValidation')?.addEventListener('click', clearValidation);
  $('addLoadCheck').addEventListener('click', addLoadCheck);
  $('copyBattleCard').addEventListener('click', async () => {
    const text = buildBattleCardText();
    try {
      await navigator.clipboard.writeText(text);
      $('saveStatus').textContent = 'Battle Card copied';
    } catch {
      alert(text);
    }
  });
  $('printBattleCard').addEventListener('click', () => window.print());
  $('exportTrips').addEventListener('click', exportTrips);
  $('importTrips').addEventListener('change', importTrips);

  fields.forEach((field) => {
    $(field)?.addEventListener('input', () => {
      $('saveStatus').textContent = state.activeTripId ? 'Unsaved changes' : 'Unsaved';
    });
  });
}

function init() {
  loadState();
  initEvents();
  renderSavedTrips();
  renderMetrics();
  if (state.activeTripId && state.trips.some((trip) => trip.id === state.activeTripId)) {
    openTrip(state.activeTripId);
  } else {
    newTrip();
  }
}

init();
