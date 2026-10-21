import {pickWorld} from './picking';
import type { WorldSettings } from "../districts/shared/types";
import type { Scene } from "@babylonjs/core/scene";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { panDelta, lookDelta, twistDelta } from "./gestures";
import type { CameraController } from "../camera/controller";
import type { Point } from "../navigation/routes";
export function bindPointerInput(canvas: HTMLCanvasElement, scene: Scene, controller: CameraController, options: {
    largeGround: boolean;
    settings: WorldSettings;
    onTap: (point: Point) => void;
    onPick?: (x:number,y:number) => boolean;
    onDrag: () => void;
}) {
    const camera = controller.camera, points = new Map<number, {
        x: number;
        y: number;
    }>();
    let last = { x: 0, y: 0, d: 0, a: 0 }, down = { x: 0, y: 0 }, dragged = false, multi = false;
    const sample = () => {
        const ps = [...points.values()], a = ps[0], b = ps[1] ?? a;
        return {
            x: (a.x + b.x) / 2,
            y: (a.y + b.y) / 2,
            d: Math.hypot(a.x - b.x, a.y - b.y),
            a: Math.atan2(b.y - a.y, b.x - a.x),
        };
    };
    const downFn = (e: PointerEvent) => {
        controller.interrupt();
        canvas.setPointerCapture(e.pointerId);
        points.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (points.size === 1) {
            down = { x: e.clientX, y: e.clientY };
            dragged = false;
            multi = false;
        }
        else
            multi = true;
        last = sample();
    };
    const moveFn = (e: PointerEvent) => {
        if (!points.has(e.pointerId))
            return;
        points.set(e.pointerId, { x: e.clientX, y: e.clientY });
        const now = sample();
        if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 9)
            dragged = true;
        if (dragged)
            options.onDrag();
        if (!dragged && !multi)
            return;
        const dx = now.x - last.x, dy = now.y - last.y;
        if (points.size === 2) {
            camera.radius = Math.min(camera.upperRadiusLimit ?? 160, Math.max(12, (camera.radius * last.d) / Math.max(1, now.d)));
            camera.alpha += twistDelta(last.a, now.a);
        }
        if (controller.mode === "look" && points.size === 1) {
            const delta = lookDelta(dx, dy);
            camera.alpha += delta.alpha;
            camera.beta = Math.min(1.48, Math.max(0.3, camera.beta + delta.beta));
        }
        else {
            controller.detach();
            camera.target.addInPlace(panDelta(camera.alpha, dx, dy, camera.radius * 0.0018));
            camera.target.x = Math.max(options.settings.pan.minX, Math.min(options.settings.pan.maxX, camera.target.x));
            camera.target.z = Math.max(options.settings.pan.minZ, Math.min(options.settings.pan.maxZ, camera.target.z));
        }
        last = now;
    };
    const upFn = (e: PointerEvent) => {
        if (!points.has(e.pointerId))
            return;
        points.delete(e.pointerId);
        if (e.type === "pointerup" && !dragged && !multi) {
            const rect = canvas.getBoundingClientRect();
            if(options.onPick?.(e.clientX-rect.left,e.clientY-rect.top))return;
            const pick = pickWorld(scene,e.clientX - rect.left, e.clientY - rect.top, (m) => m === ground);
            if (pick?.pickedPoint)
                options.onTap(pick.pickedPoint);
        }
        if (points.size)
            last = sample();
    };
    const ground = MeshBuilder.CreateGround("walk surface", {
        width: options.settings.ground.width,
        height: options.settings.ground.depth,
    }, scene);
    ground.position.copyFromFloats(options.settings.ground.center.x, options.settings.ground.center.y, options.settings.ground.center.z);
    ground.visibility = 0;
    ground.isPickable = true;
    const wheel = (e: WheelEvent) => {
        e.preventDefault();
        controller.zoom(e.deltaY * 0.035);
    };
    canvas.addEventListener("pointerdown", downFn);
    canvas.addEventListener("pointermove", moveFn);
    canvas.addEventListener("pointerup", upFn);
    canvas.addEventListener("pointercancel", upFn);
    canvas.addEventListener("lostpointercapture", upFn);
    canvas.addEventListener("wheel", wheel, { passive: false });
    return {
        dispose: () => {
            canvas.removeEventListener("pointerdown", downFn);
            canvas.removeEventListener("pointermove", moveFn);
            canvas.removeEventListener("pointerup", upFn);
            canvas.removeEventListener("pointercancel", upFn);
            canvas.removeEventListener("lostpointercapture", upFn);
            canvas.removeEventListener("wheel", wheel);
            for (const id of points.keys())
                if (canvas.hasPointerCapture(id))
                    canvas.releasePointerCapture(id);
            points.clear();
            ground.dispose();
        },
    };
}
