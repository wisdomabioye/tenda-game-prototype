import {baselineSettings,type DistrictDefinition} from '../shared/types';
import {venues} from './venues';
import {baselineAssets,baselineFurniture} from './definition';
import {streets} from './network';
export function resolveBaseline(place:{id:string;ground:string},categories:ReadonlySet<string>):DistrictDefinition{
 const activeVenues=place.id==='remote'?venues.filter(v=>categories.has(v.category)):venues;
 return {id:place.id,settings:baselineSettings(false),largeGround:false,network:streets,venues:activeVenues,landmarks:[],assets:[...baselineAssets(place.ground,activeVenues),...baselineFurniture()]};
}
