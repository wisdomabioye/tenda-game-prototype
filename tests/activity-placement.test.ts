import assert from 'node:assert/strict';
import {NullEngine} from '@babylonjs/core/Engines/nullEngine';import {Scene} from '@babylonjs/core/scene';import {createAssetContext} from '../src/domains/world/assets/core/context';import {resolveDistrict} from '../src/domains/world/districts/shared/resolve';import {composeAssets} from '../src/domains/world/districts/shared/compose';import {createActivityStations} from '../src/domains/explorer/actions/activities/stations';import {canTraverse} from '../src/domains/world/navigation/movement';
const engine=new NullEngine(),scene=new Scene(engine),ctx=createAssetContext(scene),city=resolveDistrict({id:'lagos',ground:'#fff'},new Set()),composition=composeAssets(ctx,city.assets.filter(a=>['urban','house','venue','bench','storeyed'].includes(a.kind))),kit=createActivityStations(ctx,city.network,city.settings.spawn,composition.assets.flatMap(a=>a.collisions()));
for(const s of kit.stations){assert(canTraverse(s.arrival,s.stand,kit.solids(),.65),`${s.id} wheelchair approach clears authored furniture`);assert(composition.assets.every(a=>canTraverse(s.arrival,s.stand,a.collisions(),.65)),`${s.id} avoids existing district solids`);}
kit.dispose();composition.dispose();ctx.dispose();scene.dispose();engine.dispose();

console.log('Lagos activity placement: all approaches clear existing building and bench boundaries.');
