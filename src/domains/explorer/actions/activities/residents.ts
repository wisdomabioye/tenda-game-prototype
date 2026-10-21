import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { createExplorer } from '../../character/createExplorer';
import { cityHuman } from '../../character/humanKit';
import { createWalker } from '../../character/walker';
import type { AssetContext } from '../../../world/assets/core/context';
import { createBench } from '../../../world/assets/furniture';
import { distance, snapToStreet, type Point, type Segment } from '../../../world/navigation/routes';
import type { createActivityStations } from './stations';
import { freshActivity, beginActivity, tickActivity } from './state';
import { animateActivity } from './poses';
import { createActivityItem } from './props';
import { chooseActivityPlacement } from './placement';
import type { Solid } from '../../../world/navigation/movement';
import { stepApproach } from './approach';
type Routine = 'wait' | 'walk-counter' | 'approach-counter' | 'service' | 'walk-seat' | 'approach-seat' | 'eat' | 'stand' | 'leave';
/** Bounded visible routines share the player's clock, sockets, rig and item-transfer animation. */
export function createActivityResidents(ctx: AssetContext, network: Segment[], kit: ReturnType<typeof createActivityStations>, player: () => Point, reduced: () => boolean, occupied: Solid[] = []) {
    const stall = kit.stations.find(s => s.id === 'food')!;
    const vendor = createExplorer(ctx.scene, ctx.material, cityHuman(21), 'standing', 'crowd');
    vendor.root.name = 'food vendor';
    const outward = { x: Math.sin(stall.facing), z: Math.cos(stall.facing) }, side = { x: Math.cos(stall.facing), z: -Math.sin(stall.facing) };
    vendor.root.position.set(stall.arrival.x + outward.x * 2.6, stall.arrival.y, stall.arrival.z + outward.z * 2.6);
    vendor.root.rotation.y = stall.facing + Math.PI;
    let serve = 0;
    const reserved = kit.stations.map(s => s.arrival);
    const people = Array.from({ length: 3 }, (_, i) => {
        const actor = createExplorer(ctx.scene, ctx.material, cityHuman(i + 16), 'standing', 'crowd');
        actor.root.name = `food customer ${i + 1}`;
        const home = snapToStreet({ x: stall.arrival.x + side.x * (6 + i * 3), y: stall.arrival.y, z: stall.arrival.z + side.z * (6 + i * 3) }, network);
        actor.root.position.set(home.x, home.y, home.z);
        const walker = createWalker(actor, network, false, () => { }, 1.65 + i * .15), item = createActivityItem(ctx, 'food', `resident ${i} meal`);
        item.setEnabled(false);
        const frame = chooseActivityPlacement(network, home, [...occupied, ...kit.solids()], reserved);
        reserved.push(frame.arrival);
        const seat = new Vector3(frame.arrival.x + frame.normal.x * 2.1, frame.arrival.y, frame.arrival.z + frame.normal.z * 2.1);
        const bench = createBench(ctx, { id: `physical/customer-bench-${i}`, position: { x: seat.x, y: seat.y + .16, z: seat.z }, rotationY: frame.angle });
        return { actor, walker, item, bench, home, seat, exit: new Vector3(frame.arrival.x + frame.normal.x * .5, frame.arrival.y, frame.arrival.z + frame.normal.z * .5), seatFacing: frame.angle + Math.PI, state: freshActivity(), stage: 'wait' as Routine, delay: 3 + i * 8 };
    });
    let active = true;
    return {
        order() { serve = 2.5; }, setEnabled(value: boolean) { active = value; },
        update(dt: number) {
            serve = Math.max(0, serve - dt);
            vendor.setAction(serve ? 'reach' : 'idle');
            vendor.animate(dt, 0, reduced());
            if (!active || reduced())
                return;
            for (const p of people) {
                const playerUsingCounter = distance(player(), stall.arrival) < 3.5;
                if (p.stage === 'wait') {
                    p.delay -= dt;
                    if (p.delay <= 0 && !playerUsingCounter && !people.some(o => o !== p && ['walk-counter', 'approach-counter', 'service'].includes(o.stage))) {
                        p.stage = 'walk-counter';
                        if (!p.walker.moveTo(stall.arrival, () => { p.stage = 'approach-counter'; })) {
                            p.stage = 'wait';
                            p.delay = 4;
                        }
                    }
                }
                if (p.stage === 'approach-counter') {
                    if (playerUsingCounter)
                        continue;
                    if (stepApproach(p.actor, stall.stand, dt) === 'arrived') {
                        p.stage = 'service';
                        p.state = beginActivity(p.state, 'ordering');
                        p.actor.root.rotation.y = stall.facing;
                        serve = 2.5;
                    }
                }
                else if (p.stage === 'service') {
                    p.state = tickActivity(p.state, dt);
                    if (p.state.action === 'food') {
                        p.stage = 'walk-seat';
                        p.walker.moveTo(snapToStreet(p.exit, network), () => { p.stage = 'approach-seat'; });
                    }
                }
                else if (p.stage === 'approach-seat') {
                    if (stepApproach(p.actor, p.seat, dt) === 'arrived') {
                        p.actor.root.rotation.y = p.seatFacing;
                        p.stage = 'eat';
                        p.state = beginActivity(p.state, 'eating');
                    }
                }
                else if (p.stage === 'eat') {
                    p.state = tickActivity(p.state, dt);
                    if (p.state.action === 'idle') {
                        p.stage = 'stand';
                        p.item.setEnabled(false);
                    }
                }
                else if (p.stage === 'stand') {
                    if (stepApproach(p.actor, p.exit, dt) === 'arrived') {
                        p.stage = 'leave';
                        p.walker.moveTo(p.home, () => { p.stage = 'wait'; p.delay = 10; });
                    }
                }
                const approaching = ['approach-counter', 'approach-seat', 'stand'].includes(p.stage);
                if (['walk-counter', 'walk-seat', 'leave', 'wait'].includes(p.stage))
                    p.walker.update(dt);
                animateActivity(p.actor, p.state, approaching || ['service', 'eat'].includes(p.stage) ? dt : 0, false, { food: p.item, parcelRest: stall.objectRest, foodRest: stall.objectRest }, approaching ? 2 : p.walker.moving ? 1.7 : 0);
            }
        }, get counts() { return { vendor: 1, customers: 3, meals: people.reduce((sum,p)=>sum+p.state.meals,0) }; }, solids: () => people.flatMap(p => p.bench.collisions()),
        dispose() { vendor.root.dispose(false, false); for (const p of people) {
            p.actor.root.dispose(false, false);
            p.item.dispose();
            p.bench.dispose();
        } }
    };
}
