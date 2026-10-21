import type { ProjectedMap } from '../../../geography/adapters/osm';
import { insideRing } from '../../../geography/spatial/polygon';
import { distance, projectOnSegment, walkingRoute, type Point, type Segment } from '../../navigation/routes';
import type { AssetSpec } from '../../assets/registry';
export const routeLength = (start: Point, route: Point[]) => route.reduce((sum, p, i) => sum + distance(i ? route[i - 1] : start, p), 0);
/** Conservative walking corridor; all source footprints remain obstacles, including unrendered ones. */
export function clearConnection(map: ProjectedMap, segment: Segment, scenery: AssetSpec[]) {
    const [a, b] = segment, length = distance(a, b);
    if (!Number.isFinite(length) || length < .1 || Math.abs(a.y - b.y) > .1)
        return false;
    for (let step = 0; step <= Math.ceil(length / .4); step++) {
        const t = step / Math.ceil(length / .4), p = { x: a.x + (b.x - a.x) * t, y: a.y, z: a.z + (b.z - a.z) * t };
        if (map.buildings.some(building => insideRing(p, building.points) || building.points.some((q, i) => distance(p, projectOnSegment(p, [q, building.points[(i + 1) % building.points.length]])) < 1.1)))
            return false;
        if (scenery.some(asset => asset.position && !['road', 'slab', 'house', 'tank', 'solar', 'missionHub'].includes(asset.kind)
            && distance(p, asset.position) < (asset.kind === 'pergola' ? 7 : 3)))
            return false;
    }
    return true;
}
/** Visible fictional links join existing source nodes; source-road records are never rewritten. */
export function connectDistrict(map: ProjectedMap, scenery: AssetSpec[], limit = 8) {
    const network = [...map.network], nodes = [...new Map(network.flat().map(p => [p.nodeId!, p])).values()];
    const candidates: {
        segment: Segment;
        saving: number;
    }[] = [];
    for (let i = 0; i < nodes.length; i++)
        for (let j = i + 1; j < nodes.length; j++) {
            const a = nodes[i], b = nodes[j], direct = distance(a, b);
            if (direct < 3 || direct > 24 || !clearConnection(map, [a, b], scenery))
                continue;
            const path = walkingRoute(a, b, map.network), existing = routeLength(a, path);
            if (path.length && existing > direct * 1.5 && existing - direct > 8)
                candidates.push({ segment: [a, b], saving: existing - direct });
        }
    const links: Segment[] = [];
    for (const { segment } of candidates.sort((a, b) => b.saving - a.saving)) {
        if (links.length >= limit)
            break;
        const [a, b] = segment, existing = routeLength(a, walkingRoute(a, b, network));
        if (existing - distance(a, b) < 8)
            continue;
        // Prevent a web of overlapping shortcuts: each is a distinct passage.
        if (links.some(link => link.some(p => distance(p, a) < 3 || distance(p, b) < 3)))
            continue;
        links.push(segment);
        network.push(segment);
    }
    return { network, links };
}
