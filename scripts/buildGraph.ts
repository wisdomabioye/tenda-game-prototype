import {relative} from 'node:path';
import type {Plugin,ResolvedConfig} from 'vite';
/** Build-only evidence: track actual module ownership, not just lazy facade names. */
export function buildGraph():Plugin{
 let config:ResolvedConfig;
 return {name:'tenda-build-graph',apply:'build',configResolved(value){config=value;},generateBundle(_options,bundle){
  const chunks=Object.fromEntries(Object.values(bundle).filter(item=>item.type==='chunk').map(chunk=>[chunk.fileName,{
   isEntry:chunk.isEntry,imports:chunk.imports,dynamicImports:chunk.dynamicImports,
   modules:Object.keys(chunk.modules).map(id=>relative(config.root,id).replaceAll('\\','/')),
  }]));
  this.emitFile({type:'asset',fileName:'.vite/chunks.json',source:JSON.stringify(chunks,null,2)});
 }};
}
