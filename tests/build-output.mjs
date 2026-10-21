import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
const root=new URL('../dist/',import.meta.url);
const manifest=JSON.parse(await readFile(new URL('.vite/manifest.json',root),'utf8'));
const entry=manifest['index.html'];assert(entry?.isEntry,'default build must produce the hosted entry');
const graph=JSON.parse(await readFile(new URL('.vite/chunks.json',root),'utf8'));
function closure(file,seen=new Set()){
 if(seen.has(file))return seen;seen.add(file);
 assert(graph[file],`missing build dependency: ${file}`);
 for(const dependency of graph[file].imports)closure(dependency,seen);
 return seen;
}
const initial=closure(entry.file);
const modules=files=>new Set([...files].flatMap(file=>graph[file].modules));
const initialModules=modules(initial);
const owner=module=>{const files=Object.keys(graph).filter(file=>graph[file].modules.includes(module));assert.equal(files.length,1,`${module} must have exactly one owner`);return files[0];};
const dynamicTargets=new Set(Object.values(graph).flatMap(chunk=>chunk.dynamicImports));
const optional=[
 'src/domains/atlas/AtlasDialog.tsx',
 'src/domains/explorer/character/CharacterPanel.tsx',
 'src/domains/explorer/character/CharacterPreview.tsx',
 'src/domains/explorer/challenge/ChallengePanel.tsx',
 'src/domains/places/importing/ImportPanel.tsx',
 'src/domains/places/authoring/AuthorPanel.tsx',
 'src/domains/world/performance/PerformancePanel.tsx',
 'src/domains/world/runtime/Street.tsx',
];
for(const key of optional){assert(dynamicTargets.has(owner(key)),`${key} needs an actual async build boundary`);assert(!initialModules.has(key),`${key} must not be in the initial static graph`);}
const districts=['src/domains/world/districts/configured/city.ts','src/domains/world/districts/baseline/resolve.ts','src/domains/world/districts/lagos-waterfront/resolve.ts','src/domains/world/districts/lagos-victoria-island/definition.ts'];
for(const key of districts)assert(dynamicTargets.has(owner(key)),`${key} must remain selectable on demand`);
for(const key of districts){const imports=modules(closure(owner(key)));for(const other of districts){if(other===key||key.endsWith('/configured/city.ts')&&other.endsWith('/lagos-victoria-island/definition.ts'))continue;assert(!imports.has(other),`${key} eagerly pulls unrelated district ${other}`);}}
assert(!modules(closure(owner('src/domains/world/runtime/Street.tsx'))).has('src/domains/explorer/character/CharacterPreview.tsx'),'world must not pull the optional preview');
assert(![...initialModules].some(id=>id.includes('/@babylonjs/')),'Babylon must stay outside the shell');
let jsBytes=0,gzipBytes=0,cssBytes=0;
const styles=new Set();
for(const file of initial){const record=Object.values(manifest).find(record=>record.file===file);assert(record);assert.match(record.file,/assets\/.+-[\w-]{8,}\.js$/,'entry/runtime JavaScript must have content hashes');const body=await readFile(new URL(record.file,root));jsBytes+=body.length;gzipBytes+=gzipSync(body).length;for(const css of record.css??[])styles.add(css);}
for(const file of styles){const css=await readFile(new URL(file,root),'utf8');cssBytes+=Buffer.byteLength(css);assert(!css.includes('data:font'),'do not embed large fonts in render-blocking CSS');for(const match of css.matchAll(/url\((?:["']?)([^)"']+\.ttf)(?:["']?)\)/g)){await stat(new URL(match[1],new URL(file,root)));}}
// Headroom above the measured 265KB JS / 32KB CSS shell. These are payload budgets,
// not a promise that the city can run without its separately loaded renderer.
assert(jsBytes<300000,`initial shell JavaScript grew to ${jsBytes} bytes`);
assert(cssBytes<50000,`initial stylesheet grew to ${cssBytes} bytes`);
const challengeCss=manifest['src/domains/explorer/challenge/ChallengePanel.tsx'].css??[];
assert(challengeCss.length>0,'challenge styles must remain with the optional feature');
assert(challengeCss.every(file=>!styles.has(file)),'optional challenge CSS must not enter the initial stylesheet graph');
const html=await readFile(new URL('index.html',root),'utf8');assert(html.includes('manifest.webmanifest'));
await stat(new URL('sw.js',root));
console.log(`Build: lazy panels/districts, isolated renderer, hashed chunks, external fonts and CSS boundaries passed. Initial shell: ${jsBytes} bytes JS (${gzipBytes} gzip), ${cssBytes} bytes CSS.`);
