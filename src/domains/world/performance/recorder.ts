import type {PerformanceReport} from './monitor';
export interface BenchmarkSample extends PerformanceReport {elapsedMs:number;}
/** App-owned recorder: closing diagnostics never stops it. No scene references are retained in samples. */
export function createBenchmarkRecorder(now:()=>number=()=>performance.now()){
 let samples:BenchmarkSample[]=[],recording=false,start=0;
 return {start(){samples=[];recording=true;start=now();},stop(){recording=false;},
  tick(report:PerformanceReport|undefined,visible=true){if(!recording||!visible||!report)return;
   samples=[...samples,{...report,chunks:[...report.chunks],elapsedMs:now()-start}];if(samples.length>=30)recording=false;
  },get snapshot(){return {recording,samples:[...samples]};}};
}
