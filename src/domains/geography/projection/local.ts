import type { Coordinate, GeoBounds } from '../model/types';
const R = 6378137, rad = Math.PI / 180;
/** Local tangent approximation for a small city patch. X east, -Z north; Y is presentation height. */
export function createLocalProjection(origin: Coordinate, worldUnitsPerMetre = 1) {
    validateCoordinate(origin);
    if (!Number.isFinite(worldUnitsPerMetre) || worldUnitsPerMetre <= 0)
        throw new Error('Invalid world scale');
    const east = R * rad * Math.cos(origin.latitude * rad), north = R * rad;
    return { origin, worldUnitsPerMetre, forward: (coordinate: Coordinate) => { validateCoordinate(coordinate); return { x: (coordinate.longitude - origin.longitude) * east * worldUnitsPerMetre, y: 0, z: -(coordinate.latitude - origin.latitude) * north * worldUnitsPerMetre }; }, inverse: (point: {
            x: number;
            z: number;
        }): Coordinate => { if (!Number.isFinite(point.x) || !Number.isFinite(point.z))
            throw new Error('Invalid world point'); return { longitude: origin.longitude + point.x / east / worldUnitsPerMetre, latitude: origin.latitude - point.z / north / worldUnitsPerMetre }; } };
}
export function validateCoordinate(c: Coordinate) { if (!Number.isFinite(c.latitude) || !Number.isFinite(c.longitude) || Math.abs(c.latitude) > 85 || Math.abs(c.longitude) > 180)
    throw new Error('Invalid geographic coordinate'); }
export function insideBounds(c: Coordinate, b: GeoBounds) { return c.longitude >= b.west && c.longitude <= b.east && c.latitude >= b.south && c.latitude <= b.north; }
