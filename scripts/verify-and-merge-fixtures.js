#!/usr/bin/env node
// Takes proposed-fixtures.json (written by research-new-fixtures.js) and
// runs a SECOND, independent Claude call whose only job is to try to
// find problems with each proposed fixture — not to confirm the first
// pass was right. Genuinely re-searches each one rather than just
// re-reading the same reasoning.
//
// Fixtures that pass verification get merged directly into seed-data.js
// and frontend/index.html — no PR, no human step. Fixtures that don't
// pass (or that the verifier is genuinely unsure about) get written to
// uncertain-fixtures.json instead, for the workflow to open as a PR.
//
// Why this is still not the same as human review, and why that's fine as
// a deliberate tradeoff rather than a hidden gap: a second AI pass is a
// real check (independent search, explicitly told to be skeptical, not
// just re-reading the same claim) but it shares the same fundamental
// blind spots a first pass might have — it's not literally the same as
// having someone else look. Treat "auto-merged" as "passed a real but
// imperfect check," not "guaranteed correct."
//
// Requires: ANTHROPIC_API_KEY set as a repository secret (same one
// research-new-fixtures.js uses).
// Usage: node scripts/verify-and-merge-fixtures.js

const fs = require('fs');
const path = require('path');

const SEED_PATH = path.join(__dirname, '..', 'backend', 'seed-data.js');
const FRONTEND_PATH = path.join(__dirname, '..', 'frontend', 'index.html');
const PROPOSAL_PATH = path.join(__dirname, '..', 'proposed-fixtures.json');
const UNCERTAIN_PATH = path.join(__dirname, '..', 'uncertain-fixtures.json');

function formatEvent(e) {
  const parts = [];
  for (const [k, v] of Object.entries(e)) {
    if (typeof v === 'string') parts.push(`${k}:${JSON.stringify(v)}`);
    else if (v === null) parts.push(`${k}:null`);
    else parts.push(`${k}:${v}`);
  }
  return '  { ' + parts.join(', ') + ' },';
}

async function callClaude(apiKey, prompt) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 16000, // raised alongside research-new-fixtures.js — same real failure mode applies here (many proposed fixtures to verify = long output).
      messages: [{ role: 'user', content: prompt }],
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
    }),
  });
  if (!response.ok) throw new Error(`API request failed: ${response.status} ${await response.text()}`);
  const data = await response.json();
  return data.content.filter(b => b.type === 'text').map(b => b.text).join('\n');
}

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY not set.');
    process.exit(1);
  }

  if (!fs.existsSync(PROPOSAL_PATH)) {
    console.log('No proposed-fixtures.json found — nothing to verify.');
    return;
  }
  const proposed = JSON.parse(fs.readFileSync(PROPOSAL_PATH, 'utf8'));
  if (!Array.isArray(proposed) || proposed.length === 0) {
    console.log('proposed-fixtures.json is empty — nothing to verify.');
    return;
  }

  const verifyPrompt = `You are fact-checking a list of proposed sports fixtures before they get automatically published. Your job is to find problems, NOT to confirm the list looks fine — actively try to disprove each entry by searching independently.

Proposed fixtures:
${JSON.stringify(proposed, null, 2)}

For EACH fixture, independently search and check:
- Does the cited source genuinely confirm this exact date, time, teams/event, and venue?
- Is there any conflicting source giving a different date/time?
- Does the date's day-of-week actually match the calendar (e.g. if it says "Saturday 5 September 2026," is that date really a Saturday)?
- Could this be describing a past/different season rather than the one implied?
- Is the venue/city pairing geographically real (this venue is actually in this city)?

Output ONLY a JSON array, compact (one line per object, no pretty-printing — verbose formatting wastes tokens that matter when verifying many fixtures at once), one object per input fixture, in the same order, shaped like:
{"verdict":"pass","reason":"brief note on what confirmed it"}
or
{"verdict":"uncertain","reason":"specific problem found, e.g. 'source says Friday but 5 Sep 2026 is a Saturday' or 'could not find independent confirmation'"}

Be genuinely willing to fail an entry — a false "pass" defeats the entire point of this check.`;

  console.log(`Verifying ${proposed.length} proposed fixture(s)...`);
  const verifyText = await callClaude(apiKey, verifyPrompt);
  let verdicts;
  try {
    const jsonMatch = verifyText.match(/\[[\s\S]*\]/);
    verdicts = JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error('Could not parse verification response — treating everything as uncertain, to be safe.');
    console.error(verifyText);
    verdicts = proposed.map(() => ({ verdict: 'uncertain', reason: 'Verification step itself failed to run cleanly — flagged automatically, not evaluated.' }));
  }

  const verified = [];
  const uncertain = [];
  proposed.forEach((fixture, i) => {
    const v = verdicts[i] || { verdict: 'uncertain', reason: 'No verdict returned for this entry.' };
    // Coordinate validation happens regardless of the AI verification
    // verdict — this isn't a factual-accuracy question the verification
    // pass is designed to catch, it's a structural one. Found the hard
    // way: a fixture merged without coordinates doesn't just fail to show
    // a pin, it crashes the map rendering entirely for every user, taking
    // the whole app down with it. Never auto-merge past this check.
    const hasValidCoords = typeof fixture.lat === 'number' && typeof fixture.lng === 'number'
      && !isNaN(fixture.lat) && !isNaN(fixture.lng);
    if (!hasValidCoords){
      uncertain.push({ ...fixture, verificationNote: 'Missing or invalid lat/lng coordinates — this would crash the map if merged, so it needs manual coordinates added before going in, regardless of the verification verdict.' });
      return;
    }
    if (v.verdict === 'pass') verified.push({ ...fixture, verificationNote: v.reason });
    else uncertain.push({ ...fixture, verificationNote: v.reason });
  });

  console.log(`Verified (will auto-merge): ${verified.length}`);
  console.log(`Uncertain (will open a PR for review): ${uncertain.length}`);

  // Write uncertain ones for the workflow to turn into a PR, same as before.
  fs.writeFileSync(UNCERTAIN_PATH, JSON.stringify(uncertain, null, 2));

  if (verified.length === 0) {
    console.log('Nothing passed verification this run — no auto-merge to do.');
    return;
  }

  // Auto-merge the verified ones directly into seed-data.js.
  delete require.cache[require.resolve(SEED_PATH)];
  const { SPORTS, CITIES, EVENTS } = require(SEED_PATH);
  const existingIds = new Set(EVENTS.map(e => e.id));
  const existingCityIds = new Set(CITIES.map(c => c.id));
  const existingSportIds = new Set(SPORTS.map(s => s.id));

  // Generate fresh sequential IDs continuing from the highest existing one,
  // rather than trusting the proposal to have picked non-colliding IDs.
  let nextIdNum = Math.max(0, ...EVENTS.map(e => parseInt((e.id || '').replace('e', ''), 10) || 0)) + 1;

  const newCities = [];
  const newSports = [];
  const newEvents = verified.map(f => {
    const id = `e${nextIdNum++}`;
    if (f.isNewCity && !existingCityIds.has(f.city)) {
      newCities.push({ id: f.city, name: f.cityName || f.city, country: f.cityCountry || 'Unknown' });
      existingCityIds.add(f.city);
    }
    // Without this, a genuinely new sport's events would reference a sport
    // id with no matching name/color entry anywhere — breaking how the
    // app displays them. Caught as a real gap, not a hypothetical one.
    if (f.isNewSport && !existingSportIds.has(f.sport)) {
      newSports.push({ id: f.sport, name: f.sportName || f.sport, color: f.sportColor || '#8A8578' });
      existingSportIds.add(f.sport);
    }
    const { verificationNote, isNewCity, cityCountry, cityName, isNewSport, sportName, sportColor, note, ...clean } = f;
    return { id, ...clean, tag: 'real', status: clean.status || 'official' };
  });

  const updatedEvents = [...EVENTS, ...newEvents];
  const updatedCities = [...CITIES, ...newCities];
  const updatedSports = [...SPORTS, ...newSports];

  let seedContent = fs.readFileSync(SEED_PATH, 'utf8');
  const eventsBlock = 'const EVENTS = [\n' + updatedEvents.map(formatEvent).join('\n') + '\n];';
  seedContent = seedContent.replace(/const EVENTS = \[\n[\s\S]*?\n\];/, eventsBlock);
  if (newCities.length > 0) {
    const citiesBlock = 'const CITIES = [\n' + updatedCities.map(c => `  { id: "${c.id}", name: "${c.name}", country: "${c.country}" },`).join('\n') + '\n];';
    seedContent = seedContent.replace(/const CITIES = \[\n[\s\S]*?\n\];/, citiesBlock);
  }
  if (newSports.length > 0) {
    const sportsBlock = 'const SPORTS = [\n' + updatedSports.map(s => `  { id: "${s.id}", name: "${s.name}", color: "${s.color}" },`).join('\n') + '\n];';
    seedContent = seedContent.replace(/const SPORTS = \[\n[\s\S]*?\n\];/, sportsBlock);
  }
  fs.writeFileSync(SEED_PATH, seedContent);

  // Regenerate frontend's copy to match — same pattern used everywhere
  // else in this project after a seed-data.js change. This previously
  // only regenerated EVENTS, silently never propagating new CITIES or
  // SPORTS to the frontend even when they were added to seed-data.js —
  // a real gap, fixed here alongside the SPORTS-creation fix above.
  delete require.cache[require.resolve(SEED_PATH)];
  const fresh = require(SEED_PATH);
  let frontendContent = fs.readFileSync(FRONTEND_PATH, 'utf8');

  const frontendEventsBlock = 'let EVENTS = [\n' + fresh.EVENTS.map(formatEvent).join('\n') + '\n];';
  frontendContent = frontendContent.replace(/let EVENTS = \[\n[\s\S]*?\n\];/, frontendEventsBlock);

  if (newCities.length > 0) {
    const citiesEntries = fresh.CITIES.map(c => `${c.id}: { name: ${JSON.stringify(c.name)}, country: ${JSON.stringify(c.country)} }`);
    const frontendCitiesLine = 'const CITIES = { ' + citiesEntries.join(', ') + ' };';
    frontendContent = frontendContent.replace(/const CITIES = \{.*?\};/, frontendCitiesLine);
  }
  if (newSports.length > 0) {
    const sportsEntries = fresh.SPORTS.map(s => `${s.id}: { name: ${JSON.stringify(s.name)}, color: ${JSON.stringify(s.color)} }`);
    const frontendSportsLine = 'const SPORTS = { ' + sportsEntries.join(', ') + ' };';
    frontendContent = frontendContent.replace(/const SPORTS = \{[\s\S]*?\};/, frontendSportsLine);
  }
  fs.writeFileSync(FRONTEND_PATH, frontendContent);

  console.log(`Auto-merged ${newEvents.length} fixture(s)${newCities.length ? `, ${newCities.length} new city/cities` : ''}${newSports.length ? `, ${newSports.length} new sport(s)` : ''} directly into seed-data.js and frontend/index.html.`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
