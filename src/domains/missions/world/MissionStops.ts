import { createAsset } from '../../world/assets/core/asset';
import type { AssetContext } from '../../world/assets/core/context';
import { chooseRoadsidePlacement } from '../../world/navigation/roadsidePlacement';
import type { Solid } from '../../world/navigation/movement';
import type { Point, Segment } from '../../world/navigation/routes';
import type { MissionMarker } from '../../world/runtime/contracts';
import type { VenueAnchor } from '../model/anchors';
export interface MissionStop {
    id: string;
    name: string;
    category: string;
    position: Point;
    arrival: Point;
    missionIds: string[];
}
/** Presentation stops never overwrite mission coordinates or eligibility data. */
export function createMissionStops(ctx: AssetContext, network: Segment[], venues: readonly VenueAnchor[], occupied: () => Solid[]) {
    const stops = new Map<string, {
        stop: MissionStop;
        asset: ReturnType<typeof createAsset>;
    }>();
    const keyFor = (m: MissionMarker) => m.position ? `place/${m.position.x.toFixed(2)}/${m.position.y.toFixed(2)}/${m.position.z.toFixed(2)}` : `venue/${m.category}`;
    return {
        setMissions(missions: MissionMarker[]) {
            const groups = new Map<string, MissionMarker[]>();
            for (const mission of missions) {
                const key = keyFor(mission);
                groups.set(key, [...(groups.get(key) ?? []), mission]);
            }
            for (const [key, value] of stops)
                if (!groups.has(key)) {
                    value.asset.dispose();
                    stops.delete(key);
                }
            for (const [id, items] of groups) {
                const current = stops.get(id);
                if (current) {
                    current.stop.missionIds = items.map(m => m.id);
                    continue;
                }
                const first = items[0], venue = venues.find(v => v.category === first.category);
                if (!first.position && !venue)
                    continue;
                const desired = first.position ?? { x: venue!.x, y: venue!.h, z: venue!.z - 4 };
                const frame = chooseRoadsidePlacement(network, desired, occupied(), [...stops.values()].map(s => s.stop.arrival), { range: 12, spacing: 2.5, radius: .55, start: 2.1, end: 2.7, clearance: 2.15 });
                const position = { x: frame.arrival.x + frame.normal.x * 2.4, y: frame.arrival.y, z: frame.arrival.z + frame.normal.z * 2.4 };
                const asset = createAsset(ctx, { id: `mission-box/${id}`, position: { ...position, y: position.y + .16 }, rotationY: frame.angle }, g => {
                    g.box('parcel box pedestal', 0, 0, 0, .5, .25, .48, '#496b6d');
                    g.box('mission parcel box', 0, .25, 0, .78, .72, .62, '#bd8051');
                    g.box('parcel box lid', 0, .97, 0, .88, .1, .7, '#fff0ce');
                    g.box('mission collection slot', 0, .77, -.318, .48, .08, .025, '#344c68');
                    g.box('parcel band', 0, .27, -.32, .14, .65, .035, '#fff0ce');
                }, { collision: [{ min: { x: -.4, y: 0, z: -.32 }, max: { x: .4, y: 1.1, z: .32 } }] });
                stops.set(id, { stop: { id, name: first.placeName ?? venue?.name ?? 'Mission box', category: first.category, position, arrival: frame.arrival, missionIds: items.map(m => m.id) }, asset });
            }
        }, get stops() { return [...stops.values()].map(s => s.stop); }, forMission(id: string) { return [...stops.values()].find(s => s.stop.missionIds.includes(id))?.stop; },
        get targets() { return [...stops.values()].flatMap(s => s.asset.meshes.map(mesh => [mesh, s.stop.id] as const)); },
        solids: () => [...stops.values()].flatMap(s => s.asset.collisions()),
        dispose() { for (const s of stops.values())
            s.asset.dispose(); stops.clear(); }
    };
}
