# assets

Storefront screenshots for the plugin market (the awesome-dsh-plugin index, which
feeds in-app stores like `dsh-market`).

Declare them **in this repository** so you can update them without a pull
request: add a `screenshots.json` next to `package.json` (this repo's root),
listing 1–8 image paths relative to that file:

```json
[
  "assets/screenshot_01.png",
  "assets/screenshot_02.png",
  "assets/screenshot_03.png",
  "assets/screenshot_04.png",
  "assets/screenshot_05.png",
  "assets/screenshot_06.png"
]
```

It is already committed here — no change to the market's `data/screenshots.json`
is needed or wanted (the market treats that file as a deprecated fallback and
asks contributors not to add new keys to it).

Rules (from the market's contributing guide):

- 1–8 images; order = display order.
- Paths are relative to `screenshots.json` and may not leave this plugin's
  directory (no leading `/`, no `..`).
- Absolute URLs are also accepted, but must be **https on GitHub hosting**
  (`raw.githubusercontent.com`, `user-images.githubusercontent.com`,
  `camo.githubusercontent.com`, `github.com` attachments).
- No screenshots? The storefront falls back to extracting images from your
  README. Declaring them just gives you control over order & selection.

Screenshots here (both READMEs share the same set of numbered images;
`screenshot_01`–`05` are theme-look previews, `screenshot_06` is the settings panel):

- `screenshot_01.png` — dark theme effect.
- `screenshot_02.png` — dark theme effect.
- `screenshot_03.png` — dark theme effect.
- `screenshot_04.png` — dark theme effect.
- `screenshot_05.png` — light theme effect.
- `screenshot_06.png` — the theme adjustment panel (外观 → 主题定制).

`README.md` (Chinese) and `README_en.md` (English) both reference these six
images, in this order.
