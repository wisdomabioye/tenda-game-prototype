import { streets } from "../baseline/network.ts";
import type { Segment, Point } from "../../navigation/routes.ts";
const p = (x: number, y: number, z: number): Point => ({ x, y, z });
/** Lagos-only circuit; coordinates are illustrative game metres. */
export const lagosStreets: Segment[] = [
    ...streets,
    [p(-31, 0, -26), p(-31, 0, 24)],
    [p(-31, 0, -26), p(29, 0, -26)],
    [p(29, 0, -26), p(29, 0, 24)],
    [p(-31, 0, 24), p(29, 0, 24)],
    [p(-31, 0, 0), p(-28, 0, 0)],
    [p(-31, 0, 7), p(0, 0, 7)],
    [p(-31, 0, -20), p(-48, 0, -20)],
];
