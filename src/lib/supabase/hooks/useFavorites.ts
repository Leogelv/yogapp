import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../client';
import { ContentItem } from './useContents';

export function useFavorites(userId: string | null) {
  const [favorites, setFavorites] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = useCallback(async () => {
    console.log('🔍 useFavorites: fetchFavorites called with userId:', userId);
    
    if (!userId || !supabase) {
      console.log('❌ useFavorites: Missing userId or supabase client', { userId, hasSupabase: !!supabase });
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('📡 useFavorites: Fetching favorites from database...');
      
      // Получаем избранные content_id для пользователя
      const { data: favs, error: favsError } = await supabase
        .from('favorites')
        .select('content_id')
        .eq('user_id', userId);
        
      console.log('📊 useFavorites: Favorites query result:', { favs, favsError });
        
      if (favsError) throw favsError;
      
      const materialIds = favs?.map(f => f.content_id) || [];
      console.log('🎯 useFavorites: Material IDs found:', materialIds);
      
      if (materialIds.length === 0) {
        console.log('📭 useFavorites: No favorites found');
        setFavorites([]);
        setLoading(false);
        return;
      }
      
      // Сначала пробуем получить данные из таблицы contents (новая структура)
      let contentsData = null;
      try {
        console.log('🔍 useFavorites: Trying to fetch from contents table...');
        const { data, error: contentsError } = await supabase
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
          .in('id', materialIds);
          
        console.log('📊 useFavorites: Contents query result:', { data, contentsError });
          
        if (!contentsError && data && data.length > 0) {
          contentsData = data;
          console.log('✅ useFavorites: Successfully fetched from contents table');
        } else {
          console.log('⚠️ useFavorites: Contents table query failed or returned no data');
        }
      } catch (e) {
        console.log('⚠️ useFavorites: Contents table not found, trying materials', e);
      }
      
      // Если не получилось из contents, пробуем из materials (старая структура)
      if (!contentsData || contentsData.length === 0) {
        console.log('🔍 useFavorites: Trying to fetch from materials table...');
        const { data: materialsData, error: materialsError } = await supabase
          .from('materials')
          .select('*')
          .in('id', materialIds);
          
        console.log('📊 useFavorites: Materials query result:', { materialsData, materialsError });
          
        if (materialsError) {
          console.error('❌ useFavorites: Materials query failed:', materialsError);
          throw materialsError;
        }
        contentsData = materialsData;
        
        if (contentsData && contentsData.length > 0) {
          console.log('✅ useFavorites: Successfully fetched from materials table');
        } else {
          console.log('⚠️ useFavorites: Materials table also returned no data');
        }
      }
      
      // Проверяем, что у нас есть данные
      if (!contentsData || contentsData.length === 0) {
        console.log('❌ useFavorites: No content data found for favorite IDs:', materialIds);
        console.log('💡 useFavorites: This means the content_ids in favorites table don\'t match any records in contents or materials tables');
      }
      
      console.log('🎉 useFavorites: Final favorites data:', contentsData);
      setFavorites(contentsData || []);
    } catch (e: any) {
      const errorMessage = e.message || 'Ошибка загрузки избранного';
      console.error('❌ useFavorites: Error fetching favorites:', e);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    console.log('🔄 useFavorites: useEffect triggered, calling fetchFavorites');
    fetchFavorites();
  }, [fetchFavorites]);

  // Добавить в избранное
  const addToFavorites = useCallback(async (contentId: string) => {
    console.log('➕ useFavorites: Adding to favorites:', { userId, contentId });
    
    if (!userId || !supabase) {
      console.log('❌ useFavorites: Cannot add - missing userId or supabase');
      return;
    }
    
    try {
      // Проверяем текущую сессию пользователя
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      console.log('🔐 useFavorites: Current session:', { 
        session: session?.session?.user?.id, 
        sessionError,
        userId 
      });
      
      // Проверяем, нет ли уже такой записи
      const { data: existingFav, error: checkError } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('content_id', contentId)
        .maybeSingle();
        
      console.log('🔍 useFavorites: Existing favorite check:', { existingFav, checkError });
      
      if (checkError) {
        console.error('❌ useFavorites: Error checking existing favorite:', checkError);
        throw checkError;
      }
        
      if (!existingFav) {
        // Добавляем запись в избранное
        const { data: insertData, error: insertError } = await supabase
          .from('favorites')
          .insert({ user_id: userId, content_id: contentId })
          .select();
          
        console.log('📝 useFavorites: Insert result:', { insertData, insertError });
          
        if (insertError) {
          console.error('❌ useFavorites: Insert error details:', {
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint,
            code: insertError.code
          });
          throw insertError;
        }
        
        console.log('✅ useFavorites: Successfully added to favorites');
        
        // Обновляем список избранного
        await fetchFavorites();
      } else {
        console.log('ℹ️ useFavorites: Item already in favorites');
      }
    } catch (e: any) {
      console.error('❌ useFavorites: Error adding to favorites:', {
        message: e.message,
        details: e.details,
        hint: e.hint,
        code: e.code,
        stack: e.stack
      });
    }
  }, [userId, fetchFavorites]);

  // Удалить из избранного
  const removeFromFavorites = useCallback(async (contentId: string) => {
    console.log('➖ useFavorites: Removing from favorites:', { userId, contentId });
    
    if (!userId || !supabase) {
      console.log('❌ useFavorites: Cannot remove - missing userId or supabase');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('content_id', contentId);
        
      if (error) throw error;
      
      console.log('✅ useFavorites: Successfully removed from favorites');
      
      // Обновляем список избранного
      await fetchFavorites();
    } catch (e: any) {
      console.error('❌ useFavorites: Error removing from favorites:', e);
    }
  }, [userId, fetchFavorites]);

  // Проверить, в избранном ли
  const isFavorite = useCallback((contentId: string) => {
    const result = favorites.some(f => f.id === contentId);
    console.log('🔍 useFavorites: isFavorite check:', { contentId, result, favoritesCount: favorites.length });
    return result;
  }, [favorites]);

  console.log('📊 useFavorites: Current state:', { 
    favoritesCount: favorites.length, 
    loading, 
    error, 
    userId 
  });

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