import assert from 'node:assert/strict';
import {readJsonPreference,writeJsonPreference} from '../src/shared/storage/jsonPreferences';
import {parseAppearance} from '../src/domains/explorer/character/appearance';
import {parseWatchlist,watchCities} from '../src/domains/missions/engagement/policy';
import {angleDelta} from '../src/shared/motion/angles';
const values=new Map<string,string>();
const storage={getItem:(key:string)=>values.get(key)??null,setItem:(key:string,text:string)=>{values.set(key,text);}};
const number=(raw:unknown)=>{if(typeof raw!=='number')throw Error('not a number');return raw;};
let defaults=0;const fallback=()=>{defaults++;return 42;};
assert.equal(readJsonPreference('number',number,fallback,storage),42);assert.equal(defaults,1);
assert(writeJsonPreference('number',0,storage));assert.equal(readJsonPreference('number',number,fallback,storage),0);assert.equal(defaults,1,'valid zero must not trigger fallback');
values.set('number','{');assert.equal(readJsonPreference('number',number,fallback,storage),42);
values.set('number','"wrong type"');assert.equal(readJsonPreference('number',number,fallback,storage),42,'feature parser rejects incompatible JSON');
const appearance=parseAppearance({skin:'#68422f',mobility:'wheelchair',glasses:true});
assert(writeJsonPreference('tenda-character',appearance,storage));assert.deepEqual(readJsonPreference('tenda-character',parseAppearance,()=>parseAppearance(null),storage),appearance);
const before=values.get('tenda-character'),circular:{self?:object}={};circular.self=circular;
assert.equal(writeJsonPreference('tenda-character',circular,storage),false);assert.equal(values.get('tenda-character'),before,'serialization failure preserves the old record');
assert.equal(writeJsonPreference('missing',undefined,storage),false);assert(!values.has('missing'));
assert.equal(writeJsonPreference('x',1,{setItem:()=>{throw Error('quota');}}),false);
assert.equal(readJsonPreference('x',number,fallback,{getItem:()=>{throw Error('blocked');}}),42);
const original=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
Object.defineProperty(globalThis,'localStorage',{configurable:true,get(){throw Error('access denied');}});
try{assert.equal(readJsonPreference('x',number,()=>42),42);assert.equal(writeJsonPreference('x',1),false);}finally{if(original)Object.defineProperty(globalThis,'localStorage',original);else Reflect.deleteProperty(globalThis,'localStorage');}
for(const city of watchCities)assert.equal(parseWatchlist({city}).city,city);
assert.deepEqual(parseWatchlist({remote:false,city:'unknown',category:'unknown',quiet:true}),{remote:false,city:'Lagos',category:'all',quiet:true,quietStart:'',quietEnd:''});
assert.equal(parseWatchlist({category:'photo'}).category,'photo');assert.equal(parseWatchlist(null).remote,true);
const degrees=(n:number)=>n*Math.PI/180;
assert(Math.abs(angleDelta(degrees(179),degrees(-179))-degrees(2))<1e-12,'turn across the positive seam follows the short arc');
assert(Math.abs(angleDelta(degrees(-179),degrees(179))+degrees(2))<1e-12);
for(let i=0;i<1000;i++){
 const from=(i-500)*.41,to=(i%17-8)*1.23,delta=angleDelta(from,to);
 assert(Math.abs(delta)<=Math.PI+1e-12);
 assert(Math.abs(Math.sin(from+delta)-Math.sin(to))<1e-12&&Math.abs(Math.cos(from+delta)-Math.cos(to))<1e-12,'shortest turn reaches the same target orientation');
}
console.log('Preferences and motion: validation, zero/defaults, blocked storage, quota/serialization failure, saved appearance/watch choices and 1,000 wrapped headings passed.');
