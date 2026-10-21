import { createAsset, type AssetPlacement } from "../core/asset";
import type { AssetContext } from "../core/context";
export function createTree(ctx: AssetContext, p: AssetPlacement) {
    return createAsset(ctx, p, (g) => {
        g.box("trunk", 0, 0, 0, 0.35, 2, 0.35, "#b08058");
        g.sphere("rounded canopy", 0, 3, 0, 2.8, 2.24, 2.8, "#81b790", 8);
    });
}
export function createPalm(ctx: AssetContext, p: AssetPlacement & {
    height?: number;
}) {
    return createAsset(ctx, p, (g) => {
        const h = p.height ?? 5;
        g.cylinder("palm trunk", 0, 0, 0, 0.15, h, "#b88b60");
        for (let i = 0; i < 7; i++) {
            const angle = (i * Math.PI * 2) / 7, leaf = g.sphere("palm frond", Math.cos(angle) * 0.9, h + Math.sin(i) * 0.12, Math.sin(angle) * 0.9, 3.4, 0.16, 0.62, i % 2 ? "#5b997f" : "#78af87");
            leaf.rotation.y = -angle;
        }
        g.sphere("palm crown", 0, h, 0, 0.7, 0.45, 0.7, "#649f78");
    });
}
export function createPlantingBed(ctx: AssetContext, p: AssetPlacement) {
    return createAsset(ctx, p, (g) => {
        g.box("planting bed", 0, -0.01, 0, 2.4, 0.25, 3.6, "#bc8f68");
        for (let i = 0; i < 3; i++)
            g.sphere("courtyard shrubs", 0, 0.6, -1 + i, 2, 0.9, 1.2, "#79aa89");
    });
}
