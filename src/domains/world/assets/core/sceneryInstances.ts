import {Mesh} from '@babylonjs/core/Meshes/mesh';
import '@babylonjs/core/Meshes/thinInstanceMesh';
import type {Scene} from '@babylonjs/core/scene';
import type {AssetInstance} from './asset';
import type {AssetSpec} from '../registry';
/** Identical, non-interactive trees/palms only. Original asset geometry remains the source of bounds and identity. */
export function createSceneryInstances(scene:Scene,assets:AssetInstance[],specs:AssetSpec[]){
 const batches:Mesh[]=[],owned=new Set<Mesh>();
 const byId=new Map(specs.map(spec=>[spec.id,spec]));
 const supported=Boolean(scene.getEngine().getCaps().instancedArrays);
 const clear=()=>{for(const batch of batches)batch.dispose(false,false);batches.length=0;for(const mesh of owned)if(!mesh.isDisposed())mesh.setEnabled(true);owned.clear();};
 const refresh=()=>{
  clear();if(!supported)return;
  try{
  const groups=new Map<string,Mesh[]>();
  for(const asset of assets){const spec=byId.get(asset.id);
   if(!spec||!['tree','palm'].includes(spec.kind)||asset.meshes.length!==1)continue;
   const mesh=asset.meshes[0];if(mesh.isPickable||!mesh.isEnabled()||mesh.visibility!==1||!mesh.geometry)continue;
   mesh.computeWorldMatrix();if(mesh.getWorldMatrix().determinant()<=0)continue;
   const position=mesh.getWorldMatrix().getTranslation();
   // Keep instance bounds local so one visible tree cannot render an entire district's foliage.
   const key=(spec.kind==='palm'?`palm:${spec.height??5}`:'tree')+`:${mesh.material?.uniqueId}:${Math.floor(position.x/60)}:${Math.floor(position.z/60)}`;
   const group=groups.get(key)??[];group.push(mesh);groups.set(key,group);
  }
  for(const [key,group]of groups){if(group.length<3)continue;
   const source=new Mesh(`scenery instances ${key}`,scene);batches.push(source);
   group[0].geometry!.applyToMesh(source);source.material=group[0].material;source.useVertexColors=group[0].useVertexColors;source.isPickable=false;
   const matrices=new Float32Array(group.length*16);group.forEach((mesh,i)=>{mesh.computeWorldMatrix();mesh.getWorldMatrix().copyToArray(matrices,i*16);});
   source.thinInstanceSetBuffer('matrix',matrices,16,true);source.thinInstanceRefreshBoundingInfo(true);source.freezeWorldMatrix();source.doNotSyncBoundingInfo=true;
   source.metadata={sceneryInstances:group.length};
   for(const mesh of group){const previous=mesh.geometry;group[0].geometry!.applyToMesh(mesh);if(previous&&previous!==mesh.geometry&&previous.meshes.length===0)previous.dispose();mesh.setEnabled(false);owned.add(mesh);}
  }
  }catch(error){clear();throw error;}
 };
 refresh();
 return {refresh,get counts(){return {sources:batches.length,instances:owned.size,savedDrawMeshes:owned.size-batches.length};},dispose:clear};
}
