import {SceneInstrumentation} from '@babylonjs/core/Instrumentation/sceneInstrumentation';
import type {Scene} from '@babylonjs/core/scene';
/** CPU submission timings, not GPU timings. Counters include shadow render-target work. */
export function createSceneMetrics(scene:Scene){
 const stats=new SceneInstrumentation(scene);
 stats.captureActiveMeshesEvaluationTime=true;stats.captureRenderTargetsRenderTime=true;stats.captureRenderTime=true;
 return {read:()=>({drawCalls:stats.drawCallsCounter.current,meshEvaluationMs:stats.activeMeshesEvaluationTimeCounter.current,renderTargetsMs:stats.renderTargetsRenderTimeCounter.current,renderSubmissionMs:stats.renderTimeCounter.current}),dispose:()=>stats.dispose()};
}
