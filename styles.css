:root {
  --bg: #0b1020;
  --bg2: #111a33;
  --panel: rgba(255, 255, 255, 0.075);
  --panel2: rgba(255, 255, 255, 0.11);
  --border: rgba(255, 255, 255, 0.16);
  --text: #eef3ff;
  --muted: #aab6d5;
  --accent: #85d5ff;
  --accent2: #d7f4ff;
  --green: #4fe09d;
  --yellow: #ffd369;
  --orange: #ff9f55;
  --red: #ff6868;
  --shadow: 0 18px 60px rgba(0, 0, 0, 0.35);
}

* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: var(--text);
  background:
    radial-gradient(circle at top left, rgba(133, 213, 255, 0.22), transparent 35%),
    radial-gradient(circle at top right, rgba(255, 211, 105, 0.14), transparent 30%),
    linear-gradient(145deg, var(--bg), var(--bg2));
  min-height: 100vh;
}

button, input, select, textarea { font: inherit; }
button { cursor: pointer; }

.app-header {
  max-width: 1440px;
  margin: 0 auto;
  padding: 36px 28px 20px;
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: flex-end;
}

h1, h2, h3, p { margin-top: 0; }
h1 { font-size: clamp(2rem, 4vw, 4rem); line-height: 0.96; margin-bottom: 12px; letter-spacing: -0.055em; }
h2 { font-size: 1.2rem; margin-bottom: 0; }
h3 { font-size: 0.95rem; margin-bottom: 10px; color: var(--accent2); }
.subhead { color: var(--muted); max-width: 720px; font-size: 1.05rem; margin-bottom: 0; }
.eyebrow { color: var(--accent); text-transform: uppercase; letter-spacing: 0.14em; font-size: 0.72rem; font-weight: 800; margin-bottom: 6px; }

.layout {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 28px 28px;
  display: grid;
  grid-template-columns: 330px minmax(0, 1fr);
  gap: 22px;
  align-items: start;
}

.sidebar { display: grid; gap: 18px; position: sticky; top: 16px; }
.content { display: grid; gap: 18px; }

.panel {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 26px;
  padding: 22px;
  box-shadow: var(--shadow);
  backdrop-filter: blur(18px);
}
.compact { padding: 18px; }
.panel-title-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  margin-bottom: 18px;
}

.grid { display: grid; gap: 14px; }
.grid.two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.grid.three { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.grid.four { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.trip-form { display: grid; gap: 14px; }

label {
  display: grid;
  gap: 8px;
  color: var(--muted);
  font-size: 0.82rem;
  font-weight: 700;
}
input, select, textarea {
  width: 100%;
  color: var(--text);
  background: rgba(0, 0, 0, 0.23);
  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: 14px;
  padding: 12px 13px;
  outline: none;
}
input:focus, select:focus, textarea:focus { border-color: rgba(133, 213, 255, 0.7); box-shadow: 0 0 0 3px rgba(133, 213, 255, 0.12); }
textarea { resize: vertical; }
select option { color: #111827; }

.button-row, .header-actions, .stacked-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.stacked-actions { margin-top: 14px; }
.compact-row { justify-content: flex-end; }
button, .file-button {
  border: 0;
  border-radius: 999px;
  padding: 11px 15px;
  color: #06111f;
  font-weight: 850;
  background: var(--accent2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
button.primary { background: linear-gradient(135deg, #dff7ff, #77d5ff); }
button.secondary, .file-button { background: rgba(255, 255, 255, 0.13); color: var(--text); border: 1px solid rgba(255, 255, 255, 0.14); }
button.danger { background: rgba(255, 104, 104, 0.16); color: #ffd7d7; border: 1px solid rgba(255, 104, 104, 0.3); }
button:hover, .file-button:hover { transform: translateY(-1px); }
button.full, .file-button.full { width: 100%; }
.file-button input { display: none; }

.status-note, .pill {
  color: var(--accent2);
  background: rgba(133, 213, 255, 0.13);
  border: 1px solid rgba(133, 213, 255, 0.22);
  border-radius: 999px;
  padding: 7px 11px;
  font-size: 0.78rem;
  font-weight: 800;
}

.saved-list { display: grid; gap: 9px; max-height: 360px; overflow: auto; padding-right: 3px; }
.saved-item {
  text-align: left;
  width: 100%;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  padding: 12px;
  color: var(--text);
  display: grid;
  gap: 4px;
}
.saved-item.active { border-color: rgba(133, 213, 255, 0.7); background: rgba(133, 213, 255, 0.11); }
.saved-item strong { font-size: 0.93rem; }
.saved-item small { color: var(--muted); line-height: 1.35; }

.metric-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.metric {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 18px;
  padding: 14px;
}
.metric span { display: block; font-size: 1.65rem; font-weight: 900; letter-spacing: -0.04em; }
.metric small { color: var(--muted); font-weight: 700; }

.output-grid { align-items: stretch; }
.result-panel { min-height: 300px; }
.score-wrap { display: grid; grid-template-columns: 140px minmax(0, 1fr); gap: 18px; align-items: center; margin-bottom: 18px; }
.risk-score {
  width: 128px;
  height: 128px;
  border-radius: 34px;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.14);
  font-size: 2.8rem;
  font-weight: 950;
  letter-spacing: -0.08em;
}
.risk-badge {
  padding: 9px 13px;
  border-radius: 999px;
  font-weight: 950;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.73rem;
}
.risk-badge.green { color: #062416; background: var(--green); }
.risk-badge.yellow { color: #2c2100; background: var(--yellow); }
.risk-badge.orange { color: #2a1000; background: var(--orange); }
.risk-badge.red { color: #300606; background: var(--red); }
.large-copy { color: var(--text); font-size: 1.04rem; line-height: 1.5; margin-bottom: 10px; }
.callout { background: rgba(133, 213, 255, 0.1); border-left: 4px solid var(--accent); border-radius: 12px; padding: 12px; color: var(--accent2); margin-bottom: 0; }
.clean-list { padding-left: 18px; margin: 0; color: var(--muted); display: grid; gap: 7px; }

.route-list { display: grid; gap: 10px; }
.route-card {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  padding: 13px;
}
.route-card strong { display: block; margin-bottom: 4px; color: var(--accent2); }
.route-card p { color: var(--muted); margin-bottom: 0; line-height: 1.4; }

.timeline { display: grid; gap: 10px; margin-top: 15px; }
.timeline-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 14px;
  padding: 13px;
  border-radius: 18px;
  background: rgba(0, 0, 0, 0.19);
  border: 1px solid rgba(255, 255, 255, 0.12);
}
.timeline-item p { margin: 0; color: var(--muted); line-height: 1.45; }
.timeline-item strong { color: var(--accent2); }
.timeline-item button { padding: 8px 10px; align-self: start; }

.battle-card {
  background: #f9fbff;
  color: #101827;
  border-radius: 22px;
  padding: 24px;
  line-height: 1.5;
}
.battle-card h2, .battle-card h3 { color: #101827; }
.battle-card h2 { font-size: 1.6rem; margin-bottom: 8px; }
.battle-card h3 { margin-top: 22px; margin-bottom: 8px; }
.battle-card p { margin-bottom: 8px; }
.battle-card ul { margin-top: 4px; }
.battle-card .mini-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 8px 18px; margin: 14px 0; }
.battle-card .mini-grid div { border-bottom: 1px solid #dbe4f0; padding-bottom: 5px; }
.battle-card .risk-line { font-weight: 900; }
.empty-state { color: var(--muted); }
.battle-card.empty-state { color: #6b7280; }

.footer-note {
  max-width: 1440px;
  margin: 0 auto 26px;
  padding: 0 28px;
  color: var(--muted);
  font-size: 0.9rem;
}

@media (max-width: 1050px) {
  .layout { grid-template-columns: 1fr; }
  .sidebar { position: static; }
  .grid.four, .grid.three, .grid.two { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 700px) {
  .app-header { flex-direction: column; align-items: stretch; padding: 24px 16px 16px; }
  .layout { padding: 0 16px 20px; }
  .grid.four, .grid.three, .grid.two, .score-wrap { grid-template-columns: 1fr; }
  .risk-score { width: 100%; height: 96px; border-radius: 22px; }
  .battle-card .mini-grid { grid-template-columns: 1fr; }
}

@media print {
  body { background: #fff; }
  .app-header, .sidebar, .trip-form, .output-grid, .footer-note, .panel:not(.battle-card-panel) { display: none !important; }
  .layout { display: block; padding: 0; }
  .content { display: block; }
  .battle-card-panel { box-shadow: none; border: 0; padding: 0; background: transparent; }
  .panel-title-row { display: none; }
  .battle-card { border-radius: 0; padding: 0; }
}

.validation-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 14px;
}

.validation-rules {
  margin-top: 16px;
  padding: 16px;
  border: 1px solid rgba(133, 213, 255, 0.22);
  border-radius: 18px;
  background: rgba(133, 213, 255, 0.08);
  color: var(--muted);
}

.validation-rules p { margin-bottom: 0; }

.validation-list {
  display: grid;
  gap: 8px;
  margin-top: 14px;
}

.validation-item {
  width: 100%;
  justify-content: flex-start;
  align-items: flex-start;
  text-align: left;
  border-radius: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.08);
  color: var(--text);
  display: grid;
  gap: 4px;
}

.validation-item small { color: var(--muted); font-weight: 700; }
.validation-item.active { outline: 2px solid rgba(133, 213, 255, 0.75); }

@media (max-width: 1100px) {
  .validation-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 720px) {
  .validation-grid { grid-template-columns: 1fr; }
}
