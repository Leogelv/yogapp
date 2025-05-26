import React from 'react';
import './Tag.css';

export interface TagProps {
  /**
   * Вариант тега
   * - default: обычный тег с серым фоном
   * - difficulty: тег сложности с темным фоном
   * - duration: тег длительности со светлым фоном
   */
  variant?: 'default' | 'difficulty' | 'duration';
  
  /**
   * Размер тега
   */
  size?: 'sm' | 'md';
  
  /**
   * Текст тега
   */
  children: React.ReactNode;
  
  /**
   * Обработчик клика
   */
  onClick?: () => void;
  
  /**
   * Активен ли тег (для фильтров)
   */
  active?: boolean;
  
  className?: string;
}

export const Tag: React.FC<TagProps> = ({
  variant = 'default',
  size = 'md',
  children,
  onClick,
  active = false,
  className = '',
}) => {
  const tagClass = [
    'ui-tag',
    `ui-tag--${variant}`,
    `ui-tag--${size}`,
    active && 'ui-tag--active',
    onClick && 'ui-tag--clickable',
    className,
  ].filter(Boolean).join(' ');

  const TagElement = onClick ? 'button' : 'span';

  return (
    <TagElement className={tagClass} onClick={onClick}>
      {children}
    </TagElement>
  );
}; 