#!/usr/bin/env node
// Archives past events out of seed-data.js instead of letting them
// accumulate forever. Every event is auto-hidden from the app the moment
// its date passes (see TODAY_ISO filtering in the frontend), but nothing
// was ever actually *removing* them from the file — so the bundle only
// ever grows, even though a growing share of it is permanently invisible
// to every user. This script is meant to be run periodically (e.g.
// monthly), not automatically on every deploy — past events aren't
// urgent to remove, just wasteful to keep accumulating indefinitely.
//
// Usage:  node scripts/archive-past-events.js
//
// What it does:
//   1. Reads EVENTS from seed-data.js
//   2. Splits into "still upcoming" (isoDate >= today) and "past"
//   3. Rewrites seed-data.js with only the upcoming events (SPORTS and
//      CITIES are left completely untouched)
//   4. Appends the past events to archive/events-archive.json — a
//      permanent historical record, not a deletion. Nothing is destroyed,
//      just moved out of the file that ships to every user on every load.

const fs = require('fs');
const path = require('path');

const SEED_PATH = path.join(__dirname, '..', 'backend', 'seed-data.js');
const ARCHIVE_PATH = path.join(__dirname, '..', 'archive', 'events-archive.json');

function formatEvent(e) {
  const parts = [];
  for (const [k, v] of Object.entries(e)) {
    if (typeof v === 'string') parts.push(`${k}:${JSON.stringify(v)}`);
    else if (v === null) parts.push(`${k}:null`);
    else parts.push(`${k}:${v}`);
  }
  return '  { ' + parts.join(', ') + ' },';
}

function main() {
  delete require.cache[require.resolve(SEED_PATH)];
  const { SPORTS, CITIES, EVENTS } = require(SEED_PATH);

  const todayIso = new Date().toISOString().slice(0, 10);
  const upcoming = EVENTS.filter(e => e.isoDate >= todayIso);
  const past = EVENTS.filter(e => e.isoDate < todayIso);

  if (past.length === 0) {
    console.log(`Nothing to archive — all ${EVENTS.length} events are today (${todayIso}) or later.`);
    return;
  }

  // Append (not overwrite) the archive, so running this script repeatedly
  // over time builds one continuous historical record rather than losing
  // everything from before the most recent run.
  let existingArchive = [];
  if (fs.existsSync(ARCHIVE_PATH)) {
    existingArchive = JSON.parse(fs.readFileSync(ARCHIVE_PATH, 'utf8'));
  }
  const newArchive = existingArchive.concat(past);
  fs.mkdirSync(path.dirname(ARCHIVE_PATH), { recursive: true });
  fs.writeFileSync(ARCHIVE_PATH, JSON.stringify(newArchive, null, 2));

  // Rewrite seed-data.js with only upcoming events — read the current file
  // as text so we preserve the header comment and SPORTS/CITIES exactly,
  // and only replace the EVENTS array itself.
  let content = fs.readFileSync(SEED_PATH, 'utf8');
  const eventsBody = upcoming.map(formatEvent).join('\n');
  const newBlock = 'const EVENTS = [\n' + eventsBody + '\n];';
  content = content.replace(/const EVENTS = \[\n[\s\S]*?\n\];/, newBlock);
  fs.writeFileSync(SEED_PATH, content);

  console.log(`Archived ${past.length} past event(s), kept ${upcoming.length} upcoming.`);
  console.log(`Archive now holds ${newArchive.length} event(s) total: ${ARCHIVE_PATH}`);
  console.log('');
  console.log('Archived this run:');
  past.forEach(e => console.log(`  ${e.id}  ${e.isoDate}  ${e.home ? e.home + ' v ' + e.away : e.eventName}`));
  console.log('');
  console.log('Next step: regenerate the frontend EVENTS array from the updated');
  console.log('seed-data.js (same process used after any other data change) and');
  console.log('re-test before shipping.');
}

main();
