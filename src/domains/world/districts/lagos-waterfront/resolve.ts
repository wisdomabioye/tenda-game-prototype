import {baselineSettings,type DistrictDefinition} from '../shared/types';
import {venues} from '../baseline/venues';
import {baselineAssets,baselineFurniture} from '../baseline/definition';
import {lagosAssets} from './definition';
import {lagosStreets} from './network';
import {lagosLandmarks} from './landmarks';
export function resolveWaterfront(ground:string):DistrictDefinition{
 return {id:'lagos',settings:baselineSettings(true),largeGround:true,network:lagosStreets,venues,landmarks:lagosLandmarks,assets:[...baselineAssets(ground,venues),...lagosAssets(),...baselineFurniture()]};
}
