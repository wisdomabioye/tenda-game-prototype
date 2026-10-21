export function toggleSavedStop(trail: readonly string[], id: string) {
    return trail.includes(id)
        ? trail.filter((stop) => stop !== id)
        : [...trail, id];
}
export function parseTrail(value:unknown):string[]{return Array.isArray(value)?[...new Set(value.filter((id):id is string=>typeof id==='string'&&id.length>0&&id.length<200))].slice(0,100):[];}
export function reorderStop(trail:readonly string[],id:string,direction:-1|1){const next=[...trail],index=next.indexOf(id),target=index+direction;if(index<0||target<0||target>=next.length)return next;[next[index],next[target]]=[next[target],next[index]];return next;}

export function nextLocalStop(trail:readonly string[],localIds:readonly string[],preferred:string|null){return preferred&&trail.includes(preferred)&&localIds.includes(preferred)?preferred:trail.find(id=>localIds.includes(id))??null;}
