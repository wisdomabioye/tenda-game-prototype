import {useState} from 'react';
import type {Mission} from '../model/mission';
import {GameButton,GameCard,CloseButton,GameIcon} from '../../../shared/ui/game/GameUI';
export function ArrivalAlert({count,mission,onInspect,onSave,onDismiss}:{count:number;mission:Mission;onInspect:()=>void;onSave:()=>void;onDismiss:()=>void}){
 const [expanded,setExpanded]=useState(false);
 return <GameCard className={`arrival-alert ${expanded?'is-expanded':''}`} aria-label="New matching missions"><GameButton className="arrival-summary" aria-expanded={expanded} onClick={()=>setExpanded(!expanded)}><GameIcon name="alerts"/><span aria-live="polite">{count} new demo {count===1?'mission':'missions'}</span><span aria-hidden="true">{expanded?'⌃':'⌄'}</span></GameButton>{expanded&&<><CloseButton label="Dismiss mission alerts" onClick={onDismiss}/><p>{mission.remote?'Remote':mission.city} · {mission.title}</p><div className="alert-actions"><GameButton variant="primary" onClick={onInspect}>Inspect</GameButton><GameButton onClick={onSave}>Save</GameButton><GameButton variant="quiet" onClick={onDismiss}>Continue exploring</GameButton></div></>}</GameCard>;
}
