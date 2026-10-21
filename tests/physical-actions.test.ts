import {TransformNode} from '@babylonjs/core/Meshes/transformNode';
import {Vector3} from '@babylonjs/core/Maths/math.vector';
import {steerOnStreet} from '../src/domains/world/navigation/steering';
import {ROAD_SURFACE_OFFSET} from '../src/domains/world/assets/streets/palette';
import assert from 'node:assert/strict';
import {NullEngine} from '@babylonjs/core/Engines/nullEngine';
import {Scene} from '@babylonjs/core/scene';
import {createAssetContext} from '../src/domains/world/assets/core/context';
import {createExplorer} from '../src/domains/explorer/character/createExplorer';
import {defaultAppearance} from '../src/domains/explorer/character/appearance';
import {cameraMovement} from '../src/domains/explorer/actions/model';
for(const alpha of [0,Math.PI/2,Math.PI]){const straight=cameraMovement(alpha,0,1),diagonal=cameraMovement(alpha,1,1);assert(Math.abs(Math.hypot(straight.x,straight.z)-1)<1e-9);assert(Math.abs(Math.hypot(diagonal.x,diagonal.z)-1)<1e-9,'diagonal input cannot move faster');}
const engine=new NullEngine(),scene=new Scene(engine),ctx=createAssetContext(scene),actor=createExplorer(scene,ctx.material);
for(const side of ['left','right']){const arm=scene.transformNodes.find(n=>n.name===`${side} arm`)!;assert.equal(arm.parent?.name,'upper body');const elbow=scene.transformNodes.find(n=>n.name===`${side} arm elbow`)!;assert.equal(elbow.parent,arm);const hand=elbow.getChildMeshes().find(m=>m.name==='hand');assert(hand,'hands belong to connected lower-arm chain');const knee=scene.transformNodes.find(n=>n.name===`${side} leg knee`)!;assert.equal(knee.parent?.name,`${side} leg`);}
actor.setAction('sit');for(let i=0;i<60;i++)actor.animate(.016,0,false);assert(scene.transformNodes.find(n=>n.name==='left leg')!.rotation.x < -1.4);assert(scene.transformNodes.find(n=>n.name==='left leg knee')!.rotation.x>1.4);actor.setAction('carry');for(let i=0;i<60;i++)actor.animate(.016,0,false);assert.equal(actor.grip.name,'two hand carry socket');assert(scene.transformNodes.find(n=>n.name==='left arm')!.rotation.x<-.8);const count=scene.meshes.length;actor.setAppearance({...defaultAppearance,mobility:'wheelchair'});assert.equal(actor.mobility,'wheelchair');actor.setAction('sit');actor.animate(.1,0,false);actor.setAppearance(defaultAppearance);assert.equal(scene.meshes.length,count,'rebuilding a joint rig must not leak geometry');actor.root.dispose(false,false);assert.equal(scene.meshes.length,0);ctx.dispose();scene.dispose();engine.dispose();console.log('Normalised camera movement, connected elbow/knee chains, seated/carry poses and rig ownership passed.');

// A held direction follows a bend, but cannot jump to a nearby disconnected road.
const lanes=[ [{x:0,y:0,z:0},{x:3,y:0,z:0}], [{x:3,y:0,z:0},{x:7,y:0,z:2}], [{x:0,y:0,z:3},{x:7,y:0,z:3}] ] as const;
let cursor={x:0,y:0,z:0};for(let i=0;i<60;i++)cursor=steerOnStreet(cursor,{x:1,z:0},.1,[...lanes]);assert(cursor.x>5.5&&cursor.z>1,'held right continues around a gentle bend');assert(cursor.z<2,'never jumps to parallel disconnected road');
const groundingEngine=new NullEngine(),groundingScene=new Scene(groundingEngine),groundingCtx=createAssetContext(groundingScene),grounded=createExplorer(groundingScene,groundingCtx.material);
for(const mobility of ['walk','wheelchair'] as const){grounded.setAppearance({...defaultAppearance,mobility});let wheelHeight:number|undefined;for(let frame=0;frame<160;frame++){grounded.animate(.016,frame<80?5:9,false);const contacts=grounded.root.getChildMeshes().filter(m=>mobility==='wheelchair'?m.name==='rolling rear wheel'||m.name==='front caster':m.name==='shoe');const minimum=Math.min(...contacts.map(m=>{m.computeWorldMatrix(true);if(mobility!=='wheelchair')return m.getBoundingInfo().boundingBox.minimumWorld.y;const vertices=m.getVerticesData('position')!;let y=Infinity;for(let i=0;i<vertices.length;i+=3)y=Math.min(y,Vector3.TransformCoordinates(Vector3.FromArray(vertices,i),m.getWorldMatrix()).y);return y;}));if(mobility==='wheelchair'){const visual=grounded.root.getChildren().find(n=>n.name==='character appearance');assert(visual instanceof TransformNode);wheelHeight??=visual.position.y;assert(Math.abs(visual.position.y-wheelHeight)<1e-9,'wheel rotation must never raise/lower the chair');}assert(minimum>=ROAD_SURFACE_OFFSET-.002&&minimum<ROAD_SURFACE_OFFSET+.01,`${mobility} contacts visible paving throughout gait`);}}
groundingScene.dispose();groundingEngine.dispose();console.log('Curved lane steering and walking/wheelchair pavement contact passed.');

const junction=[ [{x:-4,y:0,z:0},{x:0,y:0,z:0}], [{x:0,y:0,z:0},{x:4,y:0,z:0}], [{x:0,y:0,z:0},{x:0,y:0,z:4}], [{x:0,y:0,z:0},{x:0,y:0,z:-4}] ] as const;
for(const side of [-1,1])for(const x of [-.7,.4]){let p={x,y:0,z:0};for(let i=0;i<35;i++)p=steerOnStreet(p,{x:0,z:side},.1,[...junction]);assert(p.z*side>2,`turn from either side of a nearby junction: ${x}, ${side}`);}
const crossing=[ [{x:-4,y:0,z:0},{x:4,y:0,z:0}], [{x:0,y:0,z:-4},{x:0,y:0,z:4}] ] as const;
let turning={x:-.5,y:0,z:0};const crossingNetwork=[...crossing];for(let i=0;i<30;i++)turning=steerOnStreet(turning,{x:0,z:1},.1,crossingNetwork);assert(turning.z>2,'legacy crossing supports keyboard turns without a click');
const separate=[ [{x:-4,y:0,z:0,nodeId:'a'},{x:0,y:0,z:0,nodeId:'b'}], [{x:0,y:0,z:0,nodeId:'c'},{x:0,y:0,z:4,nodeId:'d'}] ] as const;
assert.equal(steerOnStreet({x:-.4,y:0,z:0},{x:0,z:1},.1,[...separate]).z,0,'source IDs must not invent a junction');
console.log('Junction turn assist, legacy crossings, source topology and stable wheelchair ride passed.');
