import {readJsonPreference,writeJsonPreference} from '../../../shared/storage/jsonPreferences';
import {createSceneMetrics} from '../performance/sceneMetrics';
import {createDetailBudget} from '../visibility/detailBudget';
import {createMissionStops} from '../../missions/world/MissionStops';
import {DESTINATION_COLOR} from '../../explorer/wayfinding/palette';
import type {Appearance} from '../../explorer/character/appearance';
import type {StationId} from '../../explorer/actions/activities/descriptors';
import {bindActorKeyboard} from '../../explorer/actions/keyboard';
import {createPhysicalActions} from '../../explorer/actions/createPhysicalActions';
import {createRepairStations} from '../../explorer/challenge/RepairStations';
import {repairStations} from '../../explorer/challenge/stations';
import {spaceSceneMarkers} from '../../../shared/ui/markerSpacing';
import {createDestinationFeedback} from '../../explorer/wayfinding/destinationFeedback';
import {createHuntWorld} from '../../explorer/hunt/world';
import {createStreetLighting} from '../lighting/streetLighting';
import {createPlayerBeacon} from '../../explorer/identity/PlayerBeacon';
import {createSunShadows} from '../lighting/sunShadows';
import {createStreamedComposition} from './streamedComposition';
import {summarizeFrames,type PerformanceReport} from '../performance/monitor';
import {chooseDiscovery} from '../../explorer/adventure/discovery';
import {createCityActivity} from '../activity/createCityActivity';
import {createStreetSign} from '../assets/signage/streetSign';
import type {AssetInstance} from '../assets/core/asset';
import {createTrailMarkers} from '../../explorer/trail/TrailMarkers';
import {pickWorld} from '../input/picking';
import type {AbstractMesh} from '@babylonjs/core/Meshes/abstractMesh';
import {createPlaceMarkers} from '../../places/presentation/PlaceMarkers';
import {createRoadSelection} from './roadSelection';
import {createRouteOverlay} from './routeOverlay';
import { createDisposalScope } from "./disposal";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { createAssetContext } from "../assets/core/context";
import { composeAssets } from "../districts/shared/compose";
import type { DistrictDefinition } from "../districts/shared/resolve";
import type { AssetSpec } from "../assets/registry";
import { createCameraController } from "../camera/controller";
import { bindPointerInput } from "../input/pointer";
import { updateObstructions } from "../visibility/obstructions";
import { createExplorer } from "../../explorer/character/createExplorer";
import { createWalker } from "../../explorer/character/walker";
import {distance,walkingRoute, snapToStreet,type Point } from "../navigation/routes";
import { createMarkerLayer, type LandmarkAnchor, } from "../../missions/presentation/MarkerLayer";
import { hardwareScale } from "./render-quality";
import type { Controls, MissionMarker,WorldSnapshot } from "./contracts";
export function mountWorld(canvas: HTMLCanvasElement, labels: HTMLDivElement, district: DistrictDefinition, missions: MissionMarker[], onNotice: (id: string) => void, onTravel: () => void = () => {}, onStreet: (name:string) => void = () => {}, onPlace: (id:string,arrived:boolean) => void = () => {}, saved?:WorldSnapshot,onMissionStart:()=>void=()=>{},onRepair:(id:string)=>void=()=>{},appearance?:Appearance) {
    const mountStarted=performance.now();
    const scope = createDisposalScope();
    try {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const engine = new Engine(canvas, true, {
            preserveDrawingBuffer: false,
            stencil: true,
        });
        scope.defer(() => engine.dispose());
        engine.setHardwareScalingLevel(hardwareScale(window.devicePixelRatio));
        const scene = new Scene(engine);
        scope.defer(() => scene.dispose());
        const metrics=createSceneMetrics(scene);scope.defer(metrics.dispose);
        const detailBudget=createDetailBudget(district.assets);scope.defer(detailBudget.restore);let hiddenDetails=0,activityMs=0;
        scene.clearColor = Color4.FromHexString("#8bd9edff");
        scene.fogMode = Scene.FOGMODE_LINEAR;
        scene.fogColor = Color3.FromHexString("#8bd9ed");
        scene.fogStart = district.settings.fog.start;
        scene.fogEnd = district.settings.fog.end;
        new HemisphericLight("sky", new Vector3(0, 1, 0), scene).intensity = 0.6;
        const sun = new DirectionalLight("sun", new Vector3(-1, -2, 1), scene);
        sun.intensity = 0.45;
        sun.position=new Vector3(district.settings.ground.center.x+150,300,district.settings.ground.center.z-150);sun.autoCalcShadowZBounds=true;
        const shadows=createSunShadows(scene,sun);scope.defer(shadows.dispose);
        const streetLights=createStreetLighting(scene,district.assets);scope.defer(streetLights.dispose);
        const context = createAssetContext(scene), controller = createCameraController(scene, reduced, () => window.innerWidth, district.settings.camera), camera = controller.camera;
        scope.defer(() => context.dispose());
        const huntWorld=createHuntWorld(context,district);scope.defer(huntWorld.dispose);
        const overlay=createRouteOverlay(context);
        scope.defer(overlay.dispose);
        let clearStreet=()=>{};
        let physical:ReturnType<typeof createPhysicalActions>|undefined;
        const composition = createStreamedComposition(context, district), explorer = createExplorer(scene, context.material,appearance), player = explorer.root, walker = createWalker(explorer, district.network, reduced, controller.home, district.settings.walkSpeed, overlay.show, () => {physical?.leaveSeat();clearStreet();onTravel();});
        composition.update(saved?.camera.target??district.settings.spawn,saved?.player??district.settings.spawn);
        scope.defer(composition.dispose);
        const missionStops=createMissionStops(context,district.network,district.venues,()=>[...composition.assets.flatMap(a=>a.movementSolids()),...(physical?.ownedSolids()??[])]);missionStops.setMissions(missions);scope.defer(missionStops.dispose);
        const missionTargets=new Map<AbstractMesh,string>();const refreshMissionTargets=()=>{missionTargets.clear();for(const [mesh,id]of missionStops.targets){mesh.isPickable=true;missionTargets.set(mesh,id);}};refreshMissionTargets();
        const beacon=createPlayerBeacon(labels,canvas,scene,engine,camera,player,()=>motionQuery.matches);scope.defer(beacon.dispose);
        const activity=createCityActivity(context,district,composition.assets,reduced,()=>player.position);scope.defer(activity.dispose);
        const motionQuery=window.matchMedia('(prefers-reduced-motion: reduce)'),motionChange=()=>activity.setReduced(motionQuery.matches);motionQuery.addEventListener('change',motionChange);scope.defer(()=>motionQuery.removeEventListener('change',motionChange));
        const destination=createDestinationFeedback(scene,canvas,labels,engine,camera,context.material(DESTINATION_COLOR),()=>motionQuery.matches);scope.defer(destination.dispose);
        const travelTo=(target:Point,done?:()=>void)=>{physical?.setPaused(false);const accepted=walker.moveTo(target,done);if(!accepted)destination.clear();return accepted;};
        let adventureSign:AssetInstance|undefined,adventureSignId:string|null=null;scope.defer(()=>adventureSign?.dispose());
        const streetSelection=createRoadSelection(composition.assets,context.material("#86c9cb"));
        clearStreet=streetSelection.clear;scope.defer(streetSelection.dispose);
        player.position.copyFromFloats(district.settings.spawn.x, district.settings.spawn.y, district.settings.spawn.z);
        camera.setTarget(player.position.add(new Vector3(0, 1, 0)), false, true, true);
        if(saved){player.position.copyFromFloats(saved.player.x,saved.player.y,saved.player.z);controller.restore(saved.camera,saved.view);}
        scope.defer(() => player.dispose(false, false));
        const inspectPlace=(id:string)=>{if(!district.places?.some(p=>p.id===id))return;walker.cancel();destination.clear();labels.dataset.selectedPlace=id;delete labels.dataset.selectedMission;onPlace(id,false);};
        const visitPlace=(id:string,missionId?:string)=>{
            if(missionId)onMissionStart();
            const place=district.places?.find(p=>p.id===id);
            if(!place||missionId&&(!place.missionIds.includes(missionId)||!missions.some(m=>m.id===missionId)))return;
            if(!place.reachable){walker.cancel();destination.clear();labels.dataset.selectedPlace=id;delete labels.dataset.selectedMission;onPlace(id,false);return;}
            destination.select(place.arrival,place.name,composition.assets.find(a=>a.id===place.building.assetId));labels.dataset.selectedPlace=id;if(missionId)labels.dataset.selectedMission=missionId;else delete labels.dataset.selectedMission;
            travelTo(place.arrival,()=>{destination.arrive();beacon.highlight();if(missionId)onNotice(missionId);else onPlace(id,true);});
        };
        const destinationFor=(mission:MissionMarker)=>{
            const stop=missionStops.forMission(mission.id);if(stop)return stop.arrival;
            if(mission.position)return mission.position;
            const linked=district.places?.find(p=>p.missionIds.includes(mission.id));
            if(linked)return linked.reachable?linked.arrival:undefined;
            return composition.assets.find(a=>a.id===`venue-${mission.category}`)?.entrances().find(s=>s.id==='mission-stop')?.position;
        };
        const route = (category: string, mission?: MissionMarker) => {
            onMissionStart();
            const target=mission?destinationFor(mission):composition.assets.find(a=>a.id===`venue-${category}`)?.entrances().find(s=>s.id==='mission-stop')?.position;
            if(target){destination.select((mission&&missionStops.forMission(mission.id)?.position)||target,mission?.placeName??mission?.title??category,mission&&missionStops.forMission(mission.id)?undefined:composition.assets.find(a=>a.id===(district.places?.find(p=>p.missionIds.includes(mission?.id??''))?.building.assetId??`venue-${category}`)));labels.dataset.selectedMission=mission?.id??'';labels.dataset.selectedPlace=district.places?.find(p=>p.missionIds.includes(mission?.id??''))?.id??'';travelTo(target,()=>{destination.arrive();beacon.highlight();if(mission)onNotice(mission.id);});}
        };
        const visitRepair=(id:string)=>{const station=repairStations.find(s=>s.id===id),p=station&&district.places?.find(p=>p.id===station.placeId&&p.reachable);if(!station||!p)return;destination.select(p.arrival,station.name);if(distance(player.position,p.arrival)<4){walker.cancel();onTravel();destination.arrive();onRepair(id);return;}travelTo(p.arrival,()=>{destination.arrive();beacon.highlight();onRepair(id);});};
        const repairs=createRepairStations(context,district.places??[],labels,canvas,engine,camera,visitRepair);scope.defer(repairs.dispose);const repairTargets=new Map<AbstractMesh,string>(repairs.targets);
        const trailMarkers=createTrailMarkers(labels,canvas,scene,engine,camera,id=>{const mission=missions.find(m=>m.id===id);if(mission)route(mission.category,mission);});
        scope.defer(trailMarkers.dispose);
        const visitLandmark = (landmark: LandmarkAnchor) => {
            const target=snapToStreet({ x: landmark.x, y: 0, z: landmark.z }, district.network);destination.select(target,landmark.name);delete labels.dataset.selectedPlace;delete labels.dataset.selectedMission;const moved=travelTo(target,()=>destination.arrive());
            if(moved){streetSelection.select(landmark.id);onStreet(landmark.name);}
        };
        let markers = createMarkerLayer(labels, canvas, scene, engine, camera, district.venues, missions, district.landmarks, reduced, { onVisit: route, onLandmark: visitLandmark,missionStops:missionStops.stops,player:()=>player.position });
        scope.defer(()=>markers.dispose());
        const placeMarkers=createPlaceMarkers(labels,canvas,scene,engine,camera,district.places??[],inspectPlace);
        scope.defer(placeMarkers.dispose);
        const pickablePlaces=new Map<AbstractMesh,string>(),pickableBuildings=new Set<AbstractMesh>();
        const buildingIds=new Set(district.assets.filter(a=>['house','storeyed','restaurant','mall','urban'].includes(a.kind)).map(a=>a.id));
        let compositionRevision=-1;
        const refreshPicking=()=>{
            if(compositionRevision===composition.revision)return;compositionRevision=composition.revision;
            pickablePlaces.clear();pickableBuildings.clear();
            for(const asset of composition.assets){const place=district.places?.find(p=>p.building.assetId===asset.id);for(const mesh of asset.meshes){if(place)pickablePlaces.set(mesh,place.id);if(buildingIds.has(asset.id)){mesh.isPickable=true;pickableBuildings.add(mesh);}}}
        };
        refreshPicking();
        shadows.sync();
        const frames:number[]=[];let loadMs=0,qualityMode:'auto'|'balanced'|'light'='auto',light=false,slowSeconds=0,chunkClock=0;
        const setQuality=(mode:'auto'|'balanced'|'light',persist=true)=>{if(persist)writeJsonPreference('tenda-render-quality',mode);qualityMode=mode;light=mode==='light';shadows.setLight(light);scene.shadowsEnabled=!light;streetLights.setLight(light);activity.setLight(light);hiddenDetails=detailBudget.update(composition.assets,camera.target,player.position,light);slowSeconds=0;engine.setHardwareScalingLevel(hardwareScale(window.devicePixelRatio)*(light?1.4:1));engine.resize();};
        let solidsRevision=-1,worldSolids:ReturnType<AssetInstance['movementSolids']>=[];
        const currentSolids=()=>{if(solidsRevision!==composition.revision){solidsRevision=composition.revision;worldSolids=composition.assets.flatMap(a=>a.movementSolids());}return [...worldSolids,...missionStops.solids()];};
        physical=createPhysicalActions(context,explorer,walker,camera,district.network,district.settings.spawn,()=>motionQuery.matches,controller.home,()=>{destination.clear();onTravel();},{districtId:district.id,solids:currentSolids});scope.defer(physical.dispose);scope.defer(bindActorKeyboard(physical));shadows.sync();const physicalTargets=new Map<AbstractMesh,StationId>(physical.targets);physical.targets.forEach(([mesh])=>{mesh.isPickable=true;});
        let currentAppearance=appearance;
        const controls: Controls = {
            actorVisit:target=>physical!.visit(target),actorState:()=>physical!.state(),actorInput:(key,pressed)=>physical!.input(key,pressed),actorInteract:()=>physical!.interact(),actorPause:()=>physical!.togglePause(),
            visitRepair,
            returnToCheckpoint:(id)=>{const p=district.places?.find(p=>p.id===id&&p.reachable);if(p){walker.cancel();destination.clear();delete labels.dataset.selectedPlace;delete labels.dataset.selectedMission;player.position.copyFromFloats(p.arrival.x,p.arrival.y,p.arrival.z);controller.home();beacon.highlight();}},
            markHunt:huntWorld.set,journey:()=>({moving:walker.moving,progress:walker.progress,...destination.state()}),
            setMissions:(next)=>{missions=next;missionStops.setMissions(next);refreshMissionTargets();markers.dispose();markers=createMarkerLayer(labels,canvas,scene,engine,camera,district.venues,missions,district.landmarks,reduced,{onVisit:route,onLandmark:visitLandmark,missionStops:missionStops.stops,player:()=>player.position});},
            performance:():PerformanceReport=>({...summarizeFrames(frames),...metrics.read(),activityMs,hiddenDetails,shadows:scene.shadowsEnabled,district:district.id,view:controller.mode,cameraRadius:camera.radius,meshes:scene.meshes.length,activeMeshes:scene.getActiveMeshes().length,vertices:scene.getTotalVertices(),chunks:composition.loaded,loadMs,resolution:`${engine.getRenderWidth()} × ${engine.getRenderHeight()}`,quality:qualityMode+(light&&qualityMode==='auto'?' (light)':''),heapMB:(performance as Performance & {memory?:{usedJSHeapSize:number}}).memory?.usedJSHeapSize?((performance as Performance & {memory:{usedJSHeapSize:number}}).memory.usedJSHeapSize/1048576):null}),
            quality:setQuality,
            cancelJourney:()=>{walker.cancel();destination.clear();delete labels.dataset.selectedMission;delete labels.dataset.selectedPlace;},
            setActivity:enabled=>{activity.setEnabled(enabled);physical?.setActivity(enabled);},
            suggestMission:(excludeIds=[],minimumDistance=0)=>{
                const candidates=missions.filter(m=>!excludeIds.includes(m.id)).flatMap(m=>{const target=destinationFor(m);if(!target)return [];const path=walkingRoute(player.position,target,district.network);if(!path.length&&distance(player.position,target)>.2)return [];const points=[player.position,...path];return [{id:m.id,length:points.slice(1).reduce((total,p,i)=>total+distance(points[i],p),0)}];});
                return chooseDiscovery(candidates,excludeIds,minimumDistance);
            },
            markAdventure:(id)=>{if(id===adventureSignId)return;adventureSignId=id;adventureSign?.dispose();adventureSign=undefined;const mission=missions.find(m=>m.id===id),target=mission&&destinationFor(mission);if(target)adventureSign=createStreetSign(context,{id:'first-adventure-sign',position:{x:target.x+2,y:target.y,z:target.z},name:'First discovery →',crossStreet:'Sample mission'});},
            setCharacter:next=>{if(currentAppearance&&currentAppearance.mobility!==next.mobility)physical?.leaveSeat();currentAppearance=next;explorer.setAppearance(next);physical?.refreshPose();},
            setTrail:(stops,active)=>trailMarkers.set(stops.flatMap(stop=>{const mission=missions.find(m=>m.id===stop.id),point=mission&&(missionStops.forMission(mission.id)?.position??destinationFor(mission));return mission&&point?[{...stop,title:mission.title,point}]:[];}),active),
            inspectPlace,visitPlace,currentView:()=>controller.mode,
            north: controller.north,
            visitLandmark: (id) => {
                const landmark = district.landmarks.find((l) => l.id === id);
                if (landmark)
                    visitLandmark(landmark);
            },
            view: (v) => {
                markers.collapse();
                controller.view(v);
            },
            zoom: controller.zoom,
            cameraAway:()=>Math.hypot(camera.target.x-player.position.x,camera.target.z-player.position.z)>Math.max(20,camera.radius*.7),
            home: () => {controller.home();beacon.highlight();},
            rotate: controller.rotate,
            visit: (category, id) => route(category, missions.find((m) => (id ? m.id === id : m.category === category))),
        };
        const input = bindPointerInput(canvas, scene, controller, {
            largeGround: district.largeGround,
            settings: district.settings,
            onDrag: markers.collapse,
            onPick:(x,y)=>{const hit=pickWorld(scene,x,y,mesh=>pickableBuildings.has(mesh)||repairTargets.has(mesh)||physicalTargets.has(mesh)||missionTargets.has(mesh));const missionBox=hit?.pickedMesh&&missionTargets.get(hit.pickedMesh);if(missionBox){markers.open(missionBox);return true;}const physicalId=hit?.pickedMesh&&physicalTargets.get(hit.pickedMesh);if(physicalId){physical!.visit(physicalId);return true;}const repairId=hit?.pickedMesh&&repairTargets.get(hit.pickedMesh);if(repairId){visitRepair(repairId);return true;}const id=hit?.pickedMesh&&pickablePlaces.get(hit.pickedMesh);if(!id)return false;inspectPlace(id);return true;},
            onTap: (point) => {const target=snapToStreet(point,district.network);destination.select(target,'Selected spot');delete labels.dataset.selectedPlace;delete labels.dataset.selectedMission;const accepted=travelTo(target,()=>{destination.arrive();beacon.highlight();});return accepted;},
        });
        scope.defer(input.dispose);
        setQuality(readJsonPreference('tenda-render-quality',raw=>raw==='light'||raw==='balanced'?raw:'auto',()=> 'auto' as const),false);
        let lastTime = performance.now();
        const frame = () => {
            const now = performance.now(), dt = Math.min(0.05, (now - lastTime) / 1000);
            const elapsed=now-lastTime;lastTime = now;
            if(!document.hidden&&elapsed>0&&elapsed<1000){frames.push(elapsed);if(frames.length>120)frames.shift();if(qualityMode==='auto'&&!light){slowSeconds=elapsed>40?slowSeconds+elapsed/1000:Math.max(0,slowSeconds-dt);if(slowSeconds>3){setQuality('light',false);qualityMode='auto';}}}
            chunkClock+=dt;if(chunkClock>.25){chunkClock=0;composition.update(camera.target,player.position);refreshPicking();shadows.sync();streetLights.update(camera.target);hiddenDetails=detailBudget.update(composition.assets,camera.target,player.position,light);}
            const activityStart=performance.now();if(!document.hidden&&!physical?.paused)activity.update(dt);activityMs=performance.now()-activityStart;
            controller.tick(dt);
            const physicallyActing=physical?.update(dt);
            if(!physical?.paused&&!physicallyActing)walker.update(dt);
            controller.follow(player.position, dt);
            updateObstructions(composition.occluders, camera.position, player.position, dt, reduced);
            scene.render();if(!loadMs&&scene.isReady())loadMs=performance.now()-mountStarted;
            markers.update(dt, controller.mode);
            trailMarkers.update();
            placeMarkers.update();
            beacon.update(dt);destination.update(dt);repairs.update(player.position);spaceSceneMarkers(labels,canvas);
            for(const marker of labels.querySelectorAll<HTMLElement>('[data-mission-id],[data-place-id]')){const selected=Boolean(marker.dataset.missionId&&marker.dataset.missionId===labels.dataset.selectedMission||marker.dataset.placeId&&marker.dataset.placeId===labels.dataset.selectedPlace);marker.classList.toggle('is-selected',selected);if(selected)marker.setAttribute('aria-current','location');else marker.removeAttribute('aria-current');}
        };
        engine.runRenderLoop(frame);
        scope.defer(() => engine.stopRenderLoop(frame));
        const resize = () => {
            engine.setHardwareScalingLevel(hardwareScale(window.devicePixelRatio)*(light?1.4:1));
            engine.resize();
        };
        window.addEventListener("resize", resize);
        scope.defer(() => window.removeEventListener("resize", resize));
        return { controls, ready:scene.whenReadyAsync(), snapshot:():WorldSnapshot=>({player:{x:player.position.x,y:player.position.y,z:player.position.z},camera:{alpha:camera.alpha,beta:camera.beta,radius:camera.radius,fov:camera.fov,target:{x:camera.target.x,y:camera.target.y,z:camera.target.z}},view:controller.mode}),dispose: scope.dispose };
    }
    catch (error) {
        try {
            scope.dispose();
        }
        catch (cleanupError) {
            throw new AggregateError([error, cleanupError], "World mount failed");
        }
        throw error;
    }
}
