import {angleDelta} from '../../../shared/motion/angles';
import {cityHuman} from '../../explorer/character/humanKit';
import {TransformNode} from '@babylonjs/core/Meshes/transformNode';
import {createExplorer} from '../../explorer/character/createExplorer';
import {defaultAppearance} from '../../explorer/character/appearance';
import {createWalker} from '../../explorer/character/walker';
import type {AssetContext} from '../assets/core/context';
import type {DistrictDefinition} from '../districts/shared/types';
import type {AssetInstance} from '../assets/core/asset';
import {distance,type Point} from '../navigation/routes';
import {pedestrianStops,choosePedestrianStop} from './pedestrianRoutes';
/** Deliberately bounded ambient actors; decorative, non-pickable and outside task state. */
export function createCityActivity(context:AssetContext,district:DistrictDefinition,assets:AssetInstance[],reduced:boolean,player?:()=>Point){
 const actors:ReturnType<typeof createExplorer>[]=[],walkers:{walker:ReturnType<typeof createWalker>;actor:ReturnType<typeof createExplorer>;previous:Point;pause:number;sequence:number;face?:Point}[]=[];
 const stops=pedestrianStops(district);
 const count=Math.min(12,stops.length);
 for(let i=0;i<count;i++){
  const start=stops[Math.floor(i*stops.length/count)];
  const actor=createExplorer(context.scene,context.material,cityHuman(i),'standing','crowd');
  actor.setOffset(.34);actor.root.name=`ambient pedestrian ${i+1}`;actor.root.scaling.setAll(.9);actor.root.position.copyFromFloats(start.x,start.y,start.z);
  const walker=createWalker(actor,district.network,false,()=>{},1.4+(i%4)*.18);
  actors.push(actor);walkers.push({walker,actor,previous:start,pause:i*.13,sequence:i*7});
 }
 const bench=district.assets.filter(a=>a.kind==='bench'&&a.position).sort((a,b)=>distance(a.position!,district.settings.spawn)-distance(b.position!,district.settings.spawn))[0];
 if(bench?.position){const actor=createExplorer(context.scene,context.material,cityHuman(13),'seated','crowd');actor.root.name='ambient seated neighbour';actor.root.position.copyFromFloats(bench.position.x,bench.position.y,bench.position.z);actor.root.rotation.y=(bench.rotationY??0)+Math.PI;actors.push(actor);}
 const keeper=district.places?.find(p=>p.id==='maker-quarter-building-0');
 if(keeper){const actor=createExplorer(context.scene,context.material,cityHuman(3),'standing','crowd');actor.root.name='cafe keeper';actor.root.position.set(keeper.arrival.x-1.6,0,keeper.arrival.z+.8);actors.push(actor);}
 const awnings=assets.filter(a=>!a.id.startsWith('urban/')).map(asset=>asset.meshes.filter(m=>m.name.toLowerCase().includes('awning'))).filter(meshes=>meshes.length).slice(0,2).map(meshes=>{
  const pivot=new TransformNode('ambient fabric pivot',context.scene),origin=meshes[0].position.clone();pivot.parent=meshes[0].parent;pivot.position.copyFrom(origin);
  const originals=meshes.map(mesh=>({mesh,parent:mesh.parent,position:mesh.position.clone()}));
  for(const mesh of meshes){mesh.parent=pivot;mesh.position.subtractInPlace(origin);}
  return {pivot,originals};
 });
 let enabled=true,reduceMotion=reduced,time=0;
 return {setReduced(value:boolean){reduceMotion=value;},setEnabled(value:boolean){enabled=value;},update(dt:number){if(!enabled||reduceMotion)return;time+=dt;for(const state of walkers){if(!state.walker.moving){state.pause-=dt;if(state.pause<=0){
 const places=(district.places??[]).filter(p=>p.reachable&&distance(p.arrival,state.actor.root.position)>4);
 const place=state.sequence%3!==0&&places.length?places[(state.sequence*7)%places.length]:undefined;
 const target=place?.arrival??choosePedestrianStop(state.actor.root.position,state.previous,stops,state.sequence);state.sequence++;
 state.face=place?.position;
 if(target){state.previous={x:state.actor.root.position.x,y:state.actor.root.position.y,z:state.actor.root.position.z};state.walker.moveTo(target);}
 state.pause=place?7+(state.sequence%4)*2:1+(state.sequence%5)*.7;
 }}
 const forward={x:Math.sin(state.actor.root.rotation.y),z:Math.cos(state.actor.root.rotation.y)};
 const blocked=state.walker.moving&&walkers.some(other=>other!==state&&distance(state.actor.root.position,other.actor.root.position)<1.15&&Math.cos(state.actor.root.rotation.y-other.actor.root.rotation.y)>.6&&(other.actor.root.position.x-state.actor.root.position.x)*forward.x+(other.actor.root.position.z-state.actor.root.position.z)*forward.z>0);
 if(blocked)state.actor.animate(dt,0,false);else state.walker.update(dt);
 if(!state.walker.moving&&state.face){const angle=Math.atan2(state.face.x-state.actor.root.position.x,state.face.z-state.actor.root.position.z);state.actor.root.rotation.y+=angleDelta(state.actor.root.rotation.y,angle)*Math.min(1,dt*3);}
 }for(const {pivot} of awnings)pivot.rotation.z=Math.sin(time*.8)*.018;},get counts(){return{pedestrians:walkers.length,seated:bench?1:0,vendors:keeper?1:0,shopDetails:awnings.length};},dispose(){actors.forEach(actor=>actor.root.dispose(false,false));for(const {pivot,originals}of awnings){for(const {mesh,parent,position}of originals){mesh.parent=parent;mesh.position.copyFrom(position);}pivot.dispose(false,false);}}};
}
