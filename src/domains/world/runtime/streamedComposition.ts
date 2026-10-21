import {composeAssets} from '../districts/shared/compose';
import type {AssetContext} from '../assets/core/context';
import type {DistrictDefinition} from '../districts/shared/types';
import type {Point} from '../navigation/routes';
/** Navigation/core stays resident; small cities stay resident; larger worlds use a padded camera range with hysteresis. */
export function createStreamedComposition(context:AssetContext,district:DistrictDefinition){
 const chunkIds=new Set(district.chunks?.flatMap(c=>c.assets.map(a=>a.id))??[]);
 const core=composeAssets(context,district.assets.filter(a=>!chunkIds.has(a.id))),loaded=new Map<string,ReturnType<typeof composeAssets>>();let assets=core.assets,occluders=core.occluders,revision=0;
 const refresh=()=>{assets=[...core.assets,...[...loaded.values()].flatMap(c=>c.assets)];occluders=[...core.occluders,...[...loaded.values()].flatMap(c=>c.occluders)];revision++;};
 const range=(p:Point,b:NonNullable<DistrictDefinition['chunks']>[number])=>Math.hypot(Math.max(b.minX-p.x,0,p.x-b.maxX),Math.max(b.minZ-p.z,0,p.z-b.maxZ));
 return {get assets(){return assets;},get occluders(){return occluders;},get revision(){return revision;},get loaded(){return [...loaded.keys()];},update(focus:Point,player:Point){const chunks=district.chunks??[];const wanted=chunks.length<=6?chunks:chunks.filter(chunk=>Math.min(range(focus,chunk),range(player,chunk))<(loaded.has(chunk.id)?300:240));let changed=false;for(const [id,group]of loaded)if(!wanted.some(c=>c.id===id)){group.dispose();loaded.delete(id);changed=true;}for(const chunk of wanted)if(!loaded.has(chunk.id)){loaded.set(chunk.id,composeAssets(context,chunk.assets));changed=true;}if(changed)refresh();},dispose(){for(const group of loaded.values())group.dispose();loaded.clear();core.dispose();refresh();}};
}
