/**
 * The one piece of row editing the threshold ladder editor, the step label
 * editor and the rune editor genuinely share: reading their rows back out of
 * the DOM into a draft.
 *
 * Both windows hold their edits locally until the GM saves, which means both
 * have to re-read every visible field before any action that re-renders — add a
 * row, remove a row, save — or half-typed text would be thrown away. The two
 * editors differ in bounds, caps, wording and what they save to, but that read
 * is identical, and it is also the only part with a rule worth stating once:
 * fields are addressed by `data-field`, never by `name`.
 *
 * @module victory-counter/apps/rung-draft
 */

/**
 * Read every row in an editor back into a plain draft array.
 *
 * `data-field` rather than `name` is deliberate: a dozen rows of identically
 * named inputs would form an ambiguous form submission, and neither editor is
 * ever submitted natively — saving is an explicit button.
 *
 * Values are returned exactly as typed. Coercion and clamping belong to the
 * state layer's sanitizers, which every write path funnels through anyway.
 *
 * @param {HTMLElement|null} root     The editor's root element.
 * @param {string}           selector Row selector, e.g. `"[data-step-row]"`.
 * @returns {Array<{id: string, value: string, label: string, description: string, announce: boolean}>}
 */
export function readRungRows(root, selector) {
  if (!root) return [];

  return [...root.querySelectorAll(selector)].map((row) => ({
    id: row.dataset.id,
    value: row.querySelector('[data-field="value"]')?.value,
    label: row.querySelector('[data-field="label"]')?.value,
    description: row.querySelector('[data-field="description"]')?.value,
    // Missing checkbox means the row was rendered without the control at all,
    // which should read as "still announcing" rather than as "muted".
    announce: row.querySelector('[data-field="announce"]')?.checked !== false
  }));
}

/**
 * Read every seat row of the rune editor back into a plain draft array.
 *
 * A separate reader rather than a shape {@link readRungRows} could be widened
 * to cover, because a rune override genuinely is not a rung: it has no value,
 * no description and no announcement, and it is filed under the key of a seat
 * that already exists rather than under an id of its own. Merging the two would
 * mean every caller sifting fields that are always absent for one of them.
 *
 * The `data-field` rule above applies unchanged, and for the same reason.
 *
 * Values are returned exactly as typed; trimming, truncation and the decision
 * that a row saying nothing is not an override belong to `sanitizeRunes`.
 *
 * @param {HTMLElement|null} root     The editor's root element.
 * @param {string}           selector Row selector, e.g. `"[data-rune-row]"`.
 * @returns {Array<{key: string, glyph: string, label: string}>}
 */
export function readRuneRows(root, selector) {
  if (!root) return [];

  return [...root.querySelectorAll(selector)].map((row) => ({
    key: row.dataset.key,
    glyph: row.querySelector('[data-field="glyph"]')?.value,
    label: row.querySelector('[data-field="label"]')?.value
  }));
}
