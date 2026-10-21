/** Dismiss only a deliberate downward swipe from the sheet heading, never body scrolling. */
export function dismissSheetSwipe(start:{x:number;y:number},end:{x:number;y:number}){
 const dy=end.y-start.y,dx=Math.abs(end.x-start.x);
 return dy>=72&&dy>dx*1.5;
}
