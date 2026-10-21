# Reusable daily-life activities

## Playable flow

Use WASD/arrows (Shift runs), or open **Move & activities** for held touch movement and Bench / Parcel / Food shortcuts. Tap an activity's physical geometry or its ground ring to approach it. The nearest station receives a gold outline and a compact contextual **E** button. The button is also the touch equivalent; activities happen in the world, not in a modal.

- Parcel: approach the table → reach → lift into both hands → carry → return and lower it onto the table. The object interpolates with the same clock as the rig's arm targeting.
- Bench: approach its clear standing socket → sit → stand. Wheelchair users rest beside it without transferring out of the chair.
- Food: approach the stall → vendor prepares a meal → receive the bowl → carry it → use E / Bench to sit and eat. A spoon gesture and meal progress show consumption. **Keep meal for later**, movement or mission travel preserves the unfinished portion. This is a free local activity, with no money, hunger penalty or real reward attached.
- Residents: one vendor and three bounded customers approach the counter, receive meals, walk to their own benches, eat, stand and leave. They reuse player activity states, clocks, item animation, rig and final-metre approach helper. Roaming pedestrians retain stable lane offsets; player proximity does not push them sideways.

Escape pauses the explorer and local residents when no overlay is active; it continues to close overlays first. Backgrounding pauses the player. Resume is explicit. UI overlays freeze the physical activity clock. Reduced motion retains the player actions with quieter poses; ambient routines stop.

## Local recovery

Versioned local checkpoints are independent per district. Position, carried item, partial meal, transition time and suspended pickup/serving/placement state survive reload or district changes. Restored active activities begin paused; choose Resume. Returning to the relevant station resumes an interrupted transfer. No wall-clock catch-up consumes food while away. NPCs restart their ambient routines; they are not persistent citizens.

Storage is optional: malformed checkpoints are rejected and blocked/full storage does not prevent play. Saves are local to this browser/origin; they are not stored in Tenda, shared between devices or portable between file and hosted origins.

## Ownership and extension points

| Domain / file | Responsibility |
| --- | --- |
| `actions/activities/descriptors.ts` | Single station ID/label registry used by controls and scene composition. |
| `actions/activities/state.ts` | Pure interruptible activity clock and phase transitions, shared with residents. |
| `actions/activities/placement.ts` | Shared deterministic placement beside connected streets, checking existing solids. |
| `actions/activities/stations.ts` | Geometry, route/standing/seating sockets, oriented boundaries and proximity cues. Reuses city-kit bench drawing and one counter drawing. |
| `actions/activities/approach.ts` | Shared smooth final-metre movement. |
| `actions/activities/props.ts`, `poses.ts` | Shared item creation, transfers and rig pose selection. |
| `actions/activities/residents.ts` | Bounded vendor/customer routines; no input or persistence dependency. |
| `actions/persistence/activitySave.ts` | Versioned validation and failure-tolerant, deduplicated local saves. |
| `actions/createPhysicalActions.ts` | Player orchestration, contextual actions and interruption wiring. |
| `actions/ActorControls.tsx`, `keyboard.ts` | Existing reusable GameButtons, touch holds and keyboard focus/visibility guards. |
| `world/navigation/movement.ts` | Swept footprint collision checks and speed acceleration/braking, used by route and direct movement. |
| `character/createExplorer.ts`, `walker.ts` | Shared connected character rig, two-link arm targeting, spoon/eating pose, ground contact, smoothed movement and route traversal checks. |

To add another activity, define its phase/clock in state, station sockets and geometry, and its pose/item behavior. Extend the shared descriptor registry for a finder shortcut. Avoid adding another document-level listener, per-item timer or copy of player movement.

## Practical boundaries

Collision checks cover explicit asset collision metadata and the activity furniture. They are swept horizontal footprints with vertical separation, not full rigid-body physics or a replacement navmesh. Rotated activity counters use local oriented boundaries. Existing building collision shapes are cached per composition revision. Route arrivals can stop safely within 0.8 units of a blocked final threshold; blocked intermediate routes report a clear hint.

The articulated art remains procedural. Foot and wheel bounds contact the visible paving; arms target object contact points, but there is no full-body IK, hand/finger articulation, animated cloth or advanced avoidance. Native-phone performance, visual gait and crowd-space review remain necessary. Eating is the implemented daily-life slice; packing/sorting, sleeping and bus boarding remain future work. There is no Tenda API, game server, real economy or sound expansion in this change.

### Follow-up corrections

Wheelchair ground clearance is analytic and invariant under wheel rotation; shoe grounding remains separate. Nearby junction turn assistance handles early/slightly late input without a prerequisite click. Final seating applies the bench-facing angle after approach. Player identity remains blue; selected destinations are amber diamonds, clear when an activity takes over, and expire after arrival acknowledgement.
