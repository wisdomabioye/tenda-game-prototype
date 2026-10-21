import assert from 'node:assert/strict';
import {findMarkerPosition} from '../src/shared/ui/markerLayout.ts';
const boxes=[{x:80,y:180,width:110,height:60}];
const fit=findMarkerPosition(130,210,390,844,boxes,120,54);assert(fit);
assert(!boxes.some(b=>fit.x+60>b.x&&fit.x-60<b.x+b.width&&fit.y+27>b.y&&fit.y-27<b.y+b.height),'wide clusters must clear occupied rectangles');
assert(fit.x>=63&&fit.x<=327,'wide markers must stay inside horizontal bounds');
assert.equal(findMarkerPosition(100,100,200,300,[{x:0,y:0,width:200,height:300}],100,50),null,'hide markers when no safe slot exists');
console.log('Marker spacing: actual-size clearance, viewport bounds and crowded fallback passed.');
