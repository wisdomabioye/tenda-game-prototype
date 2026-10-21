import { sourceRoute } from './sourceGraph.ts';
import { prepareStreetNetwork } from './authoredNetwork.ts';
import type { Point, Segment } from './geometry.ts';
export * from './geometry.ts';
/** Shared topology: route choice and keyboard steering agree about every junction. */
export function walkingRoute(current: Point, destination: Point, segments: Segment[]): Point[] {
    return segments.length ? sourceRoute(current, destination, prepareStreetNetwork(segments)) : [];
}
