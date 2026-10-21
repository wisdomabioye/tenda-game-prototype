import type {GigBrowse} from '../../../contracts/tenda/browse';
export type Mission = GigBrowse & {
    mockPlaceId?:string;
    destination: string;
    district: string;
    color: string;
};
