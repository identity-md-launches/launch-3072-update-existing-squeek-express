# Squeek Express design system

## Overview

Squeek Express is an English-language hamster railway game. The retained visual idea is a quiet pixel valley with stationary rails, traveling trains and a working hamster crew. Dark violet surfaces frame the art; mint emphasizes the main action and gold marks in-game rewards. The original procedural artwork and economy remain intact.

Canonical source is `web/src/`; `web/build.mjs` exports matching runtime files to `dist/`. `web/src/scene.mjs` is unchanged from the corrected release. Rebuild after editing source.

## Colors

The hex palette is defined in `web/src/style.css:1`. Reuse colors by role; do not borrow a separator color for readable text.

| Token/value | Role |
| --- | --- |
| `--bg: #131420` | Page beneath the retained radial background |
| `--panel: #1b1c2c` | Panel base and opaque mobile HUD |
| `--line: #303044` | Structural borders and separators |
| `--text: #ece9f5` | Primary text |
| `--muted: #aaa6be` | Hints, secondary labels and descriptions |
| `--mint: #b9f3cf` | Primary fill, selected accents and focus outline |
| `--gold: #f0d198` | Stars and expedition rewards |
| `#1d1e2d` | Opaque welcome surface |
| `#1c3c32` | Primary-action text |
| `#1b1931` | Scene frame and mobile signal background |

The inherited `--violet` declaration remains available; rarity styles retain their original blue/violet/gold category colors. Explicit labels also communicate category and status.

Rendered solid-pair measurements: welcome hint 6.98:1, welcome description 6.90:1, primary action 9.64:1, mobile signal 7.28:1, job detail 6.32:1 and current-station marker 8.25:1. Exact RGB pairs are in `docs/validation/browser-results.json`. These numbers do not certify arbitrary text over canvas imagery or gradients.

## Typography

Body uses `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`. Headings, logo and selected numeric displays use `'Trebuchet MS', system-ui, sans-serif`, preserving the corrected release's installed-font choice. There are no font files or external font requests; the actual native face varies by platform.

Six tokens define the scale: `--text-12: .75rem`, `--text-14: .875rem`, `--text-16: 1rem`, `--text-20: 1.25rem`, `--text-24: 1.5rem`, `--text-30: 1.875rem`. At a 16px root, captions use 12px, controls/body 14px, inputs 16px, section headings 20px, dialog headings 24px and the welcome heading 30px. Weights are 400, 500 and 700.

Body line-height is 1.5, dialog prose 1.6, controls 1.4 and headings 1.2. Headings balance their wrapping and use −.02em tracking; labels use natural case and zero tracking. Prose is capped at 70ch. Engineer names wrap completely. Username input stays at 16px on phones. Do not restore tiny tracked capitals above headings.

## Layout

Content is capped at 1280px. Common gaps are 8, 12, 16, 20 and 24px, retaining the compact game interface. Desktop places the scene above a two-column delivery/journal area, three-column operations and five-stop railway map.

- Below 1100px, operations use two columns and the crew section spans the row.
- At 750px and below, utilities and the complete username wrap into header rows. The five visible navigation controls share a row. Delivery/journal and operations become one column; cargo uses two columns; jobs and the railway map become vertical lists.
- On phones, the complete canvas width remains visible. HUD, feed status and the control dock join normal flow around the art. The Cabin hotspot sits above the starting train so it stays visible alongside the fixed rails and primary action.
- Crew/train cards use three columns on desktop, two below 750px and one below 480px. Expedition options fall from two to one below 750px.
- Dialogs use `min(860px, 95vw)` with `calc(100dvh - 32px)` maximum height and contained vertical scrolling. Shop and quest rows wrap. Leaderboard tables use contained horizontal scrolling to preserve complete values; the page itself stays within the viewport.

Reflow was checked at 320, 390, 768 and 1440px with a 20-character username. At 390 × 844, Start shift is visible on entry and Wake your hamster is visible after entry. Native zoom and physical devices were not tested.

## Elevation & Depth

The landscape provides most visual depth. Panels use structural borders and subtle tonal backgrounds. The opaque welcome form has no decorative border/shadow combination. Mint buttons keep a small bottom shadow for tactile emphasis. The native dialog has a dark blurred backdrop; feedback toasts sit above page content. Decorative glows never carry essential state.

## Shapes

Primary actions use a 5px radius, compact choices 4–6px, panels 9–12px and the welcome surface 14px. Station markers and Help retain circular forms. The artwork frame clips only visual content; names and text containers wrap. Canvas rendering remains pixelated with the original scene coordinates.

## Components

| Pattern | Source and behavior |
| --- | --- |
| Username entry | `index.html:35`, `app.js:11`: visible label/hint, submit-time inline validation, invalid-field focus, Enter to start, focus moves to Wake |
| Main action | `.run-button` in `style.css`: mint fill, dark text, 44px minimum height; Practice toggles wake/rest, Live follows real telemetry |
| Mode/route/cargo choices | `.source-switch`, `.route-toggle`, `.cargo-picker`: selected treatment and `aria-pressed`; Practice/Live remain separate saves |
| Scene and avatar | `scene.mjs`, `.scene-art`, `.top-hud`: original procedural pixel art; crew avatar uses the same hamster drawing function |
| Delivery | `.job`: native button with destination, energy/time, rewards and explicit locked state; only one active trip |
| Expedition | `engine.mjs:35`, `app.js:43`: canonical definitions, text-rendered name, countdown, disabled premature claim and guarded single reward |
| Crew/train card | `.skin-card`, `.portrait`: rarity label, pixel portrait, perks and purchase/equip controls; expedition and trip locks preserved |
| Dialog | `index.html:248`, `app.js:38`: native `<dialog>` labeled by `modalTitle`; Escape and focus return checked |
| Local leaderboard | `.ranking-table`, `profiles.mjs`: no seeded rows; browser-local explanation, mode tabs and helpful empty state |
| Feedback | `.toast` uses `role="status"`; field error uses `role="alert"`; unavailable feed explicitly pauses wheel energy |

Paths in this table are relative to `web/src/`. Buttons have visible focus; fields/selects receive a 2px outline. Forced-colors mode uses the system highlight. Press feedback scales to .96 and stops under reduced motion. CSS animations/transitions also stop; the ambient canvas clock receives zero elapsed time while gameplay state still advances. Native screen-reader behavior and WebKit remain unverified.

## Do's and Don'ts

- Keep original scene art and fixed track coordinates independent of train movement.
- Use the type tokens, system stacks and natural casing. Keep captions at least 12px and editable fields at 16px.
- Use `.run-button` for the main action and neutral/bordered controls for peers. Preserve disabled/locked explanations.
- Wrap names or use an explicit scrollable data table; never ellipsize a profile to fit the header.
- Derive expeditions from definitions and render saved names as text. Preserve profile and mode boundaries.
- Add panels with existing spacing, 20px headings, native controls and responsive grids; test 320/390 before rebuilding.
- Keep data scope honest. No global ranking, shared challenge, backend, account or wallet login belongs to this static edition.

Guidance: [Jakub Krehel's Better Interface](https://github.com/jakubkrehel/skills/tree/267330e1adfc66a718fb65fa6918c1f06d0a689e/skills/better-interface), MIT. Documentation method: [Paul Bakaus's Impeccable](https://github.com/pbakaus/impeccable/blob/9d715cc4f5564a990ca8345abfdd5df6dc9b41c8/skill/reference/document.md), Apache-2.0. Review coverage and limitations are in `VALIDATION.md`.
