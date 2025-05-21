import React from 'react';
import { useSupabaseUser } from '@/lib/supabase/hooks';
import { useFavorites } from '@/lib/supabase/hooks';
import { ContentItem } from '@/lib/supabase/hooks/useContents';
import { useNavigate } from 'react-router-dom';
import './LibraryFavorites.css';

interface LibraryFavoritesProps {
  onFavoritesClick: () => void;
}

const LibraryFavorites: React.FC<LibraryFavoritesProps> = ({ onFavoritesClick }) => {
  const navigate = useNavigate();
  
  // Получаем пользователя
  const { supabaseUser } = useSupabaseUser(undefined); // TODO: передать initData если есть
  const userId = supabaseUser?.id || null;

  // Получаем избранное
  const { favorites, loading, error } = useFavorites(userId);

  // Показываем только 2 первых элемента в превью
  const previewFavorites = favorites.slice(0, 2);

  if (loading) {
    return (
      <div className="library-favorites">
        <div className="favorites-empty">
          <div className="favorites-loading-indicator"></div>
          <p>Загрузка избранного...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="library-favorites">
        <div className="favorites-empty">
          <p>Ошибка загрузки избранного: {error}</p>
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="library-favorites">
        <div className="favorites-empty">
          <p>У вас нет избранных практик</p>
          <button 
            onClick={() => navigate('/library/category/meditation')} 
            className="explore-btn"
          >
            Найти практики
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="library-favorites">
      <div className="favorites-items">
        {previewFavorites.map((item: ContentItem) => (
          <div key={item.id} className="favorite-item">
            <div 
              className="favorite-item-img" 
              style={{ backgroundImage: `url(${item.thumbnail_url || '/img/practice-default.jpg'})` }}
            >
              <div className="favorite-item-duration">
                {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
              </div>
            </div>
            <div className="favorite-item-info">
              <h3 className="favorite-item-title">{item.title}</h3>
              <p className="favorite-item-desc">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      <button className="favorites-more-btn" onClick={onFavoritesClick}>
        Смотреть все избранные
        <svg width="16" height="16" viewBox="0 0 24 24">
          <path 
            d="M9 6l6 6-6 6" 
            stroke="currentColor" 
            strokeWidth="2" 
            fill="none" 
            strokeLinecap="round" 
          />
        </svg>
      </button>
    </div>
  );
};

export default LibraryFavorites; 