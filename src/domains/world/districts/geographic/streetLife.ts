import type { ProjectedMap } from '../../../geography/adapters/osm';
import { insideRing } from '../../../geography/spatial/polygon';
import { distance, projectOnSegment, type Point } from '../../navigation/routes';
import type { AssetSpec } from '../../assets/registry';
/** Art direction stays separate from source geometry and primitive construction. */
export function clearPocket(map: ProjectedMap, p: Point, radius: number) {
    return p.x - radius >= map.bounds.min.x && p.x + radius <= map.bounds.max.x
        && p.z - radius >= map.bounds.min.z && p.z + radius <= map.bounds.max.z
        && !map.buildings.some(b => insideRing(p, b.points) || b.points.some((a, i) => distance(p, projectOnSegment(p, [a, b.points[(i + 1) % b.points.length]])) < radius))
        && map.roads.every(r => distance(p, projectOnSegment(p, r.segment)) > radius + 2);
}
export function streetLife(map: ProjectedMap, focus: Point): AssetSpec[] {
    const result: AssetSpec[] = [];
    const colours = ['#efb28c', '#91b9bc', '#dfb970', '#c997a3', '#96b99a'];
    const nearby = [...map.buildings].sort((a, b) => distance(a.points[0], focus) - distance(b.points[0], focus));
    let count = 0;
    for (const building of nearby) {
        if (distance(building.points[0], focus) > 65 || count >= 36)
            continue;
        const points = building.points;
        let longest = 0, angle = 0;
        for (let i = 0; i < points.length; i++) {
            const a = points[i], b = points[(i + 1) % points.length], length = distance(a, b);
            if (length > longest) {
                longest = length;
                angle = Math.atan2(-(b.z - a.z), b.x - a.x);
            }
        }
        const c = Math.cos(angle), s = Math.sin(angle);
        const local = points.map(p => ({ x: p.x * c - p.z * s, z: p.x * s + p.z * c }));
        const minX = Math.min(...local.map(p => p.x)), maxX = Math.max(...local.map(p => p.x));
        const minZ = Math.min(...local.map(p => p.z)), maxZ = Math.max(...local.map(p => p.z));
        const u = (minX + maxX) / 2, v = (minZ + maxZ) / 2;
        const center = { x: u * c + v * s, y: 0, z: -u * s + v * c };
        let width = Math.min(10, (maxX - minX) * .8), depth = Math.min(9, (maxZ - minZ) * .8);
        const fits = () => [-1, 1].every(dx => [-1, 1].every(dz => insideRing({ x: center.x + dx * width / 2 * c + dz * depth / 2 * s, z: center.z - dx * width / 2 * s + dz * depth / 2 * c }, points)));
        while (width > 2.6 && depth > 2.6 && !fits()) {
            width *= .85;
            depth *= .85;
        }
        if (width < 2.6 || depth < 2.6 || !fits())
            continue;
        const height = 3.2 + count % 3 * .8;
        result.push({ kind: 'house', id: `crafted-${building.id}`, position: center, rotationY: angle, width, depth, height, color: colours[count % colours.length] });
        if (count % 3 === 0)
            result.push({ kind: 'tank', id: `tank-${building.id}`, position: { ...center, y: height + .25 } });
        if (count % 3 === 1)
            result.push({ kind: 'solar', id: `solar-${building.id}`, position: { ...center, y: height + .3 }, rotationY: angle });
        count++;
    }
    const largeHouses = result.filter((asset): asset is Extract<AssetSpec, {
        kind: 'house';
    }> => asset.kind === 'house' && asset.width >= 4.5 && asset.depth >= 4.5)
        .sort((a, b) => b.width * b.depth - a.width * a.depth).slice(0, 8);
    largeHouses.forEach((house, index) => {
        const at = result.indexOf(house);
        result[at] = { kind: 'storeyed', id: house.id, position: house.position, rotationY: house.rotationY,
            width: house.width, depth: house.depth, color: house.color, floors: index === 0 ? 9 : index === 1 ? 7 : 3 + index % 2,
            style: index < 2 ? 'office' : index % 2 ? 'terraces' : 'courtyard' };
        for (let i = result.length - 1; i >= 0; i--)
            if ((result[i].id === 'tank-' + house.id.replace('crafted-', '')) || (result[i].id === 'solar-' + house.id.replace('crafted-', '')))
                result.splice(i, 1);
    });
    // Plant/furnish clear roadside pockets, never source roads or building interiors.
    const placed: Point[] = [];
    // One generous fictional rest pocket, separate from roads and mapped buildings.
    const restCandidates: Point[] = [];
    for (let x = -70; x <= 70; x += 3)
        for (let z = -70; z <= 70; z += 3)
            restCandidates.push({ x: focus.x + x, y: 0, z: focus.z + z });
    const rest = restCandidates.sort((a, b) => distance(a, focus) - distance(b, focus)).find(p => clearPocket(map, p, 5.4));
    if (rest) {
        placed.push(rest);
        result.push({ kind: 'slab', name: 'fictional rest pocket', id: 'rest-pocket-paving', position: { ...rest, y: -.02 }, width: 8, height: .1, depth: 7, color: '#dfb79b' }, { kind: 'pergola', id: 'rest-pocket-shade', position: { x: rest.x - 2.5, y: 0, z: rest.z - 2 } }, { kind: 'sign', id: 'rest-pocket-sign', position: { x: rest.x - 3, y: 0, z: rest.z + 2 }, text: 'Explorer rest stop', arrow: '↓' });
    }
    const clear = (p: Point) => clearPocket(map, p, 2)
        && placed.every(q => distance(p, q) > 5);
    let index = 0;
    for (const [a, b] of map.network) {
        const length = distance(a, b);
        if (length < 4)
            continue;
        const mid = { x: (a.x + b.x) / 2, y: 0, z: (a.z + b.z) / 2 };
        if (distance(mid, focus) > 68)
            continue;
        const nx = -(b.z - a.z) / length, nz = (b.x - a.x) / length;
        for (const side of [-1, 1]) {
            const p = { x: mid.x + nx * side * 5.5, y: 0, z: mid.z + nz * side * 5.5 };
            if (!clear(p))
                continue;
            placed.push(p);
            result.push(index % 4 === 0 ? { kind: 'bench', id: `street-seat-${index}`, position: p, rotationY: Math.atan2(-(b.z - a.z), b.x - a.x) }
                : index % 4 === 1 ? { kind: 'bed', id: `street-bed-${index}`, position: p }
                    : index % 4 === 2 ? { kind: 'palm', id: `street-palm-${index}`, position: p, height: 4.5 }
                        : { kind: 'tree', id: `street-tree-${index}`, position: p });
            index++;
            if (index >= 42)
                return result;
        }
    }
    return result;
}
/** Shared pocket placement for hub identity, with source-road/footprint clearance. */
export function hubScenery(map: ProjectedMap, stop: Point, id: string, label: string, colour: string): AssetSpec[] {
    const pockets: Point[] = [];
    for (const radius of [8, 12, 16])
        for (let i = 0; i < 12; i++) {
            const a = i * Math.PI / 6, p = { x: stop.x + Math.cos(a) * radius, y: 0, z: stop.z + Math.sin(a) * radius };
            if (!clearPocket(map, p, 3)
                || pockets.some(q => distance(p, q) < 7))
                continue;
            pockets.push(p);
            if (pockets.length === 3)
                break;
        }
    return pockets.slice(0, 3).map((position, i): AssetSpec => i === 0
        ? { kind: 'stall', id: `hub-stall-${id}`, position, color: colour }
        : i === 1 ? { kind: 'bench', id: `hub-bench-${id}`, position }
            : { kind: 'sign', id: `hub-sign-${id}`, position, text: label, arrow: '→' });
}
