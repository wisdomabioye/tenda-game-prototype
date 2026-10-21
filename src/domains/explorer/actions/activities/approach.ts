import {angleDelta} from '../../../../shared/motion/angles';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { createExplorer } from '../../character/createExplorer';
/** Shared last-metre approach for people and mobility aids; routes remain the district graph. */
export function stepApproach(actor: ReturnType<typeof createExplorer>, target: Vector3, dt: number, speed = 3.5, allowed: (from: Vector3, to: Vector3) => boolean = () => true) {
    const from = actor.root.position.clone(), delta = target.subtract(from), length = delta.length();
    if (length < .025)
        return 'arrived' as const;
    const next = from.add(delta.scale(Math.min(length, dt * speed) / length));
    if (!allowed(from, next))
        return 'blocked' as const;
    actor.root.position.copyFrom(next);
    const angle = Math.atan2(delta.x, delta.z);
    actor.root.rotation.y += angleDelta(actor.root.rotation.y,angle) * Math.min(1, dt * 9);
    return Vector3.Distance(next, target) < .025 ? 'arrived' as const : 'moving' as const;
}
