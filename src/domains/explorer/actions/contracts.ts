import type {ActivityState} from './activities/state';
import type {Solid} from '../../world/navigation/movement';
export type ActorSnapshot = {
    action: ActivityState['action'];
    paused: boolean;
    prompt: string;
    hint: string;
    nearby?: string;
    progress?: number;
    saved?: boolean;
};
export interface PhysicalOptions {
    districtId?: string;
    solids?: () => Solid[];
    storage?: Pick<Storage, 'getItem' | 'setItem'>;
}
