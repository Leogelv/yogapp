import React from 'react';
import './Card.css';

export interface CardProps {
  /**
   * Тип карточки из дизайна Figma
   * - library: карточка библиотеки с изображением и описанием
   * - content: карточка контента (видео/аудио)
   * - favourite: карточка избранного с фоновым изображением
   */
  variant?: 'library' | 'content' | 'favourite';
  
  /**
   * Заголовок карточки
   */
  title?: string;
  
  /**
   * Описание карточки
   */
  description?: string;
  
  /**
   * URL изображения для превью
   */
  imageUrl?: string;
  
  /**
   * Тип контента (для карточек контента)
   */
  contentType?: 'video' | 'audio' | 'timer';
  
  /**
   * Длительность контента
   */
  duration?: string;
  
  /**
   * Уровень сложности
   */
  difficulty?: string;
  
  /**
   * Заблокирован ли контент
   */
  locked?: boolean;
  
  /**
   * В избранном ли
   */
  isFavourite?: boolean;
  
  /**
   * Обработчик клика
   */
  onClick?: () => void;
  
  /**
   * Обработчик клика по кнопке избранного
   */
  onFavouriteClick?: () => void;
  
  /**
   * Дополнительные элементы (кнопки, теги и т.д.)
   */
  children?: React.ReactNode;
  
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  variant = 'library',
  title,
  description,
  imageUrl,
  contentType,
  duration,
  difficulty,
  locked = false,
  isFavourite = false,
  onClick,
  onFavouriteClick,
  children,
  className = '',
}) => {
  const cardClass = [
    'ui-card',
    `ui-card--${variant}`,
    locked && 'ui-card--locked',
    className,
  ].filter(Boolean).join(' ');

  const handleCardClick = () => {
    if (!locked && onClick) {
      onClick();
    }
  };

  const handleFavouriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFavouriteClick) {
      onFavouriteClick();
    }
  };

  return (
    <div className={cardClass} onClick={handleCardClick}>
      {/* Фоновое изображение для favourite карточек */}
      {variant === 'favourite' && imageUrl && (
        <div 
          className="ui-card__background"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      )}

      {/* Превью изображение для library и content карточек */}
      {(variant === 'library' || variant === 'content') && imageUrl && (
        <div className="ui-card__image">
          <img src={imageUrl} alt={title} />
          
          {/* Иконка типа контента */}
          {contentType && (
            <div className="ui-card__content-type">
              {contentType === 'video' && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M8 5v14l11-7z" fill="currentColor"/>
                </svg>
              )}
              {contentType === 'audio' && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" fill="currentColor"/>
                </svg>
              )}
              {contentType === 'timer' && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2"/>
                </svg>
              )}
            </div>
          )}

          {/* Иконка блокировки */}
          {locked && (
            <div className="ui-card__lock">
              <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
                <path d="M4 7V5C4 2.79086 5.79086 1 8 1C10.2091 1 12 2.79086 12 5V7M2 7H14C15.1046 7 16 7.89543 16 9V15C16 16.1046 15.1046 17 14 17H2C0.89543 17 0 16.1046 0 15V9C0 7.89543 0.89543 7 2 7Z" fill="currentColor"/>
              </svg>
            </div>
          )}
        </div>
      )}

      {/* Контент карточки */}
      <div className="ui-card__content">
        {/* Верхняя часть с метаданными */}
        {(duration || difficulty) && (
          <div className="ui-card__meta">
            {duration && (
              <span className="ui-card__duration">{duration}</span>
            )}
            {difficulty && (
              <span className="ui-card__difficulty">{difficulty}</span>
            )}
          </div>
        )}

        {/* Заголовок */}
        {title && (
          <h3 className="ui-card__title">{title}</h3>
        )}

        {/* Описание */}
        {description && (
          <p className="ui-card__description">{description}</p>
        )}

        {/* Дополнительный контент */}
        {children && (
          <div className="ui-card__actions">
            {children}
          </div>
        )}
      </div>

      {/* Кнопка избранного */}
      {onFavouriteClick && (
        <button 
          className="ui-card__favourite"
          onClick={handleFavouriteClick}
          aria-label={isFavourite ? 'Убрать из избранного' : 'Добавить в избранное'}
        >
          {isFavourite ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          )}
        </button>
      )}
    </div>
  );
}; 