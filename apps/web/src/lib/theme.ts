export const THEME_COOKIE_NAME = 'statify_theme';
export const THEME_STORAGE_KEY = 'statify.theme';

export const THEME_MODES = ['light', 'dark'] as const;

export type ThemeMode = (typeof THEME_MODES)[number];

export function normalizeThemeMode(value: string | undefined | null): ThemeMode {
  return value === 'light' ? 'light' : 'dark';
}
