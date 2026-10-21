import { createAsset, type AssetPlacement } from '../core/asset';
import type { AssetContext } from '../core/context';
import { drawStairFlight } from './parts/stairs';
export type BuildingStyle = 'terraces' | 'courtyard' | 'office';
export interface StoreyedSpec extends AssetPlacement {
    width: number;
    depth: number;
    floors: number;
    color: string;
    style: BuildingStyle;
}
/** Shared podium, stepped volumes, facade rhythm and stair flights; all geometry is local. */
export function createStoreyedBuilding(ctx: AssetContext, p: StoreyedSpec) {
    const { width: w, depth: d, floors, color, style } = p, floor = 2.6, height = floors * floor;
    if (w < 4 || d < 4 || !Number.isInteger(floors) || floors < 2 || floors > 10)
        throw new Error('Invalid storeyed building dimensions');
    return createAsset(ctx, p, g => {
        g.box('ground podium', 0, 0, 0, w, 2.5, d, color);
        g.box('podium cornice', 0, 2.5, 0, w, .18, d, '#fff1d5');
        g.box('welcoming entrance', 0, 0, -d / 2 - .03, 1.3, 2.1, .08, '#385b70');
        g.box('entry canopy', 0, 2.15, -d / 2 + .7, Math.min(w - 1, 3), .14, 1.4, '#e5ad61');
        for (let level = 1; level < floors; level++) {
            const setback = style === 'office' ? Math.floor(level / 3) * .1 : Math.floor(level / 2) * .07;
            const bw = w * (.7 - setback), bd = d * (.78 - setback), x = -w * .1;
            g.box('stepped occupied floor', x, level * floor, 0, bw, floor - .12, bd, color);
            g.box('horizontal floor band', x, level * floor + floor - .18, 0, bw + .15, .14, bd + .15, '#fff1d5');
            for (let u = -bw / 2 + .55; u < bw / 2 - .3; u += 1.25) {
                g.box('front glazing', x + u, level * floor + .65, -bd / 2 - .035, .65, 1.15, .08, '#acd7dd');
                g.box('solar shading fin', x + u + .38, level * floor + .55, -bd / 2 - .12, .075, 1.55, .32, '#f2d39a');
                g.box('rear glazing', x + u, level * floor + .65, bd / 2 + .035, .65, 1.15, .08, '#acd7dd');
            }
            for (const side of [-1, 1])
                g.box('side glazing', x + side * (bw / 2 + .04), level * floor + .75, 0, .08, 1.2, Math.max(.8, bd * .45), '#acd7dd');
            if (style !== 'office') {
                g.box('terrace deck', x, level * floor - .02, -bd / 2 - .18, bw, .12, .35, '#edc397');
                g.box('balcony balustrade', x, level * floor + .15, -bd / 2 - .33, bw, .65, .08, '#668d96');
                for (const side of [-1, 1])
                    g.box('terrace planter', x + side * bw * .34, level * floor + .2, -bd / 2 - .18, .7, .4, .25, '#78a68c');
            }
            // Side flight remains inside the original footprint width/depth.
            if (style !== 'office')
                drawStairFlight(g, { x: w * .39, z: level % 2 ? -d * .33 : d * .27, base: (level - 1) * floor, rise: floor, run: (level % 2 ? 1 : -1) * d * .6, width: w * .18 });
        }
        const roofWidth = w * (style === 'office' ? .44 : .48), roofDepth = d * .52;
        g.box('roof terrace', -w * .1, height - .08, 0, roofWidth, .18, roofDepth, '#fff0d0');
        for (const side of [-1, 1])
            g.box('roof parapet', -w * .1 + side * roofWidth / 2, height, .0, .1, .65, roofDepth, '#c7d5c8');
        for (let i = 0; i < 3; i++)
            g.box('roof shade slat', -w * .1 + (i - 1) * .6, height + 1, .0, .22, .12, roofDepth * .8, '#bd875f');
        g.batch();
    }, {
        entrances: [{ id: 'front', position: { x: 0, y: 0, z: -d / 2 - .3 } }],
        occlusion: [{ min: { x: -w / 2, y: 0, z: -d / 2 - .2 }, max: { x: w / 2, y: height + 1.2, z: d / 2 } }],
        collision: [{ min: { x: -w / 2, y: 0, z: -d / 2 }, max: { x: w / 2, y: height, z: d / 2 } }],
    });
}
