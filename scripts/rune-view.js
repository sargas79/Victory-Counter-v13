/**
 * Presentation helpers for the rune circle.
 *
 * The circle is a *display*, not a mode: it is offered on every track, and what
 * one seat means comes from the mode the track already has. A progress or steps
 * track seats one rune per step of its target; a threshold track seats one per
 * rung of its ladder. Nothing here counts anything — it only decides how a count
 * that already exists is drawn, which is the same contract `threshold-view.js`
 * and `step-view.js` hold for their own halves of the card.
 *
 * Pure view-model construction: nothing in this module reads or writes stored
 * state, and nothing decides *whether* the circle is shown, only how it looks
 * once the caller has decided. {@link drawsCircle} is the one question the
 * callers ask before spreading the result.
 *
 * @module victory-counter/rune-view
 */

import {
  CIRCLE,
  RUNE_GLYPHS,
  TRACK_DISPLAYS,
  TRACK_MODES,
  resolveBand,
  runeSeats
} from "./constants.js";
import { bandDisplayName } from "./threshold-view.js";
import { trackDisplayName } from "./track-view.js";

/**
 * How many seats a track's circle would have.
 *
 * Derived on every read and never stored, so it cannot fall out of step with the
 * ladder or the target it comes from. A threshold track seats its rungs — a
 * ladder is already a list of the positions that matter — and every other mode
 * seats its target, because there a position *is* one step of progress.
 *
 * @param {object} track A sanitized track.
 * @returns {number}
 */
export function runeSeatCount(track) {
  if (track?.mode === TRACK_MODES.THRESHOLD) {
    return Array.isArray(track.thresholds) ? track.thresholds.length : 0;
  }
  const target = Number(track?.target);
  return Number.isFinite(target) ? Math.max(0, Math.trunc(target)) : 0;
}

/**
 * Whether a seat count can be drawn as a circle at all.
 *
 * A track with no positions has no circle to draw, and one with more positions
 * than there are staves would leave seats without a glyph of their own. Both
 * fall back to the standard readout rather than being clamped: clamping would
 * break the metaphor, because one rune would stop meaning one success.
 *
 * @param {number} seats
 * @returns {boolean}
 */
export function circleFits(seats) {
  return Number.isFinite(seats) && seats >= 1 && seats <= CIRCLE.MAX_POSITIONS;
}

/**
 * Whether this track should actually be drawn as a circle right now.
 *
 * Both halves matter: the GM has to have asked for it, *and* the track has to
 * have a seat count the circle can hold. A track that asked and does not fit
 * renders exactly as it did before, and the control panel says why.
 *
 * @param {object} track A sanitized track.
 * @returns {boolean}
 */
export function drawsCircle(track) {
  if (track?.display !== TRACK_DISPLAYS.CIRCLE) return false;
  return circleFits(runeSeatCount(track));
}

/**
 * The stave a seat carries by default: its own, by position.
 * @param {number} index
 * @returns {string}
 */
export function defaultGlyph(index) {
  return RUNE_GLYPHS[index] ?? "";
}

/**
 * The seats of a track's circle, before any display concerns are applied.
 *
 * Split out from {@link buildRuneView} because the rune editor needs exactly
 * this — one row per seat, in circle order, carrying the key an override is
 * filed under — and must not reimplement the mapping from a mode to a list of
 * positions. Two implementations of that mapping is how the editor and the card
 * would come to disagree about which seat the GM just named.
 *
 * @param {object} track A sanitized track.
 * @returns {Array<{index: number, key: string, value: number, defaultLabel: string,
 *   description: string, seated: boolean, active: boolean}>}
 */
export function runeSeatList(track) {
  const current = Number(track?.current) || 0;

  if (track?.mode === TRACK_MODES.THRESHOLD) {
    const band = resolveBand(current, track.thresholds);
    return track.thresholds.map((rung, index) => ({
      index,
      // The rung's own id, so an override survives the GM inserting a rung above
      // or below it. Position would not: every seat after the new one would
      // shift, and each would inherit the name of the seat before it.
      key: String(rung.id),
      value: Number(rung.value),
      defaultLabel: bandDisplayName(rung),
      description: rung.description ?? "",
      seated: current >= Number(rung.value),
      active: Boolean(band) && rung.id === band.id
    }));
  }

  // Progress and steps. Seat n stands for the nth point of progress, so it is
  // earned once the track has reached n. There is no id to key against — the
  // positions are the numbers themselves — so the ordinal is the key.
  const seats = runeSeatCount(track);
  const list = [];
  for (let index = 0; index < seats; index++) {
    const value = index + 1;
    list.push({
      index,
      key: String(index),
      value,
      defaultLabel: game.i18n.format("PVC.Circle.Seat", { index: value }),
      description: "",
      seated: current >= value,
      // The most recent seat filled, so the circle has a leading edge, the way
      // the ladder marks the rung it currently sits in. Overshoot past the
      // target has no seat left to fill, so the last one stays the active one.
      active: value === Math.min(current, seats) && current >= 1
    });
  }
  return list;
}

/**
 * Build the rune-circle half of a track's render context.
 *
 * Spread *over* whatever the track's mode already produced rather than instead
 * of it: a threshold track drawn as a circle still has a band badge and a band
 * description to show, and a step track still has the name of the step it is
 * standing on. `progressLabel` is deliberately left alone — the plate carries
 * its own accessible name in `circleLabel`, because "3 of 8 runes seated"
 * answers a different question from the one the readout above it answers.
 *
 * @param {object} track A sanitized track.
 * @param {object} [options]
 * @param {boolean} [options.revealAll=false] Whether the names of seats the
 *   track has not earned yet may be read. A seat already earned is always named:
 *   its rune is on the plate for everyone to see, and refusing to say what it is
 *   would be a riddle rather than a secret. What this governs is the road ahead,
 *   exactly as `revealLadder` and `revealSteps` do for their own displays.
 * @returns {object}
 */
export function buildRuneView(track, { revealAll = false } = {}) {
  const seats = runeSeatList(track);
  const geometry = runeSeats(seats.length);
  const overrides = new Map(
    (Array.isArray(track.runes) ? track.runes : []).map((rune) => [rune.key, rune])
  );

  const runes = seats.map((seat) => {
    const override = overrides.get(seat.key) ?? null;
    const place = geometry[seat.index];
    const glyph = override?.glyph || defaultGlyph(seat.index);
    const label = override?.label || seat.defaultLabel;
    const named = seat.seated || revealAll;

    return {
      ...seat,
      glyph,
      label: named ? label : "",
      named,
      // Resolved here rather than in the template so the markup carries one pair
      // of coordinates and CSS can transition between them; the template has no
      // arithmetic to do and no state to decide.
      left: seat.seated ? place.left : place.adriftLeft,
      top: seat.seated ? place.top : place.adriftTop,
      // An earned rune sits square in its seat. An unearned one hangs at an
      // angle, so the two states differ by more than position — which is what
      // keeps them apart once the OS has turned the movement itself off.
      rotation: seat.seated ? 0 : place.rotation,
      tooltip: named
        ? seat.description
          ? `${label} — ${seat.description}`
          : label
        : game.i18n.localize("PVC.Circle.Unearned")
    };
  });

  const seated = runes.filter((rune) => rune.seated).length;

  return {
    circle: true,
    runes,
    seatCount: runes.length,
    seatedCount: seated,
    // Handed to the template rather than written into it, exactly as the ring
    // hands down `ring.RADIUS`: the backdrop circle and the seats the runes land
    // on have to share one radius, and a second copy in the markup is how they
    // would come to differ by a pixel nobody could account for.
    seatRadius: CIRCLE.SEAT_RADIUS,
    // Deliberately the whole stored list, not just the overrides that landed on
    // a seat: this is the panel's "N seat(s) renamed" summary, and a GM who
    // rewrote a ladder needs to see that the wording they wrote is still there.
    runeCount: Array.isArray(track.runes) ? track.runes.length : 0,
    circleLabel: game.i18n.format("PVC.Aria.Circle", {
      title: trackDisplayName(track),
      seated,
      seats: runes.length
    })
  };
}
