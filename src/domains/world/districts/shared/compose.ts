import { instantiate, type AssetSpec } from "../../assets/registry";
import type { AssetContext } from "../../assets/core/context";
export function composeAssets(ctx: AssetContext, specs: AssetSpec[]) {
    const ids = new Set<string>();
    for (const spec of specs) {
        if (ids.has(spec.id))
            throw new Error(`Duplicate asset ID: ${spec.id}`);
        ids.add(spec.id);
    }
    const assets: ReturnType<typeof instantiate>[] = [];
    try {
        for (const spec of specs)
            assets.push(instantiate(ctx, spec));
    }
    catch (error) {
        for (const asset of assets)
            asset.dispose();
        throw error;
    }
    return {
        assets,
        occluders: assets.flatMap((a) => a.occluders()),
        dispose: () => {
            for (const asset of assets)
                asset.dispose();
        },
    };
}
