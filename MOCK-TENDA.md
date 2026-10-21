# Local mock Tenda provider

Files: src/mock/tenda/config.json, fixtures.ts, catalogue.ts, stream.ts, useMockTenda.ts. All code is local: no network, credentials or backend.

- Initial catalogue: 56 sample missions using the existing presentation contract.
- Delivery: alternating remote / Lagos physical pools, random template selection and random bounded timeout. Explicit Maker place links are retained where the selected fixture has one. Other coordinates remain represented by clearly labelled virtual category hubs, not invented actual-address mappings.
- Limits: 12 new arrivals, one controlled timer, hidden-page pause, cancellation guards, no alert for initial snapshot, session-unique IDs.
- Runtime controls: Alerts panel timing, pause/start, manual injection, watchlist and quiet hours. Watch preferences are local.
- Mock lifecycle: available → applied (when required) → assigned → in-review → approved. Operator-labelled actions simulate poster selection/approval; these are not user authority in a real integration. A sample evidence note gates simulated submission, without uploading anything.
- Dynamic renderer update: setMissions replaces marker UI while preserving scene, character and route. No live API polling, WebSocket, server-sent events or push subscription is claimed.

Future integration replaces this provider behind the presentation boundary. It must then handle authoritative freshness, eligibility, errors, withdrawal, evidence and review semantics. Game hunt persistence remains separate and client-only.
