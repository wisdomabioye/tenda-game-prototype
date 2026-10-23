# Tenda Explorer: ownership and extension guide

The prototype uses React for presentation and Babylon for the world. Features compose reusable kits and pure rules; they do not each create their own renderer, database, or input binding. This is a maintainable prototype foundation, not a measured guarantee for arbitrary world size or player counts.

| Folder | Owns | Extension point |
| --- | --- | --- |
| `src/app/` | Screen composition, panel coordination, selected city | Connect feature presentation and world controls here |
| `src/contracts/tenda/` | Self-contained prototype browse-contract snapshot | Replace with the workspace shared contract at Tenda integration |
| `src/mock/tenda/` | Fixtures, timed arrivals, simulated work transitions | Future live provider should supply the same mission model |
| `src/domains/missions/` | Mission model, eligibility-independent discovery, boxes, markers, alerts | Reuse mission stops and shared UI; keep real-work claims factual |
| `src/domains/places/` | Place catalogues, validation, authoring, entrances and previews | Add catalogue records; use shared entrance/placement validation |
| `src/domains/geography/` | Coordinate projection, spatial rules, map adaptation | Adapt geographic data before composing world assets |
| `src/domains/world/assets/` | Buildings, vegetation, furniture, roads, signage, vehicles | Add an asset kit and register its typed specification once |
| `src/domains/world/districts/` | District configuration and composition | Call `createDistrict(parameters, frame)`; reuse existing kits |
| `src/domains/world/navigation/` | Geometry, shared connected topology, route choice, steering, collision | Routes and keyboard steering must use the same prepared network |
| `src/domains/world/presentation/` | Shared 3D-to-CSS-pixel projection for world overlays | Capture one screen frame per layer update, then project all markers through it |
| `src/domains/world/runtime/` | Scene composition, engine lifecycle, picking, streaming, controls bridge | Keep feature rules in their domains; runtime wires them together |
| `src/domains/explorer/` | Human kit, appearance, activities, trail, hunt, challenge, guidance | Reuse actor rigs, activity state transitions, approach and persistence adapters |
| `src/domains/audio/`, `platform/` | Opt-in sound and PWA integration | Keep platform behavior outside game rules |
| `src/shared/ui/`, `motion/`, `theme/` | Cards, buttons, close icons, marker spacing, focus, motion, tokens | Extend canonical components instead of copying markup or interaction rules |
| `src/shared/storage/` | Preferences, serialized save queues, database transactions and cleanup | Features own record keys and validation; infrastructure owns IDB lifecycle |

## Dependencies and ownership

- Shared infrastructure and contract snapshots cannot import app, mock, or feature domains. Pure navigation and geographic math cannot import React or Babylon. Architecture checks enforce these boundaries.
- `App` and `mountWorld` are composition roots and intentionally connect domains. There is no blanket ban on cross-domain composition. Pure district/mission anchor types live in `missions/model/anchors.ts`, not a rendering file.
- `routes.ts` is the stable public navigation entry point. Geometry lives below graph preparation, preventing the previous route/source-graph dependency cycle. `prepareStreetNetwork` caches by immutable network identity; create a new network array when changing roads. Source-map node IDs remain authoritative. Only game-authored streets infer at-grade junctions.
- The asset registry defines reusable kits. Static composition owns their instances; asset contexts own shared materials; instances own their private resources. Dispose in reverse construction order. Tests cover failure cleanup as well as ordinary disposal.
- Mission, place, trail, repair, player and destination overlays share `world/presentation/screenProjection.ts`; marker collision owners share `shared/ui/overlayBounds.ts`. Adding a HUD control updates one obstacle policy. Layout/render dimensions are read once per layer batch, rather than again for each marker.
- Keyboard and physical activity updates share `actorInputBlocked`. Adding a modal input owner must update that policy once.
- Appearance, trail and sound use `useLocalPreference` and `jsonPreferences`; each domain keeps its parser and fallback. Watchlist persistence reuses the same I/O while its allowed-city/category vocabulary belongs to mission engagement. Raw activity/adventure flags intentionally keep their distinct storage format.
- Hunt and repair writes use `createSaveQueue`. Writers receive failures; checkpoint callers wait for completion without storage errors preventing mission inspection. A failed write never poisons the next queued attempt.
- Actor turning and camera north alignment share `motion/angles.ts`; activity easing aliases the existing shared easing curve. Different turn speeds remain local behavior settings.
- The hunt and repair challenge use the same database service with different record keys. The existing `palm-parcel` key and database version are unchanged. Physical activity checkpoints retain their own lightweight per-district local-storage adapter; this is a different persistence contract, not duplicated IDB plumbing.
- Mission data compatibility re-exports contain no second catalogue. The canonical mock data remains in `src/mock/tenda/`.
- Category/proof names and consumed wire fields have one prototype contract snapshot. It preserves nullable fields and records its source/date. It is not a live server validator and must be reconciled with the workspace contract during integration.

## Tests and guardrails

`npm test` discovers all direct `.mjs` regressions and all `*.test.ts` suites. PWA tests run separately after a fresh browser build; mutation checks are explicit because they deliberately run failing copies of code. A newly added normal regression must not require editing a hardcoded test list.

- `npm run check:architecture`: portable imports, shared/pure-layer boundaries, no explicit `any`, source/test/content file lengths ≤300. Generated output and dependencies are outside this scan.
- `npm run test:mutations`: ten isolated faulty variants must fail behavioral assertions; unchanged versions must pass. Compilation failures, timeouts and missing imports do not count as evidence. Production files are never mutated.
- `tests/preference-motion.test.ts` and `tests/save-queue.test.ts`: corrupt/blocked storage, unchanged records after failed writes, watchlist vocabulary, 1,000 wrapped headings, ordered async writes, error recovery and checkpoint waiting.
- `tests/overlay-presentation.test.ts`: portrait/landscape projection, 1–3× render resolutions, camera viewport offsets, behind-camera depth, bounded layout reads and hidden/visible HUD regions. All six overlay consumers use the same projector; architecture checks reject new direct `Vector3.Project` calls elsewhere.
- `tests/shortest-path.test.ts`: compares 864 graph queries with independent exhaustive path enumeration, including unreachable destinations.
- `tests/game-storage.test.ts`: exercises the real storage service through controllable IDB requests/transactions, including read errors, transaction errors/aborts, connection cleanup, invalid saves and record isolation.
- `tests/daily-life.test.ts`: actual actor/walker/station composition, active-meal pause, interrupted transfers, both mobility modes, saves, resume and resource disposal.
- `tests/marker-spacing.mjs`: actual-size occupied rectangles and crowded-screen fallback. This was previously outside the main command and is now discovered.
- Older numbered suites now have feature names, including `urban-kit`, `shadows-residents`, `character-trail`, `mock-stream-hunt`, and `city-composition-import`.

## Limits to preserve in planning

Do not describe this as zero duplication, full production readiness, or unlimited scalability. Whole-app statement/branch/function coverage is not instrumented. TypeScript static checking currently covers production source; TypeScript tests are bundled and executed rather than separately typechecked. The tests above are evidence for their named behaviors, not every rendering or UI interaction.

Large road graphs, much larger crowds, GPU/memory budgets, actual-phone controls, and PWA installation/recovery still need measured device checks. The current small-city residency policy and route algorithms should be benchmarked before substantially increasing content. `App`, `mountWorld`, and the theme cascade remain places to watch as features grow; extract cohesive ownership when adding complexity rather than creating speculative wrapper layers now.

## Production loading boundaries

Application state remains eager; optional presentation lives behind `app/lazyPanels.ts` and a shared loading/error boundary. World rendering and district factories have independent async boundaries. Renderer-ready callbacks gate initial offline precaching. Default builds now use content hashes and separate font/feature CSS assets; inspect actual chunk ownership with `test:build` after building. See BUILD-SPLITTING.md.

## Performance ownership

`world/performance/recorder.ts` owns a bounded foreground-sample session; `useBenchmark` mounts at the app level, so lazy diagnostics may close without losing the run. Scene instrumentation belongs to the mounted Babylon scene and is disposed with it. Timings are CPU submission/evaluation measures, not GPU timings.

`assets/core/staticBatch.ts` combines opaque static colour geometry per asset using vertex colours and the existing shared material registry. Textured/emissive materials and animated awnings stay separate. Per-asset roots, sockets, collision bounds and picking identity are preserved. `visibility/detailBudget.ts` owns only the detail visibility it changed; near-player and near-camera detail are protected and Balanced restores those meshes. Crowd budgets and local light budgets remain in their own domains.
