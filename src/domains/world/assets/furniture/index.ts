import { createAsset, type AssetPlacement, type Geometry } from "../core/asset";
import type { AssetContext } from "../core/context";
export function drawBench(g: Geometry,offsetZ=0) {
    for (const dx of [-0.8, 0.8])
        g.box("bench leg", dx, 0, offsetZ, 0.16, 0.55, 0.16, "#496b6d");
    g.box("timber seat", 0, 0.52, offsetZ, 2.4, 0.16, 0.75, "#c4875c");
    g.box("timber back", 0, 0.85, offsetZ+.3, 2.4, 0.48, 0.13, "#c4875c");
}
export function createBench(ctx: AssetContext, p: AssetPlacement) {
    return createAsset(ctx, p, drawBench,{collision:[{min:{x:-1.2,y:0,z:-.4},max:{x:1.2,y:1.33,z:.4}}]});
}
export function createPlanter(ctx: AssetContext, p: AssetPlacement) {
    return createAsset(ctx, p, (g) => {
        g.box("clay planter", 0, 0, 0, 1.2, 0.65, 1.2, "#c47b60");
        g.sphere("planting", 0, 0.95, 0, 1.3, 0.9, 1.3, "#73a883");
    });
}
export function createLegacySeat(ctx: AssetContext, p: AssetPlacement) {
    return createAsset(ctx, p, (g) => g.box("bench", 0, 0.5, 0, 2.6, 0.22, 0.8, "#c98561"));
}
export function createBollard(ctx: AssetContext, p: AssetPlacement) {
    return createAsset(ctx, p, (g) => g.box("bollard", 0, 0, 0, 0.3, 0.8, 0.3, "#fff4d5"));
}
