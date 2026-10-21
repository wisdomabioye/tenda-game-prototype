import type { Point } from "../navigation/routes";
/** Segment-box intersection excludes blockers behind the camera or character. */
export function blocksView(from: Point, to: Point, min: Point, max: Point) {
    let near = 0, far = 1;
    for (const axis of ["x", "y", "z"] as const) {
        const d = to[axis] - from[axis];
        if (Math.abs(d) < 1e-8) {
            if (from[axis] < min[axis] || from[axis] > max[axis])
                return false;
        }
        else {
            const a = (min[axis] - from[axis]) / d, b = (max[axis] - from[axis]) / d;
            near = Math.max(near, Math.min(a, b));
            far = Math.min(far, Math.max(a, b));
            if (near > far)
                return false;
        }
    }
    return far > 0.005 && near < 0.995;
}
export function markerFan(center: number, count: number, width: number) {
    const spacing = 48, half = ((count - 1) * spacing) / 2;
    const anchor = Math.max(half + 26, Math.min(width - half - 26, center));
    return Array.from({ length: count }, (_, i) => anchor + (i - (count - 1) / 2) * spacing);
}
export function shouldGroup(points: {
    x: number;
    y: number;
}[], overview: boolean) {
    return (points.length > 1 &&
        (overview ||
            points.some((p, i) => points.some((q, j) => i !== j && Math.hypot(p.x - q.x, p.y - q.y) < 48))));
}
