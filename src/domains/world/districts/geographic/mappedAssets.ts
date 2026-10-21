import {PAVING_COLOR} from '../../assets/streets/palette';
import type { ProjectedMap } from '../../../geography/adapters/osm';
import type { AssetSpec } from '../../assets/registry';
const roadWidths: Record<string, number> = {
    primary: 3.6, secondary: 3.1, tertiary: 2.7, residential: 2.4,
    service: 1.8, footway: 1.2, pedestrian: 2, path: 1.2,
};
export function mappedAssets(map: ProjectedMap): AssetSpec[] {
    const { min, max } = map.bounds;
    const width = max.x - min.x, depth = max.z - min.z;
    const center = { x: (min.x + max.x) / 2, z: (min.z + max.z) / 2 };
    const assets: AssetSpec[] = [
        { kind: 'slab', id: 'unmapped-context', name: 'unmapped land context',
            position: { ...center, y: -.25 }, width: width + 120, height: .1,
            depth: depth + 120, color: '#d4d6c5' },
        { kind: 'slab', id: 'pilot-ground', name: 'geographic pilot ground',
            position: { ...center, y: -.15 }, width: width + 16, height: .15,
            depth: depth + 16, color: '#e9d7b6' },
    ];
    for (const road of map.roads) {
        assets.push({ kind: 'road', id: `road-${road.id}`, segment: road.segment,
            color:PAVING_COLOR,
            width: roadWidths[road.kind] ?? 2 });
    }
    // Source outlines constrain crafted buildings; do not render empty plot slabs.
    return assets;
}
