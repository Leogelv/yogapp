/**
 * Типографические токены UI системы
 * Извлечены из Figma дизайна app/ Nowa
 */

export const typography = {
  // Семейства шрифтов
  fontFamily: {
    primary: 'RF Dewi', // Основной шрифт для заголовков и UI
    mono: 'IBM Plex Mono', // Моноширинный шрифт для описаний
    system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  // Размеры шрифтов
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
  },

  // Веса шрифтов
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Высота строки
  lineHeight: {
    tight: '1.01', // ~1.0099999564034599em из Figma
    normal: '1.18', // ~1.179999896458217em из Figma
    relaxed: '1.5',
  },

  // Межбуквенное расстояние
  letterSpacing: {
    tight: '-7%', // Из Figma для RF Dewi
    normal: '-6%', // Из Figma для IBM Plex Mono
    wide: '0.05em',
  },

  // Предустановленные стили текста
  textStyles: {
    // Заголовки
    h1: {
      fontFamily: 'RF Dewi',
      fontSize: '24px',
      fontWeight: 700,
      lineHeight: '1.01',
      letterSpacing: '-7%',
    },
    h2: {
      fontFamily: 'RF Dewi',
      fontSize: '20px',
      fontWeight: 700,
      lineHeight: '1.01',
      letterSpacing: '-7%',
    },
    h3: {
      fontFamily: 'RF Dewi',
      fontSize: '18px',
      fontWeight: 600,
      lineHeight: '1.01',
      letterSpacing: '-7%',
    },

    // Основной текст
    body: {
      fontFamily: 'RF Dewi',
      fontSize: '16px',
      fontWeight: 400,
      lineHeight: '1.18',
      letterSpacing: '-6%',
    },
    bodySmall: {
      fontFamily: 'RF Dewi',
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: '1.01',
      letterSpacing: '-7%',
    },

    // Описания (моноширинный)
    description: {
      fontFamily: 'IBM Plex Mono',
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: '1.18',
      letterSpacing: '-6%',
    },

    // UI элементы
    button: {
      fontFamily: 'RF Dewi',
      fontSize: '16px',
      fontWeight: 500,
      lineHeight: '1.01',
      letterSpacing: '-7%',
    },
    buttonSmall: {
      fontFamily: 'RF Dewi',
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: '1.01',
      letterSpacing: '-7%',
    },

    // Теги и метки
    tag: {
      fontFamily: 'RF Dewi',
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: '1.01',
      letterSpacing: '-7%',
    },
    caption: {
      fontFamily: 'RF Dewi',
      fontSize: '12px',
      fontWeight: 400,
      lineHeight: '1.01',
      letterSpacing: '-7%',
    },
  },
} as const;

export type TypographyToken = keyof typeof typography;
export type TextStyleToken = keyof typeof typography.textStyles; 