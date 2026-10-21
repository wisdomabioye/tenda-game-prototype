import {angleDelta} from '../../../shared/motion/angles';
import {actorInputBlocked} from './inputPolicy';
import '@babylonjs/core/Rendering/edgesRenderer';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import type { AssetContext } from '../../world/assets/core/context';
import type { createExplorer } from '../character/createExplorer';
import type { createWalker } from '../character/walker';
import { snapToStreet, distance, type Point, type Segment } from '../../world/navigation/routes';
import { steerOnStreet } from '../../world/navigation/steering';
import { approachSpeed, canTraverse } from '../../world/navigation/movement';
import { cameraMovement } from './model';
import { activityDurations,beginActivity, freshActivity, interruptActivity, tickActivity, hasParcel, hasFood, isBusy, type ActivityState } from './activities/state';
import { createActivityStations, type StationId } from './activities/stations';
import { animateActivity } from './activities/poses';
import { activityStorage } from './persistence/activitySave';
import { createActivityItem } from './activities/props';
import { stepApproach } from './activities/approach';
import { createActivityResidents } from './activities/residents';
import type {ActorSnapshot,PhysicalOptions} from './contracts';
export type {ActorSnapshot,PhysicalOptions} from './contracts';
/** Scene composition only: station kit, reusable activity machine, movement and local persistence. */
export function createPhysicalActions(ctx: AssetContext, actor: ReturnType<typeof createExplorer>, walker: ReturnType<typeof createWalker>, camera: ArcRotateCamera, network: Segment[], spawn: Point, reduced: () => boolean, home: () => void, onStart: () => void, options: PhysicalOptions = {}) {
    const kit = createActivityStations(ctx, network, spawn, options.solids?.() ?? []), station = (id: StationId) => kit.stations.find(s => s.id === id)!;
    const parcel = createActivityItem(ctx, 'parcel', 'physical carry parcel');
    parcel.isPickable = true;
    const food = createActivityItem(ctx, 'food', 'meal bowl');
    food.setEnabled(false);
    const props = { parcel, food, parcelRest: station('parcel').objectRest, foodRest: station('food').objectRest };
    let storage = options.storage;
    if (!storage)
        try {
            storage = globalThis.localStorage;
        }
        catch { /* Storage may be disabled; play still works. */ }
    const saves = activityStorage(options.districtId ?? 'default', storage);
    let pending: ActivityState | null = null;
    let state = freshActivity(), paused = false, manual = false, speed = 0, clock = 0, saveClock = 0, saved = false;
    let hint = 'WASD / arrows move · Shift runs · E interacts', approach: StationId | null = null;
    let alignment: {
        point: Vector3;
        done: () => void;
        seating?: boolean;
    } | null = null;
    const keys = new Set<string>(), solids = () => [...(options.solids?.() ?? []), ...kit.solids(), ...(residents?.solids() ?? [])];
    const radius = () => actor.mobility === 'wheelchair' ? .65 : .36;
    walker.setTraversal((from, to) => canTraverse(from, to, solids(), radius()), () => { hint = 'Route blocked by furniture. Choose a clear approach.'; approach = null; });
    const residents = createActivityResidents(ctx, network, kit, () => actor.root.position, reduced, options.solids?.() ?? []);
    
    const nearest = () => kit.stations.filter(s => distance(actor.root.position, s.arrival) < 2.4).sort((a, b) => distance(actor.root.position, a.arrival) - distance(actor.root.position, b.arrival))[0];
    const save = () => { saved = saves.save({ version: 1, activity: state, pending, position: { x: actor.root.position.x, y: actor.root.position.y, z: actor.root.position.z }, rotation: actor.root.rotation.y }); };
    const change = (action: ActivityState['action']) => { state = beginActivity(state, action); save(); };
    const restore = saves.load();
    if (restore) {
        const lane = snapToStreet(restore.position, network);
        if (distance(lane, restore.position) < 5) {
            state = restore.activity;
            pending = restore.pending ?? null;
            actor.root.position.set(lane.x, lane.y, lane.z);
            actor.root.rotation.y = restore.rotation;
            const id = state.action === 'sitting' || state.action === 'eating' ? 'seat' : ['picking', 'placing'].includes(state.action) ? 'parcel' : ['ordering', 'receiving'].includes(state.action) ? 'food' : null;
            if (id) {
                const s = station(id);
                actor.root.position.copyFrom((state.action === 'sitting' || state.action === 'eating') && actor.mobility !== 'wheelchair' ? s.seat : s.stand);
                actor.root.rotation.y = s.facing + (id === 'seat' ? Math.PI : 0);
            }
            paused = state.action !== 'idle' || Boolean(pending);
            hint = paused ? 'Activity restored. Resume when ready.' : 'Your place is saved. Ready to explore.';
            saved = true;
        }
    }
    const prompt = () => {
        if (state.action === 'sitting')
            return 'Stand up';
        if (state.action === 'eating')
            return 'Keep meal for later';
        if (isBusy(state))
            return '';
        const near = nearest();
        if (hasParcel(state))
            return near?.id === 'parcel' ? 'Place parcel' : '';
        if (hasFood(state))
            return near?.id === 'seat' ? 'Sit and eat' : 'Take meal to bench';
        return near?.id === 'seat' ? (actor.mobility === 'wheelchair' ? 'Rest beside bench' : 'Sit on bench') : near?.id === 'parcel' ? 'Pick up parcel' : near?.id === 'food' ? 'Order a meal' : '';
    };
    const standUp = () => {
        if (isBusy(state) && state.action !== 'eating')
            pending = { ...state };
        const wasSeated = ['sitting', 'eating'].includes(state.action);
        state = interruptActivity(state);
        alignment = null;
        approach = null;
        if (wasSeated && actor.mobility !== 'wheelchair')
            alignment = { point: station('seat').stand.clone(), done: () => { } };
        if (!wasSeated) {
            const lane=snapToStreet(actor.root.position,network);
            if(distance(actor.root.position,lane)>.08)alignment={point:new Vector3(lane.x,lane.y,lane.z),done:()=>{}};
        }
        actor.setAction(hasParcel(state) || hasFood(state) ? 'carry' : 'idle');
        save();
    };
    const face = (id: StationId) => actor.root.rotation.y = station(id).facing + (id === 'seat' ? Math.PI : 0);
    const perform = (id: StationId) => {
        approach = null;
        face(id);
        if (id === 'seat') {
            if (hasParcel(state)) {
                hint = 'Place the parcel before sitting.';
                return;
            }
            const action = hasFood(state) ? 'eating' : 'sitting';
            if (actor.mobility === 'wheelchair') {
                change(action);
                return;
            }
            actor.setAction('sit');
            alignment = { point: station('seat').seat.clone(), seating: true, done: () => {face(id);change(action);} };
        }
        else if (id === 'parcel') {
            if (pending && ['picking', 'placing'].includes(pending.action)) {
                state = pending;
                pending = null;
                save();
            }
            else
                change(hasParcel(state) ? 'placing' : 'picking');
            hint = hasParcel(state) ? 'Lowering the parcel onto the table…' : 'Reaching, then lifting the parcel…';
        }
        else {
            if (pending && ['ordering', 'receiving'].includes(pending.action)) {
                state = pending;
                pending = null;
                save();
            }
            else
                change('ordering');
            hint = 'The vendor is preparing your meal.';
            residents.order();
        }
    };
    const visit = (id: StationId) => {
        if (paused || actorInputBlocked())
            return;
        if (hasParcel(state) && id !== 'parcel') {
            hint = 'Place the parcel before starting another activity.';
            return;
        }
        if (hasFood(state) && id !== 'seat') {
            hint = 'Take your meal to the bench, or keep exploring.';
            return;
        }
        onStart();
        standUp();
        approach = id;
        const s = station(id);
        const arrived = () => { if (approach !== id)
            return; alignment = { point: s.stand.clone(), done: () => perform(id) }; };
        if (distance(actor.root.position, s.stand) < .12) {
            walker.cancel();
            approach = id;
            perform(id);
        }
        else if (distance(actor.root.position, s.arrival) < 1) {
            walker.cancel();
            approach = id;
            alignment = { point: new Vector3(s.arrival.x, s.arrival.y, s.arrival.z), done: arrived };
        }
        else if (!walker.moveTo(s.arrival, () => { approach = id; arrived(); })) {
            approach = null;
            hint = 'This approach is blocked. Try another direction.';
        }
    };
    const interact = () => {
        if (paused || actorInputBlocked())
            return;
        if (['sitting', 'eating'].includes(state.action)) {
            standUp();
            hint = 'Activity kept. Ready to explore.';
            return;
        }
        if (isBusy(state))
            return;
        if (hasFood(state)) {
            visit('seat');
            return;
        }
        const near = nearest();
        if (near)
            visit(near.id);
    };
    const syncProps = (dt: number, movementSpeed = 0, seating = false) => { animateActivity(actor, state, dt, reduced(), props, movementSpeed, seating); if (state.action === 'food' || state.action === 'eating')
        food.scaling.set(.43 * (.5 + state.mealRemaining / (2*activityDurations.eating)), .22, .43 * (.5 + state.mealRemaining / (2*activityDurations.eating))); };
    syncProps(restore&&state.action!=='idle'?1:0);
    return {
        refreshPose:()=>syncProps(1),
        ownedSolids:()=>[...kit.solids(),...residents.solids()],
        targets: [...kit.targets, [parcel, 'parcel'] as const], visit, seat: station('seat').arrival, tablePoint: station('parcel').arrival,
        leaveSeat: () => { if (state.action==='sitting'||isBusy(state))
            standUp();
        else if (!manual)
            approach = null; }, input: (key: string, down: boolean) => { if (down)
            keys.add(key);
        else
            keys.delete(key); }, interact,
        setActivity: residents.setEnabled, clearInput: () => keys.clear(), setPaused: (next: boolean) => { if(paused&&!next)hint='Ready to explore.';paused = next; keys.clear(); speed = 0; save(); }, togglePause() { paused = !paused; keys.clear(); speed = 0; save(); }, get paused() { return paused; },
        state: (): ActorSnapshot => ({ action: state.action, paused, prompt: prompt(), hint, nearby: nearest()?.label, progress: state.action === 'eating' ? 1 - state.mealRemaining / activityDurations.eating : undefined, saved }),
        update(dt: number) {
            dt = Math.min(dt, .05);
            if (paused || document.hidden || actorInputBlocked()) {
                keys.clear();
                speed = 0;
                return true;
            }
            clock += dt;
            saveClock += dt;
            if (saveClock > 1) {
                saveClock = 0;
                save();
            }
            residents.update(dt);
            kit.highlight(nearest()?.id ?? null, reduced(), clock);
            const x = Number(keys.has('d') || keys.has('arrowright')) - Number(keys.has('a') || keys.has('arrowleft')), z = Number(keys.has('w') || keys.has('arrowup')) - Number(keys.has('s') || keys.has('arrowdown'));
            if ((x || z) && !manual) {
                standUp();
                walker.cancel();
                onStart();
                home();
                manual = true;
            }
            if (alignment) {
                const task = alignment, result = stepApproach(actor, task.point, dt, 3.5, task.seating ? undefined : (from, to) => canTraverse(from, to, solids(), radius()));
                if (result === 'blocked') {
                    alignment = null;
                    approach = null;
                    hint = 'Approach blocked. Move around the furniture.';
                    return true;
                }
                syncProps(dt, result === 'moving' ? 3.5 : 0, Boolean(task.seating));
                if (result === 'arrived') {
                    alignment = null;
                    task.done();
                }
                return true;
            }
            if (isBusy(state)) {
                const before = state.action;
                state = tickActivity(state, dt);
                syncProps(dt);
                if (before !== state.action) {
                    if (before === 'eating' && state.action === 'idle' && actor.mobility !== 'wheelchair')
                        alignment = { point: station('seat').stand.clone(), done: () => { } };
                    save();
                    hint = state.action === 'carrying' ? 'Parcel lifted. Return here to place it.' : state.action === 'food' ? 'Meal received. Use E or Bench to sit and eat.' : state.action === 'idle' ? 'Finished. Ready for another adventure.' : hint;
                }
                return true;
            }
            speed = approachSpeed(speed, (x || z) ? keys.has('shift') ? 9 : 5 : 0, dt);
            if (x || z || speed > .01) {
                const move = x || z ? cameraMovement(camera.alpha, x, z) : { x: Math.sin(actor.root.rotation.y), z: Math.cos(actor.root.rotation.y) };
                const from = actor.root.position.clone(), next = steerOnStreet(from, move, speed * dt, network);
                if (canTraverse(from, next, solids(), radius())) {
                    actor.root.position.set(next.x, next.y, next.z);
                    const angle = Math.atan2(next.x - from.x, next.z - from.z);
                    if (distance(from, next) > .001)
                        actor.root.rotation.y += angleDelta(actor.root.rotation.y,angle) * Math.min(1, dt * 9);
                }
                else {
                    speed = 0;
                    hint = 'Furniture ahead — choose a clear path.';
                }
                syncProps(dt, speed);
                if (!x && !z && speed < .01)
                    manual = false;
                return true;
            }
            manual = false;
            if (!walker.moving)
                syncProps(dt);
            else
                syncProps(0);
            return state.action === 'sitting';
        }, dispose() { save(); keys.clear(); walker.setTraversal(() => true); residents.dispose(); kit.dispose(); parcel.dispose(); food.dispose(); }
    };
}
