import assert from 'node:assert/strict';
import {NullEngine} from '@babylonjs/core/Engines/nullEngine';
import {Scene} from '@babylonjs/core/scene';
import {createAssetContext} from '../src/domains/world/assets/core/context';
import {createExplorer} from '../src/domains/explorer/character/createExplorer';
import {createWalker} from '../src/domains/explorer/character/walker';
import {defaultAppearance,parseAppearance} from '../src/domains/explorer/character/appearance';
import {parseTrail,reorderStop,nextLocalStop} from '../src/domains/explorer/trail/model';
assert.deepEqual(parseAppearance({mobility:'flying',skin:'bad',glasses:'true'}),defaultAppearance);
assert.deepEqual(parseTrail(['a','b','a',null,9,'']),['a','b']);assert.deepEqual(reorderStop(['a','b','c'],'c',-1),['a','c','b']);assert.deepEqual(reorderStop(['a','b'],'a',-1),['a','b']);assert.deepEqual(reorderStop(['a'],'unknown',1),['a']);
const engine=new NullEngine(),scene=new Scene(engine),context=createAssetContext(scene),character=createExplorer(scene,context.material);character.root.position.set(2,0,0);character.root.rotation.y=.75;
const normalCount=scene.meshes.length;
for(let i=0;i<10;i++){character.setAppearance({...defaultAppearance,mobility:'wheelchair',glasses:true,hair:'long'});assert.equal(scene.meshes.filter(m=>m.name==='rolling rear wheel').length,2);character.setAppearance(defaultAppearance);assert.equal(scene.meshes.length,normalCount,'appearance changes dispose old meshes');}
assert.equal(character.root.position.x,2);assert.equal(character.root.rotation.y,.75);
const network=[[{x:0,y:0,z:0},{x:10,y:0,z:0}]] as const;
let arrived=0;const walker=createWalker(character,[...network],false,()=>{},6);walker.moveTo({x:10,y:0,z:0},()=>arrived++);walker.update(.2);const before=character.root.position.x;character.setAppearance({...defaultAppearance,mobility:'wheelchair'});assert.equal(character.root.position.x,before,'switching appearance preserves an in-flight route');for(let i=0;i<100;i++)walker.update(.05);assert.equal(arrived,1);assert(Math.abs(character.root.position.x-10)<.001);
const axle=scene.transformNodes.find(n=>n.name==='wheel axle')!;const angle=axle.rotation.x;character.animate(.2,6,false);assert.notEqual(axle.rotation.x,angle);const reducedAngle=axle.rotation.x;character.animate(.2,6,true);assert.equal(axle.rotation.x,reducedAngle,'reduced motion stops wheel embellishment');
character.root.dispose(false,false);assert.equal(scene.meshes.length,0);context.dispose();scene.dispose();engine.dispose();console.log('character-trail: appearance ownership, wheelchair animation, live route preservation and saved-order checks passed.');

assert.equal(nextLocalStop(['a','b'],['b'],'a'),'b');assert.equal(nextLocalStop(['a','b'],['a','b'],'b'),'b');assert.equal(nextLocalStop(['a'],[],null),null);
