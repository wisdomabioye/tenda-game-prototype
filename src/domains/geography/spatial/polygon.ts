/** Point-in-ring in local X/Z coordinates; imported geometry stays unchanged. */
export function insideRing(point: {
    x: number;
    z: number;
}, ring: readonly {
    x: number;
    z: number;
}[]) { let inside = false; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i], b = ring[j];
    if ((a.z > point.z) !== (b.z > point.z) && point.x < (b.x - a.x) * (point.z - a.z) / (b.z - a.z) + a.x)
        inside = !inside;
} return inside; }
