# Squeek Express validation

Complete for the local implementation and static-export scope. Final GitHub commit and publication under `squeek-express-night-shift.identitymd.eth` are the IdentityMD worker/plane handoff; they were not performed by this implementation.

## Scope and source

The corrected release `df1c2e2521c882f4e42bdb34679d233cdc2ff40e` was downloaded and compared with the workspace. Delivered `engine.mjs`, `scene.mjs`, `profiles.mjs`, `check.mjs` and `check-profiles.mjs` match it byte for byte. The actual expedition source changes and regression tests were ported. The interface preserves the existing art, economy, English game, official endpoint and browser-local save boundaries.

Canonical source is `web/src/`; local public assets are in `web/public/`. The zero-dependency build writes the complete root `dist/`. Existing root manifests/dependencies/ignore rules and Git internals were not edited. No runtime depends on pinned inputs or scratch files. No hosting service, backend, wallet or shared feature was introduced.

## Requirements

| Requirement | Result |
| --- | --- |
| Canonical expedition saves and protected claims | Met; exact release engine/tests and real UI save/reload/claim checks |
| Actual application source changes | Met; canonical source, matching runtime and added release regression assertions |
| System fonts; remove obsolete sign-in wording | Met; no font requests; direct-OBS copy and profile-free overlay tested |
| Pixel art, fixed rails, moving trains and game systems | Met; original scene/engine retained; delivery, crew/train purchases/equip, perks, quests, crafting and exchange tested |
| Username, local profiles and leaderboard | Met; second-name isolation, reload, browser-local explanations and separate mode tabs |
| Squeekchain Live and separate Practice | Met in source; fixture baseline/delta/outage and isolation pass; real fresh payload accepted; successful direct browser Live fetch unverified |
| No global/shared/backend/wallet features | Met by source and zero-dependency manifest review |
| Source, lockfile and relative export | Met locally; `web/package-lock.json`, eight-file `dist/`, parity and checksum checks |
| First 390px screen and metadata | Met; screenshots/bounding-box assertions and all five required share fields |
| README and final design documentation | Met |
| Public final commit and existing-name publication | After review; worker/plane handoff |

## Better Interface review

| Domain | Checked | Limits |
| --- | --- | --- |
| Accessibility | Native controls/dialogs; label/hint/error; 16px input; keyboard Enter/Space; invalid-field focus; Escape/focus return; 2px focus; dialog name; motion styles and mobile targets | No native screen reader, physical device or native zoom; no compliance certification |
| Layout | Welcome/game screenshots, complete scene, full usernames, 320/390/768/1440 widths and representative crew/train/workshop/quest/expedition dialogs; subpath export | English-only product; RTL/localization not applicable; arbitrary edited counters not exhaustive |
| Writing | Action labels, validation recovery, local-only save/ranking scope, expedition no-spare state, disabled claims and feed outage; removed obsolete sign-in statement | No invented global/shared-service copy |
| Typography | System stacks, six sizes, three weights, natural casing/tracking, full name wrapping and 16px field | Installed faces vary; WebKit unavailable |
| Colors | Retained palette, stronger secondary text, seven rendered solid-pair measurements and probe-measurable pairs | Art/gradient contrast not comprehensively measured |
| UI | Primary/selected/disabled/locked states, dialogs, structural surfaces, motion preferences and local share assets | No Animations-panel replay at 10%; canvas ambient motion reviewed from source and rendered states |

## Findings, fixes and rechecks

| Severity | Source | Problem and correction | Recheck |
| --- | --- | --- | --- |
| High | `web/src/engine.mjs:16`, `:35`, `:46` | Saved expedition fields could destroy valid progress or inject rewards. Ported canonical restoration, validation and claim revalidation. Invalid expeditions are dropped individually. | Exact upstream regressions plus browser recovery/reload/claim pass |
| High | `web/src/app.js:43`, `:47` | Expedition name previously entered HTML. Ported empty heading and `textContent`. | Malicious label becomes Whispering Woods; no injected image or alert |
| Medium | `web/src/style.css:1`, `:444` | External fonts and tiny scattered type. Ported native stacks and consolidated readable sizes/weights. | No font requests; both typography probes pass |
| Medium | `web/src/app.js:46` | Obsolete private-preview sign-in copy. Ported direct OBS instructions. | Overlay opens without profile and writes no player save |
| High | `web/src/style.css:481`, `:538` | Names were ellipsized; cropped mobile art hid the initial train. Names now wrap; complete scene and separate HUD/control flow preserve the game/action. | Full 20-character names/dialogs fit all four widths; mobile screenshot inspected |
| Medium | `web/src/index.html:9`, `web/public/` | Missing favicon/Open Graph fields. Added local favicon and share PNG rendered from original art. | Build/share checks pass |
| Medium | `web/src/index.html:248`, `web/src/app.js:47` | Dialog lacked accessible title reference. Added stable generated modal title. | Dialog name, Escape and focus return checked |
| Medium | `web/src/style.css:444`, `web/src/index.html:28` | Repeated tracked capitals/kickers, decorative surface clutter and CSS motion. Naturalized copy, removed redundant labels, simplified surfaces and disabled decorative CSS animation. | Welcome 16/16 and game 16/16 probe checks |

An intermediate probe candidate was not a rendered overlap: the probe counted canvas fallback text across the entire canvas. Removed the redundant fallback text; retained the scene's accessible description and DOM game controls/state. Screenshots and final measurements confirm real text/controls do not overlap.

## Commands and results

All source/export checks below ran after the final application changes. Documentation edits followed.

| Command/check | Actual outcome |
| --- | --- |
| `npm --prefix web install --package-lock-only --ignore-scripts --no-audit --no-fund` | Passed; isolated zero-dependency lockfile; root unchanged |
| `npm --prefix web run build` | Passed; eight runtime files, about 291 kB; syntax/relative assets/metadata validated |
| `npm --prefix web run check` | Passed |
| `npm exec --cache test/scratch/npm-cache --yes --package typescript@5.9.3 -- tsc -p web/jsconfig.json` | Passed; JavaScript/DOM type checking, no emit |
| `npm run check` | Passed |
| `npm test` | Passed both exact upstream suites, including new expedition regressions |
| `sha256sum -c SHA256SUMS` | All twelve listed files passed |
| `node web/browser-check.mjs` with supplied Playwright/Chromium | Nine groups passed; no page exceptions or missing local assets; expected service failures tested |
| Pinned `taste.mjs --out test/scratch/taste` with named installed Playwright/browser paths | 16/16 welcome and 16/16 game after profile entry |
| Source/export and pinned release equality checks | Passed |
| `git check-ignore -v dist/index.html web/package.json web/package-lock.json` | No output; eligible for submission |
| Protected-path diff check | No changes to root build/package/dependency/ignore configuration |

The game probe used a scratch HTTP harness serving the final export plus a test-only bootstrap that enters `Engineer_12345678901`. It uses normal initial Practice state. No test bootstrap or seeded players are shipped. The repeatable interaction check serves the export under `/preview/`, uses a virtual clock to complete actual trips/expeditions, and closes its server/browser in `finally`. Live fixtures are explicitly labeled.

## Rendered evidence

- `docs/validation/welcome-390.png`: product, username, Start shift and local-profile explanation in the first viewport.
- `docs/validation/railway-390.png`: complete art/rails/starting train and keyboard-focused Wake action.
- `docs/validation/long-profile-390.png`: complete 20-character name.
- `docs/validation/railway-1440.png`: desktop jobs, resources, perks and network.
- `docs/validation/expedition-390.png`: canonical name/rewards and disabled early claim.
- `docs/validation/browser-results.json`: interaction results, RGB contrast pairs and limitations.
- `docs/validation/taste-welcome.json`, `taste-game.json`: final probe summaries.

Measured solid text contrast: hint 6.98:1; profile note 6.98:1; welcome description 6.90:1; primary action 9.64:1; mobile signal 7.28:1; job detail 6.32:1; station marker 8.25:1. The game probe skips 153 text boxes over art/gradients. Screenshots were inspected, but these results do not certify all dynamic backgrounds.

## Remaining limitations

A separate real status request returned HTTP 200, `Access-Control-Allow-Origin: *`, and an online measurement with all fields consumed by the game. A newly fetched payload passed unchanged `measure()` and left baseline energy at 70. Direct headless-browser requests did not produce telemetry; a targeted diagnostic reported `net::ERR_EMPTY_RESPONSE`. The app correctly showed “Live signal unavailable · wheel energy paused” and “Unknown RPM”. Actual payload compatibility and failure behavior were verified; successful live retrieval from a visitor's browser was not established here. Production endpoint behavior/configuration was preserved.

The interactive browser connector failed with `Transport closed`. The supplied Playwright runtime instead rendered and exercised Chromium in bounded foreground commands. WebKit launch returned “Executable doesn't exist”, so Safari/native iPhone behavior remains unverified. Physical devices, native zoom, native screen readers and every possible game state were not tested. Local reports are worker observations, not independent certification. Final submission/publication remain the network handoff described in README.
