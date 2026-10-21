import {insideRing} from '../../../geography/spatial/polygon';
import {distance, type Point, type Segment} from '../../navigation/routes';

/** Select clear, connected virtual stops without assigning a real shop or task address. */
export function chooseSampleStops(network: Segment[], outlines: Point[][], count: number) {
    const candidates = network.map(([a, b]) => ({
        x: (a.x + b.x) / 2,
        y: (a.y + b.y) / 2,
        z: (a.z + b.z) / 2,
    })).filter(point => !outlines.some(outline => insideRing(point, outline)));
    if (candidates.length < count) throw new Error('Not enough clear sample stops');

    const origin = {x: 0, y: 0, z: 0};
    const spawn = candidates.reduce((best, point) =>
        distance(point, origin) < distance(best, origin) ? point : best);
    const available = candidates.filter(point => distance(point, spawn) > 12);
    const nearby = available.filter(point => distance(point,spawn)<=55);
    const eligible = nearby.length>=count ? nearby : available;
    if (eligible.length < count) throw new Error('Pilot is too small for the sample hub profile');

    const stops = [eligible.reduce((best, point) =>
        distance(point, spawn) < distance(best, spawn) ? point : best)];
    while (stops.length < count) {
        const clearance = (point: Point) => Math.min(...stops.map(stop => distance(point, stop)));
        const next = eligible.reduce((best, point) => clearance(point) > clearance(best) ? point : best);
        if (clearance(next) < .12) throw new Error('Sample stops would overlap');
        stops.push(next);
    }
    return {spawn, stops};
}
