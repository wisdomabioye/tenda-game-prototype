import { venues } from "./venues";
import type { AssetSpec } from "../../assets/registry";
export function baselineAssets(ground: string, activeVenues: readonly (typeof venues)[number][] = venues): AssetSpec[] {
    const assets: AssetSpec[] = [];
    const slab = (id: string, name: string, x: number, y: number, z: number, width: number, height: number, depth: number, color: string) => assets.push({
        kind: "slab",
        id,
        name,
        position: { x, y, z },
        width,
        height,
        depth,
        color,
    });
    slab("ocean", "ocean", 0, -1.8, 0, 500, 1, 500, "#65c8e2");
    slab("island", "island", 0, -1, 3, 73, 1, 83, ground);
    slab("seafront", "seafront", -33, 0, 3, 2, 0.16, 81, "#fff1cf");
    slab("avenue-main", "main avenue", 0, 0.015, 4, 6, 0.08, 75, "#fff0cf");
    slab("avenue-cross", "cross avenue", 0, 0.015, 0, 62, 0.08, 6, "#fff0cf");
    for (let z = -28; z < 38; z += 5)
        slab(`paving-${z}`, "paving", 0, 0.1, z, 0.35, 0.02, 1.5, "#d6b98e");
    [
        [-30, -25],
        [-30, -18],
        [30, -26],
        [30, 26],
        [-28, 28],
        [10, 35],
        [-11, 35],
        [-30, 10],
        [30, 4],
    ].forEach(([x, z], i) => assets.push({ kind: "tree", id: `tree-${i}`, position: { x, y: 0, z } }));
    for (const v of activeVenues) {
        assets.push({
            kind: "venue",
            id: `venue-${v.category}`,
            position: { x: v.x, y: 0, z: v.z },
            height: v.h,
            color: v.color,
        });
        assets.push({
            kind: "ramp",
            id: `ramp-${v.category}`,
            position: { x: v.x, y: 0, z: 0 },
            rise: v.h,
            run: v.z - 4,
        });
        slab(`lane-${v.category}`, "lane", v.x / 2, 0.02, 0, Math.abs(v.x) || 3, 0.08, 3, "#fff0cf");
    }
    return assets;
}
export function baselineFurniture(): AssetSpec[] {
    const assets: AssetSpec[] = [];
    for (let z = -25; z < 35; z += 10) {
        assets.push({ kind: "bollard", id: `bollard-${z}`, position: { x: -31, y: 0, z } }, { kind: "seat", id: `seat-${z}`, position: { x: -27, y: 0, z } });
    }
    return assets;
}
