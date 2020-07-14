/** Contains several constants in use throughout the application. */
/** Whether to use test data or not. */
export const USE_TEST_DATA = true;

// See https://standards.google/guidelines/brand-standards/color/palette/#brand-colors
export const GOOGLE_BLUE = '#174ea6';
export const GOOGLE_RED = '#a50e0e';
export const GOOGLE_YELLOW = '#e37400';
export const GOOGLE_GREEN = '#0d652d';
/** Default colors for use with the projects. */
export const DEFAULT_COLORS: string[] = [
  GOOGLE_BLUE,
  GOOGLE_RED,
  GOOGLE_YELLOW,
  GOOGLE_GREEN,
  // The remaining are lighter versions of the colors above, also from the link above
  '#1A73E8',
  '#D93025',
  '#F9AB00',
  '#1E8E3E',
  '#8AB4F8',
  '#F28B82',
  '#FDD663',
  '#81C995',
  '#E8F0FE',
  '#FCE8E6',
  '#FEF7E0',
  '#E6F4EA',
];

/** How much of the horizontal space on the page is taken up by the graph */
export const WIDTH_SCALE_FACTOR = 6 / 8;
/** How much of the vertical space on the page is taken up by the graph */
export const HEIGHT_SCALE_FACTOR = 1 / 2;
/** The color of a project's bubble when it's not on the graph */
export const PROJECT_INACTIVE_COLOR = '#b8b8b8';
/** The relative URL of the error page */
export const ERROR_PAGE_URL = 'error';
