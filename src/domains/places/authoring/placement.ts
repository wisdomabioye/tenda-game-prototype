import {rectangleFootprint as footprint,rectanglesOverlap} from '../../geography/spatial/rectangles';
export {rectanglesOverlap} from '../../geography/spatial/rectangles';
import type {DistrictDefinition} from '../../world/districts/shared/types';
import type {AssetSpec} from '../../world/assets/registry';
import {createLocalProjection} from '../../geography/projection/local';
import {insideRing} from '../../geography/spatial/polygon';
import {distance,projectOnSegment,type Point} from '../../world/navigation/routes';
import {attachPlaceCatalogue} from '../world/compose';
export interface AuthoredPlace {id:string;name:string;type:'restaurant'|'mall'|'office'|'shop'|'landmark';latitude:number;longitude:number;width:number;depth:number;rotation:number;floors:number;color:string;}
export function addAuthoredPlace(district:DistrictDefinition,input:AuthoredPlace):DistrictDefinition{
    const g=district.geographic,bounds=g?.bounds;
    if(!g||!bounds)throw new Error('Coordinate authoring is available in the Victoria Island map pilot.');
    if(!/^[a-z][a-z0-9-]{2,39}$/.test(input.id)||!input.name.trim()||input.name.length>60)throw new Error('Use a unique lowercase ID (3–40 characters) and a name up to60 characters.');
    if(!['restaurant','mall','office','shop','landmark'].includes(input.type)||!/^#[0-9a-f]{6}$/i.test(input.color)||![input.width,input.depth,input.rotation,input.floors].every(Number.isFinite)||input.width<4||input.width>12||input.depth<4||input.depth>12||Math.abs(input.rotation)>180||!Number.isInteger(input.floors)||input.floors<2||input.floors>8)throw new Error('Use4–12 unit dimensions,2–8 office floors and a valid colour/rotation.');
    if(district.places?.some(p=>p.id===input.id))throw new Error('A place with this ID already exists.');
    const projection=createLocalProjection(g.origin,g.worldUnitsPerMetre),position=projection.forward({latitude:input.latitude,longitude:input.longitude}),angle=input.rotation*Math.PI/180,ring=footprint(position,input.width,input.depth,angle);
    if(ring.some(p=>p.x<bounds.minX||p.x>bounds.maxX||p.z<bounds.minZ||p.z>bounds.maxZ))throw new Error('The whole building must fit inside this map patch.');
    for(const asset of district.assets){
        if(asset.position&&'width'in asset&&'depth'in asset&&['house','storeyed','restaurant','mall','urban'].includes(asset.kind)&&rectanglesOverlap(ring,footprint(asset.position,asset.width,asset.depth,asset.rotationY??0)))throw new Error('Building overlaps an existing building. Choose another coordinate.');
        if(asset.position&&['bench','tree','palm','streetLamp','bed','pergola','streetSign','stall','planter'].includes(asset.kind)&&(insideRing(asset.position,ring)||ring.some((p,i)=>distance(asset.position!,projectOnSegment(asset.position!,[p,ring[(i+1)%ring.length]]))<2)))throw new Error('Building overlaps street furniture or planting.');
    }
    for(const segment of district.network){const [a,b]=segment,length=distance(a,b),road=footprint({x:(a.x+b.x)/2,y:0,z:(a.z+b.z)/2},length,4,Math.atan2(-(b.z-a.z),b.x-a.x));if(rectanglesOverlap(ring,road)||segment.some(p=>insideRing(p,ring))||ring.some((p,i)=>distance(p,projectOnSegment(p,segment))<2||segment.some(q=>distance(q,projectOnSegment(q,[p,ring[(i+1)%ring.length]]))<2)))throw new Error('Building overlaps a road or walking path. Keep a clear setback.');}
    const id=`authored/${district.id}/${input.id}`,base:AssetSpec=(input.type==='office'||input.type==='landmark')?{kind:'storeyed',id,position,width:input.width,depth:input.depth,floors:input.floors,color:input.color,style:'office',rotationY:angle}:{kind:'house',id,position,width:input.width,depth:input.depth,height:3.4,color:input.color,rotationY:angle};
    const record={id:input.id,name:input.name.trim(),type:input.type,coordinate:{latitude:input.latitude,longitude:input.longitude},building:{assetId:id,kind:input.type==='shop'?'restaurant' as const:input.type==='landmark'?'office' as const:input.type},entrance:{x:0,z:-input.depth/2-.3},missionIds:[]};
    const result=attachPlaceCatalogue({...district,assets:[...district.assets,base]},{projection},{version:1,cityId:district.id,sample:true,places:[record]});
    if(!result.places?.find(p=>p.id===input.id)?.reachable)throw new Error('No clear short entrance path reaches the walking network. Try another position or rotation.');
    return result;
}
export function applyAuthoredPlaces(base:DistrictDefinition,records:AuthoredPlace[]){return records.reduce(addAuthoredPlace,base);}
