/** Browser preference I/O only. Feature parsers own the data contract. */
export function readJsonPreference<T>(key:string,parse:(raw:unknown)=>T,fallback:()=>T,storage?:Pick<Storage,'getItem'>):T {
    try {
        const raw=(storage??globalThis.localStorage).getItem(key);
        if(raw!==null)return parse(JSON.parse(raw));
    }catch{ /* Disabled storage or incompatible data must not prevent play. */ }
    return fallback();
}
export function writeJsonPreference(key:string,value:unknown,storage?:Pick<Storage,'setItem'>):boolean {
    try {
        const text=JSON.stringify(value);
        if(text===undefined)return false;
        (storage??globalThis.localStorage).setItem(key,text);
        return true;
    }catch{return false;}
}
