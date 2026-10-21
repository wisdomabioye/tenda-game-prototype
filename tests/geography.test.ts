import {attachPlaceCatalogue} from '../src/domains/places/world/compose';
import {composeGeographicDistrict} from '../src/domains/world/districts/geographic/compose';
import {validateCatalogue} from '../src/domains/places/model';
import catalogue from '../src/domains/places/catalogues/lagos.json';
import {createStoreyedBuilding} from '../src/domains/world/assets/buildings/storeyed';
import {createRouteOverlay} from '../src/domains/world/runtime/routeOverlay';
import {clearConnection,routeLength} from '../src/domains/world/districts/geographic/connections';
import {insideRing} from '../src/domains/geography/spatial/polygon';
import {clearPocket} from '../src/domains/world/districts/geographic/streetLife';
import assert from 'node:assert/strict';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine';
import { Scene } from '@babylonjs/core/scene';
import { VertexBuffer } from '@babylonjs/core/Buffers/buffer';
import { createLocalProjection, insideBounds } from '../src/domains/geography/projection/local';
import { adaptMapSnapshot } from '../src/domains/geography/adapters/osm';
import { validateSnapshot } from '../src/domains/geography/adapters/snapshot';
import snapshot from '../src/domains/geography/data/lagos-victoria-island.json';
import { walkingRoute, distance, projectOnSegment, type Segment } from '../src/domains/world/navigation/routes';
import { resolveDistrict } from '../src/domains/world/districts/shared/resolve';
import { victoriaIslandDistrict } from '../src/domains/world/districts/lagos-victoria-island/definition';
import { createAssetContext } from '../src/domains/world/assets/core/context';
import { createFootprintBuilding } from '../src/domains/world/assets/buildings/footprint';
assert.deepEqual(projectOnSegment({x:1,y:0,z:1},[{x:0,y:0,z:0},{x:0,y:0,z:0}]),{x:0,y:0,z:0});
const map = adaptMapSnapshot(snapshot), projection = map.projection;
assert.equal(snapshot.roads.length, 50);
assert.equal(snapshot.buildings.length, 139);
for (const c of [snapshot.origin, { latitude: snapshot.bounds.south, longitude: snapshot.bounds.west }, { latitude: snapshot.bounds.north, longitude: snapshot.bounds.east }]) {
    const roundtrip = projection.inverse(projection.forward(c));
    assert(Math.abs(c.latitude - roundtrip.latitude) < 1e-10 && Math.abs(c.longitude - roundtrip.longitude) < 1e-10);
}
assert(projection.forward({ ...snapshot.origin, longitude: snapshot.origin.longitude + .001 }).x > 27);
assert(projection.forward({ ...snapshot.origin, latitude: snapshot.origin.latitude + .001 }).z < -27);
assert.throws(() => projection.forward({ latitude: NaN, longitude: 3 }), /Invalid/);
assert.throws(() => createLocalProjection(snapshot.origin, 0), /Invalid/);
assert(!insideBounds({ latitude: 6.5244, longitude: 3.3792 }, snapshot.bounds), 'Existing out-of-pilot sample coordinate is not silently placed in the pilot');
const crossing: Segment[] = [[{ x: -5, y: 0, z: 0, nodeId: 'a' }, { x: 5, y: 0, z: 0, nodeId: 'b' }], [{ x: 0, y: 0, z: -5, nodeId: 'c' }, { x: 0, y: 0, z: 5, nodeId: 'd' }]];
assert.deepEqual(walkingRoute(crossing[0][0], crossing[1][1], crossing), [], 'Source roads do not connect at a visual crossing');
const connected: Segment[] = [...crossing, [crossing[0][1], crossing[1][1]]];
assert(distance(walkingRoute(crossing[0][0], crossing[1][1], connected).at(-1)!, crossing[1][1]) < 1e-6);
const restored = resolveDistrict({ id: 'lagos', ground: '#efcf99' }, new Set(['delivery', 'photo', 'errand', 'service', 'digital']));
assert(restored.geographic);
for (const kind of ['house', 'stall', 'bench', 'palm', 'sign', 'solar', 'pergola']) assert(restored.assets.some(asset => asset.kind === kind), `Missing restored scenery: ${kind}`);
const district = victoriaIslandDistrict();
console.log('Catalogue places:',district.places?.map(p=>({name:p.name,reachable:p.reachable})));
assert.equal(district.places?.length,3);
const baseDistrict=composeGeographicDistrict(map,{id:'lagos',name:'test'});
const first=district.places![0];
const blockedDistrict=attachPlaceCatalogue({...baseDistrict,assets:[...baseDistrict.assets,{kind:'bench',id:'blocked-entrance',position:first.arrival}]},map,{...catalogue,places:[catalogue.places[0]]});
assert.equal(blockedDistrict.places![0].reachable,false,'Blocked entrances remain inspectable but cannot be walked to');
assert.throws(()=>attachPlaceCatalogue(baseDistrict,map,{...catalogue,cityId:'other'}),/city mismatch/);
assert.throws(()=>attachPlaceCatalogue(baseDistrict,map,{...catalogue,places:[{...catalogue.places[0],building:{...catalogue.places[0].building,assetId:'missing'}}]}),/Unknown/);
assert.throws(()=>attachPlaceCatalogue(baseDistrict,map,{...catalogue,places:[{...catalogue.places[0],entrance:{x:100,z:100}}]}),/Entrance/);
const unlinked=attachPlaceCatalogue(baseDistrict,map,{...catalogue,places:[{...catalogue.places[0],missionIds:[]}]});
assert.equal(unlinked.places![0].missionIds.length,0,'No mission links inferred from proximity');

for(const place of district.places??[]){assert(place.reachable,'Sample entrance must be connected: '+place.name);const path=walkingRoute(district.settings.spawn,place.arrival,district.network);assert(path.length&&distance(path.at(-1)!,place.arrival)<.001);}
assert.throws(()=>validateCatalogue({...catalogue,places:[catalogue.places[0],catalogue.places[0]]}),/duplicate/);
assert.throws(()=>validateCatalogue({...catalogue,places:[catalogue.places[0],{...catalogue.places[1],missionIds:catalogue.places[0].missionIds}]}),/Ambiguous/);
assert.throws(()=>validateCatalogue({...catalogue,places:[{...catalogue.places[0],coordinate:{latitude:NaN,longitude:3}}]}),/location/);
const towers=district.assets.filter(a=>a.kind==='storeyed');
assert(towers.length>=4);assert(towers.some(a=>a.kind==='storeyed'&&a.floors>=7));
assert(district.assets.some(a=>a.kind==='restaurant'));assert(district.assets.some(a=>a.kind==='mall'));
const streetBoards=district.assets.filter(a=>a.kind==='streetSign');
assert(streetBoards.length>=4,'Sourced street names must have physical signs');
for(const board of streetBoards)if(board.kind==='streetSign')assert(map.roads.some(r=>r.name===board.name)&&clearPocket(map,board.position!,2.4));
console.log('Street boards:',streetBoards.length,'commercial examples:',district.assets.filter(a=>a.kind==='mall'||a.kind==='restaurant').length);
const rest=district.assets.find(a=>a.id==='rest-pocket-paving');
assert(rest && clearPocket(map,rest.position!,5.4),'Shaded rest pocket needs generous source clearance');
const houses=district.assets.filter(a=>(a.kind==='house'||a.kind==='storeyed'||a.kind==='restaurant'||a.kind==='mall'));
assert(houses.length>=12,'Crafted district must contain detailed buildings');
for(const house of houses){
    if(house.kind!=='house'&&house.kind!=='storeyed'&&house.kind!=='restaurant'&&house.kind!=='mall')continue;
    const outline=map.buildings.find(b=>'crafted-'+b.id===house.id)!.points;
    const c=Math.cos(house.rotationY??0),s=Math.sin(house.rotationY??0),p=house.position!;
    for(const dx of [-1,1])for(const dz of [-1,1])assert(insideRing({x:p.x+dx*house.width/2*c+dz*house.depth/2*s,z:p.z-dx*house.width/2*s+dz*house.depth/2*c},outline),'House walls must stay in their source footprint');
}
for(const asset of district.assets.filter(a=>a.id.startsWith('street-')||a.id.startsWith('hub-'))){
    assert(clearPocket(map,asset.position!,asset.id.startsWith('hub-')?3:2),'Scenery must clear roads and source buildings');
}
const links=district.assets.filter(a=>a.kind==='road'&&a.id.startsWith('game-link-'));
assert(links.length>0,'Pilot needs visible pedestrian links');
for(const link of links){if(link.kind!=='road')continue;assert(clearConnection(map,link.segment,district.assets),'Link must clear known obstacles');}
let reductions=0;
for(const a of district.venues)for(const b of district.venues){
    const from={x:a.x,y:0,z:a.z-4},to={x:b.x,y:0,z:b.z-4};
    const before=routeLength(from,walkingRoute(from,to,map.network));
    const after=routeLength(from,walkingRoute(from,to,district.network));
    assert(after<=before+.01,'Adding links must not lengthen a hub route');
    if(before-after>1)reductions++;
}
assert(reductions>0,'Links must shorten actual hub journeys');
console.log('Visible links:',links.length,'shortened directional hub journeys:',reductions);
console.log('Storeyed buildings:',towers.map(a=>a.kind==='storeyed'?a.floors:0));
console.log('Crafted buildings:' ,houses.length,'district assets:',district.assets.length);

for (const v of district.venues) {
    const target = { x: v.x, y: 0, z: v.z - 4 };
    const path = walkingRoute(district.settings.spawn, target, district.network);
    assert(distance(target, district.settings.spawn) < .12 || path.length > 0);
    if (path.length)
        assert(distance(path.at(-1)!, target) < .001);
}
assert.throws(() => validateSnapshot({ ...snapshot, schemaVersion: 99 }), /Unsupported/);
assert.throws(() => validateSnapshot({ ...snapshot, roads: [snapshot.roads[0], snapshot.roads[0]] }), /Duplicate/);
const engine = new NullEngine(), scene = new Scene(engine), ctx = createAssetContext(scene);
const multi=createStoreyedBuilding(ctx,{id:'stair-test',width:7,depth:6,floors:4,color:'#9bb3aa',style:'terraces'});
assert(multi.meshes.some(m=>m.name==='stair tread'||m.metadata?.batchedParts?.includes('stair tread')));
assert(multi.meshes.some(m=>m.name==='stair landing'||m.metadata?.batchedParts?.includes('stair landing')));
assert(multi.meshes.some(m=>m.name==='stair handrail'||m.metadata?.batchedParts?.includes('stair handrail')));
assert.equal(multi.entrances()[0].position.y,0,'Only ground entrance is exposed as a navigation socket');

assert(multi.meshes.every(m=>{m.computeWorldMatrix(true);const b=m.getBoundingInfo().boundingBox;return b.minimumWorld.x>=-3.51&&b.maximumWorld.x<=3.51&&b.minimumWorld.z>=-3.31&&b.maximumWorld.z<=3.31;}),'Stair and facade meshes must fit the declared ground envelope');
multi.dispose();multi.dispose();
assert.throws(()=>createStoreyedBuilding(ctx,{id:'bad-tower',width:7,depth:6,floors:1,color:'#9bb3aa',style:'office'}),/Invalid/);
const overlay=createRouteOverlay(ctx), baselineMeshes=scene.meshes.length;
overlay.show([{x:0,y:0,z:0},{x:4,y:0,z:0}]);
assert.equal(scene.meshes.length,baselineMeshes+2);
overlay.show([{x:0,y:0,z:0},{x:0,y:0,z:6}]);
assert.equal(scene.meshes.length,baselineMeshes+2,'Redirect replaces the previous path and target');
overlay.show([]);assert.equal(scene.meshes.length,baselineMeshes);
overlay.dispose();overlay.dispose();
const concave = [{ x: 0, y: 0, z: 0 }, { x: 4, y: 0, z: 0 }, { x: 4, y: 0, z: 1 }, { x: 1, y: 0, z: 1 }, { x: 1, y: 0, z: 4 }, { x: 0, y: 0, z: 4 }];
const building = createFootprintBuilding(ctx, { id: 'concave', outline: concave, height: 4, color: '#c7b3a1' }), mesh = building.meshes[0], positions = mesh.getVerticesData(VertexBuffer.PositionKind)!, indices = mesh.getIndices()!, normals = mesh.getVerticesData(VertexBuffer.NormalKind)!;
let roofArea = 0;
for (let i = 0; i < (concave.length - 2) * 3; i += 3) {
    const [a, b, c] = [indices[i] * 3, indices[i + 1] * 3, indices[i + 2] * 3];
    roofArea += Math.abs((positions[b] - positions[a]) * (positions[c + 2] - positions[a + 2]) - (positions[c] - positions[a]) * (positions[b + 2] - positions[a + 2])) / 2;
}
assert.equal(roofArea, 7, 'Concave roof triangulation preserves footprint area');
assert(normals[1] > 0, 'Roof normal faces upwards');
building.dispose();
scene.dispose();
ctx.dispose();
engine.dispose();
console.log('Geographic projection/roundtrip, source topology, hub reachability, malformed snapshot and footprint triangulation passed. Connected network:', map.network.length, 'segments.');
