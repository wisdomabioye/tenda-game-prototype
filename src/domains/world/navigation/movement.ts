import type { Point } from './routes';
export function approachSpeed(current: number, target: number, dt: number) { const rate = target > current ? 12 : 20; return current + Math.sign(target - current) * Math.min(Math.abs(target - current), rate * Math.max(0, Math.min(dt, .1))); }
export interface Solid {
    min: Point;
    max: Point;
    frame?: {
        position: Point;
        rotation: number;
    };
}
/** Swept circle against expanded solids, including floor separation and escape from overlap. */
export function canTraverse(from: Point, to: Point, solids: readonly Solid[], radius = .4): boolean {
    return !solids.some(({ min, max, frame }) => {
        const worldFrom = from, worldTo = to;
        const local = (p: Point): Point => { if (!frame)
            return p; const dx = p.x - frame.position.x, dz = p.z - frame.position.z, c = Math.cos(frame.rotation), s = Math.sin(frame.rotation); return { x: dx * c - dz * s, y: p.y - frame.position.y, z: dx * s + dz * c }; };
        const start = local(worldFrom), end = local(worldTo);
        return intersects(start, end, min, max, radius);
    });
}
function intersects(from: Point, to: Point, min: Point, max: Point, radius: number) {
    if (Math.max(from.y, to.y) + 1.7 < min.y || Math.min(from.y, to.y) > .15 + max.y)
        return false;
    const inside = (p: Point) => p.x > min.x - radius && p.x < max.x + radius && p.z > min.z - radius && p.z < max.z + radius;
    if (inside(from)) {
        const cx = (min.x + max.x) / 2, cz = (min.z + max.z) / 2;
        return inside(to) && Math.hypot(to.x - cx, to.z - cz) <= Math.hypot(from.x - cx, from.z - cz);
    }
    let low = 0, high = 1;
    for (const axis of ['x', 'z'] as const) {
        const delta = to[axis] - from[axis];
        if (Math.abs(delta) < 1e-9) {
            if (from[axis] <= min[axis] - radius || from[axis] >= max[axis] + radius)
                return false;
            continue;
        }
        const a = (min[axis] - radius - from[axis]) / delta, b = (max[axis] + radius - from[axis]) / delta;
        low = Math.max(low, Math.min(a, b));
        high = Math.min(high, Math.max(a, b));
        if (low >= high)
            return false;
    }
    return low < high && high > 0 && low < 1;
}
