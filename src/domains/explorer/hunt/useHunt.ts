import {createSaveQueue} from '../../../shared/storage/saveQueue';
import {useEffect,useRef,useState} from 'react';
import {initialHunt,parseHunt,huntStages,answerHunt,type HuntState} from './model';
import {readHunt,writeHunt} from './storage';
export function useHunt(){
 const [state,setState]=useState(initialHunt),[ready,setReady]=useState(false),[message,setMessage]=useState('Loading local journal…'),[saving,setSaving]=useState(false),latest=useRef(state),queue=useRef(createSaveQueue());latest.current=state;
 useEffect(()=>{let alive=true;readHunt().then(saved=>{if(alive){setState(saved??initialHunt);latest.current=saved??initialHunt;setMessage('Saved on this browser only.');}}).catch(()=>{if(alive)setMessage('Local storage unavailable or save incompatible. Session progress only; export a backup.');}).finally(()=>{if(alive)setReady(true);});return()=>{alive=false;};},[]);
 const commit=(next:HuntState)=>{latest.current=next;setState(next);setSaving(true);const pending=queue.current.enqueue(()=>writeHunt(next)).then(()=>{if(latest.current===next)setMessage('Checkpoint saved on this browser.');}).catch(()=>{if(latest.current===next)setMessage('Checkpoint NOT saved. Session progress only; export a backup.');}).finally(()=>{if(latest.current===next)setSaving(false);});return pending;};
 return {state,ready,saving,message,commit,pause:()=>ready&&!latest.current.paused?commit({...latest.current,paused:true}):queue.current.pending,resume:()=>commit({...latest.current,paused:false}),arrive:(id:string)=>{const s=latest.current;if(!s.paused&&huntStages[s.stage]?.placeId===id)commit({...s,reached:id});},answer:(choice:number)=>{const next=answerHunt(latest.current,choice);const changed=next!==latest.current;if(changed)commit(next);return changed;},importSave:(text:string)=>{if(text.length>20000)throw new Error('Backup limit is 20 KB.');return commit(parseHunt(JSON.parse(text)));}};
}
export type Hunt=ReturnType<typeof useHunt>;
