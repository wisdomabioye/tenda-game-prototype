import assert from 'node:assert/strict';
import {readdir,readFile} from 'node:fs/promises';
import {resolve,relative,dirname} from 'node:path';
import ts from 'typescript';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
async function files(dir){const entries=await readdir(dir,{withFileTypes:true});return (await Promise.all(entries.map(e=>e.isDirectory()?files(resolve(dir,e.name)):[resolve(dir,e.name)]))).flat();}
const allSources=await files(resolve(root,'src'));
const sources=allSources.filter(p=>/\.(ts|tsx)$/.test(p));
const content=allSources.filter(p=>/\.(json|css)$/.test(p));
const tests=(await files(resolve(root,'tests'))).filter(p=>/\.(ts|mjs)$/.test(p));
for(const file of [...sources,...content,...tests]){
 const text=await readFile(file,'utf8'),name=relative(root,file);
 assert(text.trimEnd().split('\n').length<=300,`${name}: split responsibilities before exceeding 300 lines`);
 if(!/\.tsx?$/.test(file))continue;
 const ast=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true);
 const visit=node=>{
  assert(node.kind!==ts.SyntaxKind.AnyKeyword,`${name}: explicit any hides contract errors`);
  if((ts.isImportDeclaration(node)||ts.isExportDeclaration(node))&&node.moduleSpecifier&&ts.isStringLiteral(node.moduleSpecifier)){
   const spec=node.moduleSpecifier.text;
   assert(!spec.startsWith('/'),`${name}: absolute local imports break exported source`);
   if(spec.startsWith('.')){
    const target=relative(root,resolve(dirname(file),spec)).replaceAll('\\','/');
    assert(!target.startsWith('..'),`${name}: dependency escapes the source package`);
    if(name.startsWith('src/shared/')||name.startsWith('src/contracts/'))assert(!target.startsWith('src/domains/')&&!target.startsWith('src/app/')&&!target.startsWith('src/mock/'),`${name}: shared infrastructure must not depend on feature domains`);
    if(name.startsWith('src/'))assert(!target.startsWith('tests/'),`${name}: production cannot import tests`);
   }
   if(/src\/domains\/(world\/navigation|geography\/(projection|spatial|adapters))\//.test(name))assert(!spec.startsWith('react')&&!spec.startsWith('@babylonjs'),`${name}: pure geometry/navigation cannot import rendering`);
  }
  if(name.startsWith('src/')&&ts.isCallExpression(node)&&node.expression.getText(ast)==='Vector3.Project')assert(name==='src/domains/world/presentation/screenProjection.ts',`${name}: use the shared CSS-pixel screen projector`);
  ts.forEachChild(node,visit);
 };
 visit(ast);
}
console.log(`Architecture: ${sources.length} source modules, portable imports, shared-layer boundaries, no explicit any, source/test/content files ≤300 lines. Generated output excluded.`);
