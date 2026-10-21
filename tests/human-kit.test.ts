import assert from 'node:assert/strict';
import {NullEngine} from '@babylonjs/core/Engines/nullEngine';
import {Scene} from '@babylonjs/core/scene';
import {createAssetContext} from '../src/domains/world/assets/core/context';
import {createExplorer} from '../src/domains/explorer/character/createExplorer';
import {cityHuman,humanProportions} from '../src/domains/explorer/character/humanKit';
import {parseAppearance,defaultAppearance} from '../src/domains/explorer/character/appearance';
const cast=Array.from({length:12},(_,i)=>cityHuman(i));
for(const key of ['skin','body','height','presentation','hair','headwear','outfit'] as const)assert(new Set(cast.map(p=>p[key])).size>=3,key);
assert(cast.some(p=>p.mobility==='wheelchair'));assert.deepEqual(parseAppearance({body:'invalid',height:NaN,headwear:9}),defaultAppearance);
assert.equal(parseAppearance({hair:'long',skin:'#68422f'}).body,'average','legacy saves migrate with defaults');
const engine=new NullEngine(),scene=new Scene(engine),ctx=createAssetContext(scene),character=createExplorer(scene,ctx.material);character.root.position.set(6,0,4);
for(const p of cast){character.setAppearance(p);assert.equal(character.root.position.x,6);const visual=scene.transformNodes.find(n=>n.name==='character appearance')!;assert.equal(visual.scaling.y,humanProportions(p).height);if(p.hair==='bald')assert(!scene.meshes.some(m=>m.name==='hair'));if(p.headwear==='cap')assert(scene.meshes.some(m=>m.name==='cap brim'));if(p.headwear==='scarf')assert(scene.meshes.some(m=>m.name==='head scarf'));}
character.setAppearance({...defaultAppearance,body:'full',height:'tall',mobility:'wheelchair'});const chair=scene.transformNodes.find(n=>n.name==='mobility kit')!;chair.computeWorldMatrix(true);assert(Math.abs(chair.getWorldMatrix().m[5]-1)<1e-6,'wheelchair geometry does not stretch with body height');
character.root.dispose(false,false);assert.equal(scene.meshes.length,0);ctx.dispose();scene.dispose();engine.dispose();console.log('Human kit: varied crowd cast, legacy saves, independent physique, headwear, wheelchair proportions and replacement disposal passed.');
