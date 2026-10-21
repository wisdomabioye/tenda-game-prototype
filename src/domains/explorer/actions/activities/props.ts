import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder';
import { CreateSphere } from '@babylonjs/core/Meshes/Builders/sphereBuilder';
import type { AssetContext } from '../../../world/assets/core/context';
export function createActivityItem(ctx: AssetContext, kind: 'parcel' | 'food', name: string = kind) {
    const mesh = kind === 'parcel' ? CreateBox(name, { width: .64, height: .5, depth: .55 }, ctx.scene) : CreateSphere(name, { diameter: 1, segments: 12 }, ctx.scene);
    if (kind === 'food')
        mesh.scaling.set(.43, .22, .43);
    mesh.material = ctx.material(kind === 'food' ? '#f5c25b' : '#e2b46c');
    mesh.isPickable = false;
    return mesh;
}
