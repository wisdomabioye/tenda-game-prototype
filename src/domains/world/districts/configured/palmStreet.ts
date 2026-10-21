import config from './palm-street.json';
import {createDistrict,type DistrictParameters} from './createDistrict';
import type {DistrictDefinition} from '../shared/types';
import type {AssetSpec} from '../../assets/registry';
import type {UrbanStyle} from '../../assets/buildings/urban';
/** Reuse district validation/catalogue entrances, then choose each kit style from data. */
export function createPalmStreet(frame:NonNullable<DistrictDefinition['geographic']>){
 const district=createDistrict(config as DistrictParameters,frame);
 const assets:AssetSpec[]=district.assets.map(asset=>{
  const building=config.buildings.find(b=>`palm-street/${b.id}`===asset.id);
  if(building)return {kind:'urban',id:asset.id,position:asset.position,rotationY:asset.rotationY,width:building.width,depth:building.depth,floors:building.floors,color:building.color,style:building.urbanStyle as UrbanStyle,name:building.name};
  if(asset.kind==='slab')return {...asset,position:{...asset.position!,y:-.17}};
  return asset;
 });
 return {...district,assets};
}
