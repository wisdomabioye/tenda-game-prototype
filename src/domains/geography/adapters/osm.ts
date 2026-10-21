import type { MapSnapshot } from '../model/types';
import { createLocalProjection } from '../projection/local';
import {distance, type Segment, type Point} from '../../world/navigation/routes';
import { largestConnectedNetwork } from '../../world/navigation/sourceGraph';
import { validateSnapshot } from './snapshot';
/** Adapter keeps source features/provenance out of the renderer and asset factories. */
export function adaptMapSnapshot(raw: MapSnapshot) {
    const data = validateSnapshot(raw), projection = createLocalProjection(data.origin, data.worldUnitsPerMetre);
    const roadSegments = data.roads.flatMap(road => road.segments.map((segment, index) => { const layer = Number(road.layer) || 0, height = layer * 3 * data.worldUnitsPerMetre; const points = segment.map(node => ({ ...projection.forward(node), y: height, nodeId: node.id + `/layer/${layer}` })) as [
        Point,
        Point
    ]; return { id: `${road.id}/${index}`, sourceId: road.id, name: road.name, kind: road.kind, segment: points as Segment, walkable: layer === 0 && road.bridge === 'no' && road.tunnel === 'no' }; })).filter(road => distance(road.segment[0], road.segment[1]) > .001);
    const network = largestConnectedNetwork(roadSegments.filter(r => r.walkable).map(r => r.segment));
    if (!network.length)
        throw new Error('No connected at-grade pilot network');
    const sw = projection.forward({ longitude: data.bounds.west, latitude: data.bounds.south }), ne = projection.forward({ longitude: data.bounds.east, latitude: data.bounds.north });
    return { id: data.id, projection, roads: roadSegments, network, buildings: data.buildings.map(b => ({ id: b.id, points: b.outline.map(p => projection.forward(p)), sourceHeight: b.height, sourceLevels: b.levels })), bounds: { min: { x: sw.x, y: 0, z: ne.z }, max: { x: ne.x, y: 0, z: sw.z } }, source: data.source };
}

export type ProjectedMap=ReturnType<typeof adaptMapSnapshot>;
