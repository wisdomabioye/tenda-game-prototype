import {createAsset,type AssetPlacement} from '../core/asset';
import type {AssetContext} from '../core/context';
import {drawLettering} from '../signage/parts/lettering';
import {drawStairFlight} from './parts/stairs';
export type UrbanStyle='shop-house'|'apartments'|'terrace'|'tower'|'arcade';
export interface UrbanBuildingSpec extends AssetPlacement {width:number;depth:number;floors:number;color:string;style:UrbanStyle;name:string;accent?:string;}
/** Street wall + occupied floors + roof silhouette, all composed within one footprint. */
export function createUrbanBuilding(ctx:AssetContext,p:UrbanBuildingSpec){
 const {width:w,depth:d,floors,style}=p;
 if(![w,d,floors].every(Number.isFinite)||w<2.2||d<2.2||!Number.isInteger(floors)||floors<1||floors>12)throw new Error(`Invalid urban building dimensions: ${p.id} (${w} × ${d}, ${floors} floors)`);
 const floor=2.7,h=floors*floor,accent=p.accent??'#2e7f83',shop=style!=='apartments'&&w>=4;
 const asset=createAsset(ctx,p,g=>{
  const warm=g.context.material('#ffda95');warm.emissiveColor.set(.24,.13,.035);
  const front=-d/2+.28,upperWidth=style==='tower'?w*.76:w*.96,upperDepth=style==='tower'?d*.78:d*.94;
  g.box('pavement plinth',0,0,0,w,.16,d,'#b5b4a5');
  g.box('street level frontage',0,.16,0,w,2.65,d,p.color);
  if(floors>1)g.box('occupied upper volume',0,2.8,style==='tower'?d*.06:0,upperWidth,h-2.65,upperDepth,p.color);
  // Windows on every elevation; coloured reveals and banding break the plain-box silhouette.
  for(let level=1;level<floors;level++){
   const y=level*floor+.65,cols=Math.max(1,Math.floor(upperWidth/2));
   g.box('floor cornice',0,level*floor,0,upperWidth+.12,.12,upperDepth,'#f9ecd2');
   for(let j=0;j<cols;j++){
    const x=(j-(cols-1)/2)*(upperWidth/(cols+.25)),lit=(j+level)%4===0;
    for(const side of [-1,1]){
     g.box('window reveal',x,y-.1,side*(upperDepth/2+.025),upperWidth/(cols+1)*.8,1.48,.10,accent);
     g.box('occupied window',x,y,side*(upperDepth/2+.085),upperWidth/(cols+1)*.62,1.12,.06,lit?'#ffda95':'#99bdc6');
    }
   }
   for(const side of [-1,1])for(const z of [-upperDepth*.23,upperDepth*.23])g.box('side window',side*(upperWidth/2+.04),y,z,.08,1.2,upperDepth*.18,(level%3===0)?'#ffda95':'#99bdc6');
   if(style==='terrace'||style==='apartments'){
    g.box('balcony ledge',0,level*floor-.02,front+.33,w*.76,.14,.65,'#f9ecd2');
    g.box('balcony rail',0,level*floor+.25,front+.04,w*.76,.5,.06,accent);
    for(const x of [-w*.32,w*.32])g.box('balcony planting',x,level*floor+.18,front+.33,.5,.26,.28,'#73a080');
   }
  }
  for(const side of [-1,1]){
   for(const z of [-d*.24,d*.22])g.box('ground side glazing',side*(w/2+.025),.8,z,.065,1.25,d*.18,'#99bdc6');
   g.box('rear occupied window',side*w*.24,.8,d/2+.025,w*.22,1.2,.065,'#ffda95');
  }
  g.box('rear service entry',0,.16,d/2+.035,.75,1.95,.08,accent);
  if(shop){
   const bays=Math.max(1,Math.min(3,Math.floor(w/3))),bw=w/(bays+.15);
   for(let i=0;i<bays;i++){
    const x=(i-(bays-1)/2)*bw;
    g.box('shop frame',x,.3,front,bw*.87,2.18,.14,accent);
    g.box('shop glazing',x,.48,front-.09,bw*.71,1.72,.08,'#ffda95');
    g.box('door mullion',x,.3,front-.15,.09,2,.1,'#f9ecd2');
    g.box('fabric awning',x,2.25,front+.06,bw*.94,.16,.9,accent);
    for(let stripe=0;stripe<3;stripe++)g.box('awning stripe',x+(stripe-1)*bw*.25,2.42,front+.06,bw*.1,.025,.9,'#fff0d0');
   }
   if(p.name)drawLettering(g,{text:p.name,x:0,y:2.75,z:front-.18,width:w*.86,height:.42,background:accent,resolution:256});
   if(style==='arcade')for(const side of [-1,1])g.box('arcade pier',side*w*.43,.16,front+.2,.22,2.4,.3,'#f9ecd2');
  }else{
   g.box('entry portal',0,.16,front,1.1,2.2,.16,accent);
   g.box('lit entry transom',0,2.4,front-.03,1.2,.22,.1,'#ffda95');
  }
  g.box('roof cornice',0,h+.12,0,upperWidth+.2,.2,upperDepth+.16,'#f9ecd2');
  if(style==='tower'){
   g.box('setback crown',0,h+.3,d*.06,w*.48,2.2,d*.5,accent);
   g.box('crown cap',0,h+2.5,d*.06,w*.55,.18,d*.56,'#f9ecd2');
   for(const side of [-1,1])g.box('vertical facade fin',side*upperWidth*.39,2.9,-upperDepth/2-.1,.16,h-2.4,.25,accent);
  }else if(style==='shop-house'){
   const roof=g.box('pitched roof',0,h+.35,0,w*.98,.18,d*.98,'#b66d52');roof.rotation.x=.09;
   g.box('stepped parapet',0,h+.25,-d*.45,w*.72,.65,.15,p.color);
  }else{
   for(const side of [-1,1])g.box('roof parapet',side*(upperWidth/2-.1),h+.25,0,.16,.5,upperDepth,'#ded5bc');
   g.box('roof service room',w*.2,h+.3,d*.18,w*.25,.8,d*.28,accent);
   if(w>5){g.cylinder('roof water tank',-w*.24,h+.3,d*.2,.45,.85,'#3d5660');g.box('roof solar',0,h+.45,-d*.14,w*.28,.1,d*.25,'#365e73');}
  }
  if(style==='terrace'&&w>7&&floors>1)drawStairFlight(g,{x:w*.39,z:d*.34,base:.16,rise:floor,run:-d*.6,width:w*.16});
  g.batch();
 },{entrances:[{id:'front',position:{x:0,y:0,z:-d/2-.3}}],collision:[{min:{x:-w/2,y:0,z:-d/2},max:{x:w/2,y:h+3,z:d/2}}],occlusion:[{min:{x:-w/2,y:0,z:-d/2},max:{x:w/2,y:h+3,z:d/2}}]});
 for(const mesh of asset.meshes)if(['#99bdc6','#ffda95'].includes(mesh.material?.name??''))mesh.addLODLevel(150,null);
 return asset;
}
