import {MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder';
import {PAVING_COLOR,ROAD_SURFACE_OFFSET} from './palette';
import { createAsset, type AssetPlacement } from "../core/asset";
import type { AssetContext } from "../core/context";
import type { Segment } from "../../navigation/routes";
export function createSlab(ctx: AssetContext, p: AssetPlacement & {
    name: string;
    width: number;
    height: number;
    depth: number;
    color: string;
}) {
    return createAsset(ctx, p, (g) => g.box(p.name, 0, 0, 0, p.width, p.height, p.depth, p.color));
}
export function createRoad(ctx: AssetContext, p: AssetPlacement & {
    segment: Segment;
    width?: number;
    color?:string;
}) {
    const [a, b] = p.segment, length = Math.hypot(b.x - a.x, b.z - a.z), rise = b.y - a.y;
    return createAsset(ctx, {
        ...p,
        position: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 + ROAD_SURFACE_OFFSET, z: (a.z + b.z) / 2 },
        rotationY: Math.atan2(b.x - a.x, b.z - a.z),
    }, (g) => {
        // A single paving face has no vertical box sides that can bleed through junctions
        // under polygon offset. All flat junction faces share one colour/normal.
        const road=g.adopt(MeshBuilder.CreateGround('connected neighbourhood lane',{width:p.width??3.4,height:Math.hypot(length,rise)+1},ctx.scene),p.color??PAVING_COLOR);
        road.material!.zOffset=-2;
        road.rotation.x = -Math.atan2(rise, length);
    }, {
        pathSockets: [
            { id: "start", position: { x: 0, y: -rise / 2 - ROAD_SURFACE_OFFSET, z: -length / 2 } },
            { id: "end", position: { x: 0, y: rise / 2 - ROAD_SURFACE_OFFSET, z: length / 2 } },
        ],
    });
}
export function createRamp(ctx: AssetContext, p: AssetPlacement & {
    rise: number;
    run: number;
}) {
    const { rise: h, run } = p;
    return createAsset(ctx, p, (g) => {
        const ramp = g.box("walkable ramp", 0, -0.15, run / 2, 3, 0.2, Math.hypot(run, h), "#f7e7c3");
        ramp.rotation.x = -Math.atan(h / run);
        ramp.position.y = h / 2;
        if (h)
            for (let i = 1; i < 9; i++) {
                const z = (run * i) / 9;
                g.box("ramp rail", -1.7, (h * i) / 9, z, 0.12, 1, 0.12, "#fff4d5");
                g.box("ramp rail", 1.7, (h * i) / 9, z, 0.12, 1, 0.12, "#fff4d5");
            }
    }, {
        pathSockets: [
            { id: "street", position: { x: 0, y: 0, z: 0 } },
            { id: "entrance", position: { x: 0, y: h, z: run } },
        ],
    });
}
export function createCourtyard(ctx: AssetContext, p: AssetPlacement) {
    return createAsset(ctx, p, (g) => {
        g.box("courtyard tiles", 0, -0.01, 0, 6, 0.1, 6, "#dba889");
        for (let i = 0; i < 4; i++)
            g.box("tile seam", -2 + i * 1.2, 0.1, 0, 0.025, 0.01, 6, "#f4d7b4");
    });
}
