import type {Appearance} from '../../explorer/character/appearance';
import {createBoundedCache} from '../loading/requests';
import type {WorldSnapshot} from './contracts';
const poses=createBoundedCache<WorldSnapshot>(6);
import { useEffect, useRef } from "react";
import type { Mission } from "../../missions/model/mission";
import type { Place } from "../../atlas/places";
import type {DistrictDefinition} from "../districts/shared/types";
import { mountWorld } from "./mountWorld";
import type { Controls } from "./contracts";
export type { Controls, View } from "./contracts";
/** React lifecycle bridge. Task actions remain in mission UI, not the renderer. */
export function Street({ onSceneReady,huntTarget,huntComplete,onMissionStart,activityEnabled,adventureTarget,appearance,trail,activeStop,district,sceneKey,place, missions, onNotice, onReady, onTravel, onStreet, onPlace,onRepair, }: {
    onSceneReady:()=>void;
    huntTarget?:string|null;huntComplete:boolean;onMissionStart:()=>void;
    activityEnabled:boolean;adventureTarget:string|null;
    appearance:Appearance;trail:{id:string;order:number}[];activeStop:string|null;
    district:DistrictDefinition;
    sceneKey:string;
    place: Place;
    missions: Mission[];
    onNotice: (mission: Mission) => void;
    onReady: (controls: Controls|null) => void;
    onTravel: () => void;
    onStreet: (name:string) => void;
    onPlace:(id:string,arrived:boolean)=>void;
    onRepair:(id:string)=>void;
}) {
    const canvas = useRef<HTMLCanvasElement>(null), labels = useRef<HTMLDivElement>(null), callbacks = useRef({ onNotice, onReady, onTravel, onStreet, onPlace,onMissionStart,onRepair,onSceneReady });
    callbacks.current = { onNotice, onReady, onTravel, onStreet, onPlace,onMissionStart,onRepair,onSceneReady };
    const live=useRef<Controls|null>(null),missionRef=useRef(missions);missionRef.current=missions;
    const markerData=()=>missions.map(m=>({id:m.escrow_id,title:m.title,category:m.category,position:district.places?.find(p=>p.missionIds.includes(m.escrow_id)||p.id===m.mockPlaceId)?.arrival,placeName:district.places?.find(p=>p.missionIds.includes(m.escrow_id)||p.id===m.mockPlaceId)?.name}));
    useEffect(()=>{live.current?.setMissions(markerData());},[missions]);
    useEffect(()=>{live.current?.markHunt(huntTarget??null,huntComplete);},[huntTarget,huntComplete]);
    useEffect(()=>{live.current?.setActivity(activityEnabled);},[activityEnabled]);
    useEffect(()=>{live.current?.markAdventure(adventureTarget);},[adventureTarget]);
    useEffect(()=>{live.current?.setCharacter(appearance);},[appearance]);
    useEffect(()=>{live.current?.setTrail(trail,activeStop);},[trail,activeStop]);
    useEffect(() => {

        const world = mountWorld(canvas.current!, labels.current!, district, markerData(), (id) => {
            const mission = missionRef.current.find((m) => m.escrow_id === id);
            if (mission)
                callbacks.current.onNotice(mission);
        }, () => callbacks.current.onTravel(),(name)=>callbacks.current.onStreet(name),(id,arrived)=>callbacks.current.onPlace(id,arrived),poses.get(district.frameId??sceneKey),()=>callbacks.current.onMissionStart(),id=>callbacks.current.onRepair(id),appearance);
        let alive=true;world.ready.then(()=>{if(alive)callbacks.current.onSceneReady();},()=>{});
        live.current=world.controls;world.controls.markHunt(huntTarget??null,huntComplete);world.controls.setActivity(activityEnabled);world.controls.markAdventure(adventureTarget);world.controls.setCharacter(appearance);world.controls.setTrail(trail,activeStop);
        callbacks.current.onReady(world.controls);
        return ()=>{alive=false;live.current=null;poses.set(district.frameId??sceneKey,world.snapshot());callbacks.current.onReady(null);world.dispose();};
    }, [district,sceneKey]);
    return (<>
      <canvas tabIndex={0} ref={canvas} aria-label={`${place.name} illustrative 3D neighbourhood. Use the venue controls to navigate without gestures.`}/>
      <div className="world-labels" ref={labels}/>
    </>);
}
