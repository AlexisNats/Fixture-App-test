#!/usr/bin/env node
// Validates data integrity across backend/seed-data.js AND frontend/index.html
// — catches exactly the two bug classes that caused a multi-day debugging
// saga: (1) an event referencing a city/sport id that doesn't exist in
// the CITIES/SPORTS lists, and (2) an event with missing or invalid
// lat/lng coordinates. Both crashed the live app's map rendering
// entirely, not gracefully — this script exists so that class of bug
// gets caught before a deploy, not discovered by a real user days later.
//
// Exits with a non-zero code if anything fails, so it can be wired into
// a GitHub Actions workflow as a blocking step — a future auto-merge or
// manual regeneration that introduces this kind of bug should fail the
// workflow, not silently ship it.
//
// Usage: node scripts/validate-data-integrity.js

const fs = require('fs');
const path = require('path');

const SEED_PATH = path.join(__dirname, '..', 'backend', 'seed-data.js');
const FRONTEND_PATH = path.join(__dirname, '..', 'frontend', 'index.html');

let failures = 0;

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  failures++;
}

function warn(msg) {
  console.warn(`WARN: ${msg}`);
}

function validateBackend() {
  console.log('--- Checking backend/seed-data.js ---');
  delete require.cache[require.resolve(SEED_PATH)];
  const { SPORTS, CITIES, EVENTS } = require(SEED_PATH);

  const cityIds = new Set(CITIES.map(c => c.id));
  const sportIds = new Set(SPORTS.map(s => s.id));
  const eventIds = new Set();

  EVENTS.forEach(e => {
    if (eventIds.has(e.id)) fail(`Duplicate event id: ${e.id}`);
    eventIds.add(e.id);

    if (!cityIds.has(e.city)) fail(`Event ${e.id} references city "${e.city}" — not found in CITIES.`);
    if (!sportIds.has(e.sport)) fail(`Event ${e.id} references sport "${e.sport}" — not found in SPORTS.`);

    const hasValidCoords = typeof e.lat === 'number' && typeof e.lng === 'number' && !isNaN(e.lat) && !isNaN(e.lng);
    if (!hasValidCoords) fail(`Event ${e.id} (${e.home || e.eventName}) has missing/invalid coordinates — lat: ${e.lat}, lng: ${e.lng}. This crashes the map's render entirely if it reaches a live deploy, not just that one pin.`);

    if (!e.isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(e.isoDate)) fail(`Event ${e.id} has a malformed isoDate: "${e.isoDate}"`);
    if (!e.time) warn(`Event ${e.id} has no time set.`);
    if (!(e.home && e.away) && !e.eventName) fail(`Event ${e.id} has no usable title (no home/away pair and no eventName).`);
  });

  console.log(`Backend: ${EVENTS.length} events, ${CITIES.length} cities, ${SPORTS.length} sports checked.`);
  return { SPORTS, CITIES, EVENTS };
}

function validateFrontendSync(backendData) {
  console.log('--- Checking frontend/index.html is in sync with the backend ---');
  const content = fs.readFileSync(FRONTEND_PATH, 'utf8');

  const eventsMatch = content.match(/let EVENTS = \[\n([\s\S]*?)\n\];/);
  const citiesMatch = content.match(/const CITIES = \{([\s\S]*?)\n?\};/);
  const sportsMatch = content.match(/const SPORTS = \{([\s\S]*?)\n?\};/);

  if (!eventsMatch) { fail('Could not find EVENTS array in frontend/index.html — format may have changed.'); return; }
  if (!citiesMatch) { fail('Could not find CITIES object in frontend/index.html — format may have changed.'); return; }
  if (!sportsMatch) { fail('Could not find SPORTS object in frontend/index.html — format may have changed.'); return; }

  const frontendEventCount = (eventsMatch[1].match(/id:"e\d+"/g) || []).length;
  const frontendCityCount = (citiesMatch[1].match(/(\w+): \{ name:/g) || []).length;
  const frontendSportCount = (sportsMatch[1].match(/(\w+): \{ name:/g) || []).length;

  if (frontendEventCount !== backendData.EVENTS.length) {
    fail(`Frontend has ${frontendEventCount} events but backend has ${backendData.EVENTS.length} — they've drifted out of sync. This exact drift caused a real production crash before (an event referenced a city that only existed on one side).`);
  }
  if (frontendCityCount !== backendData.CITIES.length) {
    fail(`Frontend has ${frontendCityCount} cities but backend has ${backendData.CITIES.length} — out of sync.`);
  }
  if (frontendSportCount !== backendData.SPORTS.length) {
    fail(`Frontend has ${frontendSportCount} sports but backend has ${backendData.SPORTS.length} — out of sync.`);
  }

  if (failures === 0) console.log(`Frontend in sync: ${frontendEventCount} events, ${frontendCityCount} cities, ${frontendSportCount} sports match the backend.`);
}

const backendData = validateBackend();
validateFrontendSync(backendData);

console.log('');
if (failures > 0) {
  console.error(`${failures} integrity check(s) failed. Do not deploy this — see the FAIL lines above.`);
  process.exit(1);
} else {
  console.log('All integrity checks passed.');
}
