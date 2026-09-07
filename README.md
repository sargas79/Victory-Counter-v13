# Victory Counter

A shared, always-visible progress counter for **any game system** in
**Foundry VTT v13 and v14**.

The GM creates any number of named tracks and adjusts them as the scene plays
out. Every player sees the same live state in a collapsible on-screen HUD.

A track runs in one of two **modes**:

- **Progress** — counts up from zero toward a target and completes there. Suits
  any subsystem built on "fill a bar before the other bar fills": PF2e
  infiltration and research points, D&D 5e skill challenges and clocks, Blades
  in the Dark progress clocks, chase trackers, doom counters, faction heat.
- **Thresholds** — starts at a value you choose, moves up *and* down, and takes
  its meaning from the band it lands in rather than from a finish line. Suits
  standing, reputation, morale, alert level, faction disposition — anything that
  can get better or worse and where the interesting moments are the crossings.

## Features

- **Shared state.** Up to 10 concurrent tracks, stored in a world setting and
  broadcast to every connected client automatically. No custom socket, no
  desync.
- **One target per progress track.** A progress track has a name, a target, a
  current value and a polarity. It completes when `current >= target`. Progress
  can never go below zero.
- **Threshold ladders.** A threshold track carries up to 12 GM-described bands.
  Each band has a value where it begins, a name, and a description of what it
  means. Bands below the starting value read as negative, the band containing it
  is the status quo, and bands above it read as positive — derived from the start
  value, so there is nothing extra to tag.
- **Band-change announcements.** When a threshold track moves into a different
  band, in either direction, it can post a chat card naming the band and quoting
  its description. Skipped bands are listed rather than swallowed. Toggle it per
  track, and per band.
- **Named steps.** A step track counts to its target like a progress track but is
  drawn as that many discrete steps, up to 10 of which the GM may name. A name
  belongs to its own step and says nothing about the ones above it — which is
  what makes it a milestone rather than a band. Reaching one can announce itself
  in chat, and can stay secret from players until the track arrives.
- **Positive and negative tracks.** Positive is the default and keeps the
  module's accent colour. Negative tracks show their progress numbers and ring
  in red — plus an arrow icon and the written word *Negative*, so the
  distinction survives colour-blindness, greyscale and screen readers.
- **Circular progress rings.** Optional (world setting, on by default). Pure SVG
  and CSS, with `current / target` in the centre, clamped to 100%.
- **Responsive layout.** Cards reflow through CSS Grid: one column when narrow,
  two or three when wide. Both windows are resizable and only scroll when they
  genuinely run out of screen.
- **Draggable, resizable HUD.** Grab the title bar to move it, the bottom-right
  grip to resize it. Double-click either to reset. Position, width, scale and
  collapsed state are per-user.
- **Compact mode.** Collapses to one slim chip per track — value and target on a
  progress track, value and band name on a threshold track, value, target and
  the name of the step it is standing on for a step track.
- **GM quick controls.** `-` / `+` and a "set" field on the HUD itself, plus a
  full control panel. The eye button toggles player visibility in one click.
- **Hide from players.** Run a track the party cannot see; chat cards are
  whispered to GMs while it is hidden.
- **Undo.** Every change stores a one-level snapshot that the GM can restore.
- **System-agnostic.** No system is declared, detected or special-cased. The
  module stores its entire state in its own settings and never reads a system's
  actor, item or roll data, so it behaves identically everywhere.
- **Macro API** for automation.

## Installation

### From a manifest URL

There are two install tracks. Both ship identical module code from the same
release; they differ only in the compatibility they declare.

**Main track — recommended, works on v13 and v14**

1. In Foundry, go to **Add-on Modules → Install Module**.
2. Paste:
```
https://github.com/sargas79/Victory-Counter-v13/releases/latest/download/module.json
```
3. Click **Install**, then enable the module in your world.

**v13-pinned track**

Declares `maximum: 13`, so Foundry will never offer it as an update to a v14
world. Use it if you run v13 and want a build that stays on the v13 line:

```
https://github.com/sargas79/Victory-Counter-v13/releases/latest/download/module-v13.json
```

The two are the same package id (`victory-counter`), so a world can have one or
the other installed, not both. Switching tracks means uninstalling and
reinstalling from the other URL; the world's tracks live in world settings and
survive that untouched.

### Local development

Clone or symlink this repository into your Foundry user data directory under a
folder named exactly `victory-counter` (the name must match `module.json.id`),
so the path is:

```
<FoundryUserData>/Data/modules/victory-counter/
```

Restart Foundry, then enable **Victory Counter** in
**Game Settings → Manage Modules**.

On Windows, a symlink from an admin PowerShell prompt:

```powershell
New-Item -ItemType SymbolicLink -Path "$env:LOCALAPPDATA\FoundryVTT\Data\modules\victory-counter" -Target "C:\path\to\Victory-Counter-v13"
```

## Usage

### Gamemaster

1. Select the **Token** scene controls; click the **sliders** icon
   (*Victory Counter Controls*).
2. Fill in the track name and pick a **Mode**.
   - *Progress*: set the **Target** and the **Type** (*Positive* or *Negative*).
   - *Thresholds*: set **Start**, **Minimum** and **Maximum**.
   - *Steps*: set the **Target** — that is how many steps the track has — and the
     **Type**.
3. Leave **Visible to Players** on so the party can see the track; turn it off
   to run a hidden one.
4. Click **Add Track**. Repeat for as many tracks as the scene needs.
5. For a threshold track, click **Edit Thresholds** on its card and describe each
   band; for a step track, click **Edit Step Labels** and name the steps that
   matter (both are described below).
6. During play, use `-` / `+` in the panel or directly on the HUD. To jump to a
   value, type it into the track's "set" field and press Enter.
7. **Undo Last Change** reverts the most recent change. **Reset Progress**
   zeroes a progress or step track; on a threshold track the same button reads
   **Reset to Start** and returns it to its starting value. **End Track** removes
   it from every screen.

Resetting or ending a track always asks for confirmation first.

By default a progress or step track that has reached its target refuses further
increases. Turn on **Allow Progress Beyond Target** in the module settings if you
want it to keep counting past the finish line. Threshold tracks ignore that
setting: they are bounded by their own **Minimum** and **Maximum** instead.

#### Threshold tracks

Say the party's standing with a faction starts at **6**, can run from **0** to
**12**, and matters at five points:

| At value | Band | Means |
| --- | --- | --- |
| 0 | Blood Feud | Kill on sight. |
| 3 | Strained | Doors close; prices double. |
| 6 | Uneasy Truce | The status quo. |
| 9 | Trusted | The back room is open to you. |
| 12 | Sworn Allies | They come when called. |

Create the track with Start 6, Minimum 0, Maximum 12, then add those five rungs
in **Edit Thresholds**. The value sits in the highest band it has reached, so 7
and 8 are still *Uneasy Truce*, and the band only changes when the value crosses
into the next one.

Because the start is 6, the two bands below it read as negative, the band at 6 is
the status quo, and the two above it read as positive. There is nothing to tag by
hand — move the start and the whole ladder re-reads itself.

Announcements have three independent switches:

| Switch | Where | Covers |
| --- | --- | --- |
| **Post Progress to Chat** | Module settings | Every card, for every track. Master switch. |
| **Announce in Chat** | Track card | Every value change on that track. |
| **Announce Band Changes** | Track card | Only crossings into a new band, either direction. |
| **Announce This Band** | Ladder editor | Lets one band pass without comment. |

A change that trips more than one posts a single card carrying all of it, not one
card each. A jump that skips bands names the band it landed in and lists the ones
it passed through. Rewriting the ladder never announces anything — the scale
changing is not the same event as the value moving across it.

**Show Players Every Threshold** is off by default: players see their current
band, its description, and the shape of the scale, but not the other bands'
numbers or descriptions. Turn it on to make the whole ladder public.

#### Step tracks

A step track is a clock. Say the party has six steps to breach a vault, and two
of those steps are worth naming:

| At step | Name | Means |
| --- | --- | --- |
| 3 | The Alarm Is Raised | The watch doubles and the inner gate is barred. |
| 6 | The Vault Is Open | They are through. |

Create the track in **Steps** mode with Target 6, then add those two labels in
**Edit Step Labels**. The HUD draws six pips, filled up to the current value,
with a mark on 3 and 6.

The difference from a threshold ladder is the whole reason both modes exist. A
threshold band owns every number from its rung up to the next one, so a track at
7 on a ladder with rungs at 6 and 9 still reads *Uneasy Truce*. A step label owns
**one step**: a track at 4 on this clock has no label at all, because nothing in
particular happens at 4. Use thresholds when a number describes a *state*, and
steps when it marks an *event*.

Otherwise a step track behaves exactly like a progress track: it counts up from
zero, completes at its target, carries a polarity, and resets to zero.

Announcements work the same way bands do:

| Switch | Where | Covers |
| --- | --- | --- |
| **Post Progress to Chat** | Module settings | Every card, for every track. Master switch. |
| **Announce in Chat** | Track card | Every value change on that track. |
| **Announce Named Steps** | Track card | Only reaching or passing a named step. |
| **Announce This Step** | Step label editor | Lets one step pass without comment. |

A jump that crosses several named steps posts one card: it names the step it
landed on and lists the ones it passed on the way. Moving between unnamed
numbers announces nothing. Rewriting the labels never announces anything.

**Show Players Every Label** is off by default, and it governs the road *ahead*.
Players always see the whole strip, and they always read the name of a step the
track has already reached — a milestone the party has hit is not a secret, and
the chat card has to be able to say what just happened. What they do not see
until the GM turns this on is the name waiting at a step still in front of them;
that pip shows only as marked.

Up to **10 steps** on one track may be named, and two labels cannot share a step.
A label past the track's target is kept but flagged as unreachable in the editor,
so lowering the target does not destroy wording the GM wrote — and it stays off
the clock while it is up there: it draws no pip, never announces, and is not
what the counter or the API reports as the current step, even if the value
climbs past the target through **Allow Progress Beyond Target**. Raise the
target again and it comes straight back.

Step tracks are drawn as pips up to 20 steps. Past that the strip becomes a bar
with a tick at each named step, which stays readable where forty slivers would
not.

### Players

- The HUD appears automatically when the GM starts a visible track.
- Drag it by the title bar to get it out of your way; double-click the bar to
  snap it back to your anchor.
- Drag the grip in the bottom-right corner to resize it — a wider HUD lays the
  track cards out in two or three columns. Double-click the grip to reset.
- Use the chevron to collapse it to compact chips, or the `x` to hide it.
- Reopen it from the **Token** scene controls (*Show/Hide Victory Counter*,
  trophy icon).
- Anchor, width and scale live in **Game Settings → Configure Settings →
  Victory Counter** and are personal to you.

Only the GM can create, rename, configure, retype, delete or adjust a track.
On a progress track, players see the name, the Positive/Negative indicator, the
current value against the target, the ring (when enabled) and the completion
state. On a threshold track they see the name, the value, the band they are
currently in and what it means, and where they sit on the scale — the rest of the
ladder only if the GM has revealed it. On a step track they see the whole strip,
which steps are named, and the names of the ones already reached — the names
still ahead only if the GM has revealed them.

### Macro API

```js
const vc = game.modules.get("victory-counter").api;

// A 6-step infiltration, and the alarm working against the party
const infiltration = await vc.create({ title: "Infiltration Points", target: 6 });
const alarm = await vc.create({ title: "Raise the Alarm", target: 5, type: "negative" });

await vc.increase(infiltration.id);        // +1
await vc.increase(alarm.id, 2);            // +2
await vc.decrease(alarm.id);               // -1, never below 0
await vc.setProgress(infiltration.id, 4);  // set directly
await vc.setType(alarm.id, "positive");    // change polarity
await vc.undo();                           // revert the last change
await vc.end(infiltration.id);             // clear the track

vc.getTracks();                            // read all current state
vc.getTrack(alarm.id);                     // read one track
```

Threshold tracks use the same value calls (`increase`, `decrease`, `adjust`,
`setProgress`, `reset`) plus a ladder of their own:

```js
const standing = await vc.create({
  title: "Faction Standing",
  mode: vc.MODES.THRESHOLD,
  start: 6, min: 0, max: 12
});

await vc.setThresholds(standing.id, [
  { value: 0,  label: "Blood Feud",   description: "Kill on sight." },
  { value: 3,  label: "Strained",     description: "Doors close; prices double." },
  { value: 6,  label: "Uneasy Truce", description: "The status quo." },
  { value: 9,  label: "Trusted",      description: "The back room is open to you." },
  { value: 12, label: "Sworn Allies", description: "They come when called.", announce: false }
]);

await vc.increase(standing.id, 3);   // 6 -> 9, announces "Trusted"
await vc.decrease(standing.id, 9);   // 9 -> 0, announces "Blood Feud"
vc.getBand(standing.id);             // the band it currently sits in, or null
await vc.toggleThresholdAnnounce(standing.id);
```

Rungs may be passed in any order; ids are generated for any that arrive without
one, and the list is sorted, deduplicated by value and capped on the way in.
Writing a ladder never posts a chat card.

Step tracks use the same value calls again, plus a label list of their own:

```js
const vault = await vc.create({
  title: "Breach the Vault",
  mode: vc.MODES.STEPS,
  target: 6
});

await vc.setSteps(vault.id, [
  { value: 3, label: "The Alarm Is Raised", description: "The watch doubles." },
  { value: 6, label: "The Vault Is Open",   description: "They are through." }
]);

await vc.increase(vault.id, 3);   // 0 -> 3, announces "The Alarm Is Raised"
await vc.increase(vault.id, 3);   // 3 -> 6, announces "The Vault Is Open"; completes
vc.getStep(vault.id);             // the label on the current step, or null
await vc.toggleStepAnnounce(vault.id);
```

`getStep()` returns null on any step the GM did not name — that is the mode
working as intended, not an error. Labels are sorted, deduplicated by step and
capped at 10 on the way in, and writing them never posts a chat card.

All mutating calls are GM-only and fail with a notification for other users.

`addSuccess()` and `setCounts()` still work as deprecated aliases for
`increase()` and `setProgress()`. `addFailure()` was removed in 1.0.3 — model a
"bad" track as a separate negative track instead.

## Data schema

One world setting (`tracks`) holds an array of:

```json
{
  "schema": 5,
  "id": "unique-track-id",
  "active": true,
  "title": "Raise the Alarm",
  "mode": "progress",
  "type": "negative",
  "current": 2,
  "target": 5,
  "start": 0,
  "min": 0,
  "max": 12,
  "thresholds": [],
  "band": null,
  "announceThresholds": true,
  "revealLadder": false,
  "steps": [],
  "step": null,
  "announceSteps": true,
  "revealSteps": false,
  "visibleToPlayers": true,
  "postToChat": true,
  "status": "running",
  "lastChange": { "delta": 1, "time": 1755400000000 },
  "legacy": null
}
```

`mode` decides which fields mean anything. A `progress` track reads `target` and
ignores `start`/`min`/`max`/`thresholds`/`steps`; a `threshold` track reads the
bounds and the ladder instead; a `steps` track reads `target` and `steps`. The
unused fields are kept rather than stripped, so switching a track between modes
and back does not throw away a ladder or a label list the GM wrote.

Each entry in `thresholds` is
`{ "id": "...", "value": 3, "label": "Strained", "description": "...", "announce": true }`.
The array is sorted ascending by `value` and deduplicated by it on every read, so
only one band can ever own a given number.

Each entry in `steps` has the same shape. It is sorted and deduplicated by the
same rules, and capped at 10 rather than 12, but `value` means something
different: a rung's value is where a band *begins*, while a label's value is the
one step it names.

Three fields are derived and never authored:

- `status` — `complete` when a progress or steps track has `current >= target`,
  otherwise `running`. A threshold track is always `running`; it has no finish
  line.
- `band` — the id of the threshold the value currently sits in, or `null` when it
  is below every rung. Recomputed on every read so a hand-edited ladder cannot
  leave it pointing at a rung that no longer exists, but also stored, because
  announcements compare the band before a change with the band after it.
- `step` — the id of the label sitting exactly on `current`, or `null` when that
  step is unnamed. Recomputed and stored for the same two reasons.

`legacy` holds the pre-schema-3 failure fields of a migrated track, and is never
read at runtime.

Upgrading from schema 4 is purely additive: every track gains an empty `steps`
list and the three fields that go with it, none of which the two existing modes
read. Upgrading from schema 3 is additive in the same way: every track gains
`mode: "progress"`, which is exactly what it already was, and no stored value
changes meaning.
Upgrading from schema 2 migrates `successes → current` and
`requiredSuccesses → target`, defaults every track to `type: "positive"`, and
preserves the failure fields under `legacy`. The migration is versioned and
idempotent, writes a one-time verbatim backup to a hidden `legacyBackup`
setting, and deletes nothing. See the
[changelog](CHANGELOG.md) for the full table.

## Manual test plan

Run these in a v13 or v14 world under any system. Everything except the
two-client checks can be done in a single GM session. The module ships one code
path for both generations, so a feature verified on one is expected to behave
identically on the other — but the checks below are worth repeating on each
generation you actually run, because the parts most likely to differ are the
ones core Foundry draws around the module: the scene control buttons, the
control panel's window frame and the chat cards.

**v13 smoke test**

Enough to establish that the module loaded and its core Foundry touchpoints
resolved. Run it once per v13 world before trusting the rest of the plan.

1. Enable the module and reload. The Token scene controls show the trophy
   (**Toggle Counter**) button for everyone and the sliders (**Counter Control
   Panel**) button for the GM. Those buttons appearing is the check: they are
   registered from `registerHooks()`, so nothing draws them unless the module
   parsed and its hooks ran.
2. The console carries no `victory-counter` error and no core deprecation
   warning naming a file under `modules/victory-counter/`.
3. Optional version banner: turn on **Debug Logging** in the module settings and
   reload. The console then prints
   `[victory-counter] Ready. Core: 13.351. System: <id> <version>.` This line is
   debug-gated, so with the setting off — its default — its absence means
   nothing and is not a failure.
4. Open the control panel. It has a title bar, an icon, and a working resize
   handle in the bottom-right corner.
5. Add a track. The HUD appears; the panel and the HUD both show it.
6. **Reset Progress** on that track opens a confirmation dialog, and cancelling
   it leaves the value alone.
7. Adjust the track with **Post Progress to Chat** on. A chat card renders with
   its border, ring and status text, not as unstyled text.

**Upgrading from the PF2e-only build**

1. In a world that ran the PF2e build as `pf2e-victory-counter`, disable that
   module, install this one and reload as GM. The existing tracks appear, a
   notification reports how many were imported, and the old module's settings
   are still present in the world database untouched.
2. Reload again. No second import notification, and the tracks are unchanged.
3. In a world that has never had the old module, confirm the import is silent
   and the world starts with no tracks.

**Migration**

4. With schema 2 data present, load the world as GM. The tracks appear with
   their old success totals as the current value and their old
   required-successes as the target, all marked *Positive*, with no console
   errors.
5. Enable **Debug Logging** and reload. The console prints one migration summary
   line; a second reload prints "already at schema 4 — nothing to do."
6. Hand-edit a track's stored data to remove `target`, or set it to `null`. It
   reloads with a safe default instead of throwing.
6a. With schema 3 data present, load the world as GM. Every track appears exactly
    as before, now in **Progress** mode, with its value, target and polarity
    unchanged and no console errors.

**Progress rules**

7. Create a track. It defaults to **Positive**.
8. Press `-` at 0. The value stays at 0.
9. Fill a track to its target. The status reads **Complete** and the ring closes.
10. Press `+` again. The increase is refused with a notification.
11. Turn on **Allow Progress Beyond Target** and press `+`. The value rises past
    the target; the ring stays visually full.

**Polarity**

12. Set a track to **Negative**. Its numbers, ring and badge turn red, in both
    the HUD and the panel, and the badge reads "Negative" with a down arrow.
13. Log in as a player. The negative track is red there too.

**Rings**

14. With rings on, check a track at 0 (empty ring), part-way (partial arc), and
    at/over target (full ring plus halo).
15. Turn **Show Progress Rings** off. Every track falls back to the figure and
    bar; no layout breaks.

**Layout and resizing**

16. Open 1, 3, 4, 6 and 10 tracks in turn. At each count, drag the HUD's
    bottom-right grip from narrow to wide and confirm the cards reflow from one
    column to two to three.
17. With 10 tracks open, confirm the resize grip is still visible and draggable.
18. Confirm a scrollbar appears only when the cards actually reach the bottom of
    the screen, and disappears again when the HUD is widened.
19. Open the control panel with 4+ tracks. Drag its bottom-right corner: it
    resizes, the cards reflow, and it refuses to go below 380×320.
20. Add and remove a track with the panel open. It refits to the viewport rather
    than growing off screen.
21. Turn on **Reduce Motion** in the OS. Nothing animates; every state is still
    readable.

**Threshold tracks**

22. Create a threshold track with Start 6, Min 0, Max 12 and the five bands from
    the table above. The HUD shows the value, the band *Uneasy Truce*, and a
    ladder with five ticks.
23. Press `+` three times. At 9 the band becomes *Trusted* and one chat card is
    posted naming it and quoting its description.
24. Press `-` once, to 8. The band returns to *Uneasy Truce* and a card announces
    the fall. Press `-` again, to 7. No card: the band did not change.
25. Set the value to 12 from 0 in one step. One card is posted, naming *Sworn
    Allies* and listing *Strained*, *Uneasy Truce* and *Trusted* as passed
    through — but only if that band's **Announce This Band** is on; with it off
    (as in the API example) no card appears.
26. Press `-` at the Minimum and `+` at the Maximum. The value does not move and
    a notification explains which bound was hit.
27. Set Min to -5 and press `-` past 0. The value goes negative, the band reads
    *Below the first threshold*, and the ladder marker sits left of every tick.
28. Turn **Announce Band Changes** off and cross a band. No card. Turn
    **Announce in Chat** off as well and adjust the value: still no card. Turn
    band announcements back on and cross a band: exactly one card.
29. Turn the world setting **Post Progress to Chat** off. No card is posted for
    either kind of change, on any track.
30. Open **Edit Thresholds**, add a rung with the same value as an existing one,
    and save. One is dropped with a notification explaining why; the ladder stays
    sorted. Rewriting the ladder posts no chat card.
31. Click **Reset to Start**. The confirmation names the starting value, and the
    track returns to it.
32. With **Show Players Every Threshold** off, log in as a player. The band name,
    its description and the tick positions are visible; the other bands' numbers
    are not. Turn the setting on: the numbers appear.
33. Switch a threshold track to **Progress** mode and back. The ladder is still
    there, and no chat card was posted for either switch.
34. Collapse the HUD. The threshold chip shows the value and band name, with no
    `/ target`.

**Step tracks**

35. Create a step track with Target 6 and the two labels from the table above.
    The HUD shows six pips, none filled, `0 / 6`, and a mark on pips 3 and 6.
36. Press `+` three times. Pips 1-3 fill, pip 3 is outlined as the current step,
    the card names *The Alarm Is Raised* and quotes its description, and one chat
    card announces reaching it.
37. Press `+` once, to 4. No card names a step, and the card shows no step name:
    step 4 is unnamed, which is the mode working correctly.
38. Set the value to 6 from 1 in one step. One card is posted, naming *The Vault
    Is Open* as reached and listing *The Alarm Is Raised* as passed through. The
    track reads **Complete**.
39. Press `-` back to 2. The card reports falling back past the named step, and
    the track reads **In Progress** again.
40. Open **Edit Step Labels** and add an eleventh label. It is refused with a
    notification naming the cap of 10. Add a label on a step that already has
    one and save: one is dropped, with a notification explaining why.
41. Lower the Target to 4 and reopen the editor. The label at step 6 is flagged
    *Past the target* rather than deleted; raise the Target back to 6 and the
    flag clears.
42. With the value at 6 and the Target lowered to 4 (or with **Allow Progress
    Beyond Target** on and the value pushed past it), the card names no step, no
    chat card announces one, and `getStep()` returns null: a label above the
    target is off the strip, not merely undrawn. Raise the Target back and the
    step reads normally again.
43. Turn **Announce Named Steps** off and cross a named step. No card. Turn it
    back on but turn that step's own **Announce This Step** off, and cross it
    again: still no card. Turn both on: exactly one card.
44. With **Show Players Every Label** off, log in as a player. Every pip and both
    marks are visible; the name of a step already reached is readable, and one
    still ahead reads *Not yet revealed*. Turn the setting on: the name appears.
45. With the GM and player both connected, press `+`. The player's strip, pip
    fill and step name update without a reload.
46. Set the Target to 40. The strip becomes a bar with a tick at each named step
    rather than forty pips.
47. Collapse the HUD. The step chip shows the value, the target and the name of
    the step it is standing on.
48. Switch a step track to **Thresholds** mode and back. The labels are still
    there, and no chat card was posted for either switch.

**Terminology**

49. Search the HUD, panel, dialogs, chat cards and settings for the word
    "successes". It should not appear.

**Permissions and sync**

50. As a player, try the API: `game.modules.get("victory-counter").api
    .increase(id)`. It is refused with a GM-only notification.
51. With a GM and a player connected, change a track on the GM screen. The
    player's HUD updates immediately without a reload.
52. Hide a track from players. It disappears from the player HUD, and its chat
    cards are whispered — including band-change cards.

**Systems**

53. Load the same world under a different game system (or a second world running
    one). The HUD, panel, chat cards and settings all behave identically and the
    console stays clean.

Console must stay clean throughout.

## Data safety

The module writes **only** world-scoped settings for track data, the undo
snapshot, the schema version and the pre-schema-3 backup, plus per-user display
preferences. It never creates, updates or deletes Actors, Items, Scenes,
Journals, Effects or any other world document, and it never touches any game
system's data. Disabling or uninstalling the module leaves your world unchanged.

Upgrading from the PF2e-only build reads the old `pf2e-victory-counter`
settings once and copies the tracks across. It never writes to or deletes the
old namespace, so reinstalling that build recovers the original world as it
was. Per-user display preferences (anchor, width, scale, collapsed state) are
not carried over and are simply set again on first use.

## Compatibility

| | |
|---|---|
| Foundry VTT | v13 and v14 (minimum 13, verified 14.366; the pinned track is verified 13.351) |
| Game system | Any — no system is declared or required |
| Dependencies | None |

The module declares no `relationships.systems` entry, so Foundry offers it in
every world. It reads and writes only its own settings, which is what makes that
safe rather than merely permitted.

### Why one code path covers both generations

Support for v13 is a lowered floor, not a fork: there is no version branching in
`scripts/`, and no shim layer. That is possible because every core API the module
touches landed in v13 and is unchanged in v14. The full list, so this does not
have to be re-derived the next time the floor moves:

| Used by the module | Available since |
|---|---|
| `foundry.applications.api.ApplicationV2`, `HandlebarsApplicationMixin` | v12 |
| `foundry.applications.api.DialogV2.confirm` (`window`, `content`, `modal`, `rejectClose`) | v12 |
| `foundry.applications.handlebars.loadTemplates` / `renderTemplate` | v13 — this is the floor |
| `getSceneControlButtons` with record-shaped `controls.tokens.tools` and `onChange` | v13 — this is the floor |
| `ApplicationV2#bringToFront`, `#setPosition`, `#position`, `#rendered` | v13 (`bringToTop` was the v12 spelling, and is only ever called optionally) |
| `game.settings.register` with `type`, `range`, `choices`, `onChange` | v9 |
| `ChatMessage.create`, `ChatMessage.getWhisperRecipients` | v9 |
| `foundry.utils.deepClone`, `mergeObject`, `randomID` | v10 |

The stylesheet is self-contained: the only core custom properties it reads are
`--font-primary` and `--z-index-app`, both with a literal fallback, so a
generation that renamed either would degrade to the fallback rather than break.

The two APIs marked *this is the floor* are what stops the module running on
v12. Both are v13-and-later spellings of things that existed before under a
global name, and the pre-v13 spellings are deliberately not carried — supporting
v12 would mean a shim, and v12 is out of support.

## Design

The HUD is a port of variant **1a** ("party total — the by-the-book panel") from
the Nocturne *Victory Points HUD* design, with the compact bar from variant 1e
as the collapsed state.

Deliberate deviations from the source design:

- **Negative colour.** Nocturne is a mono-accent system with no danger role. The
  accent carries progress on a positive track; `--pvc-negative` (`#ef7f6e`,
  5.81:1 against the card surface) is the single sanctioned extension and is
  used only for negative-polarity tracks — always alongside an icon and a
  written label, never as the only signal.
- **No web font.** The design loads Inter from Google Fonts. The module asks for
  Inter and falls back to Foundry's UI face instead, so worlds running offline
  never flash an unstyled counter. Install Inter locally to get the intended look.
- **Progress rings.** Not in the source design; added as an optional readout
  that replaces the figure-plus-bar when the GM enables it.
- **No round counter.** The design's "Round 3" slot shows track status instead.

Icons are [Phosphor](https://phosphoricons.com/) (MIT), inlined as SVG on
`currentColor`.

## License

[MIT](LICENSE). Contains no Paizo or Foundry Gaming intellectual property.
