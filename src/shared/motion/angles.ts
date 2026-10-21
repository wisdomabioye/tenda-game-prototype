/** Signed shortest turn from one heading to another, including the ±π seam. */
export function angleDelta(from:number,to:number){
    return Math.atan2(Math.sin(to-from),Math.cos(to-from));
}
