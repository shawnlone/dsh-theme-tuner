# dsh-theme-tuner

Customize the DeepSeek Harness (DSH) interface theme right under the built-in **外观 (Appearance)** settings — accent, background, foreground and contrast, applied live.

> **主题微调**：在 DSH 的「通用设置 → 外观」下方，直接调整界面配色。
> Note: this plugin reuses the built-in Appearance light / dark / system switch.

![dsh-theme-tuner in DSH settings](assets/screenshot.png)

## Features

- Sits directly under **通用设置 → 外观**, adjusting **accent / background / foreground / contrast**.
- Reuses the built-in **外观** light / dark / system switch — no duplicate toggle — and tunes the **active** theme.
- Keeps the light and dark palettes **separately**; the contrast slider softens or sharpens foreground text per theme.
- Applies **live** via DSH `theme.overrideTokens` (`--dsw-alias-*`), with a **reset to the current theme default**.

## Install

```sh
dsh plugin --profile web add github:shawnlone/dsh-theme-tuner
```

> This repo is structured so the **repo root is the plugin package**: `package.json` declares
> `dsh.bundle.patch` (the install entry) and `dsh.client` (browser UI), with `cordis.patch.yml` at the root.
> A new plugin needs a **profile restart** to take effect. A `scripts/install.ps1` / `install.sh` helper
> (with a local-junction fallback for a pnpm supply-chain policy) is also provided.

## How it works

The plugin writes to DSH's design tokens:

- **accent** → `--dsw-alias-brand-primary` / `--dsw-alias-button-primary-fill` / `--dsw-alias-state-business-primary`
- **background** → `--dsw-alias-bg-base` / `--dsw-alias-bg-layer-1/2/3` / `--dsw-specific-sidebar-fill`
- **foreground** → `--dsw-alias-label-primary/secondary/tertiary` (derived from foreground + contrast)

Settings persist through the `theme-tuner` settings namespace. The row registers into
`settings.general.item` (order 15), directly under the built-in 外观 (order 10).

## Structure

```
dsh-theme-tuner/
  package.json          # dual-face manifest: dsh.client + dsh.bundle.patch
  cordis.patch.yml      # bundle mount row (insert)
  lib/index.js          # host half: registers the theme-tuner settings namespace
  lib/client.js         # browser half: settings row + live token application
  scripts/              # install.ps1 / install.sh
  preview.html          # standalone demo
  assets/               # screenshots for the plugin market
```

## License

[MIT](LICENSE)
