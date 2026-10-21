import type {StationId} from '../../explorer/actions/activities/descriptors';
import type {ActorSnapshot} from '../../explorer/actions/contracts';
import type {PerformanceReport} from '../performance/monitor';
import type {Appearance} from '../../explorer/character/appearance';
export type View = "overview" | "adventure" | "look";
export interface Controls {
    actorVisit:(target:StationId)=>void;
    actorState:()=>ActorSnapshot;
    actorInput:(key:string,pressed:boolean)=>void;
    actorInteract:()=>void;
    actorPause:()=>void;
    returnToCheckpoint:(placeId:string)=>void;
    visitRepair:(id:string)=>void;
    markHunt:(target:string|null,complete:boolean)=>void;
    journey:()=>{moving:boolean;progress:number;destination?:string;arrived?:boolean};
    setMissions:(missions:MissionMarker[])=>void;
    performance:()=>PerformanceReport;
    quality:(mode:'auto'|'balanced'|'light')=>void;
    cancelJourney:()=>void;
    setActivity:(enabled:boolean)=>void;
    suggestMission:(excludeIds?:readonly string[],minimumDistance?:number)=>string|null;
    markAdventure:(id:string|null)=>void;
    setCharacter:(appearance:Appearance)=>void;
    setTrail:(stops:{id:string;order:number}[],active:string|null)=>void;
    currentView:()=>View;
    inspectPlace: (id:string) => void;
    visitPlace: (id:string,missionId?:string) => void;
    north: () => void;
    visitLandmark: (id: string) => void;
    view: (view: View) => void;
    zoom: (amount: number) => void;
    cameraAway:()=>boolean;
    home: () => void;
    rotate: (angle: number) => void;
    visit: (category: string, id?: string) => void;
}
export interface MissionMarker {
    position?:{x:number;y:number;z:number};
    placeName?: string;
    id: string;
    title: string;
    category: string;
}
export interface WorldSnapshot {player:{x:number;y:number;z:number};camera:{alpha:number;beta:number;radius:number;fov:number;target:{x:number;y:number;z:number}};view:View;}
