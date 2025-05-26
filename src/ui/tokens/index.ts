/**
 * Главный файл экспорта токенов UI системы
 * Основан на дизайне app/ Nowa из Figma
 */

export * from './colors';
export * from './typography';
export * from './spacing';

// Объединенный объект всех токенов для удобства
export { colors } from './colors';
export { typography } from './typography';
export { spacing, borderRadius, sizes, layout } from './spacing';

// Тема по умолчанию
export const theme = {
  colors: {
    primary: '#FFFFFF',
    secondary: '#191919',
    accent: '#9747FF',
    background: '#FFFFFF',
    surface: '#F1F1F1',
    text: '#191919',
    textSecondary: 'rgba(25, 25, 25, 0.6)',
    border: '#191919',
    shadow: 'rgba(0, 0, 0, 0.14)',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  borderRadius: {
    sm: '8px',
    md: '16px',
    lg: '32px',
    full: '100px',
  },
  typography: {
    fontFamily: 'RF Dewi, -apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: {
      sm: '14px',
      md: '16px',
      lg: '20px',
      xl: '24px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      bold: 700,
    },
  },
} as const;

export type Theme = typeof theme; 