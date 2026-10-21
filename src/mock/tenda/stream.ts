import config from '../../domains/world/districts/configured/maker-quarter.json';
import type {Mission} from '../../domains/missions/model/mission';
export interface StreamClock {set:(fn:()=>void,ms:number)=>unknown;clear:(id:unknown)=>void;}
export function delayMs(min:number,max:number,random:()=>number=Math.random){if(!Number.isFinite(min)||!Number.isFinite(max)||min<5||max<min||max>300)throw new Error('Use 5–300 seconds, maximum ≥ minimum.');return Math.round((min+(max-min)*Math.max(0,Math.min(1,random())))*1000);}
export function arrivalAt(catalogue:Mission[],index:number,random:()=>number=Math.random,sessionId='00000000'):Mission{
 const pool=catalogue.filter(m=>index%2===0?m.remote:!m.remote&&m.city==='Lagos'),base=pool[Math.min(pool.length-1,Math.floor(random()*pool.length))];
 const building=config.buildings.find(b=>b.missionIds.includes(base.escrow_id));
 return {...base,mockPlaceId:building?`maker-quarter-${building.id}`:undefined,escrow_id:`e0260000-0000-4000-8000-${sessionId+(index+1).toString(16).padStart(4,'0')}`,title:`New sample: ${base.title}`,description:'SIMULATED ARRIVAL. '+base.description};
}
/** Injected timer/RNG make delivery, cancellation and bounds deterministic in tests. */
export function createMissionStream(onArrival:()=>void,min:number,max:number,clock:StreamClock,random:()=>number=Math.random){
 let timer:unknown,stopped=true;
 const schedule=()=>{timer=clock.set(()=>{if(stopped)return;onArrival();if(!stopped)schedule();},delayMs(min,max,random));};
 return {start(){if(!stopped)return;stopped=false;schedule();},stop(){stopped=true;if(timer!==undefined)clock.clear(timer);timer=undefined;}};
}
