import {GameButton,GameCard,CloseButton} from '../../../shared/ui/game/GameUI';
import type { Mission } from "../model/mission";
import { categoryLabels, reward, labels } from "../model/presentation";
import {useLayoutEffect,useRef,type ReactNode} from 'react';
const readingPositions=new Map<string,{brief:boolean;top:number}>();
function remember(id:string,value:{brief:boolean;top:number}){readingPositions.delete(id);readingPositions.set(id,value);if(readingPositions.size>60)readingPositions.delete(readingPositions.keys().next().value!);}
export function MissionPreview({ arrived=false,mockWork,guided,onNextSaved, locationNote, notice, brief, setBrief, trail, onSave, onClose, }: {
    arrived?:boolean;
    mockWork?:ReactNode;
    guided?:{read:boolean;onRead:()=>void;onSaved:()=>void};
    onNextSaved?:()=>void;
    locationNote?: string;
    notice: Mission;
    brief: boolean;
    setBrief: (value: boolean) => void;
    trail: string[];
    onSave: () => void;
    onClose: () => void;
}) {
    const scroll=useRef<HTMLDivElement>(null);
    useLayoutEffect(()=>{const saved=readingPositions.get(notice.escrow_id);setBrief(saved?.brief??false);},[notice.escrow_id,setBrief]);
    useLayoutEffect(()=>{const saved=readingPositions.get(notice.escrow_id);if(scroll.current&&saved?.brief===brief)scroll.current.scrollTop=saved.top;},[notice.escrow_id,brief]);
    const toggleBrief=()=>{const next=!brief;remember(notice.escrow_id,{brief:next,top:scroll.current?.scrollTop??0});setBrief(next);if(next)guided?.onRead();};
    return (<GameCard className="notice" aria-label="Mission preview">
      
      <CloseButton label="Close mission" onClick={onClose}/>
      <div className="mission-heading"><span className="demo-badge">{arrived?"✓ You’ve arrived · Demo mission":"Demo mission"}</span><h2>{notice.title}</h2></div>
      <div className="notice-scroll" ref={scroll} onScroll={e=>remember(notice.escrow_id,{brief,top:e.currentTarget.scrollTop})}>
      {locationNote && <p className="location-note">{locationNote}</p>}
      <small>
        {categoryLabels[notice.category]} ·{" "}
        {notice.remote ? "Remote" : notice.city}
      </small>
      <p className="reward">
        {reward(notice.amount_raw)} {notice.asset} <span>Sample reward</span>
      </p>
      {brief && (<div className="brief">
          <p>{notice.description?.replace(/^SIMULATED ARRIVAL\.\s*/,'')}</p>
          <p>
            Evidence:{" "}
            {notice.proof_requirements.map((p) => labels[p]).join(" · ")}
          </p>
          <p>
            {notice.requires_approval
                ? "Application and selection required."
                : "Assignment must be confirmed before work starts."}{" "}
            
          </p>
        </div>)}
      {guided&&<p className="guided-note"><strong>Discovery reached ✦</strong>{guided.read?'Now save this interest to reveal your numbered trail stop.':'Read the mission requirements first. Reaching this place is discovery, not completed work.'}</p>}
      <div className="actions">
        <GameButton onClick={toggleBrief}>
          {brief ? "Less detail" : "Read mission"}
        </GameButton>
        <GameButton aria-pressed={trail.includes(notice.escrow_id)} disabled={Boolean(guided&&!guided.read&&!trail.includes(notice.escrow_id))} onClick={onSave}>
          {trail.includes(notice.escrow_id) ? "★ Saved" : "☆ Save"}
        </GameButton>
      </div>
      {mockWork}
      {onNextSaved&&<GameButton className="continue-trail" onClick={onNextSaved}>Next saved stop →</GameButton>}
      {guided?.read&&trail.includes(notice.escrow_id)&&<GameButton className="continue-trail" onClick={guided.onSaved}>Continue with this saved stop →</GameButton>}
      <small>Saved on this device where storage is available; saving does not reserve work.</small>
      </div>
    </GameCard>);
}
