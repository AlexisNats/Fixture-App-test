# Fixture — full codebase (frontend + backend)

This is a real, working two-part app:

- **`/backend`** — a Node.js REST API with genuine password hashing, signed login tokens, and file-based persistence. Zero external dependencies — it runs with nothing but Node itself, no `npm install` required.
- **`/frontend`** — the phone-testable web app, now able to connect to that backend for real accounts and real data instead of the in-memory demo.

It still works standalone with no backend at all (open `frontend/index.html` directly, exactly as before) — connecting the backend is optional but unlocks real, persistent accounts and centrally-updatable event data.

## Changelog

**v1.53 — discovery list expanded from 10 to 34 sources, organized systematically by sport**
- **Confirmed the cheap Claude-API approach stays the plan** — not moving to the paid sports-data-provider tier (Sportradar/Genius Sports, $20-400+/month) given how cheap and reliable this system already is (well under $1/month at current scope). Sized the expanded list to keep it that way: 5 sources per run instead of 3, cycling the full 34-entry list roughly every 7 months rather than trying to check everything at once.
- **The list is now systematic, not opportunistic** — organized by sport, covering every remaining tier/league/country for each of the 14 sports already tracked (remaining Bundesliga/La Liga/Serie A/Ligue 1/Eredivisie/Primeira Liga cities, Pro D2, URC and Premiership clubs not yet covered, Rugby Europe Championship, RFL Championship, EuroCup basketball, other DP World Tour/ATP-WTA/Diamond League stops, remaining County Championship cricket grounds, other UK boxing/snooker cities, and Netball once its season is active) rather than just the handful of competitions that happened to come up in past research sessions.
- **Volleyball, Badminton, and Table Tennis are still in the rotation**, but with a specifically narrower angle each time — named individual clubs rather than searching the league generally, since that's exactly where past attempts got stuck (surfacing national-team tournaments instead of club calendars).
- Romania SuperLiga and Poland's domestic rugby championship are both in the list, plus a second angle on Romania via the Rugby Europe Championship (international tier) in case the domestic league keeps proving hard to pin down.

**v1.52 — the semi-automated system now discovers new cities too, not just gap-fills**
- **`research-new-fixtures.js` extended with a `DISCOVERY_SOURCES` list** — 10 known-good competitions/leagues that interactive sessions have proven reliably surface new cities (Top 14, EIHL, EuroLeague, Champions Cup, Romania SuperLiga, Poland rugby, and others), rotated 3-per-run by calendar month so the full list gets checked periodically over a year rather than the same 3 every time.
- **The "find a city, then check for a second sport" workflow is now baked into the automated prompt itself** — the same approach used interactively (finding Dundee via ice hockey, then immediately checking Dundee FC's football) is now something the monthly job is explicitly instructed to do, not just something a human remembers to ask for.
- Still PR-only, still never auto-merges — new-city proposals are flagged (`isNewCity: true`) for extra scrutiny, since open-ended discovery has more room for error than filling a known gap.
- Documented realistic cost (well under $1/month in Anthropic API usage for this script's scope) and the free alternative (skip Claude, accept the coverage/verification tradeoff that free sports APIs come with) in the README, with an explicit pointer to check current pricing directly rather than trust a number that could go stale.

**v1.51 — a real semi-automated data-freshness system, and a documentation fix**
- **New: `.github/workflows/research-new-fixtures.yml`**, running monthly. Calls Claude via the Anthropic API (with web search enabled) to look for real fixtures filling gaps in the existing dataset, and opens a Pull Request with what it finds — deliberately does NOT commit directly or auto-merge. Requires an `ANTHROPIC_API_KEY` repository secret; each run costs API usage.
- **Why a PR, not a direct commit — this project's own history is the argument**: real errors (a source's wrong day-of-week, a UK/local-time mixup, stale-season data mistaken for current) were only caught in this project through active back-and-forth checking, not by a script running unattended. A human still needs to look before anything from the automated proposal ships.
- **Honest framing, not oversold**: this closes part of the gap between "fully automated" and "fully manual," but doesn't replace the deep, judgment-heavy research sessions that produced the Six Nations and Top 14 additions — those came from interactive push-back and testing that a monthly scheduled job can't fully replicate. The README's "Keeping the dataset fresh" section now describes three tiers instead of two, honestly.
- **Fixed a real documentation bug**: the "Known future direction" section header had been accidentally dropped in an earlier edit, leaving its content orphaned under the wrong heading. Restored.
- Confirmed: Vibecode is the wrong tool for this — it builds the client app, not a data pipeline. This automation lives in the backend/data repo regardless of what eventually displays the data.

**v1.50 — major rugby push: 7 new cities, Paris gets a 3rd sport, Lyon gets 2 sports from day one**
- **All 7 Top 14 Round 1 fixtures added**, confirmed directly via the competition's own official site (top14.lnr.fr) and cross-checked against 3 independent French sports outlets all agreeing on the pairings. This single piece of research added **6 new French cities** (Bayonne, Bordeaux, Montpellier, Castres, Lyon, La Rochelle) and gave **Paris a 3rd sport** (rugby, alongside the tennis and golf already there).
- **The "easy sport, then check for others" strategy paid off again**: once Lyon was found via rugby, a quick follow-up search confirmed LDLC ASVEL Villeurbanne's EuroLeague basketball fixture — Lyon launched with 2 sports, not 1.
- **Gloucester added as a new city** via a confirmed Investec Champions Cup Round 1 fixture (Gloucester Rugby v the reigning back-to-back champions, Union Bordeaux-Bègles) — this ties Champions Cup rugby directly to clubs already in the dataset, exactly the intended effect of covering that competition.
- **Romania and Poland's domestic rugby championships were explicitly requested but not reached this round** — research budget went to Top 14/Champions Cup instead, given how much that alone returned. Still open for a dedicated future round.
- 156 events, 47 cities.

**v1.49 — 3 new cities discovered via ice hockey; Dundee gets a bonus second sport**
- **Used the "easiest sport" strategy deliberately**: ice hockey has consistently had the best official-source data of any sport tried this session, so it became the discovery vector for new cities rather than searching city-by-city blind. Found 3 new EIHL home cities in one search, all cross-confirmed via the league's own official "Opening Weekend" announcement: **Dundee**, **Guildford**, and **Kirkcaldy (Fife)**.
- **Dundee got a genuine second sport once found** — Dundee FC v Hibernian, confirmed directly via the SPFL's own official site, giving Dundee real multi-sport depth from day one rather than sitting as a single-sport city.
- **Volleyball, Badminton, and Table Tennis were tried again this round, specifically for new cities, and still not added.** One genuinely useful finding: Table Tennis Bundesliga is a real, currently-running domestic club league (confirmed clubs: Düsseldorf, Saarbrücken, Dortmund, Karlsruhe) — but no specific 2026/27 fixture with a confirmed date could be found via general search. This suggests the next attempt should search named clubs individually rather than the league generally, which is a different research approach than what's worked for other sports so far.
- 147 events, 40 cities.

**v1.48 — Cardiff Rugby added; volleyball/badminton/table tennis explored and honestly not added**
- **Cardiff Rugby v Zebre Parma**, confirmed directly via Cardiff Rugby's own official site — their first home fixture of a landmark 150th-anniversary season. Cardiff now has 3 sports (football, ice hockey, rugby).
- **Munich/Berlin basketball and Paris rugby did not yield confirmable fixtures** this round, despite specific searches for each.
- **Volleyball, Badminton, and Table Tennis were genuinely explored, not skipped, and none were added.** The pattern that emerged across all three: results were dominated by occasional national-team tournaments (European Championships, Nations Leagues) rather than recurring weekly club fixtures — and where a specific date existed, it was usually already in the past relative to this dataset's window, or in a city not tracked here. This is a structurally different shape of sport than everything else in this dataset (football, rugby, basketball, etc. all have weekly domestic club calendars with predictable home fixtures) — worth knowing as a real finding, not a failed search.
- 143 events, 37 cities, 14 sports.

**v1.47 — season finals push reaches July 2027; Athletics added as a 14th sport**
- **5 major season-ending events added, all confirmed via official/authoritative sources:** World Snooker Championship (Sheffield's Crucible Theatre — the centenary edition, gives Sheffield a 3rd sport), FA Cup Final, UEFA Champions League Final (Madrid), Gallagher Premiership Rugby Final, and the London Diamond League athletics meet.
- **New sport: Athletics** — confirmed via British Athletics' own official site and Ticketmaster independently agreeing on the date. 14 sports now.
- **3 of these are genuinely "TBC" and marked honestly as such** — the FA Cup Final, Champions League Final, and Premiership Rugby Final all have real confirmed dates/venues but undetermined finalists, since those competitions are still ongoing. Marked clearly in the data rather than guessed at or omitted.
- **Caught a real source conflict on the FA Cup Final date** — Sky Sports' dedicated season-dates feature said 22 May 2027, a smaller ticketing site said 15 May. Trusted Sky Sports as the more authoritative, purpose-built source; documented the conflict directly in the data rather than silently picking one.
- **Pushed slightly past the requested May/June 2027 window on purpose** — the London Diamond League (17 July) was confirmed by two independent sources and too clean to leave out over a 6-week technicality.
- Milan and Lisbon were not re-attempted this round (already found to be genuinely hard cases last time — Milan's 2026/27 fixtures aren't published yet, Portugal's league gives ~10 days' notice).
- 142 events, 37 cities, 14 sports, date range 21 Aug 2026 – 17 Jul 2027.

**v1.46 — regular-update automation, and a huge season-extension win via Six Nations rugby**
- **Real scheduled automation added**: `.github/workflows/archive-past-events.yml` runs the archive script every Monday automatically (once hosted on GitHub with Actions enabled), instead of relying on someone remembering to run it. See the new "Keeping the dataset fresh" README section for the honest split between what's automatable (removing stale events) and what isn't (finding new fixtures, which requires judgment a script can't replicate — explained with real examples from this project's own history).
- **All 15 fixtures of the 2027 Six Nations Championship added** — cross-confirmed by the tournament's own official site plus 5+ independent sources all agreeing on dates and kickoff times. This single addition gives real home fixtures to **six cities already in the dataset** (London, Cardiff, Edinburgh, Dublin, Rome, Paris) and genuinely extends the season into March 2027, rather than an arbitrary date-range bump. Super Saturday (13 March) correctly shows all 3 simultaneous closing matches across 3 different cities.
- **Two new-city attempts this round came up empty, for real, specific reasons — not just "couldn't find data":** Milan (AC Milan/Inter/Olimpia Milano) mostly returned historical 2025-26 season data or pages explicitly stating fixtures aren't announced yet. Lisbon (Benfica/Sporting) turned up something genuinely useful to know: Portugal's Primeira Liga gives the least advance notice of any major European league — often only ~10 days before each round — so no source could have given confirmed September dates because they don't exist yet. Both left honest rather than forced.
- 137 events, 37 cities, date range 21 Aug 2026 – 13 Mar 2027.

**v1.45 — reverted the "empty map by default" change from v1.42; it was wrong**
- v1.42 made the map show nothing until some filter narrowed things down, specifically to avoid an "overwhelming" full-map view on first load. That reasoning missed something obvious: with every sport and country selected (the actual default state), a user opening the app fresh saw an empty map for no real reason — "all selected" reads as "show me everything," not "show me nothing until I do something."
- **Reverted to the simpler, correct rule: the map shows exactly what `filteredEvents()` returns — same source of truth as list view, no separate rule layered on top.** Empty only happens when filters genuinely produce zero results (e.g. explicitly deselecting every sport), never just because nothing happens to be narrowed down. Removed the now-unused `hasActiveNarrowing()` function and cleaned up redundant empty-state-handling code left over from the reverted version.
- Verified directly: default state (fresh load) now correctly shows all 122 events; explicitly clearing every sport still correctly shows the empty state; both confirmed in standalone and backend-connected mode.

**v1.44 — full bug/data-integrity audit (clean), one more real Tennis addition**
- **Ran a genuine audit, not just a claim of one.** Checked all 122 events programmatically for: duplicate IDs, missing required fields, invalid sport/city references, malformed dates/times, out-of-range coordinates, invalid status values, impossible same-team-two-venues-same-day conflicts, accidental duplicate fixtures, and venue-name inconsistencies that would break the map's pin-grouping. Result: **clean** — no real issues found. One thing flagged and investigated: two Leicester venues (Welford Road, King Power Stadium) shared a rounded coordinate bucket in the check itself; verified their actual stored coordinates are correctly distinct — a false positive in the check, not a data bug.
- **Ran a full combined-feature regression** at current scale (search + date + sport + country + location + saved + theme + auth together, in both standalone and backend-connected mode) — all correct, zero errors, including confirming saved-state survives re-sorting when "near me" changes the list order.
- **Laver Cup added** — London's 3rd real tennis fixture, confirmed directly via The O2's own official site, including confirmed players (Alcaraz, Zverev for Team Europe; Fritz, de Minaur for Team World).
- Boxing remains at 1 event — searched again this round specifically, found real context confirming London/The O2 as a major boxing venue but no new fight with a confirmed date. Left honest rather than forced.
- 122 events, 37 cities, 13 sports.

**v1.43 — major London density push for the trip-planner groundwork; 2 new sports; date range extends into January 2027**
- **10 new London events, all confirmed via official club/league/venue sources:** 3 more Harlequins home fixtures (Twickenham Stoop), England hosting Japan and New Zealand (adding to Australia, already in the data — all 3 Nations Championship autumn internationals now present), the PDC World Darts Championship's opening night and the Masters snooker tournament (both at Alexandra Palace, both confirmed via the venue's own official site), and all 3 NFL London games (Colts v Commanders, Eagles v Jaguars, Jaguars v Texans).
- **Two new sports added: Darts and American Football** — 13 sports now, not 11.
- **The dataset now genuinely extends into January 2027**, via the Masters snooker tournament (10 Jan) — the date picker's range was extended to match, not left silently capped.
- **Honest finding on the actual trip-planner goal:** despite the density increase (London went from ~24 to 34 events), same-city same-day combinations only grew from 6 to 7 clusters, and most remain unusable — Premier League fixtures still cluster at fixed kickoff slots (12:30/15:00/17:30), so adding more football doesn't create more real trip options. The new Harlequins-v-Saracens pairing on 5 Dec looked promising but kicks off only 5 minutes apart (15:00 vs 15:05), which isn't a usable gap. **The one standout, genuinely combinable pairing found so far remains Arsenal (12:30) and Saracens rugby (17:30) on 10 Oct** — a real 5-hour gap. This confirms the earlier finding: cross-sport diversity, not raw volume, is what actually creates trip-planning material, and even then a real feasibility check (travel time between venues, accounting for match duration) is a separate piece of work the data alone can't solve.
- 121 events, 37 cities, 13 sports.

**v1.42 — two real bug fixes: card layout collision, map defaults to empty**
- **Fixed a genuine layout bug:** the sport-color dot on each card and the save/heart button were both landing in the top-right corner of the card and visually colliding — the dot is flex-positioned to the far right of `.card-top` while the save button is separately absolutely-positioned in the same corner. Fixed by reserving space for the save button so the dot sits clearly to its left.
- **Map now starts empty by default, list unaffected.** With no sport/country/date/search/location filter active, the map previously tried to show all 111 events across 7 countries at once — a cluttered, not-very-useful continent-wide pin-dump. It now shows a helpful prompt instead, and only renders pins once something has actually narrowed the results down. List view still shows everything by default, unchanged — this was specifically a map-only decision, since a map gets visually overwhelmed by scale in a way a scrollable list doesn't.
- Confirmed via direct testing that the sport-sheet's own "Clear all" already correctly emptied the map before this change — that specific path was never broken; this fix addresses the *global* "Clear all" / default-load case.

**v1.41 — quick wins, local venue time + timezone labels, country filter, past-event archiving**
- **Quick wins:** confirmed Netball wasn't actually a dead-end (the "only show sports with events" logic already correctly hides it — no fix needed, an earlier concern turned out to be wrong on inspection). Removed the REAL badge from every card — it was 100% redundant once every event in the dataset became real, with zero exceptions for many versions running. Fixed a stale README note still describing the old 3-city model.
- **Deferred, not forgotten:** the developer brief docx from very early in this project is now badly out of sync with the actual product, but its original build files didn't survive an earlier session reset — refreshing it is a substantial task on its own, intentionally not done in this round.
- **Times now show true local venue time, with a timezone label, everywhere** — this is the actual sports-media convention (broadcasters and ticket sites always state kickoff in local time, never converted to the reader's own timezone), not just a display shortcut. Reversed 6 event times that had previously been converted to a UK-equivalent for display consistency, restoring their real local kick-off time. The new `getTzLabel()` helper is date-aware, not just per-country — verified directly that a Barcelona fixture in September correctly shows "CEST" while a London fixture on Boxing Day (after the 25 Oct DST transition) correctly shows "GMT" rather than "BST".
- **Found and fixed a real gap while testing this:** the backend time corrections had been made, but the frontend's copy of the data was never regenerated afterward, so it was silently still showing the old incorrect times. Caught via direct testing before it shipped, not by luck.
- **New country filter**, deliberately built as an exact mirror of the sport filter (same button → sheet → live counts → Select all/Clear all pattern) for consistency — filtering to a single country (e.g. Spain) correctly narrows to exactly the matching cities and composes correctly with every other filter, including in backend-connected mode.
- **New: `scripts/archive-past-events.js`**, meant to be run periodically (not automatically), moves events whose date has already passed out of the file that ships to every user and into a permanent historical record (`archive/events-archive.json`) instead of letting them accumulate forever. Run once against the live dataset as part of this release — genuinely found and archived 4 already-stale events, not a hypothetical.
- 111 events, 37 cities (down from 115/111 events pre-archiving, reflecting real cleanup, not data loss — the 4 archived events are preserved in `archive/events-archive.json`).

**v1.40 — cheap fluid-layout fix for desktop (not a full redesign)**
- `#app` no longer stays pinned to a fixed 520px width on wide screens — added a `min-width:900px` breakpoint that widens the container to 1100px, centers it with margin, and gives it rounded corners + a shadow so it reads as an intentional floating card rather than a mobile app stretched into empty space.
- Mobile is completely unchanged (verified via screenshot comparison) — this only kicks in above 900px.
- Deliberately NOT a bespoke desktop redesign: map+list still toggle instead of showing side-by-side, and the sport-filter sheet still renders as a centered modal rather than a sidebar. Those are the next, separate phase, once there's a specific desktop UX design to build toward rather than just "make it not broken."

**v1.39 — deliberate non-football push: tennis, golf, snooker; Paris finally resolved without needing PSG**
- **Paris resolved cleanly**, sidestepping the PSG pitch-damage uncertainty from last round entirely: **Paris Masters** (ATP Masters 1000 tennis, La Défense Arena, the final Masters event of the ATP season) and **FedEx Open de France** (DP World Tour golf, Le Golf National) — both genuinely branded and associated with Paris, both from a different sport than the uncertain one. Paris now has 2 real sports and 0 dependency on PSG's unsettled schedule.
- **York added as a new city** via snooker's UK Championship — part of the sport's Triple Crown alongside the Masters and World Championship. Genuinely distinct from York Knights (rugby league), who are already mentioned in the dataset as an away team but still have no home fixture of their own.
- **This round was specifically about not just adding more football/basketball/rugby** — sport diversity is now real: Tennis and Golf both moved from 1-2 events to 2-3, Snooker from 1 to 2. Football is still the largest category by far (64 of 113 events) simply because it has the best free data availability, not because other sports weren't searched for.
- 37 cities, 113 events now.

**v1.38 — 4 of the 5 suggested European cities added; Paris deliberately left out with a real reason**
- **Barcelona, Berlin, Munich, and Rome added**, each with a real, officially-sourced fixture: FC Barcelona v Athletic Club (their first match back at a renovated Camp Nou), Bayern Munich v VfB Stuttgart (sourced directly from the Allianz Arena's own official fixture calendar), 1. FC Union Berlin v Eintracht Frankfurt (Bundesliga's own confirmed kickoff-times announcement), and Lazio v Genoa in Rome.
- **Barcelona gets a second sport already**: FC Barcelona basketball v Anadolu Efes Istanbul, EuroLeague opening night — same authoritative source pattern already used for Real Madrid's basketball fixture.
- **Paris was researched but deliberately not added**, for a genuinely interesting reason: PSG's actual first home match of the season (originally scheduled for Parc des Princes) was moved away entirely due to pitch damage from a recent heatwave — real, current news. That leaves their next actual home date unclear from available sources right now, so rather than guess, Paris stays open for a future round once their schedule stabilizes.
- **One fixture flagged with more uncertainty than the rest:** Lazio v Genoa's date is confirmed as "the weekend of 29–30 August" by the source, but the exact day wasn't independently pinned down by a second source — noted directly in the data rather than presented with false precision.
- 112 events, 35 cities now.

**v1.37 — 5 more single-sport cities resolved (Sheffield, Coventry, Wigan, Bradford, Madrid all now 2-sport); Glasgow time upgraded from estimate to confirmed**
- **Ice hockey:** Sheffield Steelers v Cardiff Devils and Coventry Blaze v Cardiff Devils — both confirmed via the clubs' own official 2026/27 fixture pages, exact face-off times included.
- **Football:** Wigan Athletic v Stockport County and Bradford City v Mansfield Town — both League One, both confirmed via the same Sky Sports fixture-listing page (URL itself dated to the correct day), found together in one search.
- **A genuinely nice detail:** Wigan Athletic groundshare the Brick Community Stadium with Wigan Warriors rugby league — same venue as the rugby league fixture already in the dataset, not a coincidence, a real fact about the stadium.
- **Glasgow Warriors' kickoff time upgraded from a v1.25 estimate (17:45) to a confirmed one (19:45)**, found while independently re-verifying the URC fixture during this round — the date itself was already correct, only the specific time needed fixing.
- **Tried and came up empty this round:** Newcastle Eagles (basketball), autumn tennis/golf events for the multi-sport cities (Birmingham's own tennis tournament turned out to be in June, outside the tracked window). Left as-is rather than forced.
- 105 events, 31 cities.

**v1.36 — single-sport-city push: Madrid gets a second sport, most others stay honestly single-sport**
- Madrid: Real Madrid v Unicaja, EuroLeague basketball, confirmed via Real Madrid's own official site — their EuroLeague home opener.
- **Worth being direct about the actual hit rate this round:** of the ~18 genuinely single-sport cities, only Madrid resolved with a confirmable second sport. Specifically searched and came up empty for: Amsterdam (found leads — a Dutch sport called korfball, a possible combat-sports event at RAI Amsterdam — but nothing clean enough to confirm confidently), Newcastle (basketball/rugby), Belfast (Ulster Rugby, Belfast Giants ice hockey, Northern Ireland football — tried all three across this and earlier sessions), and Perpignan's own rugby union club (USAP, separate from the rugby league club already covered). These stay as-is rather than being padded out with unconfirmed guesses.
- 103 events, 31 cities.

**v1.35 — full Super League team audit: 3 of 5 missing teams added, 2 confirmed still missing**
- Cross-checked the dataset against Super League's own official 14-team list. Found 5 teams entirely missing: Catalans Dragons, Hull FC, Leigh Leopards, Warrington Wolves, York Knights.
- **3 resolved with confirmed home fixtures:** Hull FC v Warrington Wolves (Hull's *other* rugby league club — groundshares the MKM Stadium with Hull City AFC), Warrington Wolves v Leigh Leopards (new city), and Catalans Dragons v York Knights in Perpignan (new city — the second Super League city outside the UK/Ireland, alongside Toulouse).
- **Leigh Leopards and York Knights remain genuinely missing** — both appear as *away* teams in fixtures above, so they're represented in the data, but neither has a home fixture of its own yet. Searched specifically for both and came back without a clean confirmed date — left open rather than guessed.
- All 14 Super League teams now appear somewhere in the dataset, 12 of them with their own home fixture.
- 102 events, 31 cities now.

**v1.34 — sport filter gets Select all / Clear all; second-sport depth for Hull, Cardiff, Leicester**
- **Fixed a real bug in my own new sport-filter sheet** (introduced in v1.32, caught before it shipped further): "Clear all" only cleared sports currently visible in the sheet, silently leaving hidden/irrelevant sports (e.g. Netball, which has zero events right now) still selected — so the button badge would show "(1)" instead of "(0)" after clearing everything. Fixed so both "Select all" and "Clear all" now operate on every sport unconditionally, matching what those words should actually mean.
- **Hull, Cardiff, and Leicester each get a genuine second sport**, all confirmed via the relevant club's own official site: Hull KR v Huddersfield Giants (rugby league — Hull's *other* rugby league club, since Hull FC already covers the city's first), Cardiff Devils v Guildford Flames (ice hockey, their EIHL season opener), and Leicester City v Wigan Athletic (Championship football).
- **Caught and corrected a real day-name error in a source, not just repeated it:** the Cardiff Devils fixture was reported as "Saturday 23rd September," but 23 September 2026 is actually a Wednesday — independently verified two different ways. Kept the specific date (unlikely to be the error) and corrected the day label (an easy copy mistake) rather than trusting the source's day-name at face value.
- 99 events, 29 cities now.

**v1.33 — 6 more rugby league cities added, Toulouse gets genuine two-sport coverage**
- **Castleford, Bradford, Huddersfield, St Helens, Wakefield, and Toulouse added** — all 6 clubs specifically named, each with a real, well-sourced home fixture (Castleford Tigers' own official fixture list cross-confirmed against a live ticketing platform's schedule for most of these, not a single weak source).
- **Toulouse specifically gets two different sports from two different clubs**, as asked: Toulouse Olympique (rugby league, Super League, Stade Ernest-Wallon) and Stade Toulousain (rugby union, Top 14, Stadium de Toulouse) — different code of rugby, different stadium, confirmed as two separate real fixtures via independent sources for each.
- Rugby League now has 10 real fixtures across 8 cities (up from 3 across 2), genuinely representing the sport's actual English heartland rather than just the two biggest clubs.
- 29 cities, 96 events total now.

**v1.32 — sport filter rebuilt: collapsed button + only shows sports with events**
- Replaced the horizontally-scrolling sport chip row (with left/right arrows) with a single "Sports (N)" button that opens a selection sheet — the combination of the two declutter options discussed, not just one.
- **The sheet only lists sports that actually have at least one matching event under the current filters** (date/search/saved/location) — it recalculates live. With no other filters active it showed 10 relevant sports; narrowing to a single date (5 September) correctly shrank it to just 4 (Football, Rugby, Rugby League, Boxing) — verified directly, not just visually spot-checked.
- Each row shows a live event count per sport, and a "Show N events" button previews the result before closing the sheet.
- The old scroll-arrow mechanism (added a few versions ago) is now fully removed rather than left as dead code alongside the new button.

**v1.31 — Wigan added (closing a data loop from the rugby league addition)**
- Wigan added as a city — "Wigan Warriors" was already an opponent in the Leeds Rhinos fixtures but had no home city of its own. 1 real fixture: Wigan Warriors v Catalans Dragons, their final regular-season home game, at the Brick Community Stadium (shared with Wigan Athletic football).
- **Flagged honestly rather than hidden:** the exact date for this fixture wasn't found in a single confirmed source — it's inferred from the confirmed round pattern (away at Leeds on 5 Sep, so the final round the following week). Both the date and time carry more uncertainty than most other entries, noted directly in the seed data.
- 89 events, 23 cities now.

**v1.30 — Rugby renamed, Rugby League added as its own sport**
- "Rugby Union" renamed to plain "Rugby" throughout.
- **Added Rugby League as a distinct sport** ("Rugby League" — the standard, unambiguous name; considered "Rugby 13"/"Rugby XIII" but those are more colloquial/regional terms, less universally recognized than the name the sport actually goes by in England). 3 real fixtures: the Betfred Super League Grand Final (Old Trafford, Manchester — venue confirmed, opponents genuinely unknown this far ahead since they're decided by September's play-offs, noted honestly rather than guessed), and two Leeds Rhinos home games at Headingley (v Wigan Warriors, v Hull FC), both sourced from Leeds Rhinos' own results/fixtures feed.
- 88 events now.

**v1.30 — Rugby renamed, Rugby League added as its own sport**
- "Rugby Union" renamed to plain "Rugby" throughout.
- **New sport: Rugby League** (11 sports total now). Added the Betfred Super League Grand Final, 3 October, Old Trafford — confirmed via multiple independent sources.
- **Honest finding worth knowing:** Super League's 2026 regular season runs February–September, with the Grand Final on 3 October — so the regular season is already concluding by the time this app's date window begins. That's why there's no Leeds Rhinos or Hull FC/Hull KR *regular-season* fixture despite both cities having Super League clubs — the season structure genuinely doesn't overlap much with Aug-Dec, not a research gap. The Grand Final is listed without named finalists, since play-off qualifiers aren't determined this far ahead — same honest approach as other events where a detail genuinely isn't knowable yet.

**v1.29 — verification pass found and fixed 7 real kickoff-time errors; added England rugby, basketball, and more depth**
- **This was a genuine audit, not a re-stamp.** Rather than claim to re-verify all 85 events individually (not realistic in one pass), the existing dataset was cross-checked against the Premier League's own official 2026/27 fixture announcement — the single most authoritative source available — and it caught real errors: **7 kickoff times were wrong**, all because earlier entries had used a "standard 15:00 Saturday slot" assumption where the actual scheduled time was 12:30, 17:30, or 20:00 instead. Corrected: Fulham v Chelsea, Crystal Palace v Man City, Arsenal v Leeds, Newcastle v Hull, Newcastle v Aston Villa, Everton v Ipswich, Everton v Chelsea. Dates, venues, and opponents were all already correct — only the specific kickoff minute was off.
- **England rugby added, as requested:** England v Australia, 8 November, the opening fixture of the brand-new Nations Championship format at Twickenham (now officially "Allianz Stadium") — replacing the traditional Autumn Nations Series this year.
- **Basketball gets a second fixture:** London Lions v Manchester Basketball, a real rivalry matchup between the UK's two biggest basketball markets, confirmed via the London Lions' own official schedule.
- **Leeds and Coventry — two of the thinnest cities — got real depth** using the same official Premier League source: Leeds United v Crystal Palace, and two Coventry City fixtures (v Hull City, v Newcastle United).
- 85 events total now. Cardiff, Sheffield, Leicester, and Belfast were also re-checked this round but didn't turn up anything new to correct or add — left as-is.

**v1.28 — Hull, Brighton, Amsterdam added; depth added across several thin cities**
- **22 cities now, 78 events** (up from 65). Hull, Brighton, and Amsterdam all succeeded this round — same cities, better-targeted searches.
- **Amsterdam's data is unusually well-confirmed:** Ajax's own official fixture announcement and the Johan Cruijff ArenA's own venue calendar independently corroborate each other on every date used, including De Topper (Ajax v PSV) — the single biggest fixture in Dutch domestic football.
- **A single source (Brighton's own official fixture list) efficiently added depth to 4 cities at once**, not just Brighton itself — their listed opponents' home fixtures (Hull, Bournemouth, Nottingham Forest) were each other's confirmed home fixtures too, since a fixture list showing "who Brighton play and where" also confirms the reverse fixture for whoever's hosting.
- **Previously-thin cities got real depth, not just new cities:** Newcastle (1→3 events), Sunderland (1→2), Bournemouth (1→2), Nottingham (1→2), and Liverpool went from 3 to 5 — several of these using fixture data that had actually already been found earlier in this project but not yet used.
- **Cardiff, Sheffield, Leeds, Leicester, and Coventry were searched for additional depth this round but came back empty** — mostly returning stale 2025/26-season results rather than new 2026/27 fixtures. Left at their existing single fixture each rather than added on weak evidence.
- Verified the full 78-event, 22-city dataset as one system: chronological sort holds correctly across the whole set, map pin-grouping correctly collapses 78 events into 41 distinct venues, and search/backend-connected mode both re-tested against the final numbers.

**v1.27 — replaced the 4 dropped cities, added Madrid (first non-UK/Ireland city), fixed accent-insensitive search**
- **19 cities now, 65 events.** As requested, replaced the 4 cities that didn't pan out last round with easier-to-find ones: **Sunderland**, **Bournemouth**, and **Coventry** (UK), plus **Madrid** for Europe instead of Amsterdam. All 4 confirmed via multiple independent sources agreeing on the same date.
- **Newcastle actually got solved this round as a bonus** — not because the city is inherently harder, but because a better-targeted search this time turned up clean, cross-confirmed data (exact date + time + opponent from a single source, corroborated by a second). Added back rather than left out, on top of the 3 requested replacements.
- **The headline fixture is a proper one:** El Derbi Madrileño — Atlético Madrid v Real Madrid, 20 September, confirmed independently by Real Madrid's own official site plus three other sources all agreeing on the date. First fixture in the dataset outside the UK and Ireland.
- **Found and fixed a real search bug while testing this round:** searching "atletico" (no accent) returned zero results because the data correctly stores "Atlético" with the accent, and the comparison was exact-match. Fixed by normalizing accents/diacritics on both the search query and the searchable text before comparing — verified "atletico" and "atlético" now return identical results. This matters a lot more now that the dataset includes non-UK names, and will matter more with each further European city.
- Hull, Brighton, and Amsterdam were not re-attempted this round — they remain open for a future pass if wanted, rather than folded into this one.

**v1.26 — Leeds, Leicester, Belfast added; Newcastle/Hull/Brighton/Amsterdam deliberately left out**
- **14 cities now, 60 events.** Leeds (v Newcastle, Premier League, Elland Road), Leicester (v Newcastle Red Bulls, Premiership Rugby Cup — both official-source confirmed), and Belfast (the BetVictor Northern Ireland Open, a real World Snooker Tour ranking event at the Waterfront Hall).
- **Snooker gets its first real fixture.** The sport existed in the app since the beginning but every snooker entry so far had been demo or since removed — the Belfast addition is the first genuinely verified snooker event in the dataset.
- **Newcastle, Hull, Brighton, and Amsterdam were researched but deliberately not added.** For Newcastle specifically: confirmed home match *dates* existed via the club's own site, but couldn't confidently match a specific date to a specific opponent — sources gave dates without opponents, or opponents without matching dates, and rather than guess which Saturday Newcastle play a given team, the city was left out entirely. Hull, Brighton, and Amsterdam didn't yield verifiable fixtures in this research pass at all. All four remain candidates for a future round rather than being padded out with a best-guess fixture.
- One data-quality catch during this round: the Leeds v Newcastle date came from an authoritative source (the date encoded directly in Leeds United's own match-centre URL) that conflicted with a preview article's claim it was a "Friday night" fixture — the URL-derived date (a Monday, per independent weekday calculation) was trusted over the descriptive prose, since a specific structured fact is more reliable than a loosely-worded aside.

**v1.25 — extended through December 2026**
- **9 new fixtures, dataset now genuinely runs 21 August through 26 December** (59 total events). The headline addition is a real **Boxing Day cluster**: 6 confirmed 2026/27-season fixtures on the same day (26 Dec, 15:00 kickoff, per the Premier League's own announcement), across 4 cities at once — Crystal Palace v Arsenal, Fulham v Brighton, and Tottenham v Bournemouth in London, plus Aston Villa v Leeds (Birmingham), Man Utd v Nottingham Forest (Manchester), and Everton v Sunderland (Liverpool). Real stress test for the cross-city date-selection feature, and it held up correctly.
- Rugby extended into December too: Saracens v Northampton (London), Glasgow Warriors v Section Paloise (Champions Cup), and Sale Sharks v Leinster — a rematch of last season's Champions Cup finalists (Manchester).
- **Caught and fixed my own consistency error before shipping:** initially entered Sale Sharks' December fixture under a different venue name/coordinates ("CorpAcq Stadium") than their existing September fixtures ("Salford Community Stadium") — same physical stadium, different sponsorship-era name. Fixed to match, and specifically verified afterward that all Sale Sharks fixtures now resolve to one consistent venue (so the map's pin-grouping feature correctly bundles them, rather than splitting one stadium into two phantom pins).
- **Left an honest gap rather than guess:** couldn't confirm 2026/27-specific December fixtures for Sheffield, Nottingham, Cardiff, Edinburgh, or Dublin — some ice hockey sources found during research turned out to describe the already-concluded 2025/26 season, and rather than risk using a wrong-season date, those cities simply don't have new December fixtures yet.

**v1.24 — Dublin added, date range extended to end of 2026**
- **Dublin is the first non-UK city** — 6 real fixtures across boxing, rugby, and football, reflecting Ireland's actual sports landscape rather than forcing a UK-shaped template onto it. Highlights: Katie Taylor's world title fight at Croke Park, two Ireland Autumn Nations Series rugby internationals, and two Republic of Ireland UEFA Nations League matches.
- **Added Boxing as a new sport category** rather than shoehorning Katie Taylor's fight into an existing one — it didn't fit football/rugby/basketball/etc., and it's a big enough real event to warrant its own filter. 10 sports now, not 9.
- **Date range extended from "end of September" to "end of 2026"** — both the date picker's selectable range and the actual dataset, which now runs from 21 August through 14 November. 6 new fixtures for the original/existing cities extend into October (Arsenal v Leeds, Aston Villa v Man City, Glasgow Warriors' and Edinburgh Rugby's first home URC games of the season, two more Bristol Bears fixtures), reusing solid data already found in earlier research rather than re-researching from scratch.
- **Where exact kickoff times weren't confirmed** (a few of the October rugby fixtures, and 2 of the Dublin internationals), the standard slot for that fixture type is used and explicitly flagged in the seed data comments as an estimate — the date/teams/venue are solid, only the exact minute is a reasonable default rather than a confirmed fact, consistent with how this was already handled for Cardiff earlier.
- Verified end to end: default view now shows 48 events across 11 cities and 10 sports, search correctly finds Dublin/boxing/Katie Taylor/Croke Park, the date picker's new December boundary works, and selecting a November date correctly surfaces the right fixture (Ireland v Fiji) — tested in both standalone and backend-connected mode.

**v1.23 — 7 new cities added: Liverpool, Bristol, Sheffield, Nottingham, Glasgow, Cardiff, Edinburgh**
- **10 cities total now, 38 events, 9 new real fixtures** — all researched and sourced the same way as the original 3 cities (official club sites prioritized, cross-checked against ticketing sites), not invented. Highlights: the **Old Firm derby** (Celtic v Rangers, Celtic Park, 20 Sept) confirmed by three independent sources, the **Edinburgh derby** (Hibernian v Hearts), and a genuine West Country rugby derby (Bristol Bears v Gloucester).
- **Caught a real source conflict and handled it honestly rather than guessing:** for Cardiff City v Sheffield United, two independently-checked sources disagreed on kickoff time by 3 hours. Rather than pick one arbitrarily, the fixture uses the standard slot for that day/competition, and this is noted directly in the seed data comments — the date/teams/venue are solid, the exact minute is a reasonable default, not a confirmed fact.
- **Bristol is the standout multi-sport addition** — 2 real fixtures (Championship football + Premiership Rugby Cup) at the same venue (Ashton Gate), which also became a good test case for the venue pin-grouping feature from a few versions back.
- Verified this at scale, not just spot-checked: default view now correctly shows all 36 events across 10 cities, search finds every new city and team correctly, map pin-grouping correctly collapsed 36 events into 25 distinct venue pins without error despite the much wider geographic spread (England, Scotland, and Wales now, instead of 3 English cities), and — a good stress test for the "date selection spans all cities" feature from earlier — selecting 29 August correctly surfaced the genuine cluster of same-day fixtures across London, Liverpool, Bristol, and Cardiff simultaneously.
- Rugby's URC (Glasgow Warriors, Edinburgh Rugby) was deliberately left out for these two cities: both clubs open their 2026/27 season away, with first home fixtures not until October — confirmed via official sources, not a research gap, genuinely nothing to add within this window.

**v1.22 — removed the 3-city selector; this was a real simplification, not just a UI change**
- The London/Manchester/Birmingham tabs are gone. The app now always shows events across all cities at once — narrowing down to a specific place is what search and "near me" are for, matching the earlier plan to eventually go city-agnostic across Europe (see the "Known future direction" note above).
- This let a genuine amount of underlying complexity come out, not just the tab UI: the whole "city-scoped vs. cross-city" distinction that search and date previously had to manage — including a shared function that decided when to re-fetch all cities vs. one city from the backend — no longer needs to exist, because there's no more "one city" mode to switch out of. `setSearchAndDate` is now a plain synchronous function instead of juggling conditional fetches; `loadCityEvents` is gone entirely; the backend now just loads everything once at startup.
- Verified this thoroughly rather than assuming the simplification was safe: default view now correctly shows all 27 events across all three cities immediately (no tab needed), search/date/location/saved all still compose correctly, and the backend-connected mode was specifically re-tested since it was the highest-risk part of this change — confirmed it connects and loads the full cross-city dataset from the very first render, and that toggling Saved on and back off correctly returns to the full list rather than some stale single-city subset.
- Every event card now always shows its city (previously only did this when cross-city mode was active) — worth knowing since it changes card height slightly.

**v1.21 — removed development scaffolding that leaked into the real UI**
- **Removed the scrolling ticker** above the search bar entirely.
- **Removed the "Live: X v Y confirmed reachable" status line** and the client-side fetch attempt behind it. This was originally built mid-project to demonstrate a real technical point (that browsers get blocked by CORS when calling most sports APIs directly, which is why a backend is needed) — useful as a one-off demo at the time, but it was never a real feature and had no business staying in the shipped UI. Real fixture data is now baked directly into the dataset and doesn't depend on this fetch attempt at all.
- **Kept, not removed:** the backend-connection status line. Unlike the CORS-demo message, this reports something genuinely true and useful — whether the app actually reached a real backend, if one is configured via `API_BASE`. It's now hidden by default in standalone mode (matching the current default setup) and only appears at all once someone deploys and connects a real backend, where it remains a legitimate diagnostic rather than debugging noise.

**v1.20 — active filters bar**
- Built the feature from the earlier mockup: when sport, date, search, and/or "near me" are active, a row of removable pills appears above the results showing exactly what's currently narrowing things down — tap any pill's ✕ to drop just that filter, or "Clear all" to reset everything at once.
- Refactored search/date handling into one shared function (`setSearchAndDate`) used by the search box, date input, pill ✕ buttons, and Clear all — previously the same cross-city fetch logic was duplicated between the search and date handlers, which risked them drifting out of sync as more entry points were added.
- **Specifically tested the tricky partial-clear case**, not just the obvious ones: with both search and date active (cross-city mode), removing only the search pill correctly *keeps* cross-city mode active — because the date filter alone still requires it — rather than incorrectly reverting to single-city browsing. Verified in both standalone and backend-connected mode.
- Verified the full set: no pills shown when nothing's active, all four pill types appear/format correctly when stacked, each pill's ✕ removes only that filter and syncs the underlying input control, and "Clear all" resets sport/date/search/location together in one step.

**v1.19 — word-by-word search matching**
- Search now matches each typed word independently (all must appear somewhere, any order) instead of treating the whole query as one contiguous substring. Previously "chelsea arsenal" found nothing because that exact phrase never appears anywhere, even though "Arsenal v Chelsea" obviously should have matched. Verified against 7 query patterns including reversed word order, venue+sport combos, and city+sport combos — all correct, in both standalone and backend-connected mode.

**v1.18 — verified location + search + date all compose correctly, fixed a real search gap found along the way**
- Explicitly tested every ordering of location, search, and date together — location→date, date→location, search→location, location→search, and all three combined in different orders — in both standalone and backend-connected mode. All 10+ combinations verified correct, including the highest-risk path (a three-way filter combination arriving in a different order than initially tested, while connected to the real backend).
- **Found and fixed a real gap while testing this:** search never included the sport's own name in what it matches against — searching "cricket" returned zero results even though real cricket fixtures existed, because the word "cricket" doesn't appear in any event's title, venue, or competition tier. Fixed by adding the sport name to what search matches against. Verified the fix directly: "cricket" now correctly returns both cricket fixtures.
- Confirmed location doesn't filter results by itself (by design) — it only changes sort order (nearest-first) and adds distance display — so it composes with search/date rather than fighting them, and clearing all filters correctly returns to normal single-city browsing regardless of what order they were applied in.

**v1.17 — demo data removed, real fixtures only**
- All 18 demo/invented events removed from `seed-data.js`. The dataset is now 29 events, every single one a genuine, verifiable fixture — nothing left to distinguish with the REAL/DEMO badge system, though that UI is kept in place (harmless, and ready to correctly resurface the distinction if demo data is ever reintroduced for a sport/city gap before real data is found for it).
- **Coverage is now honestly uneven, on purpose:** London has 6 sports covered, Manchester 3, Birmingham 3 — reflecting where real open-source data was actually found, not padded out to look more complete than it is. Several sport/city combinations (e.g. Birmingham basketball) now correctly show the "no events match your filters" empty state instead of a demo fixture standing in for missing real data.
- Verified this didn't break anything that depended on there being a full grid of city×sport data: chronological sort, cross-city search and date selection, venue-based map pin grouping, the backend-connected mode, and the full auth/save flow were all re-tested against the trimmed dataset, including deliberately testing an empty-result combination to confirm it fails gracefully rather than erroring.

**v1.16 — real data expanded to every sport, using only free/open sources**
- **Every sport now has at least one real fixture** — 29 real fixtures now (up from 23), and for the first time this includes tennis, golf, and cricket, not just football/rugby/basketball. Netball was deliberately left without one: its 2026 season runs February-June, confirmed via London Pulse's own published fixtures, so there's genuinely nothing happening in the Aug-Sep window — not a research gap.
- **New fixtures added, all sourced from free/open channels** (no scraping, no ToS violations — consistent with the sourcing-ethics research from the previous round):
  - Cricket: Warwickshire v Leicestershire (Edgbaston) and Middlesex v Northamptonshire (Lord's), both County Championship, 24 September — sourced from Edgbaston's and Middlesex CCC's own published fixture announcements.
  - Tennis: Great Britain v Ecuador, Davis Cup Qualifier, Copper Box Arena, 19 September — sourced from the LTA's own ticketing/news pages, cross-checked against the venue's own event listing.
  - Golf: Betfred British Masters (The Belfry, 27 August) and BMW PGA Championship (Wentworth Club, 17 September) — both real DP World Tour events, sourced from the official 2026 tour schedule.
  - Ice hockey: a second real Manchester Storm fixture (v Nottingham Panthers, 26 September, AO Arena) — confirmed directly from the club's own official schedule, explicitly marked as a home game.
- **Caught and corrected an inaccuracy in the existing demo data** while researching this: the old placeholder snooker fixture had been invented as being in Birmingham, but the real 2026 English Open (snooker) is actually in Brentwood — outside the three tracked cities. Left the old (already past, auto-hidden) demo entry in place rather than editing history, but didn't replace it with a fabricated Birmingham fixture — snooker/darts remain honestly without real data for now rather than papered over.
- Verified the expanded dataset against every existing feature rather than assuming it would "just work": chronological sort holds correctly in all three cities, venue-based pin grouping on the map correctly handles new shared venues (Copper Box Arena now correctly groups 2 fixtures — tennis and basketball — under one pin), cross-city date selection correctly surfaces both new cricket fixtures together on 24 September, and search correctly finds the new Davis Cup fixture.

**v1.15 — navigation arrows for the sport filter row**
- Added ‹ › arrow buttons flanking the sport chips, since the row (9 sports) overflows the screen width with no visual hint that more chips exist off-screen. Arrows scroll smoothly and correctly disable at each end (dimmed and non-clickable) rather than just stopping silently, so it's always clear whether there's more to scroll. Verified the exact scroll distance and boundary behavior directly: confirmed the row reaches precisely its true scrollable maximum and returns precisely to 0, with arrow states flipping correctly at both ends.

**v1.14 — fixed list sort: was never actually chronological**
- **Real bug, not a missing feature:** the list was sorting by the *display* date string ("Sat 05 Sep") rather than the real date. Comparing those strings alphabetically sorts by day-name first — Fri, Mon, Sat, Sun, Thu, Tue, Wed — which is not chronological order at all. With only a handful of same-week demo events this mostly went unnoticed; it became obvious once real fixtures spanned late August through September. Fixed by sorting on the actual `isoDate` + `time` fields instead. Verified directly against the real dataset (not just spot-checked): confirmed strict chronological order for both London and Manchester, including correctly ordering same-day fixtures by kickoff time (e.g. the three 12 September matches sit together, ordered 15:00, 15:00, then 17:30).

**v1.13 — map pins grouped by venue to avoid stacking**
- With real fixture data now covering multiple matches at the same stadium (Tottenham Hotspur Stadium alone has 3 fixtures in the window), plotting one pin per event meant pins stacking exactly on top of each other at busy venues — impossible to tell there was more than one. Map pins are now grouped by venue: each venue shows a single pin for its soonest upcoming fixture, with a small numbered badge (e.g. "3") when more are coming up there. Tapping the pin still opens the full detail sheet for that soonest event, same as before.
- **The list view is completely unaffected** — it still shows every fixture individually via the same `filteredEvents()` data, unmodified. The grouping is purely a map-rendering concern.
- Verified directly (can't see real map tiles in this sandbox — see earlier notes on that limitation): confirmed London's 14 upcoming events correctly collapse to 8 map pins, with Tottenham Hotspur Stadium's 3 fixtures correctly resolving to the soonest one (29 August) rather than a later date, and the badge count matching the true number of fixtures at each venue.

**v1.12 — full September real-fixture coverage + cross-city date selection**
- **Massively expanded real fixture coverage**: 23 real fixtures now (up from 9), covering football, rugby, and basketball as requested, from today through the end of September. Football covers every Premier League match at a London, Manchester, or Birmingham venue through the September international break (the season doesn't resume until 10 October, confirmed via official match data, so this is genuinely complete for the requested window — not an arbitrary stopping point). All sourced and verified the same way as before: matchesio.com's official `.ics` files for football, Ticketmaster's venue listing for Sale Sharks' Manchester rugby fixtures.
- **Caught and avoided a real mistake before it shipped**: initially found what looked like a confirmed Manchester Basketball fixture for the 2026/27 season, but on closer inspection the source article was actually reporting the *2025* season opener, not 2026. Skipped adding it rather than risk mislabeling a past fixture as upcoming — Manchester and Birmingham basketball remain honestly without real data for now rather than papered over with an incorrect date.
- **Date selection now spans all three cities**, matching the same fix already applied to search — picking a date shows everything happening that day across London, Manchester, and Birmingham on both map and list, rather than being silently limited to whichever city tab happened to be active. Verified directly: selecting 5 September correctly returns all 5 matching events (2 in Manchester, 3 in London) with no city tab highlighted, exactly as it should.
- Search and date filters now correctly compose with each other in all combinations (date only, search only, both together, backend-connected or standalone) — tested each combination directly rather than assuming they'd work together correctly.

**v1.11 — more real Arsenal fixtures + a real backend search bug fixed**
- **Added a second real Arsenal fixture:** Arsenal v Chelsea, Sunday 6 September, Emirates Stadium — verified via the match's own `.ics` file. Searching "arsenal" now correctly shows both of Arsenal's fixtures within the tracked window (the Aug 31 away game at Aston Villa, and this new home game), rather than just one.
- **Found and fixed a real bug specific to backend-connected mode:** cross-city search worked correctly in standalone demo mode but silently returned incomplete results when connected to a real backend — searching "arsenal" while on the London tab returned only 1 result instead of 2. Root cause: in backend mode, the local `EVENTS` array only ever holds whichever single city was last fetched from the server, so "searching all cities" was actually still only searching whatever one city happened to be cached client-side. Fixed by adding a dedicated `loadAllEvents()` fetch (calling `/api/events` with no city filter — already supported server-side, no backend changes needed) that runs specifically when a search begins, and correctly reverts to normal single-city fetching when the search is cleared. Verified the full cycle: search returns correct cross-city results, clearing search correctly returns to single-city data, and repeating the search-then-clear cycle after switching cities still works correctly.

**v1.10 — diagnosed and fixed real-device map failure**
- **Real bug report from an actual phone:** map wouldn't load (list worked fine) when the HTML file was opened by tapping it directly in Safari. Diagnosed via the user's own description of the symptom (the app's fallback message was showing, confirming it wasn't a crash) plus how the file was opened (tapped directly = `file://` origin). Root cause: Safari and most mobile browsers deliberately block pages opened as local files from loading external resources — list view has zero external dependencies so it's unaffected, while the map depends entirely on loading Leaflet's script and map tiles from a CDN, which is exactly what gets blocked. This is a browser security restriction, not a bug in the map code itself.
- **The fix isn't a code patch — it's hosting the file properly.** Opening it via a real `http://`/`https://` link (even a free static host) instead of tapping the downloaded file resolves this immediately, because that restriction only applies to `file://` pages.
- **What was improved in the code:** the fallback message now detects `file://` specifically (via `location.protocol`) and tells you exactly what's wrong and what to do about it, instead of a generic "check your connection" that wouldn't have pointed at the real cause. Verified both branches: the specific message shows correctly when opened as a local file, and the original generic message still shows correctly for other failure causes (e.g. genuinely no internet) when hosted normally.

**v1.9 — search now spans all cities**
- **Fixed a real usability gap:** search was silently scoped to whichever city tab happened to be selected, so searching "Arsenal" while on the London tab returned nothing — even though Arsenal's next fixture (away at Aston Villa) was sitting right there in the Birmingham data. Verified this was the actual behavior before fixing it, then confirmed the fix: searching "arsenal" while on the London tab now correctly returns the Birmingham fixture.
- Search now spans all three cities at once, the same pattern already used for the Saved view — no need to click through each city tab to find a team.
- Since results can now span cities, each list card shows its city when search (or Saved) is active, and city tabs de-highlight to make it visually clear no single city is the active filter. Selecting a city tab clears the search and returns to normal single-city browsing.
- You can now also search by city name directly (e.g. typing "manchester" matches every Manchester event).

**v1.8 — real fixtures + automatic past-event removal**
- **Past events now disappear automatically, permanently.** `filteredEvents()` compares every event's date against the real current date (`new Date()`, computed fresh on each page load — not a hardcoded value), and excludes anything before today. This isn't a one-time data cleanup; it's a standing rule that stays correct on its own as real time passes, verified by confirming the app's computed "today" matched the real system clock and that every event shown afterward had a date on or after it. The date picker's minimum selectable date now also tracks today automatically instead of a fixed August 1 floor.
- **Football is now genuinely real for all three cities** (2 fixtures each, London/Manchester/Birmingham) — sourced from matchesio.com's live Premier League calendar and verified against individual match `.ics` files for exact kickoff times, then converted from UTC to local BST. These are real scheduled Premier League fixtures, not invented: Fulham v Chelsea, Crystal Palace v Man City, Man Utd v Ipswich, Man City v Coventry, Aston Villa v Arsenal, Aston Villa v Nottingham Forest.
- **Rugby and basketball are real for London**, sourced from ultimaterugby.com and the London Lions' official schedule respectively (Saracens v Northampton Saints — Premiership Rugby Cup; London Lions v Liverpool Basketball — Super League Basketball). **Not yet real for Manchester/Birmingham** — no verified fixture data found for those specifically in this pass; they'll show fewer events for those sports until real data is added, rather than being padded out with more invented fixtures.
- Search bar and date filter now correctly combine with the past-event exclusion — tested searching "villa" returns 0 results in the wrong city and 2 in the correct one, confirming filters compose correctly rather than just working in isolation.

**v1.7 — search and date filtering**
- **Added a search bar** — filters events live as you type, matching against team/event name, venue, area, and competition tier. Works alongside every other filter (city, sport, saved, date).
- **Added a date picker**, scoped to August–September 2026 as requested. Selecting a date filters the map and list down to that exact day. Combines correctly with search and sport filters — verified with automated tests: searching "arsenal" correctly returned exactly the 2 Arsenal fixtures across both months, selecting 12 Sep correctly isolated to 1 matching event, and combining both narrowed correctly to the intersection.
- **Extended demo data into September** (6 new fixtures across the three cities/several sports) so the date range actually has something to show in both months — previously everything sat in mid-to-late August only. All new events are demo/invented, tagged the same as the rest of the non-"real" dataset.
- Every event now carries a real `isoDate` field (alongside the existing display-friendly `date` string) specifically to support exact-date filtering — added to all 18 original events plus the 6 new ones.

**v1.6 — fixed detail sheet being invisible behind the map**
- **Real bug, confirmed and fixed:** tapping an event pin on the map opened the detail sheet correctly, but it rendered *invisibly behind* the map instead of on top of it — so it looked like nothing happened. Root cause: Leaflet's `.leaflet-container` uses `position:relative` with no `z-index`, which (per the CSS spec) does not create a new stacking context — so Leaflet's internal layers (tiles, markers, popups; z-index up to 700 in Leaflet's own source) were free to compete directly against the detail sheet's overlay (z-index 20) instead of being contained within the map. Fixed by adding `isolation:isolate` to the map's container, which cleanly contains all of Leaflet's internal stacking so it can never render above the rest of the app, plus raised the overlay's own z-index as a second safeguard. **Verified with a standalone reproduction** built from Leaflet's actual documented internal z-index values — confirmed the bug reproduces exactly as described, and confirmed the fix resolves it, before shipping.
- This only affected opening the sheet *from the map* — list-card taps were never affected, since the map (and its internal stacking) isn't rendered at all while list view is active.

**v1.5 — dark/light mode + map-click fix**
- **Added a dark/light mode toggle** (🌙/☀️ button in the header). Built on CSS custom properties, so it's a clean toggle rather than a maintenance burden — app chrome (background, tabs, chips, buttons) switches between themes, while the ticker deliberately stays permanently dark as a signature "lit scoreboard" element regardless of theme, and event cards stay paper-colored in both (a deliberate design choice, not an oversight). The map's tiles also switch between CartoDB's dark and light basemaps to match. Theme choice is in-memory only (resets on reload) — same pattern as login tokens, for the same reason (no browser storage used).
- **Fixed a real UX bug in map pin clicks:** every pin previously had both a Leaflet popup *and* a click handler bound to it, so tapping a pin fired both at once — a small popup bubble and the full detail sheet appeared simultaneously, which looked confusing/broken. Removed the redundant popup; tapping a pin now goes straight and cleanly to the same full detail sheet used by list cards.

**v1.4 — map improvements**
- **Dark map tiles** (CartoDB's free dark-themed tiles) instead of default light OpenStreetMap tiles — matches the app's dark theme instead of looking like a generic embedded map. Same underlying OSM data, no API key needed.
- **Real "near me" geolocation.** Tapping the new locate button (◎, bottom-left of the map) requests the device's actual GPS location via the browser's Geolocation API, drops a distinct blue marker at the real position, and centers the map there. This was the very first feature described at the start of this whole project ("enabling my localisation") — it's now genuinely implemented, not just planned.
- **Real distance calculations**, not placeholders — every event now shows actual distance from the user (Haversine formula against real lat/lng) in the map popup, list cards, and detail sheet. List view sorts nearest-first once location is available. Verified with Playwright's geolocation mocking: set a fake real position near the City of London, confirmed Arsenal (Emirates Stadium) correctly came back as nearest at ~4.5km, and confirmed the full list was correctly sorted ascending by distance.
- **Map now auto-fits to whatever's actually visible** after filtering, instead of staying at a fixed city-wide zoom — a filtered-down set of 2 events won't leave the map mostly empty anymore.
- Geolocation failure (permission denied, unsupported device) shows a brief inline message and leaves the rest of the app untouched — same graceful-degradation pattern as the v1.3 map-load fallback.

**Scope note:** distance is currently calculated only against whichever city's events are already loaded (London/Manchester/Birmingham, selected by tab) — this is a client-side enhancement, not a true cross-city "nearest events anywhere" search. A real cross-city proximity search would need the `lat`/`lng` + `radius_km` backend endpoint described in the backend architecture doc, which hasn't been built yet.

**v1.3 — real map**
- Replaced the schematic (not-to-scale) map with a real **OpenStreetMap + Leaflet** map — free, no API key required. Event venues now have real `lat`/`lng` coordinates (verified against public sources for major stadiums; city-level approximations for smaller community venues, noted in `seed-data.js`) instead of made-up percentage positions.
- Switching cities now recenters the map on that city; tapping a pin opens the same event detail sheet as before.
- **Added graceful degradation if the map library fails to load** (no connection, CDN blocked, etc.) — the rest of the app (list view, filters, accounts, favorites) keeps working normally instead of the whole page breaking. This was tested against a genuine CDN failure, not simulated.
- Frontend and backend event data are now generated from a single source (`backend/seed-data.js`) to avoid the two drifting out of sync.

**v1.2 — security hardening**
- **Fixed a real stored-XSS vulnerability:** account name and email were being inserted into the page via `innerHTML` without escaping. A name like `<img src=x onerror=alert(1)>` would previously execute as real HTML in the profile view. Verified with an actual attack payload through the full register → view profile flow — it now renders as inert text. Applied the same escaping to all event-derived text as a defense-in-depth measure, since a future admin-curated event feed would introduce the same risk.
- **Fixed a timing side-channel on login:** previously, logging in with an email that isn't registered returned almost instantly, while a registered email with the wrong password took ~40-50ms (the cost of the password hash check) — someone could have used that timing gap to figure out which emails have accounts. Login now always runs the same hashing work regardless of whether the email exists. Verified at the crypto level: the two code paths are now within ~0.5ms of each other.
- **Added a request body size cap (100KB)** to stop a trivial memory-exhaustion attack via giant payloads — also fixed a bug in my first attempt at this, where the connection was killed before the error response could be sent (client got nothing instead of a proper `413`).
- **Added max-length checks on name (100 chars) and password (200 chars)** to prevent CPU-exhaustion abuse via extremely long inputs to the password hashing function.

**v1.1 — bug-fix pass**
- Fixed a real race condition: concurrent requests (e.g. two favorite-toggles landing close together) could previously read the same "before" state and the second write would silently overwrite the first. Reads+writes to `db.json` are now serialized through a proper lock (`withDB`), and this was verified by firing 5 simultaneous favorite-toggle requests and confirming all 5 were correctly saved.
- Added real input validation on registration: proper email format check, 6-character minimum password, required name — previously any non-empty strings were accepted.
- Added basic rate limiting on `/register` (10/min) and `/login` (15/min) per IP, returning `429` once exceeded — a bare-minimum guard against abuse now that this can be a public URL.
- Malformed JSON in a request body now returns a proper `400` instead of falling through to a generic `500`.
- Favoriting a nonexistent event ID now returns `404` instead of silently "succeeding."
- Server now prints a startup warning if `TOKEN_SECRET` is still the default placeholder, as a nudge before deploying publicly.
- Frontend: tapping "Saved" while logged out now prompts login immediately, instead of silently showing an empty list with no explanation.
- Frontend: switching cities (in backend-connected mode) now shows a "Loading events…" state instead of a confusing flash of the previous city's data or an empty list while the fetch is in flight.

## What's genuinely real here vs. what still needs work

| Piece | Status |
|---|---|
| Password hashing, tokens, disk persistence | Real — tested end-to-end, not simulated |
| Concurrent-write safety | Real — fixed and verified in v1.1 (see Changelog) |
| Input validation, rate limiting, body size limits | Real — added in v1.1/v1.2 |
| XSS protection on rendered content | Real — fixed and verified with an actual attack payload in v1.2 |
| Login timing side-channel | Fixed and verified in v1.2 |
| REST API (events/sports/cities/auth/favorites) | Real — matches the endpoint list in the developer brief |
| Event data | Mostly demo/invented, one real fetched fixture (tagged `REAL`) — see the developer brief, Section 9 |
| Hosting | **Not deployed anywhere yet** — you need to run or host it (instructions below) |
| Ticket purchase links | Still deep-links only, no real payment flow |
| Production-grade database | Not yet — `db.json` is fine for a demo, not for real concurrent load at scale — see "Known limitations" |

## Keeping the dataset fresh

Three tiers here now, not two — an update from earlier in this project once a middle option got built.

**1. Removing stale events — fully automated, no caveats.** `.github/workflows/archive-past-events.yml` runs `scripts/archive-past-events.js` every Monday (and can be triggered manually from the Actions tab anytime). It moves past events out of `seed-data.js` into `archive/events-archive.json`, regenerates the frontend's copy, and commits the result automatically. Requires the repo to actually be hosted on GitHub with Actions enabled — it does nothing sitting locally.

**2. Proposing new fixtures — semi-automated, human review required.** `.github/workflows/research-new-fixtures.yml` runs monthly, calling Claude (via the Anthropic API, with web search enabled) to look for real fixtures — both filling gaps in the existing dataset AND discovering brand new cities/sports via a rotating checklist of `DISCOVERY_SOURCES` (34 entries, organized systematically by sport — every English/Scottish football tier, every major continental league's remaining cities, Pro D2, URC/Premiership clubs not yet covered, Rugby Europe, RFL Championship, EuroCup, remaining tennis/golf/cricket/snooker/boxing/darts/athletics venues, Netball once in-season, and continued narrower attempts at Volleyball/Badminton/Table Tennis — see the script for the full list and the reasoning behind each one). 5 sources checked per run, cycling through the full list roughly every 7 months, so coverage is comprehensive over time without any single run being expensive. It does **not** commit to `seed-data.js` and does **not** auto-merge anything — it opens a Pull Request containing `proposed-fixtures.json` for a human (or a future Claude chat session) to check before anything goes live. New-city proposals get flagged (`isNewCity: true`) for extra scrutiny, since discovery is higher-risk than gap-filling. This matters because of something this project's own history demonstrates repeatedly: real errors (a source's wrong day-of-week, a UK/local-time mixup, stale-season data mistaken for current) were only caught through back-and-forth verification — an unattended script publishing directly would have no one catching those.

Requires an `ANTHROPIC_API_KEY` repository secret. **Cost is genuinely small** — a monthly run doing a handful of searches costs well under $1 in Anthropic API usage (Sonnet-tier token pricing plus ~$10 per 1,000 web searches) — but always check console.anthropic.com/settings/billing for current rates rather than trust a number written here, since pricing changes. Free alternatives exist (skip Claude entirely and rely only on free sports-data APIs like football-data.org or TheSportsDB) but come with the same coverage/verification tradeoff that's the whole reason this project uses Claude-assisted research in the first place.

**3. The deep, judgment-heavy research this project has actually relied on — still not automatable.** Cross-referencing conflicting sources, deciding a club's own site beats a ticketing aggregator, catching that a "confirmed" date is actually last season's — the monthly proposal job (tier 2) does some of this, but nowhere near as thoroughly as an interactive session where a human is actively pushing back, asking "are you sure," and testing the result. Multi-city pushes like the Six Nations or Top 14 additions (see changelog) came from exactly that kind of session, not from a scheduled job. The realistic model going forward: let tier 2 catch small gaps automatically between visits, and keep using periodic Claude-assisted sessions for anything ambitious.

## Known future direction

The fixed city-tab UI is gone as of v1.22 — the app shows all cities at once, with search and "near me" doing the narrowing instead. That part of the plan is done. What's left open: the `city` field on each event is still a fixed enum (47 entries as of this version, spanning the UK, Ireland, France, Germany, Spain, Italy, and the Netherlands) rather than genuinely free-form — adding a new city still means adding it to the `CITIES` list in code, not something a user or an open data source can contribute on the fly. Real geolocation/search across an open-ended set of cities (rather than a hand-maintained list, however long) remains the longer-term direction.

## 1. Running it locally (fastest way to see it work)


You'll need [Node.js](https://nodejs.org) installed on your computer (any recent version).

```bash
cd backend
node server.js
```

You should see `Fixture backend running at http://localhost:3000`. Leave that running, then open `frontend/index.html` in a text editor, find this line near the top of the `<script>` block:

```js
const API_BASE = "";
```

change it to:

```js
const API_BASE = "http://localhost:3000";
```

Save, then open `frontend/index.html` in your browser. The status line at the top should say "✓ Connected to live backend." You can register a real account, save events, log out, and log back in — it'll all be genuinely persisted in `backend/db.json`.

This proves it works, but **your phone can't reach "localhost" on your computer** — that only works in a browser on the same machine as the server. For phone testing, you need to actually host it somewhere.

## 2. Getting it onto your phone — deploy the backend for free

The easiest option with no account setup complexity is **[Glitch](https://glitch.com)**:

1. Go to glitch.com, create a free account, and start a new "hello-node" project
2. Delete its default files and upload everything from this `/backend` folder (`server.js`, `seed-data.js`)
3. Glitch auto-starts your `server.js` and gives you a public URL like `https://your-project-name.glitch.me`
4. Test it by visiting `https://your-project-name.glitch.me/api/health` in a browser — you should see `{"ok":true,...}`

(**[Render](https://render.com)** is a good alternative for something more permanent — free tier, connects to a GitHub repo, but requires you to first put this code in a GitHub repository, which is a bit more setup than Glitch.)

Once you have that URL, edit `frontend/index.html` again:

```js
const API_BASE = "https://your-project-name.glitch.me";
```

Then host the frontend too — the simplest option is also Glitch (a second project, or a static-hosting service like [Netlify Drop](https://app.netlify.com/drop), where you literally drag the `frontend` folder onto the page and get a public URL instantly). Open that URL on your phone, and you now have the real, backend-connected app running on your actual device with a real shareable link — no cables, no App Store.

## 3. What's needed for a real App Store / Google Play app

This is a genuinely separate step from "hosting a website" — a browser-based app (what we've built) and a native App Store app are different things, though the former can be wrapped into the latter later (via tools like Capacitor) without a full rewrite.

**Costs (current as of 2026):**
- **Apple Developer Program:** $99/year (individual or organization; $299/year for the Enterprise tier). Required before you can submit anything to the App Store, even for testing via TestFlight beyond your own devices.
- **Google Play Developer account:** $25 one-time — no renewal, ever, no matter how many apps you publish.
- If you ever sell anything in-app (tickets, subscriptions), Apple takes 30% (dropping to 15% under $1M/year revenue or for subscriptions after year one) and Google takes 15% on the first $1M/year — but a free app with no in-app purchases owes no commission on either store, just the account fee(s) above.

**Other real costs people forget:** a domain for your privacy-policy and support pages (~$10–20/year if you don't have one), and for iOS specifically, you'll need access to a Mac at some point in the build pipeline (Xcode is Mac-only) — this applies whether you go fully native or wrap a web app.

**Realistic path from here:**
1. Get the backend properly hosted and the data pipeline for real (see the backend architecture doc) — an app with fake fixtures isn't submittable regardless of platform
2. Decide native vs. wrapped web app (Capacitor/Ionic can wrap this exact frontend into an installable iOS/Android app with minimal rewrite — often the fastest path for a small team)
3. Register the developer accounts above
4. Build, test via TestFlight (iOS) / internal testing track (Google Play) with real users
5. Submit for review — Apple typically reviews within a few days, Google's process is generally faster but has its own compliance checks (including a closed-testing period with a minimum tester count before some apps can go fully public)

None of this is a blocker to what you have now — you can keep testing and iterating on the hosted web version (Section 2 above) for as long as you like before spending anything on developer accounts.

## Known limitations (be upfront about these with any developer you hand this to)

- **`db.json` is not a production database.** Reads/writes are now safely serialized (fixed in v1.1), but it's still a single flat file — fine for a demo or small pilot, not for real concurrent load at scale. Swap in real Postgres (see the backend architecture doc) before real users depend on it.
- **No password reset flow, no email verification.** Registering with any email works — nothing confirms you own it.
- **No HTTPS enforcement in the code itself** — this is normally handled by whatever host you deploy to (Glitch/Render both terminate TLS for you automatically), but if you ever run this behind something that doesn't, logins would be sent in plaintext.
- **Rate limiting is per-instance and in-memory.** Fine for a single deployment; if you ever scale to multiple server instances, this needs a shared store (Redis) instead, or requests could dodge the limit by hitting different instances.
- **`TOKEN_SECRET` defaults to a placeholder value.** The server now warns on startup if you haven't changed it — set a real one via an environment variable before sharing the URL with anyone (`TOKEN_SECRET=some-long-random-string node server.js`, or set it in Glitch/Render's environment variable settings).
- **Event data is still mostly demo data**, as covered in the developer brief.
