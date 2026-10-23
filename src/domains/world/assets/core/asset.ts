import {batchStaticMeshes} from './staticBatch';
import type { BaseTexture } from "@babylonjs/core/Materials/Textures/baseTexture";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import type { AssetContext } from "./context";
export type XYZ = {
    x: number;
    y: number;
    z: number;
};
export type Bounds = {
    min: XYZ;
    max: XYZ;
};
export type Socket = {
    id: string;
    position: XYZ;
};
export interface AssetPlacement {
    id: string;
    position?: XYZ;
    rotationY?: number;
    scale?: XYZ;
}
export interface AssetMetadata {
    entrances?: Socket[];
    pathSockets?: Socket[];
    occlusion?: Bounds[];
    collision?: Bounds[];
}
export interface Geometry {
    batch: () => void;
    ownTexture: <T extends BaseTexture>(texture: T) => T;
    context: AssetContext;
    adopt: (mesh: Mesh, color?: string) => Mesh;
    ownMaterial: (material: StandardMaterial) => StandardMaterial;
    box: (name: string, x: number, y: number, z: number, w: number, h: number, d: number, color: string) => Mesh;
    sphere: (name: string, x: number, y: number, z: number, w: number, h: number, d: number, color: string, segments?: number) => Mesh;
    cylinder: (name: string, x: number, y: number, z: number, r: number, h: number, color: string) => Mesh;
}
export function createAsset(ctx: AssetContext, placement: AssetPlacement, draw: (g: Geometry) => void, metadata: AssetMetadata = {}) {
    const root = new TransformNode(placement.id, ctx.scene), meshes: Mesh[] = [], ownedMaterials: StandardMaterial[] = [], ownedTextures: BaseTexture[] = [];
    const adopt = (mesh: Mesh, color?: string) => {
        mesh.parent = root;
        mesh.isPickable = false;
        if (color)
            mesh.material = ctx.material(color);
        meshes.push(mesh);
        return mesh;
    };
    const g = {
        batch: () => {
            const groups=new Map<StandardMaterial|null,Mesh[]>();
            for(const mesh of meshes){const material=mesh.material as StandardMaterial|null;const group=groups.get(material)??[];group.push(mesh);groups.set(material,group);}
            for(const group of groups.values())if(group.length>1){
                const merged=Mesh.MergeMeshes(group,true,true,undefined,false,false);
                if(merged){for(const old of group){const index=meshes.indexOf(old);if(index>=0)meshes.splice(index,1);}merged.name='batched '+group[0].name;merged.metadata={batchedParts:group.flatMap(m=>m.metadata?.batchedParts??[m.name])};adopt(merged);}
            }
        },
        context: ctx,
        ownTexture: <T extends BaseTexture>(texture: T) => {
            ownedTextures.push(texture);
            return texture;
        },
        adopt,
        ownMaterial: (material: StandardMaterial) => {
            ownedMaterials.push(material);
            return material;
        },
        box: (name: string, x: number, y: number, z: number, w: number, h: number, d: number, color: string) => {
            const m = adopt(MeshBuilder.CreateBox(name, { width: w, height: h, depth: d }, ctx.scene), color);
            m.position.set(x, y + h / 2, z);
            return m;
        },
        sphere: (name: string, x: number, y: number, z: number, w: number, h: number, d: number, color: string, segments = 10) => {
            const m = adopt(MeshBuilder.CreateSphere(name, { diameter: 1, segments }, ctx.scene), color);
            m.position.set(x, y, z);
            m.scaling.set(w, h, d);
            return m;
        },
        cylinder: (name: string, x: number, y: number, z: number, r: number, h: number, color: string) => {
            const m = adopt(MeshBuilder.CreateCylinder(name, { height: h, diameter: r * 2, tessellation: 20 }, ctx.scene), color);
            m.position.set(x, y + h / 2, z);
            return m;
        },
    };
    try {
        draw(g);
        if(ctx.batchStatic){batchStaticMeshes(meshes,ctx);for(const mesh of meshes)mesh.parent=root;}
    }
    catch (error) {
        root.dispose(false, false);
        for (const material of ownedMaterials)
            material.dispose(true, false);
        for (const texture of ownedTextures)
            texture.dispose();
        throw error;
    }
    if (placement.position)
        root.position.copyFromFloats(placement.position.x, placement.position.y, placement.position.z);
    root.rotation.y = placement.rotationY ?? 0;
    if (placement.scale)
        root.scaling.copyFromFloats(placement.scale.x, placement.scale.y, placement.scale.z);
    let disposed = false;
    const point = (p: XYZ) => Vector3.TransformCoordinates(new Vector3(p.x, p.y, p.z), root.computeWorldMatrix(true));
    const worldBounds = (bounds: Bounds) => {
        const corners = [];
        for (const x of [bounds.min.x, bounds.max.x])
            for (const y of [bounds.min.y, bounds.max.y])
                for (const z of [bounds.min.z, bounds.max.z])
                    corners.push(point({ x, y, z }));
        return {
            min: corners.reduce((a, b) => Vector3.Minimize(a, b)),
            max: corners.reduce((a, b) => Vector3.Maximize(a, b)),
        };
    };
    const bounds = () => {
        root.computeWorldMatrix(true);
        for (const mesh of meshes)
            mesh.computeWorldMatrix(true);
        return {
            min: meshes
                .map((m) => m.getBoundingInfo().boundingBox.minimumWorld)
                .reduce((a, b) => Vector3.Minimize(a, b), new Vector3(Infinity, Infinity, Infinity)),
            max: meshes
                .map((m) => m.getBoundingInfo().boundingBox.maximumWorld)
                .reduce((a, b) => Vector3.Maximize(a, b), new Vector3(-Infinity, -Infinity, -Infinity)),
        };
    };
    return {
        id: placement.id,
        root,
        meshes,
        bounds,
        entrances: () => metadata.entrances?.map((s) => ({
            id: s.id,
            position: point(s.position),
        })) ?? [],
        pathSockets: () => metadata.pathSockets?.map((s) => ({
            id: s.id,
            position: point(s.position),
        })) ?? [],
        occluders: () => metadata.occlusion?.map((b) => ({ ...worldBounds(b), meshes })) ?? [],
        collisions: () => metadata.collision?.map(worldBounds) ?? [],
        // Movement uses oriented body bounds, not the larger rotated display AABB.
        movementSolids:()=>metadata.collision?.map(b=>({min:{x:b.min.x*root.scaling.x,y:b.min.y*root.scaling.y,z:b.min.z*root.scaling.z},max:{x:b.max.x*root.scaling.x,y:b.max.y*root.scaling.y,z:b.max.z*root.scaling.z},frame:{position:{x:root.position.x,y:root.position.y,z:root.position.z},rotation:root.rotation.y}}))??[],
        dispose: () => {
            if (disposed)
                return;
            disposed = true;
            root.dispose(false, false);
            for (const material of ownedMaterials)
                material.dispose(true, false);
            for (const texture of ownedTextures)
                texture.dispose();
        },
    };
}
export type AssetInstance = ReturnType<typeof createAsset>;
