import {PAVING_COLOR} from '../../assets/streets/palette';
import {streetSigns} from './streetSigns';
import {connectDistrict} from './connections';
import { streetLife, hubScenery } from './streetLife';
import type { ProjectedMap } from '../../../geography/adapters/osm';
import { snapToStreet } from '../../navigation/routes';
import { venues as categoryVenues } from '../baseline/venues';
import type { DistrictDefinition } from '../shared/types';
import { chooseSampleStops } from './hubs';
import { mappedAssets } from './mappedAssets';
/** City-independent bridge from projected map data to reusable world components. */
export function composeGeographicDistrict(map: ProjectedMap, profile: {
    id: string;
    name: string;
}): DistrictDefinition {
    const assets = mappedAssets(map);
    const { spawn, stops } = chooseSampleStops(map.network, map.buildings.map(building => building.points), categoryVenues.length);
    assets.push(...streetLife(map, spawn));
    const venues = categoryVenues.map((venue, index) => ({ ...venue,
        name: venue.name.split(' ')[0] + ' hub', x: stops[index].x, z: stops[index].z + 4, h: 0 }));
    for (const venue of venues)
        assets.push({ kind: 'missionHub', id: `venue-${venue.category}`,
            position: { x: venue.x, y: 0, z: venue.z }, color: venue.color });
    venues.forEach((venue, index) => assets.push(...hubScenery(map, stops[index], venue.category, venue.name, venue.color)));
    assets.push(...streetSigns(map));
    const connections=connectDistrict(map,assets);
    connections.links.forEach((segment,index)=>assets.push({kind:'road',id:`game-link-${index}`,segment,width:1.8,color:PAVING_COLOR}));
    const names = new Set<string>();
    const landmarks = map.roads.filter(road => road.name && map.network.includes(road.segment))
        .filter(road => {
        if (names.has(road.name!))
            return false;
        names.add(road.name!);
        return true;
    }).slice(0, 7).map(road => {
        const [a, b] = road.segment;
        const point = snapToStreet({ x: (a.x + b.x) / 2, y: 0, z: (a.z + b.z) / 2 }, map.network);
        return { id: road.sourceId, name: road.name!, direction: {x:b.x-a.x,z:b.z-a.z}, x: point.x, y: .4, z: point.z };
    });
    const { min, max } = map.bounds;
    const width = max.x - min.x, depth = max.z - min.z;
    return {
        id: profile.id, largeGround: true, assets, network: connections.network, venues, landmarks,
        geographic: { bounds:{minX:min.x,maxX:max.x,minZ:min.z,maxZ:max.z}, name: profile.name, attribution: map.source.attribution,
            licenceUrl: map.source.licenceUrl, origin: map.projection.origin,
            worldUnitsPerMetre: map.projection.worldUnitsPerMetre, sourceUrl: map.source.url },
        settings: {
            spawn,
            ground: { width: width + 16, depth: depth + 16,
                center: { x: (min.x + max.x) / 2, y: .12, z: (min.z + max.z) / 2 } },
            pan: { minX: min.x - 10, maxX: max.x + 10, minZ: min.z - 10, maxZ: max.z + 10 },
            camera: { maxRadius: 450, overview: 320, desktopOverview: 165, adventure: 66,
                mobileAdventure: 90, initial: 80, mobileInitial: 105 },
            walkSpeed: 9, fog: { start: 450, end: 800 },
        },
    };
}
