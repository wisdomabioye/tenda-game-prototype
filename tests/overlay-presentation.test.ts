import assert from 'node:assert/strict';
import {NullEngine} from '@babylonjs/core/Engines/nullEngine';
import {Scene} from '@babylonjs/core/scene';
import {ArcRotateCamera} from '@babylonjs/core/Cameras/arcRotateCamera';
import {Vector3} from '@babylonjs/core/Maths/math.vector';
import {Viewport} from '@babylonjs/core/Maths/math.viewport';
import {captureScreenFrame} from '../src/domains/world/presentation/screenProjection';
import {collectOverlayBounds} from '../src/shared/ui/overlayBounds';
const engine=new NullEngine(),scene=new Scene(engine),camera=new ArcRotateCamera('projection',-Math.PI/2,Math.PI/2,10,Vector3.Zero(),scene);
scene.activeCamera=camera;scene.render();
try{
 for(const [width,height] of [[390,844],[960,600]])for(const resolution of [1,2,3]){
  let layoutReads=0,widthReads=0,heightReads=0;
  const canvas={getBoundingClientRect:()=>{layoutReads++;return {left:37,top:51,width,height,right:37+width,bottom:51+height,x:37,y:51,toJSON:()=>({})};}};
  const render={getRenderWidth:()=>{widthReads++;return width*resolution;},getRenderHeight:()=>{heightReads++;return height*resolution;}};
  camera.viewport=new Viewport(0,0,1,1);
  const frame=captureScreenFrame(canvas,scene,render,camera);
  for(let i=0;i<100;i++){const origin=frame.project({x:0,y:0,z:0});assert(Math.abs(origin.x-width/2)<1e-6,'render pixels must become CSS pixels');assert(Math.abs(origin.y-height/2)<1e-6);assert(origin.z>=0&&origin.z<=1);}
  assert.deepEqual([layoutReads,widthReads,heightReads],[1,1,1],'each batch reads layout/render dimensions once, regardless of marker count');
  assert(frame.project({x:0,y:1,z:0}).y<height/2,'a higher world marker projects upward');
  const behind=frame.project(camera.position.scale(2));assert(behind.z<0||behind.z>1,'depth remains available for behind-camera culling');
  camera.viewport=new Viewport(.1,.2,.6,.5);
  const inset=captureScreenFrame(canvas,scene,render,camera).project(Vector3.Zero());
  assert(Math.abs(inset.x-width*.4)<1e-6);assert(Math.abs(inset.y-height*.45)<1e-6,'camera viewport offset must be respected');
 }
}finally{scene.dispose();engine.dispose();}
const previousDocument=Object.getOwnPropertyDescriptor(globalThis,'document'),previousStyle=Object.getOwnPropertyDescriptor(globalThis,'getComputedStyle');
const element=(left:number,top:number,width:number,height:number,hidden=false,visibility='visible',hasLayout=true)=>({hidden,visibility,getClientRects:()=>hasLayout?[{}]:[],getBoundingClientRect:()=>({left,top,width,height})});
const elements=[element(110,220,44,44),element(200,300,50,50,true),element(200,300,50,50,false,'hidden'),element(200,300,50,50,false,'visible',false)];
Object.defineProperty(globalThis,'document',{configurable:true,value:{querySelectorAll:(selector:string)=>{assert(selector.includes('.arrival-alert')&&selector.includes('.explorer-menu')&&selector.includes('.trail-pin'),'every marker layer shares HUD ownership, plus explicit extra markers');return elements;}}});
Object.defineProperty(globalThis,'getComputedStyle',{configurable:true,value:(el:{visibility:string})=>({visibility:el.visibility})});
try{assert.deepEqual(collectOverlayBounds({left:10,top:20},'.trail-pin'),[{x:100,y:200,width:44,height:44}],'hidden/collapsed controls reserve no marker space; visible bounds use canvas coordinates');}
finally{if(previousDocument)Object.defineProperty(globalThis,'document',previousDocument);else Reflect.deleteProperty(globalThis,'document');if(previousStyle)Object.defineProperty(globalThis,'getComputedStyle',previousStyle);else Reflect.deleteProperty(globalThis,'getComputedStyle');}
console.log('Overlay projection: portrait/landscape, 1–3× render resolution, camera viewport/depth, batched layout reads and visible HUD bounds passed.');
