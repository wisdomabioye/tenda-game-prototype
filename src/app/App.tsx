import {AtlasDialog,AuthorPanel,ChallengePanel,CharacterPanel,ExplorerGuide,HuntPanel,ImportPanel,MissionLab,MissionPreview,PerformancePanel,PlacePreview,RepairFinder,SoundPanel,TrailPanel,Wayfinder} from './lazyPanels';
import {LazyPanelBoundary} from '../shared/ui/LazyPanelBoundary';
import {readJsonPreference,writeJsonPreference} from '../shared/storage/jsonPreferences';
import {parseWatchlist,defaultWatchlist,matches,type Watchlist} from '../domains/missions/engagement/policy';
import {ActorControls} from '../domains/explorer/actions/ActorControls';
import {repairStations} from '../domains/explorer/challenge/stations';
import {useChallenge} from '../domains/explorer/challenge/useChallenge';
import {CameraRecovery} from '../domains/explorer/wayfinding/CameraRecovery';
import {useVisualViewport} from '../shared/ui/useVisualViewport';
import {GameButton,DockButton} from '../shared/ui/game/GameUI';
import {useBenchmark} from '../domains/world/performance/useBenchmark';
import {useLocalPreference} from '../shared/storage/useLocalPreference';
import {NavigationStatus} from '../domains/explorer/wayfinding/NavigationStatus';
import {useMockTenda} from '../mock/tenda/useMockTenda';
import {useHunt} from '../domains/explorer/hunt/useHunt';
import {huntStages} from '../domains/explorer/hunt/model';
import {MockWork} from '../domains/missions/engagement/MockWork';
import {createLocalProjection} from '../domains/geography/projection/local';
import {refreshChunks} from '../domains/world/districts/configured/refreshChunks';
import {useAdventure} from '../domains/explorer/adventure/useAdventure';
import {AdventureCoach} from '../domains/explorer/adventure/AdventureCoach';
import {nextLocalStop} from '../domains/explorer/trail/model';
import {useAppearance} from '../domains/explorer/character/useAppearance';
import {ExplorerMenu} from './components/ExplorerMenu';
import {applyAuthoredPlaces,type AuthoredPlace} from '../domains/places/authoring/placement';
import {useSound} from '../domains/audio/useSound';
import { MapCredit } from "../domains/geography/presentation/MapCredit";
import {useDistrict} from "../domains/world/loading/useDistrict";
import { useDialogFocus } from "../shared/ui/useDialogFocus";
import { useTrail } from "../domains/explorer/trail/useTrail";
import React, { useState, useRef, useMemo } from "react";
import type {Controls,View} from "../domains/world/runtime/contracts";
const Street=React.lazy(()=>import("../domains/world/runtime/Street").then(m=>({default:m.Street})));
import { places } from "../domains/atlas/places";
import { missions as initialMissions } from "../mock/tenda/catalogue";
import type { Mission } from "../domains/missions/model/mission";
import "../shared/theme/tokens.css";
import "../shared/theme/styles.css";
export function App() {
    const [worldReady,setWorldReady]=useState(false);
    const [movementVisible,setMovementVisible]=useLocalPreference('tenda-movement-controls',raw=>raw===true,()=>false);
    const [repairStation,setRepairStation]=useState<string|null>(null);
    const challenge=useChallenge(repairStation??'trial');
    const [legacyJournal,setLegacyJournal]=useState(false);
    const [arrivedNotice,setArrivedNotice]=useState(false);
    useVisualViewport();
    const mock=useMockTenda(),missions=mock.missions,hunt=useHunt();
    const [journal,setJournal]=useState(false),[missionLab,setMissionLab]=useState(false),[seen,setSeen]=useState<Set<string>>(()=>new Set());
    const [watch,setWatch]=useState<Watchlist>(()=>readJsonPreference('tenda-watchlist',parseWatchlist,()=>defaultWatchlist));
    const updateWatch=(next:Watchlist)=>{setWatch(next);writeJsonPreference('tenda-watchlist',next);};
    const newMatches=mock.arrivals.filter(m=>!seen.has(m.escrow_id)&&matches(m,watch));

    const [place, setPlace] = useState((places.find((p) => p.id === location.hash.split("/")[1]) ??
        places[0]) as (typeof places)[number]), [chart, setChart] = useState(false), [country, setCountry] = useState<string | null>(null), [view, setView] = useState<View>("adventure"), [notice, setNotice] = useState<Mission | null>(null), [brief, setBrief] = useState(false), [help, setHelp] = useState(false), [venuePicker, setVenuePicker] = useState(false);
    const [selectedRoad,setSelectedRoad]=useState<string|null>(null);
    const [inspected,setInspected]=useState<{id:string;arrived:boolean}|null>(null);
    const [districtChoice,setDistrictChoice]=useState("city");
    const [importPanel,setImportPanel]=useState(false),[diagnostics,setDiagnostics]=useState(false);
    const [author,setAuthor]=useState(false),[soundPanel,setSoundPanel]=useState(false);
    const [authored,setAuthored]=useState<AuthoredPlace[]>([]);
    const sound=useSound();
    const adventure=useAdventure();
    React.useEffect(()=>{const m=mock.arrivals[0];if(m&&matches(m,watch))sound.cue();},[mock.arrivals[0]?.escrow_id]);
    const [activityEnabled,setActivityEnabled]=useState(()=>{try{return localStorage.getItem('tenda-city-activity')!=='paused';}catch{return true;}});
    const [adventureError,setAdventureError]=useState('');
    const toggleActivity=()=>setActivityEnabled(current=>{try{localStorage.setItem('tenda-city-activity',current?'paused':'playing');}catch{}return !current;});
    const [characterPanel,setCharacterPanel]=useState(false),[trailPanel,setTrailPanel]=useState(false),[activeStop,setActiveStop]=useState<string|null>(null);
    const {appearance,setAppearance}=useAppearance();
    const [pendingStop,setPendingStop]=useState<string|null>(null);
    const controls = useRef<Controls | null>(null),inspectionRevision=useRef(0);
    const benchmark=useBenchmark(controls);
    const { trail, toggleTrail,moveTrail } = useTrail();
    useDialogFocus(Boolean(notice)||Boolean(inspected)||journal||missionLab||chart || help || venuePicker || author || soundPanel || characterPanel || trailPanel || importPanel || diagnostics, `${repairStation}:${legacyJournal}:${notice?.escrow_id}:${inspected?.id}:${journal}:${missionLab}:${country}:${chart}:${help}:${venuePicker}:${author}:${soundPanel}:${characterPanel}:${trailPanel}:${importPanel}:${diagnostics}`, () => {
        setNotice(null);setInspected(null);setJournal(false);setMissionLab(false);setChart(false);
        setImportPanel(false);setDiagnostics(false);setCharacterPanel(false);setTrailPanel(false);
        setAuthor(false);setSoundPanel(false);
        setHelp(false);
        setVenuePicker(false);
    });
    const openPanel=(name:'character'|'trail'|'sound'|'author'|'help'|'venues'|'atlas'|'import'|'performance'|'hunt'|'alerts'|'none')=>{
        if(name==='hunt'){setLegacyJournal(false);setRepairStation(null);hunt.pause();}inspectionRevision.current++;setNotice(null);setInspected(null);setJournal(name==='hunt');setMissionLab(name==='alerts');setImportPanel(name==='import');setDiagnostics(name==='performance');setCharacterPanel(name==='character');setTrailPanel(name==='trail');setSoundPanel(name==='sound');setAuthor(name==='author');setHelp(name==='help');setVenuePicker(name==='venues');setChart(name==='atlas');
    };
    const local = useMemo(()=>missions.filter((m) => place.id === "remote"
        ? m.remote
        : m.country === place.country && m.city === place.name),[missions,place]);
    const loading=useDistrict(place,[...new Set(initialMissions.map(m=>m.category))],districtChoice);
    const district=useMemo(()=>loading.district && refreshChunks(loading.district.geographic ? applyAuthoredPlaces(loading.district,authored.filter(record=>{const g=loading.district!.geographic!,b=g.bounds,p=createLocalProjection(g.origin,g.worldUnitsPerMetre).forward(record);return !b||p.x>=b.minX&&p.x<=b.maxX&&p.z>=b.minZ&&p.z<=b.maxZ;})):loading.district),[loading.district,authored]);
    const nextStop=nextLocalStop(trail,local.map(m=>m.escrow_id),activeStop);
    const nextSavedMission=notice&&trail.includes(notice.escrow_id)?trail.slice(trail.indexOf(notice.escrow_id)+1).map(id=>missions.find(m=>m.escrow_id===id)).find(m=>Boolean(m)):undefined;
    const trailStops=useMemo(()=>trail.map((id,index)=>({id,order:index+1})),[trail]);
    const travel = (id: string,pending?:string) => {
        setAdventureError('');adventure.dispatch({type:'redirect'});
        setPendingStop(pending??null);
        const p = places.find((p) => p.id === id)!;
        setSelectedRoad(null);
        setInspected(null);
        controls.current=null;
        setPlace(p);
        setChart(false);
        setNotice(null);
        setView("adventure");
        history.replaceState(null, "", `#city/${id}`);
    };
    const visitSavedMission=(mission:Mission)=>{
        hunt.pause();
        setActiveStop(mission.escrow_id);
        if(local.some(item=>item.escrow_id===mission.escrow_id))controls.current?.visit(mission.category,mission.escrow_id);
        else {
            const destination=places.find(p=>mission.remote?p.id==='remote':p.name===mission.city&&p.country===mission.country);
            if(destination)travel(destination.id,mission.escrow_id);
        }
    };
    const beginDiscovery=(resume=false,another=false)=>{
        const c=controls.current;if(!c)return;
        const id=resume&&adventure.state.target&&local.some(m=>m.escrow_id===adventure.state.target)?adventure.state.target:(c.suggestMission(another&&adventure.state.target?[...trail,adventure.state.target]:trail,another?8:0)??c.suggestMission(another&&adventure.state.target?[adventure.state.target]:[]));
        const mission=local.find(m=>m.escrow_id===id);if(!mission){setAdventureError('No reachable mission in this scene. Choose another destination or explore freely.');return;}
        setAdventureError('');adventure.dispatch({type:'target',id:mission.escrow_id});c.markAdventure(mission.escrow_id);c.visit(mission.category,mission.escrow_id);
    };
    const tutorialMission=notice?.escrow_id===adventure.state.target&&adventure.state.step==='inspect';
    const inspectArrival=async(mission:Mission)=>{setArrivedNotice(false);const ticket=++inspectionRevision.current;await Promise.all([hunt.pause(),challenge.checkpoint()]);if(ticket!==inspectionRevision.current)return;controls.current?.cancelJourney();setSeen(old=>new Set([...old,mission.escrow_id]));setMissionLab(false);setJournal(false);setNotice(missions.find(m=>m.escrow_id===mission.escrow_id)??null);setInspected(null);setBrief(false);};
    const goHunt=(id:string)=>{setJournal(false);setNotice(null);setInspected(null);if(place.id!=='lagos'){setDistrictChoice('city');travel('lagos');setPendingHunt(id);}else if(districtChoice!=='city'){setDistrictChoice('city');setPendingHunt(id);}else controls.current?.visitPlace(id);};
    const [pendingHunt,setPendingHunt]=useState<string|null>(null),[pendingCheckpoint,setPendingCheckpoint]=useState<string|null>(null);
    const returnCheckpoint=(id:string)=>{setJournal(false);setNotice(null);if(place.id==='lagos'&&districtChoice==='city')controls.current?.returnToCheckpoint(id);else{setDistrictChoice('city');if(place.id!=='lagos')travel('lagos');setPendingCheckpoint(id);}};
    const busy=journal||missionLab||chart||help||venuePicker||author||soundPanel||characterPanel||trailPanel||importPanel||diagnostics||Boolean(notice)||Boolean(inspected);
    return (<main>
      {district && <React.Suspense fallback={<div className="loading-world" role="status">Preparing explorer…</div>}><Street onSceneReady={()=>setWorldReady(true)} onRepair={id=>{setRepairStation(id);setLegacyJournal(false);setNotice(null);setInspected(null);setJournal(true);setMissionLab(false);setVenuePicker(false);hunt.pause();}} onMissionStart={hunt.pause} huntTarget={!hunt.state.paused?huntStages[hunt.state.stage]?.placeId:null} huntComplete={hunt.state.stage===huntStages.length} activityEnabled={activityEnabled} adventureTarget={['walking','inspect'].includes(adventure.state.step)?adventure.state.target:null} appearance={appearance} trail={trailStops} activeStop={nextStop} district={district} sceneKey={loading.key} onTravel={() => {setNotice(null);setBrief(false);setSelectedRoad(null);setInspected(null);}} onPlace={(id,arrived)=>{if(arrived)hunt.arrive(id);sound.cue();setNotice(null);setInspected({id,arrived});}} onStreet={setSelectedRoad} key={place.id} place={place} missions={local} onReady={(c) => {controls.current=c;if(c){setView(c.currentView());if(pendingCheckpoint){c.returnToCheckpoint(pendingCheckpoint);setPendingCheckpoint(null);}if(pendingHunt){c.visitPlace(pendingHunt);setPendingHunt(null);}if(pendingStop){const m=local.find(m=>m.escrow_id===pendingStop);if(m){c.visit(m.category,m.escrow_id);setPendingStop(null);}}}}} onNotice={(m) => {
            setInspected(null);
            hunt.pause();setArrivedNotice(true);setNotice(m);
            adventure.dispatch({type:'arrive',id:m.escrow_id});
            if(trail.includes(m.escrow_id))setActiveStop(m.escrow_id);
            setBrief(false);
        }}/></React.Suspense>}
      {!district && <div className="loading-world" role="status">{loading.error?<><p>{loading.error}</p><GameButton onClick={loading.retry}>Retry district</GameButton></>:"Loading district…"}</div>}
      <header>
        <b className="brand">
          tenda<span>✦</span>
        </b>
        <GameButton onClick={() => {
            setCountry(null);
            openPanel('atlas');
        }}>
          ◎ {place.name} <span>⌄</span>
        </GameButton>
        <GameButton data-focus-return aria-label="Explorer help" onClick={() => openPanel('help')}>
          ?
        </GameButton>
      </header>
      <aside className="camera">
        {district?.geographic && <GameButton aria-label="Face north" onClick={() => controls.current?.north()}>N ↑</GameButton>}
        <GameButton onClick={() => controls.current?.zoom(-7)} aria-label="Zoom in">
          +
        </GameButton>
        <GameButton onClick={() => controls.current?.zoom(7)} aria-label="Zoom out">
          −
        </GameButton>
        <GameButton onClick={() => controls.current?.home()} aria-label="Find my character">
          ⌖
        </GameButton>
        <GameButton onClick={() => controls.current?.rotate(-Math.PI / 4)} aria-label="Rotate left">
          ↶
        </GameButton>
        <GameButton onClick={() => controls.current?.rotate(Math.PI / 4)} aria-label="Rotate right">
          ↷
        </GameButton>
      </aside>
      <nav className="view-switch" aria-label="Camera view">
        {(["overview", "adventure", "look"] as View[]).map((v) => (<GameButton key={v} aria-pressed={view === v} onClick={() => {
                setView(v);
                controls.current?.view(v);
            }}>
            {v === "overview"
                ? "↑ Overview"
                : v === "adventure"
                    ? "✦ Adventure"
                    : "◉ Look around"}
          </GameButton>))}
      </nav>
      {district?.geographic && <MapCredit information={district?.geographic}/>}
      {hunt.ready&&/NOT saved|Session progress/i.test(hunt.message)&&<GameButton className="save-warning" onClick={()=>openPanel('hunt')}>Hunt save unavailable · open backup</GameButton>}
      {!busy&&!hunt.state.paused&&huntStages[hunt.state.stage]&&<GameButton className="hunt-objective" onClick={()=>{openPanel('hunt');setLegacyJournal(true);}}>✦ {huntStages[hunt.state.stage].title} · Details</GameButton>}
      <NavigationStatus controls={controls}/>
      <CameraRecovery controls={controls} hidden={busy}/>
      <ActorControls controls={controls} movementVisible={movementVisible} onHideMovement={()=>setMovementVisible(false)} hidden={busy||!['hidden','done'].includes(adventure.state.step)}/>
      <footer aria-label="Explorer dock">
        <DockButton icon="hunt" label="Hunt" active={journal||trailPanel} onClick={()=>openPanel(journal?'none':'hunt')}/>
        <DockButton icon="alerts" label="Alerts" badge={newMatches.length} active={missionLab} onClick={()=>openPanel(missionLab?'none':'alerts')}/>
        <DockButton icon="places" label="Places" active={venuePicker} onClick={()=>openPanel(venuePicker?'none':'venues')}/>
      <ExplorerMenu recordingCount={benchmark.recording?benchmark.samples.length:undefined} onOpen={()=>openPanel('none')} onHelp={()=>openPanel('help')} movementVisible={movementVisible} onMovement={()=>setMovementVisible(v=>!v)} worldReady={worldReady} onImport={()=>openPanel('import')} onPerformance={()=>openPanel('performance')} activityEnabled={activityEnabled} onActivity={toggleActivity} onReplay={()=>{hunt.pause();controls.current?.cancelJourney();setNotice(null);setInspected(null);setAdventureError('');adventure.dispatch({type:'replay'});}} onCharacter={()=>{openPanel('character');}} city={place.name} country={place.countryName} count={local.length} district={districtChoice} hasDistricts={place.id==='lagos'} canAuthor={Boolean(district?.geographic)} soundActive={sound.active} road={selectedRoad} onDistrict={id=>{adventure.dispatch({type:'redirect'});controls.current=null;setNotice(null);setInspected(null);setSelectedRoad(null);setDistrictChoice(id);}} onSound={()=>{setAuthor(false);openPanel('sound');}} onMute={sound.stop} onAuthor={()=>{setSoundPanel(false);openPanel('author');}}/>
      </footer>

      <LazyPanelBoundary resetKey={`${journal}:${repairStation}:${legacyJournal}:${missionLab}:${chart}:${help}:${venuePicker}:${author}:${soundPanel}:${characterPanel}:${trailPanel}:${importPanel}:${diagnostics}:${notice?.escrow_id}:${inspected?.id}`} onClose={()=>openPanel('none')}>
      {journal&&!legacyJournal&&!repairStation&&<RepairFinder trailCount={trail.length} onTrail={()=>openPanel('trail')} placeIds={district?.places?.filter(p=>p.reachable).map(p=>p.id)??[]} onClose={()=>setJournal(false)} onLegacy={()=>setLegacyJournal(true)} onVisit={id=>{setJournal(false);controls.current?.visitRepair(id);}}/>}
      {journal&&!legacyJournal&&repairStation&&<ChallengePanel stationName={repairStations.find(s=>s.id===repairStation)?.name} game={challenge} onClose={()=>setJournal(false)} onLegacy={()=>setLegacyJournal(true)}/>}
      {journal&&legacyJournal&&<HuntPanel hunt={hunt} onCheckpoint={returnCheckpoint} onGo={goHunt} onClose={()=>setJournal(false)}/>}
      {missionLab&&<MissionLab mock={mock} watch={watch} setWatch={updateWatch} seen={seen} onInspect={inspectArrival} onClose={()=>setMissionLab(false)}/>}
      {inspected && !chart && !journal && !missionLab && district?.places?.find(p=>p.id===inspected.id) && <PlacePreview place={district?.places.find(p=>p.id===inspected.id)!} arrived={inspected.arrived} missions={local} onClose={()=>setInspected(null)} onVisit={()=>controls.current?.visitPlace(inspected.id)} onMission={id=>controls.current?.visitPlace(inspected.id,id)}/>}
      {notice && !chart && !journal && !missionLab && (<MissionPreview arrived={arrivedNotice} mockWork={<MockWork missionId={notice.escrow_id} key={notice.escrow_id} state={mock.state(notice.escrow_id)} requiresApproval={notice.requires_approval} onAdvance={()=>{hunt.pause();mock.advance(notice);}}/>} guided={tutorialMission?{read:adventure.state.read,onRead:()=>adventure.dispatch({type:'read',id:notice.escrow_id}),onSaved:()=>{adventure.dispatch({type:'save',id:notice.escrow_id});setNotice(null);}}:undefined} onNextSaved={nextSavedMission?()=>visitSavedMission(nextSavedMission):undefined} locationNote={notice.remote?"Remote sample · no physical travel required":district?.geographic ? (district?.places?.find(p=>p.missionIds.includes(notice.escrow_id))?"Explicit sample place link · not a real task address":"Virtual sample hub · actual task address not mapped") : undefined} notice={notice} brief={brief} setBrief={setBrief} trail={trail} onSave={() => {toggleTrail(notice.escrow_id);if(tutorialMission&&!trail.includes(notice.escrow_id)){adventure.dispatch({type:'save',id:notice.escrow_id});setNotice(null);}}} onClose={() => {
                setNotice(null);
                setBrief(false);
            }}/>)}
      {chart && (<AtlasDialog country={country} setCountry={setCountry} travel={travel} onClose={() => setChart(false)}/>)}
      {venuePicker && district && (<Wayfinder onPlace={id=>controls.current?.inspectPlace(id)} district={district} place={place} local={local} onClose={() => setVenuePicker(false)} onVisit={(category,id) => controls.current?.visit(category,id)} onLandmark={(id) => controls.current?.visitLandmark(id)}/>)}
      {characterPanel && <CharacterPanel appearance={appearance} onApply={profile=>{setAppearance(profile);if(adventure.state.step==='invite')adventure.dispatch({type:'start'});}} onClose={()=>setCharacterPanel(false)}/>}
      {trailPanel && <TrailPanel trail={trail} missions={missions} localIds={local.map(m=>m.escrow_id)} active={nextStop} onDiscover={()=>openPanel('venues')} onMove={moveTrail} onRemove={toggleTrail} onClose={()=>setTrailPanel(false)} onVisit={visitSavedMission}/>}
      {importPanel&&district?.geographic&&<ImportPanel district={district} onImport={records=>{setNotice(null);setInspected(null);setAuthored(current=>[...current,...records]);}} onClose={()=>setImportPanel(false)}/>}
      {diagnostics&&<PerformancePanel benchmark={benchmark} controls={controls.current} onClose={()=>setDiagnostics(false)}/>}
      {author && district?.geographic && <AuthorPanel district={district} records={authored} onAdd={r=>{setNotice(null);setInspected(null);setAuthored(a=>[...a,r]);}} onClose={()=>setAuthor(false)}/>}
      {soundPanel && <SoundPanel sound={sound} onClose={()=>setSoundPanel(false)}/>}
      <AdventureCoach error={adventureError} state={adventure.state} busy={busy||!hunt.state.paused} ready={Boolean(district)} title={local.find(m=>m.escrow_id===adventure.state.target)?.title} onDismiss={()=>{adventure.dispatch({type:'dismiss'});setAdventureError('');}} onStart={()=>adventure.dispatch({type:'start'})} onCharacter={()=>openPanel('character')} onGo={()=>beginDiscovery()} onRetry={()=>beginDiscovery(true)} onTrail={()=>{adventure.dispatch({type:'finish'});openPanel('trail');}} onMore={()=>{adventure.dispatch({type:'finish'});beginDiscovery(false,true);}}/>
      {help && (<ExplorerGuide geographic={Boolean(district?.geographic)} trailCount={trail.length} onClose={() => setHelp(false)}/>)}
      </LazyPanelBoundary>
    </main>);
}
