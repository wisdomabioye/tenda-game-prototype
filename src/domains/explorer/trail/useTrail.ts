import {useLocalPreference} from '../../../shared/storage/useLocalPreference';
import {toggleSavedStop,reorderStop,parseTrail} from './model';
export function useTrail(){
 const [trail,setTrail]=useLocalPreference('tenda-trail',raw=>parseTrail(raw).filter(id=>!id.startsWith('e0260000')),()=>[]);
 return {trail,toggleTrail:(id:string)=>setTrail(current=>toggleSavedStop(current,id)),moveTrail:(id:string,direction:-1|1)=>setTrail(current=>reorderStop(current,id,direction))};
}
