import earcut from 'earcut';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { createAsset, type AssetPlacement, type XYZ } from '../core/asset';
import type { AssetContext } from '../core/context';
/** Preserves an imported simple footprint; roof height/colour are presentation choices. */
export function createFootprintBuilding(ctx: AssetContext, p: AssetPlacement & {
    outline: XYZ[];
    height: number;
    color: string;
}) {
    return createAsset(ctx, p, g => {
        const points = p.outline, flat = points.flatMap(q => [q.x, q.z]);
        if (points.length < 3 || p.height <= 0)
            throw new Error('Invalid footprint building');
        const roof = earcut(flat);
        if (!roof.length)
            throw new Error('Building outline cannot be triangulated');
        const positions: number[] = [], indices: number[] = [], colors: number[] = [], normal: number[] = [];
        const wall = Color3.FromHexString(p.color), top = Color3.FromHexString('#fff1d5');
        const vertex = (q: XYZ, y: number, c: Color3) => { const index = positions.length / 3; positions.push(q.x, y, q.z); colors.push(c.r, c.g, c.b, 1); return index; };
        points.forEach(q => vertex(q, p.height, top));
        for (let i = 0; i < roof.length; i += 3) {
            const [a, b, c] = roof.slice(i, i + 3), qa = points[a], qb = points[b], qc = points[c], up = (qb.z - qa.z) * (qc.x - qa.x) - (qb.x - qa.x) * (qc.z - qa.z);
            indices.push(a, up >= 0 ? b : c, up >= 0 ? c : b);
        }
        const area = points.reduce((sum, a, i) => { const b = points[(i + 1) % points.length]; return sum + a.x * b.z - b.x * a.z; }, 0);
        points.forEach((a, i) => { const b = points[(i + 1) % points.length], n = positions.length / 3; vertex(a, 0, wall); vertex(b, 0, wall); vertex(b, p.height, wall); vertex(a, p.height, wall); if (area > 0)
            indices.push(n, n + 2, n + 1, n, n + 3, n + 2);
        else
            indices.push(n, n + 1, n + 2, n, n + 2, n + 3); });
        for (let i = 0; i < indices.length; i += 3) {
            const b = indices[i + 1];
            indices[i + 1] = indices[i + 2];
            indices[i + 2] = b;
        }
        const mesh = g.adopt(new Mesh('footprint building', ctx.scene), '#ffffff'), data = new VertexData();
        data.positions = positions;
        data.indices = indices;
        VertexData.ComputeNormals(positions, indices, normal);
        data.normals = normal;
        data.colors = colors;
        data.applyToMesh(mesh);
        mesh.useVertexColors = true;
    }, { occlusion: [{ min: { x: Math.min(...p.outline.map(q => q.x)), y: 0, z: Math.min(...p.outline.map(q => q.z)) }, max: { x: Math.max(...p.outline.map(q => q.x)), y: p.height, z: Math.max(...p.outline.map(q => q.z)) } }] });
}
export function createMissionHub(ctx: AssetContext, p: AssetPlacement & {
    color: string;
}) { return createAsset(ctx, p, g => { g.box('arrival threshold',0,.06,-4,1.2,.06,1.2,'#f5c14a'); g.box('sample hub plinth', 1.5, 0, -4, 1.6, .2, 1.6, '#e2c89f'); g.box('sample hub post', 1.5, .2, -4, .15, 2.2, .15, '#8a7058'); g.box('sample hub sign', 1.5, 1.65, -4, 1.5, 1, .15, p.color); }, { entrances: [{ id: 'mission-stop', position: { x: 0, y: 0, z: -4 } }] }); }
