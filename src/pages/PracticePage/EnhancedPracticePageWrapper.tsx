import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Page } from '@/components/Page';
import AutoPlayPracticePage from './AutoPlayPracticePage';
import { useSupabaseUser, useFavorites } from '@/lib/supabase/hooks';
import './EnhancedPracticePageWrapper.css';

interface EnhancedPracticePageWrapperProps {}

const EnhancedPracticePageWrapper: React.FC<EnhancedPracticePageWrapperProps> = () => {
  const { contentId } = useParams<{ contentId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Получаем пользователя
  const { supabaseUser } = useSupabaseUser(undefined);
  const userId = supabaseUser?.id || null;
  
  // Получаем состояние избранного
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites(userId);
  const [isFav, setIsFav] = useState<boolean>(false);
  
  useEffect(() => {
    if (contentId && userId) {
      const checkFavorite = isFavorite(contentId);
      setIsFav(checkFavorite);
    }
    
    setIsLoading(false);
  }, [contentId, userId, isFavorite]);
  
  const handleBack = () => {
    navigate(-1);
  };
  
  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!contentId || !userId) return;
    
    try {
      if (isFav) {
        await removeFromFavorites(contentId);
        setIsFav(false);
      } else {
        await addToFavorites(contentId);
        setIsFav(true);
      }
    } catch (error) {
      console.error('Ошибка при работе с избранным:', error);
    }
  };
  
  if (!contentId) {
    return (
      <Page>
        <div className="practice-error">
          <h2>Ошибка загрузки практики</h2>
          <p>Не указан ID практики</p>
          <button onClick={handleBack}>Вернуться назад</button>
        </div>
      </Page>
    );
  }
  
  return (
    <Page>
      <div className="practice-page-wrapper">
        <div className="practice-header">
          <button className="back-button" onClick={handleBack}>
            <span>←</span>
          </button>
          
          {!isLoading && userId && (
            <button 
              className={`favorite-button ${isFav ? 'is-favorite' : ''}`} 
              onClick={toggleFavorite}
              aria-label={isFav ? 'Удалить из избранного' : 'Добавить в избранное'}
            >
              {isFav ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          )}
        </div>
        
        <AutoPlayPracticePage />
      </div>
    </Page>
  );
};

export default EnhancedPracticePageWrapper;