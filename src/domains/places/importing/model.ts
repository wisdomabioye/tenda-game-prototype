import {addAuthoredPlace,type AuthoredPlace} from '../authoring/placement';
import type {DistrictDefinition} from '../../world/districts/shared/types';
/** Atomic import: no mutation or partial apply if any record fails. */
export function validatePlaceImport(raw:unknown,district:DistrictDefinition):AuthoredPlace[]{
 const data=raw as {version?:unknown;cityId?:unknown;sample?:unknown;authoredPlaces?:unknown};
 if(!data||(data.sample!==undefined&&data.sample!==true)||data.version!==1||data.cityId!==district.id||!Array.isArray(data.authoredPlaces)||data.authoredPlaces.length>25||!data.authoredPlaces.length)throw new Error('Expected version1, matching cityId and1–25 authoredPlaces.');
 let result=district;
 return data.authoredPlaces.map((record,index)=>{try{if(!record||typeof record!=='object')throw new Error('Place must be an object');const p=record as AuthoredPlace;if(typeof p.id!=='string'||typeof p.name!=='string'||typeof p.latitude!=='number'||typeof p.longitude!=='number')throw new Error('ID, name and numeric coordinates required');result=addAuthoredPlace(result,p);return p;}catch(error){throw new Error(`Place ${index+1}: ${error instanceof Error?error.message:'Invalid record'}`);}});
}

export function parsePlaceImport(text:string,district:DistrictDefinition){if(text.length>100000)throw new Error('JSON limit:100 KB');return validatePlaceImport(JSON.parse(text),district);}
