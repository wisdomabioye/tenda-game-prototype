import {createLagosCity} from '../src/domains/world/districts/configured/city';
import {repairStations} from '../src/domains/explorer/challenge/stations';
import {walkingRoute,distance} from '../src/domains/world/navigation/routes';
import assert from 'node:assert/strict';
import {missions} from '../src/mock/tenda/catalogue';
import {delayMs,arrivalAt,createMissionStream} from '../src/mock/tenda/stream';
import {initialHunt,answerHunt,parseHunt,huntStages} from '../src/domains/explorer/hunt/model';
import {matches,inQuietHours} from '../src/domains/missions/engagement/policy';
import {nextMockState} from '../src/mock/tenda/useMockTenda';
assert.equal(delayMs(5,10,()=>0),5000);assert.equal(delayMs(5,10,()=>1),10000);assert.throws(()=>delayMs(0,4));assert.throws(()=>delayMs(10,5));
let callback=()=>{},cleared=0,delivered=0;const stream=createMissionStream(()=>delivered++,5,6,{set:fn=>{callback=fn;return 1;},clear:()=>{cleared++;}},()=>.5);stream.start();callback();assert.equal(delivered,1);stream.stop();callback();assert.equal(delivered,1,'stale timer cannot deliver after cancellation');assert.equal(cleared,1);
const arrivals=Array.from({length:12},(_,i)=>arrivalAt(missions,i,()=>.2,'12345678'));assert.equal(new Set(arrivals.map(m=>m.escrow_id)).size,12);assert(arrivals.every(m=>!missions.some(old=>old.escrow_id===m.escrow_id)));assert(arrivals.some(m=>m.remote)&&arrivals.some(m=>!m.remote&&m.city==='Lagos'));assert.notEqual(arrivals[0].escrow_id,arrivalAt(missions,0,()=>.2,'87654321').escrow_id);
const watch={remote:true,city:'Lagos',category:'all',quiet:false};assert(matches(arrivals[0],watch));assert(!matches(arrivals[0],{...watch,remote:false}));assert(!matches(arrivals[0],{...watch,quiet:true}));assert(!matches(arrivals[1],{...watch,city:'Accra'}));assert(inQuietHours('22:00','07:00',new Date(2026,1,1,23)));assert(!inQuietHours('22:00','07:00',new Date(2026,1,1,12)));
let hunt=initialHunt;assert.equal(answerHunt(hunt,0),hunt);for(const step of huntStages){hunt={...hunt,paused:false,reached:step.placeId};const wrong=answerHunt(hunt,(step.answer+1)%3);assert.equal(wrong,hunt);hunt=answerHunt(hunt,step.answer);hunt=parseHunt(JSON.parse(JSON.stringify(hunt)));}assert.equal(hunt.stage,4);assert.equal(answerHunt(hunt,0),hunt,'completion is idempotent');assert.throws(()=>parseHunt({...hunt,version:99}));assert.throws(()=>parseHunt({...hunt,stage:100}));assert.equal(nextMockState('assigned',false),'in-review');assert.equal(nextMockState('in-review',false),'approved');assert.equal(nextMockState('available',true),'applied');
console.log('mock-stream-hunt: timer cancellation, bounded delays, unique mock sessions, watch matching/quiet hours, checkpoint roundtrip, puzzle gating and mock lifecycle passed.');

const repairCity=createLagosCity();for(const station of repairStations){const place=repairCity.places?.find(p=>p.id===station.placeId);assert(place&&place.reachable,station.name);assert(walkingRoute(repairCity.settings.spawn,place.arrival,repairCity.network).length>0||distance(repairCity.settings.spawn,place.arrival)<4,station.name+" has a connected route");}console.log("Repair stations: all three configured entrance anchors reachable.");
