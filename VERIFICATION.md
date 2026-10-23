# r26 verification — 19 October 2026

## Automated

The full suite covers district reachability (15 places / four regions), footprint/navigation clearance, batched stairs and geometry ownership, human-kit replacement, existing guide/trail/gesture behaviour, timer cancellation, bounded random delays, unique arrival IDs across sessions, remote/physical matching and quiet hours, versioned checkpoint JSON roundtrip, wrong-answer/arrival gates, idempotent hunt completion and distinct simulated submission/review states.

Default TypeScript/Vite build, offline export and split browser build are checked at handoff. Bundle-size warnings remain.

## Browser evidence

Earlier r26 checks confirmed an arrival during hunt travel did not remount/reset the world. Inspecting the arrival paused/checkpointed the hunt; assignment and a fictional evidence note moved the mock mission to in-review without approval. Optional hints and wrong answers preserved progress.

On 19 October, opening the prototype restored chapter 3 and its first two journal discoveries from IndexedDB. Return to last game checkpoint worked; continuation followed the connected route. This is genuine local browser persistence evidence, not a seeded shipped save.

Phone-sized layout checks and final gameplay results are recorded below. Actual-phone/GPU/thermal/battery/accessibility and long-session crowd validation remain pending. No r22/r23 performance figure is reused as evidence for r26.

## Limits

Mock delivery is a local timer; it does not prove any Tenda event API exists. No live Tenda endpoints, accounts, wallets, funds, OS notifications or cloud game saves are involved. Gameplay and NPC behaviours are prototype baselines, not validated retention or complete crowd simulation.

## Final handoff checks

The full test suite, TypeScript/default Vite build, standalone export and split browser build passed on 19 October. Babylon bundle-size warnings remain.

Continuing the restored hunt completed chapters 3 and 4, recorded all four discoveries and awarded the cosmetic journal stamp. Reloading the page restored the completed journal from IndexedDB. The browser console reported no errors during these checks.

At a 390 × 844 browser viewport, the journal panel measured 368 pixels for both client and scroll width: no horizontal overflow. This is viewport emulation, not an actual-phone performance test. Screenshots: `screenshots/hunt-complete.png` and `screenshots/hunt-mobile.png`.

## Compact HUD refinement

Unified overlay surfaces in shared/theme/hud.css, isolated scene-label stacking beneath the HUD, changed the dock to five single-row icon buttons, and separated mission scrolling from its absolute close button. Evidence uses a bounded single-line input. Camera controls move to a separate rail while reading. Build and mobile viewport checks cover the expanded mission and simulated assignment flow; real-device validation remains pending.

HUD checks: at 390×844, reading viewport 564px, close button remained hit-testable after 166px scroll, dock 65px high without horizontal overflow. At 320×667, reading viewport 387px, close still hit-testable and dock without overflow. Filled the compact evidence input and verified submission enabled; close dismissed the card. Scene label layer 1, camera layer 60. Screenshot: screenshots/hud-mobile-refined.png.

## All ten finishing touches

Shared GameButton/GameCard/CloseButton adopted across React UI; consistent SVG dock icons and active aria-pressed states; expanded Tools layer 75 above camera 60; softened surfaces; fixed mission title/close; consolidated demo labels and collapsed actions; expandable slim arrival banner; reduced-motion-aware short transitions; attribution retained with descriptive fine print moved to Guide; bounded same-session reading memory.

Browser check at 390×844: opened alert, inspected/read mission, expanded demo actions, applied/selected in simulation, then left and reopened the same mission from inbox. Expanded details, expanded demo actions and scrollTop 145 were restored; close remained hit-testable. At 320×667, dock/card had no horizontal overflow and heading remained below the camera rail. Screenshots: hud-final-touches.png and tools-layer-refined.png. Full existing automated suite passed. Actual-phone validation remains pending.

Final default and split-browser builds passed after the finishing pass. Browser error log was empty.

## Navigation and touch finishing pass

Added owned entrance/brief building cues, named journey status, arrival acknowledgement, distinct selected place/mission markers, reading-card Escape/focus return, mutually exclusive panel switching, safe-area padding and visual-viewport keyboard handling. Existing automated suite passed. Native keyboard and physical-phone safe-area testing remain pending.

Browser validation: walked to Sunny Kitchen; named travel/progress and selected entrance rendered, arrival card showed “You’ve arrived”. Escape closed it and returned focus to its original Trail stop 1 marker. Hunt → Alerts left exactly one panel; Escape returned focus to the Alerts dock opener. Final default/split builds passed. Screenshot: screenshots/named-destination.png. Virtual-keyboard behaviour is implemented but not proven on a physical phone.

## PWA baseline

Default and split-browser builds passed. Generated-worker tests passed for nested scope offline shell/assets, explicit activation, scope-limited old-cache cleanup and API/POST/cross-origin bypass. Browser loaded the hosted split build under a subdirectory, reported offline ready, then reopened its shell and lazy-loaded 3D scene after the local HTTP server was stopped. A waiting update stayed pending until the explicit Apply update & reload action; that cached update activated and reopened the scene while the server remained stopped. Tools then reported Offline explorer ready without a stale update action. Screenshot: screenshots/pwa-offline-ready.png.

No OS installation was performed. Actual Android/iOS install/standalone launch, storage eviction, keyboard/safe-area behaviour, production HTTPS/cache headers and closed-app push are not verified. The standalone HTML is deliberately not a PWA registration entry point.

## Remaining small touches — completion

Default/split builds, full existing suite, generated-worker tests and marker-spacing clearance/bounds/crowded-fallback checks passed. At a 390px browser viewport, two map drags revealed Return to explorer; the action restored the view. Empty trail Explore missions opened Wayfinder; empty arrival inbox Try a demo arrival created an inbox/alert entry. Sound activation changed Tools to On and its direct Mute changed it back to Off. Browser error log was empty. Screenshots: camera-recovery.png and final-small-touches.png. Real-phone performance/keyboard/safe-area and OS installation validation remain pending.

## Courtyard challenge trial

Pure tests cover all 4,096 tile orientation combinations, stage gates, correct/wrong recipients, idempotent completion and malformed save rejection. Full pre-existing suite passed, along with default/split builds and generated PWA worker tests. Browser play-through at 390×844 inspected the parcel, rotated three tiles, closed/reloaded and restored exact orientations, interrupted through a mock mission, resumed and solved, tried the wrong café (specific feedback/no reset), then delivered correctly. Completion survived another reload. Step transitions move focus to the heading; primary-button contrast corrected. Browser error log empty. Screenshots: courtyard-puzzle.png, courtyard-complete.png.

This proves functional playability and recovery, not enjoyment or retention. Fresh-player evaluation, physical-phone validation and any 3D courtyard/world animation integration remain pending. No live Tenda integration was added.

## Repair-station placement

Added three visible cabinet/parcel stations at Sunny Kitchen, Maker Café and Civic Mall, with shared Repair sign/mesh picking, near-open versus walk-and-open routing, Hunt finder and per-station local save keys/orientations. Full suite passed, including all three entrance anchors having valid connected routes. Challenge tests validate unique save keys and unsolved station-specific initial boards. Default/split builds and generated PWA checks passed.

Browser play-through of these new station interactions was NOT completed: automatic approval review rejected opening the localhost preview because the usage limit was reached. Previous screenshots document the earlier puzzle/UI only; they are not proof of the station placement. Visual placement, object hit areas, arrival opening and switching-station persistence still need a browser/device check.

## Physical character-action foundation

Full suite passed, including connected elbow/knee parent chains, seated/carry pose transitions, normalised camera-relative movement, action gates, appearance rebuild disposal and wheelchair rig ownership. Default and split-browser builds and generated PWA worker tests passed.

Browser checks: approached bench and sat/stood in 3D; approached parcel table, reached/picked up, carried and placed the parcel; paused during pickup with Escape and resumed without duplicate objects; keyboard W moved the carrying player. A 390px viewport showed compact action controls and connected hands around the carried box. Changed to a wheelchair while carrying, placed the parcel and used the bench rest action while remaining in the chair. Screenshot: screenshots/physical-carry-mobile.png.

The preview server stopped during a later reload; it was restarted and a fresh preview tab used. Final fixes include guidance/HUD separation, safe approach/alignment before interacting, eased stand-up positioning, reach blending, keyboard input separated from the core actions, and appearance changes cancelling partial interactions safely. Actual-phone controls, running motion quality and comprehensive human/NPC collision are not validated. Physical activity state is session/district-local, not persisted through reload. See PHYSICAL-ACTIONS.md for intentionally unimplemented activities and art limitations.

## Movement and contact correction
Automated regression checks cover a held direction across a bent lane without jumping onto a parallel disconnected lane, plus 160 frames each of walking/running and wheelchair wheel contact against the visible paving datum. Full test suite and production builds pass. Native phone visual review is still required.

## Daily-life batch 1–7

Implemented and exercised the in-world parcel and food-stall loops, nearby highlighting/context actions, explicit standing/seating sockets, swept furniture boundaries, speed easing, resident routines and local activity recovery. Automated tests cover both walking and wheelchair pickup/place/meal flows, paused object stability, carried-item reload, explicit resume, unfinished meal preservation, malformed/blocked storage, swept tunnelling prevention, overpass separation, overlap escape, Lagos approach clearance and disposal. Existing route, mission, rig, map and PWA regressions remain in the suite.

Browser check: fresh standalone build, Lagos wheelchair character: Food → ordering → meal received → E to bench → eating with spoon/progress → pause. Original browser PWA cache served an earlier development build; standalone was used to avoid mistaking a cached version for current source. Real Android/iOS installation, native touch controls and performance remain device QA items.

## Wheel contact, junction turns, bench direction and destination identity

Wheelchair clearance now uses the invariant circular wheel radius, rather than the rotating torus bounding box (which expanded and contracted each frame). Front casters share the same contact plane. Regression checks assert constant chair height over walking/running wheel rotation and inspect rendered vertex contact.

Keyboard steering assists turns within 1.15 world units of a connected junction, including a slight overshoot; legacy crossings share the route intersection helper, while source node IDs retain connectivity/grade separation. Tests exercise left/right requests before and after the junction and disconnected co-located source nodes.

Seating restores the bench-facing angle after the final approach, with a test that the backrest is behind the actor. Destinations now use amber diamond geometry and amber selected labels; the player retains the blue halo. Activity selection clears stale destination feedback, and arrival cues expire after the acknowledgement.

## Roadside missions and travel corrections

Mission locations now have grouped physical parcel boxes outside the lane, with separate walkable approaches and compact cream badges. Partner/shop overlays take priority. Added mission-stop lifecycle/geography/clearance tests and travel tests for off-lane starts, obstacle detours, unreachable selections, oriented building bounds and resident offset stability. Browser check confirmed a paused explorer resumes a mission journey, reaches the box approach and opens the correct notice; a direct selected-spot click also arrived with the new pale-green/dark-text arrival label. See MISSION-BOXES.md.

### Linked paths and compact utilities — 20 October
- Authored district streets are split at T junctions and at-grade crossings before source IDs are assigned. Both shortest-path routing and keyboard steering consume the same connected network. Imported source topology and elevated crossings remain separate.
- Regression fixture proves a 20-unit shortcut across a loop, keyboard-only turning into an interior T junction, crossroads, and bridge/source separation.
- Tools shares the bottom dock; new-mission alerts collapse into a small header-adjacent badge. Tools details wrap text and have a bounded scroll area.

### Maintainability cleanup — 20 October 2026
- `npm test`: passed; automatic discovery includes 7 direct regression files and 19 TypeScript behavior suites. Marker spacing now participates in the default run.
- `npm run check:architecture`: passed across 172 source modules; portable imports, shared/pure-layer rules, no explicit any, source/test/content file lengths ≤300.
- `npm run test:mutations`: passed, 7/7 isolated behavioral mutations detected after successful baselines. This is targeted evidence, not whole-app mutation or coverage measurement.
- Strict production TypeScript and standalone Vite build: passed. Standalone export regenerated. Browser/PWA build and `npm run test:pwa`: passed. Existing bundle-size warnings remain; this does not establish real-device performance.
- Whole-app coverage and separate TypeScript test checking remain unverified; see MAINTAINABILITY-AUDIT.md.

### Overlay ownership cleanup — 20 October 2026
- Shared world-to-CSS-pixel projector reused by six overlay features. One captured layout/transform per layer update; duplicate HUD obstacle lists consolidated into `shared/ui/overlayBounds.ts`.
- `npm test`: passed, seven direct regression files plus 20 discovered TypeScript suites. Architecture checks pass across 174 source modules and enforce single projection ownership.
- `npm run test:mutations`: passed, 8/8 behavioral mutations detected, including removal of screen-resolution conversion.
- Production TypeScript and standalone/browser builds passed. Standalone regenerated. PWA service-worker tests passed. Whole-app coverage and physical-device scale remain unmeasured.

### DRY cleanup and mobile handoff — 20 October 2026
- Shared preference JSON I/O + fixed-key React hook reused by appearance, trail and sound; watchlist I/O uses the same storage helper while validation/city vocabulary stays in the mission domain. Existing storage keys retained.
- Shared serialized checkpoint queue used by hunt/repair; writer errors remain visible while checkpoint waiting does not block mission inspection on storage failure.
- Shared heading wrap reused at five actor/camera call sites; activity easing aliases the shared curve.
- `npm test`: passed, 7 direct regressions plus 22 TypeScript behavior suites. `check:architecture`: passed for 178 source modules.
- `test:mutations`: passed, 10/10 isolated behavioral mutations detected after passing baselines.
- Strict production TypeScript, standalone/browser builds, standalone export and PWA tests: passed. Whole-app coverage and actual phone performance remain unmeasured.
- `npm run package` builds verified ZIP containers from the existing outputs; source includes the repeatable packaging command and corrected mobile-test instructions.

### Default split production build — 21 October 2026
- `npm run build` now creates the split PWA in `dist/`; `build:browser` aliases it. Optional file preview uses `build:standalone` and `dist-standalone/`. Vercel configuration targets `dist/`.
- Fifteen optional panels and four district factory routes have actual lazy boundaries. Fonts are external public assets; feature CSS is split and output uses content hashes. Initial offline precaching waits for scene readiness, with all lazy chunks still cached for offline play.
- Against the captured prior split build: initial-shell JS 330,143 → 265,445 bytes (gzip 108,982 → 86,668); main CSS 419,174 → 32,102 bytes. These are build payloads, not mobile startup timings. Babylon remains the largest required renderer chunk.
- Strict production TypeScript, default build, generated module-ownership/payload tests, PWA chunk/style cache tests, full regression suite (including district cache/abort checks), architecture checks, and optional standalone export passed.
- Production-browser smoke check: scene loads; lazy atlas and character preview render with focus restored; Nairobi switches through its district loader; Tools reports offline readiness after the world loads. Proof: screenshots/split-build-atlas.png and screenshots/split-build-character.png. Cold renderer initialization in the test browser was slow; no actual-phone timing claim is made.
- Whole-app coverage and physical-device performance remain unmeasured.

## Mobile navigation cleanup — 21 October 2026
- Four dock destinations: Hunt (including saved Trail), Alerts, Places, Tools (including Help).
- Removed automatic arrival overlay and permanent activity shortcuts. Contextual nearby actions and object picking remain intact.
- Movement pad defaults off, saves its preference, has a shared close button and releases held input when hidden.
- Shared sheet gesture guard permits downward heading swipes without treating body scrolling as dismissal.
- Added rendered-component regressions for unobstructed idle HUD, optional controls, hidden states and Trail access; test discovery now includes TSX suites.
- Browser checked at 390×844: four-button dock, Tools opening, movement pad enable/close and Hunt entry. Actual physical-device gesture testing remains for mobile QA.

## Budget Android performance pass — 23 October 2026

- Motivation: user-supplied Tecno Spark 40C reports averaged about 7.1/7.2 FPS in Auto-light/Balanced; device improvement remains unmeasured until a new phone run.
- Added draw-call, active-mesh evaluation, render-target/render-submission CPU timings and ambient-update cost, alongside district/view/radius and quality state. Different camera views and shadow-refresh frames must not be compared as identical workloads.
- Light disables real-time shadows/local point lights; keeps up to four nearby decorative residents at reduced update frequency; budgets small/detailed distant scenery with hysteresis. Balanced restores detail and ambient residents. Quality selection persists through reloads and city changes.
- Opaque static scenery is batched per asset with vertex colours; a palm falls from nine draw meshes to one with unchanged vertices and colours. Interactive props and textured/emissive/animated parts remain separate. No whole-building distance removal was introduced.
- Browser smoke on the production build: Light metrics show shadows disabled; walking/place inspection and camera rotation work; recording survives diagnostics closure, completes at 30 foreground samples and exports version-2 JSON with timings. This is desktop evidence, not Tecno FPS evidence.
- New behavioral tests cover preserved geometry/colour, protected mission props, near-player/Balanced restoration, bounded residents and recorder lifecycle. Three in-memory mutants (hide mission props, remove sample bound, flatten colours to white) each fail a behavioral assertion; baseline passes.
- Build, source architecture, chunk boundaries/PWA checks and full regression suite pass. Retest procedure is in MOBILE-VALIDATION.md; stable 30 FPS remains a target rather than a claimed result.
