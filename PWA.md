# Tenda Explorer PWA baseline

Deploy the contents of `dist/` to a static HTTPS host, at the origin root or a dedicated subdirectory. Keep the directory structure. Local testing: `python3 -m http.server 4336 --directory dist --bind 127.0.0.1`, then open http://localhost:4336/. No game backend is added. The standalone `Tenda-Explorer-r26.html` is a portable preview and deliberately does not register a service worker.

## Build and verify

- `npm run build` creates the deployable split build and a generated service worker.
- `npm run test:pwa` tests the generated worker after building: offline shell, nested scope, asset allowlist, explicit updates, cache ownership, API/POST/cross-origin bypass.
- `npm run build:standalone` refreshes the file preview.

The web manifest includes a scoped identity/start URL, standalone display, theme and normal/maskable PNG icons. The original icons are generated geometric artwork; no remote assets are needed. Font references work within subdirectory deployments. Tools shows install guidance, a native install button when the browser offers it, offline setup status and an explicit update/reload action. Installation itself was not performed by the agent. On iOS/iPadOS use Safari's Share → Add to Home Screen. Availability and exact browser UI vary.

Service-worker registration is restricted to hosted manifest pages and waits for the first world to become ready, so bulk offline preparation does not begin during the initial world load. The build plugin hashes the complete app asset set and precaches static files needed by lazy scenes. The old version stays active while a new one waits; only the explicit update action requests activation/reload. On activation it removes only older caches belonging to this application scope. Install/update caching fails atomically if an asset is unavailable. Keep deploys atomic and serve sw.js/index.html with revalidation/no-cache; serve hashed chunks immutably. After updates, reload other open app tabs before continuing there.

API calls, arbitrary URLs, POST requests and cross-origin resources are never handled by the worker. Navigation fallback applies only to the app's root/index; scene routes remain URL hashes. Offline assets are available only after a successful online preparation and may be evicted by the browser. Caches are not game saves.

Hunts remain local IndexedDB saves. The file preview, localhost, production HTTPS host and different browsers can have different storage origins/containers. Use the hunt journal's JSON backup/restore to transfer progress manually. No automatic migration, Tenda game-save endpoints or cloud sync is introduced. Nothing here makes wallet/key storage production-ready.

PWA installation alone does not deliver closed-app mission alerts. OS push/subscriptions, permissions and existing-Tenda-server dispatch remain separate deferred integration work. The mission stream remains fictional and local.

Actual Android/iOS install, standalone launch, keyboard, safe areas, storage eviction and update UX still require real-device checks. See MOBILE-VALIDATION.md.

Browser requirements reference: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable
