import { freshActivity, activityActions,activityDurations,type ActivityState } from '../activities/state';
import type { Point } from '../../../world/navigation/routes';
export interface ActivitySave {
    version: 1;
    activity: ActivityState;
    position: Point;
    rotation: number;
    pending?: ActivityState | null;
}
export function parseActivitySave(raw: unknown): ActivitySave | null {
    if (!raw || typeof raw !== 'object')
        return null;
    const s = raw as ActivitySave, a = s.activity, p = s.position;
    if (s.version !== 1 || !a || !p || !activityActions.includes(a.action) || ![a.elapsed, a.mealRemaining, a.meals, p.x, p.y, p.z, s.rotation].every(Number.isFinite) || a.elapsed < 0 || a.elapsed > 86400 || a.mealRemaining < 0 || a.mealRemaining > activityDurations.eating || !Number.isInteger(a.meals) || a.meals < 0 || Math.max(Math.abs(p.x), Math.abs(p.y), Math.abs(p.z)) > 100000)
        return null;
    if (s.pending) {
        const pending = parseActivitySave({ ...s, pending: null, activity: s.pending });
        if (!pending)
            return null;
    }
    return { version: 1, pending: s.pending ?? null, activity: { ...freshActivity(), ...a }, position: { x: p.x, y: p.y, z: p.z }, rotation: s.rotation };
}
export function activityStorage(districtId: string, storage?: Pick<Storage, 'getItem' | 'setItem'>) {
    const key = `tenda/physical/v2/${districtId}`;
    let last = '';
    return { load: () => { try {
            return parseActivitySave(JSON.parse(storage?.getItem(key) ?? 'null'));
        }
        catch {
            return null;
        } }, save: (value: ActivitySave) => { try {
            const json = JSON.stringify(value);
            if (json === last)
                return Boolean(storage);
            storage?.setItem(key, json);
            if (storage)
                last = json;
            return Boolean(storage);
        }
        catch {
            return false;
        } } };
}
