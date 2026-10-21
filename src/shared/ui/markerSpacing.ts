import {collectOverlayBounds} from './overlayBounds';
import {findMarkerPosition} from './markerLayout';
/** Final shared pass uses actual rendered sizes, including wide mission clusters. */
export function spaceSceneMarkers(container:HTMLElement,canvas:HTMLCanvasElement){
 const frame=canvas.getBoundingClientRect();const occupied=collectOverlayBounds(frame);
 const markers=Array.from(container.querySelectorAll<HTMLElement>('.repair-pin,.trail-pin,.place-pin,.mission-pin,.mission-cluster')).filter(e=>!e.hidden);markers.sort((a,b)=>Number(b.classList.contains('is-selected')||b.classList.contains('repair-pin'))-Number(a.classList.contains('is-selected')||a.classList.contains('repair-pin'))||Number(b.classList.contains('place-pin'))-Number(a.classList.contains('place-pin'))||Number(b.classList.contains('trail-pin'))-Number(a.classList.contains('trail-pin')));
 for(const marker of markers){const r=marker.getBoundingClientRect(),w=r.width+10,h=r.height+10;const fit=findMarkerPosition(r.left-frame.left+r.width/2,r.top-frame.top+r.height/2,frame.width,frame.height,occupied,w,h);if(!fit){marker.hidden=true;continue;}marker.style.transform=`translate(${fit.x}px,${fit.y}px) translate(-50%,-50%)`;occupied.push({x:fit.x-w/2,y:fit.y-h/2,width:w,height:h});}
}
