import type { ProjectedMap } from '../../../geography/adapters/osm';
import type { AssetSpec } from '../../assets/registry';
import { clearPocket } from './streetLife';
import { distance, type Point } from '../../navigation/routes';
/** Source names on physical signboards; placements are authored game scenery. */
export function streetSigns(map: ProjectedMap): AssetSpec[] {
    const groups = new Map<string, typeof map.roads>();
    for (const road of map.roads)
        if (road.name && map.network.includes(road.segment))
            groups.set(road.name, [...(groups.get(road.name) ?? []), road]);
    const junctions = new Map<string, Set<string>>();
    for (const road of map.roads)
        if (road.name)
            for (const node of road.segment) {
                const names = junctions.get(node.nodeId!) ?? new Set<string>();
                names.add(road.name);
                junctions.set(node.nodeId!, names);
            }
    const placed: Point[] = [], assets: AssetSpec[] = [];
    for (const [name, roads] of groups) {
        let found = 0;
        const priority = (road: typeof roads[number]) => road.segment.some(p => (junctions.get(p.nodeId!)?.size ?? 0) > 1) ? 1 : 0;
        const candidates = [...roads].sort((a, b) => priority(b) - priority(a) || distance(b.segment[0], b.segment[1]) - distance(a.segment[0], a.segment[1]));
        for (const road of candidates) {
            const [a, b] = road.segment, junction = road.segment.find(p => (junctions.get(p.nodeId!)?.size ?? 0) > 1), mid = junction ?? { x: (a.x + b.x) / 2, y: 0, z: (a.z + b.z) / 2 };
            for (const radius of [5, 7, 9])
                for (const side of [-1, 1]) {
                    const len = distance(a, b), p = { x: mid.x - (b.z - a.z) / len * radius * side, y: 0, z: mid.z + (b.x - a.x) / len * radius * side };
                    if (!clearPocket(map, p, 2.4) || placed.some(q => distance(p, q) < 7))
                        continue;
                    assets.push({ kind: 'streetSign', id: `street-sign-${road.id}-${side}`, position: p, name, crossStreet: junction ? [...(junctions.get(junction.nodeId!) ?? [])].find(n => n !== name) : undefined, rotationY: Math.atan2(-(b.z - a.z), b.x - a.x) });
                    placed.push(p);
                    found++;
                    break;
                }
            if (found >= 2)
                break;
        }
    }
    return assets;
}
