import {PwaActions} from '../../domains/platform/pwa/PwaActions';
import {GameButton,GameCard,CloseButton} from '../../shared/ui/game/GameUI';
import './ExplorerMenu.css';
import {useEffect,useRef} from 'react';
import {districtManifest} from '../../domains/world/loading/manifest';
interface Props {
 recordingCount?:number;
 onOpen:()=>void;onHelp:()=>void;movementVisible:boolean;onMovement:()=>void;
 worldReady:boolean;
 city:string;country:string;count:number;district:string;hasDistricts:boolean;canAuthor:boolean;soundActive:boolean;road:string|null;
 activityEnabled:boolean;onActivity:()=>void;onReplay:()=>void;
 onImport:()=>void;onPerformance:()=>void;
 onCharacter:()=>void;
 onDistrict:(id:string)=>void;onSound:()=>void;onMute:()=>void;onAuthor:()=>void;
}
/** Non-modal disclosure: common map controls stay visible; secondary tools share one anchor. */
export function ExplorerMenu(props:Props){
 const root=useRef<HTMLDetailsElement>(null);
 const close=()=>{if(root.current)root.current.open=false;};
 useEffect(()=>{
  const outside=(event:PointerEvent)=>{if(!root.current?.contains(event.target as Node))close();};
  const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'&&root.current?.open){close();root.current.querySelector('summary')?.focus();}};
  document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);
  return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};
 },[]);
 const action=(callback:()=>void)=>{close();callback();};
 return <details className="explorer-menu" ref={root} onToggle={e=>{if(e.currentTarget.open)props.onOpen();}}>
  <summary aria-label="Explorer controls"><span aria-hidden="true">☷</span><small>Tools</small>{props.recordingCount!==undefined&&<b className="benchmark-badge" title={`Recording benchmark · ${props.recordingCount}/30`} aria-label={`Recording benchmark · ${props.recordingCount}/30`}>{props.recordingCount}</b>}</summary>
  <GameCard className="explorer-menu-panel" aria-label="Explorer tools">
   <CloseButton label="Close tools" onClick={close}/><h2>Tools</h2><div className="sound-status"><span>{props.soundActive?"♫ Sound on":"♫ Sound off"}</span><GameButton onClick={()=>props.soundActive?props.onMute():action(props.onSound)}>{props.soundActive?"Mute":"Choose sound"}</GameButton></div><div className="explorer-context"><strong>{props.city}, {props.country}</strong><small>{props.count} sample missions</small></div>
   {props.hasDistricts?<label>District<select aria-label="Choose district" value={props.district} onChange={e=>action(()=>props.onDistrict(e.target.value))}>{districtManifest.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></label>:<small>Illustrative streets</small>}
   {props.road&&<p className="menu-road">Selected road · {props.road}</p>}
   <div className="explorer-menu-actions"><GameButton aria-pressed={props.movementVisible} onClick={()=>action(props.onMovement)}>{props.movementVisible?"Hide movement controls":"Show movement controls"}</GameButton><GameButton onClick={()=>action(props.onHelp)}>Help & guide</GameButton><GameButton onClick={()=>action(props.onPerformance)}>◴ Performance</GameButton>{props.canAuthor&&<GameButton onClick={()=>action(props.onImport)}>⇧ Import places</GameButton>}<GameButton onClick={()=>action(props.onReplay)}>✦ Replay first adventure</GameButton><GameButton aria-pressed={props.activityEnabled} onClick={props.onActivity}>{props.activityEnabled?'Ⅱ Pause city activity':'▶ Resume city activity'}</GameButton><small className="activity-hint">Decorative neighbours and gentle shop movement. Reduced motion keeps them still.</small><GameButton onClick={()=>action(props.onCharacter)}>♙ Choose explorer</GameButton><GameButton onClick={()=>action(props.onSound)}>♫ Sound settings</GameButton>{props.soundActive&&<GameButton onClick={props.onMute} aria-label="Mute all sound">Mute</GameButton>}{props.canAuthor&&<GameButton onClick={()=>action(props.onAuthor)}>＋ Add sample place</GameButton>}</div>
   <PwaActions ready={props.worldReady}/>
  </GameCard>
 </details>;
}
