# Changelog

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
