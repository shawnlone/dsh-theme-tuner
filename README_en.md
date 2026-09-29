# dsh-theme-tuner

> [Chinese README](README.md)

Customize the DeepSeek Harness (DSH) interface theme directly under the built-in **Appearance** settings — accent, background, foreground, contrast and gradient, applied live.

> Reuses the built-in Appearance **light / dark / system** switch, so there is no duplicate theme toggle.

## Screenshots

| ![Dark theme effect](assets/screenshot_01.png)<br>Dark · theme effect | ![Dark theme effect](assets/screenshot_02.png)<br>Dark · theme effect | ![Dark theme effect](assets/screenshot_03.png)<br>Dark · theme effect |
| --- | --- | --- |
| ![Dark theme effect](assets/screenshot_04.png)<br>Dark · theme effect | ![Light theme effect](assets/screenshot_05.png)<br>Light · theme effect | ![Theme settings panel](assets/screenshot_06.png)<br>Theme settings panel |

## Features

- Sits directly under **General Settings → Appearance**, adjusting **accent / background / foreground / contrast / gradient**.
- Reuses the built-in Appearance light / dark / system switch and tunes the **currently active** theme.
- Keeps the light and dark palettes **separately**; the contrast slider softens or sharpens the foreground text per theme.
- Applies **live** via DSH `theme.overrideTokens` (`--dsw-alias-*` design tokens), with a one-click **reset to the current theme default**.

## Install

```sh
dsh plugin --profile web add github:shawnlone/dsh-theme-tuner
```

> This repo is organised so the **repo root is the plugin package**: `package.json` declares `dsh.bundle.patch` (the install entry) and `dsh.client` (browser UI), with `cordis.patch.yml` at the root.
> A new plugin needs a **profile restart** to take effect. `scripts/install.ps1` / `scripts/install.sh` helpers (with a local-junction fallback when a pnpm supply-chain policy blocks the normal path) are also provided.

## How it works

The plugin writes your values into DSH's design tokens:

- **accent** → `--dsw-alias-brand-primary` / `--dsw-alias-button-primary-fill` / `--dsw-alias-state-business-primary`
- **background** → `--dsw-alias-bg-base` / `--dsw-alias-bg-layer-1/2/3` / `--dsw-specific-sidebar-fill`
- **foreground** → `--dsw-alias-label-primary/secondary/tertiary` (derived from the chosen foreground + contrast)

Settings persist through the `theme-tuner` settings namespace. The row registers into `settings.general.item` (order 10.5), directly under the built-in Appearance (order 10). Since DSH 0.1.2-rc.1 the font-size row sits at order 11 and the conversation-display row at order 12, so 10.5 keeps the customizer pinned to the Appearance row.

### DSH version support

One artifact serves both settings generations:

| DSH | Settings seam | Durable schema |
| --- | --- | --- |
| `0.2.x` | `ctx.configForms.get("theme-tuner")` | the exported `Config` (fields marked `.volatile()`) |
| `<= 0.1.x` | `ctx.settingsScope.bind({ namespace: "theme-tuner" })` | `settings.register("theme-tuner", schema)` |

Either way the namespace **is** the profile entry id `theme-tuner` declared in
`cordis.patch.yml`, and the stored shape is `{ light: {...}, dark: {...} }`.

DSH 0.2.0 also enforces plugin compatibility at install time: a bundle whose
`@deepseek-ai/dsh*` peers do not admit the running runtime is refused outright
(`Plugin ... is incompatible with dsh ...`). Those peers therefore span
`>=0.1.1-rc.2 <0.3.0`.

> If the row is missing after an upgrade, check the profile before the plugin:
> `dsh-theme-tuner` must be listed in `dsh.profile.bundles` of
> `$DSH_HOME/profiles/web/package.json` and must not appear in
> `$DSH_HOME/profiles/web/disabled-plugins.json`. `scripts/install.ps1` /
> `scripts/install.sh` re-assert the bundle entry for you.

## Structure

```
dsh-theme-tuner/
  package.json          # dual-face manifest: dsh.client + dsh.bundle.patch
  cordis.patch.yml      # bundle mount row (insert); its id IS the settings namespace
  lib/index.js          # host half: exports the Config schema + wires the settings seam
  lib/client.js         # browser half: settings row + live token application
  scripts/              # install.ps1 / install.sh
  preview.html          # standalone demo
  assets/               # docs / plugin-market screenshots
```

## License

[MIT](LICENSE)
