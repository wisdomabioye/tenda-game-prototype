import {captureScreenFrame} from '../../world/presentation/screenProjection';
import {DESTINATION_COLOR} from './palette';
import {CreateLineSystem} from '@babylonjs/core/Meshes/Builders/linesBuilder';
import type {AbstractMesh} from '@babylonjs/core/Meshes/abstractMesh';
import type {LinesMesh} from '@babylonjs/core/Meshes/linesMesh';
import {Color3} from '@babylonjs/core/Maths/math.color';
import {CreateTorus} from '@babylonjs/core/Meshes/Builders/torusBuilder';
import {Vector3} from '@babylonjs/core/Maths/math.vector';
import type {Scene} from '@babylonjs/core/scene';
import type {Engine} from '@babylonjs/core/Engines/engine';
import type {ArcRotateCamera} from '@babylonjs/core/Cameras/arcRotateCamera';
import type {Material} from '@babylonjs/core/Materials/material';
import type {Point} from '../../world/navigation/routes';
/** One owned entrance cue, reused for places, missions and street destinations. */
export function createDestinationFeedback(scene:Scene,canvas:HTMLCanvasElement,container:HTMLElement,engine:Engine,camera:ArcRotateCamera,material:Material,reduced:()=>boolean){
 const ring=CreateTorus('selected-entrance',{diameter:3,thickness:.2,tessellation:4},scene);ring.rotation.y=Math.PI/4;ring.material=material;ring.isPickable=false;ring.setEnabled(false);
 const flag=document.createElement('div');flag.className='destination-cue';flag.hidden=true;container.append(flag);
 let outline:LinesMesh|undefined;let name='',point:Point|null=null,arrivedUntil=0,clock=0;
 return {select(target:Point,title:string,building?:{meshes:AbstractMesh[]}){outline?.dispose();outline=undefined;if(building?.meshes.length){const min=new Vector3(Infinity,Infinity,Infinity),max=new Vector3(-Infinity,-Infinity,-Infinity);for(const mesh of building.meshes){mesh.computeWorldMatrix(true);const box=mesh.getBoundingInfo().boundingBox;min.minimizeInPlace(box.minimumWorld);max.maximizeInPlace(box.maximumWorld);}const corners=[new Vector3(min.x,min.y,min.z),new Vector3(max.x,min.y,min.z),new Vector3(max.x,min.y,max.z),new Vector3(min.x,min.y,max.z)];const top=corners.map(p=>new Vector3(p.x,max.y,p.z));outline=CreateLineSystem('destination-building-outline',{lines:[...corners.map((p,i)=>[p,corners[(i+1)%4]]),...top.map((p,i)=>[p,top[(i+1)%4]]),...corners.map((p,i)=>[p,top[i]])]},scene);outline.color=Color3.FromHexString(DESTINATION_COLOR);outline.isPickable=false;}point=target;name=title;arrivedUntil=0;clock=0;ring.position.set(target.x,target.y+.18,target.z);ring.setEnabled(true);flag.textContent=`◇ ${title}`;},arrive(){arrivedUntil=performance.now()+3000;flag.textContent=`✓ Arrived · ${name}`;},clear(){outline?.dispose();outline=undefined;point=null;name='';arrivedUntil=0;ring.setEnabled(false);flag.hidden=true;},state(){return {destination:name,arrived:arrivedUntil>performance.now()};},update(dt:number){if(!point)return;clock+=dt;const arrived=arrivedUntil>performance.now();if(arrivedUntil&&!arrived){ring.setEnabled(false);flag.hidden=true;return;}flag.textContent=arrived?`✓ Arrived · ${name}`:`◇ ${name}`;if(outline&&clock>2){outline.dispose();outline=undefined;}ring.scaling.setAll(reduced()?1:1+Math.sin(clock*(arrived?7:3))*(arrived?.14:.04));const frame=captureScreenFrame(canvas,scene,engine,camera),r=frame.rect,p=frame.project({x:point.x,y:point.y+2,z:point.z}),{x,y}=p;flag.hidden=p.z<0||p.z>1||x<30||x>r.width-30||y<125||y>r.height-150;flag.style.transform=`translate(${x}px,${y}px) translate(-50%,-100%)`;flag.classList.toggle('has-arrived',arrived);},dispose(){outline?.dispose();ring.dispose();flag.remove();}};
}
