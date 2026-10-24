import assert from 'node:assert/strict';
import {NullEngine} from '@babylonjs/core/Engines/nullEngine';
import {Scene} from '@babylonjs/core/scene';
import {Mesh} from '@babylonjs/core/Meshes/mesh';
import {createAssetContext} from '../src/domains/world/assets/core/context';
import {createAsset} from '../src/domains/world/assets/core/asset';
import {cacheStaticTransforms} from '../src/domains/world/assets/core/staticTransforms';
import {composeAssets} from '../src/domains/world/districts/shared/compose';
import {createDetailBudget} from '../src/domains/world/visibility/detailBudget';
import {createFrameTasks} from '../src/domains/world/runtime/frameTasks';
import {spaceSceneMarkers} from '../src/shared/ui/markerSpacing';
import type {AssetSpec} from '../src/domains/world/assets/registry';
const engine=new NullEngine(),scene=new Scene(engine),ctx=createAssetContext(scene);
const asset=createAsset(ctx,{id:'edited'},g=>{g.box('wall',0,0,0,8,10,8,'#fff');g.box('window',0,4,-4.1,1,1,.1,'#abc');g.box('awning',0,2,-5,3,.2,1,'#abc');});
const cached=cacheStaticTransforms(asset);
assert(asset.root.isWorldMatrixFrozen);assert(asset.meshes[0].isWorldMatrixFrozen);assert(asset.meshes[0].doNotSyncBoundingInfo);assert(!asset.meshes[2].isWorldMatrixFrozen,'fabric remains animated');
const budget=createDetailBudget([{kind:'house',id:'edited',width:8,depth:8,height:10,color:'#fff'}]);const origin={x:0,y:0,z:0};
budget.update([asset],origin,origin,true);assert(asset.meshes[1].isEnabled());
asset.root.position.x=150;cached.refresh();assert(Math.abs(asset.meshes[0].getAbsolutePosition().x-150)<.001);assert.equal(budget.update([asset],origin,origin,true),2,'explicit transform refresh invalidates cached detail locations');budget.restore();asset.dispose();
const specs:AssetSpec[]=Array.from({length:3},(_,i)=>({kind:'palm',id:`palm-${i}`,position:{x:i*7,y:0,z:10},rotationY:i*.3}));
const unsupported=composeAssets(ctx,specs);assert.equal(unsupported.instanceCounts().instances,0);assert(unsupported.assets.every(a=>a.meshes[0].isEnabled()),'unsupported devices retain original render meshes');unsupported.dispose();
engine.getCaps().instancedArrays=true;
const composed=composeAssets(ctx,[...specs,{kind:'palm',id:'different-height',height:7,position:{x:40,y:0,z:10}},{kind:'bench',id:'bench',position:origin},{kind:'palm',id:'mirrored',scale:{x:-1,y:1,z:1}}]);
assert.deepEqual(composed.instanceCounts(),{sources:1,instances:3,savedDrawMeshes:2});
const batch=scene.meshes.find(m=>m.metadata?.sceneryInstances===3)!;assert(batch);assert.equal(batch.thinInstanceCount,3);assert.equal(batch.geometry,composed.assets[0].meshes[0].geometry,'GPU geometry is shared');assert(!batch.isPickable);
assert(composed.assets.slice(0,3).every(a=>!a.meshes[0].isEnabled()));assert(composed.assets.slice(0,3).every(a=>a.meshes[0].geometry===batch.geometry),'identical originals reuse the same GPU geometry too');assert(composed.assets[3].meshes[0].isEnabled(),'different geometry is never mixed into the group');assert(composed.assets[4].meshes.every(m=>m.isEnabled()),'activity furniture stays independent');assert(composed.assets[5].meshes[0].isEnabled(),'mirrored scenery keeps its independent winding/culling');
for(let i=0;i<3;i++)assert(batch.thinInstanceGetWorldMatrices()[i].equalsWithEpsilon(composed.assets[i].meshes[0].getWorldMatrix(),.0001));
composed.assets[1].root.position.x=21;composed.refreshTransforms();const refreshed=scene.meshes.find(m=>m.metadata?.sceneryInstances===3)!;assert(Math.abs(refreshed.thinInstanceGetWorldMatrices()[1].getTranslation().x-21)<.001,'editing refreshes instance transforms');assert.equal(scene.meshes.filter(m=>m.metadata?.sceneryInstances).length,1,'refresh does not leak rendering sources');
composed.assets[1].root.position.x=71;composed.refreshTransforms();assert.equal(composed.instanceCounts().instances,0,'distant edits split spatial groups rather than enlarging a city-wide instance bound');assert(composed.assets.slice(0,3).every(a=>a.meshes[0].isEnabled()));
composed.dispose();assert.equal(scene.meshes.length,0,'original and instanced geometry owners dispose together');const originalBuffer=Mesh.prototype.thinInstanceSetBuffer;let allocations=0;
try{Mesh.prototype.thinInstanceSetBuffer=function(...args:Parameters<typeof originalBuffer>){if(++allocations===2)throw new Error('simulated GPU allocation failure');return originalBuffer.apply(this,args);};
 assert.throws(()=>composeAssets(ctx,[...specs,...Array.from({length:3},(_,i)=>({kind:'tree' as const,id:`tree-${i}`}))]),/simulated GPU/);
 assert.equal(scene.meshes.length,0,'failed instance allocation cleans partial sources and original assets');
}finally{Mesh.prototype.thinInstanceSetBuffer=originalBuffer;}
ctx.dispose();scene.dispose();engine.dispose();
const counts=[0,0,0,0],tasks=createFrameTasks(counts.map((_,i)=>({id:String(i),interval:.25,run:()=>{counts[i]++;}})));
for(let i=0;i<200;i++){const before=counts.reduce((a,b)=>a+b,0);tasks.tick(.05);assert(counts.reduce((a,b)=>a+b,0)-before<=1,'decorative tasks never bunch into the same frame');}
assert(counts.every(n=>n>=35&&n<=41),'all tasks receive fair service');const before=counts.reduce((a,b)=>a+b,0);tasks.tick(60);assert.equal(counts.reduce((a,b)=>a+b,0)-before,1,'background gaps do not replay missed intervals');assert.equal(tasks.tick(0),null);assert.equal(tasks.tick(NaN),null);assert.throws(()=>createFrameTasks([{id:'bad',interval:0,run:()=>{}}]));
console.log('Steady rendering: frozen static transforms, live awnings, refresh invalidation, instancing fallback/geometry/identity/disposal, and fair one-task frame scheduling passed.');

const previousDocument=Object.getOwnPropertyDescriptor(globalThis,'document'),layoutOrder:string[]=[];
try{
 Object.defineProperty(globalThis,'document',{configurable:true,value:{querySelectorAll:()=>[]}});
 const markers=[40,240].map(left=>({hidden:false,classList:{contains:()=>false},style:{set transform(_value:string){layoutOrder.push('write');}},getBoundingClientRect:()=>{layoutOrder.push('read');return {left,top:180,width:24,height:24};}}));
 spaceSceneMarkers({querySelectorAll:()=>markers} as unknown as HTMLElement,{getBoundingClientRect:()=>({left:0,top:0,width:360,height:687})} as unknown as HTMLCanvasElement);
 assert.deepEqual(layoutOrder,['read','read','write','write'],'marker projection must batch layout reads while keeping placement every frame');
}finally{if(previousDocument)Object.defineProperty(globalThis,'document',previousDocument);else Reflect.deleteProperty(globalThis,'document');}
