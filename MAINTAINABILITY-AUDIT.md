# Maintainability audit — 20 October 2026

## Scope and evidence

Architecture/import/type-escape/file-length scan: all production TypeScript modules plus handwritten test, CSS and JSON content files. Behavioral review: navigation input → connected topology → shortest route/walker; actor input/pause and activity saves; hunt/challenge storage → IndexedDB transaction completion/error → cleanup; mock/source contract portability; shared UI/test discovery. Asset core ownership, runtime disposal, loading/cache and stream lifecycle were inspected as supporting boundaries.

This was not a line-by-line audit of every building drawing, every UI panel or all authored map data. No external Tenda service, wallet, live account, push delivery, multiplayer backend, dependency upgrade, or new feature was added. Existing prototype data and saves are preserved.

## Verified findings and repairs

| Finding | Repair and evidence |
| --- | --- |
| Routing, keyboard steering and authored districts repeated junction construction | One geometry/topology preparation implementation; both route and steering consume it. Existing navigation regressions pass; independent exhaustive oracle covers 864 graph queries. |
| Hunt storage duplicated the shared database implementation | One `shared/storage/gameRecords.ts` service; hunt adapter keeps old key and validates records. Read/write failure, abort, cleanup and save isolation tests added. |
| Source relied on absolute imports from the author's other checkout | Self-contained browse-contract snapshot; build no longer depends on that path. Architecture gate rejects future absolute/escaping source imports. |
| Physical actions and keyboard binding repeated modal-blocking selectors | One actor input policy used by both. |
| Domain data types were owned by a marker renderer/controller file | Mission anchors and actor contracts extracted to model/contract files. |
| Marker-spacing regression was omitted from the default command | Automatic test discovery; all ordinary regression files now run. PWA remains explicitly build-dependent. |
| Three tests used `any`; a global document fixture leaked between suites | Typed scene-node narrowing; document fixture restored after use. Architecture gate rejects explicit `any`. |
| Pause assertion held an otherwise idle parcel | Added a pause assertion during an actively changing meal. Disabling pause now makes the regression fail. |
| Guide claimed activity state reset on reload | Wording aligned with existing local checkpoint/explicit resume behavior. |
| Version-named tests and overwritten theme declarations obscured ownership | Descriptive suite names; 14 unconditionally superseded declarations removed without changing the winning rules. |

## Review passes

1. Ownership/runtime pass: reproduced duplication, missing test wiring and checkout coupling; repaired the findings above. Source/test/data file lengths checked deterministically. No production or test TypeScript file exceeds 300 lines; one long JSON configuration was reformatted without changing parsed data.
2. Failure/test-quality pass: re-read changed navigation/storage/contracts and their consumers; checked source-ID bridge separation, same save keys, request/transaction failure, cleanup and active activity pause. Seven temporary mutations were detected by assertions after passing baselines. No additional verified finding in those inspected paths remained. This does not satisfy the full skill convergence gate below.

## Validation and honest limits

The final commands and outcomes are recorded in VERIFICATION.md. The mutation harness checks junction splitting, shortest-route relaxation, collisions, active pause, aborted checkpoints, marker overlap and reverse cleanup order. All seven must be detected; a crashed or unbuildable mutant does not count. It runs against temporary bundles, never the real source.

Whole-app statement/branch/function/line coverage is not measured. There is no existing coverage instrumenter or dedicated general-purpose lint command. Production strict TypeScript, the architecture checks, executed behavior regressions and builds are available; they must not be reported as a >90% coverage result or as a universal guarantee. TypeScript test files are not separately typechecked. Real-device load and UI validation are also still pending.

## Follow-up cleanup

Six overlay features independently implemented world-to-screen projection. Mission labels also read canvas/render dimensions again for each point. The shared projector now captures dimensions/transform once per layer update, preserves CSS-pixel and camera-viewport coordinates, and retains depth for culling. Mission, place, trail, repair, destination and player overlays all consume it.

Three marker-layout owners had separate lists of controls to avoid. They now share `overlayBounds.ts`, including notifications, Tools, the dock and actor controls, and ignore hidden/collapsed controls consistently. Projection ownership is now enforced by the architecture test.

The new renderer-boundary regression covers both screen orientations, render resolutions from 1× through 3×, camera viewport offsets, depth, and layout-read counts. Removing render-to-CSS conversion is an eighth isolated mutation, detected by a behavioral assertion. All eight baseline/mutation pairs pass. This still does not measure whole-app coverage.

## Final DRY pass before mobile delivery

Repeated JSON preference hydration/writes now use shared storage I/O and a fixed-key React hook. Feature parsers, fallbacks and existing keys are retained. Watchlist validation and city choices moved out of app composition into the mission domain and are shared by its form. Hunt and repair writes now use one tested serial queue; failed writes remain observable to the feature but do not poison later saves or block checkpoint callers. Five heading-wrap calculations and the activity smoothstep implementation now use shared motion functions.

New regressions cover blocked storage getters, corrupt/incompatible JSON, zero values, quota/serialization failures, appearance/watchlist roundtrips, 1,000 shortest-turn cases and ordered/failing async saves. Two additional mutations remove serialization and shortest-turn wrapping; both must fail behavioral assertions. Ten isolated mutations are now checked in total.

MOBILE-VALIDATION.md now names the current build and explicitly distinguishes the diagnostics-open rendering snapshot from normal gameplay. The current recorder is not presented as recording after its panel closes.

**Audit status: Not converged.** Concrete findings above are repaired, but the review skill's global >90% coverage gate is unverified. The architecture is a stronger basis for incremental extension; arbitrary city/crowd size and absence of all DRY violations have not been established.
