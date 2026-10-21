export type Challenge={version:1;stage:0|1|2|3;turns:number[];hint:boolean};
export const initialChallenge:Challenge={version:1,stage:0,turns:[1,1,2,1,1,2],hint:false};
// N/E/S/W ports. Six tiles form a continuous folded route from left-top to left-bottom.
const pieces=[[1,3],[1,3],[2,3],[1,3],[1,3],[0,3]];
export function ports(index:number,turn:number){return pieces[index].map(p=>(p+turn)%4);}
export function connected(turns:number[]){let index=0,entry=3;const seen=new Set<number>();while(!seen.has(index)){const p=ports(index,turns[index]);if(!p.includes(entry))return {lit:seen,solved:false};seen.add(index);const exit=p.find(x=>x!==entry)!;if(index===3&&exit===3)return {lit:seen,solved:seen.size===6};const row=Math.floor(index/3),col=index%3,nr=row+[-1,0,1,0][exit],nc=col+[0,1,0,-1][exit];if(nr<0||nr>1||nc<0||nc>2)return {lit:seen,solved:false};index=nr*3+nc;entry=(exit+2)%4;}return {lit:seen,solved:false};}
export function parseChallenge(value:unknown):Challenge{const x=value as Challenge;if(!x||x.version!==1||![0,1,2,3].includes(x.stage)||!Array.isArray(x.turns)||x.turns.length!==6||!x.turns.every(t=>Number.isInteger(t)&&t>=0&&t<4)||typeof x.hint!=='boolean'||x.stage>=2&&!connected(x.turns).solved)throw new Error('Incompatible challenge save.');return {version:1,stage:x.stage,turns:[...x.turns],hint:x.hint};}
export function rotateTile(state:Challenge,index:number):Challenge{if(state.stage!==1||!Number.isInteger(index)||index<0||index>5)return state;const turns=state.turns.map((t,i)=>i===index?(t+1)%4:t);return {...state,turns,stage:connected(turns).solved?2:1};}
export function deliver(state:Challenge,recipient:string):Challenge{return state.stage===2&&recipient==='leaf-books'?{...state,stage:3}:state;}
export function repairSaveKey(id:string){return id==='trial'?'courtyard-directory-v1':`repair-directory:${id}:v1`;}
export function initialRepairState(id:string):Challenge{if(id==='trial')return {...initialChallenge,turns:[...initialChallenge.turns]};let seed=0;for(const c of id)seed+=c.charCodeAt(0);return {...initialChallenge,turns:initialChallenge.turns.map((t,i)=>(t+seed+i)%4)};}
