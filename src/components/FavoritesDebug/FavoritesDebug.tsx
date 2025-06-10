import { useState, useEffect } from 'react';
import { Button, Cell, Section } from '@telegram-apps/telegram-ui';
import { useFavorites } from '@/lib/supabase/hooks/useFavorites';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';
import { initDataState, useSignal } from '@telegram-apps/sdk-react';

export default function FavoritesDebug() {
  const { user, supabaseUser } = useUser();
  const { favorites, loading, error, addToFavorites, removeFromFavorites, isFavorite } = useFavorites(supabaseUser?.id || null);
  const [authInfo, setAuthInfo] = useState<any>(null);
  const [telegramInfo, setTelegramInfo] = useState<any>(null);
  
  // Получаем данные из Telegram SDK
  const initData = useSignal(initDataState);
  
  // Тестовый ID контента (замените на реальный из вашей базы)
  const testContentId = 'cf841bfa-9973-41c6-91b7-ebe60763b4eb';

  // Проверяем всю доступную информацию об аутентификации
  useEffect(() => {
    const checkAllAuth = async () => {
      // 1. Проверяем Supabase Auth
      let supabaseAuthInfo = null;
      if (supabase) {
        const { data: session } = await supabase.auth.getSession();
        const { data: authUser } = await supabase.auth.getUser();
        supabaseAuthInfo = {
          hasSession: !!session.session,
          sessionUserId: session.session?.user?.id,
          authUserId: authUser.user?.id,
          userMetadata: authUser.user?.user_metadata
        };
      }
      
      // 2. Проверяем Telegram данные
      const telegramData = {
        initData: !!initData,
        telegramUser: initData?.user,
        authDate: initData?.auth_date,
        hash: initData?.hash,
        queryId: initData?.query_id
      };
      
      // 3. Проверяем контекст пользователя
      const userContextInfo = {
        user: user,
        supabaseUser: supabaseUser,
        userTelegramId: user?.id,
        supabaseUserId: supabaseUser?.id
      };
      
      setAuthInfo(supabaseAuthInfo);
      setTelegramInfo({ telegramData, userContextInfo });
      
      logger.info('🔍 Complete auth check', {
        supabaseAuth: supabaseAuthInfo,
        telegram: telegramData,
        userContext: userContextInfo
      });
    };
    
    checkAllAuth();
  }, [supabaseUser, user, initData]);

  // Функция для тестирования прямого запроса к базе данных
  const testDirectDatabaseAccess = async () => {
    if (!supabase || !supabaseUser) return;
    
    try {
      logger.info('🧪 Testing direct database access');
      
      // Тестируем прямой запрос к таблице favorites без RLS
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .limit(5);
        
      logger.info('🧪 Direct favorites query result', { data, error });
      
      // Тестируем получение данных контента для избранного
      if (data && data.length > 0) {
        const contentIds = data.map(f => f.content_id);
        logger.info('🧪 Content IDs from favorites:', contentIds);
        
        // Пробуем получить данные из contents
        const { data: contentsData, error: contentsError } = await supabase
          .from('contents')
          .select('*')
          .in('id', contentIds);
          
        logger.info('🧪 Contents data result:', { contentsData, contentsError });
        
        // Если contents не работает, пробуем materials
        if (!contentsData || contentsData.length === 0) {
          const { data: materialsData, error: materialsError } = await supabase
            .from('materials')
            .select('*')
            .in('id', contentIds);
            
          logger.info('🧪 Materials data result:', { materialsData, materialsError });
        }
      }
      
      // Тестируем вставку напрямую
      const testInsert = {
        user_id: supabaseUser.id,
        content_id: testContentId
      };
      
      const { data: insertData, error: insertError } = await supabase
        .from('favorites')
        .insert(testInsert)
        .select();
        
      logger.info('🧪 Direct insert result', { insertData, insertError });
      
    } catch (err) {
      logger.error('🧪 Direct database test failed', err);
    }
  };

  // Функция для принудительного обновления избранного
  const forceRefreshFavorites = async () => {
    logger.info('🔄 Force refreshing favorites...');
    if (favorites.length > 0) {
      // Если есть функция refetch, используем её
      const { refetch } = useFavorites(supabaseUser?.id || null);
      if (refetch) {
        await refetch();
      }
    }
    // Перезагружаем страницу для полного обновления
    window.location.reload();
  };

  const handleAddTest = () => {
    addToFavorites(testContentId);
  };

  const handleRemoveTest = () => {
    removeFromFavorites(testContentId);
  };

  if (!supabaseUser) {
    return (
      <Section>
        <Cell subtitle="Пользователь не авторизован">
          <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
            <div>Telegram User: {user ? 'ЕСТЬ' : 'НЕТ'}</div>
            <div>Supabase User: {supabaseUser ? 'ЕСТЬ' : 'НЕТ'}</div>
            <div>Init Data: {initData ? 'ЕСТЬ' : 'НЕТ'}</div>
          </div>
        </Cell>
      </Section>
    );
  }

  return (
    <Section>
      <Cell subtitle="Telegram данные">
        <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
          <div>Telegram ID: {user?.id || 'НЕТ'}</div>
          <div>Init Data: {telegramInfo?.telegramData?.initData ? '✅' : '❌'}</div>
          <div>Auth Date: {telegramInfo?.telegramData?.authDate || 'НЕТ'}</div>
          <div>Hash: {telegramInfo?.telegramData?.hash ? 'ЕСТЬ' : 'НЕТ'}</div>
        </div>
      </Cell>
      
      <Cell subtitle="Supabase пользователь">
        <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
          <div>User ID: {supabaseUser?.id || 'НЕТ'}</div>
          <div>Telegram ID: {supabaseUser?.telegram_id || 'НЕТ'}</div>
          <div>First Name: {supabaseUser?.first_name || 'НЕТ'}</div>
        </div>
      </Cell>
      
      <Cell subtitle="Supabase Auth">
        <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
          <div>Has Session: {authInfo?.hasSession ? '✅' : '❌'}</div>
          <div>Session User ID: {authInfo?.sessionUserId || 'НЕТ'}</div>
          <div>Auth User ID: {authInfo?.authUserId || 'НЕТ'}</div>
          <div>User Metadata: {authInfo?.userMetadata ? 'ЕСТЬ' : 'НЕТ'}</div>
        </div>
      </Cell>
      
      <Cell subtitle="Статус избранного">
        <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
          <div>Загрузка: {loading ? 'ДА' : 'НЕТ'}</div>
          <div>Ошибка: {error || 'НЕТ'}</div>
          <div>Количество избранного: {favorites.length}</div>
          <div>Тестовый контент в избранном: {isFavorite(testContentId) ? '✅' : '❌'}</div>
        </div>
      </Cell>
      
      <Cell>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button 
            size="s" 
            onClick={testDirectDatabaseAccess}
          >
            🧪 Тест БД
          </Button>
          
          <Button 
            size="s" 
            onClick={handleAddTest}
            disabled={loading}
          >
            ➕ Добавить тест
          </Button>
          
          <Button 
            size="s" 
            onClick={handleRemoveTest}
            disabled={loading}
          >
            ➖ Удалить тест
          </Button>
          
          <Button 
            size="s" 
            onClick={forceRefreshFavorites}
            disabled={loading}
          >
            🔄 Обновить
          </Button>
        </div>
      </Cell>
      
      {favorites.length > 0 && (
        <Cell subtitle="Список избранного">
          <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
            {favorites.map((item, index) => (
              <div key={item.id}>
                {index + 1}. {item.title || 'Без названия'} ({item.id})
              </div>
            ))}
          </div>
        </Cell>
      )}
    </Section>
  );
} 