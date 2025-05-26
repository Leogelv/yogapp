/**
 * Главный файл экспорта UI библиотеки
 * Основан на дизайне app/ Nowa из Figma
 * 
 * Использование:
 * import { Button, Card, Tag, colors, typography } from '@/ui';
 */

// Компоненты
export * from './components';

// Токены дизайна
export * from './tokens';

// Версия UI библиотеки
export const UI_VERSION = '1.0.0';

// Информация о дизайне
export const DESIGN_INFO = {
  source: 'Figma',
  file: 'app/ Nowa',
  url: 'https://www.figma.com/design/x7tx9boUSo5hUKlnQ5vUSk/app--Nowa',
  lastUpdated: '2024-12-25',
  version: '1.0.0',
} as const; 