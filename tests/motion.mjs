import assert from "node:assert/strict";
import { interpolate, advanceExpansion } from "../src/shared/motion/easing.ts";
assert.equal(interpolate(15, 135, 0), 15);
assert.equal(interpolate(15, 135, 1), 135);
assert.equal(interpolate(15, 135, 2), 135);
let previous = 15;
for (let frame = 1; frame <= 39; frame++) {
  const next = interpolate(15, 135, frame / 39);
  assert(next >= previous && next <= 135);
  previous = next;
}
const first = interpolate(15, 135, 1 / 39) - 15,
  last = 135 - interpolate(15, 135, 38 / 39),
  middle = interpolate(15, 135, 20 / 39) - interpolate(15, 135, 19 / 39);
assert(first < middle && last < middle, "Camera eases in and out");
let expansion = 0;
expansion = advanceExpansion(expansion, true, 0.06, false);
assert(expansion > 0 && expansion < 1);
const closing = advanceExpansion(expansion, false, 0.03, false);
assert(
  closing > 0 && closing < expansion,
  "Closing remains visible through intermediate frames",
);
assert.equal(advanceExpansion(closing, false, 1, false), 0);
assert.equal(advanceExpansion(0, true, 0.001, true), 1);
assert.equal(advanceExpansion(1, false, 0.001, true), 0);
console.log(
  "Camera easing endpoints, smooth progression, reversible marker expansion and reduced motion passed.",
);
