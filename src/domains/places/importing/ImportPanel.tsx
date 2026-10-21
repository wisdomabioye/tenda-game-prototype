import {GameButton,GameCard,CloseButton} from '../../../shared/ui/game/GameUI';
import {samplePlace} from '../authoring/sample';
import {useRef,useState} from 'react';
import type {AuthoredPlace} from '../authoring/placement';
import type {DistrictDefinition} from '../../world/districts/shared/types';
import {parsePlaceImport} from './model';
const example=JSON.stringify({version:1,cityId:'lagos',authoredPlaces:[{...samplePlace,id:'imported-shop',name:'Sample courtyard shop',type:'shop'}]},null,2);
export function ImportPanel({district,onImport,onClose}:{district:DistrictDefinition;onImport:(records:AuthoredPlace[])=>void;onClose:()=>void}){
 const revision=useRef(0);
 const [text,setText]=useState(example),[error,setError]=useState(''),[valid,setValid]=useState<AuthoredPlace[]|null>(null);
 const update=(value:string)=>{revision.current++;setText(value);setValid(null);setError('');};
 return <GameCard className="tool-panel" role="dialog" aria-label="Import city places"><CloseButton label="Close import" onClick={onClose}/><h2>Import city places</h2><p>Shops, restaurants, malls, offices and building landmarks. Coordinates are exact; every entrance must connect. Entire import is rejected if any record fails.</p><label>JSON file<input type="file" accept=".json,application/json" onChange={async e=>{const file=e.target.files?.[0];if(!file)return;const ticket=++revision.current;setValid(null);setError('Reading file…');if(file.size>100000){setError('File limit:100 KB');return;}try{const value=await file.text();if(ticket===revision.current)update(value);}catch{if(ticket===revision.current)setError('Could not read the file');}}}/></label><label>Catalogue JSON<textarea maxLength={100000} rows={10} value={text} onChange={e=>update(e.target.value)}/></label><GameButton onClick={()=>{try{const records=parsePlaceImport(text,district);setValid(records);setError(`${records.length} places validated. Ready to apply.`);}catch(e){setValid(null);setError(e instanceof Error?e.message:'Invalid JSON');}}}>Validate import</GameButton><p role="status">{error}</p><GameButton disabled={!valid} onClick={()=>{try{const records=parsePlaceImport(text,district);onImport(records);onClose();}catch(e){setValid(null);setError(e instanceof Error?e.message:'Import failed');}}}>Apply places</GameButton><p>Session-only; use Add sample place → Export to keep a file. Building landmarks use the office kit, not monument geometry. No partner verification or mission assignment is inferred.</p></GameCard>;
}
