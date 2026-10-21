import {createAsset,type AssetPlacement} from '../core/asset';
import type {AssetContext} from '../core/context';
export function createStreetLamp(ctx:AssetContext,p:AssetPlacement){
 return createAsset(ctx,p,g=>{
  const glow=g.context.material('#ffe2a3');glow.disableLighting=true;glow.emissiveColor.set(1,.75,.38);
  g.cylinder('lamp base',0,0,0,.24,.22,'#344d59');
  g.cylinder('lamp pole',0,.2,0,.07,4.6,'#344d59');
  g.box('lamp arm',.35,4.6,0,.8,.1,.12,'#344d59');
  g.box('lantern housing',.7,4.4,0,.42,.25,.42,'#344d59');
  g.box('warm lantern',.7,4.38,0,.32,.08,.32,'#ffe2a3');g.batch();
 });
}
