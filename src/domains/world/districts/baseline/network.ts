import { venues } from "./venues.ts";
import type { Segment, Point } from "../../navigation/routes.ts";
const p = (x: number, y: number, z: number): Point => ({ x, y, z });
export const streets: Segment[] = [
    [p(-28, 0, 0), p(28, 0, 0)],
    [p(0, 0, -30), p(0, 0, 36)],
    ...venues
        .filter((v) => v.x !== 0)
        .map((v) => [p(v.x, 0, 0), p(v.x, v.h, v.z - 4)] as const),
];
