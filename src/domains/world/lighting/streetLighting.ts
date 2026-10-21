import {PointLight} from '@babylonjs/core/Lights/pointLight';
import {Vector3} from '@babylonjs/core/Maths/math.vector';
import {Color3} from '@babylonjs/core/Maths/math.color';
import type {Scene} from '@babylonjs/core/scene';
import type {AssetSpec} from '../assets/registry';
import {distance,type Point} from '../navigation/routes';
/** Emissive distant fixtures + at most two actual local lights, never one light per lamp. */
export function createStreetLighting(scene:Scene,assets:AssetSpec[]){
 const fixtures=assets.filter(a=>a.kind==='streetLamp'&&a.position).map(a=>a.position!);
 const lights=Array.from({length:2},(_,i)=>{const light=new PointLight(`local street light ${i}`,Vector3.Zero(),scene);light.diffuse=Color3.FromHexString('#ffd296');light.range=9;light.intensity=.24;light.setEnabled(false);return light;});
 return {update(focus:Point){const nearby=[...fixtures].sort((a,b)=>distance(a,focus)-distance(b,focus)).filter(p=>distance(p,focus)<45).slice(0,2);lights.forEach((light,i)=>{const p=nearby[i];light.setEnabled(!!p);if(p)light.position.set(p.x+.7,p.y+4.35,p.z);});},dispose(){lights.forEach(light=>light.dispose());}};
}
