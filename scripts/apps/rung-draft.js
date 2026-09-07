/**
 * The one piece of row editing the threshold ladder editor and the step label
 * editor genuinely share: reading their rows back out of the DOM into a draft.
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
