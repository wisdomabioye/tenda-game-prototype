import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { CreateTorus } from '@babylonjs/core/Meshes/Builders/torusBuilder';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { createAsset, type Geometry, type AssetInstance } from '../../../world/assets/core/asset';
import { drawBench } from '../../../world/assets/furniture';
import type { AssetContext } from '../../../world/assets/core/context';
import { type Point, type Segment } from '../../../world/navigation/routes';
import { ROAD_SURFACE_OFFSET as floor } from '../../../world/assets/streets/palette';
import { type Solid } from '../../../world/navigation/movement';
import { chooseActivityPlacement } from './placement';
import { activityStations, type StationId } from './descriptors';
export type { StationId } from './descriptors';
export interface ActivityStation {
    id: StationId;
    label: string;
    arrival: Point;
    stand: Vector3;
    seat: Vector3;
    facing: number;
    objectRest: Vector3;
    asset: AssetInstance;
    solids: Solid[];
    cue: ReturnType<typeof CreateTorus>;
}
function drawCounter(g: Geometry) { g.box('wooden worktop', 0, 1.0, 1.6, 1.9, .14, .8, '#c4875c'); for (const x of [-.76, .76])
    g.box('counter leg', x, 0, 1.6, .14, 1, .65, '#496b6d'); }
/** All positions, clickable geometry, approach sockets and collisions share one authoring frame. */
export function createActivityStations(ctx: AssetContext, network: Segment[], spawn: Point, occupied: Solid[] = []) {
    const assets: ActivityStation[] = [], material = new StandardMaterial('nearby activity cue', ctx.scene);
    material.diffuseColor = Color3.FromHexString('#ffc447');
    material.emissiveColor = Color3.FromHexString('#84600e');
    material.alpha = .8;
    for (const [index, { id, label }] of activityStations.entries()) {
        const desired = { x: spawn.x + (index === 0 ? 6 : index === 1 ? -6 : 12), y: spawn.y, z: spawn.z + (index === 1 ? -2 : 2) };
        const { arrival, normal, angle } = chooseActivityPlacement(network, desired, occupied, assets.map(a => a.arrival));
        const world = (x: number, y: number, z: number) => new Vector3(arrival.x + Math.cos(angle) * x + normal.x * z, arrival.y + y, arrival.z - Math.sin(angle) * x + normal.z * z);
        const body = { min: { x: id === 'seat' ? -1.2 : -.95, y: 0, z: id === 'seat' ? 1.7 : 1.2 }, max: { x: id === 'seat' ? 1.2 : .95, y: 1.2, z: id === 'seat' ? 2.6 : 2 } };
        const asset = createAsset(ctx, { id: `physical/${id}`, position: { ...arrival, y: arrival.y + floor }, rotationY: angle }, g => {
            if (id === 'seat') { // Reuse the city-kit bench geometry, placed at its seating socket.
                drawBench(g, 2.1);
            }
            else {
                drawCounter(g);
                if (id === 'food') {
                    for (const x of [-1.15, 1.15])
                        g.box('stall post', x, 0, 2.2, .12, 2.75, .12, '#496b6d');
                    g.box('Sunny Kitchen canopy', 0, 2.75, 2.2, 2.7, .18, 2.0, '#ef8566');
                    g.box('food stall back', 0, 0, 2.9, 2.5, 1, .12, '#e9b43b');
                    g.sphere('cooking pot', -.5, 1.35, 2.2, .6, .4, .6, '#496b6d');
                    g.cylinder('serving bowl stack', .6, 1.14, 1.65, .21, .12, '#fff0d1');
                }
            }
        }, { collision: [body] });
        const cue = CreateTorus(`activity cue ${id}`, { diameter: 1.15, thickness: .075, tessellation: 32 }, ctx.scene);
        cue.position.copyFrom(world(0, floor + .035, .35));
        cue.material = material;
        cue.isPickable = true;
        assets.push({ id, label, arrival, stand: world(0, 0, .5), seat: world(0, 0, 2.1), facing: angle, objectRest: world(0, floor + 1.39, 1.42), asset, solids: [{ ...body, frame: { position: { ...arrival, y: arrival.y + floor }, rotation: angle } }], cue });
    }
    return { stations: assets, targets: assets.flatMap(s => [...s.asset.meshes, s.cue].map(m => [m, s.id] as const)), solids: () => assets.flatMap(s => s.solids), highlight(id: StationId | null, reduced: boolean, time: number) { for (const s of assets) {
            const active = s.id === id;
            s.cue.scaling.setAll(active && !reduced ? 1 + Math.sin(time * 3) * .07 : 1);
            s.cue.visibility = active ? 1 : .35;
            for (const m of s.asset.meshes) {
                if (active && !m.edgesRenderer) {
                    m.enableEdgesRendering();
                    m.edgesColor.set(1, .78, .28, .85);
                    m.edgesWidth = 2;
                }
                else if (!active && m.edgesRenderer)
                    m.disableEdgesRendering();
            }
        } }, dispose() { for (const s of assets) {
            s.cue.dispose();
            s.asset.dispose();
        } material.dispose(); } };
}
