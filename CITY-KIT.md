# City kit r25

## Domains

- `world/assets/buildings/urban.ts`: one parameterised building factory with five styles.
- `world/assets/furniture/streetLamp.ts`: shared warm fixture.
- `world/lighting/streetLighting.ts`: at most two local point lights; far fixtures remain emissive.
- `world/assets/core/asset.ts`: opt-in material batching, transforms, metadata, ownership and disposal. Only batch static parts: independently animated parts must remain separate.
- `world/districts/urban/streetscape.ts`: deterministic plot fitting, source-volume upgrades, roadside infill and furniture placement.
- `world/districts/configured/maker-quarter.json`: six connected named game streets with explicit intersection points.

## Building composition

```ts
createUrbanBuilding(context, {
 id: 'block-a/corner-shop',
 position: {x: 12, y: 0, z: 18}, rotationY: Math.PI,
 width: 9, depth: 10, floors: 3,
 style: 'shop-house', name: 'PALM STORES',
 color: '#dba98c', accent: '#307a80'
});
```

Styles: shop-house, apartments, terrace, tower, arcade. Dimensions, floors, colour, accent, facing and physical shop lettering are composition parameters. Footprint bounds, front entrance socket, occlusion and collision metadata are provided. Source plot fitting reserves a margin for cornices. New buildings remain solid presentation volumes; interior navigation and upper-floor access are not implemented.

`enrichStreetscape(district, sourceFootprints, {maxInfill:64, spacing:10})` composes a city layer without duplicating the renderer. It keeps source outlines, existing mission buildings, all navigation edges and a reserved sample-authoring lot. Infill checks building/road/furniture clearance; palms and lamps occupy clear roadside pockets. Density is deterministic and bounded. Fitting source footprints does not make these presentations verified businesses or establish actual floor counts. Additional streets and shop names are fictional.

Picking, import-overlap checks and catalogue path checks recognise urban footprints. Do not add actual mission links by visual proximity; retain explicit place/mission IDs. Keep the original source geometry/provenance distinct from art direction.

Next kit work: more authored contiguous block arrangements, further roof/facade families and repeated-geometry instancing/LOD after device testing.
