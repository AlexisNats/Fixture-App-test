#!/usr/bin/env node
// Calls Claude (with web search) to research fixtures — both filling gaps
// in existing cities/sports (mode: "gaps") and genuinely open-ended
// discovery of new cities/sports ANYWHERE in Europe, in ANY sport
// (mode: "discovery"). DISCOVERY_SOURCES below is a rotating set of
// starting points/inspiration for each run, not a boundary — earlier
// versions of this script limited discovery to only that fixed list,
// which meant it could never find a sport or country not already
// enumerated there; that restriction was removed on purpose. Writes
// proposed additions to a separate file for the GitHub Actions workflow
// to open as a Pull Request — this script never touches seed-data.js
// directly, in either mode.
//
// Why a PR and not a direct commit: everything reliable in this dataset
// exists because a human (working with Claude interactively) checked
// sources, resolved conflicts, and caught errors along the way — see
// seed-data.js's own comments for real examples (wrong days-of-week,
// UK-vs-local time mixups, stale-season data mistaken for current). An
// unattended script has no one to catch that. A PR means a human still
// looks before anything ships, while removing the "someone has to
// remember to ask" friction of the fully manual process.
//
// Discovery mode is HIGHER risk than gap-filling (more surface area, no
// fixed anchor of "existing gap"), which is exactly why it still goes
// through the same PR-only mechanism rather than a lighter one.
//
// Requires: ANTHROPIC_API_KEY set as a repository secret.
// Usage: node scripts/research-new-fixtures.js

const fs = require('fs');
const path = require('path');

const SEED_PATH = path.join(__dirname, '..', 'backend', 'seed-data.js');
const PROPOSAL_PATH = path.join(__dirname, '..', 'proposed-fixtures.json');

// Known-good discovery sources — competitions/leagues/tiers that either
// this project's interactive research has already proven work (marked
// "proven"), or that follow the exact same pattern (an official
// league/club site with a published full-season schedule) and are worth
// checking on that basis alone. Organized by sport so coverage across the
// whole app is systematic, not just wherever research happened to wander.
// Kept intentionally to the cheap Claude-API approach rather than a paid
// data provider — see the README's "Keeping the dataset fresh" section
// for why that tradeoff was chosen deliberately, not by default.
const DISCOVERY_SOURCES = [
  // Football — English/Scottish tiers not yet fully covered
  { name: 'EFL Championship (England, remaining clubs)', why: 'many English cities not yet covered — Portsmouth, Norwich, Preston, Blackburn, Middlesbrough, Swansea, Plymouth, Watford, Millwall, QPR, Charlton, Oxford United among others' },
  { name: 'EFL League One / League Two (England, remaining clubs)', why: 'same pattern as League One already worked for Wigan/Bradford — many more English towns available this way' },
  { name: 'Scottish Premiership (remaining clubs)', why: 'Aberdeen, Kilmarnock, St Johnstone, Motherwell, Livingston, Ross County, St Mirren, Hibernian\'s own city (Edinburgh already covered via Hearts) not yet added as home cities' },
  { name: 'Premier League (Wolverhampton)', why: 'Wolves is the one remaining unclaimed Premier League home city' },
  // Football — continental Europe, other leagues/tiers
  { name: 'La Liga (Spain, remaining clubs)', why: 'Seville, Valencia, Bilbao, Vigo, San Sebastián not yet covered; only Madrid/Barcelona so far' },
  { name: 'Bundesliga (Germany, remaining clubs)', why: 'Dortmund, Leipzig, Frankfurt, Stuttgart, Cologne, Hamburg, Bremen, Wolfsburg, Mönchengladbach not yet covered; only Berlin/Munich so far' },
  { name: 'Ligue 1 (France, remaining clubs)', why: 'Marseille, Monaco, Lille, Nice, Rennes, Nantes, Strasbourg not yet covered; only Paris/Lyon so far (via rugby cities)' },
  { name: 'Serie A / Serie B (Italy, remaining clubs)', why: 'Naples, Turin, Bologna, Florence, Genoa, Bergamo not yet covered; only Rome so far. Milan tried once and found unpublished — worth retrying periodically' },
  { name: 'Eredivisie (Netherlands, remaining clubs)', why: 'Rotterdam, Eindhoven, Alkmaar not yet covered; only Amsterdam so far' },
  { name: 'Primeira Liga (Portugal)', why: 'Lisbon/Porto not yet covered — known to be hard (short notice period), worth retrying periodically rather than permanently giving up' },
  // Rugby union — remaining leagues/tiers
  { name: 'Pro D2 (France, 2nd division rugby)', why: 'a tier below Top 14 — Biarritz, Grenoble, Provence/Aix, Oyonnax, Agen, Béziers among others, same official-LNR-site pattern that worked for Top 14' },
  { name: 'United Rugby Championship (Irish/Welsh/Italian clubs not yet covered)', why: 'Munster (Limerick), Connacht (Galway), Ospreys (Swansea), Scarlets (Llanelli), Benetton (Treviso), Zebre (Parma)' },
  { name: 'Gallagher Premiership Rugby (English clubs not yet covered)', why: 'Bath, Exeter, Northampton not yet added as home cities' },
  { name: 'Rugby Europe Championship (2nd-tier international rugby)', why: 'covers Romania, Georgia, Spain, Portugal at international level — a different angle on the Romania ask than the domestic SuperLiga' },
  { name: 'Romania SuperLiga (domestic rugby)', why: 'explicitly requested, not yet attempted' },
  { name: 'Poland rugby championship (domestic)', why: 'explicitly requested, not yet attempted' },
  // Rugby league — 2nd tier
  { name: 'RFL Championship (England, 2nd-tier rugby league)', why: 'Featherstone, Batley, Widnes, Sheffield Eagles, Halifax, London Broncos, Workington, Whitehaven not yet covered' },
  // Basketball — remaining EuroLeague/EuroCup markets
  { name: 'EuroLeague (remaining clubs)', why: 'Istanbul, Athens, Belgrade, Vitoria-Gasteiz not yet covered; only Madrid/Barcelona/Munich/Berlin/Lyon so far' },
  { name: 'EuroCup basketball (2nd-tier European competition)', why: 'a lower tier than EuroLeague, likely different cities available' },
  { name: 'British Basketball League / Super League Basketball (remaining clubs)', why: 'Leicester Riders, Cheshire Phoenix, Bristol Flyers, Surrey Scorchers, Caledonia Gladiators not yet covered as home cities' },
  // Ice hockey — remaining EIHL + other leagues
  { name: 'EIHL (Glasgow Clan specifically)', why: 'Glasgow is covered for football/rugby but Glasgow Clan\'s own home ice hockey fixture has not been specifically confirmed yet' },
  { name: 'DEL (Germany, ice hockey)', why: 'would give Munich and/or Berlin a further sport if a home fixture is confirmable' },
  // Tennis — other European tour stops
  { name: 'ATP/WTA tour (other European stops)', why: 'Hamburg, Stuttgart, Basel, Vienna, Rotterdam not yet covered; Madrid/Rome opens are clay-season and may fall outside the tracked window — check dates carefully' },
  // Golf — other DP World Tour stops
  { name: 'DP World Tour (other European stops)', why: 'Munich (BMW International Open), Hamburg, Madrid (Open de España), Rome (Italian Open), Ireland not yet covered' },
  // Cricket — other English counties
  { name: 'County Championship / domestic white-ball (remaining counties)', why: 'Leeds (Yorkshire, Headingley), Manchester (Lancashire), Nottingham (Trent Bridge), Southampton (Hampshire) not yet covered; only London/Birmingham so far' },
  // Snooker — other ranking events
  { name: 'World Snooker Tour (other ranking-event venues)', why: 'beyond Belfast/York/Sheffield/London — venues rotate year to year, check current season\'s calendar' },
  // Boxing — other UK fight cards
  { name: 'Major UK boxing cards (other cities)', why: 'Manchester, Sheffield, Cardiff, Glasgow, Liverpool regularly host televised cards; only Dublin/London so far' },
  // Darts — PDC's touring format
  { name: 'Premier League Darts (weekly touring format)', why: 'unlike most sports here, this genuinely moves to a different UK/European city most weeks during its season — good source of variety across a single season' },
  // American football — NFL international games beyond London
  { name: 'NFL international games (Germany)', why: 'Munich and/or Frankfurt have hosted NFL games in recent years — would add a 2nd sport to Munich specifically' },
  // Athletics — other Diamond League legs
  { name: 'Diamond League (other European legs)', why: 'Paris, Rome, Brussels not yet covered; only London so far' },
  // Netball — in-season check
  { name: 'Netball Super League (England)', why: 'confirmed off-season Aug-Sep in earlier research — worth re-checking once the Feb-June season is active; Leeds, Cardiff, Manchester, Nottingham, Bath all field teams' },
  // The three sports tried and not yet successfully added, worth
  // continued attempts with a narrower angle each time
  { name: 'Volleyball — named individual clubs (not the league generally)', why: 'general league searches surfaced only national-team tournaments in past attempts; try a specific named club\'s own site instead (e.g. a Bundesliga or SuperLega club directly)' },
  { name: 'Badminton — named individual clubs or the England Premier Badminton League', why: 'past attempts surfaced only occasional international championships; a domestic league site may work better' },
  { name: 'Table Tennis Bundesliga — named individual clubs (Düsseldorf, Saarbrücken, Dortmund)', why: 'confirmed as a genuine real domestic league in past research, but general league search didn\'t surface a specific dated fixture — try each named club\'s own site directly' },
];

function pickThisRunsSources() {
  const month = new Date().getUTCMonth(); // 0-11, rotates naturally month to month
  const count = 5; // ~7 months to cycle the full list once; still cheap (see README)
  const picked = [];
  for (let i = 0; i < count; i++) {
    picked.push(DISCOVERY_SOURCES[(month + i) % DISCOVERY_SOURCES.length]);
  }
  return picked;
}

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY not set — see the workflow file for setup instructions.');
    process.exit(1);
  }

  delete require.cache[require.resolve(SEED_PATH)];
  const { SPORTS, CITIES, EVENTS } = require(SEED_PATH);

  const existingCitiesList = CITIES.map(c => `${c.name} (${c.country})`).join(', ');
  const existingSummary = CITIES.map(city => {
    const cityEvents = EVENTS.filter(e => e.city === city.id);
    const sports = [...new Set(cityEvents.map(e => e.sport))];
    const latestDate = cityEvents.map(e => e.isoDate).sort().pop() || 'none';
    return `${city.name} (${city.country}): sports=[${sports.join(',')}], latest fixture=${latestDate}`;
  }).join('\n');

  const thisRunsSources = pickThisRunsSources();
  const sourcesBlock = thisRunsSources.map(s => `- ${s.name} — worth checking because: ${s.why}`).join('\n');

  const prompt = `You are helping extend a real sports fixtures dataset. This run has TWO jobs — do both.

## Job 1: fill gaps in existing cities
Cities already tracked, their sports, and most recent fixture date:
${existingSummary}

Look for real, upcoming fixtures that fill an obvious gap (a sport with nothing beyond a certain date, during its active season).

## Job 2: discover new cities/sports — genuinely open-ended, not limited to any fixed list
This run's rotated starting points (use these as inspiration, NOT as a
boundary — this is the important part):
${sourcesBlock}

Check those, but don't stop there. The actual goal is: find real upcoming
fixtures for ANY sport, in ANY city, ANYWHERE in Europe, that isn't in our
dataset yet — including sports and competitions not listed anywhere in
this prompt. Use your own judgment about where to look beyond the
starting points above. A rough guide from this project's own history,
not a restriction:
- Sports with weekly domestic club calendars (football, rugby, rugby
  league, basketball, ice hockey) tend to have the best official-site
  data and are usually worth checking in a new country/city if you
  haven't already.
- Sports organised mainly around occasional national-team tournaments
  rather than club calendars (this project has specifically struggled
  with volleyball, badminton, and table tennis in general searches) are
  harder — a named individual club's own site tends to work better than
  searching the sport/league generally.
- New sports entirely are fair game (boxing, darts, and athletics were
  each added this way when a source clearly warranted it) — don't force
  one, but don't rule one out either.

Existing cities already tracked (don't re-propose these unless adding a
genuinely new sport for one of them): ${existingCitiesList}
Full sport list already in use: ${SPORTS.map(s => s.id).join(', ')}.

If you find a real new city, ALSO do a quick follow-up check for a SECOND
sport in that same city before moving on — this project's own history
shows checking for a second sport immediately, once a city is found,
reliably pays off (e.g. finding Dundee via ice hockey, then checking
Dundee FC's football fixtures in the same pass).

Budget for this run: roughly 15-25 searches total across both jobs — wide
enough to genuinely explore beyond the starting points, not so wide that
a single run runs unbounded.

Rules, non-negotiable:
- Every fixture must come from a real source you actually searched for. Never invent a date, time, opponent, or city.
- Prefer official sources (the club/league/venue's own site) over aggregators. If sources conflict, note the conflict in a "note" field rather than silently picking one.
- If you cannot find a confirmed time, use a clearly-labeled standard-slot estimate and say so in a "note" field — never present an estimate as confirmed.
- Skip anything you're not genuinely confident is real and upcoming. Fewer, solid proposals beat more, shaky ones.
- If a source's data doesn't check out (fixtures not yet published, national-team-only with no club calendar, etc.), skip it and say so in your summary rather than forcing a weak entry — this has happened before (Milan, Lisbon) and is a fine, honest outcome.

Output ONLY a JSON array (no other text). Write it COMPACT — one line per
object, no pretty-printing, no extra indentation or line breaks within an
object. This isn't just a style preference: verbose formatting burns
tokens that could otherwise fit more fixtures within the response limit,
and a genuinely wide search like this one needs that space. Each object
shaped like:
{"sport":"football","city":"london","tier":"...","home":"...","away":"...","venue":"...","area":"...","date":"Sat 05 Sep","isoDate":"2026-09-05","time":"15:00","status":"official","source":"...","note":"optional — flag any conflict or estimate here","isNewCity":false,"cityCountry":"UK"}

Use "eventName" instead of "home"/"away" for non-team events (golf, tennis, boxing, etc). Set "isNewCity":true and include "cityCountry" when proposing a city not in the existing list.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 16000, // raised from 8192 after a real failure: the widened, genuinely open-ended search found enough fixtures that the response was cut off mid-JSON before finishing. This only affects the ceiling, not actual cost — billing is based on tokens genuinely generated, not this limit.
      messages: [{ role: 'user', content: prompt }],
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
    }),
  });

  if (!response.ok) {
    console.error('API request failed:', response.status, await response.text());
    process.exit(1);
  }

  const data = await response.json();
  const textBlocks = data.content.filter(b => b.type === 'text').map(b => b.text).join('\n');

  let proposed;
  try {
    const jsonMatch = textBlocks.match(/\[[\s\S]*\]/);
    proposed = JSON.parse(jsonMatch[0]);
  } catch (err) {
    // Real failure mode this project has actually hit: the response gets
    // cut off mid-array if a genuinely wide search finds enough fixtures
    // to exceed max_tokens, even after raising it. Rather than discard
    // every fixture the search DID find just because the last one or two
    // got cut off, try to salvage each complete {...} object individually
    // — a truncated final entry is thrown away, but everything before it
    // survives instead of the whole run producing nothing.
    console.error('Could not parse the full response as one JSON array — attempting to salvage individual complete entries instead of discarding everything.');
    const objectMatches = textBlocks.match(/\{[^{}]*\}/g) || [];
    proposed = [];
    for (const objText of objectMatches) {
      try { proposed.push(JSON.parse(objText)); } catch { /* skip this one, keep going */ }
    }
    if (proposed.length === 0) {
      console.error('Could not salvage anything usable either. Raw output:');
      console.error(textBlocks);
      process.exit(1);
    }
    console.error(`Salvaged ${proposed.length} complete fixture(s) despite the truncated response.`);
  }

  console.log(`This run's discovery sources: ${thisRunsSources.map(s => s.name).join(', ')}`);

  if (!Array.isArray(proposed) || proposed.length === 0) {
    console.log('No proposed fixtures this run — nothing to open a PR for.');
    fs.writeFileSync(PROPOSAL_PATH, JSON.stringify([], null, 2));
    return;
  }

  fs.writeFileSync(PROPOSAL_PATH, JSON.stringify(proposed, null, 2));
  const newCityCount = proposed.filter(p => p.isNewCity).length;
  console.log(`Proposed ${proposed.length} new fixture(s), ${newCityCount} involving a new city — written to ${PROPOSAL_PATH}`);
  console.log('These are NOT yet in seed-data.js. A human must review the PR this creates before merging.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

