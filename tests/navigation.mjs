import assert from "node:assert/strict";
import {
  walkingRoute as calculateRoute,
  distance,
  snapToStreet as snap,
} from "../src/domains/world/navigation/routes.ts";
import { venues } from "../src/domains/world/districts/baseline/venues.ts";
import { streets } from "../src/domains/world/districts/baseline/network.ts";
const walkingRoute = (from, to, network = streets) =>
  calculateRoute(from, to, network);
const snapToStreet = (point, network = streets) => snap(point, network);
const endpoint = (v) => ({ x: v.x, y: v.h, z: v.z - 4 });
const length = (start, path) =>
  path.reduce((sum, p, i) => sum + distance(i ? path[i - 1] : start, p), 0);
for (const v of venues) {
  const p = endpoint(v);
  assert.deepEqual(
    walkingRoute(p, p),
    [],
    "Current venue should not trigger a round trip",
  );
  for (const other of venues) {
    const q = endpoint(other),
      path = walkingRoute(p, q);
    if (v !== other) {
      assert(distance(path.at(-1), q) < 0.001);
      assert(
        length(p, path) <=
          Math.abs(p.z) +
            Math.abs(p.x) +
            Math.abs(q.x) +
            Math.abs(q.z) +
            p.y +
            q.y +
            0.001,
      );
    }
  }
}
const delivery = endpoint(venues[0]),
  errand = endpoint(venues[2]);
const nearby = walkingRoute(delivery, errand);
assert(
  nearby.every((p) => p.x === -20),
  "Venues on the same street should not go through the centre",
);
assert.equal(length(delivery, nearby), 28);
const halfway = { x: -20, y: 0, z: -7 },
  redirect = walkingRoute(halfway, errand);
assert.equal(
  length(halfway, redirect),
  19,
  "Redirect starts at actual mid-walk position",
);
const elevated = { x: 18, y: 2, z: -11 };
assert.equal(
  walkingRoute(elevated, endpoint(venues[1])).length,
  1,
  "Continue directly up the same ramp",
);
assert(
  distance(snapToStreet({ x: 2, y: 0, z: 9 }), { x: 0, y: 0, z: 9 }) < 0.001,
);
for (const from of venues)
  for (const to of venues) {
    let prev = endpoint(from);
    for (const next of walkingRoute(prev, endpoint(to))) {
      for (const t of [0.25, 0.5, 0.75]) {
        const sample = {
          x: prev.x + (next.x - prev.x) * t,
          y: prev.y + (next.y - prev.y) * t,
          z: prev.z + (next.z - prev.z) * t,
        };
        assert(
          distance(sample, snapToStreet(sample)) < 0.001,
          "Route stays on a connected path, including elevation",
        );
      }
      prev = next;
    }
  }
console.log(
  "Same-destination, nearby, mid-walk redirect, ramp and all venue route checks passed.",
);
const { lagosStreets } = await import(
  "../src/domains/world/districts/lagos-waterfront/network.ts"
);
const circuitStops = [
  { x: -48, y: 0, z: -20 },
  { x: -31, y: 0, z: 7 },
  { x: 29, y: 0, z: 24 },
  { x: 8, y: 0, z: -26 },
];
for (const destination of circuitStops) {
  const route = walkingRoute({ x: 0, y: 0, z: 0 }, destination, lagosStreets);
  assert(
    distance(route.at(-1), destination) < 0.001,
    "New landmarks connect to existing streets",
  );
  let previous = { x: 0, y: 0, z: 0 };
  for (const next of route) {
    const mid = {
      x: (previous.x + next.x) / 2,
      y: (previous.y + next.y) / 2,
      z: (previous.z + next.z) / 2,
    };
    assert(distance(mid, snapToStreet(mid, lagosStreets)) < 0.001);
    previous = next;
  }
}
const crossing = [
  [
    { x: -5, y: 0, z: 0 },
    { x: 5, y: 0, z: 0 },
  ],
  [
    { x: 0, y: 0, z: -5 },
    { x: 0, y: 0, z: 5 },
  ],
];
assert.equal(
  length(
    { x: -5, y: 0, z: 0 },
    walkingRoute({ x: -5, y: 0, z: 0 }, { x: 0, y: 0, z: 5 }, crossing),
  ),
  10,
  "Interior crossing becomes a real junction",
);
const overhead = [
  [
    { x: -5, y: 0, z: 0 },
    { x: 5, y: 0, z: 0 },
  ],
  [
    { x: 0, y: 4, z: -5 },
    { x: 0, y: 4, z: 5 },
  ],
];
assert.deepEqual(
  walkingRoute({ x: -5, y: 0, z: 0 }, { x: 0, y: 4, z: 5 }, overhead),
  [],
  "Overpass does not create an impossible ground-level junction",
);
console.log(
  "Lagos loop/pier connectivity, at-grade junctions and overpass separation passed.",
);
