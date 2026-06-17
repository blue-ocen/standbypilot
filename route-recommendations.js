(function initRefinedRouteRecommendations() {
  if (typeof generateRoutes !== 'function' || typeof scoreTrip !== 'function') return;

  const KNOWN_DIRECT_PAIRS = new Set([
    'SEA-JFK', 'JFK-SEA',
    'SEA-EWR', 'EWR-SEA',
    'SEA-BOS', 'BOS-SEA',
    'SEA-MIA', 'MIA-SEA',
    'SEA-FLL', 'FLL-SEA',
    'SEA-LAX', 'LAX-SEA',
    'SEA-SFO', 'SFO-SEA',
    'SEA-LHR', 'LHR-SEA',
    'SFO-LIS', 'LIS-SFO',
    'JFK-LIS', 'LIS-JFK'
  ]);

  const deadlineTripTypes = ['event', 'work', 'family'];

  function airportCode(data, side) {
    const airport = airportFromData(data, side);
    return airport?.code || firstAirportCode(data[side]);
  }

  function endpointLabel(data, side) {
    const airport = airportFromData(data, side);
    if (airport?.code) return airport.code;
    return (data[side] || (side === 'origin' ? 'Origin' : 'Destination')).toUpperCase();
  }

  function destinationLabel(data) {
    const airport = airportFromData(data, 'destination');
    if (airport?.code) return airport.code;
    return data.destination || 'destination';
  }

  function routeText(data) {
    return normalizeText(`${data.origin} ${data.destination} ${data.tripName} ${data.notes}`);
  }

  function routeKind(data) {
    const text = routeText(data);
    if (/portugal|lis|faro|fao|opo|algarve/.test(text)) return 'portugal';
    if (/nairobi|nbo/.test(text)) return 'nairobi';
    if (/london|lhr|lgw/.test(text)) return 'london';
    if (/miami|fort lauderdale|mia|fll|cruise/.test(text)) return 'south-florida';
    if (/new york|nyc|jfk|ewr|lga/.test(text)) return 'nyc';
    if (/muc|vie|munich|vienna|christmas/.test(text)) return 'europe-return';
    return effectiveScope(data).value === 'international' ? 'international' : 'domestic';
  }

  function directRouteKnown(data) {
    const originCode = airportCode(data, 'origin');
    const destinationCode = airportCode(data, 'destination');
    if (!originCode || !destinationCode) return false;
    return KNOWN_DIRECT_PAIRS.has(`${originCode}-${destinationCode}`);
  }

  function routeMayNeedConnection(data) {
    return data.connections === 'no' && !directRouteKnown(data);
  }

  function arrivalGapHours(data) {
    return hoursBetween(data.earliestDeparture, data.mustArriveBy);
  }

  function isDeadlineSensitive(data) {
    const gapHours = arrivalGapHours(data);
    const text = routeText(data);
    return deadlineTripTypes.includes(data.tripType)
      || (gapHours !== null && gapHours <= 24)
      || /wedding|cruise|deadline|event|work/.test(text);
  }

  function isTightArrivalWindow(data) {
    const gapHours = arrivalGapHours(data);
    return gapHours !== null && gapHours <= 24;
  }

  function loadStatus(data) {
    const margin = loadMargin(data);
    if (margin === null) {
      return hasLoadData(data)
        ? { status: 'noted', sentence: 'Load notes are included; recheck close to departure.' }
        : { status: 'missing', sentence: 'No load notes yet; keep the route rating conservative.' };
    }
    if (margin >= 4) return { status: 'favorable', sentence: 'Load notes look favorable, but still recheck near departure.' };
    if (margin >= 1) return { status: 'workable', sentence: 'Load notes look playable with a backup ready.' };
    if (margin >= 0) return { status: 'thin', sentence: 'Load notes are thin; be ready to move early.' };
    return { status: 'pressured', sentence: 'Standby count is above open seats; treat Plan A as fragile.' };
  }

  function groupMatchesAirport(group, airport) {
    return Boolean(airport?.code && group.matchCodes.includes(airport.code));
  }

  function groupMatchesText(group, text) {
    return group.matchText.some((item) => text.includes(normalizeText(item)));
  }

  nearbyAlternatives = function refinedNearbyAlternatives(data) {
    const originAirport = airportFromData(data, 'origin');
    const destinationAirport = airportFromData(data, 'destination');
    const destinationText = normalizeText(`${data.destination} ${destinationAirport?.city || ''} ${destinationAirport?.country || ''} ${destinationAirport?.region || ''} ${data.notes || ''}`);
    const originText = normalizeText(`${data.origin} ${originAirport?.city || ''} ${originAirport?.country || ''} ${originAirport?.region || ''}`);
    const fullText = routeText(data);

    return NEARBY_GROUPS.find((group) => groupMatchesAirport(group, destinationAirport) || groupMatchesText(group, destinationText))
      || NEARBY_GROUPS.find((group) => groupMatchesAirport(group, originAirport) || groupMatchesText(group, originText))
      || NEARBY_GROUPS.find((group) => groupMatchesText(group, fullText))
      || null;
  };

  function conciseDeadlineBody(data, fallback) {
    if (isTightArrivalWindow(data)) return `${fallback} Tight arrival window: leave earlier and protect a same-day backup.`;
    if (isDeadlineSensitive(data)) return `${fallback} Deadline trip: keep the safer backup active.`;
    return fallback;
  }

  function preferredInternationalGateway(data) {
    const kind = routeKind(data);
    if (kind === 'nairobi') return 'AMS/CDG/FRA/DOH/IST';
    if (kind === 'portugal') return 'LHR/AMS/CDG/FRA';
    if (kind === 'london') return 'LHR/LGW plus AMS/CDG/DUB/FRA backup';
    return 'strongest long-haul gateway';
  }

  function paidRescuePreference(data) {
    return data.paidRescuePreference || document.getElementById('paidRescuePreference')?.value || 'smart';
  }

  function paidRescueAllowed(data, scoreObj) {
    const preference = paidRescuePreference(data);
    if (preference === 'off') return false;
    if (preference === 'deadline') return isDeadlineSensitive(data);
    return ['B', 'C', 'D'].includes(scoreObj?.level?.grade);
  }

  function paidRescueRoute(data, scoreObj) {
    if (!paidRescueAllowed(data, scoreObj)) return null;
    const body = paidRescuePreference(data) === 'deadline'
      ? 'Because this trip has a deadline, set a clear buy-confirmed trigger before the last useful backup closes.'
      : 'Use non-rev for the expensive leg. Be willing to buy the final short segment if Plan A weakens.';
    return {
      kind: 'rescue',
      title: 'Paid Rescue Note',
      body,
      ratingLabel: 'Last Resort',
      switch: 'Use only when standby routes stop protecting the arrival deadline.'
    };
  }

  const originalScoreTrip = scoreTrip;
  scoreTrip = function refinedScoreTrip(data) {
    const result = originalScoreTrip(data);
    const status = loadStatus(data);
    const addReason = (text) => {
      if (!result.reasons.includes(text)) result.reasons.unshift(text);
    };
    const addCredit = (text) => {
      if (!result.credits.includes(text)) result.credits.unshift(text);
    };

    if (routeMayNeedConnection(data)) {
      addReason('No-connection request may be unrealistic for this city pair.');
      result.score = Math.min(100, result.score + 8);
    }
    if (isTightArrivalWindow(data)) {
      addReason('Deadline window needs an earlier departure or stronger backup.');
    }
    if (effectiveScope(data).value === 'international' && ['portugal', 'nairobi'].includes(routeKind(data))) {
      addReason('International gateway and final-leg recovery matter.');
    }
    if (status.status === 'pressured') {
      addReason('Standby count is above open seats.');
      result.score = Math.min(100, result.score + 8);
    } else if (status.status === 'thin') {
      addReason('Load snapshot has almost no cushion.');
    } else if (status.status === 'favorable') {
      addCredit('Open seats comfortably exceed standby count.');
      result.score = Math.max(0, result.score - 4);
    }

    result.level = riskLevel(result.score);
    result.finalCall = finalCall(result.level, data);
    if (result.level.grade === 'D' && !paidRescueAllowed(data, result)) {
      result.finalCall = 'Switch route early';
    }
    return result;
  };

  function addAlternateRoute(data, routes) {
    const nearby = nearbyAlternatives(data);
    if (nearby && data.nearbyAirports !== 'no') {
      routes.push({
        kind: 'alternate',
        title: nearbyText(nearby),
        body: 'Good alternate airport play if ground transport still protects arrival.',
        ratingLabel: 'Good Alternate Airport Play'
      });
    }
  }

  generateRoutes = function refinedGenerateRoutes(data) {
    const origin = endpointLabel(data, 'origin');
    const dest = destinationLabel(data);
    const kind = routeKind(data);
    const scope = effectiveScope(data).value;
    const canConnect = data.connections === 'yes';
    const status = loadStatus(data);
    const scoreObj = scoreTrip(data);
    const routes = [];

    if (routeMayNeedConnection(data)) {
      routes.push({
        kind: 'recommended',
        title: `${origin} -> ${dest} direct only (verify route)`,
        body: conciseDeadlineBody(data, `No connections selected, but this route is not in the local direct-route list. ${status.sentence}`),
        ratingLabel: 'Faster but Riskier'
      });
      routes.push({
        kind: 'backup',
        title: 'Enable one strong connection',
        body: 'Most realistic way to regain recovery options if a nonstop is unavailable or weak.',
        ratingLabel: 'Safer Backup'
      });
      routes.push({
        kind: 'backup',
        title: 'Choose a nearby destination airport',
        body: 'Use a nearby airport only if ground transport still protects arrival time.',
        ratingLabel: 'Good Alternate Airport Play'
      });
    } else if (kind === 'portugal') {
      routes.push({ kind: 'recommended', title: `${origin} -> ${preferredInternationalGateway(data)} -> LIS`, body: conciseDeadlineBody(data, `Best overall: start with a major Europe gateway and keep LIS, FAO, and OPO alive. ${status.sentence}`), ratingLabel: 'Best Overall' });
      routes.push({ kind: 'backup', title: `${origin} -> LHR/AMS/CDG/FRA -> FAO/OPO`, body: 'Safer backup when Lisbon or the Algarve final leg tightens.', ratingLabel: 'Safer Backup' });
      routes.push({ kind: 'backup', title: 'Arrive LIS/OPO, then ground-transfer if needed', body: 'Faster than waiting for a fragile final leg when Portugal airports diverge.', ratingLabel: 'Faster but Riskier' });
    } else if (kind === 'nairobi') {
      routes.push({ kind: 'recommended', title: `${origin} -> ${preferredInternationalGateway(data)} -> NBO`, body: conciseDeadlineBody(data, `Best overall: choose the gateway with the strongest onward NBO recovery, not just the easiest first leg. ${status.sentence}`), ratingLabel: 'Best Overall' });
      routes.push({ kind: 'backup', title: `${origin} -> Europe gateway overnight -> NBO`, body: 'Safer backup for long-haul complexity when same-day recovery disappears.', ratingLabel: 'Safer Backup' });
      routes.push({ kind: 'backup', title: `${origin} -> Middle East gateway -> NBO`, body: 'Useful when Europe gateways weaken but onward NBO space looks better.', ratingLabel: 'Faster but Riskier' });
    } else if (kind === 'london') {
      routes.push({ kind: 'recommended', title: `${origin} -> LHR/LGW`, body: conciseDeadlineBody(data, `Best overall if a London nonstop has later recovery or Gatwick/Heathrow flexibility. ${status.sentence}`), ratingLabel: 'Best Overall' });
      routes.push({ kind: 'backup', title: `${origin} -> AMS/CDG/DUB/FRA -> London`, body: 'Safer if nonstop London space tightens and another gateway has frequency.', ratingLabel: 'Safer Backup' });
      routes.push({ kind: 'backup', title: 'Arrive alternate UK/Europe gateway, then reposition', body: 'Last practical move if London seats vanish but ground timing still works.', ratingLabel: 'Last Resort' });
    } else if (kind === 'south-florida') {
      routes.push({ kind: 'recommended', title: `${origin} -> MIA/FLL`, body: conciseDeadlineBody(data, `Best overall: treat Miami and Fort Lauderdale as one South Florida target. ${status.sentence}`), ratingLabel: 'Best Overall' });
      routes.push({ kind: 'backup', title: `${origin} -> strong hub -> MIA/FLL`, body: 'Safer backup when the nonstop loses cushion before a cruise or event deadline.', ratingLabel: 'Safer Backup' });
      routes.push({ kind: 'backup', title: 'Leave one departure bank earlier', body: 'Best deadline protection when the last useful bank would miss the ship or event.', ratingLabel: 'Last Resort' });
    } else if (kind === 'nyc') {
      routes.push({ kind: 'recommended', title: `${origin} -> JFK/EWR/LGA`, body: conciseDeadlineBody(data, `Best overall: use all NYC airports as the destination, then choose the strongest load. ${status.sentence}`), ratingLabel: 'Best Overall' });
      routes.push({ kind: 'backup', title: `${origin} -> strongest NYC nonstop`, body: 'Safer domestic play if one airport has materially better loads.', ratingLabel: 'Safer Backup' });
      routes.push({ kind: 'backup', title: canConnect ? `${origin} -> hub -> NYC` : 'Earlier NYC nonstop', body: canConnect ? 'Useful when nonstop options tighten but the arrival window is still protected.' : 'Use only before later nonstops stop protecting arrival.', ratingLabel: canConnect ? 'Safer Backup' : 'Faster but Riskier' });
    } else if (kind === 'europe-return') {
      routes.push({ kind: 'recommended', title: `${origin} -> FRA/LHR/AMS/CDG -> SEA`, body: conciseDeadlineBody(data, `Best overall because multiple transatlantic exits matter during holiday return pressure. ${status.sentence}`), ratingLabel: 'Best Overall' });
      routes.push({ kind: 'backup', title: 'Rail or position to strongest Europe hub', body: 'Safer if the first departure bank starts closing.', ratingLabel: 'Safer Backup' });
      routes.push({ kind: 'backup', title: 'Earlier departure or overnight reset', body: 'Last-resort reset when holiday loads remove same-day options.', ratingLabel: 'Last Resort' });
    } else if (scope === 'international') {
      routes.push({ kind: 'recommended', title: `${origin} -> ${preferredInternationalGateway(data)} -> ${dest}`, body: conciseDeadlineBody(data, `Best overall: major hub routing protects international recovery and final-leg timing. ${status.sentence}`), ratingLabel: 'Best Overall' });
      routes.push({ kind: 'backup', title: 'Second major gateway option', body: 'Safer when the first long-haul gateway or final leg starts weakening.', ratingLabel: 'Safer Backup' });
      routes.push({ kind: 'backup', title: 'Nearby destination airport or overnight reset', body: 'Last resort if final-leg timing becomes the blocker.', ratingLabel: 'Last Resort' });
    } else {
      routes.push({ kind: 'recommended', title: `${origin} -> ${dest}`, body: conciseDeadlineBody(data, `Best first play if it keeps later same-day recovery open. ${status.sentence}`), ratingLabel: 'Best Overall' });
      routes.push({ kind: 'backup', title: canConnect ? 'Hub reroute' : 'Earlier nonstop backup', body: canConnect ? 'Safer domestic backup if the direct route starts filling.' : 'Faster but riskier when later nonstops disappear.', ratingLabel: canConnect ? 'Safer Backup' : 'Faster but Riskier' });
      routes.push({ kind: 'backup', title: 'Earlier departure window', body: 'Use when the current bank no longer protects the arrival target.', ratingLabel: isDeadlineSensitive(data) ? 'Last Resort' : 'Safer Backup' });
    }

    addAlternateRoute(data, routes);
    const rescue = paidRescueRoute(data, scoreObj);
    if (rescue) routes.push(rescue);
    return routes;
  };

  switchTrigger = function refinedSwitchTrigger(data, scoreObj, routes) {
    const nearby = nearbyAlternatives(data);
    const status = loadStatus(data);
    if (routeMayNeedConnection(data)) return 'Before leaving home, verify a nonstop exists with a usable backup; otherwise enable connections.';
    if (status.status === 'pressured') return 'Switch when standby count stays above open seats or cabin notes worsen.';
    if (isTightArrivalWindow(data)) return paidRescueAllowed(data, scoreObj)
      ? 'Buy or switch when Plan B can no longer arrive before the deadline.'
      : 'Leave earlier or switch before the last useful departure bank closes.';
    if (effectiveScope(data).value === 'international') return 'Switch before the gateway or final leg becomes the only remaining path.';
    if (nearby && data.nearbyAirports !== 'no') return `Switch to ${nearby.alternatives.join('/')} while ground transport still protects arrival.`;
    return `Switch before ${routes[1]?.title || 'Plan B'} stops protecting arrival.`;
  };

  routeCardRating = function refinedRouteCardRating(route, index, scoreObj, data, routes) {
    const trigger = route.switch || (index === 0
      ? switchTrigger(data, scoreObj, routes)
      : route.kind === 'alternate'
        ? 'Use if the main airport path no longer protects arrival time.'
        : route.kind === 'rescue'
          ? 'Use only when standby routes stop protecting the arrival deadline.'
          : isDeadlineSensitive(data)
            ? 'Switch before the last useful departure bank closes.'
            : 'Switch here before Plan A loses same-day recovery.');
    return {
      label: route.ratingLabel || (index === 0 ? 'Best Overall' : route.kind === 'alternate' ? 'Good Alternate Airport Play' : route.kind === 'rescue' ? 'Last Resort' : 'Safer Backup'),
      reason: route.body,
      trigger
    };
  };

  renderRouteCards = function refinedRenderRouteCards(data, scoreObj, routes) {
    $('routeStrategy').className = 'route-card-grid';
    $('routeStrategy').innerHTML = routes.map((route, index) => {
      const label = index === 0 ? 'Recommended Route' : route.kind === 'alternate' ? 'Alternate Airport Play' : route.kind === 'rescue' ? 'Paid Rescue Note' : `Backup Route ${index}`;
      const rating = routeCardRating(route, index, scoreObj, data, routes);
      return `<article class="route-card route-card-${escapeHtml(route.kind)}">
        <span class="route-label">${escapeHtml(label)}</span>
        <span class="route-rating">${escapeHtml(rating.label)}</span>
        <h3>${escapeHtml(route.title)}</h3>
        <p><strong>Reason:</strong> ${escapeHtml(rating.reason)}</p>
        <p><strong>Switch:</strong> ${escapeHtml(rating.trigger)}</p>
      </article>`;
    }).join('');
  };
}());
