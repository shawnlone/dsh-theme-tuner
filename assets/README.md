# assets

Storefront screenshots for the plugin market (the awesome-dsh-plugin index, which
feeds in-app stores like `dsh-market`).

Add one or more PNG screenshots here and reference them in the market's
`data/screenshots.json` (keyed by this repo's GitHub URL):

```jsonc
{
  "https://github.com/shawnlone/dsh-theme-tuner": [
    "https://raw.githubusercontent.com/shawnlone/dsh-theme-tuner/main/assets/screenshot.png",
    "https://raw.githubusercontent.com/shawnlone/dsh-theme-tuner/main/assets/screenshot_en.png"
  ]
}
```

Rules (from the market's contributing guide):

- Images must be **https URLs on GitHub hosting** — `raw.githubusercontent.com`
  works fine once the file is committed to this repo.
- Keep them under `assets/` so they stay in sync with releases.
- 1–8 images; order = display order.
- No screenshots? The storefront falls back to extracting images from your
  README. A maintained entry here just gives you control over order & selection.

Screenshots here:

- `screenshot.png` — the DSH settings page (Chinese UI) showing 外观 → 主题定制.
- `screenshot_en.png` — the same settings page with the English UI.
- `README.md` (Chinese) uses `screenshot.png`; `README_en.md` (English) uses
  `screenshot_en.png`.
