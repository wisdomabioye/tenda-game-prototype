import { createAsset, type AssetPlacement } from "../core/asset";
import type { AssetContext } from "../core/context";
export function createHouse(ctx: AssetContext, p: AssetPlacement & {
    width: number;
    depth: number;
    height: number;
    color: string;
}) {
    const { width: w, depth: d, height: h, color } = p;
    const bounds = {
        min: { x: -w / 2 - 0.4, y: 0, z: -d / 2 - 0.4 },
        max: { x: w / 2 + 0.4, y: h + 0.4, z: d / 2 + 0.4 },
    };
    return createAsset(ctx, p, (g) => {
        g.box("neighbourhood house", 0, 0, 0, w, h, d, color);
        g.box("overhanging roof", 0, h, 0, w + 0.6, 0.24, d + 0.6, "#f5e7c8");
        for (let dx = -w / 2 + 1; dx < w / 2; dx += 1.9) {
            g.box("shutter", dx, 1.7, -d / 2 - 0.07, 1.05, 1.5, 0.16, "#5a8f91");
            g.box("window inset", dx, 1.85, -d / 2 - 0.17, 0.65, 0.8, 0.05, "#c6e7dd");
        }
        g.box("front door", 0, 0, -d / 2 - 0.12, 0.95, 2, 0.16, "#93644c");
        g.box("door shade", 0, 2.25, -d / 2 - .4, Math.min(2.1,w-.2), .12, .9, "#ecaa63");
        for(const side of [-1,1])g.box("side window",side*(w/2+.05),1.6,0,.1,1.2,1.05,"#c6e7dd");
    }, {
        entrances: [{ id: "front", position: { x: 0, y: 0, z: -d / 2 - 0.4 } }],
        occlusion: [bounds],
        collision: [{min:{x:-w/2,y:0,z:-d/2},max:{x:w/2,y:h,z:d/2}}],
    });
}
export function createVenue(ctx: AssetContext, p: AssetPlacement & {
    height: number;
    color: string;
}) {
    const h = p.height, bounds = {
        min: { x: -5.5, y: -0.02, z: -4 },
        max: { x: 5.5, y: h + 5.5, z: 5 },
    };
    return createAsset(ctx, p, (g) => {
        g.box("venue platform", 0, -0.02, 0, 13, h + 0.15, 11, "#e6bb88");
        g.box("building", 0, h, 1, 10, 5, 7, p.color);
        g.box("roof", 0, h + 5, 1, 10.8, 0.35, 7.8, "#fff4d5");
        for (const dx of [-3, 0, 3])
            g.box("window", dx, h + 2.1, -2.56, 1.5, 1.7, 0.12, "#d6f2f5");
        g.box("door", 0, h, -2.65, 1.3, 2.5, 0.2, "#435979");
    }, {
        entrances: [{ id: "mission-stop", position: { x: 0, y: h, z: -4 } }],
        occlusion: [bounds],
        collision: [{min:{x:-5,y:h,z:-2.5},max:{x:5,y:h+5,z:4.5}}],
    });
}
export function createStall(ctx: AssetContext, p: AssetPlacement & {
    color: string;
}) {
    return createAsset(ctx, p, (g) => {
        for (const dx of [-1.5, 1.5])
            for (const dz of [-1, 1])
                g.box("stall post", dx, 0, dz, 0.12, 2.7, 0.12, "#a07854");
        g.box("stall canopy", 0, 2.7, 0, 3.6, 0.15, 2.8, p.color);
        for (let i = 0; i < 6; i++)
            g.box("awning stripe", -1.5 + i * 0.6, 2.79, 0, 0.3, 0.04, 2.8, "#fff1cf");
        g.box("market counter", 0, 0, 0, 2.9, 1.05, 1.7, "#b8885f");
        for (let i = 0; i < 5; i++)
            g.sphere("produce", -1 + i * 0.5, 1.2, 0, 0.4, 0.35, 0.4, i % 2 ? "#e6ac43" : "#a8bb6a");
    }, { entrances: [{ id: "counter", position: { x: 0, y: 0, z: -1.8 } }] });
}
export function createWaterTank(ctx: AssetContext, p: AssetPlacement) {
    return createAsset(ctx, p, (g) => {
        g.cylinder("roof water tank", 0, 0, 0, 1.05, 1.8, "#536b6d");
        g.cylinder("tank cap", 0, 1.8, 0, 1.12, 0.15, "#40565c");
    }, {
        occlusion: [
            { min: { x: -1.2, y: -0.1, z: -1.2 }, max: { x: 1.2, y: 2.1, z: 1.2 } },
        ],
    });
}
export function createSolarPanels(ctx: AssetContext, p: AssetPlacement) {
    return createAsset(ctx, p, (g) => {
        for (let i = 0; i < 3; i++) {
            const panel = g.box("solar canopy", i * 0.75, 0, 0, 0.65, 0.1, 2, "#376c84");
            panel.rotation.z = 0.18;
        }
    }, {
        occlusion: [
            { min: { x: -0.5, y: -0.1, z: -1.2 }, max: { x: 2.5, y: 0.4, z: 1.2 } },
        ],
    });
}
