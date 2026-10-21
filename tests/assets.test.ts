import {pickWorld} from '../src/domains/world/input/picking';
import {FreeCamera} from '@babylonjs/core/Cameras/freeCamera';
import {Vector3} from '@babylonjs/core/Maths/math.vector';
import {createRoadSelection} from '../src/domains/world/runtime/roadSelection';
import { RawTexture } from "@babylonjs/core/Materials/Textures/rawTexture";
import { createCameraController } from "../src/domains/world/camera/controller";
import { createDisposalScope } from "../src/domains/world/runtime/disposal";
import assert from "node:assert/strict";
import { NullEngine } from "@babylonjs/core/Engines/nullEngine";
import { Scene } from "@babylonjs/core/scene";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { createAssetContext } from "../src/domains/world/assets/core/context";
import { createAsset } from "../src/domains/world/assets/core/asset";
import { createHouse } from "../src/domains/world/assets/buildings";
import { createBench } from "../src/domains/world/assets/furniture";
import { createRoad, createRamp } from "../src/domains/world/assets/streets";
import { composeAssets } from "../src/domains/world/districts/shared/compose";
import { resolveDistrict } from "../src/domains/world/districts/shared/resolve";
import { snapToStreet, distance } from "../src/domains/world/navigation/routes";
import { createExplorer } from "../src/domains/explorer/character/createExplorer";
import { createWalker } from "../src/domains/explorer/character/walker";
import { toggleSavedStop } from "../src/domains/explorer/trail/model";
const engine = new NullEngine(), scene = new Scene(engine), context = createAssetContext(scene);
const house = createHouse(context, {
    id: "house",
    position: { x: -9, y: 0, z: -19 },
    width: 6,
    depth: 6,
    height: 4.6,
    color: "#e3b292",
});
assert(distance(house.entrances()[0].position, { x: -9, y: 0, z: -22.4 }) < 1e-5);
house.root.rotation.y = Math.PI / 2;
house.root.scaling.set(2, 1, 2);
assert(distance(house.entrances()[0].position, { x: -15.8, y: 0, z: -19 }) < 1e-4, "Entrances follow parent rotation and scale");
const obstruction = house.occluders()[0];
assert(Math.abs(obstruction.min.x + 15.8) < 1e-4 &&
    Math.abs(obstruction.max.z + 12.2) < 1e-4, "Occlusion bounds follow the same transform");
const bench = createBench(context, {
    id: "bench",
    position: { x: 10, y: 0, z: 20 },
    rotationY: Math.PI / 2,
});
const back = bench.meshes.find((m) => m.name === "timber back")!;
back.computeWorldMatrix(true);
assert(Math.abs(back.absolutePosition.x - 10.3) < 1e-4 &&
    Math.abs(back.absolutePosition.z - 20) < 1e-4);
for (const segment of [
    [
        { x: -31, y: 0, z: -26 },
        { x: 29, y: 0, z: -26 },
    ],
    [
        { x: -31, y: 0, z: 24 },
        { x: -31, y: 0, z: -26 },
    ],
] as const) {
    const road = createRoad(context, { id: "test-road", segment });
    const sockets = road.pathSockets();
    assert(distance(sockets[0].position, segment[0]) < 1e-4);
    assert(distance(sockets[1].position, segment[1]) < 1e-4);
    road.dispose();
}
const roadForSelection=createRoad(context,{id:'road-osm/way/123/0',segment:[{x:0,y:0,z:0},{x:4,y:0,z:0}]});
const oldRoadMaterial=roadForSelection.meshes[0].material;
const selection=createRoadSelection([roadForSelection],context.material('#e9ad59'));
selection.select('osm/way/123');assert.notEqual(roadForSelection.meshes[0].material,oldRoadMaterial);
selection.select('unknown');assert.equal(roadForSelection.meshes[0].material,oldRoadMaterial);
selection.select('osm/way/123');selection.dispose();selection.dispose();assert.equal(roadForSelection.meshes[0].material,oldRoadMaterial);
roadForSelection.dispose();
const ramp = createRamp(context, {
    id: "ramp",
    position: { x: 18, y: 0, z: 0 },
    rise: 4,
    run: -22,
});
assert(distance(ramp.pathSockets()[1].position, { x: 18, y: 4, z: -22 }) < 1e-4);
const other = createHouse(context, {
    id: "other",
    width: 6,
    depth: 6,
    height: 4.6,
    color: "#e3b292",
});
const shared = context.material("#e3b292");
house.dispose();
assert(scene.materials.includes(shared), "Disposing an asset must not dispose another instance’s shared material");
assert(other.meshes.every((m) => !m.isDisposed()));
let owned: StandardMaterial;
let privateTexture: RawTexture;
const temporary = createAsset(context, { id: "owned" }, (g) => {
    owned = g.ownMaterial(new StandardMaterial("private", scene));
    privateTexture = g.ownTexture(RawTexture.CreateRGBATexture(new Uint8Array([255, 255, 255, 255]), 1, 1, scene));
    owned.diffuseTexture = privateTexture;
    g.box("part", 0, 0, 0, 1, 1, 1, "#fff9ed").material = owned;
});
temporary.dispose();
assert(!scene.textures.includes(privateTexture!), "Private texture is disposed with its asset");
assert(!scene.materials.includes(owned!), "Asset-specific material is disposed");
temporary.dispose();
const definition = resolveDistrict({ id: "accra", ground: "#efcf99" }, new Set(["delivery", "photo", "errand", "service", "digital"]));
const composition = composeAssets(context, definition.assets.filter((a) => a.kind !== "sign"));
for (const venue of definition.venues) {
    const asset = composition.assets.find((a) => a.id === `venue-${venue.category}`)!;
    assert(distance(asset.entrances()[0].position, snapToStreet(asset.entrances()[0].position, definition.network)) < 1e-4);
    const bounds = asset.bounds();
    assert(Number.isFinite(bounds.min.x) && bounds.max.x > bounds.min.x);
}
const meshCount = scene.meshes.length;
assert.throws(() => composeAssets(context, [definition.assets[0], definition.assets[0]]), /Duplicate/);
assert.equal(scene.meshes.length, meshCount);
const explorer = createExplorer(scene, context.material), walker = createWalker(explorer, definition.network, false, () => { });
let arrivals = 0;
walker.moveTo({ x: -20, y: 0, z: -16 }, () => arrivals++);
for (let i = 0; i < 500; i++)
    walker.update(1 / 60);
assert.equal(arrivals, 1);
assert(distance(explorer.root.position, { x: -20, y: 0, z: -16 }) < 0.001);
walker.moveTo({ x: -20, y: 0, z: -16 }, () => arrivals++);
assert.equal(arrivals, 2);
assert(!walker.moving);

// Departure must precede arrival (including reduced motion), and redirects cancel old callbacks.
const events:string[]=[];
const redirected=createWalker(explorer,definition.network,false,()=>{},30,()=>{},()=>events.push('depart'));
redirected.moveTo({x:20,y:0,z:14},()=>events.push('old'));
assert.deepEqual(events,['depart']);
redirected.update(.05);
redirected.moveTo({x:0,y:0,z:0},()=>events.push('new'));
assert.deepEqual(events,['depart','depart']);
for(let i=0;i<2000;i++)redirected.update(1/60);
assert(!events.includes('old'));assert.equal(events.at(-1),'new');
redirected.moveTo({x:20,y:0,z:14},()=>events.push('cancelled'));redirected.cancel();for(let i=0;i<1000;i++)redirected.update(1/60);assert(!events.includes('cancelled'));assert(!redirected.moving);
const reducedWalker=createWalker(explorer,definition.network,true,()=>{},6,()=>{},()=>events.push('depart-reduced'));
reducedWalker.moveTo({x:-20,y:0,z:-16},()=>events.push('arrive-reduced'));
assert.deepEqual(events.slice(-2),['depart-reduced','arrive-reduced']);
explorer.root.position.set(0,0,0);
const islands = [[{x:0,y:0,z:0,nodeId:'a'},{x:2,y:0,z:0,nodeId:'b'}],[{x:10,y:0,z:0,nodeId:'c'},{x:12,y:0,z:0,nodeId:'d'}]] as const;
let invalidArrivals=0, invalidDepartures=0;
const blocked=createWalker(explorer,[...islands],false,()=>{},6,()=>{},()=>invalidDepartures++);
blocked.moveTo({x:2,y:0,z:0},()=>invalidArrivals++);
assert.equal(blocked.moveTo({x:12,y:0,z:0},()=>invalidArrivals++),false);
for(let i=0;i<100;i++)blocked.update(.05);
assert.equal(invalidDepartures,2);assert.equal(invalidArrivals,0);

assert.deepEqual(toggleSavedStop(["a"], "b"), ["a", "b"]);
assert.deepEqual(toggleSavedStop(["a", "b"], "a"), ["b"]);
composition.dispose();
assert(composition.assets.every((a) => a.meshes.every((m) => m.isDisposed())));
bench.dispose();
ramp.dispose();
other.dispose();
explorer.root.dispose();
scene.dispose();
context.dispose();
engine.dispose();
const cleanups: string[] = [];
const scope = createDisposalScope();
scope.defer(() => cleanups.push("first"));
scope.defer(() => {
    cleanups.push("second");
    throw new Error("test cleanup failure");
});
scope.defer(() => cleanups.push("third"));
assert.throws(scope.dispose, /cleanup failed/);
assert.deepEqual(cleanups, ["third", "second", "first"]);
scope.dispose();
assert.equal(cleanups.length, 3);
const failureEngine = new NullEngine(), failureScene = new Scene(failureEngine), failureContext = createAssetContext(failureScene);
const beforeFailure = failureScene.meshes.length;
assert.throws(() => createAsset(failureContext, { id: "failed" }, (g) => {
    g.box("temporary", 0, 0, 0, 1, 1, 1, "#fff9ed");
    throw new Error("draw failed");
}), /draw failed/);
assert.equal(failureScene.meshes.length, beforeFailure);
failureScene.dispose();
failureContext.dispose();
failureEngine.dispose();
const cameraEngine = new NullEngine(), cameraScene = new Scene(cameraEngine), cameraControl = createCameraController(cameraScene, false, () => 390);
cameraControl.zoom(-7);
cameraControl.tick(0.1);
assert(cameraControl.camera.radius < 88 && cameraControl.camera.radius > 81);
cameraControl.zoom(-7);
cameraControl.tick(1);
assert.equal(cameraControl.camera.radius, 74, "Repeated zoom extends the goal from the current pose");
cameraControl.view("overview");
cameraControl.tick(0.1);
const interrupted = cameraControl.camera.radius;
cameraControl.interrupt();
cameraControl.tick(1);
assert.equal(cameraControl.camera.radius, interrupted, "Pointer interruption cancels transition");
cameraControl.view("look");
cameraControl.tick(1);
assert.equal(cameraControl.camera.radius, 15);
cameraScene.dispose();
cameraEngine.dispose();
console.log("Reusable asset transforms, entrances, road sockets, material ownership, district composition, disposal and walker checks passed.");

const pickEngine=new NullEngine(),pickScene=new Scene(pickEngine);
const pickContext=createAssetContext(pickScene),pickBuilding=createHouse(pickContext,{id:'pick-building',width:4,depth:4,height:4,color:'#abccba'});
const pickCamera=new FreeCamera('pick-camera',new Vector3(0,2,-10),pickScene);pickCamera.setTarget(new Vector3(0,2,0));
pickScene.render();
const hit=pickWorld(pickScene,pickEngine.getRenderWidth()/2,pickEngine.getRenderHeight()/2,m=>pickBuilding.meshes.some(mesh=>mesh===m));
assert(hit?.pickedMesh&&pickBuilding.meshes.some(m=>m===hit.pickedMesh),'Modular picking must hit rendered building geometry');
assert.equal(pickWorld(pickScene,0,0,()=>false),null);
pickBuilding.dispose();pickContext.dispose();pickScene.dispose();pickEngine.dispose();
