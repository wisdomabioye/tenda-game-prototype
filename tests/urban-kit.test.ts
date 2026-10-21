import assert from 'node:assert/strict';
import {NullEngine} from '@babylonjs/core/Engines/nullEngine';
import {Scene} from '@babylonjs/core/scene';
import {createAssetContext} from '../src/domains/world/assets/core/context';
import {createUrbanBuilding} from '../src/domains/world/assets/buildings/urban';
import {createLagosCity} from '../src/domains/world/districts/configured/city';
import {rectangleFootprint,rectanglesOverlap} from '../src/domains/geography/spatial/rectangles';
import {walkingRoute,distance} from '../src/domains/world/navigation/routes';
import {createStreetLighting} from '../src/domains/world/lighting/streetLighting';
const city=createLagosCity(),urban=city.assets.filter(a=>a.kind==='urban'),infill=urban.filter(a=>a.id.startsWith('urban/infill/'));
console.log('urban-kit: urban inventory',JSON.stringify({urban:urban.length,infill:infill.length,lamps:city.assets.filter(a=>a.kind==='streetLamp').length,palms:city.assets.filter(a=>a.kind==='palm').length,styles:[...new Set(urban.map(a=>a.style))]}));
for(const asset of urban)assert(asset.width>=2.2&&asset.depth>=2.2&&asset.floors>=1,asset.id);
assert(urban.length>=45,'meaningful city density');assert(infill.length>=15,'new frontage rather than only changing old skins');assert.equal(new Set(urban.map(a=>a.style)).size,5);
for(const p of city.places!)assert(walkingRoute(city.settings.spawn,p.arrival,city.network).length>0||distance(city.settings.spawn,p.arrival)<.2,p.name);
for(const a of urban){const ring=rectangleFootprint(a.position!,a.width,a.depth,a.rotationY??0);for(const [p,q]of city.network){if(Math.abs(p.y-q.y)>.1)continue;assert(!rectanglesOverlap(ring,rectangleFootprint({x:(p.x+q.x)/2,y:0,z:(p.z+q.z)/2},distance(p,q),3,Math.atan2(-(q.z-p.z),q.x-p.x))),'infill leaves walking corridor clear');}}
const engine=new NullEngine(),scene=new Scene(engine),ctx=createAssetContext(scene);
for(const style of ['shop-house','apartments','terrace','tower','arcade'] as const){const asset=createUrbanBuilding(ctx,{id:style,position:{x:12,y:0,z:8},rotationY:Math.PI/2,width:8,depth:9,floors:style==='arcade'?1:4,color:'#c5a987',style,name:''});assert(asset.meshes.length<18,'batched material groups, not one draw mesh per window');assert(asset.meshes.every(m=>!m.isDisposed()));assert(asset.bounds().max.y>3);assert(Math.abs(asset.entrances()[0].position.x-(12-4.8))<.01);asset.dispose();assert.equal(scene.meshes.length,0);}
const lighting=createStreetLighting(scene,city.assets);assert.equal(scene.lights.length,2);lighting.update({x:0,y:0,z:0});lighting.dispose();assert.equal(scene.lights.length,0);ctx.dispose();scene.dispose();engine.dispose();
console.log('urban-kit: five batched building families, transforms, dense infill, route clearance and bounded lighting passed.');
