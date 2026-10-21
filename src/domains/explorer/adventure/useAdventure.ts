import {useEffect,useReducer} from 'react';
import {adventureTransition,initialAdventure} from './model';
export function useAdventure(){
 const [state,dispatch]=useReducer(adventureTransition,undefined,()=>{try{return localStorage.getItem('tenda-adventure-v1')==='hidden'?{...initialAdventure,step:'hidden' as const}:initialAdventure;}catch{return initialAdventure;}});
 useEffect(()=>{if(state.step==='hidden'||state.step==='done'||state.step==='saved'){try{localStorage.setItem('tenda-adventure-v1','hidden');}catch{}}},[state.step]);
 return {state,dispatch};
}
