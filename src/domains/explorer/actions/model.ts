export function cameraMovement(alpha: number, x: number, z: number) { const length = Math.hypot(x, z); if (!length)
    return { x: 0, z: 0 }; return { x: (-Math.sin(alpha) * x - Math.cos(alpha) * z) / length, z: (Math.cos(alpha) * x - Math.sin(alpha) * z) / length }; }
