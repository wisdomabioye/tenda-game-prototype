import { distance, nearestStreet, snapToStreet, type Point, type Segment } from './routes';
import { canTraverse, type Solid } from './movement';
/** Deterministic sidewalk placement shared by activity stations and resident seating. */
export function chooseRoadsidePlacement(network: Segment[], desired: Point, occupied: Solid[], reserved: Point[] = [], options: {
    range?: number;
    spacing?: number;
    radius?: number;
    start?: number;
    end?: number;
    clearance?: number;
} = {}) {
    const samples = network.flatMap(([a, b]) => { const n = Math.max(1, Math.ceil(distance(a, b) / 4)); return Array.from({ length: n + 1 }, (_, i) => ({ x: a.x + (b.x - a.x) * i / n, y: a.y + (b.y - a.y) * i / n, z: a.z + (b.z - a.z) * i / n })); }).filter(p => distance(p, desired) < (options.range ?? 40)).sort((a, b) => distance(a, desired) - distance(b, desired));
    const frames = [snapToStreet(desired, network), ...samples].flatMap(arrival => {
        const [a, b] = network[nearestStreet(arrival, network).index], length = Math.hypot(b.x - a.x, b.z - a.z) || 1;
        return [1, -1].map(side => { const normal = { x: side * (b.z - a.z) / length, z: -side * (b.x - a.x) / length }; return { arrival, normal, angle: Math.atan2(normal.x, normal.z) }; });
    });
    return frames.find(({ arrival, normal }) => {
        if (reserved.some(p => distance(p, arrival) < (options.spacing ?? 6)))
            return false;
        const point = (n: number) => ({ x: arrival.x + normal.x * n, y: arrival.y, z: arrival.z + normal.z * n });
        if (options.clearance && distance(point(2.4), snapToStreet(point(2.4), network)) < options.clearance)
            return false;
        return canTraverse(arrival, point(.5), occupied, .65) && canTraverse(point(options.start ?? 1.3), point(options.end ?? 3.3), occupied, options.radius ?? 1.4);
    }) ?? frames[0];
}
