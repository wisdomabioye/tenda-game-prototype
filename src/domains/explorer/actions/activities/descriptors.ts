export const activityStations = [{ id: 'seat', label: 'Rest bench', shortcut: 'Bench' }, { id: 'parcel', label: 'Parcel table', shortcut: 'Parcel' }, { id: 'food', label: 'Food stall', shortcut: 'Food' }] as const;
export type StationId = typeof activityStations[number]['id'];
