import assert from 'node:assert/strict';
import {createSaveQueue} from '../src/shared/storage/saveQueue';
function deferred(){let resolve!:()=>void;const promise=new Promise<void>(done=>{resolve=done;});return {promise,resolve};}
const queue=createSaveQueue(),events:string[]=[],started=deferred(),release=deferred();
const first=queue.enqueue(async()=>{events.push('first:start');started.resolve();await release.promise;events.push('first:end');});
const second=queue.enqueue(async()=>{events.push('second');});
await started.promise;
assert.deepEqual(events,['first:start'],'later checkpoints must wait for the current write');
let drained=false;const checkpoint=queue.pending.then(()=>{drained=true;});
await Promise.resolve();assert.equal(drained,false,'checkpoint cannot finish while a save is unresolved');
release.resolve();await Promise.all([first,second,checkpoint]);assert.deepEqual(events,['first:start','first:end','second']);assert(drained);
const failed=queue.enqueue(async()=>{throw Error('disk unavailable');});
const failureCheck=assert.rejects(failed,/disk unavailable/);
const recovered=queue.enqueue(async()=>{events.push('recovered');});
await Promise.all([failureCheck,recovered,queue.pending]);assert.equal(events.at(-1),'recovered','a failed save cannot poison later saves');
const finalFailure=queue.enqueue(()=>{throw Error('synchronous writer failure');});await assert.rejects(finalFailure,/synchronous writer failure/);
await assert.doesNotReject(queue.pending,'a failed save is reported to its writer without blocking mission inspection/checkpoint callers');
const independent=createSaveQueue();await independent.enqueue(async()=>{events.push('independent');});assert.equal(events.at(-1),'independent');
console.log('Save queue: ordered writes, checkpoint waiting, rejected-write reporting, synchronous failures, recovery and independent ownership passed.');
