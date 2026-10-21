import assert from 'node:assert/strict';
import {NullEngine} from '@babylonjs/core/Engines/nullEngine';
import {Scene} from '@babylonjs/core/scene';
import {createPlayerHalo} from '../src/domains/explorer/identity/PlayerBeacon';
const engine=new NullEngine(),scene=new Scene(engine),halo=createPlayerHalo(scene);
assert.equal(scene.meshes.length,2);halo.update({x:10,y:2,z:-4},1.08);
for(const mesh of scene.meshes){assert.equal(mesh.position.x,10);assert(Math.abs(mesh.position.y-2.28)<1e-9);assert.equal(mesh.position.z,-4);assert.equal(mesh.scaling.x,1.08);assert(!mesh.isPickable);assert(mesh.metadata.playerBeacon);}
halo.update({x:-6,y:0,z:12});for(const mesh of scene.meshes){assert.equal(mesh.position.x,-6);assert.equal(mesh.position.z,12);assert.equal(mesh.scaling.x,1);}
const owned=scene.meshes.map(m=>m.material);halo.dispose();assert.equal(scene.meshes.length,0);assert(owned.every(m=>!scene.materials.includes(m!)),'owned halo materials disposed; engine default material remains engine-owned');scene.dispose();engine.dispose();console.log('player-beacon: player halo follows position, resets pulse scale, avoids picking and disposes owned geometry/materials.');
