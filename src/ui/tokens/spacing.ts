/**
 * Токены отступов и размеров UI системы
 * Извлечены из Figma дизайна app/ Nowa
 */

export const spacing = {
  // Базовые отступы
  0: '0px',
  1: '2px',
  2: '4px',
  3: '8px',
  4: '12px',
  5: '16px',
  6: '20px',
  7: '24px',
  8: '32px',
  9: '40px',
  10: '48px',
  12: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
  32: '128px',
} as const;

export const borderRadius = {
  none: '0px',
  sm: '5px',
  md: '8px',
  lg: '16px',
  xl: '32px',
  full: '100px',
  // Специальные радиусы из дизайна
  button: '32px',
  card: '16px',
  tag: '8px',
} as const;

export const sizes = {
  // Размеры иконок
  icon: {
    xs: '16px',
    sm: '20px',
    md: '24px',
    lg: '32px',
    xl: '40px',
    '2xl': '48px',
    '3xl': '55px', // Размер больших кнопок воспроизведения
  },

  // Размеры кнопок
  button: {
    sm: {
      height: '40px',
      padding: '8px 16px',
    },
    md: {
      height: '56px',
      padding: '20px 8px',
    },
    lg: {
      height: '82px',
      padding: '33px 8px',
    },
  },

  // Размеры карточек
  card: {
    library: {
      width: '375px',
      minHeight: '200px',
    },
    favourite: {
      width: '375px',
      height: '260px',
    },
    content: {
      width: '375px',
      minHeight: '120px',
    },
  },

  // Размеры навигации
  navigation: {
    tabBar: {
      height: '70px', // Обновленная высота из нашего проекта
      itemWidth: '117px',
    },
    topBar: {
      height: '44px',
    },
    homeIndicator: {
      height: '34px',
      width: '134px',
      indicatorHeight: '5px',
    },
  },

  // Размеры плеера
  player: {
    control: {
      small: '40px',
      medium: '55px',
      large: '70px',
    },
    progress: {
      height: '4px',
      thumb: '16px',
    },
  },

  // Размеры календаря
  calendar: {
    cell: {
      width: '48px',
      height: '48px',
    },
    dot: {
      size: '8px',
    },
  },
} as const;

export const layout = {
  // Ширина контейнера (из дизайна)
  container: '375px',
  
  // Максимальные ширины
  maxWidth: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },

  // Z-индексы
  zIndex: {
    base: 0,
    dropdown: 10,
    modal: 20,
    overlay: 30,
    tooltip: 40,
    toast: 50,
  },
} as const;

export type SpacingToken = keyof typeof spacing;
export type BorderRadiusToken = keyof typeof borderRadius;
export type SizeToken = keyof typeof sizes; 