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
    "https://raw.githubusercontent.com/shawnlone/dsh-theme-tuner/main/assets/screenshot_04.png",
    "https://raw.githubusercontent.com/shawnlone/dsh-theme-tuner/main/assets/screenshot_05.png",
    "https://raw.githubusercontent.com/shawnlone/dsh-theme-tuner/main/assets/screenshot_06.jpg"
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

Screenshots here (both READMEs share the same set of numbered images;
`screenshot_01`–`05` are theme-look previews, `screenshot_06` is the settings panel):

- `screenshot_01.png` — dark theme effect.
- `screenshot_02.png` — dark theme effect.
- `screenshot_03.png` — dark theme effect.
- `screenshot_04.png` — dark theme effect.
- `screenshot_05.png` — light theme effect.
- `screenshot_06.jpg` — the theme adjustment panel (外观 → 主题定制).

`README.md` (Chinese) and `README_en.md` (English) both reference these six
images, in this order.
