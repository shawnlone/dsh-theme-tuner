// @deepseek-ai/dsh-client-ui-theme-tuner — HOST half
//
// The browser half of this plugin customizes the interface accent / background /
// foreground / contrast. It persists its per-scheme settings through the shared
// Host settings document, so this half only declares that document shape. All
// rendering + token application happens in the client half.
//
// DSH 0.2.0 reworked the settings seam: a Host plugin no longer registers an
// arbitrary settings namespace. The settings service now projects each active
// profile entry's Cordis `Config` schema into a form, addressed by that entry's
// id. The form fields are the ones marked `.volatile()` — a field whose change
// is applied without remounting the entry. So the durable shape of this plugin's
// settings is exactly the `Config` exported below, and its namespace is the
// entry id `theme-tuner` declared in `cordis.patch.yml`.
//
// DSH <= 0.1.x still uses the older contract (`settings.register(ns, schema)`),
// which this half keeps as a fallback so one artifact serves both generations.
import z from "@deepseek-ai/schemastery";

/** Settings namespace / profile entry id owned by this plugin (see cordis.patch.yml). */
const NAMESPACE = "theme-tuner";

/** Default light palette (matches the shipped reference look). */
const LIGHT_DEFAULTS = { accent: "#339cff", bg: "#ffffff", fg: "#1a1c1f", contrast: 45, gradient: 0 };
/** Default dark palette. */
const DARK_DEFAULTS = { accent: "#2d99ff", bg: "#262626", fg: "#d1d1d1", contrast: 28, gradient: 0 };

/** Per-scheme field schema factory. */
function schemeSchema(defaults) {
  return z.object({
    accent: z.string().default(defaults.accent),
    bg: z.string().default(defaults.bg),
    fg: z.string().default(defaults.fg),
    contrast: z.number().min(0).max(100).default(defaults.contrast),
    gradient: z.number().min(-100).max(100).default(defaults.gradient),
  });
}

/**
 * Mark one settings field live-editable when the running schemastery supports
 * it. `.volatile()` is how DSH 0.2.0 projects a Config field into the settings
 * form; the method is absent from older schemastery builds, where the legacy
 * registered-namespace path below carries the same shape instead.
 * @param schema - the field schema to mark.
 * @returns the volatile schema, or the plain schema when unsupported.
 */
function live(schema) {
  return typeof schema.volatile === "function" ? schema.volatile() : schema;
}

/**
 * Plugin Config — the durable theme-tuner settings.
 *
 * DSH 0.2.0 derives its per-entry settings form from this schema, so `light` /
 * `dark` are the two form fields; the profile patch stores the user's edits.
 */
export const Config = z.object({
  light: live(schemeSchema(LIGHT_DEFAULTS).default(LIGHT_DEFAULTS)),
  dark: live(schemeSchema(DARK_DEFAULTS).default(DARK_DEFAULTS)),
});

/** Non-volatile twin of {@link Config}, registered as the durable namespace on DSH <= 0.1.x. */
const LegacySchema = z.object({
  light: schemeSchema(LIGHT_DEFAULTS),
  dark: schemeSchema(DARK_DEFAULTS),
});

/**
 * Host plugin body: wire the durable settings section once the settings service
 * is composed.
 * @param ctx - Host context that may acquire the settings service.
 */
export function apply(ctx) {
  ctx.inject(["settings"], (settingsCtx) => {
    const settings = settingsCtx.settings;
    // DSH 0.2.0+: the service projects active plugin Configs itself, so the only
    // thing left to say is that this entry owns a hand-written page — `auto:
    // false` keeps the schema-generated page from being added underneath it.
    if (typeof settings.configure === "function") {
      settingsCtx.effect(() => settings.configure({ auto: false }, ctx.fiber));
      return;
    }
    // DSH <= 0.1.x: register the durable namespace schema explicitly.
    // (`settingsNamespace` was removed in 0.1.2-rc.1; `register` takes the raw
    // namespace string and validates it internally.)
    if (typeof settings.register === "function") settings.register(NAMESPACE, LegacySchema);
  });
}
