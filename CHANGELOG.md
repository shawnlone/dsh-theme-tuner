# Changelog

## 0.1.2

Dual-compatibility: the plugin now runs on both the pre-split and the
re-structured DSH client composition.

- **Client:** `defineStore` lives in a different module per DSH version —
  `@deepseek-ai/dsh-client-store` (`0.1.2-rc.1` and later) vs
  `@deepseek-ai/dsh-client-runtime/client` (`0.1.1-rc.2` and earlier). The
  client bundle now resolves it at runtime with a `try/catch` fallback, so the
  same bundle loads under both.
- **Client inject list:** `@deepseek-ai/dsh-client-ui-renderer` exists in both
  versions (and transitively pulls `dsh-client-runtime` in `0.1.1-rc.2`), so
  the `[modules, locale, ui-settings, ui-theme, ui-renderer]` set works on
  both — the now-removed `dsh-client-runtime` entry is no longer listed
  directly.
- **peerDependencies:** narrowed to `>=0.1.1-rc.2 <=0.1.2-rc.1` (matches both
  under npm's strict prerelease matching) and the mutually exclusive
  `@deepseek-ai/dsh-client-store` / `@deepseek-ai/dsh-client-runtime` peers are
  marked optional so the missing one never warns.
- **Host:** `@deepseek-ai/dsh-settings` removed the `settingsNamespace` helper
  in `0.1.2-rc.1` — `settings.register(ns, schema)` now takes the raw namespace
  string (it validates internally). The host half passes the string directly,
  which also works on `0.1.1-rc.2`.

## 0.1.1

Compatibility release for DSH `0.1.2-rc.1`.

- **Client:** `defineStore` moved out of `@deepseek-ai/dsh-client-runtime`
  (package was split/removed) into `@deepseek-ai/dsh-client-store`; the `slots`
  service now comes from `@deepseek-ai/dsh-client-ui-renderer`. The client
  bundle's `require` and the `dsh.client.inject` list were updated
  accordingly.
- **Host:** `@deepseek-ai/dsh-settings` removed the `settingsNamespace` helper
  — `settings.register(ns, schema)` now takes the raw namespace string (it
  validates internally). The host half passes the string directly.
- **peerDependencies** bumped to `0.1.2-rc.1` (replacing
  `@deepseek-ai/dsh-client-runtime` with `@deepseek-ai/dsh-client-store` and
  `@deepseek-ai/dsh-client-ui-renderer`).
- The `theme.overrideTokens` contract in `0.1.2-rc.1` now requires every
  token value to be a `{ light, dark }` pair (a bare string throws). The
  customizer already derives both palettes, so no behavior change.
- The `--dsw-alias-*` token names the customizer overrides were verified to
  still exist in `0.1.2-rc.1`.

## 0.1.0

Initial release. A DSH (DeepSeek Harness) web client plugin that lets you
customize the interface theme right under Settings → 通用设置 → 外观 (Appearance):

- Adjust **accent / background / foreground / contrast** for the active theme,
  applied live through `theme.overrideTokens` (`--dsw-alias-*` CSS variables).
- Reuses the built-in **外观** light / dark / system switch (no duplicate
  theme toggle); the customizer targets whichever theme is active.
- Persists per-scheme (light & dark) settings via the `theme-tuner`
  settings namespace.
- Ships a host half (`lib/index.js`, registers the settings namespace) and a
  browser half (`lib/client.js`, the settings row + token application), plus a
  standalone `preview.html` demo.

## Unreleased

- Fix the ordering of secondary/tertiary text colors (they now step toward the
  background for a correct primary > secondary > tertiary hierarchy).
- Anchor the native color picker to the swatch (was opening at the viewport
  top-left because the color input was `display: none`).
