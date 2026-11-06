# Squeek Express

A hamster-powered pixel railway game. Wake an engineer, dispatch cargo along fixed rails, grow a locomotive fleet, and send spare crew on expeditions.

This update ports the corrected [static release df1c2e2521c882f4e42bdb34679d233cdc2ff40e](https://github.com/Ramilashrf/squeek-express/tree/df1c2e2521c882f4e42bdb34679d233cdc2ff40e). Its gameplay engine, procedural pixel art, profile module, and both regression-test files are retained byte for byte. The interface adds system typography, responsive controls, local share assets, and a reproducible static export.

## Install, preview, and rebuild

Requires Node.js 20 or newer and npm. The application and production build have no package dependencies. The protected root manifest is unchanged; the build manifest and lockfile are in `web/`.

```sh
npm --prefix web ci --ignore-scripts --no-audit --no-fund
npm --prefix web run build
npm start
```

Open `http://localhost:4173`. `npm run dev` starts the same preview. An optional `PORT` selects another port.

Edit `web/src/` and `web/public/`, then rebuild. The build copies an explicit list of eight runtime files to root `dist/`, checks module syntax, relative assets, metadata and font independence, and regenerates `SHA256SUMS`. It needs no network or bundler. Serve `dist/` as static files; no server rewrites are needed. Imports, styles, favicon and share image use relative paths and work beneath a hosting subpath.

```sh
npm --prefix web run check
npm --prefix web run typecheck
npm run check
npm test
sha256sum -c SHA256SUMS
```

The optional typecheck obtains pinned TypeScript 5.9.3 using npm exec and checks JavaScript with `checkJs`, DOM declarations and no emitted output. This development tool is not needed by the app or production build. Saved game data remains dynamically typed and is validated at runtime.

## Expedition save correction

- Names, duration, costs and rewards are restored from built-in definitions rather than saved labels or reward fields.
- Unknown IDs, invalid timers, unowned explorers and the on-duty engineer are rejected. Migration drops that expedition while keeping other valid progress.
- Completion is derived from a zero remaining timer. A forged `ready` flag cannot make a running expedition claimable.
- Claims restore the canonical definition again before crediting rewards, then clear the expedition. Both the dialog and main-screen claim use the guarded engine action.
- Active expedition names are assigned with `textContent`.

`npm test` runs the exact release gameplay and profile checks, including its added regressions for injected names, forged rewards, malformed expedition recovery, premature claims, cave save/resume, single claims, and preservation of leaderboard entries after reload.

## Gameplay and local profiles

Five engineers and four locomotives retain their distinct perks. The game includes five stations, four cargo types, eight one-time quests, crafting, crystal exchange, upgrades, foraging, and spare-crew expeditions. The original scene, stationary rails, traveling trains, weather and English interface remain. Sound is optional. Reduced motion disables CSS motion and freezes the ambient scene clock; gameplay state still updates.

Enter a 3–20 character name using letters, numbers or underscores. No password, X account, wallet or sign-in is needed. Names are case-insensitive local profiles, not verified or reserved accounts. Each name has separate Practice and Live saves in this browser. Earlier v2/v3 progress transfers only to the first local profile. Closing or hiding the page awards no offline progress.

The leaderboard contains only profiles saved in this browser, with separate mode tabs and no seeded players. Score is 100 per delivery + floor(km × 10) + 25 per claimed quest + 40 per completed expedition. Spending stars does not lower the score. Clearing storage deletes progress; editable local saves are unsuitable for competitive prizes. Stars and items have no real-money, token or NFT value.

## Official Squeekchain Live integration

Live mode polls `https://api.squeekchain.com/v1/status` every five seconds with an eight-second deadline. The first fresh measurement establishes a baseline. New `measurement.cumulativeWorkUnits` deltas produce 0.5 base game energy per unit, adjusted by crew and generator perks. `measurement.rpmMilli` drives wheel activity and boost availability. Counter differences use BigInt.

Duplicates, decreasing counters, installation/epoch changes, reloads and visibility changes cannot credit lifetime history as new work. Missing or stale measurements pause wheel energy and show an unavailable/outdated state. Measurements are not finalized onchain settlement. Snacks are a separate game-energy mechanic. Practice simulates wheel activity and never shares its progress with Live.

`?mode=overlay` opens an independent ambient live scene for an OBS Browser Source with no profile or account needed. Suggested source size: 1100 × 560. It does not synchronize a player's delivery state with OBS. Live mode and the overlay require public API availability and browser CORS access. Fonts and visual assets are local or system-provided; there are no Google Fonts requests.

## Validation performed

The final production export was built and served beneath `/preview/` for interaction checks.

| Check | Actual result |
| --- | --- |
| Production build | Pass; eight runtime files, relative assets and metadata validated |
| Source checks and `npm run check` | Pass |
| JavaScript typecheck | Pass; TypeScript 5.9.3, `tsc -p web/jsconfig.json` |
| `npm test` | Pass; both exact upstream suites including expedition regressions |
| Chromium interactions | Pass; nine groups covering entry, delivery/quests, Live fixtures, profile isolation, save recovery, safe claims, overlay, purchases/crafting and static resources |
| Responsive layout | No page overflow at 320, 390, 768 and 1440; full 20-character names and representative dialogs checked |
| First screen at 390 × 844 | Product and Start shift visible; after entry, Wake your hamster visible |
| Pinned taste@1 | 16/16 welcome; 16/16 game after profile entry |
| Source/export parity and checksums | Pass |

See [DESIGN.md](DESIGN.md) and [VALIDATION.md](VALIDATION.md) for the six-domain review, findings, fixes, screenshots and limits. The repeatable optional browser check uses an existing Playwright installation:

```sh
IMD_PLAYWRIGHT=/path/to/playwright/index.mjs \
PLAYWRIGHT_BROWSERS_PATH=/path/to/installed-browsers \
node web/browser-check.mjs
```

Live success/delta/outage interactions used explicitly mocked official-endpoint responses. A separate real HTTP request returned 200 with `Access-Control-Allow-Origin: *`; its fresh payload passed the unchanged engine and credited no baseline history. Direct headless-browser Live requests failed (`net::ERR_EMPTY_RESPONSE` in a targeted diagnostic), so actual browser Live success remains unverified here; the unavailable state was observed. WebKit could not launch because its executable is absent. Physical devices, native screen readers and native browser zoom were not tested. Contrast over dynamic artwork/gradients is not comprehensively certified by the probe.

## Structure

- `web/src/`: canonical HTML, CSS, modules and DOM type declarations.
- `web/public/`: favicon and 1200 × 630 share PNG rendered from original game art.
- `web/package.json`, `web/package-lock.json`, `web/build.mjs`: isolated dependency-free build.
- `web/jsconfig.json`: JavaScript typecheck settings.
- `dist/`: complete production export included with the source.
- `check.mjs`, `check-profiles.mjs`: exact pinned release regression suites.
- `web/browser-check.mjs`: foreground browser check with its own temporary preview.
- `scripts/serve.mjs`: existing dependency-free preview server.

## Release handoff

Public project: [Ramilashrf/squeek-express](https://github.com/Ramilashrf/squeek-express). Existing site: `squeek-express-night-shift.identitymd.eth`.

The IdentityMD worker handles the submission commit and the plane publishes committed `dist/` under that same name after review. This implementation prepares the source and export; it does not independently push a GitHub commit or change the live site. No backend, database, global ranking, shared daily challenge, wallet login, hosting subscription or onchain deployment is introduced.
