import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { AssetContext } from '../assets/core/context';
import type { Point } from '../navigation/routes';
/** One replaceable preview per walking command; no React state or per-frame mesh rebuilding. */
export function createRouteOverlay(context: AssetContext) {
    let meshes: Mesh[] = [];
    const clear = () => { meshes.forEach(mesh => mesh.dispose(false, false)); meshes = []; };
    return {
        show(points: Point[]) {
            clear();
            if (points.length < 2)
                return;
            const path = points.filter((p, i) => i === 0 || Vector3.Distance(new Vector3(p.x, p.y, p.z), new Vector3(points[i - 1].x, points[i - 1].y, points[i - 1].z)) > .01)
                .map(p => new Vector3(p.x, p.y + .26, p.z));
            if (path.length < 2)
                return;
            const line = MeshBuilder.CreateTube('planned walking route', { path, radius: .1, tessellation: 6 }, context.scene);
            const target = MeshBuilder.CreateTorus('arrival marker', { diameter: 2, thickness: .16, tessellation: 24 }, context.scene);
            target.position.copyFrom(path.at(-1)!);
            meshes = [line, target];
            for (const mesh of meshes) {
                mesh.material = context.material('#1672d4');
                mesh.isPickable = false;
            }
        },
        dispose: clear,
    };
}
