# Courtyard challenge: first playable trial

## Purpose and scope

Prove a small loop of observation, manipulation and deduction before spending on more city scenery, hunts or integration. Hunt now opens a repair-station finder. Three directory stations reuse The dark directory repair interaction, with different initial orientations and separate local progress. Tap a station sign or its cabinet/parcel to walk to its validated entrance; arrival opens the puzzle. Within four world units it opens directly. The earlier walking hunt remains accessible through Earlier hunt journal, with its save untouched. This is a small workbench interaction anchored to visible city cabinets/parcels, not yet a rich authored courtyard encounter or validated retention feature.

## Player journey

1. Open the parcel tag. Keep two clues visible: a leaf stamp and “For a quiet place to read.”
2. Repair the directory's circuit by rotating six tiles. Power must traverse all six from the upper-left supply to lower-left book light. Tiles show rotation, connected power, orientation labels and a graduated first hint. No walking or timer is needed.
3. Choose between Leaf Café, Leaf Books and Star Books. Both clues matter. Wrong choices explain the mismatch and preserve the repaired directory.
4. Leaf Books opens a reading-corner illustration/reaction and leaves a local completion keepsake. No paid-work benefit, currency or competitive reward.

Controls: tap/click or keyboard-activate a tile to rotate clockwise. Six tiles remain in the same positions; only their connections change. Current goal and three-step progress are explicit. Step changes return focus to the heading. Close/reopen resumes; each action queues a versioned IndexedDB write. Mission inspection waits for pending challenge writes. Save failures are visible; JSON backup/restore is provided.

## Architecture

`domains/explorer/challenge/model.ts` owns pure connection traversal, rotation, stage gates and recipient checks. `useChallenge.ts` owns queued persistence and its separate courtyard-directory-v1 record. `ChallengePanel.tsx` owns the interactive presentation; CSS is local to the challenge. Reuses shared GameButton/GameCard/CloseButton and shared/storage/gameRecords. SVG is inline code, with no downloaded imagery, added engine or server.

No claims of fun are validated by automated tests. The current conclusion is only that this slice is functionally playable.

## Acceptance gate before expansion

Run with 3–5 people who have not seen the solution. Give only “Find a Repair sign in Lagos and try it.” Observe rather than coach.

- Can they identify the current goal and rotate a tile without explanation?
- Do they understand how the power route works and why a connection stops?
- Can they finish without repeated blind guessing? Record hint use and confusion rather than penalising hints.
- Can they explain why the recipient matches both clues?
- Can they leave for a demo mission, reload and continue without repeating solved actions?
- Ask what they enjoyed, what felt tedious and whether they would voluntarily try another puzzle. Do not count time spent as enjoyment.

Fix or discard the interaction if the repair is confusing or tedious. Do not add more levels, rewards or travel to compensate. Next content work depends on fresh-player evidence. Real phone keyboard, assistive-technology and sustained performance checks remain pending.
