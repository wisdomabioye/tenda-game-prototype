import {actorInputBlocked} from './inputPolicy';
export interface ActorInput {
    input: (key: string, down: boolean) => void;
    interact: () => void;
    togglePause: () => void;
    setPaused: (paused: boolean) => void;
    clearInput: () => void;
}
/** One local-player binding; NPC action controllers never need document listeners. */
export function bindActorKeyboard(actor: ActorInput) {  const keydown = (e: KeyboardEvent) => { const el = document.activeElement; if (el instanceof HTMLElement && el.closest('button,input,select,textarea,summary,a,[contenteditable=true]') || actorInputBlocked())
    return; const key = e.key.toLowerCase(); if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'shift'].includes(key)) {
    e.preventDefault();
    actor.input(key, true);
}
else if (key === 'e' && !e.repeat) {
    e.preventDefault();
    actor.interact();
}
else if (key === 'escape' && !e.repeat) {
    e.preventDefault();
    actor.togglePause();
} }; const keyup = (e: KeyboardEvent) => actor.input(e.key.toLowerCase(), false), blur = () => actor.clearInput(), visibility = () => { if (document.hidden) {
    actor.clearInput();
    actor.setPaused(true);
} }; document.addEventListener('keydown', keydown); document.addEventListener('keyup', keyup); window.addEventListener('blur', blur); document.addEventListener('visibilitychange', visibility); return () => { document.removeEventListener('keydown', keydown); document.removeEventListener('keyup', keyup); window.removeEventListener('blur', blur); document.removeEventListener('visibilitychange', visibility); actor.clearInput(); }; }
