import {findMarkerPosition} from '../../../shared/ui/markerLayout';
import {captureScreenFrame} from '../../world/presentation/screenProjection';
import {collectOverlayBounds} from '../../../shared/ui/overlayBounds';
import type { Scene } from '@babylonjs/core/scene';
import type { Engine } from '@babylonjs/core/Engines/engine';
import type { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import type { WorldPlace } from '../model';
export function createPlaceMarkers(container: HTMLDivElement, canvas: HTMLCanvasElement, scene: Scene, engine: Engine, camera: ArcRotateCamera, places: WorldPlace[], onInspect: (id: string) => void) {
    const markers = places.map(place => {
        const el = document.createElement('button');
        el.className = 'place-pin';el.dataset.placeId=place.id;
        el.textContent = place.type==='shop'?'▣':place.type==='landmark'?'✦':place.type === 'restaurant' ? '♨' : place.type === 'mall' ? '▦' : '▥';
        el.title = place.name;
        el.setAttribute('aria-label', `Inspect ${place.name}`);
        el.onclick = () => onInspect(place.id);
        container.append(el);
        return { el, place };
    });
    return { update() { const frame=captureScreenFrame(canvas,scene,engine,camera),rect=frame.rect;const occupied=collectOverlayBounds(rect,'.trail-pin');for (const { el, place } of markers) {
            const a=place.arrival,p=frame.project({x:a.x,y:1.5,z:a.z}),{x,y}=p;
            const fitted=findMarkerPosition(x,y,rect.width,rect.height,occupied);
            el.hidden = !fitted || p.z < 0 || p.z > 1 || x < 28 || x > rect.width - 28 || y < 145 || y > rect.height - 190;
            if(!el.hidden&&fitted)occupied.push({x:fitted.x-24,y:fitted.y-24,width:48,height:48});
            el.style.transform = `translate(${fitted?.x??x}px,${fitted?.y??y}px) translate(-50%,-50%)`;
        } }, dispose() { markers.forEach(m => m.el.remove()); } };
}
