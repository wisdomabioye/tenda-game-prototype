import { Vector3 } from "@babylonjs/core/Maths/math.vector.js";
/** Move the camera opposite the dragged surface, in the current camera frame. */
export function panDelta(alpha: number, dx: number, dy: number, scale: number) {
    const right = new Vector3(-Math.sin(alpha), 0, Math.cos(alpha));
    const towardCamera = new Vector3(Math.cos(alpha), 0, Math.sin(alpha));
    return right.scale(-dx * scale).add(towardCamera.scale(-dy * scale));
}
/** Direct manipulation: the scene follows the finger in the close orbit view. */
export function lookDelta(dx: number, dy: number) {
    return { alpha: dx * 0.007, beta: dy * 0.005 };
}
export function twistDelta(previous: number, current: number) {
    let delta = current - previous;
    if (delta > Math.PI)
        delta -= Math.PI * 2;
    if (delta < -Math.PI)
        delta += Math.PI * 2;
    return delta;
}
