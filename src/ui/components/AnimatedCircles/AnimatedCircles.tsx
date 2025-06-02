import React from 'react';
import './AnimatedCircles.css';

export interface AnimatedCirclesProps {
  /** Уровень серии дней (0-7+) для определения цвета градиента */
  streakLevel: number;
  /** Размер контейнера в пикселях */
  size?: number;
  /** Дополнительные CSS классы */
  className?: string;
}

/**
 * Компонент анимированных морфирующих кругов
 * Цвет градиента зависит от уровня серии дней пользователя
 */
export const AnimatedCircles: React.FC<AnimatedCirclesProps> = ({
  streakLevel,
  size = 250,
  className = ''
}) => {
  // Определяем градиент на основе уровня серии
  const getGradientByLevel = (level: number): string => {
    const gradients: Record<number, string> = {
      0: 'linear-gradient(45deg, #FD0B0B, #FF486A)', // красный (0 дней)
      1: 'linear-gradient(45deg, #FD270B, #FF5900)', // оранжевый (1 день)
      2: 'linear-gradient(45deg, #FF9200, #FDB733)', // желтый (2 дня)
      3: 'linear-gradient(45deg, #73C570, #05DD49)', // зеленый (3-4 дня)
      4: 'linear-gradient(45deg, #7B61FF, #2CD9FF)'  // фиолетово-голубой (5+ дней)
    };

    let gradientLevel = 0;
    if (level >= 1 && level < 2) gradientLevel = 1;
    if (level >= 2 && level < 3) gradientLevel = 2;
    if (level >= 3 && level < 5) gradientLevel = 3;
    if (level >= 5) gradientLevel = 4;

    return gradients[gradientLevel];
  };

  const containerStyle = {
    width: `${size}px`,
    height: `${size}px`,
  };

  const gradientStyle = {
    width: `${size}px`,
    height: `${size}px`,
    background: getGradientByLevel(streakLevel),
  };

  return (
    <div className={`animated-circles-container ${className}`} style={containerStyle}>
      <div className="animated-circles-gradient-bg" style={gradientStyle} />
      <div className="animated-circles-glass-circle circle-1" />
      <div className="animated-circles-glass-circle circle-2" />
      <div className="animated-circles-glass-circle circle-3" />
    </div>
  );
}; 