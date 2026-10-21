import type {WorldPlace} from '../../../places/model';
import type { AssetSpec } from '../../assets/registry';
import type { Segment, Point } from '../../navigation/routes';
import type { VenueAnchor, LandmarkAnchor } from '../../../missions/model/anchors';
export interface WorldSettings {
    spawn: Point;
    ground: {
        width: number;
        depth: number;
        center: Point;
    };
    pan: {
        minX: number;
        maxX: number;
        minZ: number;
        maxZ: number;
    };
    camera: {
        maxRadius: number;
        overview: number;
        desktopOverview: number;
        adventure: number;
        mobileAdventure: number;
        initial: number;
        mobileInitial: number;
    };
    walkSpeed: number;
    fog: {
        start: number;
        end: number;
    };
}
export interface DistrictDefinition {
    frameId?:string;
    chunks?:{id:string;minX:number;maxX:number;minZ:number;maxZ:number;assets:AssetSpec[]}[];
    id: string;
    places?: WorldPlace[];
    largeGround: boolean;
    network: Segment[];
    venues: readonly VenueAnchor[];
    landmarks: readonly LandmarkAnchor[];
    assets: AssetSpec[];
    settings: WorldSettings;
    geographic?: {
        bounds?:{minX:number;maxX:number;minZ:number;maxZ:number};
        name: string;
        attribution: string;
        licenceUrl: string;
        origin: {
            latitude: number;
            longitude: number;
        };
        worldUnitsPerMetre: number;
        sourceUrl: string;
    };
}
export function baselineSettings(largeGround: boolean): WorldSettings { return { spawn: { x: 0, y: 0, z: 0 }, ground: { width: largeGround ? 110 : 64, depth: largeGround ? 90 : 74, center: { x: 0, y: .12, z: 3 } }, pan: { minX: -58, maxX: 48, minZ: -48, maxZ: 55 }, camera: { maxRadius: 160, overview: 135, desktopOverview: 135, adventure: 56, mobileAdventure: 76, initial: 70, mobileInitial: 88 }, walkSpeed: 6, fog: { start: 180, end: 300 } }; }
