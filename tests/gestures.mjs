import { hardwareScale } from "../src/domains/world/runtime/render-quality.ts";
import {
  panDelta,
  lookDelta,
  twistDelta,
} from "../src/domains/world/input/gestures.ts";
import assert from "node:assert/strict";
import { NullEngine } from "../node_modules/@babylonjs/core/Engines/nullEngine.js";
import { Scene } from "../node_modules/@babylonjs/core/scene.js";
import { ArcRotateCamera } from "../node_modules/@babylonjs/core/Cameras/arcRotateCamera.js";
import {
  Vector3,
  Matrix,
} from "../node_modules/@babylonjs/core/Maths/math.vector.js";
const engine = new NullEngine({ renderWidth: 390, renderHeight: 844 });
const scene = new Scene(engine);
const camera = new ArcRotateCamera(
  "test",
  -0.95,
  1.02,
  88,
  Vector3.Zero(),
  scene,
);
function project() {
  return Vector3.Project(
    Vector3.Zero(),
    Matrix.Identity(),
    camera.getViewMatrix(true).multiply(camera.getProjectionMatrix(true)),
    { x: 0, y: 0, width: 390, height: 844 },
  );
}
for (const angle of [-0.95, 0, Math.PI / 2, Math.PI]) {
  camera.alpha = angle;
  camera.setTarget(Vector3.Zero(), false, true, true);
  const start = project();
  camera.target.addInPlace(panDelta(angle, 2, 0, 1));
  const horizontal = project();
  camera.setTarget(Vector3.Zero(), false, true, true);
  camera.target.addInPlace(panDelta(angle, 0, 2, 1));
  const vertical = project();
  console.log({
    angle,
    rightDrag: horizontal.x - start.x,
    downDrag: vertical.y - start.y,
  });
  if (horizontal.x <= start.x || vertical.y <= start.y)
    throw Error("Pan does not follow finger");
}
camera.setTarget(Vector3.Zero(), false, true, true);
camera.alpha = -0.95;
camera.beta = 1.42;
camera.radius = 15;
const point = new Vector3(
  -Math.cos(camera.alpha) * 10,
  0,
  -Math.sin(camera.alpha) * 10,
);
const screen = () =>
  Vector3.Project(
    point,
    Matrix.Identity(),
    camera.getViewMatrix(true).multiply(camera.getProjectionMatrix(true)),
    { x: 0, y: 0, width: 390, height: 844 },
  );
const before = screen();
camera.alpha += lookDelta(10, 0).alpha;
assert(screen().x > before.x, "Look drag right should move the scene right");
camera.alpha = -0.95;
camera.beta += lookDelta(0, 10).beta;
assert(screen().y > before.y, "Look drag down should move the scene down");
camera.beta = 1.42;
camera.alpha = -0.95;
camera.alpha += twistDelta(0, 0.1);
assert(
  screen().x > before.x,
  "Clockwise twist should turn the scene clockwise",
);
assert(
  Math.abs(twistDelta(Math.PI - 0.01, -Math.PI + 0.01) - 0.02) < 1e-8,
  "Twist wraps without jumping",
);
console.log("Pan, look and twist direction checks passed.");
engine.dispose();

for (const [ratio, expected] of [
  [1, 1],
  [1.5, 2 / 3],
  [2, 0.5],
  [3, 0.5],
  [0, 1],
  [NaN, 1],
])
  assert.equal(hardwareScale(ratio), expected);
assert.equal(
  390 / hardwareScale(3),
  780,
  "High-density phone should render above CSS width, not below it",
);
console.log("Mobile canvas density checks passed.");
