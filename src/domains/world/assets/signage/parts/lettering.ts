import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import type { Geometry } from '../../core/asset';
/** Locally generated lettering, with correctly oriented text on both sides when requested. */
export function drawLettering(g: Geometry, p: {
    text: string;
    x: number;
    y: number;
    z: number;
    width: number;
    height: number;
    background: string;
    doubleSided?: boolean;
    resolution?:256|512|1024;
}) {
    const width=p.resolution??1024,height=width/4;
    const texture = g.ownTexture(new DynamicTexture('local sign lettering', { width, height }, g.context.scene, false));
    const ctx = texture.getContext();
    let size = Math.round(height*.344);
    do {
        ctx.font = `bold ${size}px sans-serif`;
        if (ctx.measureText(p.text).width < width*.957)
            break;
        size -= 2;
    } while (size > Math.round(height*.078));
    texture.drawText(p.text, null, Math.round(height*.64), `bold ${size}px sans-serif`, '#fff9ed', p.background, true);
    const material = g.ownMaterial(new StandardMaterial('lettering material', g.context.scene));
    material.diffuseTexture = texture;
    material.emissiveColor = g.context.material('#ffffff').diffuseColor.scale(.35);
    for (const side of p.doubleSided ? [-1, 1] : [-1]) {
        const face = g.adopt(MeshBuilder.CreatePlane('readable sign face', { width: p.width, height: p.height }, g.context.scene));
        face.position.set(p.x, p.y, p.z + side * .07);
        face.rotation.y = side === 1 ? Math.PI : 0;
        face.material = material;
    }
}
