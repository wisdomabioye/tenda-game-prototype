import type {AssetInstance} from './asset';
/** Only authored scenery is frozen. Animated fabric keeps a live matrix below its static asset root. */
export function cacheStaticTransforms(asset:AssetInstance){
 const refresh=()=>{
  asset.root.unfreezeWorldMatrix();asset.root.computeWorldMatrix(true);asset.root.freezeWorldMatrix();
  asset.root.metadata={...asset.root.metadata,staticRevision:(asset.root.metadata?.staticRevision??0)+1};
  for(const mesh of asset.meshes){
   const parts:string[]=mesh.metadata?.batchedParts??[mesh.name];
   if(parts.some(name=>/awning|fabric/i.test(name)))continue;
   mesh.doNotSyncBoundingInfo=false;mesh.unfreezeWorldMatrix();mesh.computeWorldMatrix(true);mesh.freezeWorldMatrix();mesh.doNotSyncBoundingInfo=true;
  }
 };
 refresh();return {refresh};
}
