import {victoriaIslandDistrict} from '../lagos-victoria-island/definition';
import {resolveBaseline} from '../baseline/resolve';
import type {DistrictDefinition} from './types';
export {resolveWaterfront} from '../lagos-waterfront/resolve';
export type {DistrictDefinition} from './types';
let pilot:DistrictDefinition|undefined;
/** Synchronous compatibility entry; runtime uses isolated async district loaders. */
export function resolveDistrict(place:{id:string;ground:string},categories:ReadonlySet<string>):DistrictDefinition{
 return place.id==='lagos'?(pilot??=victoriaIslandDistrict()):resolveBaseline(place,categories);
}
