// @deepseek-ai/dsh-client-ui-theme-tuner — HOST half
//
// The browser half of this plugin customizes the interface accent / background /
// foreground / contrast. It persists its per-scheme settings through the shared
// Host settings document, so this half only needs to register that namespace and
// its schema. All rendering + token application happens in the client half.
import { settingsNamespace } from "@deepseek-ai/dsh-settings";
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
  });
}

/** Durable schema: two top-level fields (`light` / `dark`), each an object. */
const CustomizerSchema = z.object({
  light: schemeSchema({ accent: "#339cff", bg: "#ffffff", fg: "#1a1c1f", contrast: 45 }),
  dark: schemeSchema({ accent: "#2d99ff", bg: "#262626", fg: "#d1d1d1", contrast: 28 }),
});

/**
 * Host plugin body: register the durable settings section once the settings
 * service is composed.
 * @param ctx - Host context that may acquire the settings service.
 */
export function apply(ctx) {
  ctx.inject(["settings"], (settingsCtx) => {
    settingsCtx.settings.register(settingsNamespace(NAMESPACE), CustomizerSchema);
  });
}
