import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from '@/components/Page';
import { useContents, ContentItem } from '@/lib/supabase/hooks/useContents';
import { useFavorites } from '@/lib/supabase/hooks';
import { useSupabaseUser } from '@/lib/supabase/hooks';
import './LibraryPage.css';

// Категории в соответствии с макетом
const categories = [
  { id: 'all', name: 'Все' },
  { id: 'physical', name: 'Тело' },
  { id: 'meditation', name: 'Медитация' },
  { id: 'base', name: 'База' },
  { id: 'breathing', name: 'Дыхание' }
];

const LibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [timeFilter, setTimeFilter] = useState<string | null>(null);
  const [showTimeFilter, setShowTimeFilter] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  // Получаем пользователя
  const { supabaseUser } = useSupabaseUser(undefined);
  const userId = supabaseUser?.id || null;

  // Получаем избранное
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites(userId);

  // Получаем контент с учетом выбранной категории
  const { contents, loading, error } = useContents({
    categorySlug: selectedCategory !== 'all' ? selectedCategory : undefined,
    duration: timeFilter ? getDurationRange(timeFilter) : undefined
  });

  // Применяем анимацию появления контента
  useEffect(() => {
    const timer = setTimeout(() => {
      setContentVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Функция для получения диапазона длительности исходя из фильтра
  function getDurationRange(timeFilter: string): { min: number, max: number } | undefined {
    switch (timeFilter) {
      case 'under7': return { min: 0, max: 7 * 60 };
      case '7-20': return { min: 7 * 60, max: 20 * 60 };
      case '20-40': return { min: 20 * 60, max: 40 * 60 };
      case '40-60': return { min: 40 * 60, max: 60 * 60 };
      default: return undefined;
    }
  }

  // Функция для получения текстовой метки фильтра времени
  function getTimeFilterLabel(timeFilter: string): string {
    switch (timeFilter) {
      case 'under7': return 'до 7 мин';
      case '7-20': return '7-20 мин';
      case '20-40': return '20-40 мин';
      case '40-60': return '40-60 мин';
      default: return 'Время';
    }
  }

  // Обработчик выбора категории
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  // Обработчик перехода к конкретной практике
  const handlePracticeSelect = (practice: ContentItem) => {
    navigate(`/practice/${practice.id}`);
  };

  // Обработчик добавления/удаления из избранного
  const handleToggleFavorite = (e: React.MouseEvent, practiceId: string) => {
    e.stopPropagation();
    if (!userId) return;
    
    if (isFavorite(practiceId)) {
      removeFromFavorites(practiceId);
    } else {
      addToFavorites(practiceId);
    }
  };

  // Обработчик перехода к избранному
  const handleFavoritesClick = () => {
    navigate('/library/favorites');
  };

  // Обработчик переключения фильтра по времени
  const toggleTimeFilter = () => {
    setShowTimeFilter(!showTimeFilter);
  };

  // Обработчик выбора фильтра по времени
  const handleTimeFilterSelect = (filter: string) => {
    setTimeFilter(filter);
    setShowTimeFilter(false);
  };

  return (
    <Page back={false}>
      <div className={`library-container ${contentVisible ? 'content-visible' : ''}`}>
        <div className="library-header">
          <h1 className="library-title">Библиотека</h1>
          <div className="time-filter-toggle" onClick={toggleTimeFilter}>
            {timeFilter ? getTimeFilterLabel(timeFilter) : 'Время'} {showTimeFilter ? '▲' : '▼'}
          </div>
        </div>
        
        {/* Фильтр по времени */}
        {showTimeFilter && (
          <div className="time-filter-dropdown">
            <button 
              onClick={() => handleTimeFilterSelect('under7')}
              className={timeFilter === 'under7' ? 'active' : ''}
            >
              до 7 минут
            </button>
            <button 
              onClick={() => handleTimeFilterSelect('7-20')}
              className={timeFilter === '7-20' ? 'active' : ''}
            >
              7-20 минут
            </button>
            <button 
              onClick={() => handleTimeFilterSelect('20-40')}
              className={timeFilter === '20-40' ? 'active' : ''}
            >
              20-40 минут
            </button>
            <button 
              onClick={() => handleTimeFilterSelect('40-60')}
              className={timeFilter === '40-60' ? 'active' : ''}
            >
              40-60 минут
            </button>
            {timeFilter && (
              <button onClick={() => setTimeFilter(null)}>Сбросить фильтр</button>
            )}
          </div>
        )}
        
        {/* Категории */}
        <div className="category-tabs">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`category-tab ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => handleCategorySelect(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
        
        {/* Контент библиотеки */}
        <div className="library-content">
          {loading ? (
            <div className="library-loading">Загрузка...</div>
          ) : error ? (
            <div className="library-error">Ошибка: {error}</div>
          ) : contents.length === 0 ? (
            <div className="library-empty">
              {timeFilter 
                ? 'Нет практик с выбранным временем' 
                : 'В этой категории пока нет практик'}
            </div>
          ) : (
            <div className="library-items">
              {contents.map((item: ContentItem) => (
                <div 
                  key={item.id} 
                  className="practice-card"
                  onClick={() => handlePracticeSelect(item)}
                >
                  <div 
                    className="practice-thumbnail" 
                    style={{ backgroundImage: `url(${item.thumbnail_url || '/img/practice-default.jpg'})` }}
                  >
                    <div className="practice-difficulty">
                      {item.difficulty || '2'} силы
                    </div>
                  </div>
                  <div className="practice-info">
                    <div className="practice-duration-type">
                      {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')} • {item.content_type?.name || 'Видео'}
                    </div>
                    <h3 className="practice-title">{item.title}</h3>
                    <p className="practice-description">{item.short_description || item.description}</p>
                    <button 
                      className={`favorite-button ${isFavorite(item.id) ? 'active' : ''}`}
                      onClick={(e) => handleToggleFavorite(e, item.id)}
                    >
                      {isFavorite(item.id) ? '★' : '☆'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Кнопка перехода к избранному */}
          <button className="favorites-button" onClick={handleFavoritesClick}>
            Избранное
          </button>
        </div>
      </div>
    </Page>
  );
};

export default LibraryPage; 