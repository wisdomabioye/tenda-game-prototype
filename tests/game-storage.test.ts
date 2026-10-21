import assert from 'node:assert/strict';
import {readGameRecord,writeGameRecord} from '../src/shared/storage/gameRecords';
import {readHunt,writeHunt} from '../src/domains/explorer/hunt/storage';
import {initialHunt} from '../src/domains/explorer/hunt/model';
// A controllable IDB boundary: production owns all request/transaction callbacks.
// These doubles deliberately distinguish put success from transaction commit/abort.
const descriptor=Object.getOwnPropertyDescriptor(globalThis,'indexedDB');
const values=new Map<string,unknown>();let closed=0,opened=0,upgraded=0;
let fail:'open'|'read'|'abort'|'write'|'transaction'|null=null;
const failure=new Error('storage failure');
const factory={open(name:string,version:number){
 assert.equal(name,'tenda-local-game');assert.equal(version,1);opened++;
 const db={createObjectStore:(name:string)=>{assert.equal(name,'saves');upgraded++;},close:()=>closed++,transaction(name:string){
  assert.equal(name,'saves');if(fail==='transaction')throw failure;
  const tx:{oncomplete:(()=>void)|null;onerror:(()=>void)|null;onabort:(()=>void)|null;error:Error;objectStore:()=>typeof store}={oncomplete:null,onerror:null,onabort:null,error:failure,objectStore:()=>store};
  const store={get(key:string){const request={result:values.get(key),error:failure,onsuccess:null as (()=>void)|null,onerror:null as (()=>void)|null};queueMicrotask(()=>fail==='read'?request.onerror?.():request.onsuccess?.());return request;},put(value:unknown,key:string){queueMicrotask(()=>{if(fail==='abort')tx.onabort?.();else if(fail==='write')tx.onerror?.();else{values.set(key,value);tx.oncomplete?.();}});}};
  return tx;
 }};
 const request={result:db,error:failure,onupgradeneeded:null as (()=>void)|null,onerror:null as (()=>void)|null,onsuccess:null as (()=>void)|null};
 queueMicrotask(()=>{if(fail==='open')request.onerror?.();else{if(opened===1)request.onupgradeneeded?.();request.onsuccess?.();}});return request;
}};
Object.defineProperty(globalThis,'indexedDB',{configurable:true,value:factory});
try{
 assert.equal(await readHunt(),null);assert.equal(upgraded,1);
 await writeHunt(initialHunt);assert(values.has('palm-parcel'),'old hunt save key survives infrastructure consolidation');assert.deepEqual(await readHunt(),initialHunt);
 await writeGameRecord('repair-directory:x:v1',{stage:1});assert.deepEqual(await readGameRecord('repair-directory:x:v1'),{stage:1});assert.deepEqual(await readHunt(),initialHunt,'station saves never overwrite the hunt');
 for(const mode of ['read','abort','write','transaction'] as const){fail=mode;const before=closed;await assert.rejects(()=>mode==='read'?readGameRecord('x'):writeGameRecord('x',{}));assert.equal(closed,before+1,`${mode} releases the database`);}
 assert(!values.has('x'),'aborted writes never count as saved');fail='open';await assert.rejects(()=>readGameRecord('x'),/storage unavailable/);fail=null;
 values.set('palm-parcel',{version:99});await assert.rejects(()=>readHunt(),'invalid stored hunt rejected at feature boundary');
}finally{if(descriptor)Object.defineProperty(globalThis,'indexedDB',descriptor);else Reflect.deleteProperty(globalThis,'indexedDB');}
console.log('Shared storage: saved-key compatibility, station isolation, invalid data, commit/abort and failure cleanup passed.');
