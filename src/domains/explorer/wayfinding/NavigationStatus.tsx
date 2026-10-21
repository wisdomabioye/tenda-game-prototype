import {GameButton,GameIcon} from '../../../shared/ui/game/GameUI';
import {useEffect,useState,type RefObject} from 'react';
import type {Controls} from '../../world/runtime/contracts';
export function NavigationStatus({controls}:{controls:RefObject<Controls|null>}){
 const [state,setState]=useState<ReturnType<Controls['journey']>>({moving:false,progress:0});
 useEffect(()=>{const timer=window.setInterval(()=>setState(controls.current?.journey()??{moving:false,progress:0}),300);return()=>clearInterval(timer);},[controls]);
 return state.moving||state.arrived?<div className={`journey-status ${state.arrived?'has-arrived':''}`}><span role="status">{state.moving?`Heading to ${state.destination||'your destination'}`:`✓ You’ve arrived${state.destination?` · ${state.destination}`:''}`}</span>{state.moving&&<><progress aria-label="Walking route progress" max={1} value={state.progress}/><GameButton aria-label="Stop walking" title="Stop walking" onClick={()=>controls.current?.cancelJourney()}><GameIcon name="close"/></GameButton></>}</div>:null;
}
