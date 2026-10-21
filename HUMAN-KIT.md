# Reusable human kit r25

One articulated procedural geometry factory serves players, walking neighbours and seated neighbours. No external models or images.

- `character/appearance.ts`: option vocabulary, defaults and safe parsing of old/new local preferences.
- `character/humanKit.ts`: independent body proportions and deterministic varied city cast.
- `character/createExplorer.ts`: shared articulated human, hair/headwear/clothing/mobility geometry and movement animation.
- `character/CharacterPanel.tsx`: preview, twelve starting looks and independent option selection.
- `world/activity/createCityActivity.ts`: crowd population and connected walking routes.

```ts
const appearance = cityHuman(5);
const neighbour = createExplorer(scene, materialRegistry, appearance, 'standing', 'crowd');
// Player: same factory, default full geometry detail.
```

Supported: man/masculine, woman/feminine or open/neutral silhouette; slim/average/fuller build; short/medium/tall height; six supplied skin tones (validated hex colours in data); short, long, bald, afro or braids; hair colour; none/cap/headscarf; casual/smart/dress/tunic; glasses; walking or wheelchair. All appearance combinations are available independently. Headwear can conceal hair as appropriate. No appearance determines paid-work access, rewards or speed. Crowd speed variation remains separate route ambience.

`setAppearance()` replaces visual children while preserving world root, location, facing and active walker route. Owned geometry disposes on replacement. Height adapts the body while preserving wheelchair proportions; seated configurations remain anchored. Crowd spheres/limbs use lower tessellation than the player/preview.

This is a first stylised human kit, not final character art. Further face, garment, animation and silhouette refinement is pending. Avoid generating random looks every frame; stable residents are easier to recognise and test. Save player appearance locally only, with legacy parsing defaults; no Tenda game-profile storage or demographic data sharing.
