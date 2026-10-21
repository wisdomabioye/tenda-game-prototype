import {GameButton,GameCard,CloseButton} from '../../../shared/ui/game/GameUI';
import {useState} from 'react';
import type { DistrictDefinition } from "../../world/districts/shared/types";
import type { Place } from "../../atlas/places";
import type { Mission } from "../../missions/model/mission";
export function Wayfinder({ district, place, local, onClose, onVisit, onLandmark, onPlace, }: {
    district: DistrictDefinition;
    place: Place;
    local: Mission[];
    onClose: () => void;
    onVisit: (category: string,id?:string) => void;
    onLandmark: (id: string) => void;
    onPlace:(id:string)=>void;
}) {
    const [query,setQuery]=useState("");
    const matches=(name:string)=>name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
    const atHub=(category:string)=>local.filter(m=>m.category===category&&!district.places?.some(p=>p.missionIds.includes(m.escrow_id)));
    const visibleVenues=district.venues.filter(v=>matches(v.name)&&(place.id!=="remote"||local.some(m=>m.category===v.category)));
    const visibleStreets=district.landmarks.filter(l=>matches(l.name));
    const visiblePlaces=(district.places??[]).filter(p=>matches(p.name));
    return (<div className="shade">
      <GameCard className="compact-modal" role="dialog" aria-modal="true" aria-label="Wayfinder">
        <CloseButton label="Close wayfinder" onClick={() => onClose()}/>
        <h2>Where to?</h2>
        <p>Find a place, street or mission venue.</p>
        <label className="wayfinder-search">Search places, streets and venues<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Place, street or venue name"/></label>
        {visiblePlaces.length>0&&<><h3>Sample places</h3>{visiblePlaces.map(place=><GameButton className="venue-option" key={place.id} onClick={()=>{onClose();onPlace(place.id);}}><span>{place.name}</span><b>Inspect →</b></GameButton>)}</>}
        {visibleVenues
            .map((v) => (<GameButton className="venue-option" key={v.category} disabled={!atHub(v.category).length} onClick={() => {
                onClose();
                onVisit(v.category,atHub(v.category)[0]?.escrow_id);
            }}>
              <span>{v.name}</span>
              <b>
                {atHub(v.category).length} notices
                →
              </b>
            </GameButton>))}
        {visiblePlaces.length===0&&visibleVenues.length===0&&visibleStreets.length===0&&<p role="status">No matching places, streets or venues.</p>}
        {place.id === "lagos" && (<>
            <h3>Explore the neighbourhood</h3>
            {visibleStreets.map((l) => (<GameButton className="venue-option" key={l.id} onClick={() => {
                    onClose();
                    onLandmark(l.id);
                }}>
                <span>{l.name}</span>
                <b>Walk there →</b>
              </GameButton>))}
          </>)}
      </GameCard>
    </div>);
}
