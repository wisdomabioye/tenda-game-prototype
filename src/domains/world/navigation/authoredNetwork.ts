import { distance, projectOnSegment, segmentIntersection, type Point, type Segment } from './geometry.ts';
/** Game-authored streets join at every at-grade crossing, including T junctions.
 * Do not apply to imported maps: their explicit source IDs define connectivity. */
export function connectAuthoredStreets(segments: Segment[]): Segment[] {
    const nodes: Point[] = [];
    const add = (p: Point) => { let found = nodes.find(n => distance(n, p) < .00001); if (!found) {
        found = { x: p.x, y: p.y, z: p.z };
        nodes.push(found);
    } return found; };
    segments.forEach(s => s.forEach(add));
    for (let i = 0; i < segments.length; i++)
        for (let j = i + 1; j < segments.length; j++) {
            const crossing = segmentIntersection(segments[i], segments[j]);
            if (crossing)
                add(crossing);
        }
    return segments.flatMap(segment => {
        const cuts = nodes.filter(p => distance(p, projectOnSegment(p, segment)) < .00001).sort((a, b) => distance(segment[0], a) - distance(segment[0], b));
        return cuts.slice(1).flatMap((p, i) => distance(cuts[i], p) > .00001 ? [[cuts[i], p] as Segment] : []);
    });
}
const prepared = new WeakMap<Segment[], Segment[]>();
/** Networks are immutable for their lifetime; new content supplies a new array.
 * Source IDs are authoritative, so imported overpasses are never joined by appearance. */
export function prepareStreetNetwork(network: Segment[]): Segment[] {
    const cached = prepared.get(network);
    if (cached)
        return cached;
    const result = network.every(s => s.every(p => p.nodeId)) ? network : connectAuthoredStreets(network).map(([a, b]): Segment => { const identify = (p: Point) => ({ ...p, nodeId: `authored/${p.x}/${p.y}/${p.z}` }); return [identify(a), identify(b)]; });
    prepared.set(network, result);
    return result;
}
