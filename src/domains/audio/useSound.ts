import {useLocalPreference} from '../../shared/storage/useLocalPreference';
import {useEffect,useRef,useState} from 'react';
import {defaultSound,parseSound,SoundEngine,type SoundSettings} from './engine';
export function useSound(){
 const [settings,setSettings]=useLocalPreference<SoundSettings>('tenda-sound',parseSound,()=>defaultSound);
 const [active,setActive]=useState(false),[error,setError]=useState('');
 const engine=useRef<SoundEngine|null>(null),ticket=useRef(0);
 const stop=()=>{ticket.current++;engine.current?.stop();setActive(false);};
 const enable=async()=>{const request=++ticket.current;try{const audio=engine.current??=new SoundEngine();audio.update(settings);const running=await audio.start();if(request===ticket.current){setActive(running);setError('');}}catch{if(request===ticket.current){setError('Audio is unavailable in this browser.');stop();}}};
 useEffect(()=>{engine.current?.update(settings);},[settings]);
 useEffect(()=>{const hide=()=>{if(document.hidden)stop();};document.addEventListener('visibilitychange',hide);return()=>{ticket.current++;document.removeEventListener('visibilitychange',hide);engine.current?.dispose();engine.current=null;};},[]);
 return {settings,setSettings,active,error,enable,stop,cue:()=>engine.current?.cue()};
}
