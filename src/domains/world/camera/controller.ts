import {angleDelta} from '../../../shared/motion/angles';
import { baselineSettings, type WorldSettings } from "../districts/shared/types";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";
import { interpolate } from "../../../shared/motion/easing";
import type { View } from "../runtime/contracts";
type Pose = {
    alpha: number;
    beta: number;
    radius: number;
    fov: number;
};
export function createCameraController(scene: Scene, reduced: boolean, viewportWidth: () => number, settings: WorldSettings["camera"] = baselineSettings(false).camera) {
    const camera = new ArcRotateCamera("camera", -0.95, 1.02, viewportWidth() < 600 ? settings.mobileInitial : settings.initial, new Vector3(0, 0, 3), scene);
    camera.minZ = 0.1;
    camera.lowerRadiusLimit = 12;
    camera.upperRadiusLimit = settings.maxRadius;
    let mode: View = "adventure", following = true, tween: {
        from: Pose;
        to: Pose;
        elapsed: number;
        duration: number;
    } | undefined;
    const pose = (): Pose => ({
        alpha: camera.alpha,
        beta: camera.beta,
        radius: camera.radius,
        fov: camera.fov,
    });
    const smooth = (patch: Partial<Pose>, duration = 0.42) => {
        const to = { ...(tween?.to ?? pose()), ...patch };
        if (reduced) {
            Object.assign(camera, to);
            tween = undefined;
        }
        else
            tween = { from: pose(), to, elapsed: 0, duration };
    };
    return {
        camera,
        restore:(saved:Pose&{target:{x:number;y:number;z:number}},savedMode:View)=>{mode=savedMode;following=false;tween=undefined;Object.assign(camera,{alpha:saved.alpha,beta:saved.beta,radius:saved.radius,fov:saved.fov});camera.setTarget(new Vector3(saved.target.x,saved.target.y,saved.target.z),false,true,true);},
        get mode() {
            return mode;
        },
        interrupt: () => {
            tween = undefined;
        },
        detach: () => {
            following = false;
        },
        home: () => {
            following = true;
        },
        zoom: (n: number) => smooth({
            radius: Math.min(settings.maxRadius, Math.max(12, (tween?.to.radius ?? camera.radius) + n)),
        }, 0.28),
        north: () => { const from = tween?.to.alpha ?? camera.alpha, delta = angleDelta(from,Math.PI/2); smooth({ alpha: from + delta }); },
        rotate: (n: number) => smooth({ alpha: (tween?.to.alpha ?? camera.alpha) + n }),
        view: (v: View) => {
            mode = v;
            following = true;
            smooth({
                fov: v === "overview" ? 1.2 : 0.8,
                beta: v === "overview" ? 0.22 : v === "look" ? 1.42 : 1.02,
                radius: v === "overview"
                    ? (viewportWidth() < 600 ? settings.overview : settings.desktopOverview)
                    : v === "look"
                        ? 15
                        : viewportWidth() < 600
                            ? settings.mobileAdventure
                            : settings.adventure,
            }, 0.65);
        },
        tick: (dt: number) => {
            if (!tween)
                return;
            tween.elapsed += dt;
            const t = tween.elapsed / tween.duration;
            for (const key of ["alpha", "beta", "radius", "fov"] as const)
                camera[key] = interpolate(tween.from[key], tween.to[key], t);
            if (t >= 1)
                tween = undefined;
        },
        follow: (position: Vector3, dt: number) => {
            if (following) {
                const target = position.add(new Vector3(0, 1, 0));
                camera.setTarget(Vector3.Lerp(camera.target, target, reduced ? 1 : 1 - Math.exp(-dt * 5)), false, true, true);
            }
            camera.getViewMatrix(true);
        },
    };
}
export type CameraController = ReturnType<typeof createCameraController>;
