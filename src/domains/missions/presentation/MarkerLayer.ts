import {captureScreenFrame} from '../../world/presentation/screenProjection';
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Engine } from "@babylonjs/core/Engines/engine";
import type { Scene } from "@babylonjs/core/scene";
import type { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { advanceExpansion, easeInOut } from "../../../shared/motion/easing";
import { markerFan } from "../../world/visibility/geometry";
import type { MissionMarker, View } from "../../world/runtime/contracts";
import type {VenueAnchor,LandmarkAnchor} from '../model/anchors';
export type {VenueAnchor,LandmarkAnchor} from '../model/anchors';
import type { MissionStop } from '../world/MissionStops';
/** Small box-anchored badges; full notices appear only after explicit expansion. */
export function createMarkerLayer(container: HTMLDivElement, canvas: HTMLCanvasElement, scene: Scene, engine: Engine, camera: ArcRotateCamera, venues: readonly VenueAnchor[], cityMissions: MissionMarker[], stops: readonly LandmarkAnchor[], reduced: boolean, options: {
    onVisit: (category: string, mission?: MissionMarker) => void;
    onLandmark: (landmark: LandmarkAnchor) => void;
    missionStops?: MissionStop[];
    player?: () => {
        x: number;
        y: number;
        z: number;
    };
}) {
    const definitions = options.missionStops ?? venues.map(v => ({ id: v.category, name: v.name, category: v.category, position: { x: v.x, y: v.h, z: v.z - 4 }, arrival: { x: v.x, y: v.h, z: v.z - 4 }, missionIds: cityMissions.filter(m => m.category === v.category).map(m => m.id) }));
    let expanded: string | undefined;
    const groups = definitions.map(stop => {
        const items = stop.missionIds.flatMap(id => { const m = cityMissions.find(m => m.id === id); return m ? [m] : []; });
        const badge = document.createElement('button');
        badge.className = 'mission-cluster mission-box-badge';
        badge.title = `Mission box · ${stop.name}`;
        const activate = () => { if (items.length === 1)
            options.onVisit(items[0].category, items[0]);
        else
            expanded = expanded === stop.id ? undefined : stop.id; };
        badge.onclick = activate;
        container.append(badge);
        const pins = items.map((mission, i) => { const el = document.createElement('button'); el.className = 'mission-pin'; el.dataset.missionId = mission.id; el.textContent = String(i + 1); el.title = mission.title; el.setAttribute('aria-label', `Walk to ${mission.title} at ${stop.name}`); el.onclick = () => { expanded = undefined; options.onVisit(mission.category, mission); }; container.append(el); return el; });
        return { stop, items, badge, pins, activate, progress: 0 };
    });
    const landmarks = stops.map(stop => { const el = document.createElement('button'); el.className = 'landmark-label'; el.textContent = stop.name; el.setAttribute('aria-label', `Walk to ${stop.name}`); el.onclick = () => options.onLandmark(stop); container.append(el); return { stop, el }; });

    return { collapse() { expanded = undefined; }, open(id: string) { groups.find(g => g.stop.id === id)?.activate(); }, update(dt: number, mode: View) {
            const {project}=captureScreenFrame(canvas,scene,engine,camera);
            for (const group of groups) {
                const { stop, items, badge, pins } = group, p = project(new Vector3(stop.position.x, stop.position.y + 1.2, stop.position.z));
                const selected = items.find(m => m.id === container.dataset.selectedMission), player = options.player?.();
                const near = !player || Math.hypot(player.x - stop.position.x, player.z - stop.position.z) < 18;
                const visible = p.z >= 0 && p.z <= 1 && p.x > 24 && p.x < p.width - 24 && p.y > 125 && p.y < p.height - 170 && (mode !== 'look' || near || Boolean(selected));
                const open = expanded === stop.id && items.length > 1;
                badge.hidden = !visible || !items.length;
                badge.textContent = open ? '×' : items.length > 1 ? String(items.length) : '▣';
                badge.setAttribute('aria-label', open ? 'Collapse mission notices' : items.length === 1 ? `Walk to ${items[0].title} at ${stop.name}` : `Expand ${items.length} mission notices at ${stop.name}`);
                badge.setAttribute('aria-expanded', String(open));
                badge.classList.toggle('is-selected', Boolean(selected));
                if (selected)
                    badge.dataset.missionId = selected.id;
                else {
                    delete badge.dataset.missionId;
                    badge.removeAttribute('aria-current');
                }
                badge.style.transform = `translate(${p.x}px,${p.y}px) translate(-50%,-50%)`;
                group.progress = advanceExpansion(group.progress, open, dt, reduced);
                const amount = easeInOut(group.progress), fan = markerFan(p.x, items.length, p.width);
                pins.forEach((el, i) => { el.hidden = !visible || group.progress === 0; el.style.opacity = String(amount); el.style.pointerEvents = open ? 'auto' : 'none'; el.setAttribute('aria-hidden', String(!open)); el.tabIndex = open ? 0 : -1; el.style.transform = `translate(${p.x + (fan[i] - p.x) * amount}px,${p.y - 50 * amount}px) translate(-50%,-100%) scale(${.65 + .35 * amount})`; });
            }
            for (const { stop, el } of landmarks) {
                const p = project(new Vector3(stop.x, stop.y, stop.z));
                el.hidden = mode !== 'overview' || p.z < 0 || p.z > 1 || p.x < 65 || p.x > p.width - 65 || p.y < 145 || p.y > p.height - 175;
                let angle = 0;
                if (stop.direction) {
                    const q = project(new Vector3(stop.x + stop.direction.x, stop.y, stop.z + stop.direction.z));
                    angle = Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI;
                    if (angle > 90)
                        angle -= 180;
                    if (angle < -90)
                        angle += 180;
                }
                el.style.transform = `translate(${p.x}px,${p.y}px) translate(-50%,-50%) rotate(${angle}deg)`;
            }
        }, dispose() { for (const g of groups) {
            g.badge.remove();
            g.pins.forEach(p => p.remove());
        } landmarks.forEach(l => l.el.remove()); } };
}
