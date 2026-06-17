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
  const travelers = asNumber(data.travelers, 1);
  const gapHours = travelWindowHours(data);
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
  const hasRoute = Boolean(data.origin && data.destination);
  const hasDates = Boolean(data.earliestDeparture && data.mustArriveBy);

  if (hasManualLoads && hasRoute && hasDates) return 'Medium-high. Recheck close to departure.';
  if (hasRoute && hasDates) return 'Medium. Add current loads before leaving.';
  if (scoreObj.score >= 61) return 'Low-medium. Missing details matter.';
  return 'Medium-low. Use as a planning pass.';
}

function finalReason(data, scoreObj, riskDrivers) {
  const travelers = asNumber(data.travelers, 1);
  const gapHours = travelWindowHours(data);
  const bits = [`${scoreObj.level.label} ${scoreObj.score}/100`];

  if (isInternational(data)) bits.push('international');
  if (isDeadlineSensitive(data)) bits.push('deadline');
  if (gapHours !== null && gapHours < 36) bits.push('tight buffer');
  if (travelers >= 3) bits.push(`group of ${travelers}`);
  if (data.bags === 'checked') bits.push('checked bags');
  if (riskDrivers[0]) bits.push(riskDrivers[0].replace(/\.$/, '').toLowerCase());

  return bits.join(', ') + '.';
}

function shortenRouteBody(text) {
  if (!text) return 'Use the route with the best load picture and the most same-day exits.';
  return text.split(/[.!?]/)[0].trim() + '.';
}

function alternateOption(data) {
  if (data.nearbyAirports === 'yes') return 'Use nearby airports or a stronger hub before Plan A traps you.';
  if (data.nearbyAirports === 'maybe') return 'Use a nearby airport only if ground transport still protects arrival.';
  return 'No useful nearby-airport fallback. Switch earlier.';
}

function paidRescueRule(data, scoreObj) {
  const budget = asNumber(data.backupBudget, 0);
  const text = destinationText(data);

  if (scoreObj.score >= 76) return 'Buy confirmed before departure if arrival matters.';
  if (isInternational(data) && /(portugal|lis|faro|fao|algarve|portim)/i.test(text)) return 'If Europe clears but Portugal tightens, buy the LIS/Faro final leg.';
  if (isInternational(data)) return 'Buy the final weak segment once the long-haul clears.';
  if (isDeadlineSensitive(data)) return 'Buy when Plan B no longer protects the deadline.';
  if (budget >= 500) return 'Use the backup budget before the last useful flight disappears.';
  return 'Switch early. Last-minute rescue fares may be too expensive.';
}

function baggageRule(data) {
  if (data.bags === 'checked') return 'Do not check bags unless the route is stable. Checked bags kill reroutes.';
  if (data.bags === 'mixed') return 'Resolve bags before leaving. Mixed bags slow every switch.';
  return 'Carry-on only. Keep it that way.';
}

function groupRule(data) {
  const travelers = asNumber(data.travelers, 1);
  if (travelers < 2) return 'Solo traveler. Take the first workable seat.';
  if (data.splitGroup === 'yes') return `Party of ${travelers}. Split if seats open unevenly.`;
  if (data.splitGroup === 'maybe') return `Party of ${travelers}. Decide split rules before leaving.`;
  return `Party of ${travelers}. No split means higher risk.`;
}

function deadlineRule(data) {
  const gapHours = travelWindowHours(data);
  if (isDeadlineSensitive(data) && gapHours !== null && gapHours < 36) return 'Hard deadline. Leave earlier or set a paid fallback now.';
  if (isDeadlineSensitive(data)) return 'Deadline trip. Keep one full backup path alive.';
  if (gapHours !== null && gapHours < 24) return 'Short buffer. Do not wait for a perfect Plan A.';
  return 'Keep a buffer. Do not burn the last useful option.';
}

function documentRule(data) {
  if (!isInternational(data)) return null;
  return 'Verify passport, visa/transit rules, onward/return proof, and entry requirements before listing.';
}

function switchTriggers(data, scoreObj, model) {
  const triggers = [];
  triggers.push('Switch if Plan A loses same-day backup options.');

  if (asNumber(data.travelers, 1) >= 3) triggers.push('Split or reroute if seats are fewer than the party plus buffer.');
  if (isInternational(data)) triggers.push('Buy or reroute if the final leg starts looking weak.');
  else triggers.push('Move earlier if the last useful nonstop starts filling.');

  if (scoreObj.score >= 61 || isDeadlineSensitive(data)) triggers.push('Buy confirmed when Plan B no longer protects arrival.');
  else triggers.push('Buy confirmed when delay cost beats the fare.');

  triggers.push(`Do not wait past the point where ${model.planB} is still usable.`);
  return triggers.slice(0, 4);
}

function bottomLine(data, scoreObj, decision) {
  if (decision === 'Do not non-rev') return 'Do not make this trip depend on standby.';
  if (decision === 'Buy confirmed') return 'Buy the fallback before the airport makes the decision for you.';
  if (decision === 'Switch route') return 'Move to the stronger route before Plan A collapses.';
  if (decision === 'Go early') return 'Go early, stay flexible, and be ready to split or buy the final leg.';
  if (decision === 'Monitor') return 'Monitor closely and switch before the last useful option disappears.';
  if (isInternational(data)) return 'Go only with documents checked and the final-leg backup ready.';
  return 'Go, keep it carry-on, and keep a backup warm.';
}

function sectionHtml(number, title, body) {
  return `<section class="report-section"><h3>${number}. ${title}</h3>${body}</section>`;
}

function buildBattleCardModel(data, scoreObj, routes) {
  const riskDrivers = topItems(scoreObj.reasons, 'No major risk drivers entered yet.');
  const riskReducers = topItems(scoreObj.credits, 'No major risk reducers entered yet.');
  const decision = decisionLabel(scoreObj, data);
  const primary = routes[0] || {
    title: `${data.origin || 'Origin'} to ${data.destination || 'destination'}`,
    body: 'Use the strongest available route with same-day backups.'
  };
  const planB = routes[1]?.title || 'Hub reroute with the most onward departures';
  const planC = routes[2]?.title || 'Nearby airport or confirmed rescue fare';

  const model = {
    decision,
    reason: finalReason(data, scoreObj, riskDrivers),
    confidence: confidenceLevel(data, scoreObj),
    riskDrivers,
    riskReducers,
    primary,
    primaryWhy: shortenRouteBody(primary.body),
    planB,
    planC,
    alternate: alternateOption(data),
    rescue: paidRescueRule(data, scoreObj),
    baggage: baggageRule(data),
    group: groupRule(data),
    deadline: deadlineRule(data),
    docs: documentRule(data)
  };

  model.triggers = switchTriggers(data, scoreObj, model);
  model.bottomLine = bottomLine(data, scoreObj, decision);
  return model;
}

function buildBattleCardHtml(data, scoreObj, routes) {
  const model = buildBattleCardModel(data, scoreObj, routes);
  const travelRules = [model.baggage, model.group, model.deadline, model.docs].filter(Boolean);

  return `
    <h2>STANDBYPILOT BATTLE CARD</h2>
    ${sectionHtml('1', 'Final Call', `
      <p class="risk-line">${escapeHtml(model.decision)}</p>
      <p>${escapeHtml(model.reason)}</p>
    `)}
    ${sectionHtml('2', 'Risk Snapshot', `
      <div class="mini-grid">
        <div><strong>Risk:</strong><br>${escapeHtml(scoreObj.level.label)} / ${scoreObj.score}</div>
        <div><strong>Confidence:</strong><br>${escapeHtml(model.confidence)}</div>
      </div>
      <h4>Top risk drivers</h4>
      <ul>${toListHtml(model.riskDrivers)}</ul>
      <h4>Top risk reducers</h4>
      <ul>${toListHtml(model.riskReducers)}</ul>
    `)}
    ${sectionHtml('3', 'Best Plan', `
      <p><strong>${escapeHtml(model.primary.title)}</strong></p>
      <p>${escapeHtml(model.primaryWhy)}</p>
    `)}
    ${sectionHtml('4', 'Backup Moves', `
      <ul>
        <li><strong>Plan B:</strong> ${escapeHtml(model.planB)}</li>
        <li><strong>Plan C:</strong> ${escapeHtml(model.planC)}</li>
        <li><strong>Alt airport/hub:</strong> ${escapeHtml(model.alternate)}</li>
        <li><strong>Paid rescue:</strong> ${escapeHtml(model.rescue)}</li>
      </ul>
    `)}
    ${sectionHtml('5', 'Switch Triggers', `<ul>${toListHtml(model.triggers)}</ul>`)}
    ${sectionHtml('6', 'Travel Rules', `<ul>${toListHtml(travelRules)}</ul>`)}
    ${sectionHtml('7', 'Bottom Line', `<p class="risk-line">${escapeHtml(model.bottomLine)}</p>`)}
  `;
}

function labeledItems(label, items) {
  return [label, ...items.map((item) => `- ${item}`)];
}

function buildBattleCardText() {
  const data = getFormData();
  const scoreObj = state.currentScore || scoreTrip(data);
  const routes = state.currentRoutes.length ? state.currentRoutes : generateRoutes(data);
  const model = buildBattleCardModel(data, scoreObj, routes);
  const travelRules = [model.baggage, model.group, model.deadline, model.docs].filter(Boolean);

  return [
    'STANDBYPILOT BATTLE CARD',
    '',
    '1. Final Call',
    `- ${model.decision}`,
    `- ${model.reason}`,
    '',
    '2. Risk Snapshot',
    `- Risk: ${scoreObj.level.label} / ${scoreObj.score}`,
    `- Confidence: ${model.confidence}`,
    ...labeledItems('- Top 3 risk drivers:', model.riskDrivers),
    ...labeledItems('- Top 3 risk reducers:', model.riskReducers),
    '',
    '3. Best Plan',
    `- ${model.primary.title}`,
    `- ${model.primaryWhy}`,
    '',
    '4. Backup Moves',
    `- Plan B: ${model.planB}`,
    `- Plan C: ${model.planC}`,
    `- Alt airport/hub: ${model.alternate}`,
    `- Paid rescue: ${model.rescue}`,
    '',
    '5. Switch Triggers',
    ...model.triggers.map((trigger) => `- ${trigger}`),
    '',
    '6. Travel Rules',
    ...travelRules.map((rule) => `- ${rule}`),
    '',
    '7. Bottom Line',
    `- ${model.bottomLine}`
  ].join('\n');
}

function portugalSampleCardInputs() {
  return {
    tripName: 'Portugal / Algarve Summer Trip',
    travelerName: 'Robert',
    origin: 'SEA',
    destination: 'LIS / Faro / Portugal',
    finalDestination: 'Portimao / Praia da Rocha',
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
    loadNotes: 'Summer Europe final-leg risk. Check loads manually and do not depend on one SEA-Europe option.',
    notes: 'Algarve trip. Faro is ideal; Lisbon is acceptable with ground transfer. Leave early and stay carry-on only.'
  };
}

function installPortugalSampleFix() {
  const button = document.getElementById('loadPortugal');
  if (!button || button.dataset.sampleFix === 'true') return;
  button.dataset.sampleFix = 'true';
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    state.activeTripId = null;
    setFormData(portugalSampleCardInputs());
    upsertTrip(getFormData());
  }, true);
}

function choiceLabel(value, labels) {
  return labels[value] || value || 'Not specified';
}

function bagLabel(value) {
  return choiceLabel(value, {
    'carry-on': 'Carry-on only',
    mixed: 'Mixed / unsure',
    checked: 'Checked bag'
  });
}

function scopeLabel(value) {
  return value === 'international' ? 'International' : 'Domestic';
}

function priorityLabel(value) {
  return choiceLabel(value, {
    'highest-arrival-chance': 'Highest chance of arriving',
    'lowest-cost': 'Lowest cost',
    'fewest-connections': 'Fewest connections',
    comfort: 'Best comfort',
    fastest: 'Fastest trip'
  });
}

function setText(id, value) {
  const node = document.getElementById(id);
  if (node) node.textContent = value;
}

function updateTripSummary(data, scoreObj, model) {
  if (!document.getElementById('tripSummary')) return;
  setText('summaryOrigin', (data.origin || 'Origin').toUpperCase());
  setText('summaryDestination', data.destination || 'Destination');
  setText('summaryTripName', data.tripName || 'Untitled trip');
  setText('summaryScore', scoreObj ? String(scoreObj.score) : '—');
  setText('summaryFinalCall', model?.decision || 'Generate a plan');
  setText('summaryTravelers', data.travelers || '1');
  setText('summaryBags', bagLabel(data.bags));
  setText('summaryScope', scopeLabel(data.scope));
  setText('summaryGoal', priorityLabel(data.priority));

  const badge = document.getElementById('summaryRiskBadge');
  if (badge && scoreObj) {
    badge.textContent = scoreObj.level.label;
    badge.className = `risk-badge ${scoreObj.level.className}`;
  } else if (badge) {
    badge.textContent = 'Unscored';
    badge.className = 'risk-badge yellow';
  }
}

function resetTripSummary() {
  updateTripSummary(emptyTrip(), null, null);
  setText('summaryTripName', 'Draft Battle Plan');
}

function routeCardKind(route, index) {
  const title = route?.title || '';
  if (/paid rescue|buy|confirmed/i.test(title)) return ['Paid rescue', 'route-card-rescue'];
  if (index === 0) return ['Recommended Route', 'route-card-recommended'];
  if (index === 1) return ['Plan B', 'route-card-plan-b'];
  if (index === 2) return ['Plan C', 'route-card-plan-c'];
  return ['Alternate airport', 'route-card-alt'];
}

function enhanceRouteCards(routes) {
  document.querySelectorAll('#routeStrategy .route-card').forEach((card, index) => {
    const [label, className] = routeCardKind(routes[index], index);
    card.classList.add(className);
    if (!card.querySelector('.route-label')) {
      card.insertAdjacentHTML('afterbegin', `<span class="route-label">${escapeHtml(label)}</span>`);
    }
  });
}

function nearbyAirportDetail(data, model) {
  if (data.nearbyAirports === 'yes') return `Nearby-airport flexibility is a reducer. ${model.alternate}`;
  if (data.nearbyAirports === 'maybe') return `Nearby airports are conditional. ${model.alternate}`;
  return `Nearby airports are not available, so switch routes earlier. ${model.alternate}`;
}

function connectionDetail(data) {
  if (data.connections === 'yes') return 'Connections are allowed. Prefer hubs with multiple same-day onward exits.';
  if (data.connections === 'maybe') return 'Connections are possible, but use them only when they protect the arrival deadline.';
  return 'Connections are off the table. That makes the direct route and last useful nonstop more important.';
}

function airlineRuleDetail(data) {
  const passSystem = data.passSystem || 'No pass system entered.';
  const passPriority = data.passPriority || 'No pass priority entered.';
  return `${passSystem} ${passPriority} Confirm listing windows, priority, baggage, and partner rules manually before relying on the plan.`;
}

function documentDetail(data, model) {
  if (model.docs) return model.docs;
  return 'Domestic trip: verify ID requirements, airport cutoff times, and airline standby procedures before leaving.';
}

function renderMoreDetails(data, scoreObj, routes, model) {
  const container = document.getElementById('moreDetails');
  if (!container) return;
  const planB = routes[1]?.title || model.planB;
  const planC = routes[2]?.title || model.planC;
  container.innerHTML = `
    <details>
      <summary>Risk factors</summary>
      <div class="details-grid">
        <div><h3>Drivers</h3><ul>${toListHtml(model.riskDrivers)}</ul></div>
        <div><h3>Reducers</h3><ul>${toListHtml(model.riskReducers)}</ul></div>
      </div>
    </details>
    <details>
      <summary>Nearby airports</summary>
      <p>${escapeHtml(nearbyAirportDetail(data, model))}</p>
    </details>
    <details>
      <summary>Connection risk</summary>
      <p>${escapeHtml(connectionDetail(data))}</p>
      <p><strong>Backup route family:</strong> ${escapeHtml(planB)} / ${escapeHtml(planC)}</p>
    </details>
    <details>
      <summary>Paid rescue logic</summary>
      <p>${escapeHtml(model.rescue)}</p>
      <p><strong>Backup budget:</strong> $${escapeHtml(data.backupBudget || '0')}</p>
    </details>
    <details>
      <summary>Airline rule notes</summary>
      <p>${escapeHtml(airlineRuleDetail(data))}</p>
    </details>
    <details>
      <summary>Travel document reminders</summary>
      <p>${escapeHtml(documentDetail(data, model))}</p>
    </details>
  `;
}

function resetMoreDetails() {
  const container = document.getElementById('moreDetails');
  if (!container) return;
  container.innerHTML = `
    <details><summary>Risk factors</summary><p>Generate a Battle Plan to see trip-specific risk factors.</p></details>
    <details><summary>Nearby airports</summary><p>Generate a Battle Plan to see alternate-airport guidance.</p></details>
    <details><summary>Connection risk</summary><p>Generate a Battle Plan to see connection-risk notes.</p></details>
    <details><summary>Paid rescue logic</summary><p>Generate a Battle Plan to see paid rescue guidance.</p></details>
    <details><summary>Airline rule notes</summary><p>Generate a Battle Plan to see pass-system notes.</p></details>
    <details><summary>Travel document reminders</summary><p>Generate a Battle Plan to see document reminders.</p></details>
  `;
}

function installAppUiPolish() {
  if (typeof renderPlan !== 'function' || renderPlan.uiPolishWrapped) return;
  const baseRenderPlan = renderPlan;
  renderPlan = function renderPlanWithUiPolish(data, scoreObj, routes) {
    baseRenderPlan(data, scoreObj, routes);
    const model = buildBattleCardModel(data, scoreObj, routes);
    updateTripSummary(data, scoreObj, model);
    enhanceRouteCards(routes);
    renderMoreDetails(data, scoreObj, routes, model);
  };
  renderPlan.uiPolishWrapped = true;

  document.getElementById('newTrip')?.addEventListener('click', () => {
    window.setTimeout(() => {
      resetTripSummary();
      resetMoreDetails();
    }, 0);
  });
}

installPortugalSampleFix();
installAppUiPolish();

try {
  if (state.currentScore && document.getElementById('battleCard')) {
    const data = getFormData();
    const routes = state.currentRoutes.length ? state.currentRoutes : generateRoutes(data);
    const model = buildBattleCardModel(data, state.currentScore, routes);
    document.getElementById('battleCard').innerHTML = buildBattleCardHtml(data, state.currentScore, routes);
    updateTripSummary(data, state.currentScore, model);
    enhanceRouteCards(routes);
    renderMoreDetails(data, state.currentScore, routes, model);
  } else {
    resetTripSummary();
    resetMoreDetails();
  }
} catch (err) {
  console.warn('Could not refresh Battle Card report.', err);
}
