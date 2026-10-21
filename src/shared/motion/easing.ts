export function easeInOut(t: number) {
    const p = Math.max(0, Math.min(1, t));
    return p * p * (3 - 2 * p);
}
export function interpolate(a: number, b: number, t: number) {
    return a + (b - a) * easeInOut(t);
}
export function advanceExpansion(value: number, expanded: boolean, dt: number, reduced: boolean) {
    return reduced
        ? Number(expanded)
        : Math.max(0, Math.min(1, value + ((expanded ? 1 : -1) * Math.max(0, dt)) / 0.24));
}
