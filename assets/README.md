# assets

Storefront screenshots for the plugin market (the awesome-dsh-plugin index, which
feeds in-app stores like `dsh-market`).

Add one or more PNG screenshots here and reference them in the market's
`data/screenshots.json` (keyed by this repo's GitHub URL):

```jsonc
{
  "https://github.com/shawnlone/dsh-theme-tuner": [
    "https://raw.githubusercontent.com/shawnlone/dsh-theme-tuner/main/assets/screenshot_01.png",
    "https://raw.githubusercontent.com/shawnlone/dsh-theme-tuner/main/assets/screenshot_02.png",
    "https://raw.githubusercontent.com/shawnlone/dsh-theme-tuner/main/assets/screenshot_03.png",
    "https://raw.githubusercontent.com/shawnlone/dsh-theme-tuner/main/assets/screenshot_04.png"
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

Screenshots here (all show the DSH settings page 外观 → 主题定制 in dark theme;
the two READMEs share the same set of numbered images):

- `screenshot_01.png` — dark · blue-grey accent (no gradient).
- `screenshot_02.png` — dark · purple accent.
- `screenshot_03.png` — dark · blue accent + gradient.
- `screenshot_04.png` — dark · green accent + gradient.

`README.md` (Chinese) and `README_en.md` (English) both reference these four
numbered images, in this order.
