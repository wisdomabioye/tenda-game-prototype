import type { Point } from '../world/navigation/routes';
export interface PlaceRecord {
    id: string;
    name: string;
    type: 'restaurant' | 'mall' | 'office' | 'shop' | 'landmark';
    coordinate: {
        latitude: number;
        longitude: number;
    };
    building: {
        assetId: string;
        kind: 'restaurant' | 'mall' | 'office';
        facing?: 'original' | 'reverse';
    };
    entrance: {
        x: number;
        z: number;
    };
    missionIds: string[];
}
export interface CityCatalogue {
    version: 1;
    cityId: string;
    sample: true;
    places: PlaceRecord[];
}
export interface WorldPlace extends PlaceRecord {
    position: Point;
    arrival: Point;
    reachable: boolean;
}
export function validateCatalogue(value: unknown): CityCatalogue {
    const c = value as CityCatalogue;
    if (!c || c.version !== 1 || c.sample !== true || (typeof c.cityId !== 'string' || !c.cityId.trim()) || !Array.isArray(c.places))
        throw new Error('Unsupported place catalogue');
    const ids = new Set<string>(), assets = new Set<string>(), missions = new Set<string>();
    for (const p of c.places) {
        if (!p || typeof p.id !== 'string' || !p.id.trim() || typeof p.name !== 'string' || !p.name.trim() || !['restaurant', 'mall', 'office','shop','landmark'].includes(p.type) || (p.type==='shop'?'restaurant':p.type==='landmark'?'office':p.type) !== p.building?.kind || typeof p.building.assetId !== 'string' || !p.building.assetId.trim() || p.building.facing !== undefined && !['original', 'reverse'].includes(p.building.facing) || ids.has(p.id) || assets.has(p.building.assetId))
            throw new Error('Invalid or duplicate place');
        const co = p.coordinate, e = p.entrance;
        if (!co || !Number.isFinite(co.latitude) || Math.abs(co.latitude) > 85 || !Number.isFinite(co.longitude) || Math.abs(co.longitude) > 180 || !e || !Number.isFinite(e.x) || !Number.isFinite(e.z) || !Array.isArray(p.missionIds))
            throw new Error('Invalid place location');
        for (const id of p.missionIds) {
            if (typeof id !== 'string' || !id || missions.has(id))
                throw new Error('Ambiguous mission place link');
            missions.add(id);
        }
        ids.add(p.id);
        assets.add(p.building.assetId);
    }
    return c;
}
