export {proofLabels as labels,categoryLabels,categories} from '../../../contracts/tenda/browse';
export function reward(raw: string) {
    const cents = BigInt(raw) / 10000n;
    return `${cents / 100n}.${String(cents % 100n).padStart(2, "0")}`;
}
