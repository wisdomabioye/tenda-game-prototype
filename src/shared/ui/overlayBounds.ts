import type {Box} from './markerLayout';
/** All overlay owners reserve space through this one list, shared across marker layers. */
export const hudObstacles='header,.camera,footer,.actor-hud,.movement-pad[open]>div,.view-switch,.journey-status,.camera-recovery,.notice,.place-preview,.tool-panel,.arrival-alert,.explorer-menu summary,.explorer-menu[open] .explorer-menu-panel,.destination-cue:not([hidden])';
export function collectOverlayBounds(frame:Pick<DOMRect,'left'|'top'>,additional=''):Box[]{
 const selector=hudObstacles+(additional?','+additional:'');
 return Array.from(document.querySelectorAll<HTMLElement>(selector))
  .filter(el=>!el.hidden&&el.getClientRects().length>0&&getComputedStyle(el).visibility!=='hidden')
  .map(el=>{const rect=el.getBoundingClientRect();return {x:rect.left-frame.left,y:rect.top-frame.top,width:rect.width,height:rect.height};});
}
