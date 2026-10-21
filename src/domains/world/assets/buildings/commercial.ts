import { createAsset, type AssetPlacement } from '../core/asset';
import type { AssetContext } from '../core/context';
import { drawLettering } from '../signage/parts/lettering';
export interface CommercialSpec extends AssetPlacement {
    style?:'shop';
    width: number;
    depth: number;
    name: string;
    color: string;
}
export function createRestaurant(ctx: AssetContext, p: CommercialSpec) {
    const w = p.width, d = p.depth;
    return createAsset(ctx, p, g => {
        g.box('restaurant kitchen and dining room', 0, 0, d * .18, w, 3.3, d * .64, p.color);
        g.box('restaurant roof', 0, 3.3, d * .18, w, .2, d * .64, '#fff0d0');
        g.box('restaurant entrance', 0, 0, -d * .15, 1, 2.2, .08, '#436d78');
        for (const x of [-w * .3, w * .3])
            g.box('restaurant front window', x, .9, -d * .15, .8, 1.4, .08, '#bde3df');
        g.box('striped patio awning', 0, 2.7, -d * .27, w, .15, d * .42, '#d77f59');
        for (let x = -w / 2 + .25; x < w / 2; x += .6)
            g.box('awning stripe', x, 2.86, -d * .27, .22, .025, d * .42, '#fff3d6');
        drawLettering(g, { text: p.name, x: 0, y: 3.05, z: -d * .49, width: w * .9, height: .45, background: '#ac593e' });
        for (const side of (p.style==='shop'?[]:[-1,1])) {
            const x = side * w * .29;
            g.cylinder('patio table', x, .65, -d * .34, .38, .1, '#d1a06e');
            g.cylinder('table pedestal', x, 0, -d * .34, .08, .65, '#506b72');
            g.box('patio seat', x, 0, -d * .45, .6, .45, .3, '#8db6a0');
        }
        for(const x of [-w*.28,w*.28])g.box('rear dining window',x,1,d*.505,w*.2,1.3,.08,'#bde3df');
        drawLettering(g,{text:p.name,x:0,y:2.8,z:d*.505,width:w*.8,height:.45,background:'#ac593e',doubleSided:true});
        g.box('menu stand', w * .4, 0, -d * .38, .12, 1.2, .12, '#8b694b');
        drawLettering(g, { text:p.style==='shop'?'SHOP':'MENU', x: w * .4, y: 1.2, z: -d * .4, width: .65, height: .65, background: '#365f68' });
    }, { entrances: [{ id: 'front', position: { x: 0, y: 0, z: -d / 2 } }], occlusion: [{ min: { x: -w / 2, y: 0, z: -d / 2 }, max: { x: w / 2, y: 3.6, z: d / 2 } }] });
}
export function createMall(ctx: AssetContext, p: CommercialSpec) {
    const w = p.width, d = p.depth;
    return createAsset(ctx, p, g => {
        g.box('mall podium', 0, 0, d * .1, w, 3, d * .8, p.color);
        g.box('recessed upper shops', 0, 3.1, d * .12, w * .82, 2.8, d * .68, '#d9c6a2');
        for (let x = -w * .32; x <= w * .33; x += w * .22) {
            g.box('shopfront glazing', x, .5, -d * .31, w * .18, 2, .1, '#a5d5df');
            g.box('upper gallery glazing', x, 3.65, -d * .23, w * .16, 1.7, .1, '#b6e0e3');
            g.box('gallery shade fin', x, 3.3, -d * .26, .12, 2.4, .5, '#ba8860');
        }
        g.box('mall entrance portal', 0, 0, -d * .34, w * .27, 2.8, .18, '#426979');
        g.box('entrance glazing', 0, .2, -d * .36, w * .2, 2.4, .08, '#c0e2df');
        g.box('pedestrian entrance canopy', 0, 2.8, -d * .38, w * .75, .18, d * .24, '#fff0cf');
        // All elevations receive shop/gallery detail, so exploration never reveals a blank rear box.
        for(const x of [-w*.28,0,w*.28]){
            g.box('rear shop glazing',x,.55,d*.505,w*.18,1.8,.08,'#a5d5df');
            g.box('rear gallery glazing',x,3.65,d*.465,w*.16,1.7,.08,'#b6e0e3');
        }
        for(const side of [-1,1])for(const z of [-d*.12,d*.26]){
            g.box('side shop glazing',side*(w*.5+.035),.7,z,.08,1.7,d*.2,'#a5d5df');
            g.box('side gallery glazing',side*(w*.41+.035),3.65,z,.08,1.7,d*.18,'#b6e0e3');
        }
        g.box('podium wrap cornice',0,2.7,d*.1,w,.16,d*.8,'#fff0cf');
        drawLettering(g,{text:p.name,x:0,y:3,z:d*.505,width:w*.7,height:.45,background:'#326f7b',doubleSided:true});
        g.box('roof cornice', 0, 5.9, d * .12, w * .86, .2, d * .72, '#fff0cf');
        drawLettering(g, { text: p.name, x: 0, y: 3.25, z: -d * .49, width: w * .7, height: .55, background: '#326f7b' });
        g.box('directory stand', -w * .38, 0, -d * .4, .12, 1.5, .12, '#486c73');
        drawLettering(g, { text: 'SHOPS', x: -w * .38, y: 1.35, z: -d * .42, width: w * .18, height: .8, background: '#326f7b' });
        for (const x of [-w * .34, w * .34])
            g.box('entrance planter', x, 0, -d * .42, w * .18, .45, .5, '#79aa8a');
    }, { entrances: [{ id: 'front', position: { x: 0, y: 0, z: -d / 2 } }], occlusion: [{ min: { x: -w / 2, y: 0, z: -d / 2 }, max: { x: w / 2, y: 6.2, z: d / 2 } }] });
}
