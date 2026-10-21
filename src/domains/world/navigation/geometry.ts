export type Point = {
    x: number;
    y: number;
    z: number;
    nodeId?: string;
};
export type Segment = readonly [
    Point,
    Point
];
const p = (x: number, y: number, z: number): Point => ({ x, y, z });
export const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
export function projectOnSegment(a: Point, [s, e]: Segment) {
    const dx = e.x - s.x, dy = e.y - s.y, dz = e.z - s.z;
    if (dx * dx + dy * dy + dz * dz < 1e-16)
        return { ...s };
    const t = Math.max(0, Math.min(1, ((a.x - s.x) * dx + (a.y - s.y) * dy + (a.z - s.z) * dz) /
        (dx * dx + dy * dy + dz * dz)));
    return p(s.x + t * dx, s.y + t * dy, s.z + t * dz);
}
export function nearestStreet(point: Point, segments: Segment[]) {
    if (!segments.length)
        throw new Error("Empty street network");
    return segments.map((segment, index) => ({ index, point: projectOnSegment(point, segment) }))
        .reduce((best, candidate) => distance(point, candidate.point) < distance(point, best.point) ? candidate : best);
}
export function snapToStreet(point: Point, segments: Segment[]) {
    return nearestStreet(point, segments).point;
}
/** An actual at-grade crossing; parallel lines and overpasses remain separate. */
export function segmentIntersection([a, b]: Segment, [c, d]: Segment): Point | null {
    const rx = b.x - a.x, rz = b.z - a.z, sx = d.x - c.x, sz = d.z - c.z, det = rx * sz - rz * sx;
    if (Math.abs(det) < 1e-8)
        return null;
    const t = ((c.x - a.x) * sz - (c.z - a.z) * sx) / det, u = ((c.x - a.x) * rz - (c.z - a.z) * rx) / det;
    if (t < 0 || t > 1 || u < 0 || u > 1)
        return null;
    const y = a.y + (b.y - a.y) * t, otherY = c.y + (d.y - c.y) * u;
    return Math.abs(y - otherY) < .001 ? p(a.x + rx * t, y, a.z + rz * t) : null;
}
