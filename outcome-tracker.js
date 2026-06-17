(function initTripOutcomeTracker() {
  if (typeof state === 'undefined' || typeof persistState !== 'function') return;

  const outcomeFields = [
    'outcomeCleared',
    'outcomeTookRecommended',
    'outcomeSwitchedBackup',
    'outcomeBoughtConfirmed',
    'outcomeOvernighted',
    'outcomeArrivalStatus',
    'outcomeFinalRoute',
    'outcomeNotes',
    'outcomeRiskAccuracy',
    'outcomeUsefulness'
  ];

  const labels = {
    yes: 'Yes',
    no: 'No',
    partially: 'Partially',
    'on-time': 'On time',
    late: 'Late',
    'missed-deadline': 'Missed deadline',
    'too-low': 'Too low',
    'about-right': 'About right',
    'too-high': 'Too high'
  };

  let selectedOutcomeTripId = state.activeTripId || state.trips[0]?.id || '';

  function label(value, fallback = 'Not recorded') {
    return labels[value] || value || fallback;
  }

  function selectedTrip() {
    return state.trips.find((trip) => trip.id === selectedOutcomeTripId) || null;
  }

  function isCompletedOutcome(outcome) {
    return Boolean(outcome && (outcome.updatedAt || outcome.cleared || outcome.arrivalStatus || outcome.riskAccuracy || outcome.usefulness));
  }

  function readOutcomeForm() {
    return {
      cleared: $('outcomeCleared')?.value || '',
      tookRecommended: $('outcomeTookRecommended')?.value || '',
      switchedBackup: $('outcomeSwitchedBackup')?.value || '',
      boughtConfirmed: $('outcomeBoughtConfirmed')?.value || '',
      overnighted: $('outcomeOvernighted')?.value || '',
      arrivalStatus: $('outcomeArrivalStatus')?.value || '',
      finalRoute: $('outcomeFinalRoute')?.value.trim() || '',
      notes: $('outcomeNotes')?.value.trim() || '',
      riskAccuracy: $('outcomeRiskAccuracy')?.value || '',
      usefulness: $('outcomeUsefulness')?.value || '',
      updatedAt: nowIso()
    };
  }

  function writeOutcomeForm(outcome = {}) {
    $('outcomeCleared').value = outcome.cleared || '';
    $('outcomeTookRecommended').value = outcome.tookRecommended || '';
    $('outcomeSwitchedBackup').value = outcome.switchedBackup || '';
    $('outcomeBoughtConfirmed').value = outcome.boughtConfirmed || '';
    $('outcomeOvernighted').value = outcome.overnighted || '';
    $('outcomeArrivalStatus').value = outcome.arrivalStatus || '';
    $('outcomeFinalRoute').value = outcome.finalRoute || '';
    $('outcomeNotes').value = outcome.notes || '';
    $('outcomeRiskAccuracy').value = outcome.riskAccuracy || '';
    $('outcomeUsefulness').value = outcome.usefulness || '';
    $('outcomeSaveStatus').textContent = outcome.updatedAt ? 'Outcome saved' : 'No outcome saved';
  }

  function setOutcomeFormDisabled(disabled) {
    $('outcomeForm')?.querySelectorAll('input, select, textarea, button').forEach((field) => {
      field.disabled = disabled;
    });
  }

  function outcomeHeadline(trip) {
    const outcome = trip.outcome || {};
    const cleared = label(outcome.cleared);
    const arrival = label(outcome.arrivalStatus);
    return `${cleared} / ${arrival}`;
  }

  function renderOutcomeInsights(completedTrips) {
    const usefulnessScores = completedTrips
      .map((trip) => Number(trip.outcome?.usefulness))
      .filter((score) => Number.isFinite(score));
    const average = usefulnessScores.length
      ? (usefulnessScores.reduce((sum, score) => sum + score, 0) / usefulnessScores.length).toFixed(1)
      : '-';
    const counts = completedTrips.reduce((acc, trip) => {
      const value = trip.outcome?.riskAccuracy || 'unrecorded';
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});

    $('outcomeInsights').className = 'outcome-insights';
    $('outcomeInsights').innerHTML = `
      <div><span>Average usefulness</span><strong>${escapeHtml(average)}</strong></div>
      <div><span>Completed outcomes</span><strong>${completedTrips.length}</strong></div>
      <div><span>Risk too low</span><strong>${counts['too-low'] || 0}</strong></div>
      <div><span>About right</span><strong>${counts['about-right'] || 0}</strong></div>
      <div><span>Risk too high</span><strong>${counts['too-high'] || 0}</strong></div>
    `;
  }

  function renderOutcomeCards(completedTrips) {
    const container = $('outcomeSummaryCards');
    if (!completedTrips.length) {
      container.className = 'outcome-summary-list empty-state';
      container.textContent = 'No completed outcomes yet.';
      return;
    }
    container.className = 'outcome-summary-list';
    container.innerHTML = completedTrips.map((trip) => {
      const outcome = trip.outcome || {};
      return `<article class="outcome-summary-card">
        <span class="route-label">Outcome</span>
        <h3>${escapeHtml(trip.tripName || `${trip.origin || 'Origin'} to ${trip.destination || 'Destination'}`)}</h3>
        <dl>
          <div><dt>Original risk</dt><dd>${escapeHtml(trip.riskLabel || '-')}</dd></div>
          <div><dt>Outcome</dt><dd>${escapeHtml(outcomeHeadline(trip))}</dd></div>
          <div><dt>Risk accuracy</dt><dd>${escapeHtml(label(outcome.riskAccuracy))}</dd></div>
          <div><dt>Usefulness</dt><dd>${escapeHtml(outcome.usefulness || '-')} / 5</dd></div>
        </dl>
      </article>`;
    }).join('');
  }

  function renderOutcomeTracker() {
    const select = $('outcomeTripSelect');
    if (!select) return;
    const hasTrips = state.trips.length > 0;
    if (!hasTrips) {
      selectedOutcomeTripId = '';
      select.innerHTML = '<option value="">Save a route first</option>';
      setOutcomeFormDisabled(true);
      writeOutcomeForm({});
      renderOutcomeInsights([]);
      renderOutcomeCards([]);
      return;
    }

    if (!state.trips.some((trip) => trip.id === selectedOutcomeTripId)) {
      selectedOutcomeTripId = state.activeTripId || state.trips[0].id;
    }

    select.innerHTML = state.trips.map((trip) => `
      <option value="${escapeHtml(trip.id)}">${escapeHtml(trip.tripName || `${trip.origin || 'Origin'} to ${trip.destination || 'Destination'}`)}</option>
    `).join('');
    select.value = selectedOutcomeTripId;
    setOutcomeFormDisabled(false);
    writeOutcomeForm(selectedTrip()?.outcome || {});

    const completedTrips = state.trips.filter((trip) => isCompletedOutcome(trip.outcome));
    renderOutcomeInsights(completedTrips);
    renderOutcomeCards(completedTrips);
  }

  function saveOutcome(event) {
    event.preventDefault();
    const trip = selectedTrip();
    if (!trip) return;
    trip.outcome = readOutcomeForm();
    trip.updatedAt = nowIso();
    persistState();
    $('outcomeSaveStatus').textContent = 'Outcome saved';
  }

  function exportTripsWithOutcomes() {
    const blob = new Blob([JSON.stringify({ version: 4, exportedAt: nowIso(), trips: state.trips }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `standbypilot-routes-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const originalPersistState = persistState;
  persistState = function outcomePersistState() {
    originalPersistState();
    renderOutcomeTracker();
  };

  const originalOpenTrip = openTrip;
  openTrip = function outcomeOpenTrip(id) {
    originalOpenTrip(id);
    selectedOutcomeTripId = id;
    renderOutcomeTracker();
  };

  exportTrips = exportTripsWithOutcomes;

  $('exportTrips')?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    exportTripsWithOutcomes();
  }, true);
  $('outcomeTripSelect')?.addEventListener('change', (event) => {
    selectedOutcomeTripId = event.target.value;
    renderOutcomeTracker();
  });
  $('outcomeForm')?.addEventListener('submit', saveOutcome);

  renderOutcomeTracker();
}());
