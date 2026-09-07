/**
 * Shared constants and small utilities for the Victory Counter module.
 * @module victory-counter/constants
 */

export const MODULE_ID = "victory-counter";

/**
 * The id this module shipped under up to and including 3.x, when it was
 * packaged as a Pathfinder 2e-only module.
 *
 * Foundry namespaces settings by module id, so a world that used the old build
 * still holds its tracks under this id. It is read exactly once, by the
 * one-time import in `migration.js`, and never written to.
 */
export const LEGACY_MODULE_ID = "pf2e-victory-counter";

/** Setting keys, namespaced under the module. */
export const SETTINGS = Object.freeze({
  /** World scope. The list of active tracks (plain objects). */
  TRACKS: "tracks",
  /** World scope. One-level undo snapshot of the previous tracks array. */
  UNDO: "undoBuffer",
  /** World scope. Schema version of the data currently in {@link SETTINGS.TRACKS}. */
  SCHEMA: "schemaVersion",
  /** World scope. Verbatim copy of the pre-migration track array, written once. */
  LEGACY_BACKUP: "legacyBackup",
  /**
   * World scope. Whether the one-time import from the old `pf2e-victory-counter`
   * module id has already run in this world. Set even when nothing was found,
   * so the lookup happens once rather than on every load.
   */
  IMPORTED_LEGACY_MODULE: "importedLegacyModule",
  /** Client scope. Per-user local dismissal of the overlay. */
  OVERLAY_HIDDEN: "overlayHidden",
  /** Client scope. Per-user collapsed/expanded overlay state. */
  OVERLAY_COLLAPSED: "overlayCollapsed",
  /** Client scope. Screen anchor for the overlay. */
  OVERLAY_POSITION: "overlayPosition",
  /** Client scope. Free-drag offset `{left, top}` which overrides the anchor. */
  OVERLAY_OFFSET: "overlayOffset",
  /** Client scope. Overlay scale multiplier. */
  OVERLAY_SCALE: "overlayScale",
  /** Client scope. Overlay surface width in pixels, set by the resize grip. */
  OVERLAY_WIDTH: "overlayWidth",
  /** World scope. Draw a circular progress ring on every track. */
  SHOW_RINGS: "showProgressRings",
  /** World scope. Allow the current value to be pushed past the target. */
  ALLOW_OVERSHOOT: "allowOvershoot",
  /** World scope. Post a chat card whenever a track's state changes. */
  POST_CHAT: "postChatUpdates",
  /** World scope. Verbose console logging. */
  DEBUG: "debug"
});

/**
 * Current persisted schema version for a track object.
 *
 * - 1/2: `successes` / `failures` with `requiredSuccesses` / `requiredFailures`.
 * - 3:   single `current` / `target` pair plus a `type` polarity.
 * - 4:   `mode`, plus the threshold fields (`start`, `min`, `max`, `thresholds`,
 *        `band`). Purely additive: every v3 field keeps its meaning, and a v3
 *        record becomes a v4 progress track without any value being rewritten.
 * - 5:   the step fields (`steps`, `step`, `announceSteps`, `revealSteps`).
 *        Additive in the same way: a v4 record becomes a v5 record of whatever
 *        mode it already had, with an empty label list it does not use.
 * - 6:   the drawing fields (`display`, `runes`). Additive again, and unlike
 *        every version above it does not touch counting at all: a v5 record
 *        becomes a v6 record drawn exactly as it was drawn before.
 */
export const SCHEMA_VERSION = 6;

/** Resolution states a track can be in. */
export const STATUS = Object.freeze({
  RUNNING: "running",
  COMPLETE: "complete"
});

/**
 * How a track measures itself. Stored per track; progress is the default and is
 * what every pre-4 track migrates to.
 *
 * - `progress`:  counts up from zero toward a target and completes there.
 * - `threshold`: starts at a GM-set value, moves up *and* down (below zero if
 *                the GM allows it), and never completes. Meaning comes from the
 *                band it currently sits in rather than from a finish line.
 * - `steps`:     counts to a target exactly as `progress` does, but is drawn as
 *                that many discrete steps, any of which the GM may name. A label
 *                belongs to its own number only — it does not carry forward to
 *                the numbers above it, which is what separates this mode from
 *                `threshold`.
 */
export const TRACK_MODES = Object.freeze({
  PROGRESS: "progress",
  THRESHOLD: "threshold",
  STEPS: "steps"
});

/** Localization keys for the mode choices, keyed by stored value. */
export const TRACK_MODE_LABELS = Object.freeze({
  [TRACK_MODES.PROGRESS]: "PVC.Mode.Progress",
  [TRACK_MODES.THRESHOLD]: "PVC.Mode.Threshold",
  [TRACK_MODES.STEPS]: "PVC.Mode.Steps"
});

/**
 * How a track is *drawn*. Stored per track, and deliberately separate from
 * {@link TRACK_MODES}: mode decides how a track counts, display decides how the
 * result is shown. Every combination of the two is valid, and changing one
 * never changes the other.
 *
 * - `standard`: the readout each mode already had — a figure and a bar (or the
 *               world's optional ring) for progress, the rail for a threshold
 *               ladder, the strip for steps.
 * - `circle`:   a ring of seats, one per position, with a rune adrift outside
 *               it for every seat not yet earned. What a seat *is* comes from
 *               the mode: one target step on a progress or steps track, one
 *               rung on a threshold ladder.
 */
export const TRACK_DISPLAYS = Object.freeze({
  STANDARD: "standard",
  CIRCLE: "circle"
});

/** Localization keys for the display choices, keyed by stored value. */
export const TRACK_DISPLAY_LABELS = Object.freeze({
  [TRACK_DISPLAYS.STANDARD]: "PVC.Display.Standard",
  [TRACK_DISPLAYS.CIRCLE]: "PVC.Display.Circle"
});

/**
 * How a threshold band reads relative to the track's starting value. Derived,
 * never stored: a band below the start is pressure, above it is progress, and
 * the band containing the start is the status quo.
 */
export const BAND_TONES = Object.freeze({
  NEGATIVE: "negative",
  NEUTRAL: "neutral",
  POSITIVE: "positive"
});

/** Track polarity. Stored per track; positive is the default. */
export const TRACK_TYPES = Object.freeze({
  POSITIVE: "positive",
  NEGATIVE: "negative"
});

/** Localization keys for the polarity choices, keyed by stored value. */
export const TRACK_TYPE_LABELS = Object.freeze({
  [TRACK_TYPES.POSITIVE]: "PVC.Type.Positive",
  [TRACK_TYPES.NEGATIVE]: "PVC.Type.Negative"
});

/** Valid overlay anchors. Keys must match the CSS modifier classes. */
export const OVERLAY_POSITIONS = Object.freeze({
  "top-center": "PVC.Settings.OverlayPosition.TopCenter",
  "top-left": "PVC.Settings.OverlayPosition.TopLeft",
  "top-right": "PVC.Settings.OverlayPosition.TopRight",
  "bottom-center": "PVC.Settings.OverlayPosition.BottomCenter"
});

/** Hard bounds. Counts and list size are clamped to these to keep the UI and data sane. */
export const LIMITS = Object.freeze({
  MIN_TARGET: 1,
  MAX_TARGET: 100,
  MAX_COUNT: 999,
  MAX_TITLE_LENGTH: 80,
  MAX_TRACKS: 10,
  /**
   * Hard bounds for a threshold track's value and for its own min/max. Unlike
   * MAX_COUNT these are symmetric: a threshold track may sit below zero.
   */
  MIN_VALUE: -999,
  MAX_VALUE: 999,
  /** Rungs on one track's ladder. Beyond this the ladder stops being readable. */
  MAX_THRESHOLDS: 12,
  MAX_THRESHOLD_LABEL: 60,
  MAX_THRESHOLD_DESCRIPTION: 240,
  /**
   * Named steps on one step track. A step label is a milestone, not a scale:
   * ten of them on a track is already a dense clock, and the strip has to stay
   * readable at the HUD's narrowest width.
   */
  MAX_STEP_LABELS: 10,
  /**
   * Longest target that is still drawn as one pip per step. Past this the pips
   * are thinner than the gaps between them, so the strip falls back to a bar
   * with a tick at each labelled step.
   */
  MAX_STEP_PIPS: 20,
  /** Overlay surface width, driven by the resize grip. */
  MIN_OVERLAY_WIDTH: 264,
  MAX_OVERLAY_WIDTH: 1200,
  /** Control panel window, enforced in CSS and in `setPosition`. */
  MIN_PANEL_WIDTH: 380,
  MIN_PANEL_HEIGHT: 320,
  /**
   * Threshold editor window, enforced the same way. Wider than the panel's
   * floor because a rung is a row of four fields that has to stay readable, and
   * shorter because the editor is a list: it scrolls rather than reflowing, so
   * it stays usable at a height that would leave the panel unusable.
   */
  MIN_EDITOR_WIDTH: 420,
  MIN_EDITOR_HEIGHT: 260,
  /**
   * Rune editor window. Narrower than the ladder editor because a seat is a row
   * of two short fields rather than four, and the same height floor because it
   * is a scrolling list for the same reason.
   */
  MIN_RUNE_EDITOR_WIDTH: 360,
  MIN_RUNE_EDITOR_HEIGHT: 260,
  /**
   * Longest glyph a GM may put in a seat. More than one character so a ligature,
   * a combining mark or a surrogate pair still fits, and short enough that a
   * seat cannot be turned into a word the circle has no room to draw.
   */
  MAX_RUNE_GLYPH: 4,
  /** Longest name a GM may give a seat. Matches a threshold band's label. */
  MAX_RUNE_LABEL: 60
});

/**
 * Geometry of the SVG progress ring. The circle is drawn in a 100x100 viewBox so
 * the ring scales purely through CSS; only the dash offset is computed in JS.
 */
export const RING = Object.freeze({
  RADIUS: 42,
  CIRCUMFERENCE: Number((2 * Math.PI * 42).toFixed(3))
});

/**
 * Geometry of the rune circle. Radii are percentages of the plate's own box, so
 * the whole figure scales through CSS exactly as the ring does; only the seat
 * positions are computed in JS, by {@link runeSeats}.
 */
export const CIRCLE = Object.freeze({
  /** The ring earned runes settle onto. */
  SEAT_RADIUS: 34,
  /** Where an unearned rune hangs, before its per-seat jitter is applied. */
  ADRIFT_RADIUS: 44,
  /**
   * Most seats a circle may hold, and therefore the largest track that can be
   * drawn as one. It is the length of {@link RUNE_GLYPHS} on purpose: past the
   * last stave a seat would have no glyph of its own, and clamping the count
   * instead would break the metaphor outright, because one rune would stop
   * meaning one success.
   */
  MAX_POSITIONS: 24
});

/**
 * The default glyph for each seat: the 24 staves of the Elder Futhark, in their
 * traditional order, so a circle is legible with no configuration at all — seat
 * n gets stave n.
 *
 * The staves are stored as the characters themselves, and the Latin
 * transliteration beside each row is what makes that safe to edit: an editor
 * without Runic coverage draws the whole list as identical boxes, and the
 * comment is then the only way to tell which box is which.
 *
 * They are rendered as text with an explicit font stack (see the stylesheet)
 * rather than as glyph paths, so a *host* without Runic coverage degrades to a
 * visible box rather than to nothing — and the GM can override any seat
 * regardless, which is the real answer for a table whose browser cannot draw
 * them.
 */
export const RUNE_GLYPHS = Object.freeze([
  "ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", // f  u  th a  r  k
  "ᚷ", "ᚹ", "ᚺ", "ᚾ", "ᛁ", "ᛃ", // g  w  h  n  i  j
  "ᛇ", "ᛈ", "ᛉ", "ᛊ", "ᛏ", "ᛒ", // ei p  z  s  t  b
  "ᛖ", "ᛗ", "ᛚ", "ᛜ", "ᛞ", "ᛟ"  // e  m  l  ng d  o
]);

/**
 * A deterministic pseudo-random number in 0..1 for one seat.
 *
 * Deterministic is the whole requirement: an unearned rune has to hang in the
 * same spot on every render, or it would jump around the plate each time the
 * counter redraws. Seeding from the seat index rather than from `Math.random`
 * is what buys that, and it costs nothing — the scatter only has to look
 * disordered, not be unpredictable.
 *
 * @param {number} index
 * @param {number} salt Distinguishes the several values one seat needs.
 * @returns {number} 0..1
 */
function seatNoise(index, salt) {
  const n = Math.sin((index + 1) * salt) * 10000;
  return n - Math.floor(n);
}

/**
 * Where each seat of a rune circle sits, and where its rune hangs until it is
 * earned.
 *
 * Seats run clockwise from twelve o'clock, evenly spaced, as percentages of the
 * plate. The adrift position shares its seat's angle — so a rune visibly slides
 * *inward* to the place it belongs — offset by a jitter derived from the index,
 * plus a small rotation, so the unearned runes read as scattered rather than as
 * a tidy second ring.
 *
 * @param {number} count How many seats the circle has.
 * @returns {Array<{index: number, left: number, top: number, adriftLeft: number,
 *   adriftTop: number, rotation: number}>}
 */
export function runeSeats(count) {
  const seats = Math.max(0, Math.min(CIRCLE.MAX_POSITIONS, Math.trunc(Number(count) || 0)));
  const out = [];

  for (let index = 0; index < seats; index++) {
    // -90 degrees puts seat 0 at twelve o'clock; the sweep then runs clockwise.
    const angle = (-90 + (index * 360) / seats) * (Math.PI / 180);
    // +/- 15 degrees of angular drift and +/- 5 points of radial drift, both
    // fixed per seat.
    const driftAngle = angle + (seatNoise(index, 12.9898) - 0.5) * 0.52;
    const driftRadius = CIRCLE.ADRIFT_RADIUS + (seatNoise(index, 78.233) - 0.5) * 10;

    out.push({
      index,
      left: Number((50 + CIRCLE.SEAT_RADIUS * Math.cos(angle)).toFixed(2)),
      top: Number((50 + CIRCLE.SEAT_RADIUS * Math.sin(angle)).toFixed(2)),
      adriftLeft: Number((50 + driftRadius * Math.cos(driftAngle)).toFixed(2)),
      adriftTop: Number((50 + driftRadius * Math.sin(driftAngle)).toFixed(2)),
      rotation: Number(((seatNoise(index, 43.7585) - 0.5) * 44).toFixed(1))
    });
  }

  return out;
}

/**
 * The immutable default shape of a single track. Any stored value is merged
 * onto a clone of this object with `insertKeys: false`, so unknown keys are
 * discarded and missing keys are backfilled.
 * @type {Readonly<object>}
 */
export const DEFAULT_TRACK = Object.freeze({
  schema: SCHEMA_VERSION,
  id: "",
  active: false,
  title: "",
  /** One of {@link TRACK_MODES}. Decides how `current` is bounded and read. */
  mode: TRACK_MODES.PROGRESS,
  /**
   * One of {@link TRACK_DISPLAYS}. How the track is drawn; never how it is
   * counted. Nothing that reads or writes a value looks at this field.
   */
  display: TRACK_DISPLAYS.STANDARD,
  /**
   * Rune circle: per-seat overrides, `{key, glyph, label}`. An empty list means
   * every seat uses its default stave, which is the normal case.
   *
   * `key` identifies a seat across re-renders and edits: the rung's id on a
   * threshold track, the ordinal index as a string ("0", "1", ...) on any other.
   * Keying threshold seats by rung id rather than by position is what stops an
   * override reassigning itself when the GM inserts a rung into the middle of a
   * ladder — the seat the GM named keeps its name and simply moves.
   *
   * Kept in every mode and under every display, for the same reason the ladder
   * and the step labels are: switching how a track is drawn must not throw away
   * wording the GM wrote.
   */
  runes: [],
  /** One of {@link TRACK_TYPES}. Per-track, never global. */
  type: TRACK_TYPES.POSITIVE,
  /** Current value. Never negative in progress mode; may be in threshold mode. */
  current: 0,
  /** Progress needed to complete the track. Progress mode only. */
  target: 6,
  /**
   * Threshold mode: the value the track opens at and returns to on reset, and
   * the reference point every band's tone is measured against.
   */
  start: 0,
  /** Threshold mode: inclusive floor and ceiling for `current`. */
  min: 0,
  max: 12,
  /**
   * Threshold mode: the GM's ladder, `{id, value, label, description, announce}`.
   * Sanitization sorts it ascending by value and drops duplicate values, so the
   * band lookup can walk it in order.
   *
   * Kept even while the track is in progress mode: switching mode is a display
   * decision, and silently discarding a ladder the GM wrote would be worse than
   * carrying a few unused bytes.
   */
  thresholds: [],
  /**
   * Threshold mode: id of the band `current` sits in, or null when it is below
   * every threshold. Derived on every read, but *stored* as well, because the
   * announcement compares the band before a change with the band after it.
   */
  band: null,
  /** Threshold mode: announce band changes in chat. Per-track GM decision. */
  announceThresholds: true,
  /** Threshold mode: show players the whole ladder, not just their own band. */
  revealLadder: false,
  /**
   * Steps mode: the GM's named steps, `{id, value, label, description, announce}`.
   * Same row shape as a threshold rung, and sanitized by the same rules — sorted
   * ascending, one label per number — but read by exact match rather than by
   * range, and kept while the track is in another mode for the same reason the
   * ladder is.
   */
  steps: [],
  /**
   * Steps mode: id of the label sitting exactly on `current`, or null when this
   * number is unnamed. Derived on every read, and stored for the same reason
   * `band` is: reaching a label is announced by comparing before with after.
   */
  step: null,
  /** Steps mode: announce reaching a named step in chat. Per-track GM decision. */
  announceSteps: true,
  /** Steps mode: show players the names of steps they have not reached yet. */
  revealSteps: false,
  visibleToPlayers: true,
  /** Post a chat card when this track's progress changes. Gated by the world setting. */
  postToChat: true,
  status: STATUS.RUNNING,
  /**
   * The most recent counter change, shown in the HUD footer.
   * `{ delta: number, time: number }`
   */
  lastChange: { delta: 0, time: 0 },
  /**
   * Fields carried over from a pre-3.0 track, kept verbatim so a downgrade or a
   * manual repair can recover them. Never read by the running module.
   */
  legacy: null
});

/**
 * Clamp a value into an integer range. Uses a local implementation rather than
 * Math.clamp so the module does not depend on a specific core helper.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clampInt(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.round(n)));
}

/**
 * Percentage of the target reached, clamped to 0-100 for display purposes.
 * A target of 0 (which sanitization prevents, but stored data may still carry)
 * yields 0 rather than dividing by zero.
 * @param {number} current
 * @param {number} target
 * @returns {number}
 */
export function progressPercent(current, target) {
  if (!(Number(target) > 0)) return 0;
  return Math.min(100, Math.max(0, (Number(current) / Number(target)) * 100));
}

/**
 * The `stroke-dashoffset` that renders the given percentage on the ring.
 * 0% leaves the full circumference offset (empty ring), 100% leaves none.
 * @param {number} percent 0-100
 * @returns {number}
 */
export function ringDashOffset(percent) {
  const clamped = Math.min(100, Math.max(0, Number(percent) || 0));
  return Number((RING.CIRCUMFERENCE * (1 - clamped / 100)).toFixed(3));
}

/**
 * The threshold band a value sits in: the highest threshold whose value it has
 * reached, or null when it is below every threshold.
 *
 * Relies on the list being sorted ascending, which sanitization guarantees, so
 * the walk can stop at the first threshold the value has not reached.
 *
 * @param {number} value
 * @param {Array<{id: string, value: number}>} thresholds
 * @returns {object|null}
 */
export function resolveBand(value, thresholds) {
  const list = Array.isArray(thresholds) ? thresholds : [];
  const n = Number(value);
  if (!Number.isFinite(n)) return null;

  let found = null;
  for (const threshold of list) {
    if (n < Number(threshold.value)) break;
    found = threshold;
  }
  return found;
}

/**
 * The step labels that are actually on a track's strip: those from 1 up to its
 * target.
 *
 * A label past the target is kept in storage on purpose — a GM who lowers the
 * target still owns the wording they wrote, and raising it again brings the step
 * back — but it is off the clock while the target stands where it does, and the
 * step editor tells the GM exactly that.
 *
 * Filtering has to happen on the way *out*, at every read, because `current` is
 * not bounded by `target`: the "allow progress beyond target" setting lets it
 * climb past, and lowering the target leaves an already-higher value where it
 * was. Without this, a value of 9 on a six-step clock would resolve a label the
 * strip has no pip for, and the editor's "can never be reached" would be a lie.
 *
 * This is the single definition of "reachable step" that the strip, the stored
 * `step` id, the announcements and the public API all read, so none of them can
 * disagree about which labels exist.
 *
 * @param {Array<{value: number}>} steps
 * @param {number} target
 * @returns {object[]}
 */
export function reachableSteps(steps, target) {
  const list = Array.isArray(steps) ? steps : [];
  const ceiling = Number(target);
  if (!Number.isFinite(ceiling)) return [];
  return list.filter((step) => {
    const value = Number(step?.value);
    return Number.isFinite(value) && value >= 1 && value <= ceiling;
  });
}

/**
 * The step label sitting exactly on a value, or null when that number is unnamed.
 *
 * Deliberately an exact match rather than a reuse of {@link resolveBand}: a band
 * owns every number from its rung up to the next one, while a step label names
 * one number and says nothing about the ones around it. That difference is the
 * whole reason steps mode exists alongside threshold mode.
 *
 * Callers pass the list from {@link reachableSteps}, never the raw stored array:
 * a label off the strip must not resolve.
 *
 * @param {number} value
 * @param {Array<{id: string, value: number}>} steps
 * @returns {object|null}
 */
export function resolveStep(value, steps) {
  const list = Array.isArray(steps) ? steps : [];
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return list.find((step) => Number(step.value) === n) ?? null;
}

/**
 * How a band reads relative to where the track started.
 *
 * Deliberately derived rather than configured: a GM who sets the start to 6 and
 * thresholds at 0/3/6/9/12 has already said which end is which, and asking them
 * to tag each rung again would be a second chance to contradict themselves.
 *
 * A value below every threshold is worse than the lowest band, so it reads
 * negative.
 *
 * @param {{value: number}|null} threshold
 * @param {number} start
 * @returns {string} One of {@link BAND_TONES}.
 */
export function bandTone(threshold, start) {
  if (!threshold) return BAND_TONES.NEGATIVE;
  const value = Number(threshold.value);
  const base = Number(start);
  if (!Number.isFinite(value) || !Number.isFinite(base)) return BAND_TONES.NEUTRAL;
  if (value > base) return BAND_TONES.POSITIVE;
  if (value < base) return BAND_TONES.NEGATIVE;
  return BAND_TONES.NEUTRAL;
}

/**
 * Where a value sits on the `min`..`max` ladder, as a percentage, for drawing.
 * A degenerate range (max not above min) yields 0 rather than dividing by zero.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number} 0-100
 */
export function ladderPercent(value, min, max) {
  const lo = Number(min);
  const hi = Number(max);
  if (!Number.isFinite(lo) || !Number.isFinite(hi) || hi <= lo) return 0;
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, ((n - lo) / (hi - lo)) * 100));
}

/**
 * Generate a short unique id for a new track.
 * @returns {string}
 */
export function generateId() {
  return foundry.utils.randomID(12);
}

/**
 * Debug-only console logging. Never used as the sole feedback channel for users.
 * @param {...any} args
 */
export function log(...args) {
  let debug = false;
  try {
    debug = game.settings.get(MODULE_ID, SETTINGS.DEBUG) === true;
  } catch {
    debug = false;
  }
  if (debug) console.log(`[${MODULE_ID}]`, ...args);
}

/** @param {...any} args */
export function warn(...args) {
  console.warn(`[${MODULE_ID}]`, ...args);
}

/**
 * Log an error. The stack trace is only surfaced when debug logging is enabled.
 * @param {string} message
 * @param {Error} [err]
 */
export function logError(message, err) {
  console.error(`[${MODULE_ID}] ${message}`);
  if (err) log(err);
}
