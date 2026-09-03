// @deepseek-ai/dsh-client-ui-theme-tuner — HOST half
//
// The browser half of this plugin customizes the interface accent / background /
// foreground / contrast. It persists its per-scheme settings through the shared
// Host settings document, so this half only needs to register that namespace and
// its schema. All rendering + token application happens in the client half.
import z from "@deepseek-ai/schemastery";

/** Settings namespace owned by this plugin (matches the client bind). */
const NAMESPACE = "theme-tuner";

/** Per-scheme field schema factory. */
function schemeSchema(defaults) {
  return z.object({
    accent: z.string().default(defaults.accent),
    bg: z.string().default(defaults.bg),
    fg: z.string().default(defaults.fg),
    contrast: z.number().min(0).max(100).default(defaults.contrast),
    gradient: z.number().min(-100).max(100).default(0),
  });
}

/** Durable schema: two top-level fields (`light` / `dark`), each an object. */
const CustomizerSchema = z.object({
  light: schemeSchema({ accent: "#339cff", bg: "#ffffff", fg: "#1a1c1f", contrast: 45, gradient: 0 }),
  dark: schemeSchema({ accent: "#2d99ff", bg: "#262626", fg: "#d1d1d1", contrast: 28, gradient: 0 }),
});

/**
 * Host plugin body: register the durable settings section once the settings
 * service is composed.
 * @param ctx - Host context that may acquire the settings service.
 */
export function apply(ctx) {
  // DSH 0.1.2-rc.1 removed the `settingsNamespace` helper: `register` now takes
  // the raw namespace string and validates it internally.
  ctx.inject(["settings"], (settingsCtx) => {
    settingsCtx.settings.register(NAMESPACE, CustomizerSchema);
  });
}
