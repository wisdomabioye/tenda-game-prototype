import { distance, nearestStreet, type Point, type Segment } from './geometry';
import { prepareStreetNetwork } from './authoredNetwork';
const sameNode = (a: Point, b: Point) => distance(a, b) < .001 && a.nodeId === b.nodeId;
/** A nearby turn request first reaches the junction socket, then follows the chosen branch. */
export function steerOnStreet(current: Point, input: {
    x: number;
    z: number;
}, step: number, source: Segment[]): Point {
    const network = prepareStreetNetwork(source);
    let { point, index } = nearestStreet(current, network), remaining = step;
    const score = (from: Point, to: Point) => { const length = distance(from, to); return length ? ((to.x - from.x) * input.x + (to.z - from.z) * input.z) / length : -1; };
    for (let guard = 0; guard < 32 && remaining > 1e-6; guard++) {
        const endpoint = network[index].find(end => distance(end, point) < .001);
        if (endpoint)
            point = { ...endpoint };
        const choices = network.flatMap((segment, i) => {
            if (i !== index && !segment.some(end => sameNode(end, point)))
                return [];
            return segment.map(end => ({ end, i, length: distance(point, end), score: score(point, end) }));
        }).filter(c => c.length > 1e-6 && c.score > .15).sort((a, b) => b.score - a.score);
        const direct = choices[0];
        const turns = network[index].flatMap(junction => {
            const length = distance(point, junction);
            if (length < .001 || length > 1.15)
                return [];
            return network.flatMap((segment, i) => i === index || !segment.some(end => sameNode(end, junction)) ? [] : segment.filter(end => !sameNode(end, junction)).map(end => ({ end: junction, i: index, length, score: score(junction, end) })));
        }).filter(c => c.score > .35 && c.score > (direct?.score ?? 0) + .12).sort((a, b) => b.score - a.score || a.length - b.length);
        const next = turns[0] ?? direct;
        if (!next)
            break;
        const travel = Math.min(remaining, next.length), t = travel / next.length;
        point = { ...next.end, x: point.x + (next.end.x - point.x) * t, y: point.y + (next.end.y - point.y) * t, z: point.z + (next.end.z - point.z) * t };
        if (t < 1)
            delete point.nodeId;
        remaining -= travel;
        index = next.i;
    }
    return point;
}
