# Production build and code-splitting — 21 October 2026

## One default build

`pnpm build` (or `npm run build`) runs strict production TypeScript and creates the browser/PWA build in `dist/`. Vercel configuration uses the same build script and output. `build:browser` remains a compatibility alias to the default build; it no longer creates a separate output directory.

`pnpm build:standalone` is the optional file-preview path. It creates an unsplit intermediate build in `dist-standalone/` and embeds it into the existing portable HTML preview. It does not overwrite the hosted `dist/` output. Only a source ZIP is delivered by `pnpm run package`.

## Runtime boundaries

- Fifteen optional panels are lazy imports: atlas, character selection, mission/place details, trail, guide, hunt/repair, alerts, sound, performance and author/import tools. Persistent game hooks remain mounted in the application, so loading presentation does not reset state.
- The world renderer and optional character preview retain separate lazy boundaries. Shared renderer dependencies remain shared; they are not duplicated per feature.
- The loader imports only its selected district factory: configured Lagos city, Victoria Island, illustrative waterfront or baseline/remote. The configured city legitimately shares the Victoria Island geographic base. The synchronous resolver remains for compatibility/tests, but runtime loading avoids its combined imports.
- React/React DOM form one stable runtime chunk. Other shared dependencies use Rollup's graph rather than artificial per-file vendor splitting that can introduce cycles or excessive requests.
- JavaScript and CSS use content-hashed names. Optional challenge CSS stays with that panel. Fonts are separate public assets with swap rendering instead of large embedded data in the main stylesheet.
- A cancellable loading card and feature error boundary keep the city mounted while optional panels load. The loading fallback restores focus when the real dialog appears.

## Offline behavior

Service-worker registration waits for the first scene's readiness callback, avoiding immediate competition between bulk offline preparation and initial world downloads. Full app precaching is preserved, including lazy panels, city modules, shaders, CSS and fonts. Thus the total offline preparation still downloads the complete app. Offline readiness is not claimed until installation finishes.

Build manifests/graph reports under `.vite/` are analysis outputs, not precached runtime assets. Existing scope isolation, explicit updates and API/private-request bypass remain unchanged.

## Measured build output

Compared with a captured pre-change **split browser build**, using the same source/dependencies before this optimization:

| Initial shell resource | Before | After |
| --- | ---: | ---: |
| JavaScript, uncompressed | 330,143 bytes | 265,445 bytes |
| JavaScript, gzip (level 6) | 108,982 bytes | 86,668 bytes |
| Main CSS, uncompressed | 419,174 bytes | 32,102 bytes |

These are initial static-graph payloads, not total city downloads or measured phone startup times. Fonts now transfer separately; Babylon and the selected district are still required to play. The core renderer shared chunk remains large and Vite still reports its size warning. Its threshold was not raised to hide it.

## Regression checks

After `pnpm build`, run `pnpm run test:build` and `pnpm run test:pwa`. The build test follows actual generated module ownership and static imports, rather than trusting a lazy facade's name. It rejects optional panel/renderer code in the shell, unrelated district imports, missing async boundaries, un-hashed chunks, embedded fonts and missing optional CSS. Initial-shell budgets are 300 KB JavaScript and 50 KB CSS, with headroom above the measured build. These are artifact budgets, not frame-rate guarantees.

PWA tests assert that every generated chunk and feature stylesheet remains available in the offline cache. Device benchmarks and whole-app coverage remain separate, unmeasured gates.
