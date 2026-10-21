import {easeInOut} from '../../../../shared/motion/easing';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';
import type { createExplorer } from '../../character/createExplorer';
import { activityDurations, type ActivityState } from './state';
export const easeActivity = easeInOut;
/** Object transfer and skeletal pose are driven by the same interruptible clock. */
export function animateActivity(actor: ReturnType<typeof createExplorer>, state: ActivityState, dt: number, reduced: boolean, props: {
    parcel?: AbstractMesh;
    food?: AbstractMesh;
    parcelRest: Vector3;
    foodRest: Vector3;
}, speed = 0, seating = false) {
    const action = state.action;
    const parcelT = action === 'picking' ? easeActivity((state.elapsed / activityDurations.picking - .25) / .75) : action === 'placing' ? 1 - easeActivity(state.elapsed / activityDurations.placing) : action === 'carrying' ? 1 : 0;
    const foodT = action === 'receiving' ? easeActivity((state.elapsed / activityDurations.receiving - .25) / .75) : action === 'food' || action === 'eating' ? 1 : 0;
    actor.grip.computeWorldMatrix(true);
    const beforeGrip = actor.grip.getAbsolutePosition();
    const rest = action === 'receiving' ? props.foodRest : props.parcelRest, t = action === 'receiving' ? foodT : parcelT;
    const contact = rest.subtract(new Vector3(Math.sin(actor.root.rotation.y) * .23, 0, Math.cos(actor.root.rotation.y) * .23));
    actor.setHandTarget(['picking', 'placing', 'receiving'].includes(action) ? Vector3.Lerp(contact, beforeGrip, t) : ['carrying', 'food'].includes(action) ? beforeGrip : null);
    actor.setAction(seating ? 'sit' : action === 'eating' ? 'eat' : action === 'sitting' ? 'sit' : ['picking', 'placing', 'receiving'].includes(action) ? 'reach' : ['carrying', 'food'].includes(action) ? 'carry' : 'idle');
    actor.animate(dt, speed, reduced);
    actor.grip.computeWorldMatrix(true);
    const grip = actor.grip.getAbsolutePosition();
    const move = (mesh: AbstractMesh | undefined, rest: Vector3, kind: 'parcel' | 'food') => { if (!mesh)
        return; let t = 0; if (kind === 'parcel') {
        if (action === 'carrying')
            t = 1;
        if (action === 'picking' || action === 'placing')
            t = parcelT;
    }
    else {
        if (action === 'food' || action === 'eating')
            t = 1;
        if (action === 'receiving')
            t = foodT;
        mesh.setEnabled(['receiving', 'food', 'eating'].includes(action));
    } mesh.position.copyFrom(Vector3.Lerp(rest, grip, t)); mesh.rotation.y = t ? actor.root.rotation.y : 0; };
    move(props.parcel, props.parcelRest, 'parcel');
    move(props.food, props.foodRest, 'food');
}
