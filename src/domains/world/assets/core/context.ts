import { Scene } from "@babylonjs/core/scene";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
/** One registry per mounted world. Assets borrow shared colours; only the registry disposes them. */
export function createAssetContext(scene: Scene) {
    const materials = new Map<string, StandardMaterial>();
    return {
        scene,
        batchStatic:false,
        material: (hex: string) => {
            let material = materials.get(hex);
            if (!material) {
                material = new StandardMaterial(hex, scene);
                material.diffuseColor = Color3.FromHexString(hex);
                material.specularColor = Color3.Black();
                materials.set(hex, material);
            }
            return material;
        },
        dispose: () => {
            for (const material of materials.values())
                material.dispose();
            materials.clear();
        },
    };
}
export type AssetContext = ReturnType<typeof createAssetContext>;
