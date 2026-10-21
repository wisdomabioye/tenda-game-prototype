import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=await readFile(new URL('../dist/sw.js',import.meta.url),'utf8');
const listeners=new Map(),stores=new Map();let claimed=false,activated=false,network=0;
const scope='https://example.test/explorer/';
const caches={async open(key){if(!stores.has(key))stores.set(key,new Map());const store=stores.get(key);return {async addAll(urls){for(const url of urls)store.set(url,{cached:url});},async match(key){return store.get(typeof key==='string'?key:key.url);}};},async keys(){return [...stores.keys()];},async delete(key){return stores.delete(key);}};
vm.runInNewContext(source,{URL,caches,self:{registration:{scope},location:{origin:'https://example.test'},clients:{async claim(){claimed=true;}},skipWaiting(){activated=true;},addEventListener(type,fn){listeners.set(type,fn);}},fetch:async()=>{network++;return {network:true};}});
let pending;listeners.get('install')({waitUntil(p){pending=p;}});await pending;assert.equal(activated,false,'new versions must wait for user consent');
const key=(await caches.keys())[0],store=stores.get(key);
const manifest=JSON.parse(await readFile(new URL('../dist/.vite/manifest.json',import.meta.url),'utf8'));for(const record of Object.values(manifest)){assert(store.has(scope+record.file),`offline cache missing chunk ${record.file}`);for(const css of record.css??[])assert(store.has(scope+css),`offline cache missing feature CSS ${css}`);}
assert(!store.has(scope+'.vite/manifest.json'),'build analysis metadata must not be precached');
assert(store.has(scope+'index.html'));assert(store.has(scope+'manifest.webmanifest'));assert([...store.keys()].some(x=>x.endsWith('icon-192.png')));assert([...store.keys()].some(x=>x.endsWith('.js')));
stores.set('tenda-explorer:/explorer/:old',new Map());stores.set('another-app',new Map());listeners.get('activate')({waitUntil(p){pending=p;}});await pending;assert(claimed);assert(!stores.has('tenda-explorer:/explorer/:old'));assert(stores.has('another-app'));
function request(url,mode='cors',method='GET'){let response;listeners.get('fetch')({request:{url,mode,method},respondWith(p){response=p;}});return response;}
assert.equal((await request(scope+'?launch=home','navigate')).cached,scope+'index.html');assert.equal(network,0,'cached shell must work without network');
assert.equal(request('https://example.test/api/missions'),undefined);assert.equal(request(scope+'api/missions'),undefined);assert.equal(request(scope+'app.js','cors','POST'),undefined);assert.equal(request('https://other.test/app.js'),undefined);assert.equal(request('https://example.test/other/','navigate'),undefined);
listeners.get('message')({data:{type:'ACTIVATE_UPDATE'}});assert(activated);
console.log('PWA: nested scope offline shell/assets, explicit update, scoped cleanup and API/POST/cross-origin bypass passed.');
