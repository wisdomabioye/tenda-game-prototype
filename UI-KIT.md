# Shared game HUD

`src/shared/ui/game/GameUI.tsx` owns GameButton (primary/secondary/quiet variants), GameCard, CloseButton, GameIcon (local SVGs) and DockButton (icon, badge, active state). Existing React buttons and section cards use these primitives; the close control is shared across panels. Domain-specific content, focus management and callbacks remain with the domain. Theme styling is shared through `src/shared/theme/hud.css`.

Tools has layer 65 closed / 75 expanded, above camera/dock 60 and scene labels 1. Modal shade remains 80. Tool panel dialogs are 70. Avoid arbitrary new layer values. Modal blocking is intentional.

Mission heading/close sit outside the scrolling body. Expanded detail and reading position are cached by mission ID, bounded to 60 entries, for this page session. Demo-action expansion is remembered separately; evidence text is not retained by this UI cache. Reload clears reading caches; this does not alter IndexedDB hunt saves.

ArrivalAlert owns a compact expandable banner with explicit actions. Alerts never open missions or move the player automatically. Active dock feedback uses aria-pressed. Transitions respect prefers-reduced-motion. Required OpenStreetMap credit remains visible; descriptive prototype context lives in Guide.

## T1, T2, T3…

These are saved personal-trail stops, created by the existing reusable `createTrailMarkers` in `src/domains/explorer/trail/TrailMarkers.ts`. Every marker uses the same DOM factory, trail-pin style, projection/overlap logic, selected state, accessible label and visit callback. Labels derive from `stop.order`; they are not individually hardcoded. Set/update/dispose are owned by the scene lifecycle. These imperative scene overlays intentionally do not mount separate React roots or duplicate the React button component.

## Navigation finishing pass

`domains/explorer/wayfinding/destinationFeedback.ts` owns the reused destination cue, entrance ring, brief building bounding outline and arrival feedback. It is shared by place, mission and street travel and disposed with the scene. The outline indicates the authored building bounds; it is not a navigation mesh or real-world boundary. Selected mission/place markers use a rounded-square shape and blue outline; numbered trail markers remain circular.

NavigationStatus reads the same journey contract for destination name, route progress and a brief arrival status. Stop cancels both movement and destination feedback. The shared focus hook covers mission/place reading cards as well as dialogs; only dialogs trap Tab. Escape dismisses the active reading/panel layer, with connected-opener or HUD fallback focus restoration. Switching HUD panels clears old reading cards.

`shared/ui/useVisualViewport.ts` owns keyboard viewport listeners and shared sizing variables. Touch scrolling is contained in cards, safe-area insets are applied, and editing sheets adapt when the virtual keyboard reduces the visible viewport. Native phone keyboard/safe-area behaviour still needs validation.

## Remaining small touches completed

CameraRecovery polls the shared cameraAway contract and offers an explicit home action only when the camera target drifts far from the player. It is suppressed while reading/panels are open. Sound state is shown in Tools with a direct mute/choose shortcut; it never enables playback automatically. EmptyState is reused by trail and arrival inbox.

markerSpacing.ts performs a shared final pass after projection using rendered button widths/heights and HUD/destination obstacles. Wide clusters use their true width; candidates have bounded offsets, and unsafe markers are hidden rather than overlapping. Their missions/places remain accessible through Trail/Wayfinder/inbox. This does not add leader lines or claim native-phone performance validation.

## Map repair stations

stations.ts is the authored station registry; each entry points to an existing reachable place entrance. RepairStations.ts owns one reused cabinet/parcel kit, accessible sign markers, projection and disposal. Both mesh picking and sign activation call the same visitRepair action. At distance under four world units it opens directly; otherwise the existing walker routes to the entrance and only its arrival callback opens the panel. Redirecting/Stop uses the walker's existing cancellation semantics.

RepairFinder offers a keyboard/list alternative and explains the interaction; remote/unsupported districts show where stations are available. Saves are keyed by station ID, with different initial orientations. A bounded authored set is cached in session too so a failed storage write does not lose progress when switching stations. This is one reused repair puzzle at three locations, not three distinct game designs or paid tasks.

## Physical actor slice

Physical actions render through the shared articulated human rig and scene props, not popup choices. Model/state gates, scene controller, local-player keyboard binding and compact touch controls are separate modules in explorer/actions. See PHYSICAL-ACTIONS.md for contracts and current limits. Player and residents share the rig, activity clock, item transfers and approach helpers. One food-stall/bench routine is implemented; fuller work-day routines remain deferred.
