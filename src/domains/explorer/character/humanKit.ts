import {defaultAppearance,type Appearance,skinTones} from './appearance';
/** Independent appearance dimensions: no appearance controls speed, rewards or access. */
export function humanProportions(p:Appearance){
 const fullness={slim:.84,average:1,full:1.24}[p.body];
 return {height:{short:.86,medium:1,tall:1.16}[p.height],shoulders:(p.presentation==='masculine'?.84:p.presentation==='feminine'?.69:.75)*fullness,hips:(p.presentation==='feminine'?.76:p.presentation==='masculine'?.62:.65)*fullness,depth:p.body==='full'?1.18:p.body==='slim'?.88:1};
}
/** Stable local crowd cast; independent dimensions avoid one gender/hair/skin stereotype. */
export function cityHuman(index:number):Appearance{
 return {...defaultAppearance,skin:skinTones[(index*5+Math.floor(index/6))%skinTones.length].value,shirt:['#ef8566','#267d76','#9364ab','#e9b43b','#5c82b7','#b86181'][index%6],body:['average','slim','full'][index%3] as Appearance['body'],height:['medium','tall','short'][Math.floor(index/3)%3] as Appearance['height'],presentation:['masculine','feminine','neutral'][Math.floor(index/2)%3] as Appearance['presentation'],hair:['afro','long','bald','braids','short'][index%5] as Appearance['hair'],headwear:index%4===0?'cap':index%7===3?'scarf':'none',hairColor:index%4===0?'#625147':'#302b2c',glasses:index%4===1,outfit:['casual','smart','dress','tunic'][index%4] as Appearance['outfit'],mobility:index===10?'wheelchair':'walk'};
}
