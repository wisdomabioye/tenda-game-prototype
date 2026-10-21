# Roadside mission discovery

Missions share small physical parcel boxes beside the walking lane, grouped by their presentation location (or venue when no explicit position exists). Tapping a box or its compact cream badge opens its notices; one-notice boxes start the journey directly. Multiple notices expand only on request. Full mission details still open after arrival. Shop/partner markers receive priority in the shared overlap layout.

The box and the walkable arrival point are separate sockets. The player walks to the nearby approach, not inside the parcel box. A selected mission's amber destination cue identifies the box. Source mission coordinates and real-world eligibility are unchanged: these are illustrative presentation props, not edited task addresses.

Ownership:

- `missions/world/MissionStops.ts`: grouping, parcel geometry, approach/display sockets, streaming reconciliation and disposal. Unchanged groups reuse their existing geometry.
- `missions/presentation/MarkerLayer.ts`: compact badge projection and explicit expansion. No eligibility or backend logic.
- `world/navigation/roadsidePlacement.ts`: common placement utility reused by mission boxes and daily-life stations. The previous activity placement import remains a compatibility export.
- `shared/ui/markerSpacing.ts`: final collision-free overlay layout; shops/partners take priority over passive mission badges.
- `world/navigation/traversableRoute.ts`: tries the normal graph route first, then removes blocked links and seeks a connected detour. Source topology and grade separation remain authoritative. Unsafe targets can use a clear approach within 0.75 units; genuinely unreachable routes are rejected with a hint.
- `world/assets/core/asset.ts`: separate oriented movement bounds and display/occlusion bounds. Rotated buildings no longer use oversized display AABBs to block movement.

Selecting a destination resumes a paused explorer, preserves interrupted activity state and clears a destination cue if routing fails. Off-lane starts (for example beside a bench) first return to the nearest connected lane. Residents no longer jump sideways in response to player proximity. This removes the artificial shove; it does not introduce a full dynamic crowd-physics system.

Tests cover grouped/off-path/connected box placement, fixture-country layouts, source geography preservation, stream removal and disposal; off-lane movement, blocked-edge detours, unreachable selections, rotated-body clearance and stable resident visual offsets. The browser flow was exercised from a paused explorer through box expansion, mission travel, correct notice arrival and a direct selected-spot journey. Native-device QA remains separate.
