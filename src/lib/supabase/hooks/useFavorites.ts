import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../client';
import { ContentItem } from './useContents';

export function useFavorites(userId: string | null) {
  const [favorites, setFavorites] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = useCallback(async () => {
    if (!userId || !supabase) return;
    setLoading(true);
    setError(null);
    try {
      // Получаем избранные content_id для пользователя
      const { data: favs, error: favsError } = await supabase
        .from('favorites')
        .select('content_id')
        .eq('user_id', userId);
        
      if (favsError) throw favsError;
      
      const contentIds = favs?.map(f => f.content_id) || [];
      
      if (contentIds.length === 0) {
        setFavorites([]);
        setLoading(false);
        return;
      }
      
      // Получаем полную информацию о контенте
      const { data: contentsData, error: contentsError } = await supabase
        .from('contents')
        .select(`
          *,
          content_types (
            name,
            slug
          ),
          categories (
            name,
            slug
          )
        `)
        .in('id', contentIds);
        
      if (contentsError) throw contentsError;
      
      setFavorites(contentsData || []);
    } catch (e: any) {
      setError(e.message || 'Ошибка загрузки избранного');
      console.error('Ошибка загрузки избранного:', e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // Добавить в избранное
  const addToFavorites = useCallback(async (contentId: string) => {
    if (!userId || !supabase) return;
    try {
      // Проверяем, нет ли уже такой записи
      const { data: existingFav } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('content_id', contentId)
        .maybeSingle();
        
      if (!existingFav) {
        // Добавляем запись в избранное
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: userId, content_id: contentId });
          
        if (error) throw error;
        
        // Обновляем список избранного
        await fetchFavorites();
      }
    } catch (e: any) {
      console.error('Ошибка добавления в избранное:', e);
    }
  }, [userId, fetchFavorites]);

  // Удалить из избранного
  const removeFromFavorites = useCallback(async (contentId: string) => {
    if (!userId || !supabase) return;
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('content_id', contentId);
        
      if (error) throw error;
      
      // Обновляем список избранного
      await fetchFavorites();
    } catch (e: any) {
      console.error('Ошибка удаления из избранного:', e);
    }
  }, [userId, fetchFavorites]);

  // Проверить, в избранном ли
  const isFavorite = useCallback((contentId: string) => {
    return favorites.some(f => f.id === contentId);
  }, [favorites]);

  return { 
    favorites, 
    loading, 
    error, 
    addToFavorites, 
    removeFromFavorites, 
    isFavorite, 
    refetch: fetchFavorites 
  };
} 