import {missions as existing} from './fixtures';
import config from '../../domains/world/districts/configured/maker-quarter.json';
import {createLocalProjection} from '../../domains/geography/projection/local';
import type {Mission} from '../../domains/missions/model/mission';
/** Mock adapter boundary. Replace this provider, not the renderer, with the Tenda API. */
const projection=createLocalProjection({latitude:6.4325,longitude:3.422},.25);
export const missions:Mission[]=[...existing,...config.buildings.map((building,i)=>({...existing.find(m=>m.country==='NG'&&m.city==='Lagos')!,escrow_id:building.missionIds[0],title:['Review a sample shop menu','Photograph a mock mall display','Test a sample office directory','Check sample packaging labels','Inspect a demo service form','Review a sample event notice'][i],description:'Mock Tenda gig at an illustrative building. Read requirements before saving; no real work is assigned in this prototype.',category:['digital','photo','service','errand','digital','photo'][i] as Mission['category'],country:'NG',city:'Lagos',remote:false,latitude:projection.inverse(building.position).latitude,longitude:projection.inverse(building.position).longitude,requires_approval:i%2===0,district:config.name}))];
