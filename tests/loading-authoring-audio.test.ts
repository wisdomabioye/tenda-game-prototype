import {parseSound,SoundEngine} from '../src/domains/audio/engine';
import assert from 'node:assert/strict';
import {createBoundedCache,createRequestGate} from '../src/domains/world/loading/requests';
import {findMarkerPosition} from '../src/domains/places/presentation/layout';
import {addAuthoredPlace,rectanglesOverlap,type AuthoredPlace} from '../src/domains/places/authoring/placement';
import {resolveDistrict} from '../src/domains/world/districts/shared/resolve';
import {places} from '../src/domains/atlas/places';
import {createLocalProjection} from '../src/domains/geography/projection/local';
const gate=createRequestGate(),old=gate.begin(),next=gate.begin();assert(!gate.current(old));assert(gate.current(next));gate.cancel();assert(!gate.current(next));
const cache=createBoundedCache<number>(2);cache.set('a',1);cache.set('b',2);assert.equal(cache.get('a'),1);cache.set('c',3);assert.equal(cache.get('b'),undefined);assert.equal(cache.size,2);
assert.deepEqual(findMarkerPosition(200,240,500,800,[]),{x:200,y:240});assert.notDeepEqual(findMarkerPosition(200,240,500,800,[{x:180,y:220,width:40,height:40}]),{x:200,y:240});assert.equal(findMarkerPosition(10,20,300,600,[]),null);
const square=(x:number)=>[{x,y:0,z:0},{x:x+4,y:0,z:0},{x:x+4,y:0,z:4},{x,y:0,z:4}];assert(rectanglesOverlap(square(0),square(2)));assert(!rectanglesOverlap(square(0),square(10)));
const district=resolveDistrict(places.find(p=>p.id==='lagos')!,[]);assert(district.geographic?.bounds);
const g=district.geographic!,projection=createLocalProjection(g.origin,g.worldUnitsPerMetre),bounds=g.bounds!;
const draft:AuthoredPlace={id:'test-cafe',name:'Test café',type:'restaurant',latitude:0,longitude:0,width:4,depth:4,rotation:0,floors:3,color:'#aabbcc'};
assert.throws(()=>addAuthoredPlace(district,draft),/patch/);assert.throws(()=>addAuthoredPlace(district,{...draft,latitude:NaN}),/Invalid/);
let valid:AuthoredPlace|undefined;
for(let x=bounds.minX+5;x<bounds.maxX-5&&!valid;x+=4)for(let z=bounds.minZ+5;z<bounds.maxZ-5&&!valid;z+=4){const coordinate=projection.inverse({x,y:0,z}),candidate={...draft,...coordinate};try{addAuthoredPlace(district,candidate);valid=candidate;}catch{}}
assert(valid,'at least one clear coordinate connects without an existing asset ID');
const updated=addAuthoredPlace(district,valid!);assert.equal(updated.places!.length,(district.places?.length??0)+1);assert(updated.places!.at(-1)!.reachable);assert.throws(()=>addAuthoredPlace(updated,valid!),/already exists/);assert.throws(()=>addAuthoredPlace(updated,{...valid!,id:'another-cafe'}),/overlaps/);
console.log('loading-authoring-audio: loading, marker layout and coordinate authoring checks passed; usable sample:',JSON.stringify(valid));

assert.deepEqual(parseSound({mode:'bad',ambience:150,music:-1,effects:NaN}),{mode:'off',ambience:100,music:0,effects:30});
let contexts=0;const audio=new SoundEngine(()=>{contexts++;throw new Error('must not create context while off');});assert.equal(await audio.start(),false);assert.equal(contexts,0);audio.dispose();assert.equal(await audio.start(),false);
console.log('Sound preference validation and silent lifecycle checks passed.');
let resume!:()=>void,closed=0;
const pendingContext={state:'suspended',resume:()=>new Promise<void>(r=>{resume=r;}),close:async()=>{closed++;}};
const pendingAudio=new SoundEngine(()=>pendingContext as unknown as AudioContext);pendingAudio.update({...parseSound({}),mode:'sunny'});const starting=pendingAudio.start();pendingAudio.stop();resume();assert.equal(await starting,false,'cancelled resume cannot create audio sources');pendingAudio.dispose();assert.equal(closed,1);
