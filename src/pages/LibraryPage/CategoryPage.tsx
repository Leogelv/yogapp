import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Page } from '@/components/Page';
import LibrarySearch from './components/LibrarySearch';
import './CategoryPage.css';
import { useContents, ContentItem } from '@/lib/supabase/hooks/useContents';
import { useFavorites } from '@/lib/supabase/hooks';
import { useSupabaseUser } from '@/lib/supabase/hooks';

// Функция для получения заголовка категории
const getCategoryTitle = (categorySlug: string): string => {
  switch (categorySlug) {
    case 'physical': return 'Телесные';
    case 'meditation': return 'Медитации';
    case 'breathing': return 'Дыхание';
    default: return categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);
  }
};

const CategoryPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Получаем пользователя
  const { supabaseUser } = useSupabaseUser(undefined); // TODO: передать initData если есть
  const userId = supabaseUser?.id || null;
  
  // Получаем избранное - исключаем неиспользуемую переменную favorites
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites(userId);
  
  // Получаем практики для категории
  const { contents, loading, error } = useContents({ 
    categorySlug: categorySlug,
    search: searchQuery
  });
  
  const handlePracticeSelect = (practice: ContentItem) => {
    // Перенаправляем пользователя на страницу практики
    navigate(`/practice/${practice.id}`);
  };
  
  const handleToggleFavorite = (e: React.MouseEvent, practice: ContentItem) => {
    e.stopPropagation();
    if (!userId) return;
    
    if (isFavorite(practice.id)) {
      removeFromFavorites(practice.id);
    } else {
      addToFavorites(practice.id);
    }
  };
  
  const handleBackClick = () => {
    navigate('/library');
  };
  
  return (
    <Page>
      <div className="category-page">
        <div className="category-header">
          <button onClick={handleBackClick} className="back-button">
            <span>←</span>
          </button>
          <h1>{categorySlug ? getCategoryTitle(categorySlug) : 'Категория'}</h1>
        </div>
        
        <LibrarySearch value={searchQuery} onChange={setSearchQuery} />
        
        {loading ? (
          <div className="category-loading">Загрузка практик...</div>
        ) : error ? (
          <div className="category-error">Ошибка: {error}</div>
        ) : contents.length === 0 ? (
          <div className="category-empty">
            {searchQuery 
              ? `Ничего не найдено по запросу "${searchQuery}"` 
              : 'В этой категории пока нет практик'}
          </div>
        ) : (
          <div className="category-practices">
            {contents.map((practice: ContentItem) => (
              <div 
                key={practice.id} 
                className="practice-card"
                onClick={() => handlePracticeSelect(practice)}
              >
                <div 
                  className="practice-thumbnail" 
                  style={{ backgroundImage: `url(${practice.thumbnail_url || '/img/practice-default.jpg'})` }}
                >
                  <div className="practice-overlay">
                    <div className="practice-play-button">▶</div>
                    <div className="practice-duration">{Math.floor(practice.duration / 60)}:{(practice.duration % 60).toString().padStart(2, '0')}</div>
                  </div>
                </div>
                <div className="practice-details">
                  <h3 className="practice-title">{practice.title}</h3>
                  <p className="practice-description">{practice.description}</p>
                  <button 
                    className={`favorite-button ${isFavorite(practice.id) ? 'active' : ''}`}
                    onClick={(e) => handleToggleFavorite(e, practice)}
                  >
                    {isFavorite(practice.id) ? '★' : '☆'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Page>
  );
};

export default CategoryPage; 