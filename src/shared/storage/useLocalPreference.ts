import {useEffect,useState} from 'react';
import {readJsonPreference,writeJsonPreference} from './jsonPreferences';
/** Fixed-key preferences hydrate once; feature-specific decoding stays with the caller. */
export function useLocalPreference<T>(key:string,parse:(raw:unknown)=>T,fallback:()=>T){
    const [value,setValue]=useState<T>(()=>readJsonPreference(key,parse,fallback));
    useEffect(()=>{writeJsonPreference(key,value);},[key,value]);
    return [value,setValue] as const;
}
