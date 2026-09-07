/**
 * The rune editor: one window per track, listing the seats of its circle so the
 * GM can replace a seat's stave, its name, or both.
 *
 * Its own window for the same reason the ladder and step editors are — up to 24
 * rows would make a single track card taller than the control panel — and it
 * behaves the same way, so a GM who has used one already knows this one: edits
 * are held in a local draft and written only on Save, and a mistake is one
 * Cancel away rather than one Undo away.
 *
 * What differs from those two editors is what a row *is*, and the window says
 * so. A rung or a label is a thing the GM creates; a seat already exists, put
 * there by the track's target or by its ladder. So there is no Add and no
 * Remove here: the rows are the circle's own positions, and a row left blank is
 * not an empty entry to be flagged but a seat keeping its default — which is
 * also how an override is cleared.
 *
 * @module victory-counter/apps/rune-editor
 */

import { CIRCLE, LIMITS, MODULE_ID } from "../constants.js";
import { getTrack, sanitizeRunes, setTrackRunes } from "../state.js";
import { circleFits, defaultGlyph, runeSeatCount, runeSeatList } from "../rune-view.js";
import { readRuneRows } from "./rung-draft.js";
import { clampToMinimum, refitToViewport } from "./window-fit.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/** Minimum size for this window, shared by the CSS and by `setPosition`. */
const BOUNDS = {
  minWidth: LIMITS.MIN_RUNE_EDITOR_WIDTH,
  minHeight: LIMITS.MIN_RUNE_EDITOR_HEIGHT
};

export class RuneEditor extends HandlebarsApplicationMixin(ApplicationV2) {
  /** @override */
  static DEFAULT_OPTIONS = {
    id: "pvc-rune-editor",
    tag: "form",
    // `pvc-panel` and `pvc-threshold-editor` are carried deliberately, exactly as
    // the step editor carries them: this is the same kind of window as the
    // control panel and is laid out like the other two editors, so it wants both
    // sets of rules. `pvc-rune-editor` layers on only what is genuinely
    // different, which is what stops the three drifting apart visually.
    classes: ["pvc", "pvc-panel", "pvc-threshold-editor", "pvc-rune-editor"],
    window: {
      title: "PVC.Circle.EditorTitle",
      icon: "fa-solid fa-circle-nodes",
      resizable: true,
      minimizable: true
    },
    position: { width: 520, height: 600 },
    form: {
      // Saving is an explicit button; there is no native submit path.
      closeOnSubmit: false,
      submitOnChange: false
    },
    actions: {
      resetRow: this.onResetRow,
      saveRunes: this.onSave
    }
  };

  /** @override */
  static PARTS = {
    main: { template: `modules/${MODULE_ID}/templates/rune-editor.hbs` }
  };

  /**
   * @param {string} trackId Track whose seats are being edited.
   * @param {object} [options]
   */
  constructor(trackId, options = {}) {
    super(options);
    this.trackId = trackId;
    /**
     * Working copy of the override list, keyed by seat. Null until the first
     * render seeds it from the stored track.
     * @type {object[]|null}
     */
    this.draft = null;
  }

  /* ---------------------------------------- */

  /** @override */
  get title() {
    const track = getTrack(this.trackId);
    return game.i18n.format("PVC.Circle.EditorTitleFor", {
      title: track?.title || game.i18n.localize("PVC.DefaultTitle")
    });
  }

  /** @override */
  async _prepareContext(_options) {
    const track = getTrack(this.trackId);
    if (!track) return { missing: true, limits: LIMITS };

    // Seed once from storage; afterwards the draft is the source of truth, so a
    // re-render never discards unsaved typing.
    if (!this.draft) this.draft = foundry.utils.deepClone(track.runes);

    const seats = runeSeatCount(track);
    const fits = circleFits(seats);
    const overrides = new Map(this.draft.map((rune) => [rune.key, rune]));

    // One row per seat the circle actually has. The list comes from the same
    // function the card builds its runes from, so the row a GM types into and
    // the rune that changes are guaranteed to be the same seat.
    const rows = fits
      ? runeSeatList(track).map((seat) => {
          const override = overrides.get(seat.key) ?? null;
          return {
            ...seat,
            fallbackGlyph: defaultGlyph(seat.index),
            glyph: override?.glyph ?? "",
            label: override?.label ?? "",
            customized: Boolean(override?.glyph || override?.label)
          };
        })
      : [];

    // Overrides filed under a seat this track no longer has: a rung the GM
    // deleted, or a seat past a lowered target. They are kept rather than
    // dropped — putting the rung back restores the wording with it — but the GM
    // is told they exist, because otherwise "3 seats customized" on the panel
    // would count rows this window does not show.
    const live = new Set(rows.map((row) => row.key));
    const orphaned = this.draft.filter((rune) => !live.has(rune.key)).length;

    return {
      missing: false,
      track,
      rows,
      fits,
      seats,
      orphaned,
      limits: LIMITS,
      maxPositions: CIRCLE.MAX_POSITIONS
    };
  }

  /* ---------------------------------------- */
  /*  Sizing                                  */
  /* ---------------------------------------- */

  /**
   * Enforce the minimum window size on every programmatic and drag-driven
   * resize, so the persisted position matches what CSS will actually render.
   * @override
   * @param {object} [position]
   * @returns {object}
   */
  setPosition(position = {}) {
    return super.setPosition(clampToMinimum(position, BOUNDS));
  }

  /** @override */
  _onRender(context, options) {
    super._onRender(context, options);
    this.#refit();
  }

  /**
   * Keep the window inside the viewport. Shared with the control panel and the
   * other two editors, which grow the same way — see `window-fit.js`.
   */
  #refit() {
    refitToViewport(this, BOUNDS);
  }

  /* ---------------------------------------- */
  /*  Draft handling                          */
  /* ---------------------------------------- */

  /**
   * Read every visible seat row back into the draft, so text typed but not yet
   * saved survives an action that re-renders.
   *
   * Two rules, and the order they are applied in is what makes them work
   * together:
   *
   * 1. Rows the window is not showing are carried through untouched. An
   *    override whose seat is gone has no row to be read from, so rebuilding the
   *    draft from the visible rows alone would delete it the first time the GM
   *    saved anything at all. See `_prepareContext` for why those are kept.
   * 2. Only rows that actually override something are kept. A blank row is a
   *    seat using its default, which is indistinguishable from having no entry —
   *    and storing one anyway would make the draft disagree with `sanitizeRunes`
   *    about what an override is. That disagreement is visible: if the track's
   *    seats change while this window is open, a blank entry for a seat that has
   *    since gone would be counted as an orphaned *customized* seat and reported
   *    to the GM as wording they never wrote.
   *
   * The key set is built from every visible row, *before* the blanks are
   * dropped, which is the part that keeps rule 2 from undoing rule 1's job: a
   * row the GM has just cleared still suppresses the stored override it came
   * from, rather than letting it be carried back in.
   *
   * The invariant this maintains is that the draft holds only real overrides —
   * true of the seed too, since a stored list has already been through
   * `sanitizeRunes`.
   */
  syncDraft() {
    if (!this.element) return;
    const visible = readRuneRows(this.element, "[data-rune-row]");
    const onScreen = new Set(visible.map((row) => row.key));
    const overriding = visible.filter(
      (row) => String(row.glyph ?? "").trim() || String(row.label ?? "").trim()
    );
    const carried = (this.draft ?? []).filter((rune) => !onScreen.has(rune.key));
    this.draft = [...overriding, ...carried];
  }

  /* ---------------------------------------- */
  /*  Actions                                 */
  /* ---------------------------------------- */

  /**
   * Return one seat to its default stave and name.
   *
   * Clearing both fields by hand does exactly the same thing — a row saying
   * nothing is not stored — so this is a convenience, not a second mechanism.
   *
   * @this {RuneEditor}
   * @param {PointerEvent} event
   * @param {HTMLElement}  target
   */
  static async onResetRow(event, target) {
    this.syncDraft();
    this.draft = this.draft.filter((rune) => rune.key !== target.dataset.key);
    await this.render();
  }

  /**
   * Write the overrides to the track and close.
   *
   * There is no confirmation step here, unlike the two list editors: they warn
   * about rows that will be *dropped*, and nothing is dropped here that the GM
   * did not empty on purpose. Saving a window of untouched rows stores nothing
   * and is a no-op.
   *
   * @this {RuneEditor}
   */
  static async onSave() {
    this.syncDraft();

    const result = await setTrackRunes(this.trackId, sanitizeRunes(this.draft));
    if (!result) return;

    this.draft = null;
    await this.close();
  }

  /* ---------------------------------------- */
  /*  Singleton management                    */
  /* ---------------------------------------- */

  /** @type {RuneEditor|null} */
  static #instance = null;

  /**
   * Open the editor for one track, replacing any editor already open for a
   * different one so two circles can never be edited against one draft.
   * @param {string} trackId
   * @returns {Promise<void>}
   */
  static async open(trackId) {
    if (!game.user.isGM) {
      ui.notifications.warn(game.i18n.localize("PVC.Notify.GMOnly"));
      return;
    }
    if (!getTrack(trackId)) {
      ui.notifications.warn(game.i18n.localize("PVC.Notify.NoTrack"));
      return;
    }

    if (this.#instance && this.#instance.trackId !== trackId) {
      await this.#instance.close();
      this.#instance = null;
    }
    if (!this.#instance) this.#instance = new RuneEditor(trackId);

    await this.#instance.render({ force: true });
    this.#instance.bringToFront?.();
  }

  /** @override */
  async close(options = {}) {
    if (RuneEditor.#instance === this) RuneEditor.#instance = null;
    return super.close(options);
  }

  /** @returns {Promise<void>} */
  static async teardown() {
    if (this.#instance?.rendered) await this.#instance.close();
    this.#instance = null;
  }
}
