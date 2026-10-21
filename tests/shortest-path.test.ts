import assert from 'node:assert/strict';
import {shortestPath,type Edge} from '../src/domains/world/navigation/shortestPath';
import {distance,type Point} from '../src/domains/world/navigation/routes';
// Independent oracle: enumerate every simple path on small graphs, rather than
// reproducing the production shortest-path relaxation algorithm.
function exhaustive(edges:Edge[][],at:number,target:number,seen=new Set<number>()):number{
 if(at===target)return 0;
 const visited=new Set([...seen,at]);
 return Math.min(Infinity,...edges[at].filter(e=>!visited.has(e.to)).map(e=>e.cost+exhaustive(edges,e.to,target,visited)));
}
let seed=8731;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
for(let sample=0;sample<24;sample++){
 const nodes:Point[]=Array.from({length:6},(_,i)=>({x:i*3,y:0,z:Math.floor(random()*20)}));
 const edges:Edge[][]=nodes.map(()=>[]);
 for(let a=0;a<nodes.length;a++)for(let b=a+1;b<nodes.length;b++)if(random()<.36){const cost=distance(nodes[a],nodes[b]);edges[a].push({to:b,cost});edges[b].push({to:a,cost});}
 for(let from=0;from<6;from++)for(let to=0;to<6;to++){
  const best=exhaustive(edges,from,to),route=shortestPath(nodes,edges,from,to);
  if(!Number.isFinite(best)||from===to){assert.deepEqual(route,[]);continue;}
  assert.equal(route.at(-1),nodes[to]);let previous=from,total=0;
  for(const point of route){const index=nodes.indexOf(point),edge=edges[previous].find(e=>e.to===index);assert(edge,'every route step is a real graph edge');total+=edge.cost;previous=index;}
  assert(Math.abs(total-best)<1e-8,`sample ${sample}: ${from} → ${to} must be globally shortest`);
 }
}
console.log('Shortest routes: 864 source/destination cases match exhaustive enumeration, including disconnected graphs.');
