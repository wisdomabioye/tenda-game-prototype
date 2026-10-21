import assert from "node:assert/strict";
import {
  blocksView,
  markerFan,
  shouldGroup,
} from "../src/domains/world/visibility/geometry.ts";
const camera = { x: 0, y: 3, z: -10 },
  character = { x: 0, y: 1.5, z: 0 };
assert(
  blocksView(camera, character, { x: -2, y: 0, z: -6 }, { x: 2, y: 6, z: -4 }),
);
assert(
  !blocksView(camera, character, { x: 3, y: 0, z: -6 }, { x: 6, y: 6, z: -4 }),
  "Side building remains solid",
);
assert(
  !blocksView(camera, character, { x: -2, y: 0, z: 2 }, { x: 2, y: 6, z: 4 }),
  "Building beyond character remains solid",
);
assert(
  !blocksView(
    camera,
    character,
    { x: -2, y: 0, z: -16 },
    { x: 2, y: 6, z: -14 },
  ),
  "Building behind camera remains solid",
);
assert(
  !blocksView(camera, character, { x: -2, y: 5, z: -6 }, { x: 2, y: 8, z: -4 }),
  "Overhead geometry outside sightline stays solid",
);
assert(
  shouldGroup(
    [
      { x: 0, y: 0 },
      { x: 25, y: 0 },
    ],
    false,
  ),
);
assert(
  !shouldGroup(
    [
      { x: 0, y: 0 },
      { x: 60, y: 0 },
    ],
    false,
  ),
);
assert(
  shouldGroup(
    [
      { x: 0, y: 0 },
      { x: 60, y: 0 },
    ],
    true,
  ),
);
assert(!shouldGroup([{ x: 0, y: 0 }], true));
for (const center of [10, 195, 380]) {
  const fan = markerFan(center, 3, 390);
  assert(fan[0] >= 26 && fan.at(-1) <= 364);
  assert(fan[1] - fan[0] >= 48 && fan[2] - fan[1] >= 48);
}
console.log(
  "Character obstruction, non-blockers, marker grouping and mobile fan bounds passed.",
);
