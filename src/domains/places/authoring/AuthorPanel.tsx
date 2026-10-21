import {GameButton,GameCard,CloseButton} from '../../../shared/ui/game/GameUI';
import {samplePlace} from './sample';
import {useState} from 'react';
import type {DistrictDefinition} from '../../world/districts/shared/types';
import {addAuthoredPlace,type AuthoredPlace} from './placement';
export function AuthorPanel({district,records,onAdd,onClose}:{district:DistrictDefinition;records:AuthoredPlace[];onAdd:(record:AuthoredPlace)=>void;onClose:()=>void}){
    const [draft,setDraft]=useState<AuthoredPlace>({...samplePlace}),[message,setMessage]=useState(''),[valid,setValid]=useState(false),[exported,setExported]=useState('');
    const update=(key:keyof AuthoredPlace,value:string|number)=>{setDraft(d=>({...d,[key]:value}));setValid(false);setMessage('');};
    const validate=()=>{try{addAuthoredPlace(district,draft);setValid(true);setMessage('Placement is clear and its ground entrance is connected.');}catch(e){setValid(false);setMessage(e instanceof Error?e.message:'Invalid placement');}};
    const exportJSON=()=>{const text=JSON.stringify({version:1,cityId:district.id,sample:true,authoredPlaces:records},null,2);setExported(text);const url=URL.createObjectURL(new Blob([text],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=`${district.id}-sample-places.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
    return <GameCard className="tool-panel" role="dialog" aria-label="Place authoring"><CloseButton label="Close authoring" onClick={onClose}/><h2>Add a sample place</h2><p>Starts with an illustrative clear coordinate. Coordinates are used exactly. Invalid placements are rejected, never moved automatically.</p>
        {(['id','name'] as const).map(key=><label key={key}>{key}<input value={draft[key]} onChange={e=>update(key,e.target.value)}/></label>)}
        <label>Building style<select value={draft.type} onChange={e=>update('type',e.target.value)}><option value="restaurant">Restaurant</option><option value="mall">Mall</option><option value="office">Office</option><option value="shop">Shop</option><option value="landmark">Building landmark</option></select></label>
        <div className="field-grid">{(['latitude','longitude','width','depth','rotation','floors'] as const).map(key=><label key={key}>{key}<input type="number" step={key==='latitude'||key==='longitude'?'.00001':'1'} value={draft[key]} onChange={e=>update(key,Number(e.target.value))}/></label>)}</div>
        <label>Colour<input type="color" value={draft.color} onChange={e=>update('color',e.target.value)}/></label>
        <GameButton onClick={validate}>Validate placement</GameButton><p role="status">{message}</p><GameButton disabled={!valid} onClick={()=>{try{addAuthoredPlace(district,draft);onAdd(draft);onClose();}catch(e){setValid(false);setMessage(e instanceof Error?e.message:'Placement failed');}}}>Add to map</GameButton>
        <p>Session-only sample. New places start with no mission links.</p><GameButton onClick={exportJSON}>Export authored JSON ({records.length})</GameButton>{exported&&<textarea aria-label="Exported catalogue JSON" value={exported} readOnly rows={6}/>}
    </GameCard>;
}
