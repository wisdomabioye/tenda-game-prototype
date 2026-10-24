import type {AssetInstance} from '../assets/core/asset';
import type {AssetSpec} from '../assets/registry';
import type {Point} from '../navigation/routes';
/** Only small decorative pieces of scenery are budgeted; collision, signs and mission props stay intact. */
const scenery=new Set(['urban','house','storeyed','footprint','restaurant','mall','tree','palm','bed','planter','solar','tank']);
export function createDetailBudget(specs:AssetSpec[]){
 const eligible=new Set(specs.filter(s=>scenery.has(s.kind)).map(s=>s.id));
 const geometry=new WeakMap<AssetInstance['meshes'][number],{center:Point;small:boolean;revision:number}>();
 const changed=new Set<AssetInstance['meshes'][number]>();
 const restore=()=>{for(const mesh of changed)if(!mesh.isDisposed())mesh.setEnabled(true);changed.clear();};
 return {update(assets:AssetInstance[],focus:Point,player:Point,light:boolean){
  if(!light){restore();return 0;}
  let hidden=0;
  for(const asset of assets){if(!eligible.has(asset.id))continue;
   for(const mesh of asset.meshes){
    if(mesh.isDisposed())continue;
    let shape=geometry.get(mesh);
    if(!shape||shape.revision!==(asset.root.metadata?.staticRevision??0)){mesh.computeWorldMatrix(!mesh.isWorldMatrixFrozen);const box=mesh.getBoundingInfo().boundingBox,size=box.maximumWorld.subtract(box.minimumWorld);const parts:string[]=mesh.metadata?.batchedParts??[mesh.name];shape={revision:asset.root.metadata?.staticRevision??0,center:box.centerWorld.clone(),small:Math.max(size.x,size.y,size.z)<3.5||parts.every(name=>/window|glazing|transom/.test(name))};geometry.set(mesh,shape);}
    const {small,center}=shape;
    const far=Math.min(Math.hypot(center.x-focus.x,center.z-focus.z),Math.hypot(center.x-player.x,center.z-player.z));
    const hide=light&&small&&far>(changed.has(mesh)?55:70);
    if(hide){if(mesh.isEnabled()){mesh.setEnabled(false);changed.add(mesh);}if(changed.has(mesh))hidden++;}
    else if(changed.delete(mesh))mesh.setEnabled(true);
   }
  }
  for(const mesh of changed)if(mesh.isDisposed())changed.delete(mesh);
  return hidden;
 },restore};
}
