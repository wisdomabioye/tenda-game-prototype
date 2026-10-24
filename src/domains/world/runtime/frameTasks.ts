export interface FrameTask {id:string;interval:number;run:()=>void;}
/** At most one due decorative task per frame. Round-robin fairness; missed intervals never create catch-up bursts. */
export function createFrameTasks(tasks:FrameTask[]){
 if(tasks.some(t=>!Number.isFinite(t.interval)||t.interval<=0))throw new Error('Frame task intervals must be positive');
 let time=0,cursor=0;const due=tasks.map((task,i)=>task.interval*(1+i/Math.max(1,tasks.length)));
 return {tick(dt:number){if(!Number.isFinite(dt)||dt<=0)return null;time+=Math.min(dt,1);
  for(let step=0;step<tasks.length;step++){const index=(cursor+step)%tasks.length;
   if(time+1e-9<due[index])continue;
   due[index]=time+tasks[index].interval;cursor=(index+1)%tasks.length;tasks[index].run();return tasks[index].id;
  }return null;
 }};
}
