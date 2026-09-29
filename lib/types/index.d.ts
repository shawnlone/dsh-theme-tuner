/** dsh-theme-tuner host entry (host half). */
import type z from "@deepseek-ai/schemastery";

/** Per-scheme field values held by the durable settings document. */
export interface CustomizerFieldSchema {
  accent: string;
  bg: string;
  fg: string;
  contrast: number;
  gradient: number;
}

/** Durable settings shape: one palette per built-in color scheme. */
export interface ThemeTunerSettings {
  light: CustomizerFieldSchema;
  dark: CustomizerFieldSchema;
}

/**
 * Plugin Config. DSH 0.2.0 projects these fields into the profile entry's
 * settings form (the entry id `theme-tuner` is the namespace); DSH <= 0.1.x
 * gets the same shape through the registered `theme-tuner` namespace instead.
 */
export declare const Config: z<ThemeTunerSettings>;

/** Host plugin body: wires the durable settings section. */
export function apply(ctx: unknown): void;
