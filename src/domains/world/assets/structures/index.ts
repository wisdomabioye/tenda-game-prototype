import { createAsset, type AssetPlacement } from "../core/asset";
import type { AssetContext } from "../core/context";
import { drawBench } from "../furniture";
export function createBoardwalk(ctx: AssetContext, p: AssetPlacement) {
    return createAsset(ctx, p, (g) => {
        g.box("waterfront boardwalk", 0, -0.16, 0, 5, 0.18, 58, "#c39a70");
        for (let z = -27; z < 29; z += 1.1)
            g.box("boardwalk seams", 0, 0.035, z, 5, 0.025, 0.045, "#ac815b");
        for (let z = -27; z <= 29; z += 4) {
            g.box("waterside bollard", -2.4, 0.1, z, 0.23, 1.1, 0.23, "#f5ead3");
            if (z < 29)
                g.box("waterside handrail", -2.4, 0.95, z + 2, 0.12, 0.12, 3.9, "#f5ead3");
        }
    }, {
        pathSockets: [
            { id: "north", position: { x: 1.1, y: 0, z: -25 } },
            { id: "south", position: { x: 1.1, y: 0, z: 25 } },
        ],
    });
}
export function createPier(ctx: AssetContext, p: AssetPlacement) {
    return createAsset(ctx, p, (g) => {
        g.box("landing pier", 0, -0.16, 0, 17, 0.2, 4.3, "#c99e73");
        for (let x = -8; x < 8; x += 1.1)
            g.box("pier seams", x, 0.055, 0, 0.04, 0.025, 4.3, "#a77a55");
        for (let x = -7; x < 5; x += 4) {
            g.cylinder("pier piling", x, -1, -2.1, 0.23, 2.5, "#9a7555");
            g.cylinder("pier piling", x, -1, 2.1, 0.23, 2.5, "#9a7555");
        }
    }, {
        pathSockets: [
            { id: "shore", position: { x: 8, y: 0, z: 0 } },
            { id: "landing", position: { x: -8, y: 0, z: 0 } },
        ],
    });
}
export function createPergola(ctx: AssetContext, p: AssetPlacement) {
    return createAsset(ctx, p, (g) => {
        for (const x of [0, 5])
            for (const z of [0, 4])
                g.box("shade post", x, 0, z, 0.15, 3, 0.15, "#a97b55");
        for (let x = -0.2; x < 5.5; x += 0.65)
            g.box("pergola beam", x, 3, 2, 0.3, 0.15, 4.8, "#b58c61");
        const geometry = {
            ...g,
            box: (name: string, x: number, y: number, z: number, w: number, h: number, d: number, color: string) => g.box(name, x + 2.5, y, z + 2, w, h, d, color),
        };
        drawBench(geometry);
    }, {
        occlusion: [
            { min: { x: -0.3, y: 0, z: -0.2 }, max: { x: 5.6, y: 3.3, z: 4.4 } },
        ],
    });
}
