/** Babylon scaling is inverse resolution: 0.5 renders two pixels per CSS pixel. */
export function hardwareScale(devicePixelRatio: number) {
    const ratio = Number.isFinite(devicePixelRatio) && devicePixelRatio > 0
        ? devicePixelRatio
        : 1;
    return 1 / Math.min(2, Math.max(1, ratio));
}
