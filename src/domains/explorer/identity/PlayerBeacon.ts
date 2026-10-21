import {captureScreenFrame} from '../../world/presentation/screenProjection';
import {MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder';
import {StandardMaterial} from '@babylonjs/core/Materials/standardMaterial';
import {Color3} from '@babylonjs/core/Maths/math.color';
import {Vector3} from '@babylonjs/core/Maths/math.vector';
import type {Scene} from '@babylonjs/core/scene';
import type {Engine} from '@babylonjs/core/Engines/engine';
import type {ArcRotateCamera} from '@babylonjs/core/Cameras/arcRotateCamera';
import type {Point} from '../../world/navigation/routes';
/** Player-only geometry. Owned materials avoid altering the shared city palette. */
export function createPlayerHalo(scene:Scene){
 const rings=[['player halo rim',2.65,.14,'#fff9ed'],['player halo blue',2.35,.16,'#1672d4']] as const;
 const meshes=rings.map(([name,diameter,thickness,color])=>{
  const mesh=MeshBuilder.CreateTorus(name,{diameter,thickness,tessellation:48},scene);
  const material=new StandardMaterial(name,scene);material.disableLighting=true;material.emissiveColor=Color3.FromHexString(color);mesh.material=material;
  mesh.isPickable=false;mesh.metadata={playerBeacon:true};return mesh;
 });
 return {update(point:Point,scale=1){for(const mesh of meshes){mesh.position.set(point.x,point.y+.28,point.z);mesh.scaling.setAll(scale);}},dispose(){for(const mesh of meshes){mesh.material?.dispose();mesh.dispose();}}};
}
/** Screen-space identity remains readable through buildings and at atlas-like zoom. */
export function createPlayerBeacon(container:HTMLDivElement,canvas:HTMLCanvasElement,scene:Scene,engine:Engine,camera:ArcRotateCamera,player:{position:Vector3},reduced:()=>boolean){
 const halo=createPlayerHalo(scene),el=document.createElement('div'),label=document.createElement('span'),arrow=document.createElement('i');
 el.className='player-beacon';el.setAttribute('role','img');el.setAttribute('aria-label','Your explorer');label.textContent='You';arrow.setAttribute('aria-hidden','true');el.append(label,arrow);container.append(el);
 let remaining=3,time=0;
 return {highlight(){remaining=3;time=0;},update(dt:number){
  remaining=Math.max(0,remaining-dt);time+=dt;label.hidden=remaining===0;
  halo.update(player.position,!reduced()&&remaining>0?1+.09*Math.sin(time*6):1);
  const frame=captureScreenFrame(canvas,scene,engine,camera),rect=frame.rect,p=frame.project(player.position.add(new Vector3(0,3.4,0))),{x,y}=p;
  el.hidden=p.z<0||p.z>1||x<14||x>rect.width-14||y<20||y>rect.height-14;
  el.style.transform=`translate(${x}px,${y}px) translate(-50%,-100%)`;
  el.style.setProperty('--beacon-size',camera.radius>100?'24px':'18px');
 },dispose(){el.remove();halo.dispose();}};
}
