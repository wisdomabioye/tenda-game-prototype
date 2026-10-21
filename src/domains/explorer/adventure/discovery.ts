export interface DiscoveryCandidate{id:string;length:number;}
/** Route lengths are supplied by the renderer's existing navigation graph. */
export function chooseDiscovery(candidates:DiscoveryCandidate[],excluded:readonly string[]=[],minimumDistance=0){return candidates.filter(c=>!excluded.includes(c.id)&&Number.isFinite(c.length)&&c.length>=minimumDistance).sort((a,b)=>a.length-b.length)[0]?.id??null;}
