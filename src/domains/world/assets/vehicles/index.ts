import { createAsset, type AssetPlacement } from "../core/asset";
import type { AssetContext } from "../core/context";
export function createCanoe(ctx: AssetContext, p: AssetPlacement) {
    return createAsset(ctx, p, (g) => {
        g.sphere("moored canoe", 0, -0.6, 0, 6, 0.65, 1.5, "#247d9b");
        g.box("canoe seat", 0, 0.07, 0, 0.4, 0.2, 1.2, "#d4ad70");
    });
}
export function createShuttle(ctx: AssetContext, p: AssetPlacement) {
    return createAsset(ctx, p, (g) => {
        g.box("yellow shuttle", 0, 0, 0, 6.4, 2.6, 2.6, "#f5c94e");
        g.box("shuttle roof", 0, 2.6, 0, 6.5, 0.15, 2.7, "#fff0ca");
        g.box("black stripe", 0, 1, -1.32, 6.4, 0.18, 0.08, "#394a53");
        for (let i = 0; i < 4; i++)
            g.box("shuttle window", -2.3 + i * 1.45, 1.65, -1.34, 1.1, 0.72, 0.08, "#73aab7");
        for (const x of [-2.1, 2.1])
            for (const z of [-1.3, 1.3]) {
                const wheel = g.cylinder("shuttle wheel", x, 0.325, z, 0.47, 0.25, "#394a53");
                wheel.rotation.x = Math.PI / 2;
            }
    }, {
        occlusion: [
            { min: { x: -3.5, y: 0, z: -1.5 }, max: { x: 3.5, y: 2.9, z: 1.5 } },
        ],
    });
}
