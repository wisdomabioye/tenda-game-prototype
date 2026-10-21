import type { MapSnapshot } from '../model/types';
import { validateCoordinate } from '../projection/local';
/** Fail before mounting a scene if an imported offline snapshot is malformed. */
export function validateSnapshot(input: MapSnapshot): MapSnapshot {
    if (input.schemaVersion !== 1 || !input.roads.length)
        throw new Error('Unsupported or empty map snapshot');
    validateCoordinate(input.origin);
    const b = input.bounds;
    if (!(b.west < b.east && b.south < b.north) || b.east - b.west > .05 || b.north - b.south > .05)
        throw new Error('Pilot bounds are invalid or too large');
    if (input.worldUnitsPerMetre <= 0 || !Number.isFinite(input.worldUnitsPerMetre))
        throw new Error('Invalid projection scale');
    const ids = new Set<string>();
    for (const feature of [...input.roads, ...input.buildings]) {
        if (!feature.id || ids.has(feature.id))
            throw new Error('Duplicate geographic feature');
        ids.add(feature.id);
    }
    for (const road of input.roads)
        for (const segment of road.segments) {
            if (segment.length !== 2)
                throw new Error('Invalid road segment');
            for (const node of segment) {
                validateCoordinate(node);
                if (!node.id)
                    throw new Error('Missing source node ID');
            }
        }
    for (const building of input.buildings) {
        if (building.outline.length < 3)
            throw new Error('Invalid building outline');
        for (const node of building.outline)
            validateCoordinate(node);
    }
    return input;
}
