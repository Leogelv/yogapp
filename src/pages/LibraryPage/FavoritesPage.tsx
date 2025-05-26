import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from '@/components/Page';
import { useFavorites } from '@/lib/supabase/hooks';
import { useSupabaseUser } from '@/lib/supabase/hooks';
import { ContentItem } from '@/lib/supabase/hooks/useContents';
import './FavoritesPage.css';

// Категории в соответствии с макетом
const categories = [
  { id: 'all', name: 'Все' },
  { id: 'body', name: 'Тело' },
  { id: 'meditation', name: 'Медитация' },
  { id: 'base', name: 'База' },
  { id: 'breathing', name: 'Дыхание' }
];

const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [timeFilter, setTimeFilter] = useState<string | null>(null);
  const [showTimeFilter, setShowTimeFilter] = useState(false);

  // Получаем пользователя
  const { supabaseUser } = useSupabaseUser(undefined);
  const userId = supabaseUser?.id || null;

  // Получаем избранное
  const { favorites, loading, error, removeFromFavorites } = useFavorites(userId);

  // Функция для получения диапазона длительности исходя из фильтра
  function getDurationRange(timeFilter: string): { min: number; max: number } | undefined {
    switch (timeFilter) {
      case 'under7': return { min: 0, max: 7 * 60 };
      case '7-20': return { min: 7 * 60, max: 20 * 60 };
      case '20-40': return { min: 20 * 60, max: 40 * 60 };
      case '40-60': return { min: 40 * 60, max: 60 * 60 };
      default: return undefined;
    }
  }

  // Фильтрация избранного по категории и времени
  const filteredFavorites = favorites.filter((item: ContentItem) => {
    // Фильтр по категории
    if (selectedCategory !== 'all') {
      if (item.categories?.slug !== selectedCategory) {
        return false;
      }
    }
    
    // Фильтр по времени
    if (timeFilter) {
      const range = getDurationRange(timeFilter);
      if (range && (item.duration < range.min || item.duration > range.max)) {
        return false;
      }
    }
    
    return true;
  });

  const handleSelectFavorite = (item: ContentItem) => {
    // Перенаправляем пользователя на страницу практики
    navigate(`/practice/${item.id}`);
  };

  const handleRemoveFavorite = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    removeFromFavorites(itemId);
  };

  // Обработчик выбора категории
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
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
      <div className="favorites-page">
        <div className="favorites-header">
          <h1>Избранное</h1>
          <div className="time-filter-toggle" onClick={toggleTimeFilter}>
            Время {showTimeFilter ? '▲' : '▼'}
          </div>
        </div>
        
        {/* Фильтр по времени */}
        {showTimeFilter && (
          <div className="time-filter-dropdown">
            <button onClick={() => handleTimeFilterSelect('under7')}>до 7 минут</button>
            <button onClick={() => handleTimeFilterSelect('7-20')}>7-20 минут</button>
            <button onClick={() => handleTimeFilterSelect('20-40')}>20-40 минут</button>
            <button onClick={() => handleTimeFilterSelect('40-60')}>40-60 минут</button>
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
        
        {loading ? (
          <div className="favorites-loading">Загрузка избранного...</div>
        ) : error ? (
          <div className="favorites-error">Ошибка: {error}</div>
        ) : favorites.length === 0 ? (
          <div className="favorites-empty">
            <p>В избранном пока ничего нет</p>
            <button onClick={() => navigate('/library')} className="browse-button">
              Найти практики
            </button>
          </div>
        ) : filteredFavorites.length === 0 ? (
          <div className="favorites-empty">
            <p>Нет избранных практик в выбранной категории</p>
          </div>
        ) : (
          <div className="favorites-grid">
            {filteredFavorites.map((item: ContentItem) => (
              <div 
                key={item.id} 
                className="favorite-square-card"
                onClick={() => handleSelectFavorite(item)}
              >
                <div 
                  className="favorite-square-thumbnail" 
                  style={{ backgroundImage: `url(${item.thumbnail_url || '/img/practice-default.jpg'})` }}
                >
                  <button 
                    className="remove-favorite-button"
                    onClick={(e) => handleRemoveFavorite(e, item.id)}
                  >
                    ❌
                  </button>
                  <div className="favorite-duration-badge">
                    {Math.floor(item.duration / 60)} мин
                  </div>
                </div>
                <div className="favorite-square-info">
                  <h3 className="favorite-square-title">{item.title}</h3>
                  <div className="favorite-difficulty-stars">
                    {'⭐'.repeat(Number(item.difficulty) || 2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Page>
  );
};

export default FavoritesPage; 