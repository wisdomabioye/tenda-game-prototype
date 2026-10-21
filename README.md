# Tenda Explorer r26

Babylon.js + React + TypeScript · Sunny Adventure · offline procedural prototype. Earlier revisions are preserved. No live Tenda integration or game backend.

## Try it

- **Hunt**: The Palm Parcel, four stages across Maker Quarter. Walk to each clue, solve a small observation/logic choice, use optional hints, and reveal a cosmetic reading-corner display and journal stamp.
- **Hunt → Return to last game checkpoint**: explicit virtual repositioning after a reload. Continue walks to the current clue; no real-world presence is claimed.
- **Alerts**: watch remote work and a manually chosen city/category. Configure quiet mode/hours and the mock stream; use Send sample mission now for immediate testing.
- **Inspect an arrival**: checkpoint/pause the hunt and open a sample mission. Try the clearly labelled assignment/application → mock evidence note → in-review → simulated approval flow. No upload, wallet, payment or real task action occurs.
- **Wayfinder → PALM BOOKS / Palm Street**: visit the adjoining authored block with continuous shopfronts, apartments, landmark tower and courtyard lane.
- **Tools → Performance / Choose explorer**: retained rendering controls, diagnostics and independent human-kit options.

## Data domains

`src/mock/tenda/` owns catalogue fixtures, configuration, random timed delivery and the local mock work-state provider. Legacy mission-data modules are compatibility re-exports. Default arrivals occur after random 20–40 second delays; UI supports 5–300 seconds with maximum ≥ minimum. Twelve arrivals per session bound memory and notification volume. The stream pauses while hidden and stops once exhausted. Initial catalogue loading does not alert. Session-specific IDs avoid reusing a saved ID for a different random sample on reload.

`missions/engagement/` owns watchlist policy, local quiet hours, inbox and mock work presentation. Matching means relevance, not guaranteed eligibility. Physical watch areas are independent of virtual travel and require no live-location permission. Arrival sounds use existing opt-in sound settings. Multiple matches share a digest; inspection/dismissal suppresses duplicates. Closed-app OS push is not implemented.

`explorer/hunt/` owns content, pure transitions, IndexedDB storage, journal and cosmetic world response. Saved fields are versioned logical checkpoints, stage, pause state, clue arrival and hint state; no real location. Clues/journal entries derive from completed stages. Saving failure is visible and offers manual JSON backup; no cloud/permanent-progress claim. Invalid/incompatible backup imports are rejected. Further migration/recovery UX for future content versions remains work to design.

Dynamic mission markers update without reconstructing the Babylon scene; current player position/camera/route are retained. New arrivals do not automatically travel, apply or interrupt the hunt. Inspect explicitly parks the hunt.

## City and rendering

Palm Street uses `configured/palm-street.json` and `createPalmStreet(frame)`, composed through the existing district factory and catalogue entrance validation. Fifteen initial places share the connected city graph across four resident detail regions. Buildings use varied styles and footprints; lamps use at most two actual local lights. NPCs visit places, pause to browse, use right-side visual offsets and simple following spacing. This is not a complete collision-avoidance or social simulation.

Static storey parts now batch by material; provenance of merged parts is retained for tests. Distant urban window groups omit fine detail after 150 game units while main building volumes remain visible. This is a narrow LOD optimisation, not a full instancing/tile-streaming system.

## Persistence boundaries

Hunt progress and appearance/watch preferences stay on the device. No game data is sent to Tenda. The simulator inbox, newly arrived sample saves and simulated work states reset on reload; the original catalogue trail remains locally saved. Export/import is manual text JSON, not account sync. Clearing browser data or changing browser/device can lose/separate saves.

## Build

```sh
npm install
npm test
npm run build
npm run test:build
npm run test:pwa
# Optional local-file preview
npm run build:standalone
```

The standalone embeds fonts and source data and runs without image/model downloads. The consumed Tenda browse fields and category/proof vocabulary live in `src/contracts/tenda/browse.ts`, checked against the local shared package on 20 October 2026. No absolute checkout import remains. Replace this snapshot with workspace contracts when migrating into apps/gamified. Both Vite formats remain supported.

## Remaining validation

Actual-phone frame rate, GPU/memory/thermal behaviour, touch, screen-reader testing and longer crowd traversal are pending. Browser viewport checks do not establish phone performance. Further art/content variety, comprehensive crowd avoidance, instancing and wider map coverage remain follow-on work. Use MOBILE-VALIDATION.md; this build does not claim the entire production roadmap is complete.

## PWA

The hosted build is now a PWA baseline with offline app-shell caching, install metadata/icons and explicit updates in Tools. See PWA.md for build/deployment, cache policy and device-validation limits. The standalone file remains a preview. Game saves remain local and are not automatically shared between file/localhost/production origins.

## Daily-life activities

Open **Move & activities** for Bench / Parcel / Food. Nearby stations highlight and expose the same E/touch action. Food is an in-world order → receive → carry → sit/eat loop. Interrupted activities and partial meals are saved locally per district, with explicit Resume after reload. See [PHYSICAL-ACTIONS.md](PHYSICAL-ACTIONS.md) for reusable domains, extension points and collision boundaries.

Roadside mission discovery uses grouped physical parcel boxes and compact badges; see [MISSION-BOXES.md](MISSION-BOXES.md) for presentation sockets, route recovery and module ownership.

## Maintainability

See [ARCHITECTURE.md](ARCHITECTURE.md) for domain ownership and extension rules, and [MAINTAINABILITY-AUDIT.md](MAINTAINABILITY-AUDIT.md) for verified repairs, test-strength evidence and unverified gates. `npm test` discovers regression files automatically; `npm run test:mutations` checks ten deliberate faulty variants in isolated bundles.

## Mobile handoff

Unzip the source and run `npm ci`. For hosting, use build command `npm run build` and output directory `dist`. See MOBILE-VALIDATION.md before interpreting benchmark results.

`npm run package` creates one source ZIP, including .gitignore and Vercel configuration. Generated builds and local environment files stay out. Build/test verification remains explicit; packaging does not rerun tests.

## Default production build

`pnpm build` now produces the split browser/PWA build in `dist/`. Vercel configuration points there. `build:browser` is a compatibility alias; the optional standalone HTML uses `pnpm build:standalone` and its own intermediate directory. See BUILD-SPLITTING.md for module boundaries, measured payload changes and build regression checks.
