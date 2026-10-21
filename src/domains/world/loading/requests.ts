/** Latest request wins, even when an underlying module import cannot be aborted. */
export function createRequestGate(){let revision=0;return {begin:()=>++revision,current:(id:number)=>id===revision,cancel:()=>{revision++;}};}
export function createBoundedCache<T>(limit:number){const items=new Map<string,T>();return {get(key:string){const item=items.get(key);if(item!==undefined){items.delete(key);items.set(key,item);}return item;},set(key:string,item:T){items.delete(key);items.set(key,item);while(items.size>limit)items.delete(items.keys().next().value!);},get size(){return items.size;}};}
