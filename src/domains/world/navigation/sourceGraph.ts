import { distance, nearestStreet, type Point, type Segment } from './geometry.ts';
import { shortestPath } from './shortestPath.ts';
/** Source node IDs, rather than visual crossings, define geographic junctions. */
export function sourceRoute(current: Point, destination: Point, segments: Segment[]): Point[] {
    const start = nearestStreet(current, segments), end = nearestStreet(destination, segments);
    if (distance(start.point, end.point) < .12)
        return [];
    const nodes: Point[] = [], index = new Map<string, number>();
    const add = (point: Point, key: string) => { const known = index.get(key); if (known !== undefined)
        return known; nodes.push(point); index.set(key, nodes.length - 1); return nodes.length - 1; };
    const endpoints = segments.map((s, i) => s.map((p, j) => add(p, p.nodeId ?? `edge-${i}-${j}`)));
    const insert = (item: typeof start, key: string) => { const s = segments[item.index], ends = endpoints[item.index]; if (distance(item.point, s[0]) < 1e-6)
        return ends[0]; if (distance(item.point, s[1]) < 1e-6)
        return ends[1]; return add(item.point, key); };
    const source = insert(start, 'route-start'), target = insert(end, 'route-end'), edges = nodes.map(() => [] as {
        to: number;
        cost: number;
    }[]);
    segments.forEach((s, i) => { const at = [...endpoints[i]]; if (start.index === i)
        at.push(source); if (end.index === i)
        at.push(target); const sorted = [...new Set(at)].sort((a, b) => distance(s[0], nodes[a]) - distance(s[0], nodes[b])); for (let n = 1; n < sorted.length; n++) {
        const a = sorted[n - 1], b = sorted[n], cost = distance(nodes[a], nodes[b]);
        edges[a].push({ to: b, cost });
        edges[b].push({ to: a, cost });
    } });
    return shortestPath(nodes, edges, source, target);
}
export function largestConnectedNetwork(segments: Segment[]): Segment[] {
    const byNode = new Map<string, number[]>();
    segments.forEach((s, i) => s.forEach(p => { const id = p.nodeId ?? `${p.x},${p.y},${p.z}`; byNode.set(id, [...(byNode.get(id) ?? []), i]); }));
    const seen = new Set<number>();
    let largest: number[] = [];
    for (let i = 0; i < segments.length; i++) {
        if (seen.has(i))
            continue;
        const found: number[] = [], pending = [i];
        seen.add(i);
        while (pending.length) {
            const current = pending.pop()!;
            found.push(current);
            for (const p of segments[current])
                for (const next of byNode.get(p.nodeId ?? `${p.x},${p.y},${p.z}`) ?? [])
                    if (!seen.has(next)) {
                        seen.add(next);
                        pending.push(next);
                    }
        }
        if (found.length > largest.length)
            largest = found;
    }
    return largest.map(i => segments[i]);
}
