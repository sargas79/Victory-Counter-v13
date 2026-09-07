/**
 * Presentation helpers for step tracks.
 *
 * The HUD, the GM control panel and the chat card all have to describe the same
 * strip of steps — how many there are, how far along it the track has come, and
 * which of those steps the GM has given a name. Deriving that in three places is
 * how the three drift apart, so it is derived once here, exactly as
 * `threshold-view.js` does for ladders.
 *
 * Pure view-model construction: nothing in this module reads or writes stored
 * state, and nothing decides *whether* something is shown, only how it looks
 * once the caller has decided.
 *
 * @module victory-counter/step-view
 */

import { LIMITS, progressPercent, resolveStep } from "./constants.js";

/**
 * A step label's display name.
 *
 * A label the GM added but never named still has to call itself something in a
 * chat card, and naming it by its step is the only thing that identifies it.
 *
 * @param {{value: number, label: string}|null} step
 * @returns {string}
 */
export function stepDisplayName(step) {
  if (!step) return "";
  return step.label || game.i18n.format("PVC.Step.UnnamedStep", { value: step.value });
}

/**
 * Whether a step track is short enough to draw as one pip per step.
 *
 * Past the cap the pips would be thinner than the gaps between them at the
 * HUD's narrowest width, so the strip falls back to a bar with a tick at each
 * named step — still a step track, just drawn at a scale that fits.
 *
 * @param {object} track
 * @returns {boolean}
 */
export function isSegmented(track) {
  return Number(track?.target) <= LIMITS.MAX_STEP_PIPS;
}

/**
 * Build the steps half of a track's render context.
 *
 * @param {object} track A sanitized steps-mode track.
 * @param {object} [options]
 * @param {boolean} [options.revealAll=false] Whether names the track has not
 *   reached yet may be read. Steps already reached are named either way: a
 *   milestone the party has hit is not a secret, and hiding it would leave the
 *   card unable to say what just happened. What this governs is the road ahead.
 * @returns {object}
 */
export function buildStepView(track, { revealAll = false } = {}) {
  const target = Number(track.target) || 0;
  const current = Number(track.current) || 0;
  const displayTitle = track.title || game.i18n.localize("PVC.DefaultTitle");

  // Keyed by step so each pip can find its own label in one lookup rather than
  // scanning the list once per pip.
  const byValue = new Map(track.steps.map((step) => [Number(step.value), step]));

  const pips = [];
  for (let index = 1; index <= target; index++) {
    const label = byValue.get(index) ?? null;
    const reached = index <= current;
    // A label is readable once the track has arrived at it, or once the GM has
    // made the whole strip public.
    const named = Boolean(label) && (revealAll || reached);

    pips.push({
      index,
      filled: reached,
      current: index === current,
      labelled: Boolean(label),
      named,
      name: named ? stepDisplayName(label) : "",
      description: named ? label.description : "",
      percent: target > 0 ? (index / target) * 100 : 0,
      tooltip: named
        ? label.description
          ? `${stepDisplayName(label)} (${index}) — ${label.description}`
          : `${stepDisplayName(label)} (${index})`
        : game.i18n.format(
            label ? "PVC.Step.HiddenStep" : "PVC.Step.PlainStep",
            { value: index }
          )
    });
  }

  const label = resolveStep(current, track.steps);
  // Only offered when the whole strip is public. Handing a player the next
  // milestone is exactly what "Show Players Every Label" is off to prevent.
  const next = revealAll
    ? track.steps.find((step) => Number(step.value) > current && Number(step.value) <= target)
    : null;

  return {
    stepped: true,
    segmented: isSegmented(track),
    pips,
    // The strip is drawn from the pips, but the labelled ones are also listed on
    // their own: the caption row under the strip and the bar fallback's ticks
    // both need just those, and filtering in a template is not possible.
    marks: pips.filter((pip) => pip.labelled),
    stepLabel: label ? stepDisplayName(label) : "",
    stepDescription: label?.description ?? "",
    nextLabel: next ? stepDisplayName(next) : "",
    nextValue: next ? Number(next.value) : null,
    stepCount: track.steps.length,
    percent: Math.round(progressPercent(current, target)),
    progressLabel: game.i18n.format(
      label ? "PVC.Aria.NamedStep" : "PVC.Aria.Step",
      {
        title: displayTitle,
        current,
        target,
        step: label ? stepDisplayName(label) : ""
      }
    )
  };
}
