import {angleDelta} from '../../../shared/motion/angles';
import {traversableRoute} from '../../world/navigation/traversableRoute';
import { approachSpeed } from '../../world/navigation/movement';
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { createExplorer } from "./createExplorer";
import { distance, snapToStreet, type Point, type Segment, } from "../../world/navigation/routes";
export function createWalker(explorer: ReturnType<typeof createExplorer>, network: Segment[], reduced: boolean, resume: () => void, speed = 6, onRoute: (points: Point[]) => void = () => { }, onStart: () => void = () => { }) {
    const player = explorer.root;
    let total = 0, currentSpeed = 0;
    let traversable: (from: Point, to: Point) => boolean = () => true, onBlocked = () => { };
    let queue: Vector3[] = [], arrival: (() => void) | undefined;
    return {
        setTraversal: (check: (from: Point, to: Point) => boolean, blocked: () => void = () => { }) => { traversable = check; onBlocked = blocked; },
        cancel: () => { queue = []; currentSpeed = 0; arrival = undefined; onRoute([]); onStart(); },
        moveTo: (destination: Point, done?: () => void) => {
            arrival = undefined;
            onStart();
            const start=snapToStreet(player.position,network);
            const target=snapToStreet(destination,network);
            const route=traversableRoute(start,target,network,traversable);
            if(!route.length&&distance(start,target)>=.12){queue=[];currentSpeed=0;onRoute([]);onBlocked();return false;}
            if(distance(player.position,start)>.08)route.unshift(start);
            queue=route.map(p=>new Vector3(p.x,p.y,p.z));
            if (!queue.length && distance(player.position, snapToStreet(destination, network)) >= .12) {
                arrival = undefined;
                onRoute([]);
                return false;
            }
            total = [player.position, ...queue].slice(1).reduce((sum, p, i) => sum + Vector3.Distance(i ? queue[i - 1] : player.position, p), 0);
            arrival = done;
            resume();
            if (reduced && queue.length && queue.every((point, i) => traversable(i ? queue[i - 1] : player.position, point))) {
                player.position.copyFrom(queue.at(-1)!);
                queue = [];
            }
            onRoute(queue.length ? [{ x: player.position.x, y: player.position.y, z: player.position.z }, ...queue] : []);
            if (!queue.length) {
                const done=arrival;arrival=undefined;done?.();
            }
            return true;
        },
        update: (dt: number) => {
            if (queue.length) {
                const remaining = queue.reduce((sum, p, i) => sum + Vector3.Distance(i ? queue[i - 1] : player.position, p), 0);
                currentSpeed = approachSpeed(currentSpeed, Math.min(speed, Math.sqrt(2 * 16 * remaining)), dt);
                const delta = queue[0].subtract(player.position);
                if (delta.length() < 0.06) {
                    player.position.copyFrom(queue.shift()!);
                    if (!queue.length) {
                        onRoute([]);
                        const done=arrival;arrival=undefined;done?.();
                    }
                }
                else {
                    const distance = delta.length(), step = Math.min(distance, Math.min(dt, .05) * currentSpeed);
                    const candidate = player.position.add(delta.scale(step / distance));
                    if (traversable(player.position, candidate))
                        player.position.copyFrom(candidate);
                    else {
                        const close = queue.length === 1 && Vector3.Distance(player.position, queue[0]) < .8;
                        queue = [];
                        currentSpeed = 0;
                        onRoute([]);
                        const done = arrival;
                        arrival = undefined;
                        if (close)
                            done?.();
                        else
                            onBlocked();
                    }
                    const angle = Math.atan2(delta.x, delta.z), turn = angleDelta(player.rotation.y,angle);
                    player.rotation.y += turn * Math.min(1, dt * 12);
                }
            }
            if (!queue.length)
                currentSpeed = 0;
            explorer.animate(dt, currentSpeed, reduced);
        },
        get progress() { const remaining = queue.reduce((sum, p, i) => sum + Vector3.Distance(i ? queue[i - 1] : player.position, p), 0); return total ? Math.max(0, Math.min(1, 1 - remaining / total)) : 1; },
        get moving() {
            return queue.length > 0;
        },
    };
}
