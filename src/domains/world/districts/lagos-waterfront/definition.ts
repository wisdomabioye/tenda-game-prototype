import type { AssetSpec } from "../../assets/registry";
import { lagosStreets } from "./network";
import { streets } from "../baseline/network";
/** Existing r10 placements, in illustrative local metres. No Babylon mesh construction here. */
export function lagosAssets(): AssetSpec[] {
    const assets: AssetSpec[] = lagosStreets
        .slice(streets.length)
        .map((segment, i) => ({ kind: "road", id: `lagos-lane-${i}`, segment }));
    assets.push({
        kind: "boardwalk",
        id: "waterfront",
        position: { x: -32.1, y: 0, z: -1 },
    }, { kind: "pier", id: "pier", position: { x: -40, y: 0, z: -20 } }, { kind: "canoe", id: "canoe", position: { x: -44, y: 0, z: -24.6 } });
    for (const [x, z] of [
        [-32, -9],
        [-32, 9],
        [-32, 20],
    ]) {
        assets.push({ kind: "palm", id: `palm-waterfront-${z}`, position: { x, y: 0, z } }, {
            kind: "bench",
            id: `bench-waterfront-${z}`,
            position: { x: x + 1.8, y: 0, z: z + 2 },
            rotationY: Math.PI / 2,
        });
    }
    for (const [i, [x, z, width, depth, height, color]] of ([
        [-9, -19, 6, 6, 4.6, "#e3b292"],
        [-9, -10, 5.5, 5, 3.4, "#e8cb8c"],
        [9, 8, 6, 6, 3.8, "#d3b2a7"],
        [10, -11, 5, 6, 3.6, "#a8c1b1"],
    ] as const).entries())
        assets.push({
            kind: "house",
            id: `house-${i}`,
            position: { x, y: 0, z },
            width,
            depth,
            height,
            color,
        });
    assets.push({ kind: "tank", id: "roof-tank", position: { x: -9, y: 4.9, z: -19 } }, {
        kind: "solar",
        id: "creative-solar",
        position: { x: 16.5, y: 9.4, z: -17 },
    }, {
        kind: "courtyard",
        id: "community-court",
        position: { x: 8, y: 0, z: 19 },
    });
    for (const [x, z] of [
        [-9, -5],
        [6, -19],
        [25, 6],
    ])
        assets.push({ kind: "bed", id: `bed-${x}-${z}`, position: { x, y: 0, z } });
    assets.push({
        kind: "stall",
        id: "stall-coral",
        position: { x: -10, y: 0, z: 16 },
        color: "#df8973",
    }, {
        kind: "stall",
        id: "stall-blue",
        position: { x: -9, y: 0, z: 21 },
        color: "#6b9fac",
    }, {
        kind: "slab",
        id: "market-paving",
        name: "courtyard paving",
        position: { x: -10, y: -0.01, z: 17 },
        width: 8,
        height: 0.09,
        depth: 13,
        color: "#deb995",
    });
    for (const [x, z] of [
        [-14, 9],
        [-5, 17],
        [-14, 22],
        [8, 19],
        [25, 22],
    ])
        assets.push({
            kind: "planter",
            id: `planter-${x}-${z}`,
            position: { x, y: 0, z },
        });
    assets.push({ kind: "bench", id: "market-bench", position: { x: -10, y: 0, z: 10 } }, { kind: "bench", id: "community-bench", position: { x: 7, y: 0, z: 19 } }, {
        kind: "palm",
        id: "market-palm",
        position: { x: -5, y: 0, z: 22 },
        height: 4.5,
    }, {
        kind: "palm",
        id: "north-palm",
        position: { x: 26, y: 0, z: -25 },
        height: 5.2,
    }, { kind: "pergola", id: "pergola", position: { x: 9, y: 0, z: 15 } }, { kind: "shuttle", id: "shuttle", position: { x: 8, y: 0, z: -30 } });
    for (const sign of [
        {
            id: "waterfront-sign",
            text: "Waterfront walk",
            x: -28,
            z: 2,
            arrow: "←",
        },
        { id: "market-sign", text: "Market courtyard", x: -14, z: 6, arrow: "←" },
        {
            id: "creative-sign",
            text: "Creative rooftop",
            x: 13,
            z: -25,
            arrow: "→",
        },
    ])
        assets.push({
            kind: "sign",
            id: sign.id,
            position: { x: sign.x, y: 0, z: sign.z },
            text: sign.text,
            arrow: sign.arrow,
        });
    return assets;
}
