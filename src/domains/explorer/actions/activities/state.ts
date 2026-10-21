export const activityActions=['idle','sitting','picking','carrying','placing','ordering','receiving','food','eating'] as const;
export type ActivityAction=typeof activityActions[number];
export interface ActivityState {
    action: ActivityAction;
    elapsed: number;
    mealRemaining: number;
    meals: number;
}
export const activityDurations = { picking: 1.1, placing: 1.1, ordering: 2.5, receiving: 1.1, eating: 7 } as const;
export const freshActivity = (): ActivityState => ({ action: 'idle', elapsed: 0, mealRemaining: activityDurations.eating, meals: 0 });
export function beginActivity(state: ActivityState, action: ActivityAction): ActivityState { return { ...state, action, elapsed: 0 }; }
/** Same interruptible clock for player and residents. No timers, UI or storage here. */
export function tickActivity(state: ActivityState, dt: number): ActivityState {
    const next = { ...state, elapsed: state.elapsed + Math.max(0, Math.min(dt, .1)) };
    if (next.action === 'eating') {
        next.mealRemaining = Math.max(0, next.mealRemaining - Math.max(0, Math.min(dt, .1)));
        if (!next.mealRemaining)
            return { ...freshActivity(), meals: next.meals + 1 };
        return next;
    }
    const duration = activityDurations[next.action as keyof typeof activityDurations];
    if (duration && next.elapsed >= duration) {
        const action = next.action === 'picking' ? 'carrying' : next.action === 'placing' ? 'idle' : next.action === 'ordering' ? 'receiving' : 'food';
        return beginActivity(next, action);
    }
    return next;
}
export function interruptActivity(state: ActivityState): ActivityState {
    if (state.action === 'eating')
        return beginActivity(state, 'food');
    if (state.action === 'placing')
        return beginActivity(state, 'carrying');
    if (['sitting', 'picking', 'ordering', 'receiving'].includes(state.action))
        return beginActivity(state, 'idle');
    return state;
}
export const hasParcel = (s: ActivityState) => s.action === 'carrying' || s.action === 'placing';
export const hasFood = (s: ActivityState) => s.action === 'food' || s.action === 'eating';
export const isTransferAction=(action:ActivityAction)=>action!=='eating'&&Object.hasOwn(activityDurations,action);
export const isBusy=(s:ActivityState)=>isTransferAction(s.action)||s.action==='eating';
