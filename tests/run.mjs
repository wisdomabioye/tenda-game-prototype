import {readdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
// PWA tests intentionally require a fresh browser build; all other regressions are discovered.
const excluded=new Set(['run.mjs','run-assets.mjs','pwa.mjs','build-output.mjs']);
const entries=(await readdir(new URL('.',import.meta.url))).filter(name=>name.endsWith('.mjs')&&!excluded.has(name)).sort();
entries.push('run-assets.mjs');
for(const entry of entries){
 const result=spawnSync(process.execPath,['--experimental-strip-types',fileURLToPath(new URL(entry,import.meta.url))],{stdio:'inherit'});
 if(result.error)throw result.error;
 if(result.status!==0)process.exit(result.status??1);
}
console.log(`All ${entries.length-1} direct regression files and discovered TypeScript suites passed.`);
