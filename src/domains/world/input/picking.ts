import {Pick} from '@babylonjs/core/Culling/ray.core';
import type {Scene} from '@babylonjs/core/scene';
import type {AbstractMesh} from '@babylonjs/core/Meshes/abstractMesh';
/** Explicit modular import: Scene.pick is a placeholder without the ray extension. */
export function pickWorld(scene:Scene,x:number,y:number,eligible:(mesh:AbstractMesh)=>boolean){
    const hit=Pick(scene,x,y,eligible);
    return hit?.hit?hit:null;
}
