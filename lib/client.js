// dsh-theme-tuner — CLIENT half (browser bundle)
//
// This is the deployable artifact the module loader fetches at
// /plugins/dsh-theme-tuner/client.js. It registers a row in the General
// section ("settings.general.item"), placed directly under the built-in 外观
// (Appearance) row: the light/dark/system switch is reused from 外观, and this
// plugin edits accent / background / foreground / contrast for the ACTIVE theme,
// persists both palettes through the "theme-tuner" settings namespace, and
// applies them live through the theme service's overrideTokens() (--dsw-alias-*).
//
// Because it must load with zero build step, it is written in the exact
// `window.__ModuleLoader__.load({ id, factory })` CJS format and uses
// React.createElement (no JSX). Color math (contrast scaling, derived layers,
// borders, on-accent text) is inline so the whole effect is self-contained.
window.__ModuleLoader__.load({
  id: "dsh-theme-tuner",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

    var React = require("react");
    var rt = require("@deepseek-ai/dsh-client-runtime/client");

    var h = React.createElement;

    // ---------------------------------------------------------------- constants
    /** Settings namespace (matches host registration). */
    var NAMESPACE = "theme-tuner";
    /** Locale keyspace bound to the section's t(). */
    var LOCALE_NS = "settings.themeTuner";
    /** Reference contrast per scheme: at this value the picked fg is shown as-is. */
    var REF = { light: 45, dark: 28 };
    /** Default palettes (match the reference Codex screenshot). */
    var DEFAULTS = {
      light: { accent: "#339cff", bg: "#ffffff", fg: "#1a1c1f", contrast: 45 },
      dark: { accent: "#2d99ff", bg: "#262626", fg: "#d1d1d1", contrast: 28 },
    };

    var zh = {
      "title": "主题定制",
      "theme.current": "当前主题",
      "light": "浅色",
      "dark": "深色",
      "accent": "强调色",
      "background": "背景",
      "foreground": "前景",
      "contrast": "对比度",
      "hint": "配合上方「外观」切换主题后，针对当前主题调整。对比度会依据背景微调前景文字：值越大越清晰，越小越柔和。",
      "reset.current": "恢复当前主题默认",
    };
    var en = {
      "title": "Theme Customizer",
      "theme.current": "Current theme",
      "light": "Light",
      "dark": "Dark",
      "accent": "Accent",
      "background": "Background",
      "foreground": "Foreground",
      "contrast": "Contrast",
      "hint": "Switch a theme above (Appearance), then tune this one. Contrast softly adjusts the foreground against the background: higher is crisper, lower is softer.",
      "reset.current": "Reset current theme",
    };

    // ---------------------------------------------------------------- color math
    function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
    function hexToRgb(hex) {
      hex = hex.replace("#", "");
      if (hex.length === 3) hex = hex.split("").map(function (c) { return c + c; }).join("");
      var n = parseInt(hex, 16);
      return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
    }
    function rgbToHex(r, g, b) {
      var s = "#";
      [r, g, b].forEach(function (v) {
        s += ("0" + Math.round(clamp(v, 0, 255)).toString(16)).slice(-2);
      });
      return s.toUpperCase();
    }
    function rgbToHsl(r, g, b) {
      r /= 255; g /= 255; b /= 255;
      var max = Math.max(r, g, b), min = Math.min(r, g, b);
      var h = 0, s = 0, l = (max + min) / 2;
      if (max !== min) {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          default: h = (r - g) / d + 4;
        }
        h /= 6;
      }
      return { h: h * 360, s: s * 100, l: l * 100 };
    }
    function hslToRgb(h, s, l) {
      h /= 360; s /= 100; l /= 100;
      var r, g, b;
      if (s === 0) { r = g = b = l; }
      else {
        var hue2rgb = function (p, q, t) {
          if (t < 0) t += 1; if (t > 1) t -= 1;
          if (t < 1 / 6) return p + (q - p) * 6 * t;
          if (t < 1 / 2) return q;
          if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
          return p;
        };
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
      }
      return { r: r * 255, g: g * 255, b: b * 255 };
    }
    function hexToHsl(hex) { var c = hexToRgb(hex); return rgbToHsl(c.r, c.g, c.b); }
    function hslToHex(h, s, l) { var c = hslToRgb(h, s, l); return rgbToHex(c.r, c.g, c.b); }
    function mixHsl(aHex, bHex, t) {
      var a = hexToHsl(aHex), b = hexToHsl(bHex);
      var dh = b.h - a.h;
      if (dh > 180) dh -= 360; else if (dh < -180) dh += 360;
      return hslToHex(a.h + dh * t, a.s + (b.s - a.s) * t, a.l + (b.l - a.l) * t);
    }
    function luminance(hex) {
      var c = hexToRgb(hex);
      var f = function (v) {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      };
      return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
    }
    function contrastRatio(a, b) {
      var l1 = luminance(a), l2 = luminance(b);
      var hi = Math.max(l1, l2), lo = Math.min(l1, l2);
      return (hi + 0.05) / (lo + 0.05);
    }
    function onAccent(accent) {
      return contrastRatio(accent, "#ffffff") >= contrastRatio(accent, "#0f1115") ? "#ffffff" : "#0f1115";
    }
    /** Effective foreground: at REF[scheme] the picked fg is shown as-is; raising
        contrast blends toward the scheme extreme (white in dark, black in light). */
    function effectiveFg(fg, bg, scheme, contrast) {
      var extreme = scheme === "dark" ? "#FFFFFF" : "#000000";
      var k = clamp((contrast - REF[scheme]) / 50, -1, 1);
      return k >= 0 ? mixHsl(fg, extreme, k) : mixHsl(fg, bg, -k);
    }

    // ---------------------------------------------------------------- token derivation
    function deriveScheme(settings, scheme) {
      var accent = settings.accent;
      var bg = settings.bg;
      var effFg = effectiveFg(settings.fg, bg, scheme, settings.contrast);
      var fg2 = mixHsl(effFg, bg, 0.28);
      var fg3 = mixHsl(effFg, bg, 0.50);
      // 1..2% spread for surfaces near bg, then a touch more for nested layers.
      var layer1 = scheme === "dark" ? mixHsl(bg, "#FFFFFF", 0.05) : mixHsl(bg, "#000000", 0.028);
      var layer2 = scheme === "dark" ? mixHsl(bg, "#FFFFFF", 0.09) : mixHsl(bg, "#000000", 0.055);
      var layer3 = scheme === "dark" ? mixHsl(bg, "#FFFFFF", 0.12) : mixHsl(bg, "#000000", 0.075);
      var border = scheme === "dark" ? "#ffffff12" : "#00000012";
      var border2 = scheme === "dark" ? "#ffffff1f" : "#0000001a";
      var onAcct = onAccent(accent);
      return {
        "--dsw-alias-bg-base": bg,
        "--dsw-alias-bg-layer-1": layer1,
        "--dsw-alias-bg-layer-2": layer2,
        "--dsw-alias-bg-layer-3": layer3,
        "--dsw-specific-sidebar-fill": layer1,
        "--dsw-alias-border-l1": border,
        "--dsw-alias-border-l2": border2,
        "--dsw-alias-brand-primary": accent,
        "--dsw-alias-button-primary-fill": accent,
        "--dsw-alias-state-business-primary": accent,
        "--dsw-alias-brand-primary-new-colorprimary-new-color": accent,
        "--dsw-alias-label-primary": effFg,
        "--dsw-alias-label-secondary": fg2,
        "--dsw-alias-label-tertiary": fg3,
        "--dsw-alias-label-primary-foreground": onAcct,
      };
    }
    /** Build the { light, dark } pair map overrideTokens requires. */
    function deriveTokens(config) {
      var light = deriveScheme(config.light, "light");
      var dark = deriveScheme(config.dark, "dark");
      var out = {};
      Object.keys(light).forEach(function (name) {
        out[name] = { light: light[name], dark: dark[name] };
      });
      return out;
    }

    // ---------------------------------------------------------------- store
    function createCustomizerStore() {
      return rt.defineStore({
        init: function () {
          return {
            mode: "light",
            light: Object.assign({}, DEFAULTS.light),
            dark: Object.assign({}, DEFAULTS.dark),
            writable: false,
            revision: -1,
          };
        },
        actions: {
          sync: function (d, next) {
            d.mode = next.mode;
            d.light = next.light;
            d.dark = next.dark;
            d.writable = next.writable;
            d.revision = next.revision;
          },
          setField: function (d, scheme, field, value) {
            d[scheme] = Object.assign({}, d[scheme], { [field]: value });
          },
          patchScheme: function (d, scheme, cfg) {
            d[scheme] = Object.assign({}, cfg);
          },
        },
      });
    }

    // ---------------------------------------------------------------- styles
    var cssClass = {
      section: "tcu-section", header: "tcu-header", title: "tcu-title", current: "tcu-current",
      row: "tcu-row", rowLabel: "tcu-rowLabel", swatch: "tcu-swatch",
      swatchDot: "tcu-swatchDot", swatchHex: "tcu-swatchHex",
      sliderWrap: "tcu-sliderWrap", slider: "tcu-slider", sliderVal: "tcu-sliderVal",
      hint: "tcu-hint", resetRow: "tcu-resetRow", resetBtn: "tcu-resetBtn",
      grid: "tcu-grid", cell: "tcu-cell", cellLabel: "tcu-cellLabel",
    };
    var cssText = [
      "." + cssClass.section + "{" +
        "display:flex;flex-direction:column;width:100%;" +
        "padding-top:16px;padding-bottom:18px;border-bottom:1px solid var(--dsw-alias-border-l1);" +
        "font-family:var(--dsw-font-family);color:var(--dsw-alias-label-primary);" +
      "}",
      "." + cssClass.header + "{" +
        "display:flex;align-items:baseline;justify-content:flex-end;gap:12px;" +
        "padding:0 0 10px;" +
      "}",
      "." + cssClass.title + "{font-size:14px;font-weight:600;}",
      "." + cssClass.current + "{font-size:12px;color:var(--dsw-alias-label-tertiary);}",
      "." + cssClass.row + "{" +
        "display:flex;align-items:center;justify-content:space-between;gap:14px;" +
        "padding:13px 0;" +
      "}",
      "." + cssClass.grid + "{" +
        "display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 0;" +
      "}",
      "." + cssClass.cell + "{" +
        "display:inline-flex;align-items:center;gap:9px;min-width:0;" +
      "}",
      "." + cssClass.cellLabel + "{font-size:12px;color:var(--dsw-alias-label-secondary);white-space:nowrap;}",
      "." + cssClass.rowLabel + "{min-width:76px;font-size:13px;color:var(--dsw-alias-label-secondary);}",
      "." + cssClass.swatch + "{" +
        "position:relative;display:inline-flex;align-items:center;gap:8px;" +
        "min-width:0;width:auto;flex:none;padding:5px 10px;" +
        "border-radius:8px;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);" +
        "cursor:pointer;transition:border-color .15s;" +
      "}",
      "." + cssClass.swatch + ":hover{border-color:var(--dsw-alias-border-l2);}",
      "." + cssClass.swatchDot + "{" +
        "width:18px;height:18px;border-radius:50%;flex:none;border:1px solid var(--dsw-alias-border-l2);" +
      "}",
      "." + cssClass.swatchHex + "{font:400 12px var(--ds-font-family-code);color:var(--dsw-alias-label-primary);}",
      // Invisible color input overlay: keep the native picker anchored to the
      // swatch (display:none would make the browser open it at the viewport
      // top-left corner). opacity:0 + absolute fill keeps the anchor correct.
      "." + cssClass.swatch + " input{" +
        "position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer;" +
        "border:0;background:transparent;padding:0;margin:0;" +
      "}",
      "." + cssClass.sliderWrap + "{display:flex;align-items:center;gap:14px;flex:1;}",
      "." + cssClass.slider + "{" +
        "-webkit-appearance:none;appearance:none;flex:1;height:4px;border-radius:999px;" +
        "background:linear-gradient(to right,var(--dsw-alias-brand-primary) var(--fill,50%)," +
        "var(--dsw-alias-bg-layer-3) var(--fill,50%));outline:none;" +
      "}",
      "." + cssClass.slider + "::-webkit-slider-thumb{" +
        "-webkit-appearance:none;appearance:none;width:16px;height:16px;border-radius:50%;" +
        "background:var(--dsw-alias-label-primary);border:0;cursor:pointer;box-shadow:0 1px 3px #0006;" +
      "}",
      "." + cssClass.slider + "::-moz-range-thumb{" +
        "width:16px;height:16px;border-radius:50%;background:var(--dsw-alias-label-primary);border:0;cursor:pointer;" +
      "}",
      "." + cssClass.sliderVal + "{font:500 13px var(--ds-font-family-code);min-width:30px;text-align:right;color:var(--dsw-alias-label-primary);}",
      "." + cssClass.hint + "{font-size:12px;color:var(--dsw-alias-label-tertiary);line-height:1.6;margin-top:10px;}",
      "." + cssClass.resetRow + "{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;}",
      "." + cssClass.resetBtn + "{" +
        "appearance:none;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2);" +
        "color:var(--dsw-alias-label-secondary);font:500 12px var(--dsw-font-family);" +
        "padding:6px 11px;border-radius:7px;cursor:pointer;transition:border-color .15s;" +
      "}",
      "." + cssClass.resetBtn + ":hover{border-color:var(--dsw-alias-border-l2);}",
    ].join("");

    function installStyles(ctx) {
      if (typeof document === "undefined") return;
      ctx.effect(function () {
        var tag = document.createElement("style");
        tag.dataset.plugin = "dsh-theme-tuner";
        tag.dataset.pluginCss = "dsh-theme-tuner/styles";
        tag.textContent = cssText;
        document.head.appendChild(tag);
        return function () { tag.remove(); };
      }, "theme-tuner: stylesheet");
    }

    // ---------------------------------------------------------------- component
    /**
     * General-settings row component (settings.general.item), placed directly
     * under the built-in 外观 (Appearance) row. The light/dark switch is reused
     * from 外观 — this row only adjusts accent / background / foreground /
     * contrast for the currently-active theme. Composed props: t, useStore,
     * plus the injected { setField, resetScheme }.
     */
    function ThemeTunerRow(props) {
      var t = props.t, useStore = props.useStore;
      var setField = props.setField, resetScheme = props.resetScheme;
      var mode = useStore(function (s) { return s.mode; });
      var config = useStore(function (s) { return s.mode === "dark" ? s.dark : s.light; });

      var colorRows = [
        { key: "accent", label: t("accent") },
        { key: "bg", label: t("background") },
        { key: "fg", label: t("foreground") },
      ];

      var children = [];
      children.push(h("div", { className: cssClass.header },
        h("span", { className: cssClass.current }, t("theme.current") + "：" + (mode === "dark" ? t("dark") : t("light")))
      ));

      children.push(h("div", { className: cssClass.grid, key: "colors" },
        colorRows.map(function (r) {
          var value = config[r.key] || "";
          return h("div", { className: cssClass.cell, key: r.key },
            h("span", { className: cssClass.cellLabel }, r.label),
            h("label", { className: cssClass.swatch },
              h("span", { className: cssClass.swatchDot, style: { background: value } }),
              h("span", { className: cssClass.swatchHex }, String(value).toUpperCase()),
              h("input", {
                type: "color",
                value: value,
                onChange: function (e) { setField(mode, r.key, e.target.value); },
              })
            )
          );
        })
      ));

      var contrast = config.contrast || 0;
      children.push(h("div", { className: cssClass.row, key: "contrast" },
        h("span", { className: cssClass.rowLabel }, t("contrast")),
        h("div", { className: cssClass.sliderWrap },
          h("input", {
            className: cssClass.slider,
            type: "range",
            min: 0,
            max: 100,
            value: contrast,
            style: { "--fill": contrast + "%" },
            onChange: function (e) { setField(mode, "contrast", Number(e.target.value)); },
          }),
          h("span", { className: cssClass.sliderVal }, String(contrast))
        )
      ));

      children.push(h("p", { className: cssClass.hint }, t("hint")));

      children.push(h("div", { className: cssClass.resetRow },
        h("button", {
          className: cssClass.resetBtn,
          type: "button",
          onClick: function () { resetScheme(mode); },
        }, t("reset.current"))
      ));

      return h("div", { className: cssClass.section }, children);
    }

    // ---------------------------------------------------------------- apply
    /** Required services (cordis fiber inject). */
    exports.inject = ["slots", "locale", "settingsScope", "theme"];
    exports.name = "theme-tuner";

    function resolveMode(theme) {
      if (theme.preference === "light") return "light";
      if (theme.preference === "dark") return "dark";
      return theme.active.colorScheme;
    }

    /**
     * Client plugin body: bind the settings scope, mirror it into a store,
     * apply token overrides on settings change, and register a settings page.
     * @param ctx - client cordis context.
     */
    function apply(ctx) {
      installStyles(ctx);
      const scope = ctx.settingsScope.bind({ namespace: NAMESPACE });
      const store = createCustomizerStore();
      ctx.effect(function () {
        return ctx.locale.register(LOCALE_NS, { zh: zh, en: en });
      }, "theme-tuner: dictionaries");
      const t = ctx.locale.bind(LOCALE_NS);

      var bound;
      var lastAppliedRevision = -1;
      // Optimistic working copy of both palettes — the write path recomposes the
      // whole scheme object from here, so rapid edits of different fields never
      // overwrite each other while settings writes are still in flight.
      var working = {
        light: Object.assign({}, DEFAULTS.light),
        dark: Object.assign({}, DEFAULTS.dark),
      };

      function currentConfig() {
        var v = scope.getSnapshot().value;
        return {
          light: Object.assign({}, DEFAULTS.light, v && v.light),
          dark: Object.assign({}, DEFAULTS.dark, v && v.dark),
        };
      }

      function applyTokens() {
        var snap = scope.getSnapshot();
        var revision = snap.revision ?? -1;
        if (revision === lastAppliedRevision) return;
        lastAppliedRevision = revision;
        ctx.theme.overrideTokens("theme-tuner", deriveTokens(currentConfig()));
      }

      function refresh() {
        var snap = scope.getSnapshot();
        var cfg = currentConfig();
        working = cfg;
        var mode = resolveMode(ctx.theme.getTheme());
        if (!bound) return;
        bound.sync({
          mode: mode,
          light: cfg.light,
          dark: cfg.dark,
          writable: snap.writable ?? true,
          revision: snap.revision ?? -1,
        });
      }

      // Re-apply tokens when the settings document changes (settings are the
      // only thing that changes the token layer; theme switching re-uses the
      // same { light, dark } pair map, so it needs no re-apply).
      scope.subscribe(function () { refresh(); applyTokens(); });

      // Update the displayed "active theme" when the app theme flips.
      ctx.on("theme/change", function () { refresh(); });

      // Initial token application (scope may already be ready).
      applyTokens();

      var injected = function (actions) {
        bound = actions;
        refresh();
        return {
          setField: function (scheme, field, value) {
            bound.setField(scheme, field, value);                     // optimistic store update
            var next = Object.assign({}, working[scheme], { [field]: value });
            working[scheme] = next;
            scope.set(scheme, next);                                  // persist whole scheme object
          },
          resetScheme: function (scheme) {
            var defaults = Object.assign({}, DEFAULTS[scheme]);
            bound.patchScheme(scheme, defaults);
            working[scheme] = defaults;
            scope.set(scheme, defaults);
          },
        };
      };

      // Register as a row in the General section, directly under the built-in
      // 外观 (Appearance) row (order 10). The Appearance row owns the
      // light/dark/system switch; this row reuses the active theme.
      ctx.slots.inject("settings.general.item", function () {
        return ctx.slots.register({
          name: "settings.general.item",
          id: "theme-tuner",
          order: 15,
          locale: LOCALE_NS,
          store: store,
          inject: injected,
        }, ThemeTunerRow);
      });
    }

    exports.apply = apply;
    return module.exports;
  },
});
