export interface Coordinate {
    latitude: number;
    longitude: number;
}
export interface GeoNode extends Coordinate {
    id: string;
}
export interface GeoBounds {
    west: number;
    south: number;
    east: number;
    north: number;
}
export interface RoadRecord {
    id: string;
    name: string | null;
    kind: string;
    layer: string;
    bridge: string;
    tunnel: string;
    segments: GeoNode[][];
}
export interface BuildingRecord {
    id: string;
    outline: GeoNode[];
    height: string | null;
    levels: string | null;
}
export interface MapSnapshot {
    schemaVersion: number;
    id: string;
    bounds: GeoBounds;
    origin: Coordinate;
    worldUnitsPerMetre: number;
    source: {
        name: string;
        url: string;
        attribution: string;
        licence: string;
        licenceUrl: string;
        retrievedAt: string;
        rawFile: string;
    };
    roads: RoadRecord[];
    buildings: BuildingRecord[];
}
