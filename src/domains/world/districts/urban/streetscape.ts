import {samplePlace} from '../../../places/authoring/sample';
import {createLocalProjection} from '../../../geography/projection/local';
import {insideRing} from '../../../geography/spatial/polygon';
import type {DistrictDefinition} from '../shared/types';
import type {AssetSpec} from '../../assets/registry';
import type {UrbanStyle} from '../../assets/buildings/urban';
import {rectangleFootprint,rectanglesOverlap} from '../../../geography/spatial/rectangles';
import {distance,projectOnSegment,type Point} from '../../navigation/routes';
import {refreshChunks} from '../configured/refreshChunks';
const styles:UrbanStyle[]=['shop-house','terrace','apartments','arcade','tower'];
const colours=['#dba98c','#e8cc99','#92b8b5','#c1b5ce','#b6c5a3','#cf8b79'];
const shopNames=['PALM STORES','STUDIO GOODS','CORNER BAKERY','MAKER SUPPLIES','NEIGHBOUR CAFE','BOOKS & PRINT'];
export interface StreetscapeOptions {maxInfill:number;spacing:number;}
/** Authored-looking streetside infill, deterministic and bounded; never sourced building claims. */
export function enrichStreetscape(district:DistrictDefinition,sourceFootprints:Point[][]=[],options:StreetscapeOptions={maxInfill:64,spacing:10}):DistrictDefinition{
 const linked=new Set(district.places?.map(p=>p.building.assetId)),assets:AssetSpec[]=[],bounds=district.geographic!.bounds!;
 const demoPoint=createLocalProjection(district.geographic!.origin,district.geographic!.worldUnitsPerMetre).forward(samplePlace);
 const demoLot=rectangleFootprint(demoPoint,8,8,0);
 const walkingCorridors=district.network.map(([a,b])=>rectangleFootprint({x:(a.x+b.x)/2,y:0,z:(a.z+b.z)/2},distance(a,b)+.4,3.4,Math.atan2(-(b.z-a.z),b.x-a.x)));
 const upgraded=new Set<string>();let index=0;
 for(const asset of district.assets){
  if((asset.kind==='house'||asset.kind==='storeyed')&&!linked.has(asset.id)){
   const style=asset.kind==='storeyed'?(asset.floors>5?'tower':'terrace'):styles[index%4];
   let width=asset.width*.95,depth=asset.depth*.95;
   const plot=asset.position&&sourceFootprints.find(poly=>insideRing(asset.position!,poly));
   if(plot)for(let step=0;step<6;step++){
    const w=width*1.1,d=depth*1.1,ring=rectangleFootprint(asset.position!,w+.3,d+.3,asset.rotationY??0);
    if(w>14||d>13||!ring.every(p=>insideRing(p,plot))||rectanglesOverlap(ring,demoLot)||walkingCorridors.some(road=>rectanglesOverlap(ring,road)))break;width=w;depth=d;
   }
   assets.push({kind:'urban',id:asset.id,position:asset.position,rotationY:asset.rotationY,width,depth,floors:asset.kind==='storeyed'?asset.floors:1+index%4,color:colours[index%colours.length],accent:['#307a80','#a75045','#507260'][index%3],style,name:shopNames[index%shopNames.length]});upgraded.add(asset.id);index++;
  }else assets.push(asset);
 }
 // Old roof accessories belong to the volumes replaced above.
 for(let i=assets.length-1;i>=0;i--){const id=assets[i].id??'';if((id.startsWith('tank-')||id.startsWith('solar-'))&&upgraded.has('crafted-'+id.replace(/^(tank|solar)-/,'')))assets.splice(i,1);}
 const buildingRings=[demoLot,...assets.filter(a=>a.position&&'width'in a&&'depth'in a&&['urban','house','storeyed','restaurant','mall'].includes(a.kind)).map(a=>rectangleFootprint(a.position!,('width'in a?(a.width??0):0)+1,('depth'in a?(a.depth??0):0)+1,a.rotationY??0))];
 const roadRings=assets.filter((a):a is Extract<AssetSpec,{kind:'road'}>=>a.kind==='road').map(({segment:[a,b],width})=>rectangleFootprint({x:(a.x+b.x)/2,y:0,z:(a.z+b.z)/2},distance(a,b)+.8,Math.max(5,(width??2)+1),Math.atan2(-(b.z-a.z),b.x-a.x)));
 const sourceRings=sourceFootprints.map(poly=>{const x=poly.map(p=>p.x),z=poly.map(p=>p.z);return rectangleFootprint({x:(Math.min(...x)+Math.max(...x))/2,y:0,z:(Math.min(...z)+Math.max(...z))/2},Math.max(...x)-Math.min(...x),Math.max(...z)-Math.min(...z),0);});
 // Populate source plots that the old near-spawn cap left completely unrendered.
 let plots=0;
 for(const poly of sourceFootprints){
  if(assets.some(a=>a.position&&['house','urban','storeyed','restaurant','mall'].includes(a.kind)&&insideRing(a.position,poly)))continue;
  let longest=0,angle=0;for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],length=distance(a,b);if(length>longest){longest=length;angle=Math.atan2(-(b.z-a.z),b.x-a.x);}}
  const c=Math.cos(angle),sn=Math.sin(angle),local=poly.map(p=>({x:p.x*c-p.z*sn,z:p.x*sn+p.z*c}));
  const minX=Math.min(...local.map(p=>p.x)),maxX=Math.max(...local.map(p=>p.x)),minZ=Math.min(...local.map(p=>p.z)),maxZ=Math.max(...local.map(p=>p.z));
  const u=(minX+maxX)/2,v=(minZ+maxZ)/2,position={x:u*c+v*sn,y:0,z:-u*sn+v*c};
  let w=Math.min(12,(maxX-minX)*.85),d=Math.min(11,(maxZ-minZ)*.85),ring=rectangleFootprint(position,w,d,angle);
  while(w>3&&d>3&&!ring.every(p=>insideRing(p,poly))){w*=.85;d*=.85;ring=rectangleFootprint(position,w,d,angle);}
  if(w<3||d<3||!ring.every(p=>insideRing(p,poly))||[...buildingRings,...roadRings].some(other=>rectanglesOverlap(ring,other))||assets.some(a=>a.position&&!['road','slab','house','urban','storeyed','restaurant','mall','tank','solar'].includes(a.kind)&&distance(a.position,position)<Math.hypot(w,d)/2+2))continue;
  assets.push({kind:'urban',id:`urban/source-plot/${plots}`,position,rotationY:angle,width:w,depth:d,floors:2+plots%5,color:colours[plots%colours.length],style:styles[plots%styles.length],name:shopNames[plots%shopNames.length]});buildingRings.push(rectangleFootprint(position,w+1,d+1,angle));plots++;
 }
 const occupied=[...buildingRings,...sourceRings];
 const furniture=assets.filter(a=>a.position&&!['road','slab','house','storeyed','urban','restaurant','mall','tank','solar'].includes(a.kind)).map(a=>({p:a.position!,radius:a.kind==='pergola'?7:2}));
 const inBounds=(ring:Point[])=>ring.every(p=>p.x>bounds.minX+1&&p.x<bounds.maxX-1&&p.z>bounds.minZ+1&&p.z<bounds.maxZ-1);
 let added=0;
 for(const segment of district.network){
  const [a,b]=segment,len=distance(a,b);if(len<12||Math.abs(a.y-b.y)>.01)continue;
  const tx=(b.x-a.x)/len,tz=(b.z-a.z)/len;
  for(let t=6;t<len-3;t+=options.spacing)for(const side of [-1,1]){
   if(added>=options.maxInfill)break;
   const w=7+(added%3)*1.2,d=7.5+(added%2)*1.5,offset=d/2+4;
   const position={x:a.x+tx*t-tz*side*offset,y:0,z:a.z+tz*t+tx*side*offset},rotationY=Math.atan2(-tz*side,tx*side),ring=rectangleFootprint(position,w+1,d+1,rotationY);
   if(!inBounds(ring)||[...occupied,...roadRings].some(other=>rectanglesOverlap(ring,other))||furniture.some(({p,radius})=>insideRing(p,ring)||ring.some((q,i)=>distance(p,projectOnSegment(p,[q,ring[(i+1)%4]]))<radius)))continue;
   const style=styles[added%styles.length],floors=style==='tower'?6+added%4:style==='arcade'?1:2+added%3;
   assets.push({kind:'urban',id:`urban/infill/${added}`,position,rotationY,width:w,depth:d,floors,color:colours[added%colours.length],style,name:shopNames[added%shopNames.length],accent:['#347b80','#b66b45','#526c99'][added%3]});occupied.push(ring);added++;
  }
 }
 // Sidewalk furniture: keep every existing route and mission entrance corridor clear.
 const clearPoint=(p:Point,radius:number)=>inBounds(rectangleFootprint(p,radius*2,radius*2,0))&&!occupied.some(r=>rectanglesOverlap(rectangleFootprint(p,radius*2,radius*2,0),r))&&district.network.every(s=>distance(p,projectOnSegment(p,s))>2.4+radius)&&furniture.every(f=>distance(p,f.p)>radius+f.radius);
 let lamps=0,palms=0;
 for(const [a,b]of district.network){const len=distance(a,b);if(len<14||Math.abs(a.y-b.y)>.01)continue;const tx=(b.x-a.x)/len,tz=(b.z-a.z)/len;
  for(let t=4;t<len-3;t+=16){const side=(lamps+palms)%2?1:-1,p={x:a.x+tx*t-tz*side*3.8,y:0,z:a.z+tz*t+tx*side*3.8};
   if(clearPoint(p,.35)&&lamps<36){assets.push({kind:'streetLamp',id:`urban/lamp/${lamps++}`,position:p});furniture.push({p,radius:.6});}
   const q={x:a.x+tx*(t+5)+tz*side*4.5,y:0,z:a.z+tz*(t+5)-tx*side*4.5};
   if(clearPoint(q,1.3)&&palms<30){assets.push({kind:'palm',id:`urban/palm/${palms++}`,position:q,height:4.8+palms%3});furniture.push({p:q,radius:1.6});}
  }
 }
 return refreshChunks({...district,assets,geographic:{...district.geographic!,name:district.geographic!.name+' · illustrative urban streetscape'}});
}
