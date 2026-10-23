import {useEffect,useRef,useState} from 'react';
import type {Controls} from '../runtime/contracts';
import {createBenchmarkRecorder} from './recorder';
export function useBenchmark(controls:{current:Controls|null}){
 const recorder=useRef(createBenchmarkRecorder()).current;
 const [state,setState]=useState(recorder.snapshot);
 useEffect(()=>{const timer=setInterval(()=>{if(!recorder.snapshot.recording)return;recorder.tick(controls.current?.performance(),!document.hidden);setState(recorder.snapshot);},1000);return()=>clearInterval(timer);},[controls,recorder]);
 return {...state,start:()=>{recorder.start();setState(recorder.snapshot);},stop:()=>{recorder.stop();setState(recorder.snapshot);}};
}
export type BenchmarkSession=ReturnType<typeof useBenchmark>;
