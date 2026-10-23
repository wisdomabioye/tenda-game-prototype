import { instantiate, type AssetSpec } from "../../assets/registry";
import type { AssetContext } from "../../assets/core/context";
export function composeAssets(ctx: AssetContext, specs: AssetSpec[]) {
    const ids = new Set<string>();
    for (const spec of specs) {
        if (ids.has(spec.id))
            throw new Error(`Duplicate asset ID: ${spec.id}`);
        ids.add(spec.id);
    }
    // Batch only immutable scenery. Textured signage and activity props stay separate; building identity and fade/picking remain intact.
    const staticKinds=new Set(['urban','house','storeyed','footprint','restaurant','mall','tree','palm','bed','planter','bollard','solar','tank']);
    const batchedContext={...ctx,batchStatic:true};
    const assets: ReturnType<typeof instantiate>[] = [];
    try {
        for (const spec of specs)
            assets.push(instantiate(staticKinds.has(spec.kind)?batchedContext:ctx, spec));
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
