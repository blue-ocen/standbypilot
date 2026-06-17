(function initPaidRescuePreference() {
  if (typeof getFormData !== 'function' || typeof scoreTrip !== 'function') return;

  const PAID_RESCUE_DEFAULT = 'smart';
  const PAID_RESCUE_SMART_ADVICE = 'Use non-rev for the expensive leg. Be willing to buy the final short segment if Plan A weakens.';
  const PAID_RESCUE_DEADLINE_ADVICE = 'Because this trip has a deadline, set a clear buy-confirmed trigger.';
  const PAID_RESCUE_OFF_ADVICE = 'Paid rescue is off. Reduce risk by leaving earlier, using alternate airports, and avoiding last-flight dependencies.';

  const paidRescueSamples = [
    {
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
      paidRescuePreference: 'smart',
      notes: 'Algarve destination. Lisbon is acceptable with ground transfer; Faro is ideal.',
      openSeats: '',
      standbyCount: '',
      cabinNotes: '',
      lastChecked: '',
      loadNotes: 'Summer Europe final-leg risk. Add current load notes close to departure.'
    },
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
      paidRescuePreference: 'off',
      notes: 'NYC airport flexibility is acceptable if ground timing works.',
      openSeats: '',
      standbyCount: '',
      cabinNotes: '',
      lastChecked: '',
      loadNotes: ''
    },
    {
      tripName: 'Cruise deadline route',
      origin: 'SEA',
      destination: 'MIA / cruise port',
      earliestDeparture: '2026-07-20T12:00',
      mustArriveBy: '2026-07-21T12:00',
      tripDirection: 'one-way',
      tripType: 'event',
      connections: 'yes',
      scope: 'auto',
      nearbyAirports: 'yes',
      returnDate: '',
      priority: 'highest-arrival-chance',
      paidRescuePreference: 'deadline',
      notes: 'Cruise departure. Build a clear fallback trigger before the final useful bank closes.',
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
      paidRescuePreference: 'smart',
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
      paidRescuePreference: 'deadline',
      notes: 'Holiday return window. Use multiple transatlantic gateways.',
      openSeats: '',
      standbyCount: '',
      cabinNotes: '',
      lastChecked: '',
      loadNotes: ''
    }
  ];

  function selectedPaidRescuePreference(data) {
    return data?.paidRescuePreference || document.getElementById('paidRescuePreference')?.value || PAID_RESCUE_DEFAULT;
  }

  function paidRescueLabel(value) {
    if (value === 'deadline') return 'Deadline only';
    if (value === 'off') return 'Off';
    return 'When smart';
  }

  function isDeadlineSensitiveTrip(data) {
    const gapHours = typeof hoursBetween === 'function' ? hoursBetween(data.earliestDeparture, data.mustArriveBy) : null;
    const text = `${data.tripName || ''} ${data.tripType || ''} ${data.notes || ''}`.toLowerCase();
    return ['event', 'work', 'family'].includes(data.tripType)
      || (gapHours !== null && gapHours <= 24)
      || /wedding|cruise|deadline|event|work/.test(text);
  }

  function paidRescueCanSuggest(data, scoreObj) {
    const preference = selectedPaidRescuePreference(data);
    if (preference === 'off') return false;
    if (preference === 'deadline') return isDeadlineSensitiveTrip(data);
    return ['yellow', 'orange', 'red'].includes(scoreObj.level.className);
  }

  function paidRescueAdvice(data, scoreObj) {
    const preference = selectedPaidRescuePreference(data);
    if (preference === 'off') return PAID_RESCUE_OFF_ADVICE;
    if (preference === 'deadline') {
      return isDeadlineSensitiveTrip(data)
        ? PAID_RESCUE_DEADLINE_ADVICE
        : 'Paid rescue is reserved for deadline risk on this trip.';
    }
    return paidRescueCanSuggest(data, scoreObj)
      ? PAID_RESCUE_SMART_ADVICE
      : 'Paid rescue is optional. Keep monitoring before spending money.';
  }

  function normalizeRouteForPaidRescue(route, data) {
    if (selectedPaidRescuePreference(data) !== 'off') return route;
    let title = route.title;
    let body = route.body;
    if (/buy final gateway-to-nbo leg/i.test(title)) {
      title = 'Alternate gateway reset';
      body = 'Use another gateway or leave earlier if the final long-haul segment becomes the blocker.';
    } else if (/confirmed positioning or overnight reset/i.test(title)) {
      title = 'Earlier departure or overnight reset';
      body = 'Last-resort reset when holiday loads remove same-day options.';
    } else if (/nearby airport or confirmed rescue/i.test(title)) {
      title = 'Nearby airport or earlier departure';
      body = 'Use when the direct path no longer protects the deadline.';
    }
    return { ...route, title, body };
  }

  function setPaidRescueSummary(data) {
    if (typeof setText === 'function') {
      setText('summaryPaidRescue', paidRescueLabel(selectedPaidRescuePreference(data)));
    }
  }

  const originalEmptyTrip = emptyTrip;
  emptyTrip = function paidRescueEmptyTrip() {
    return { ...originalEmptyTrip(), paidRescuePreference: PAID_RESCUE_DEFAULT };
  };

  const originalGetFormData = getFormData;
  getFormData = function paidRescueGetFormData() {
    const data = originalGetFormData();
    data.paidRescuePreference = selectedPaidRescuePreference(data);
    return data;
  };

  const originalSetFormData = setFormData;
  setFormData = function paidRescueSetFormData(data = {}) {
    originalSetFormData(data);
    const select = document.getElementById('paidRescuePreference');
    if (select) select.value = data.paidRescuePreference || PAID_RESCUE_DEFAULT;
    setPaidRescueSummary(getFormData());
  };

  const originalScoreTrip = scoreTrip;
  scoreTrip = function paidRescueScoreTrip(data) {
    const normalized = { ...data, paidRescuePreference: selectedPaidRescuePreference(data) };
    const result = originalScoreTrip(normalized);
    if (normalized.paidRescuePreference === 'off') {
      result.reasons = ['Paid rescue declined.', ...result.reasons.filter((item) => item !== 'Paid rescue declined.')];
    } else {
      result.credits = ['Paid fallback allowed.', ...result.credits.filter((item) => item !== 'Paid fallback allowed.')];
    }
    if (result.level.grade === 'D' && !paidRescueCanSuggest(normalized, result)) {
      result.finalCall = 'Switch route early';
    }
    return result;
  };

  const originalGenerateRoutes = generateRoutes;
  generateRoutes = function paidRescueGenerateRoutes(data) {
    return originalGenerateRoutes(data).map((route) => normalizeRouteForPaidRescue(route, data));
  };

  const originalSwitchTrigger = switchTrigger;
  switchTrigger = function paidRescueSwitchTrigger(data, scoreObj, routes) {
    if (scoreObj.score >= 66 && !paidRescueCanSuggest(data, scoreObj)) {
      return 'Switch routes before Plan B no longer protects the must-arrive time.';
    }
    return originalSwitchTrigger(data, scoreObj, routes);
  };

  const originalBuildRouteBriefModel = buildRouteBriefModel;
  buildRouteBriefModel = function paidRescueBuildRouteBriefModel(data, scoreObj, routes) {
    return {
      ...originalBuildRouteBriefModel(data, scoreObj, routes),
      paidRescue: paidRescueAdvice(data, scoreObj)
    };
  };

  renderRouteBrief = function paidRescueRenderRouteBrief(data, scoreObj, routes) {
    const model = buildRouteBriefModel(data, scoreObj, routes);
    $('routeBrief').className = 'route-brief';
    $('routeBrief').innerHTML = `
      <section><h3>Final Call</h3><p class="brief-call">${escapeHtml(model.finalCall)}</p></section>
      <section><h3>Risk Grade</h3><p><strong>${escapeHtml(model.riskGrade)}</strong> (${scoreObj.score}/100). ${escapeHtml(scoreObj.level.summary)}</p></section>
      <section><h3>Recommended Route</h3><p>${escapeHtml(model.recommended.title)}</p></section>
      <section><h3>Backup Routes</h3><ul>${model.backups.map((route) => `<li>${escapeHtml(route.title)}</li>`).join('')}</ul></section>
      <section><h3>Switch Trigger</h3><p>${escapeHtml(model.switchTrigger)}</p></section>
      <section><h3>Paid Rescue</h3><p>${escapeHtml(model.paidRescue)}</p></section>
      <section><h3>Why This Rating</h3><ul>${model.why.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></section>
      <section><h3>More Details</h3><p>${escapeHtml(model.confidence)}</p></section>
    `;
  };

  const originalRenderMoreDetails = renderMoreDetails;
  renderMoreDetails = function paidRescueRenderMoreDetails(data, scoreObj, routes) {
    originalRenderMoreDetails(data, scoreObj, routes);
    const moreDetails = $('moreDetails');
    if (moreDetails) {
      moreDetails.insertAdjacentHTML('beforeend', `<p><strong>Paid rescue:</strong> ${escapeHtml(paidRescueAdvice(data, scoreObj))}</p>`);
    }
  };

  const originalUpdateTripSummary = updateTripSummary;
  updateTripSummary = function paidRescueUpdateTripSummary(data, scoreObj, routes) {
    originalUpdateTripSummary(data, scoreObj, routes);
    setPaidRescueSummary(data);
  };

  buildRouteBriefText = function paidRescueBuildRouteBriefText() {
    const data = getFormData();
    const scoreObj = (typeof state !== 'undefined' && state.currentScore) || scoreTrip(data);
    const routes = (typeof state !== 'undefined' && state.currentRoutes.length) ? state.currentRoutes : generateRoutes(data);
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
      `Paid Rescue: ${model.paidRescue}`,
      '',
      'Why this rating:',
      ...model.why.map((item) => `- ${item}`),
      '',
      model.confidence
    ].join('\n');
  };

  function saveSamplesToState(samples) {
    const created = samples.map((sample) => {
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
  }

  document.getElementById('paidRescuePreference')?.addEventListener('input', () => {
    $('saveStatus').textContent = state.activeTripId ? 'Unsaved changes' : 'Unsaved';
    updateTripSummary(getFormData(), state.currentScore, state.currentRoutes);
  });

  document.getElementById('loadPortugal')?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    state.activeTripId = null;
    setFormData(paidRescueSamples[0]);
    upsertTrip(getFormData());
  }, true);

  document.getElementById('loadTestSuite')?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (state.trips.length && !window.confirm('Load the 5 simplified test routes? This adds them without deleting saved routes.')) return;
    saveSamplesToState(paidRescueSamples);
    $('saveStatus').textContent = '5 test routes loaded';
  }, true);

  setPaidRescueSummary(getFormData());
}());
