import {captureScreenFrame} from '../../world/presentation/screenProjection';
import {collectOverlayBounds} from '../../../shared/ui/overlayBounds';
import type {Scene} from '@babylonjs/core/scene';
import type {Engine} from '@babylonjs/core/Engines/engine';
import type {ArcRotateCamera} from '@babylonjs/core/Cameras/arcRotateCamera';
import type {Point} from '../../world/navigation/routes';
import {findMarkerPosition} from '../../../shared/ui/markerLayout';
export interface TrailStop {id:string;order:number;title:string;point:Point;}
/** Saved-order overlay independent of mission clustering and task assignment. */
export function createTrailMarkers(container:HTMLDivElement,canvas:HTMLCanvasElement,scene:Scene,engine:Engine,camera:ArcRotateCamera,onVisit:(id:string)=>void){
 let markers:{el:HTMLButtonElement;stop:TrailStop}[]=[];
 const clear=()=>{markers.forEach(m=>m.el.remove());markers=[];};
 return {set(stops:TrailStop[],active:string|null){clear();for(const stop of stops){const el=document.createElement('button');el.className='trail-pin';el.textContent=`T${stop.order}`;el.title=stop.title;el.setAttribute('aria-label',`Trail stop ${stop.order}: ${stop.title}`);el.setAttribute('aria-current',String(stop.id===active));el.onclick=()=>{for(const marker of markers)marker.el.setAttribute('aria-current',String(marker.stop.id===stop.id));onVisit(stop.id);};container.append(el);markers.push({el,stop});}},update(){const frame=captureScreenFrame(canvas,scene,engine,camera),rect=frame.rect;const occupied=collectOverlayBounds(rect);
 for(const {el,stop} of markers){const p=frame.project({...stop.point,y:stop.point.y+2}),{x,y}=p;const fit=findMarkerPosition(x,y,rect.width,rect.height,occupied);el.hidden=!fit||p.z<0||p.z>1;if(fit){el.style.transform=`translate(${fit.x}px,${fit.y}px) translate(-50%,-50%)`;occupied.push({x:fit.x-24,y:fit.y-24,width:48,height:48});}}
 },dispose:clear};
}
