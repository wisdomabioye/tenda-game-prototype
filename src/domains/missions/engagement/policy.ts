import {categories} from '../../../contracts/tenda/browse';
import type {Mission} from '../model/mission';
export interface Watchlist {remote:boolean;city:string;category:string;quiet:boolean;quietStart?:string;quietEnd?:string;}
export function inQuietHours(start:string|undefined,end:string|undefined,now:Date){if(!start||!end||!/^([01]\d|2[0-3]):[0-5]\d$/.test(start)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(end))return false;const minute=(s:string)=>Number(s.slice(0,2))*60+Number(s.slice(3)),a=minute(start),b=minute(end),t=now.getHours()*60+now.getMinutes();return a===b?false:a<b?t>=a&&t<b:t>=a||t<b;}
export function matches(m:Mission,w:Watchlist,now=new Date()){return !w.quiet&&!inQuietHours(w.quietStart,w.quietEnd,now)&&(w.category==='all'||m.category===w.category)&&(m.remote?w.remote:m.city===w.city);}

export const watchCities=['Lagos','Nairobi','Accra','Johannesburg'] as const;
export const defaultWatchlist:Watchlist={remote:true,city:'Lagos',category:'all',quiet:false};
export function parseWatchlist(raw:unknown):Watchlist{
 const p=raw&&typeof raw==='object'?raw as Record<string,unknown>:{};
 return {remote:p.remote!==false,city:typeof p.city==='string'&&watchCities.some(city=>city===p.city)?p.city:'Lagos',category:typeof p.category==='string'&&['all',...categories].includes(p.category)?p.category:'all',quiet:p.quiet===true,quietStart:typeof p.quietStart==='string'?p.quietStart:'',quietEnd:typeof p.quietEnd==='string'?p.quietEnd:''};
}
