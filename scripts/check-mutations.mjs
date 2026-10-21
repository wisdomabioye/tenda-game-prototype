import {build} from 'esbuild';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {openSync,closeSync,readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
const cases=[
 ['junction splitting','src/domains/world/navigation/authoredNetwork.ts','tests/authored-navigation.test.ts','const nodes: Point[] = [];','return segments; const nodes: Point[] = [];'],
 ['shortest route relaxation','src/domains/world/navigation/shortestPath.ts','tests/authored-navigation.test.ts','costs[at] + e.cost < costs[e.to]','false'],
 ['furniture collision','src/domains/world/navigation/movement.ts','tests/travel-fixes.test.ts','return !solids.some','return true || !solids.some'],
 ['active activity pause','src/domains/explorer/actions/createPhysicalActions.ts','tests/daily-life.test.ts','paused || document.hidden || actorInputBlocked()','document.hidden || actorInputBlocked()'],
 ['aborted checkpoint','src/shared/storage/gameRecords.ts','tests/game-storage.test.ts','tx.onabort = () => reject','tx.onabort = () => resolve'],
 ['marker overlap','src/shared/ui/markerLayout.ts','tests/marker-spacing.mjs','if(!occupied.some','if(true || !occupied.some'],
 ['screen resolution conversion','src/domains/world/presentation/screenProjection.ts','tests/overlay-presentation.test.ts','p.x/renderWidth*rect.width','p.x'],
 ['save serialization','src/shared/storage/saveQueue.ts','tests/save-queue.test.ts','pending=pending.catch(()=>{}).then(write);','pending=Promise.resolve().then(write);'],
 ['shortest heading','src/shared/motion/angles.ts','tests/preference-motion.test.ts','return Math.atan2(Math.sin(to-from),Math.cos(to-from));','return to-from;'],
 ['reverse cleanup order','src/domains/world/runtime/disposal.ts','tests/assets.test.ts','callbacks.reverse()','callbacks'],
];
const directory=await mkdtemp(join(tmpdir(),'tenda-mutation-'));
async function run(test,module,mutation,index){
 const outfile=join(directory,`${index}.mjs`);
 await build({entryPoints:[resolve(root,test)],bundle:true,platform:'node',format:'esm',outfile,logLevel:'silent',plugins:mutation?[{name:'isolated-mutant',setup(api){api.onLoad({filter:/\.(ts|tsx)$/},async args=>{if(args.path!==resolve(root,module))return;const text=await readFile(args.path,'utf8');if(!text.includes(mutation[0]))throw Error('Mutation anchor missing: '+module);return {contents:text.replace(mutation[0],mutation[1]),loader:'ts'};});}}]:[]});
 const logfile=outfile+'.log',fd=openSync(logfile,'w');
 try{const result=spawnSync(process.execPath,[outfile],{stdio:['ignore',fd,fd],timeout:60000});return {...result,stderr:readFileSync(logfile,'utf8')};}finally{closeSync(fd);}
}
try{
 for(const [index,[label,module,test,before,after]] of cases.entries()){
  const baseline=await run(test,null,null,`${index}-baseline`);
  if(baseline.error||baseline.status!==0)throw Error(`Baseline failed for ${label}: ${baseline.error??baseline.stderr}`);
  const mutant=await run(test,module,[before,after],`${index}-mutant`);
  // A compile error, timeout, crash or missing import is not a killed behavioral mutation.
  if(mutant.error||mutant.status===0||!/AssertionError/.test(mutant.stderr))throw Error(`Mutation survived or lacked assertion evidence (${label}): ${mutant.error??mutant.stderr}`);
  console.log(`Killed: ${label} (behavioral assertion failed; baseline passed).`);
 }
 console.log(`${cases.length}/${cases.length} targeted behavior mutations detected. This is not whole-app mutation coverage.`);
}finally{await rm(directory,{recursive:true,force:true});}
