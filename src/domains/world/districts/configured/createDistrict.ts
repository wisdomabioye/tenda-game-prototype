import {connectAuthoredStreets} from '../../navigation/authoredNetwork';
import {attachPlaceCatalogue} from '../../../places/world/compose';
import {createLocalProjection} from '../../../geography/projection/local';
import {rectangleFootprint,rectanglesOverlap} from '../../../geography/spatial/rectangles';
import type {DistrictDefinition} from '../shared/types';
import type {AssetSpec} from '../../assets/registry';
import type {Point,Segment} from '../../navigation/routes';
import {distance} from '../../navigation/routes';
export interface DistrictParameters {
    id:string;
    cityId:string;
    name:string;
    bounds:{minX:number;maxX:number;minZ:number;maxZ:number};
    roads:{id:string;name:string;points:Point[];width:number}[];
    buildings:{id:string;name:string;kind:'restaurant'|'mall'|'office';position:Point;width:number;depth:number;floors:number;color:string;rotation?:number;missionIds?:string[]}[];
    benches:Point[];
    trees:Point[];
    spawn:Point;
}
/** Configure a district using shared kits and one coordinate frame; no renderer duplication. */
export function createDistrict(config:DistrictParameters,frame:NonNullable<DistrictDefinition['geographic']>):DistrictDefinition {
    const bounds=config.bounds;
    if(!config.id||!config.cityId||![bounds.minX,bounds.maxX,bounds.minZ,bounds.maxZ].every(Number.isFinite)||bounds.maxX<=bounds.minX||bounds.maxZ<=bounds.minZ)throw new Error('Invalid district identity/bounds');
    const inside=(p:Point)=>[p.x,p.y,p.z].every(Number.isFinite)&&p.x>=bounds.minX&&p.x<=bounds.maxX&&p.z>=bounds.minZ&&p.z<=bounds.maxZ;
    if(!inside(config.spawn))throw new Error('Spawn outside district');
    const ids=new Set<string>();
    const unique=(id:string)=>{if(!id||ids.has(id))throw new Error('Invalid/duplicate district object ID: '+id);ids.add(id);};
    const assets:AssetSpec[]=[],network:Segment[]=[],landmarks:DistrictDefinition['landmarks'][number][]=[];
    const roadFootprints:Point[][]=[],buildingFootprints:Point[][]=[];
    for(const road of config.roads){
        unique(road.id);
        if(!Number.isFinite(road.width)||road.width<1||road.width>12||road.points.length<2||road.points.some(p=>!inside(p)))throw new Error('Invalid road '+road.id);
        for(let i=1;i<road.points.length;i++){
            const segment:Segment=[road.points[i-1],road.points[i]],length=distance(...segment);
            if(length<.01)throw new Error('Zero length road');
            network.push(segment);
            assets.push({kind:'road',id:`${config.id}/${road.id}/${i}`,segment,width:road.width});
            const [a,b]=segment;
            roadFootprints.push(rectangleFootprint({x:(a.x+b.x)/2,y:0,z:(a.z+b.z)/2},length,road.width,Math.atan2(-(b.z-a.z),b.x-a.x)));
        }
        const point=road.points[0];
        landmarks.push({id:`${config.id}/${road.id}`,name:road.name,...point});
        assets.push({kind:'streetSign',id:`${config.id}/sign/${road.id}`,position:{...point,x:point.x+3},name:road.name});
    }
    for(const building of config.buildings){
        unique(building.id);
        const rotation=(building.rotation??0)*Math.PI/180;
        if(!['restaurant','mall','office'].includes(building.kind)||![building.width,building.depth,building.floors,rotation].every(Number.isFinite)||building.width<4||building.depth<4||!Number.isInteger(building.floors)||building.floors<2||building.floors>12||!/^#[0-9a-f]{6}$/i.test(building.color))throw new Error('Invalid building '+building.id);
        const footprint=rectangleFootprint(building.position,building.width,building.depth,rotation);
        if(footprint.some(p=>!inside(p))||[...roadFootprints,...buildingFootprints].some(other=>rectanglesOverlap(footprint,other)))throw new Error('Building outside bounds or overlaps a road/building: '+building.id);
        buildingFootprints.push(footprint);
        const common={id:`${config.id}/${building.id}`,position:building.position,width:building.width,depth:building.depth,color:building.color,rotationY:rotation};
        assets.push(building.kind==='office'?{...common,kind:'storeyed',floors:building.floors,style:'office'}:{...common,kind:'house',height:3.4});
    }
    for(const [kind,points]of [['bench',config.benches],['tree',config.trees]] as const){
        points.forEach((position,i)=>{
            if(!inside(position))throw new Error('Scenery outside district');
            assets.push({kind,id:`${config.id}/${kind}/${i}`,position});
        });
    }
    const width=bounds.maxX-bounds.minX,depth=bounds.maxZ-bounds.minZ,center={x:(bounds.minX+bounds.maxX)/2,y:0,z:(bounds.minZ+bounds.maxZ)/2};
    assets.push({kind:'slab',id:`${config.id}/ground`,name:config.name,position:{...center,y:-.15},width,depth,height:.15,color:'#e9d7b6'});
    const district:DistrictDefinition={
        id:config.cityId,assets,network:connectAuthoredStreets(network),venues:[],landmarks,largeGround:true,
        geographic:{...frame,bounds,name:config.name},
        settings:{spawn:config.spawn,ground:{width,depth,center},pan:bounds,camera:{maxRadius:450,overview:320,desktopOverview:165,adventure:66,mobileAdventure:90,initial:80,mobileInitial:105},walkSpeed:9,fog:{start:450,end:900}},
    };
    const projection=createLocalProjection(frame.origin,frame.worldUnitsPerMetre);
    const catalogue={version:1,cityId:config.cityId,sample:true,places:config.buildings.map(building=>({
        id:`${config.id}-${building.id}`,name:building.name,type:building.kind,
        coordinate:projection.inverse(building.position),
        building:{assetId:`${config.id}/${building.id}`,kind:building.kind},
        entrance:{x:0,z:-building.depth/2-.3},missionIds:building.missionIds??[],
    }))};
    const result=attachPlaceCatalogue(district,{projection},catalogue);
    if(result.places?.some(place=>!place.reachable))throw new Error('Configured building has no clear entrance path');
    return result;
}
