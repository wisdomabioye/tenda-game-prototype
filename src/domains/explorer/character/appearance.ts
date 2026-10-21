export const hairOptions=['short','long','bald','afro','braids'] as const;
export const bodyOptions=['slim','average','full'] as const;
export const heightOptions=['short','medium','tall'] as const;
export const presentationOptions=['neutral','masculine','feminine'] as const;
export const headwearOptions=['none','cap','scarf'] as const;
export const outfitOptions=['casual','smart','dress','tunic'] as const;
export const skinTones=[{label:'Deep brown',value:'#4e3026'},{label:'Dark brown',value:'#68422f'},{label:'Warm brown',value:'#ad7652'},{label:'Golden brown',value:'#c59169'},{label:'Light brown',value:'#d5a27c'},{label:'Light',value:'#f1cfad'}];
export interface Appearance {skin:string;shirt:string;hair:typeof hairOptions[number];glasses:boolean;mobility:'walk'|'wheelchair';outfit:typeof outfitOptions[number];body:typeof bodyOptions[number];height:typeof heightOptions[number];presentation:typeof presentationOptions[number];headwear:typeof headwearOptions[number];hairColor:string;}
export const defaultAppearance:Appearance={skin:'#ad7652',shirt:'#1672d4',hair:'short',glasses:false,mobility:'walk',outfit:'casual',body:'average',height:'medium',presentation:'neutral',headwear:'none',hairColor:'#302b2c'};
export function parseAppearance(value:unknown):Appearance{
 const p=value&&typeof value==='object'?value as Partial<Appearance>:{};
 const color=(v:unknown,fallback:string)=>typeof v==='string'&&/^#[a-f0-9]{6}$/i.test(v)?v:fallback;
 const choice=<T extends string>(v:unknown,options:readonly T[],fallback:T):T=>typeof v==='string'&&options.includes(v as T)?v as T:fallback;
 return {skin:color(p.skin,defaultAppearance.skin),shirt:color(p.shirt,defaultAppearance.shirt),hair:choice(p.hair,hairOptions,'short'),glasses:p.glasses===true,mobility:p.mobility==='wheelchair'?'wheelchair':'walk',outfit:choice(p.outfit,outfitOptions,'casual'),body:choice(p.body,bodyOptions,'average'),height:choice(p.height,heightOptions,'medium'),presentation:choice(p.presentation,presentationOptions,'neutral'),headwear:choice(p.headwear,headwearOptions,'none'),hairColor:color(p.hairColor,defaultAppearance.hairColor)};
}
