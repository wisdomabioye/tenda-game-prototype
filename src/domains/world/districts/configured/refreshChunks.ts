import type {DistrictDefinition} from '../shared/types';
export function refreshChunks(district:DistrictDefinition):DistrictDefinition{
 if(!district.chunks)return district;
 const core=new Set(['road','slab','missionHub','notice','streetSign','restaurant']);
 return {...district,chunks:district.chunks.map(chunk=>({...chunk,assets:district.assets.filter(a=>!core.has(a.kind)&&a.position&&a.position.x>=chunk.minX&&a.position.x<chunk.maxX&&a.position.z>=chunk.minZ&&a.position.z<=chunk.maxZ)}))};
}
