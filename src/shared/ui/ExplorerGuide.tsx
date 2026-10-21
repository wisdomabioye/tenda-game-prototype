import {GameCard,CloseButton} from './game/GameUI';
export function ExplorerGuide({ trailCount, onClose, geographic = false, }: {
    geographic?: boolean;
    trailCount: number;
    onClose: () => void;
}) {
    return (<div className="shade">
      <GameCard className="compact-modal" role="dialog" aria-modal="true" aria-label="Explorer guide">
        <CloseButton label="Close guide" onClick={() => onClose()}/>
        <h2>A little world of possibility.</h2><p>Demo explorer · sample missions · no live transactions. Source roads are combined with illustrative game scenery.</p>
        <p>WASD or arrow keys move your explorer; hold Shift to move faster. E interacts with the nearby bench or parcel table. Escape pauses the explorer when no panel is open. The Move control provides touch equivalents and shortcuts to the bench/table. Activities and held items save on this browser when storage is available. After reloading, choose Resume to continue.</p><p>
          Tap a numbered notice to walk there. Drag to explore; pinch to zoom.
          In Look around, one-finger dragging turns the camera through 360°.
        </p>
        <p>
          Two fingers pan and pinch; twisting rotates. Use the arrow buttons to
          rotate without gestures. Three fingers have no dedicated action.
        </p>
        <p>
          Overview helps you find places. Adventure follows your character. Look
          around brings you closer. {geographic ? "Blue lines show your selected walking route. Amber passages are fictional pedestrian shortcuts, not real access rights. Roads follow a small Victoria Island snapshot; buildings, stalls and rest areas are stylised game scenery." : "The Creative rooftop has an elevated access ramp."}
        </p>
        <p>
          Your trail has {trailCount} saved stops. Use My trail to visit saved
          work in this district. Stable saved stops and hunt progress stay in this browser where storage is available. New simulated arrivals and work states reset on reload.
        </p>
        <small>
          {geographic ? "Physical green street-name boards are roadside scenery; zoom in to read them. Overview shows plain names following the road. Select a road there or search Wayfinder to highlight it. Restaurant, mall and office examples are fictional sample places. Tap their teal icons or buildings to inspect them, or find them in Wayfinder. Light-butter approach paths reach their ground entrances. Only explicitly linked sample missions appear in place details. Numbered notices and mission counts replace the floating venue-name panels; use Wayfinder for venue names. Stairs and upper floors are scenery in this iteration; missions remain at ground-level stops. Mission hubs are virtual: they are not task addresses or partner shops. This patch has no mapped waterfront. Use the map for game discovery, not physical directions or proof of presence." : "Other cities retain the shared illustrative test layout."} Account, eligibility, proof and settlement remain separate Tenda integration work.
        </small>
      </GameCard>
    </div>);
}
