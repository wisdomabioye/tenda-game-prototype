import { distance, nearestStreet, projectOnSegment, walkingRoute, type Point, type Segment } from './routes';
/** Keep the authored topology; remove blocked links only when the normal route needs repair. */
export function traversableRoute(start: Point, target: Point, network: Segment[], allowed: (a: Point, b: Point) => boolean): Point[] {
    if (!allowed(target, target)) {
        const segment = network[nearestStreet(target, network).index], [a, b] = segment, length = distance(a, b) || 1;
        const candidates = [.25, -.25, .5, -.5, .75, -.75].map(offset => projectOnSegment({ x: target.x + (b.x - a.x) * offset / length, y: target.y + (b.y - a.y) * offset / length, z: target.z + (b.z - a.z) * offset / length }, segment)).filter(p => allowed(p, p));
        for (const candidate of candidates) {
            const route = traversableRoute(start, candidate, network, allowed);
            if (route.length || distance(start, candidate) < .12)
                return route.length ? route : [candidate];
        }
        return [];
    }
    const direct = walkingRoute(start, target, network);
    if (direct.every((p, i) => allowed(i ? direct[i - 1] : start, p)))
        return direct;
    const origin = nearestStreet(start, network), goal = nearestStreet(target, network);
    const sourceTopology = network.every(s => s.every(p => p.nodeId));
    const node = (p: Point, key: string): Point => sourceTopology ? ({ ...p, nodeId: p.nodeId ?? key }) : ({ ...p, nodeId: undefined });
    const segments = network.flatMap((segment, index) => {
        const cuts = [node(segment[0], `node/${segment[0].x}/${segment[0].y}/${segment[0].z}`), node(segment[1], `node/${segment[1].x}/${segment[1].y}/${segment[1].z}`)];
        for (const [item, key] of [[origin, 'start'], [goal, 'goal']] as const)
            if (item.index === index && !cuts.some(p => distance(p, item.point) < .001))
                cuts.push(node(item.point, `route/${key}`));
        cuts.sort((a, b) => distance(a, segment[0]) - distance(b, segment[0]));
        return cuts.slice(1).flatMap((p, i) => distance(cuts[i], p) > .001 && allowed(cuts[i], p) && allowed(p, cuts[i]) ? [[cuts[i], p] as Segment] : []);
    });
    if (!segments.length || distance(nearestStreet(start, segments).point, start) > .12 || distance(nearestStreet(target, segments).point, target) > .12)
        return [];
    const route = walkingRoute(start, target, segments);
    return route.every((p, i) => allowed(i ? route[i - 1] : start, p)) ? route : [];
}
