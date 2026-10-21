import assert from 'node:assert/strict';
import {NullEngine} from '@babylonjs/core/Engines/nullEngine';import {Scene} from '@babylonjs/core/scene';
import {createAssetContext} from '../src/domains/world/assets/core/context';import {resolveDistrict} from '../src/domains/world/districts/shared/resolve';import {composeAssets} from '../src/domains/world/districts/shared/compose';
import {createMissionStops} from '../src/domains/missions/world/MissionStops';import {distance,snapToStreet,walkingRoute} from '../src/domains/world/navigation/routes';import {canTraverse} from '../src/domains/world/navigation/movement';
const engine=new NullEngine(),scene=new Scene(engine),ctx=createAssetContext(scene),city=resolveDistrict({id:'lagos',ground:'#fff'},new Set());
const composition=composeAssets(ctx,city.assets.filter(a=>['urban','house','venue','bench','storeyed'].includes(a.kind)));
const source=(city.places??[]).map((p,i)=>({id:`gig-${i}`,title:p.name,category:'delivery',placeName:p.name,position:{...p.arrival}}));source.push({...source[0],id:'shared-box'});
const original=JSON.stringify(source),boxes=createMissionStops(ctx,city.network,city.venues,()=>composition.assets.flatMap(a=>a.movementSolids()));boxes.setMissions(source);
assert.equal(JSON.stringify(source),original,'presentation must not rewrite mission geography');assert.equal(boxes.forMission('gig-0')?.id,boxes.forMission('shared-box')?.id,'one box groups co-located gigs');
for(const box of boxes.stops){assert(canTraverse(box.position,box.position,composition.assets.flatMap(a=>a.movementSolids()),.55),'parcel box clears building bodies');assert(distance(box.position,snapToStreet(box.position,city.network))>2.1,'box stays outside the walking lane');assert(distance(box.position,box.arrival)<3,'box remains close to its walking approach');assert(walkingRoute(city.settings.spawn,box.arrival,city.network).length||distance(city.settings.spawn,box.arrival)<.12,'box approach connected');}
const meshCount=scene.meshes.length;boxes.setMissions(source);assert.equal(scene.meshes.length,meshCount,'unchanged stream does not duplicate boxes');boxes.setMissions(source.slice(0,1));assert.equal(boxes.stops.length,1);assert.equal(boxes.stops[0].missionIds.length,1);
const solids=composition.assets.flatMap(a=>a.movementSolids());const blocked=city.network.filter(([a,b])=>!canTraverse(a,b,solids,.65));console.log('Blocked full source segments with oriented collision bounds:',blocked.length,'of',city.network.length);
boxes.dispose();composition.dispose();ctx.dispose();assert.equal(scene.meshes.length,0);scene.dispose();engine.dispose();console.log('Roadside mission boxes: grouped, off-path, reachable, geography preserved, streaming and disposal passed.');
for(const cityId of ['nairobi','accra','johannesburg','remote']){
 const engine=new NullEngine(),scene=new Scene(engine),ctx=createAssetContext(scene),district=resolveDistrict({id:cityId,ground:'#fff0ce'},new Set());
 const composition=composeAssets(ctx,district.assets.filter(a=>['house','venue','bench','storeyed'].includes(a.kind)));
 const boxes=createMissionStops(ctx,district.network,district.venues,()=>composition.assets.flatMap(a=>a.movementSolids()));boxes.setMissions(district.venues.map((v,i)=>({id:`${cityId}-${i}`,category:v.category,title:v.name})));
 for(const box of boxes.stops)assert(distance(box.position,snapToStreet(box.position,district.network))>2.1,`${cityId}/${box.id} outside walking lanes`);
 boxes.dispose();composition.dispose();ctx.dispose();scene.dispose();engine.dispose();
}
