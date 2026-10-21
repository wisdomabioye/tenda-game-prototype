import {GameButton,GameCard,CloseButton} from '../../../shared/ui/game/GameUI';
import type { WorldPlace } from '../model';
import type { Mission } from '../../missions/model/mission';
export function PlacePreview({ place, missions, arrived, onClose, onVisit, onMission }: {
    place: WorldPlace;
    missions: Mission[];
    arrived: boolean;
    onClose: () => void;
    onVisit: () => void;
    onMission: (id: string) => void;
}) {
    const linked = place.missionIds.map(id => ({ id, mission: missions.find(m => m.escrow_id === id) }));
    return <GameCard className="place-preview" aria-label="Place details">
        <CloseButton label="Close place details" onClick={onClose}/>
        <small>Illustrative sample place · Lagos · {place.type}</small>
        <h2>{place.name}</h2>
        <p>{arrived ? 'You reached the game entrance.' : 'Inspect this place, then follow its entrance path.'}</p>
        <p className="place-note">Fictional building and sample mission links. Not a verified business or real task address.</p>
        <GameButton disabled={!place.reachable} onClick={onVisit}>{arrived ? 'Return to entrance' : 'Walk to entrance'}</GameButton>
        {!place.reachable && <p role="status">Entrance route unavailable. You can still inspect this place.</p>}
        <h3>Explicitly linked sample missions</h3>
        {linked.length ? linked.map(({ id, mission }) => mission ? <GameButton className="place-mission" disabled={!place.reachable} key={id} onClick={() => onMission(id)}>{mission.title} →</GameButton> : <p key={id}>Linked mission unavailable ({id}).</p>) : <p>No linked missions at this place.</p>}
        <small>Sample coordinates: {place.coordinate.latitude.toFixed(5)}, {place.coordinate.longitude.toFixed(5)} · Ground entrance</small>
    </GameCard>;
}
