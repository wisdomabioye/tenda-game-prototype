import {useEffect,useRef,useState} from 'react';
import {missions as initial} from './catalogue';
import config from './config.json';
import {arrivalAt,createMissionStream,delayMs} from './stream';
import type {Mission} from '../../domains/missions/model/mission';
export type MockWorkState='available'|'applied'|'assigned'|'in-review'|'approved';
export function nextMockState(state:MockWorkState,requiresApproval:boolean):MockWorkState{return state==='available'?(requiresApproval?'applied':'assigned'):state==='applied'?'assigned':state==='assigned'?'in-review':'approved';}
export function useMockTenda(){
 const [missions,setMissions]=useState(initial),[arrivals,setArrivals]=useState<Mission[]>([]),[enabled,setEnabled]=useState(true),[timing,setTiming]=useState({min:config.minimumSeconds,max:config.maximumSeconds}),[visible,setVisible]=useState(!document.hidden),[states,setStates]=useState<Record<string,MockWorkState>>({});
 const cursor=useRef(0),session=useRef(Math.floor(Math.random()*0x100000000).toString(16).padStart(8,'0'));
 const inject=()=>{if(cursor.current>=config.arrivalLimit)return;const mission=arrivalAt(initial,cursor.current++,Math.random,session.current);setMissions(old=>[...old,mission]);setArrivals(old=>[mission,...old].slice(0,config.arrivalLimit));};
 const deliver=useRef(inject);deliver.current=inject;
 useEffect(()=>{const handler=()=>setVisible(!document.hidden);document.addEventListener('visibilitychange',handler);return()=>document.removeEventListener('visibilitychange',handler);},[]);
 useEffect(()=>{if(!enabled||!visible||arrivals.length>=config.arrivalLimit)return;const stream=createMissionStream(()=>deliver.current(),timing.min,timing.max,{set:(fn,ms)=>window.setTimeout(fn,ms),clear:id=>window.clearTimeout(id as number)});stream.start();return stream.stop;},[enabled,visible,timing,arrivals.length]);
 return {missions,arrivals,enabled,setEnabled,timing,setTiming:(min:number,max:number)=>{delayMs(min,max);setTiming({min,max});},inject,exhausted:arrivals.length>=config.arrivalLimit,state:(id:string)=>states[id]??'available',advance:(m:Mission)=>setStates(old=>({...old,[m.escrow_id]:nextMockState(old[m.escrow_id]??'available',m.requires_approval)}))};
}
