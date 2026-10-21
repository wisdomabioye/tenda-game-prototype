import type {DistrictDefinition} from '../districts/shared/types';
import {createBoundedCache} from './requests';
const cache=createBoundedCache<DistrictDefinition>(4);
export async function loadDistrict(place:{id:string;ground:string},categories:ReadonlySet<string>,selection:string,signal:AbortSignal){
 const key=`${place.id}:${selection}:${place.ground}:${[...categories].sort().join(',')}`;
 const check=()=>{if(signal.aborted)throw new DOMException('Cancelled','AbortError');};
 check();const cached=cache.get(key);if(cached)return cached;
 let result:DistrictDefinition;
 if(place.id==='lagos'&&selection==='city'){
  const {createLagosCity}=await import('../districts/configured/city');check();result=createLagosCity();
 }else if(place.id==='lagos'&&selection==='waterfront'){
  const {resolveWaterfront}=await import('../districts/lagos-waterfront/resolve');check();result=resolveWaterfront(place.ground);
 }else if(place.id==='lagos'){
  const {victoriaIslandDistrict}=await import('../districts/lagos-victoria-island/definition');check();result=victoriaIslandDistrict();
 }else{
  const {resolveBaseline}=await import('../districts/baseline/resolve');check();result=resolveBaseline(place,categories);
 }
 check();cache.set(key,result);return result;
}
