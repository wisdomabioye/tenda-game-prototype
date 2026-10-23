# Test r26 on a phone

Use the actual phone and its normal browser/device pixel ratio. A desktop viewport resized to phone dimensions does not establish phone performance.

## Get the build onto the device

Unzip the source, run `npm ci`, then `npm run build`. Publish the contents of `dist/` to a static HTTPS host. Open that HTTPS URL on the phone. The standalone HTML is a preview, not the installable PWA package.

Record phone model, OS/browser version, portrait/landscape, quality setting and power-saving mode. Test an ordinary browser tab and, separately, the installed PWA.

## Repeatable gameplay checks

1. Choose Lagos → Connected city. Walk the same route through Maker Quarter and Palm Street. Redirect at junctions; revisit the same destination.
2. Pan, pinch, rotate, change camera view, and use Find my character. Check readable labels, compact controls, selection/close behavior and touch target access.
3. Pick up/place the parcel, order/carry/eat a meal, sit/stand, pause/resume and reload. Repeat with a wheelchair character. Check feet/wheels, bench facing, furniture clearance and saved activity recovery.
4. Open a sample mission and a new-arrival alert; verify they do not obscure critical controls or leave the old mission visible during travel.
5. Continue playing for at least ten minutes. Note heat, stutters, disappearing assets, blur, flickering paths and delayed input. Repeat the same route before comparing settings.

## Record an actual gameplay run

1. Open Tools → Performance and choose **Light**. It now saves the selection for reloads and city changes.
2. Tap **Record 30 gameplay samples**, close diagnostics and walk the same route through Connected city. Rotate, pan, inspect a mission and use a nearby activity. A green count badge on Tools confirms recording continues.
3. Reopen Tools → Performance after 30 foreground samples and export the JSON. Opening menus may contribute samples too; keep the route consistent.
4. Repeat in **Balanced** from the same camera view/location. Allow a few seconds after changing quality before recording. Do not compare unlike camera views or different districts.
5. Continue normal play for 10–15 minutes and report heat, input delay and whether performance declines. Compare an ordinary browser tab and installed PWA separately.

Recording survives closing diagnostics and stops after 30 samples or Stop recording. Hidden tabs and periods without an active scene are skipped. Samples last only for this page session; export before reloading. Export version 2 includes draw calls, active-mesh evaluation, render-target and render-submission CPU timings, ambient activity cost, district, view, camera radius, shadow state and hidden-detail count. CPU submission time is not GPU execution time. Render-target work can alternate between frames.

Light disables real-time sun shadows/local point lights, budgets ambient residents to four nearby characters at reduced update frequency, and omits small distant scenery pieces. Main building bodies, navigation, signs and interactions stay available. Balanced restores full decorative activity/detail. Opaque static scenery uses colour batching in both modes; it preserves geometry and per-asset identity rather than globally merging the city.

Investigate sustained FPS below30, p95 frame intervals above50ms, repeated stalls, growing memory after comparable return trips and deterioration as the phone heats up. These are investigation thresholds, not guaranteed device budgets.

`loadMs` measures scene construction to first ready frame, excluding HTML/network transfer. Exported values are once-per-second samples of rolling statistics, not one aggregate trace for the whole session. Heap values may be unavailable and do not measure total GPU memory. Keep these limits with a shared report.

## PWA checks

After one successful online preparation, test offline relaunch, background/foreground return, installed-app safe areas and local save recovery. Check a future update only after saving progress. Game saves remain local to the browser/origin; clearing browser data can remove them.

Earlier iPhone 13 Pro and Tecno Spark 40C reports are available; a new Tecno run is required to measure this performance pass. See VERIFICATION.md for automated and browser checks already performed.
