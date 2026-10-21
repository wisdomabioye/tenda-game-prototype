import {distance,walkingRoute,type Point} from '../navigation/routes';
import type {DistrictDefinition} from '../districts/shared/types';
/** Reachable, distributed street stops, respecting source graph grade separation. */
export function pedestrianStops(district:DistrictDefinition):Point[]{
 const all=[...district.network.flatMap(segment=>[...segment]),...(district.places??[]).filter(p=>p.reachable).map(p=>p.arrival)];
 const unique=all.filter((p,i)=>all.findIndex(q=>distance(p,q)<.1)===i);
 const stride=Math.max(1,Math.ceil(unique.length/40));
 return unique.filter((_,i)=>i%stride===0).filter(p=>distance(p,district.settings.spawn)<.12||walkingRoute(district.settings.spawn,p,district.network).length>0);
}
export function choosePedestrianStop(current:Point,previous:Point,stops:Point[],sequence:number):Point|undefined{
 const candidates=stops.filter(p=>distance(p,current)>12&&distance(p,previous)>1);
 const choices=candidates.length?candidates:stops.filter(p=>distance(p,current)>1);
 return choices.length?choices[(sequence*13)%choices.length]:undefined;
}
