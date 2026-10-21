import type { Geometry } from '../../core/asset';
/** Decorative side flight, local to a building. Not a navigation/collision ramp. */
export function drawStairFlight(g: Geometry, p: {
    x: number;
    z: number;
    base: number;
    rise: number;
    run: number;
    width: number;
}) {
    const steps = 12;
    for (let i = 0; i < steps; i++) {
        const top = p.base + (i + 1) * p.rise / steps;
        g.box('stair tread', p.x, top - .12, p.z + (i + .5) * p.run / steps, p.width, .12, p.run / steps + .02, '#ede3c9');
        for (const side of [-1, 1]) {
            g.box('stair baluster', p.x + side * p.width / 2, top, p.z + (i + .5) * p.run / steps, .055, .8, .055, '#486979');
            const rail = g.box('stair handrail', p.x + side * p.width / 2, top + .8, p.z + (i + .5) * p.run / steps, .07, .07, p.run / steps + .12, '#486979');
            rail.rotation.x = -Math.atan2(p.rise, p.run);
        }
    }
    g.box('stair landing', p.x, p.base + p.rise - .12, p.z + p.run + Math.sign(p.run) * .35, p.width, .12, .7, '#ede3c9');
}
