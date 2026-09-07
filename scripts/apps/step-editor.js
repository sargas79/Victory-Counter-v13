/**
 * The step label editor: one window per track, listing its named steps as
 * editable rows.
 *
 * Its own window for the same reason the ladder editor is one — ten rows of
 * four fields would make a single track card taller than the control panel and
 * push every other track out of view — and it behaves the same way, so a GM who
 * has used one already knows this one: edits are held in a local draft and only
 * written on Save, and a mistake is one Cancel away rather than one Undo away.
 *
 * What differs from the ladder editor is the meaning of a row, and the window
 * says so: a label names *its own step and no other*, so there is no tone to
 * derive against a starting value, and a label sitting past the track's target
 * is unreachable and is flagged rather than silently kept.
 *
 * @module victory-counter/apps/step-editor
 */

import { LIMITS, MODULE_ID, generateId } from "../constants.js";
import { getTrack, sanitizeSteps, setTrackSteps } from "../state.js";
import { readRungRows } from "./rung-draft.js";
import { clampToMinimum, refitToViewport } from "./window-fit.js";

const { ApplicationV2, DialogV2, HandlebarsApplicationMixin } = foundry.applications.api;

/** Minimum size for this window, shared by the CSS and by `setPosition`. */
const BOUNDS = {
  minWidth: LIMITS.MIN_EDITOR_WIDTH,
  minHeight: LIMITS.MIN_EDITOR_HEIGHT
};

export class StepEditor extends HandlebarsApplicationMixin(ApplicationV2) {
  /** @override */
  static DEFAULT_OPTIONS = {
    id: "pvc-step-editor",
    tag: "form",
    // `pvc-panel` and `pvc-threshold-editor` are both carried deliberately: this
    // is the same kind of window as the control panel and is laid out exactly
    // like the ladder editor, so it wants both sets of rules. The
    // `pvc-step-editor` class layers only what is genuinely different on top,
    // which is what stops the two editors drifting apart visually.
    classes: ["pvc", "pvc-panel", "pvc-threshold-editor", "pvc-step-editor"],
    window: {
      title: "PVC.Step.EditorTitle",
      icon: "fa-solid fa-list-ol",
      resizable: true,
      minimizable: true
    },
    position: { width: 680, height: 600 },
    form: {
      // Saving is an explicit button; there is no native submit path.
      closeOnSubmit: false,
      submitOnChange: false
    },
    actions: {
      addRow: this.onAddRow,
      removeRow: this.onRemoveRow,
      saveSteps: this.onSave
    }
  };

  /** @override */
  static PARTS = {
    main: { template: `modules/${MODULE_ID}/templates/step-editor.hbs` }
  };

  /**
   * @param {string} trackId Track whose labels are being edited.
   * @param {object} [options]
   */
  constructor(trackId, options = {}) {
    super(options);
    this.trackId = trackId;
    /**
     * Working copy of the label list. Null until the first render seeds it from
     * the stored track.
     * @type {object[]|null}
     */
    this.draft = null;
  }

  /* ---------------------------------------- */

  /** @override */
  get title() {
    const track = getTrack(this.trackId);
    return game.i18n.format("PVC.Step.EditorTitleFor", {
      title: track?.title || game.i18n.localize("PVC.DefaultTitle")
    });
  }

  /** @override */
  async _prepareContext(_options) {
    const track = getTrack(this.trackId);
    if (!track) return { missing: true, limits: LIMITS };

    // Seed once from storage; afterwards the draft is the source of truth, so a
    // re-render caused by adding a row does not discard unsaved typing.
    if (!this.draft) this.draft = foundry.utils.deepClone(track.steps);

    // Sorted for display only, and on render rather than on every keystroke, so
    // rows never reshuffle under the cursor mid-edit.
    const rows = [...this.draft]
      .sort((a, b) => Number(a.value) - Number(b.value))
      .map((row) => {
        const value = Number(row.value);
        return {
          ...row,
          // Flagged rather than dropped: a GM who lowers the target still owns
          // the wording they wrote, and raising it again brings the step back.
          unreachable: !Number.isFinite(value) || value < 1 || value > track.target,
          reached: Number.isFinite(value) && value <= track.current
        };
      });

    return {
      missing: false,
      track,
      rows,
      limits: LIMITS,
      atMax: rows.length >= LIMITS.MAX_STEP_LABELS,
      empty: rows.length === 0
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
    // Adding or removing a label changes how tall the list wants to be. Refit so
    // the window stays on screen; the list scrolls inside it rather than the
    // window growing past the bottom of the monitor.
    this.#refit();
  }

  /**
   * Keep the window inside the viewport. Shared with the control panel and the
   * ladder editor, which grow the same way — see `window-fit.js`.
   */
  #refit() {
    refitToViewport(this, BOUNDS);
  }

  /* ---------------------------------------- */
  /*  Draft handling                          */
  /* ---------------------------------------- */

  /**
   * Read every row back out of the DOM into the draft, so text typed but not yet
   * saved survives adding or removing a row. See `rung-draft.js`.
   */
  syncDraft() {
    if (!this.element) return;
    this.draft = readRungRows(this.element, "[data-step-row]");
  }

  /* ---------------------------------------- */
  /*  Actions                                 */
  /* ---------------------------------------- */

  /**
   * Append an empty label.
   *
   * The new label lands on the first step that does not already have one, which
   * for a GM naming steps in order is the next one they meant, and which cannot
   * collide with an existing row.
   *
   * On a track shorter than the cap every step can already be named, and there
   * is then no honest value to open a row on: whatever it landed on would be a
   * duplicate, dropped on save with a notification the GM did not earn. That
   * case is refused up front instead.
   *
   * @this {StepEditor}
   */
  static async onAddRow() {
    this.syncDraft();
    const track = getTrack(this.trackId);
    if (!track) return;

    if (this.draft.length >= LIMITS.MAX_STEP_LABELS) {
      ui.notifications.warn(
        game.i18n.format("PVC.Notify.MaxSteps", { max: LIMITS.MAX_STEP_LABELS })
      );
      return;
    }

    const taken = new Set(this.draft.map((row) => Number(row.value)));
    let next = 0;
    for (let step = 1; step <= track.target; step++) {
      if (!taken.has(step)) {
        next = step;
        break;
      }
    }

    if (!next) {
      ui.notifications.warn(
        game.i18n.format("PVC.Notify.EveryStepNamed", { target: track.target })
      );
      return;
    }

    this.draft.push({
      id: generateId(),
      value: next,
      label: "",
      description: "",
      announce: true
    });
    await this.render();
  }

  /**
   * @this {StepEditor}
   * @param {PointerEvent} event
   * @param {HTMLElement}  target
   */
  static async onRemoveRow(event, target) {
    this.syncDraft();
    this.draft = this.draft.filter((row) => row.id !== target.dataset.id);
    await this.render();
  }

  /**
   * Write the labels to the track and close.
   * @this {StepEditor}
   */
  static async onSave() {
    this.syncDraft();

    // Sanitizing here as well as in the state layer is not redundant: it is what
    // lets the confirmation below quote the list the GM is actually about to
    // get, duplicates dropped and rows sorted.
    const clean = sanitizeSteps(this.draft);
    const unnamed = clean.filter((row) => !row.label.trim()).length;

    if (unnamed) {
      const proceed = await DialogV2.confirm({
        window: { title: game.i18n.localize("PVC.Confirm.UnnamedStepsTitle") },
        content: `<p>${game.i18n.format("PVC.Confirm.UnnamedStepsContent", {
          count: unnamed
        })}</p>`,
        rejectClose: false,
        modal: true
      });
      if (!proceed) return;
    }

    const result = await setTrackSteps(this.trackId, this.draft);
    if (!result) return;

    this.draft = null;
    await this.close();
  }

  /* ---------------------------------------- */
  /*  Singleton management                    */
  /* ---------------------------------------- */

  /** @type {StepEditor|null} */
  static #instance = null;

  /**
   * Open the editor for one track, replacing any editor already open for a
   * different one so two label lists can never be edited against one draft.
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
    if (!this.#instance) this.#instance = new StepEditor(trackId);

    await this.#instance.render({ force: true });
    this.#instance.bringToFront?.();
  }

  /** @override */
  async close(options = {}) {
    if (StepEditor.#instance === this) StepEditor.#instance = null;
    return super.close(options);
  }

  /** @returns {Promise<void>} */
  static async teardown() {
    if (this.#instance?.rendered) await this.#instance.close();
    this.#instance = null;
  }
}
