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

## Built-in rendering snapshot

Tools → Performance shows rolling frame statistics, scene-ready time, geometry/detail counts, render resolution/quality and an optional browser heap estimate. Choose Balanced, Record30 seconds, then Export benchmark JSON. Repeat with Light at the same camera/location.

**Recorder limitation:** the diagnostics panel blocks character movement, and closing it ends recording. These samples measure rendering with diagnostics open; they are not a full gameplay benchmark. Recording independently of the panel is not implemented. For a normal gameplay timeline, use Android Chrome remote debugging or iPhone Safari Web Inspector from a connected computer.

Investigate sustained FPS below30, p95 frame intervals above50ms, repeated stalls, growing memory after comparable return trips and deterioration as the phone heats up. These are investigation thresholds, not guaranteed device budgets.

`loadMs` measures scene construction to first ready frame, excluding HTML/network transfer. Exported values are once-per-second samples of rolling statistics, not one aggregate trace for the whole session. Heap values may be unavailable and do not measure total GPU memory. Keep these limits with a shared report.

## PWA checks

After one successful online preparation, test offline relaunch, background/foreground return, installed-app safe areas and local save recovery. Check a future update only after saving progress. Game saves remain local to the browser/origin; clearing browser data can remove them.

Native-device results remain pending until actual phone runs are supplied. See VERIFICATION.md for automated and browser checks already performed.
