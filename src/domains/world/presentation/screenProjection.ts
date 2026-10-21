import {Matrix,Vector3} from '@babylonjs/core/Maths/math.vector';
import type {Scene} from '@babylonjs/core/scene';
import type {Engine} from '@babylonjs/core/Engines/engine';
import type {ArcRotateCamera} from '@babylonjs/core/Cameras/arcRotateCamera';
import type {Point} from '../navigation/geometry';
/** Capture layout and render dimensions once per overlay update, not per marker.
 * Coordinates are CSS pixels relative to the canvas, independent of device resolution. */
export function captureScreenFrame(
 canvas:Pick<HTMLCanvasElement,'getBoundingClientRect'>,
 scene:Pick<Scene,'getTransformMatrix'>,
 engine:Pick<Engine,'getRenderWidth'|'getRenderHeight'>,
 camera:Pick<ArcRotateCamera,'viewport'>,
){
 const rect=canvas.getBoundingClientRect();
 const renderWidth=Math.max(1,engine.getRenderWidth()),renderHeight=Math.max(1,engine.getRenderHeight());
 const transform=scene.getTransformMatrix(),viewport=camera.viewport.toGlobal(renderWidth,renderHeight);
 return {rect,project(point:Point){
  const p=Vector3.Project(new Vector3(point.x,point.y,point.z),Matrix.IdentityReadOnly,transform,viewport);
  return {x:p.x/renderWidth*rect.width,y:p.y/renderHeight*rect.height,z:p.z,width:rect.width,height:rect.height};
 }};
}
