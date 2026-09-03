/** dsh-theme-tuner client entry (browser half). */
export interface ThemeTunerProps {
  t: (key: string) => string;
  useStore: <T>(selector: (state: ThemeTunerState) => T) => T;
  setMode: (mode: "light" | "dark") => void;
  setField: (field: "accent" | "bg" | "fg" | "contrast" | "gradient", value: string | number) => void;
  resetScheme: (scheme: "light" | "dark") => void;
}

export interface CustomizerScheme {
  accent: string;
  bg: string;
  fg: string;
  contrast: number;
  gradient: number;
}

export interface ThemeTunerState {
  mode: "light" | "dark";
  light: CustomizerScheme;
  dark: CustomizerScheme;
  writable: boolean;
  revision: number;
}

/** Client plugin body: binds the settings scope and registers the settings page. */
export function apply(ctx: unknown): void;
