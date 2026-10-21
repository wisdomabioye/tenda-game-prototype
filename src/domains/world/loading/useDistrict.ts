import {useEffect,useRef,useState} from 'react';
import type {DistrictDefinition} from '../districts/shared/types';
import {loadDistrict} from './loader';
import {createRequestGate} from './requests';
export function useDistrict(place:{id:string;ground:string},categories:string[],selection:string){
    const key=`${place.id}:${selection}:${place.ground}:${[...new Set(categories)].sort().join(',')}`;
    const gate=useRef(createRequestGate()),[attempt,retry]=useState(0);
    const [state,setState]=useState<{key:string;district?:DistrictDefinition;error?:string}>({key:''});
    useEffect(()=>{const ticket=gate.current.begin(),abort=new AbortController();setState({key});
        loadDistrict(place,new Set(categories),selection,abort.signal).then(district=>{if(gate.current.current(ticket))setState({key,district});}).catch(error=>{if(gate.current.current(ticket)&&!abort.signal.aborted)setState({key,error:error instanceof Error?error.message:'District failed to load'});});
        return ()=>{abort.abort();gate.current.cancel();};
    },[key,attempt]);
    return {key,district:state.key===key?state.district:undefined,error:state.key===key?state.error:undefined,retry:()=>retry(n=>n+1)};
}
