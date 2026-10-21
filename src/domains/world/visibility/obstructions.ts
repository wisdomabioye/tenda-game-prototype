import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { blocksView } from "./geometry";
export type Occluder = {
    meshes: Mesh[];
    min: Vector3;
    max: Vector3;
};
export function updateObstructions(buildings: Occluder[], camera: Vector3, player: Vector3, dt: number, reduced: boolean) {
    const chest = player.add(new Vector3(0, 1.5, 0)), head = player.add(new Vector3(0, 2.35, 0));
    for (const building of buildings) {
        const obscured = blocksView(camera, chest, building.min, building.max) ||
            blocksView(camera, head, building.min, building.max);
        for (const mesh of building.meshes) {
            const target = obscured ? 0.65 : 1;
            mesh.visibility = reduced
                ? target
                : mesh.visibility + (target - mesh.visibility) * Math.min(1, dt * 14);
        }
    }
}
