import type { AssetInstance } from '../assets/core/asset';
import type { Material } from '@babylonjs/core/Materials/material';
import type { Mesh } from '@babylonjs/core/Meshes/mesh';
/** Temporarily highlight source-road meshes without changing geometry or material ownership. */
export function createRoadSelection(assets: AssetInstance[], highlight: Material) {
    let previous: {
        mesh: Mesh;
        material: Material | null;
    }[] = [];
    const clear = () => { for (const item of previous)
        if (!item.mesh.isDisposed())
            item.mesh.material = item.material; previous = []; };
    return {
        select(id: string) {
            clear();
            for (const asset of assets)
                if (asset.id.startsWith(`road-${id}/`))
                    for (const mesh of asset.meshes) {
                        previous.push({ mesh, material: mesh.material });
                        mesh.material = highlight;
                    }
        }, clear, dispose: clear,
    };
}
