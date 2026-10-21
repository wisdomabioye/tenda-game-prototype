import { createAsset, type AssetPlacement } from '../core/asset';
import type { AssetContext } from '../core/context';
import { drawLettering } from './parts/lettering';
export function createStreetSign(ctx: AssetContext, p: AssetPlacement & {
    name: string;
    crossStreet?: string;
}) {
    return createAsset(ctx, p, g => {
        g.cylinder('street name pole', 0, 0, 0, .09, 3.5, '#496571');
        g.box('street name board', 0, 2.8, 0, 4.6, .75, .12, '#176d74');
        drawLettering(g, { text: p.name, x: 0, y: 3.175, z: 0, width: 4.5, height: .7, background: '#176d74', doubleSided: true });
        if (p.crossStreet) {
            g.box('junction name board', 0, 2, 0, 4.6, .65, .12, '#225f7e');
            drawLettering(g, { text: p.crossStreet, x: 0, y: 2.325, z: 0, width: 4.5, height: .6, background: '#225f7e', doubleSided: true });
        }
    });
}
