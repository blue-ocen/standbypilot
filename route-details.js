(function initRouteDetailsDrawers() {
  if (typeof buildRouteBriefModel !== 'function' || typeof renderMoreDetails !== 'function') return;

  function drawer(title, content) {
    return `<details class="detail-drawer"><summary>${escapeHtml(title)}</summary><div class="drawer-body">${content}</div></details>`;
  }

  function list(items, fallback) {
    const visible = items.filter(Boolean).slice(0, 3);
    if (!visible.length) return `<p>${escapeHtml(fallback)}</p>`;
    return `<ul>${visible.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
  }

  function nearbyDrawerContent(data) {
    const nearby = nearbyAlternatives(data);
    if (!nearby) return '<p>No nearby airport suggestions available yet.</p>';
    return `<p><strong>${escapeHtml(nearby.resultLabel)}:</strong> ${escapeHtml(nearby.alternatives.join(', '))}</p><p>Use only if ground transport still protects the arrival time.</p>`;
  }

  function connectionDrawerContent(data) {
    const scope = effectiveScope(data).value;
    const connectionLine = data.connections === 'yes'
      ? 'Connections allowed. Prefer hubs with multiple onward exits.'
      : 'Connections avoided. Favor earlier nonstop options and keep a same-day fallback.';
    const internationalLine = scope === 'international'
      ? '<p>International route: watch final-leg, border, and connection timing risk.</p>'
      : '';
    return `<p>${escapeHtml(connectionLine)}</p>${internationalLine}`;
  }

  function loadTrackingDrawerContent(data) {
    if (!hasLoadData(data)) {
      return '<p>No load tracking added. Results are based on route, timing, flexibility, and trip type.</p>';
    }
    const parts = [
      `Open seats: ${data.openSeats || 'not entered'}`,
      `Standby count: ${data.standbyCount || 'not entered'}`,
      `Cabin notes: ${data.cabinNotes || 'none'}`,
      `Last checked: ${data.lastChecked ? formatDateTime(data.lastChecked) : 'not entered'}`
    ];
    const notes = data.loadNotes ? `<p>${escapeHtml(data.loadNotes)}</p>` : '';
    return `<ul>${parts.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>${notes}`;
  }

  function paidRescueDrawerContent(data, scoreObj, routes) {
    const model = buildRouteBriefModel(data, scoreObj, routes);
    const preference = data.paidRescuePreference || document.getElementById('paidRescuePreference')?.value || 'smart';
    const label = preference === 'deadline' ? 'Only for deadline risk' : preference === 'off' ? 'Do not recommend paid tickets' : 'Recommend when smart';
    return `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(model.paidRescue || 'Paid rescue preference is available after generating a route.')}</p><p>No real prices are shown.</p>`;
  }

  function documentDrawerContent(data) {
    const scope = effectiveScope(data).value;
    if (scope === 'international') {
      return '<p>Verify passport, visa/transit rules, onward/return proof, and entry requirements before listing.</p>';
    }
    if (scope === 'domestic') return '<p>No international document reminder triggered.</p>';
    return '<p>Scope is unknown. Choose domestic or international for the right document reminder.</p>';
  }

  renderRouteBrief = function routeDetailsRenderRouteBrief(data, scoreObj, routes) {
    const model = buildRouteBriefModel(data, scoreObj, routes);
    $('routeBrief').className = 'route-brief';
    $('routeBrief').innerHTML = `
      <section><h3>Final Call</h3><p class="brief-call">${escapeHtml(model.finalCall)}</p></section>
      <section><h3>Risk Grade</h3><p><strong>${escapeHtml(model.riskGrade)}</strong> (${scoreObj.score}/100). ${escapeHtml(scoreObj.level.summary)}</p></section>
      <section><h3>Recommended Route</h3><p>${escapeHtml(model.recommended.title)}</p></section>
      <section><h3>Backup Routes</h3><ul>${model.backups.map((route) => `<li>${escapeHtml(route.title)}</li>`).join('')}</ul></section>
      <section><h3>Switch Trigger</h3><p>${escapeHtml(model.switchTrigger)}</p></section>
    `;
  };

  renderMoreDetails = function routeDetailsRenderMoreDetails(data, scoreObj, routes) {
    const scope = effectiveScope(data).value;
    $('moreDetails').innerHTML = `
      ${drawer('Risk factors', `
        <div class="details-grid drawer-grid">
          <div><h3>Top risk drivers</h3>${list(scoreObj.reasons, 'No major risk driver entered yet.')}</div>
          <div><h3>Top risk reducers</h3>${list(scoreObj.credits, 'Add flexibility or load tracking to improve confidence.')}</div>
        </div>
        <p>${escapeHtml(scoreObj.confidence)}</p>
      `)}
      ${drawer('Nearby airports', nearbyDrawerContent(data))}
      ${drawer('Connection risk', connectionDrawerContent(data))}
      ${drawer('Load tracking notes', loadTrackingDrawerContent(data))}
      ${drawer('Paid rescue logic', paidRescueDrawerContent(data, scoreObj, routes))}
      ${drawer('Airline rule reminders', '<p>Verify airline-specific non-rev, baggage, listing, and pass rider rules in your official airline tools.</p><p>Do not include restricted or private airline rules.</p>')}
      ${drawer('Travel document reminders', documentDrawerContent(data))}
    `;
    $('moreDetails')?.setAttribute('data-scope', scope);
  };

  const originalBuildRouteBriefText = buildRouteBriefText;
  buildRouteBriefText = function routeDetailsBuildRouteBriefText() {
    const data = getFormData();
    const scoreObj = state.currentScore || scoreTrip(data);
    const routes = state.currentRoutes.length ? state.currentRoutes : generateRoutes(data);
    const model = buildRouteBriefModel(data, scoreObj, routes);
    const paidRescue = model.paidRescue ? [`Paid Rescue: ${model.paidRescue}`, ''] : [];
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
      ...paidRescue,
      'Why this rating:',
      ...model.why.map((item) => `- ${item}`),
      '',
      model.confidence
    ].join('\n');
  };
}());
