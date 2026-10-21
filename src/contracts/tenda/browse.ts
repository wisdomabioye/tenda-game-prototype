/** Prototype browse-contract snapshot: packages/shared, checked 2026-10-20.
 * Replace this boundary with the workspace package at integration; never use it
 * as a server validator or a promise of assignment/payment eligibility. */
export const categories = ['delivery', 'photo', 'errand', 'service', 'digital'] as const;
export type GigCategory = typeof categories[number];
export const categoryLabels: Record<GigCategory, string> = { delivery: 'Delivery', photo: 'Creative', errand: 'Errand', service: 'Service', digital: 'Digital' };
export type ProofType = 'image' | 'video' | 'document' | 'geotag' | 'text' | 'structured';
export const proofLabels: Record<ProofType, string> = { image: 'Photo', video: 'Video', document: 'Document', geotag: 'Location check-in', text: 'Written answer', structured: 'Structured data' };
export interface ProofParams {
    geotag?: {
        radius_m: number;
    };
    structured?: {
        fields: {
            name: string;
            kind: 'string' | 'number' | 'boolean';
            required: boolean;
        }[];
    };
}
/** Only the browse fields consumed by this client. Nullable wire fields stay nullable. */
export interface GigBrowse {
    escrow_id: string;
    title: string;
    description: string | null;
    category: GigCategory;
    remote: boolean;
    amount_raw: string;
    asset: string;
    chain_id: string;
    proof_requirements: ProofType[];
    proof_params: ProofParams | null;
    requires_approval: boolean;
    country: string | null;
    city: string | null;
    latitude: number | null;
    longitude: number | null;
    cross_border: boolean;
}
