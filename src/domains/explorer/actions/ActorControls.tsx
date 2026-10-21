import {isTransferAction} from './activities/state';
import { useEffect, useState, type RefObject, type PointerEvent } from 'react';
import { GameButton } from '../../../shared/ui/game/GameUI';
import type { Controls } from '../../world/runtime/contracts';
import type { ActorSnapshot } from './createPhysicalActions';
import { activityStations, type StationId } from './activities/descriptors';
const initial: ActorSnapshot = { action: 'idle', paused: false, prompt: '', hint: 'WASD / arrows move · Shift runs · E interacts' };
const focusWorld = () => document.querySelector<HTMLCanvasElement>('canvas')?.focus();
const directions = [{ key: 'w', label: 'Move forward', glyph: '↑' }, { key: 'a', label: 'Move left', glyph: '←' }, { key: 's', label: 'Move back', glyph: '↓' }, { key: 'd', label: 'Move right', glyph: '→' }];
export function ActorControls({ controls, hidden }: {
    controls: RefObject<Controls | null>;
    hidden: boolean;
}) {
    const [state, setState] = useState(initial);
    useEffect(() => { const timer = window.setInterval(() => setState(controls.current?.actorState() ?? initial), 200); return () => clearInterval(timer); }, [controls]);
    if (hidden)
        return null;
    const hold = (key: string) => ({ onPointerDown: (e: PointerEvent<HTMLButtonElement>) => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); controls.current?.actorInput(key, true); }, onPointerUp: () => controls.current?.actorInput(key, false), onPointerCancel: () => controls.current?.actorInput(key, false), onLostPointerCapture: () => controls.current?.actorInput(key, false) });
    const visit = (id: StationId) => { controls.current?.actorVisit(id); focusWorld(); };
    const message = state.paused ? 'Explorer paused' : state.action === 'carrying' ? 'Carrying parcel' : state.action === 'sitting' ? 'Resting' : state.action === 'eating' ? 'Enjoying your meal' : state.hint;
    return <div className="actor-hud">
  <div className="actor-action">
   <span role="status">{state.nearby && <strong>{state.nearby} · </strong>}{message}</span>
   {state.progress !== undefined && <progress aria-label="Meal progress" max={1} value={state.progress}/>}
   {state.prompt && <GameButton variant="primary" disabled={state.paused || isTransferAction(state.action)} onClick={() => { controls.current?.actorInteract(); focusWorld(); }}>E · {state.prompt}</GameButton>}
   <GameButton aria-label={state.paused ? 'Resume explorer' : 'Pause explorer'} onClick={() => { controls.current?.actorPause(); focusWorld(); }}>{state.paused ? '▶ Resume' : 'Ⅱ'}</GameButton>
  </div>
  <details className="movement-pad"><summary>Move & activities ⌃</summary>
   <div>
    <nav className="activity-shortcuts" aria-label="Find an activity">{activityStations.map(s => <GameButton key={s.id} aria-label={`Go to ${s.label.toLowerCase()}`} onClick={() => visit(s.id)}>{s.shortcut} ↗</GameButton>)}</nav>
    <div className="direction-pad" aria-label="Touch movement controls">{directions.map(d => <GameButton key={d.key} aria-label={d.label} {...hold(d.key)}>{d.glyph}</GameButton>)}<GameButton className="run-control" aria-label="Move faster while held" {...hold('shift')}>Hold to run</GameButton></div>
   </div>
  </details>
 </div>;
}
