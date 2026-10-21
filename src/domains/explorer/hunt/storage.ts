import { parseHunt, type HuntState } from './model';
import { readGameRecord, writeGameRecord } from '../../../shared/storage/gameRecords';
const SAVE_KEY = 'palm-parcel';
/** The hunt owns validation; the shared storage domain owns database lifecycle. */
export async function readHunt() { const record = await readGameRecord(SAVE_KEY); return record == null ? null : parseHunt(record); }
export function writeHunt(state: HuntState) { return writeGameRecord(SAVE_KEY, parseHunt(state)); }
