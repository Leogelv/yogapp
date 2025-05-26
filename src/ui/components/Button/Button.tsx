import React from 'react';
import './Button.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Вариант кнопки из дизайна Figma
   * - default: обычная кнопка с черным фоном
   * - accent: акцентная кнопка с фиолетовым цветом
   * - inverted: инвертированная кнопка с белым фоном
   */
  variant?: 'default' | 'accent' | 'inverted';
  
  /**
   * Размер кнопки
   * - s: маленькая (40px высота)
   * - m: средняя (56-82px высота)
   */
  size?: 's' | 'm';
  
  /**
   * Показать только иконку без текста
   */
  icon?: React.ReactNode;
  
  /**
   * Полная ширина
   */
  fullWidth?: boolean;
  
  /**
   * Состояние загрузки
   */
  loading?: boolean;
  
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'm',
  icon,
  fullWidth = false,
  loading = false,
  disabled,
  className = '',
  children,
  ...props
}) => {
  const buttonClass = [
    'ui-button',
    `ui-button--${variant}`,
    `ui-button--${size}`,
    fullWidth && 'ui-button--full-width',
    loading && 'ui-button--loading',
    disabled && 'ui-button--disabled',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      className={buttonClass}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="ui-button__spinner" />
      )}
      
      {icon && (
        <span className="ui-button__icon">
          {icon}
        </span>
      )}
      
      {children && (
        <span className="ui-button__text">
          {children}
        </span>
      )}
    </button>
  );
}; 