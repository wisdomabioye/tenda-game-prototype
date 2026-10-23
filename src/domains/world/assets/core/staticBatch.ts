import {Mesh} from '@babylonjs/core/Meshes/mesh';
import {StandardMaterial} from '@babylonjs/core/Materials/standardMaterial';
import type {AssetContext} from './context';
/** Bake opaque colour variation into vertices: one shared material without losing geometry or asset identity. */
export function batchStaticMeshes(meshes:Mesh[],ctx:AssetContext){
 const eligible=meshes.filter(mesh=>{const m=mesh.material,parts:string[]=mesh.metadata?.batchedParts??[mesh.name];return !parts.some(name=>/awning|fabric/i.test(name))&&m instanceof StandardMaterial&&!m.diffuseTexture&&!m.opacityTexture&&!m.bumpTexture&&!m.emissiveTexture&&!m.reflectionTexture&&m.alpha===1&&m.emissiveColor.equalsToFloats(0,0,0)&&!mesh.getVerticesData('color');});
 if(eligible.length<2)return;
 const white=ctx.material('#ffffff');
 for(const mesh of eligible){const m=mesh.material as StandardMaterial,c=m.diffuseColor,colors:number[]=[];
  for(let i=0;i<mesh.getTotalVertices();i++)colors.push(c.r,c.g,c.b,1);
  mesh.setVerticesData('color',colors);mesh.material=white;
 }
 const parts=eligible.flatMap(mesh=>mesh.metadata?.batchedParts??[mesh.name]);
 const merged=Mesh.MergeMeshes(eligible,true,true,undefined,false,false);
 if(!merged)throw new Error('Static colour batching failed');
 merged.name='static colour batch';merged.metadata={batchedParts:parts};merged.isPickable=false;merged.parent=eligible[0].parent;
 // Source parent may have been cleared by disposal. Caller applies the asset root explicitly.
 for(const old of eligible){const index=meshes.indexOf(old);if(index>=0)meshes.splice(index,1);}
 meshes.push(merged);
}
