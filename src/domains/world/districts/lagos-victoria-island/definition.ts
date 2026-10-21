import catalogue from '../../../places/catalogues/lagos.json';
import {attachPlaceCatalogue} from '../../../places/world/compose';
import snapshot from '../../../geography/data/lagos-victoria-island.json';
import type {MapSnapshot} from '../../../geography/model/types';
import {adaptMapSnapshot} from '../../../geography/adapters/osm';
import {composeGeographicDistrict} from '../geographic/compose';

export const pilotMap = adaptMapSnapshot(snapshot as MapSnapshot);
export function victoriaIslandDistrict() {
    return {...attachPlaceCatalogue(composeGeographicDistrict(pilotMap, {id: 'lagos', name: 'Victoria Island pilot'}),pilotMap,catalogue),frameId:'lagos-pilot-frame'};
}
