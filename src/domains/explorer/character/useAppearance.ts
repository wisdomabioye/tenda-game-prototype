import {useLocalPreference} from '../../../shared/storage/useLocalPreference';
import {parseAppearance} from './appearance';
export function useAppearance(){
 const [appearance,setAppearance]=useLocalPreference('tenda-character',parseAppearance,()=>parseAppearance(null));
 return {appearance,setAppearance};
}
