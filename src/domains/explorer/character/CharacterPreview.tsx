import {useEffect,useRef} from 'react';
import {Engine} from '@babylonjs/core/Engines/engine';
import {Scene} from '@babylonjs/core/scene';
import {ArcRotateCamera} from '@babylonjs/core/Cameras/arcRotateCamera';
import {Vector3} from '@babylonjs/core/Maths/math.vector';
import {Color4} from '@babylonjs/core/Maths/math.color';
import {HemisphericLight} from '@babylonjs/core/Lights/hemisphericLight';
import {createAssetContext} from '../../world/assets/core/context';
import {createExplorer} from './createExplorer';
import type {Appearance} from './appearance';
export function CharacterPreview({appearance}:{appearance:Appearance}){
 const canvas=useRef<HTMLCanvasElement>(null),current=useRef(appearance),refresh=useRef<()=>void>(()=>{});current.current=appearance;
 useEffect(()=>{const engine=new Engine(canvas.current!,true);engine.setHardwareScalingLevel(1/Math.min(devicePixelRatio,2));const scene=new Scene(engine);scene.clearColor=new Color4(1,.97,.88,1);new ArcRotateCamera('portrait',1.0,1.35,5.4,new Vector3(0,1.4,0),scene);new HemisphericLight('portrait light',new Vector3(0,1,1),scene);const context=createAssetContext(scene),character=createExplorer(scene,context.material,current.current);
 let disposed=false;const render=()=>scene.executeWhenReady(()=>{if(!disposed)scene.render();});
 refresh.current=()=>{character.setAppearance(current.current);render();};render();const resize=()=>{engine.resize();render();};window.addEventListener('resize',resize);return()=>{disposed=true;refresh.current=()=>{};window.removeEventListener('resize',resize);character.root.dispose(false,false);context.dispose();scene.dispose();engine.dispose();};},[]);
 useEffect(()=>refresh.current(),[appearance]);
 return <canvas ref={canvas} className="character-preview" aria-label="Preview of your explorer appearance"/>;
}
