import type { Point } from './geometry';
export type Edge = {
    to: number;
    cost: number;
};
export function shortestPath(nodes: Point[], edges: Edge[][], source: number, target: number): Point[] {
    const costs = nodes.map(() => Infinity), previous = nodes.map(() => -1), pending = new Set(nodes.map((_, i) => i));
    costs[source] = 0;
    while (pending.size) {
        const at = [...pending].reduce((a, b) => costs[a] < costs[b] ? a : b);
        if (!Number.isFinite(costs[at]))
            break;
        pending.delete(at);
        if (at === target)
            break;
        for (const e of edges[at])
            if (costs[at] + e.cost < costs[e.to]) {
                costs[e.to] = costs[at] + e.cost;
                previous[e.to] = at;
            }
    }
    if (!Number.isFinite(costs[target]))
        return [];
    const result: Point[] = [];
    for (let at = target; at !== source; at = previous[at])
        result.unshift(nodes[at]);
    return result;
}
