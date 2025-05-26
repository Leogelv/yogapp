/**
 * Цветовые токены UI системы
 * Извлечены из Figma дизайна app/ Nowa
 */

export const colors = {
  // Основные цвета
  primary: {
    white: '#FFFFFF',
    black: '#191919',
    dark: '#313133',
    gray: '#414141',
    lightGray: '#F1F1F1',
    accent: '#9747FF',
  },

  // Градиенты для аура эффектов
  gradients: {
    // Сила 2 - оранжевые тона
    strength2: {
      primary: 'linear-gradient(135deg, #FF672F 0%, #FF845A 100%)',
      secondary: 'radial-gradient(circle, #F87A47 0%, #F08F67 100%)',
      background: 'radial-gradient(circle, #D3D3D3 0%, #F87A47 54%, #173157 100%)',
    },
    
    // Сила 6 - оранжево-красные тона
    strength6: {
      primary: 'linear-gradient(135deg, #FF672F 0%, #FF845A 100%)',
      secondary: 'linear-gradient(135deg, #F87A47 0%, #F08F67 100%)',
      accent: 'radial-gradient(circle, #F87A47 0%, #E79775 100%)',
    },

    // Сила 18 - фиолетово-оранжевые тона
    strength18: {
      primary: 'radial-gradient(circle, #8247F8 0%, #F87A47 100%)',
      secondary: 'radial-gradient(circle, #BB60A2 0%, #F87A47 100%)',
      background: 'radial-gradient(circle, #D3D3D3 0%, #F87A47 54%, #173157 100%)',
    },

    // Сила 27 - фиолетово-синие тона
    strength27: {
      primary: 'radial-gradient(circle, #8247F8 0%, #BE619F 100%)',
      secondary: 'linear-gradient(135deg, #F87A47 0%, #BB60A2 50%)',
      background: 'radial-gradient(circle, #D3D3D3 0%, #F87A47 54%, #173157 100%)',
    },

    // Сила 52 - синие тона
    strength52: {
      primary: 'radial-gradient(circle, #1D4884 0%, #8247F8 100%)',
      secondary: 'radial-gradient(circle, #D3D3D3 0%, #F87A47 54%, #173157 100%)',
      background: 'radial-gradient(circle, #D3D3D3 0%, #84A3BF 38%, #1D4884 100%)',
    },

    // Сила 94 - темно-синие тона
    strength94: {
      primary: 'radial-gradient(circle, #1D4884 0%, #112232 100%)',
      secondary: 'radial-gradient(circle, #112232 0%, #09121A 100%)',
      background: 'radial-gradient(circle, #D3D3D3 0%, #84A3BF 38%, #1D4884 100%)',
    },

    // Сила 109 - самые темные тона
    strength109: {
      primary: 'radial-gradient(circle, #112232 0%, #09121A 100%)',
      secondary: 'linear-gradient(135deg, #8247F8 0%, #1D4884 30%, #112232 60%, #09121A 100%)',
      background: 'radial-gradient(circle, #D3D3D3 0%, #1D4884 42%, #112232 100%)',
    },
  },

  // Состояния
  states: {
    active: '#9747FF',
    inactive: 'rgba(25, 25, 25, 0.4)',
    disabled: 'rgba(25, 25, 25, 0.2)',
    error: '#FF4444',
    success: '#44FF44',
    warning: '#FFAA44',
  },

  // Фоны
  background: {
    primary: '#FFFFFF',
    secondary: '#F1F1F1',
    dark: '#262626',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  // Границы
  border: {
    light: 'rgba(255, 255, 255, 0.1)',
    dark: '#191919',
    accent: '#9747FF',
    inactive: 'rgba(25, 25, 25, 0.4)',
  },

  // Тени
  shadow: {
    small: 'rgba(0, 0, 0, 0.1)',
    medium: 'rgba(0, 0, 0, 0.14)',
    large: 'rgba(0, 0, 0, 0.2)',
  },
} as const;

export type ColorToken = keyof typeof colors;
export type GradientToken = keyof typeof colors.gradients; 