import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { createAsset, type AssetPlacement } from "../core/asset";
import type { AssetContext } from "../core/context";
export function createDirectionSign(ctx: AssetContext, p: AssetPlacement & {
    text: string;
    arrow: string;
}) {
    return createAsset(ctx, p, (g) => {
        g.box("wayfinding post", 0, 0, 0, 0.16, 2.4, 0.16, "#987353");
        g.box("wayfinding board", 0, 1.8, 0, 2.8, 0.72, 0.16, "#1672d4");
        const face = g.adopt(MeshBuilder.CreatePlane("readable direction board", { width: 2.7, height: 0.65, sideOrientation: Mesh.DOUBLESIDE }, ctx.scene));
        face.position.set(0, 2.16, -0.09);
        const texture = g.ownTexture(new DynamicTexture("generated sign lettering", { width: 512, height: 128 }, ctx.scene, false));
        texture.drawText(`${p.text} ${p.arrow}`, null, 80, "bold 34px sans-serif", "#fff9ed", "#1672d4", true);
        const material = g.ownMaterial(new StandardMaterial("sign lettering", ctx.scene));
        material.diffuseTexture = texture;
        material.emissiveColor = ctx.material("#1672d4").diffuseColor.scale(0.2);
        face.material = material;
    });
}
export function createNotice(ctx: AssetContext, p: AssetPlacement) {
    return createAsset(ctx, p, (g) => {
        g.box("notice post", 0, 0, 0, 0.12, 1.5, 0.12, "#ac8255");
        g.box("notice paper", 0, 1.1, 0, 0.8, 0.8, 0.15, "#fff9ed");
    });
}
