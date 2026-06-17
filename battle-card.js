function asNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function compactList(items, fallback) {
  const filtered = items.filter(Boolean);
  return filtered.length ? filtered : [fallback];
}

function toListHtml(items) {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
}

function topItems(items, fallback) {
  return compactList(items, fallback).slice(0, 3);
}

function isDeadlineSensitive(data) {
  return ['event', 'wedding', 'cruise', 'work', 'family'].includes(data.tripType);
}

function isInternational(data) {
  return data.scope === 'international';
}

function travelWindowHours(data) {
  return hoursBetween(data.earliestDeparture, data.mustArriveBy);
}

function destinationText(data) {
  return `${data.origin || ''} ${data.destination || ''} ${data.finalDestination || ''} ${data.tripName || ''}`.toLowerCase();
}

function decisionLabel(scoreObj, data) {
  const score = scoreObj.score;
  const deadline = isDeadlineSensitive(data);
  const gapHours = travelWindowHours(data);
  const travelers = asNumber(data.travelers, 1);
  const hasLoadPressure = data.openSeats !== '' && data.standbyCount !== ''
    && asNumber(data.openSeats) - asNumber(data.standbyCount) - travelers < 0;

  if (score >= 76) return deadline ? 'Do not non-rev' : 'Buy confirmed';
  if (score >= 61) return deadline || hasLoadPressure ? 'Buy confirmed' : 'Switch route';
  if (score >= 51) return deadline || travelers >= 3 ? 'Go early' : 'Switch route';
  if (score >= 36) return gapHours !== null && gapHours < 36 ? 'Go early' : 'Monitor';
  return 'Go';
}

function confidenceLevel(data, scoreObj) {
  const hasManualLoads = data.openSeats !== '' && data.standbyCount !== '';
  const hasSpecificRoute = Boolean(data.origin && data.destination);
  const hasDeadline = Boolean(data.earliestDeparture && data.mustArriveBy);
  if (hasManualLoads && hasSpecificRoute && hasDeadline) return 'Medium-high: manual load context is included, but standby can still change quickly.';
  if (hasSpecificRoute && hasDeadline) return 'Medium: route and timing are known, but live load context is still manual or missing.';
  if (scoreObj.score >= 76) return 'Low-medium: the risk is high enough that missing details matter.';
  return 'Medium-low: useful for planning, but update with real load checks before travel.';
}

function finalRecommendationReason(data, scoreObj) {
  const travelers = asNumber(data.travelers, 1);
  const gapHours = travelWindowHours(data);
  const pieces = [];
  pieces.push(`${scoreObj.level.label} risk at ${scoreObj.score}/100`);
  if (isDeadlineSensitive(data)) pieces.push('deadline-sensitive trip');
  if (gapHours !== null && gapHours < 36) pieces.push('tight arrival buffer');
  else if (gapHours !== null && gapHours >= 48) pieces.push('useful arrival buffer');
  if (travelers >= 3) pieces.push(`group of ${travelers}`);
  if (data.bags === 'checked') pieces.push('checked-bag reroute risk');
  if (data.nearbyAirports === 'yes') pieces.push('nearby-airport flexibility');
  else if (data.nearbyAirports === 'no') pieces.push('limited airport flexibility');
  if (isInternational(data)) pieces.push('international documents and final-leg risk');
  return `This is a ${pieces.join(', ')} setup, so the plan needs a clear switch point rather than hope at the gate.`;
}

function bestDepartureWindow(data) {
  const gapHours = travelWindowHours(data);
  if (gapHours === null) return 'Use the earliest practical departure that preserves same-day backup options.';
  if (gapHours <= 24) return 'Leave on the first workable departure; this window is too tight to wait for a prettier itinerary.';
  if (gapHours < 48) return 'Leave early enough to keep at least one same-day recovery path if Plan A fails.';
  return 'Use the early side of the window, then keep later departures as backup instead of first choice.';
}

function primaryRouteRisk(data, routes) {
  if (routes[0]?.body) return routes[0].body;
  if (isInternational(data)) return 'The long-haul may clear while the final leg fails, so protect the connection and final segment.';
  return 'The main risk is waiting too long and losing useful same-day backup options.';
}

function alternateAirportOption(data) {
  if (data.nearbyAirports === 'yes') return 'Use nearby airports aggressively if they improve arrival chance or preserve same-day recovery.';
  if (data.nearbyAirports === 'maybe') return 'Keep nearby airports as a backup if the ground transfer still protects the deadline.';
  return 'Nearby-airport flexibility is limited, so do not let Plan A consume the whole travel window.';
}

function splitPartyOption(data) {
  const travelers = asNumber(data.travelers, 1);
  if (travelers < 2) return 'Not needed for a solo traveler.';
  if (data.splitGroup === 'yes') return `Be willing to split the party of ${travelers} when seats open in smaller chunks.`;
  if (data.splitGroup === 'maybe') return `Decide before departure what split is acceptable for the party of ${travelers}.`;
  return `Not splitting a party of ${travelers} raises risk; consider confirmed fallback earlier.`;
}

function overnightResetOption(data, scoreObj) {
  if (scoreObj.score >= 61 || isDeadlineSensitive(data)) return 'Preselect the overnight city and hotel trigger before leaving home.';
  if (isInternational(data)) return 'Prefer an overnight reset at a major gateway with multiple next-day exits.';
  return 'Use an overnight reset only if same-day options collapse or the rescue fare is unreasonable.';
}

function rescueFareTrigger(data, scoreObj) {
  const budget = asNumber(data.backupBudget, 0);
  if (scoreObj.score >= 76) return 'Buy confirmed before relying on standby if arrival truly matters.';
  if (isDeadlineSensitive(data)) return 'Buy confirmed when a miss would threaten the event, work obligation, cruise, or fixed reservation.';
  if (budget >= 1000) return 'Use the strong backup budget to buy the failure segment early instead of absorbing a stranded night.';
  if (budget >= 500) return 'Set a firm fare ceiling and buy when Plan B starts losing same-day recovery.';
  return 'With little backup budget, switch routes earlier because last-minute rescue fares may be painful.';
}

function bestSegmentToBuy(data) {
  const text = destinationText(data);
  if (isInternational(data) && /(portugal|lis|fao|faro|algarve|portim)/i.test(text)) return 'The short Europe-to-Portugal final leg is the best segment to buy if the long-haul clears.';
  if (isInternational(data) && /(nairobi|nbo|kenya)/i.test(text)) return 'The final gateway-to-Nairobi leg is the best segment to buy if the long-haul positioning succeeds.';
  if (isInternational(data)) return 'Usually buy the final short-haul or last international connection after securing the hardest long-haul seat.';
  return 'For domestic trips, buy the nonstop or last useful segment before the final same-day option disappears.';
}

function airportSurvivalNotes(data) {
  const text = destinationText(data);
  if (/(lhr|london|ams|cdg|fra|muc|europe|portugal|lis|fao|nbo|nairobi)/i.test(text) || isInternational(data)) {
    return {
      best: 'A major gateway with multiple onward exits, hotels, lounges, and ground transport options.',
      worst: 'A small final-destination airport after the last useful onward flight has departed.',
      notes: 'Protect sleep, food, and ground transport. If the gateway has good exits tomorrow, it may be safer than forcing a weak final leg tonight.'
    };
  }
  if (/(lax|sea|seattle)/i.test(text)) {
    return {
      best: 'The airport with the most remaining same-day flights and easiest ground transport home.',
      worst: 'The origin airport after the final nonstop leaves and nearby airport options are gone.',
      notes: 'For casual domestic trips, avoid turning a simple delay into an expensive overnight by waiting too long.'
    };
  }
  return {
    best: 'The hub with the most onward departures, hotels, and ground transport choices.',
    worst: 'Any airport where the next useful flight is tomorrow and hotels are scarce or expensive.',
    notes: 'Keep charger, food, medication, and lodging options ready before the last useful flight window closes.'
  };
}

function documentNotes(data) {
  if (!isInternational(data)) {
    return [
      'Domestic trip: verify ID requirements and airport-specific standby procedures.',
      'Do not paste private employee-system screenshots or restricted load data into this prototype.'
    ];
  }
  return [
    'Verify passport validity, visa rules, transit rules, and destination entry requirements before listing.',
    'Carry onward/return proof when destination or transit rules may require it.',
    'Do not paste private employee-system screenshots, restricted load data, or airline portal details into this prototype.'
  ];
}

function baggageRules(data) {
  if (data.bags === 'checked') return 'Avoid checked bags if possible; they can trap you on a route and make fast reroutes harder.';
  if (data.bags === 'mixed') return 'Resolve baggage before departure. Mixed bags create friction when the plan changes.';
  return 'Carry-on only is the right setup for standby flexibility. Keep it that way.';
}

function bottomLine(data, scoreObj) {
  const decision = decisionLabel(scoreObj, data);
  if (decision === 'Do not non-rev') return 'Do not make this trip depend on standby unless the arrival time no longer matters.';
  if (decision === 'Buy confirmed') return 'Set the rescue fare trigger now and buy confirmed before the trip becomes a scramble.';
  if (decision === 'Switch route') return 'Do not wait for Plan A to become perfect; move to the strongest backup as soon as the list tightens.';
  if (decision === 'Go early') return 'Go, but leave earlier than feels convenient and keep the backup route warm.';
  if (decision === 'Monitor') return 'Proceed, but keep checking loads and switch before the last useful option disappears.';
  return 'Go, keep it carry-on, and update the plan when real load checks change.';
}

function sectionHtml(letter, title, body) {
  return `<section class="report-section"><h3>${letter}. ${title}</h3>${body}</section>`;
}

function buildBattleCardModel(data, scoreObj, routes) {
  const decision = decisionLabel(scoreObj, data);
  const primary = routes[0] || { title: `${data.origin || 'Origin'} → ${data.destination || 'destination'}`, body: 'Use the strongest available route with same-day backups.' };
  const planB = routes[1]?.title || 'Hub reroute with the most onward departures';
  const planC = routes[2]?.title || 'Nearby airport or confirmed rescue fare';
  const survival = airportSurvivalNotes(data);
  const riskDrivers = topItems(scoreObj.reasons, 'No major risk drivers identified yet.');
  const riskReducers = topItems(scoreObj.credits, 'No meaningful risk reducers entered yet.');
  const travelers = asNumber(data.travelers, 1);
  const deadline = isDeadlineSensitive(data);
  const casualDomestic = !isInternational(data) && !deadline;

  return {
    decision,
    finalReason: finalRecommendationReason(data, scoreObj),
    confidence: confidenceLevel(data, scoreObj),
    riskDrivers,
    riskReducers,
    primary,
    planB,
    planC,
    bestDeparture: bestDepartureWindow(data),
    mainRouteRisk: primaryRouteRisk(data, routes),
    alternateAirport: alternateAirportOption(data),
    splitParty: splitPartyOption(data),
    overnightReset: overnightResetOption(data, scoreObj),
    rescueTrigger: rescueFareTrigger(data, scoreObj),
    buySegment: bestSegmentToBuy(data),
    budgetNote: data.backupBudget ? `Backup budget entered: $${data.backupBudget}. Use it as a decision trigger, not a comfort blanket.` : 'No backup budget entered. That makes early route switching more important.',
    baggageRule: baggageRules(data),
    groupRule: travelers >= 3 ? `Group of ${travelers}: assume everyone may not clear together and agree on split rules now.` : travelers > 1 ? `Party of ${travelers}: keep splitting available if seats appear unevenly.` : 'Solo traveler: use that flexibility to take the first workable seat.',
    splitRule: splitPartyOption(data),
    survival,
    docs: documentNotes(data),
    bottomLine: casualDomestic && scoreObj.score <= 50 ? 'This is a manageable domestic standby trip, but do not let a late window erase your backup options.' : bottomLine(data, scoreObj)
  };
}

function buildBattleCardHtml(data, scoreObj, routes) {
  const model = buildBattleCardModel(data, scoreObj, routes);
  const switchTriggers = [
    'Before leaving home: switch if Plan A no longer has same-day backup options or the rescue fare is still affordable.',
    `At origin airport: ${model.riskDrivers[0] || 'move when the standby list worsens faster than available seats improve.'}`,
    isInternational(data)
      ? 'At connection hub: protect the final leg; price the short-haul or final international segment as soon as it looks weak.'
      : 'At connection hub: choose the option with the most remaining same-day departures, not the nicest itinerary.',
    'After missing final leg: stop improvising, use the preselected overnight reset or buy the rescue segment.'
  ];

  return `
    <h2>STANDBYPILOT BATTLE CARD</h2>
    ${sectionHtml('A', 'Final Recommendation', `
      <p class="risk-line">${escapeHtml(model.decision)}</p>
      <p>${escapeHtml(model.finalReason)}</p>
    `)}
    ${sectionHtml('B', 'Trip Risk Snapshot', `
      <div class="mini-grid">
        <div><strong>Risk color:</strong><br>${escapeHtml(scoreObj.level.label)}</div>
        <div><strong>Risk score:</strong><br>${scoreObj.score}/100</div>
        <div><strong>Confidence:</strong><br>${escapeHtml(model.confidence)}</div>
        <div><strong>Trip:</strong><br>${escapeHtml(data.tripName || 'Untitled trip')}</div>
      </div>
      <h4>Top risk drivers</h4>
      <ul>${toListHtml(model.riskDrivers)}</ul>
      <h4>Top risk reducers</h4>
      <ul>${toListHtml(model.riskReducers)}</ul>
    `)}
    ${sectionHtml('C', 'Primary Strategy', `
      <p><strong>Best route:</strong> ${escapeHtml(model.primary.title)}</p>
      <p><strong>Why this route:</strong> ${escapeHtml(model.primary.body)}</p>
      <p><strong>Main route risk:</strong> ${escapeHtml(model.mainRouteRisk)}</p>
      <p><strong>Best departure window:</strong> ${escapeHtml(model.bestDeparture)}</p>
    `)}
    ${sectionHtml('D', 'Backup Strategy', `
      <ul>
        <li><strong>Plan B:</strong> ${escapeHtml(model.planB)}</li>
        <li><strong>Plan C:</strong> ${escapeHtml(model.planC)}</li>
        <li><strong>Alternate airport:</strong> ${escapeHtml(model.alternateAirport)}</li>
        <li><strong>Split-party option:</strong> ${escapeHtml(model.splitParty)}</li>
        <li><strong>Overnight reset:</strong> ${escapeHtml(model.overnightReset)}</li>
      </ul>
    `)}
    ${sectionHtml('E', 'Switch Triggers', `<ul>${toListHtml(switchTriggers)}</ul>`)}
    ${sectionHtml('F', 'Baggage & Group Rules', `
      <ul>
        <li>${escapeHtml(model.baggageRule)}</li>
        <li>${escapeHtml(model.groupRule)}</li>
        <li>${escapeHtml(model.splitRule)}</li>
      </ul>
    `)}
    ${sectionHtml('G', 'Rescue Plan', `
      <p><strong>When to buy confirmed:</strong> ${escapeHtml(model.rescueTrigger)}</p>
      <p><strong>Best segment to buy:</strong> ${escapeHtml(model.buySegment)}</p>
      <p><strong>Budget note:</strong> ${escapeHtml(model.budgetNote)}</p>
    `)}
    ${sectionHtml('H', 'Airport Survival Notes', `
      <ul>
        <li><strong>Best airport to get stuck in:</strong> ${escapeHtml(model.survival.best)}</li>
        <li><strong>Worst airport to get stuck in:</strong> ${escapeHtml(model.survival.worst)}</li>
        <li><strong>Hotels/lounges/transport:</strong> ${escapeHtml(model.survival.notes)}</li>
      </ul>
    `)}
    ${sectionHtml('I', 'Document & International Notes', `<ul>${toListHtml(model.docs)}</ul>`)}
    ${sectionHtml('J', 'Bottom Line', `<p class="risk-line">${escapeHtml(model.bottomLine)}</p>`)}
  `;
}

function lineItems(label, items) {
  return [label, ...items.map((item) => `- ${item}`)];
}

function buildBattleCardText() {
  const data = getFormData();
  const scoreObj = state.currentScore || scoreTrip(data);
  const routes = state.currentRoutes.length ? state.currentRoutes : generateRoutes(data);
  const model = buildBattleCardModel(data, scoreObj, routes);
  const switchTriggers = [
    'Before leaving home: switch if Plan A no longer has same-day backup options or the rescue fare is still affordable.',
    `At origin airport: ${model.riskDrivers[0] || 'move when the standby list worsens faster than available seats improve.'}`,
    isInternational(data)
      ? 'At connection hub: protect the final leg; price the short-haul or final international segment as soon as it looks weak.'
      : 'At connection hub: choose the option with the most remaining same-day departures, not the nicest itinerary.',
    'After missing final leg: stop improvising, use the preselected overnight reset or buy the rescue segment.'
  ];

  return [
    'STANDBYPILOT BATTLE CARD',
    '',
    'A. Final Recommendation',
    `- Decision: ${model.decision}`,
    `- Reason: ${model.finalReason}`,
    '',
    'B. Trip Risk Snapshot',
    `- Risk color: ${scoreObj.level.label}`,
    `- Risk score: ${scoreObj.score}/100`,
    `- Confidence level: ${model.confidence}`,
    ...lineItems('- Top 3 risk drivers:', model.riskDrivers),
    ...lineItems('- Top 3 risk reducers:', model.riskReducers),
    '',
    'C. Primary Strategy',
    `- Best route or route family: ${model.primary.title}`,
    `- Why preferred: ${model.primary.body}`,
    `- Main route risk: ${model.mainRouteRisk}`,
    `- Best departure window: ${model.bestDeparture}`,
    '',
    'D. Backup Strategy',
    `- Plan B route: ${model.planB}`,
    `- Plan C route: ${model.planC}`,
    `- Alternate airport option: ${model.alternateAirport}`,
    `- Split-party option: ${model.splitParty}`,
    `- Overnight reset option: ${model.overnightReset}`,
    '',
    'E. Switch Triggers',
    ...switchTriggers.map((trigger) => `- ${trigger}`),
    '',
    'F. Baggage & Group Rules',
    `- ${model.baggageRule}`,
    `- ${model.groupRule}`,
    `- ${model.splitRule}`,
    '',
    'G. Rescue Plan',
    `- When to buy confirmed: ${model.rescueTrigger}`,
    `- Segment to buy: ${model.buySegment}`,
    `- Backup budget: ${model.budgetNote}`,
    '',
    'H. Airport Survival Notes',
    `- Best airport to get stuck in: ${model.survival.best}`,
    `- Worst airport to get stuck in: ${model.survival.worst}`,
    `- Hotel/lounges/ground transport: ${model.survival.notes}`,
    '',
    'I. Document & International Notes',
    ...model.docs.map((note) => `- ${note}`),
    '',
    'J. Bottom Line',
    `- ${model.bottomLine}`
  ].join('\n');
}

try {
  if (state.currentScore && document.getElementById('battleCard')) {
    const data = getFormData();
    const routes = state.currentRoutes.length ? state.currentRoutes : generateRoutes(data);
    document.getElementById('battleCard').innerHTML = buildBattleCardHtml(data, state.currentScore, routes);
  }
} catch (err) {
  console.warn('Could not refresh Battle Card report.', err);
}
