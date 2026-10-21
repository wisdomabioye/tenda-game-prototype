import {connectAuthoredStreets} from '../../navigation/authoredNetwork';
import palmConfig from './palm-street.json';
import {createPalmStreet} from './palmStreet';
import {enrichStreetscape} from '../urban/streetscape';
import {refreshChunks} from './refreshChunks';
import type {AssetSpec} from '../../assets/registry';
import {createDistrict,type DistrictParameters} from './createDistrict';
import config from './maker-quarter.json';
import {clearConnection} from '../geographic/connections';
import {victoriaIslandDistrict,pilotMap} from '../lagos-victoria-island/definition';
import {distance,type Point,type Segment} from '../../navigation/routes';
/** Same projection/origin, explicit shared portal, no fabricated OSM street claims. */
export function createLagosCity(){
 const base=victoriaIslandDistrict(),frame=base.geographic!,extension=createDistrict(config as DistrictParameters,frame),palm=createPalmStreet(frame),b=frame.bounds!;
 const points=base.network.flat(),outsideX=b.maxX+2;
 const closest=points.sort((a,c)=>c.x-a.x).find(p=>clearConnection(pilotMap,[p,{x:outsideX,y:0,z:p.z}],base.assets));
 if(!closest)throw new Error('No collision-free eastern game connector');
 const exit:Point={x:outsideX,y:0,z:closest.z},portal:Point={...config.roads[0].points[0]};
 // Keep the connector outside mapped building footprints; it is explicitly a game passage.
 const links:Segment[]=[[closest,exit],[exit,{x:outsideX,y:0,z:0}],[{x:outsideX,y:0,z:0},portal]];
 const all=[...base.network,...connectAuthoredStreets([...links.filter(([a,b])=>distance(a,b)>.01),...extension.network,...palm.network])];
 const key=(p:Point)=>`${p.x.toFixed(7)},${p.y.toFixed(7)},${p.z.toFixed(7)}`,nodes=new Map<string,string>();
 all.flat().forEach(p=>{if(p.nodeId&&!nodes.has(key(p)))nodes.set(key(p),p.nodeId);});
 const identify=(p:Point)=>{if(p.nodeId)return p;const k=key(p),nodeId=nodes.get(k)??`extension/${k}`;nodes.set(k,nodeId);return {...p,nodeId};};
 const network:Segment[]=all.map(([a,b])=>[identify(a),identify(b)]);
 const assets:AssetSpec[]=[...base.assets,...extension.assets,...palm.assets,...links.filter(([a,c])=>distance(a,c)>.01).map((segment,i)=>({kind:'road' as const,id:`extension-connector-${i}`,segment,width:2}))];
 const chunks=[{id:'victoria-west',minX:b.minX,maxX:0,minZ:b.minZ,maxZ:b.maxZ},{id:'victoria-east',minX:0,maxX:b.maxX,minZ:b.minZ,maxZ:b.maxZ},{id:'maker-quarter',...config.bounds},{id:'palm-street',...palmConfig.bounds,minX:203}].map(bounds=>({...bounds,assets:[]}));
 return enrichStreetscape(refreshChunks({...base,frameId:'lagos-shared-frame',network,assets,chunks,places:[...(base.places??[]),...(extension.places??[]),...(palm.places??[])],landmarks:[...base.landmarks,...extension.landmarks,...palm.landmarks],geographic:{...frame,name:'Victoria Island + illustrative Maker Quarter',bounds:{...b,maxX:palmConfig.bounds.maxX}},settings:{...base.settings,pan:{...base.settings.pan,maxX:palmConfig.bounds.maxX+12},ground:{...base.settings.ground,width:palmConfig.bounds.maxX-b.minX+16},camera:{...base.settings.camera,maxRadius:520}}}),pilotMap.buildings.map(b=>b.points));
}
