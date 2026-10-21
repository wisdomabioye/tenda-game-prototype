import {createStreetSign} from '../../world/assets/signage/streetSign';
import {createAsset} from '../../world/assets/core/asset';
import type {AssetContext} from '../../world/assets/core/context';
import type {DistrictDefinition} from '../../world/districts/shared/types';
/** Cosmetic hunt response, independent of paid mission outcomes. */
export function createHuntWorld(context:AssetContext,district:DistrictDefinition){
 let objects:{dispose:()=>void}[]=[],key='';
 return {set(target:string|null,complete:boolean){const next=`${target}:${complete}`;if(next===key)return;key=next;objects.forEach(o=>o.dispose());objects=[];
 const p=district.places?.find(p=>p.id===(complete?'maker-quarter-building-0':target));if(!p)return;
 objects.push(createStreetSign(context,{id:'hunt-clue-sign',position:{x:p.arrival.x+1.8,y:0,z:p.arrival.z},name:complete?'Reading corner ✦':'Palm Parcel clue',crossStreet:complete?'Everyone has a story':'Open your hunt journal'}));
 if(complete)objects.push(createAsset(context,{id:'reading-corner-keepsake',position:{x:p.arrival.x+3,y:0,z:p.arrival.z+.5}},g=>{g.box('book table',0,0,0,2,.65,.65,'#b58b62');for(let i=0;i<3;i++)g.box('colourful book display',-.6+i*.6,.65,0,.45,.7,.3,['#d78060','#558b9d','#e8bc59'][i]);g.box('reading corner plaque',0,1.5,0,2,.35,.16,'#ffd447');g.batch();}));
 },dispose(){objects.forEach(o=>o.dispose());objects=[];}};
}
