import {GameButton,GameCard,CloseButton} from '../../../shared/ui/game/GameUI';
import {lazy,Suspense,useState} from 'react';
import {skinTones,hairOptions,bodyOptions,heightOptions,outfitOptions,headwearOptions,type Appearance} from './appearance';
import {cityHuman} from './humanKit';
const Preview=lazy(()=>import('./CharacterPreview').then(m=>({default:m.CharacterPreview})));
const title=(value:string)=>value.charAt(0).toUpperCase()+value.slice(1);
export function CharacterPanel({appearance,onApply,onClose}:{appearance:Appearance;onApply:(p:Appearance)=>void;onClose:()=>void}){
 const [draft,setDraft]=useState(appearance);
 const update=<K extends keyof Appearance>(key:K,value:Appearance[K])=>setDraft(p=>({...p,[key]:value}));
 return <GameCard role="dialog" aria-label="Choose your explorer" className="tool-panel character-panel"><CloseButton label="Close character selection" onClick={onClose}/><h2>Your explorer</h2><p>Choose your look. Every body, style and movement option has the same mission access and movement speed.</p><Suspense fallback={<p>Preparing character preview…</p>}><Preview appearance={draft}/></Suspense>
 <label>Try a city character<select value="" onChange={e=>{if(e.target.value!=='')setDraft(cityHuman(Number(e.target.value)));}}><option value="">Choose a starting look</option>{Array.from({length:12},(_,i)=>{const p=cityHuman(i);return <option key={i} value={i}>{i+1}. {title(p.hair)} · {p.body} · {p.headwear==='none'?p.outfit:p.headwear}</option>;})}</select></label>
 <div className="field-grid">
 <label>Character style<select value={draft.presentation} onChange={e=>update('presentation',e.target.value as Appearance['presentation'])}><option value="neutral">Open / neutral</option><option value="masculine">Man / masculine</option><option value="feminine">Woman / feminine</option></select></label>
 <label>Body build<select value={draft.body} onChange={e=>update('body',e.target.value as Appearance['body'])}>{bodyOptions.map(v=><option key={v} value={v}>{v==='full'?'Fuller build':title(v)}</option>)}</select></label>
 <label>Height<select value={draft.height} onChange={e=>update('height',e.target.value as Appearance['height'])}>{heightOptions.map(v=><option key={v} value={v}>{title(v)}</option>)}</select></label>
 <label>Skin tone<select value={draft.skin} onChange={e=>update('skin',e.target.value)}>{skinTones.map(v=><option key={v.value} value={v.value}>{v.label}</option>)}</select></label>
 <label>Clothing<select value={draft.outfit} onChange={e=>update('outfit',e.target.value as Appearance['outfit'])}>{outfitOptions.map(v=><option key={v} value={v}>{title(v)}</option>)}</select></label>
 <label>Hair<select value={draft.hair} onChange={e=>update('hair',e.target.value as Appearance['hair'])}>{hairOptions.map(v=><option key={v} value={v}>{title(v)}</option>)}</select></label>
 <label>Headwear<select value={draft.headwear} onChange={e=>update('headwear',e.target.value as Appearance['headwear'])}>{headwearOptions.map(v=><option key={v} value={v}>{title(v)}</option>)}</select></label>
 <label>Hair colour<input type="color" value={draft.hairColor} onChange={e=>update('hairColor',e.target.value)}/></label>
 <label>Clothing colour<input type="color" value={draft.shirt} onChange={e=>update('shirt',e.target.value)}/></label>
 </div>
 <label>Movement<select value={draft.mobility} onChange={e=>update('mobility',e.target.value as Appearance['mobility'])}><option value="walk">Walking</option><option value="wheelchair">Wheelchair</option></select></label><label className="check-option"><input type="checkbox" checked={draft.glasses} onChange={e=>update('glasses',e.target.checked)}/>Glasses</label><GameButton onClick={()=>{onApply(draft);onClose();}}>Use this explorer</GameButton><p>All combinations are open to everyone. Saved on this device; not shared with employers or used for eligibility. All appearances share the same game route network. This is not a real-world accessibility map.</p></GameCard>;
}
