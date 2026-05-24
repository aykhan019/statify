export type SectionHue =
  | 'amber'
  | 'azure'
  | 'coral'
  | 'cyan'
  | 'green'
  | 'indigo'
  | 'magenta'
  | 'pink'
  | 'teal'
  | 'vermilion'
  | 'violet';

export type SectionId =
  | 'admin'
  | 'community'
  | 'discover'
  | 'heatmap'
  | 'hidden-gems'
  | 'history'
  | 'library'
  | 'playlists'
  | 'top-artists'
  | 'top-tracks'
  | 'trending'
  | 'account';

export interface SectionDefinition {
  id: SectionId;
  label: string;
  hue: SectionHue;
  routePrefixes: string[];
  neutral?: boolean;
}

export const DEFAULT_SECTION_ID: SectionId = 'library';

export const SECTION_DEFINITIONS: SectionDefinition[] = [
  {
    id: 'top-artists',
    label: 'Top Artists',
    hue: 'coral',
    routePrefixes: ['/me/stats/top-artists'],
  },
  {
    id: 'top-tracks',
    label: 'Top Tracks',
    hue: 'magenta',
    routePrefixes: ['/me/stats/top-tracks'],
  },
  {
    id: 'heatmap',
    label: 'Heatmap',
    hue: 'azure',
    routePrefixes: ['/me/stats/heatmap'],
  },
  {
    id: 'trending',
    label: 'Trending',
    hue: 'amber',
    routePrefixes: ['/me/stats/trending'],
  },
  {
    id: 'hidden-gems',
    label: 'Hidden Gems',
    hue: 'teal',
    routePrefixes: ['/explore/hidden-gems', '/me/stats/hidden-gems'],
  },
  {
    id: 'account',
    label: 'Account',
    hue: 'indigo',
    routePrefixes: ['/me/account'],
    neutral: true,
  },
  {
    id: 'history',
    label: 'History',
    hue: 'vermilion',
    routePrefixes: ['/me/history'],
  },
  {
    id: 'playlists',
    label: 'Playlists',
    hue: 'violet',
    routePrefixes: ['/me/playlists', '/playlists'],
  },
  {
    id: 'community',
    label: 'Community',
    hue: 'cyan',
    routePrefixes: ['/community'],
  },
  {
    id: 'discover',
    label: 'Discover',
    hue: 'green',
    routePrefixes: ['/discover'],
  },
  {
    id: 'admin',
    label: 'Admin',
    hue: 'pink',
    routePrefixes: ['/admin'],
  },
  {
    id: 'library',
    label: 'Library',
    hue: 'indigo',
    routePrefixes: ['/catalog'],
  },
];

export interface SectionResolution {
  definition: SectionDefinition;
  hue: SectionHue;
  id: SectionId;
  label: string;
  neutral: boolean;
}

export function resolveSection(pathname: string): SectionResolution {
  const normalized = normalizePathname(pathname);
  const definition =
    SECTION_DEFINITIONS.find((section) =>
      section.routePrefixes.some(
        (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`),
      ),
    ) ?? getDefaultSection();

  return {
    definition,
    hue: definition.hue,
    id: definition.id,
    label: definition.label,
    neutral: definition.neutral === true,
  };
}

export function getSectionHue(pathname: string): SectionHue {
  return resolveSection(pathname).hue;
}

function getDefaultSection(): SectionDefinition {
  return SECTION_DEFINITIONS.find((section) => section.id === DEFAULT_SECTION_ID)!;
}

function normalizePathname(pathname: string): string {
  if (pathname === '') {
    return '/';
  }

  return pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}
