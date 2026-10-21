export type AdventureStep='welcome'|'invite'|'walking'|'inspect'|'saved'|'done'|'hidden';
export interface AdventureState{step:AdventureStep;target:string|null;read:boolean;}
export type AdventureEvent={type:'start'}|{type:'target';id:string}|{type:'arrive';id:string}|{type:'read';id:string}|{type:'save';id:string}|{type:'dismiss'}|{type:'replay'}|{type:'finish'}|{type:'redirect'};
export const initialAdventure:AdventureState={step:'welcome',target:null,read:false};
export function adventureTransition(state:AdventureState,event:AdventureEvent):AdventureState{
 switch(event.type){
 case 'dismiss':return {...state,step:'hidden'};
 case 'replay':return initialAdventure;
 case 'start':return state.step==='welcome'?{...state,step:'invite'}:state;
 case 'target':return ['invite','walking','saved','done'].includes(state.step)?{step:'walking',target:event.id,read:false}:state;
 case 'arrive':return state.step==='walking'&&state.target===event.id?{...state,step:'inspect'}:state;
 case 'read':return state.step==='inspect'&&state.target===event.id?{...state,read:true}:state;
 case 'save':return state.step==='inspect'&&state.target===event.id&&state.read?{...state,step:'saved'}:state;
 case 'finish':return state.step==='saved'?{...state,step:'done'}:state;
 case 'redirect':return ['walking','inspect'].includes(state.step)?{step:'invite',target:null,read:false}:state;
 }
}
