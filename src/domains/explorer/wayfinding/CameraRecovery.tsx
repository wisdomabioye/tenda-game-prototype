import {useEffect,useState,type RefObject} from 'react';
import {GameButton} from '../../../shared/ui/game/GameUI';
import type {Controls} from '../../world/runtime/contracts';
export function CameraRecovery({controls,hidden}:{controls:RefObject<Controls|null>;hidden:boolean}){const [away,setAway]=useState(false);useEffect(()=>{const timer=window.setInterval(()=>setAway(controls.current?.cameraAway()??false),500);return()=>clearInterval(timer);},[controls]);return away&&!hidden?<GameButton className="camera-recovery" onClick={()=>{controls.current?.home();setAway(false);}}>⌖ Return to explorer</GameButton>:null;}
