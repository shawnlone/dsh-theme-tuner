/** dsh-theme-tuner host entry (host half). */
export interface CustomizerFieldSchema {
  accent: string;
  bg: string;
  fg: string;
  contrast: number;
}

/** Host plugin body: registers the "theme-tuner" settings namespace. */
export function apply(ctx: unknown): void;
