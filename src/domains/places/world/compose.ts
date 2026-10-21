import {PAVING_COLOR} from '../../world/assets/streets/palette';
import { validateCatalogue, type WorldPlace } from '../model';
import type { DistrictDefinition } from '../../world/districts/shared/types';
import type { ProjectedMap } from '../../geography/adapters/osm';
import { insideRing } from '../../geography/spatial/polygon';
import { distance, projectOnSegment, type Point, type Segment } from '../../world/navigation/routes';
import type { AssetSpec } from '../../world/assets/registry';
/** Connect only clear authored approaches, explicitly splitting the joined graph edge. */
export function attachPlaceCatalogue(district: DistrictDefinition, map: Pick<ProjectedMap,'projection'>, raw: unknown): DistrictDefinition {
    const catalogue = validateCatalogue(raw);
    if (catalogue.cityId !== district.id)
        throw new Error('Catalogue city mismatch');
    const assets = [...district.assets], network = [...district.network], places: WorldPlace[] = [...(district.places??[])];
    for (const record of catalogue.places) {
        if(places.some(p=>p.id===record.id||p.building.assetId===record.building.assetId||p.missionIds.some(id=>record.missionIds.includes(id))))throw new Error("Duplicate existing place or mission link");
        const index = assets.findIndex(a => a.id === record.building.assetId), source = assets[index];
        if (!source || !['house', 'storeyed'].includes(source.kind) || !('width' in source) || !('depth' in source))
            throw new Error('Unknown catalogue building');
        const position = map.projection.forward(record.coordinate), angle = (source.rotationY ?? 0) + (record.building.facing === 'reverse' ? Math.PI : 0), c = Math.cos(angle), s = Math.sin(angle);
        if (Math.abs(record.entrance.x) > source.width / 2 || Math.abs(record.entrance.z + source.depth / 2) > 1 || record.entrance.z >= 0)
            throw new Error('Entrance must be on the sample building front');
        if (!source.position || distance(position, source.position) > .5)
            throw new Error('Catalogue coordinate does not match its sample building');
        const arrival = { x: position.x + record.entrance.x * c + record.entrance.z * s, y: 0, z: position.z - record.entrance.x * s + record.entrance.z * c, nodeId: `place/${record.id}/entrance` };
        if (record.building.kind === 'office' && source.kind === 'storeyed')
            assets[index] = { ...source, position, rotationY: angle };
        else if (record.building.kind !== 'office')
            assets[index] = { kind: record.building.kind, id: source.id, position, rotationY: angle, width: source.width, depth: source.depth, style:record.type==='shop'?'shop':undefined,color: 'color' in source ? source.color : '#acc7b6', name: record.name.toUpperCase() };
        else
            throw new Error('Office requires a storeyed building');
        for (let i = assets.length - 1; i >= 0; i--)
            if (assets[i].id === 'tank-' + source.id.replace('crafted-', '') || assets[i].id === 'solar-' + source.id.replace('crafted-', '')) {
                assets.splice(i, 1);
            }
        const buildings = assets.filter(a => ['house', 'storeyed', 'restaurant', 'mall','urban'].includes(a.kind) && 'width' in a && 'depth' in a).map(a => {
            const box = a as AssetSpec & {
                width: number;
                depth: number;
            }, r = box.rotationY ?? 0, c = Math.cos(r), s = Math.sin(r), p = box.position!;
            return { id: box.id, points: [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([x, z]) => ({ x: p.x + x * box.width / 2 * c + z * box.depth / 2 * s, y: 0, z: p.z - x * box.width / 2 * s + z * box.depth / 2 * c })) };
        });
        const clear = (end: Point) => {
            const len = distance(arrival, end), steps = Math.max(1, Math.ceil(len / .25));
            for (let i = 0; i <= steps; i++) {
                const t = i / steps, p = { x: arrival.x + (end.x - arrival.x) * t, y: 0, z: arrival.z + (end.z - arrival.z) * t };
                if (buildings.some(b => b.id !== source.id && (insideRing(p, b.points) || b.points.some((q, j) => distance(p, projectOnSegment(p, [q, b.points[(j + 1) % b.points.length]])) < .45))))
                    return false;
                if (assets.some(a => a.position && !['road', 'slab', 'house', 'storeyed', 'restaurant', 'mall', 'urban', 'tank', 'solar', 'missionHub', 'notice'].includes(a.kind) && distance(p, a.position) < (a.kind === 'pergola' ? 6 : 1.2)))
                    return false;
                // Never cut back through the selected building's footprint.
                const dx = p.x - position.x, dz = p.z - position.z, lx = dx * c - dz * s, lz = dx * s + dz * c;
                if (Math.abs(lx) < source.width / 2 + .1 && Math.abs(lz) < source.depth / 2 + .1)
                    return false;
            }
            return true;
        };
        const candidates = network.map((segment, index) => ({ segment, index, point: projectOnSegment(arrival, segment) })).filter(a => distance(arrival, a.point) < 24).sort((a, b) => distance(arrival, a.point) - distance(arrival, b.point));
        const chosen = candidates.find(a => clear(a.point));
        if (chosen) {
            const [a, b] = chosen.segment;
            const join = distance(chosen.point, a) < 1e-5 ? a : distance(chosen.point, b) < 1e-5 ? b : { ...chosen.point, nodeId: `place/${record.id}/junction` };
            if (join !== a && join !== b)
                network.splice(chosen.index, 1, [a, join], [join, b]);
            const path: Segment = [join, arrival];
            network.push(path);
            assets.push({ kind: 'road', id: `place-approach-${record.id}`, segment: path, width: 1, color:PAVING_COLOR });
        }
        places.push({ ...record, position, arrival, reachable: Boolean(chosen) });
    }
    return { ...district, assets, network, places };
}
