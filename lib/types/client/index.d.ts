/** dsh-theme-customizer client entry (browser half). */
export interface ThemeCustomizerProps {
  t: (key: string) => string;
  useStore: <T>(selector: (state: ThemeCustomizerState) => T) => T;
  setMode: (mode: "light" | "dark") => void;
  setField: (field: "accent" | "bg" | "fg" | "contrast", value: string | number) => void;
  resetScheme: (scheme: "light" | "dark") => void;
}

export interface CustomizerScheme {
  accent: string;
  bg: string;
  fg: string;
  contrast: number;
}

export interface ThemeCustomizerState {
  mode: "light" | "dark";
  light: CustomizerScheme;
  dark: CustomizerScheme;
  writable: boolean;
  revision: number;
}

/** Client plugin body: binds the settings scope and registers the settings page. */
export function apply(ctx: unknown): void;
