/** dsh-theme-tuner client entry (browser half). */

/** Values of one palette (one `light` / `dark` form field). */
export interface CustomizerScheme {
  accent: string;
  bg: string;
  fg: string;
  contrast: number;
  gradient: number;
}

/** Store state mirrored from the active settings scope. */
export interface ThemeTunerState {
  mode: "light" | "dark";
  light: CustomizerScheme;
  dark: CustomizerScheme;
  writable: boolean;
  revision: number;
}

/**
 * Props the settings row receives from its slot registration: the locale-bound
 * translator, the store hook, and the actions returned by the registration's
 * `inject` callback.
 */
export interface ThemeTunerProps {
  t: (key: string) => string;
  useStore: <T>(selector: (state: ThemeTunerState) => T) => T;
  setField: (scheme: "light" | "dark", field: keyof CustomizerScheme, value: string | number) => void;
  resetScheme: (scheme: "light" | "dark") => void;
}

/**
 * Required client services. The settings seam is intentionally absent: it is
 * `configForms` on DSH 0.2.0+ and `settingsScope` before it, and it is resolved
 * at runtime — `theme` is only provided once ui-theme has acquired that seam.
 */
export declare const inject: string[];

/** Client plugin body: binds the settings scope and registers the settings row. */
export function apply(ctx: unknown): void;
