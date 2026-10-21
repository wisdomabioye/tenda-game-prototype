# Add a district by composing the existing kit

Use `src/domains/world/districts/configured/createDistrict.ts`:

```ts
import {createDistrict, type DistrictParameters} from './createDistrict';
import parameters from './maker-quarter.json';

const district = createDistrict(parameters as DistrictParameters, sharedFrame);
```

`sharedFrame` supplies one origin, scale, attribution and bounds context. Adjacent districts must use exactly the same coordinate frame. Do not recenter each new district independently.

The complete working parameter file is `maker-quarter.json` (also `public/examples/maker-quarter.json`). Fields:

| Field | Purpose |
|---|---|
| id / cityId / name | Stable district identity and city grouping |
| bounds | Region in the common world frame |
| roads | Stable IDs/names, widths and explicit at-grade junction points |
| buildings | Stable IDs, commercial kit type, name, position, footprint, floors, colour, rotation and optional explicit mission IDs |
| benches / trees | Reusable scenery placements |
| spawn | Initial pose for a separately mounted district |

Coordinates are local world coordinates after projection, with Y for game elevation. Geographic latitude/longitude is derived through the shared projection. Rotation is degrees. Building landmarks can be imported using the office kit; monument sculpture kits are not included.

The factory validates bounds, roads, building/road overlaps and clear reachable entrances. It composes restaurant, mall, storeyed building, tree, bench and signboard kits. It never creates a new renderer or infers mission links from proximity. Source-map streets and illustrative game streets remain separate data provenance even though paving is visually consistent.

`configured/city.ts` combines the existing Victoria Island snapshot with the illustrative Maker Quarter. A footprint-checked game connector joins an existing navigation node to the extension along the outside edge. Original source node IDs are preserved; synthetic nodes have explicit shared identities. The entire graph stays resident, while west/east/Maker detail groups are instantiated/disposed through `runtime/streamedComposition.ts`. Cities with up to six regions retain all groups to prevent visible popping. Larger definitions use padded load/retention ranges; view-aware LOD remains future work. Static navigation, roads, labels, mission hubs and a small set of fabric-bearing shops remain resident.

For another city, register a loader/manifest entry and its shared frame plus parameter file. For another adjacent region, add its explicit portal/graph links, include its assets, and define a chunk bound. The current city composer is one example, not an automatic city tessellation service.

## Place file import

Tools → Import places accepts JSON files or pasted JSON. Example: `public/examples/lagos-places.json`. Contract: `domains/places/importing/places.schema.json`; runtime checks live in `importing/model.ts` and reusable `authoring/placement.ts`.

Imports are atomic, limited to25 records/100KB, session-only, and must match the active city/patch. No coordinate relocation or partial import. Duplicate IDs/overlaps/unreachable entrances are rejected with an indexed error. Use Add sample place → Export to retain session records as JSON. Records outside a narrower legacy map view remain in session memory but are not rendered there. Source district configuration and imported place records are different formats; do not pass one to the other parser.
