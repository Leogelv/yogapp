import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  initDataState as _initDataState,
  useSignal,
} from '@telegram-apps/sdk-react';
import { Page } from '@/components/Page';
import { supabase } from '@/lib/supabase/client';
import { useSupabaseUser } from '@/lib/supabase/hooks/useSupabaseUser';
import { PlayerProvider } from '@/contexts/PlayerContext';
import { MdLogout } from 'react-icons/md';
import './AdminPage.css';

// Импорт компонентов админ-панели
import {
  PracticesManager,
  EditPracticeModal,
  CategoriesManager,
  QuizManager,
  UsersManager,
  EventsManager
} from './components';

// Импорт типов
import type { AdminTab, Practice, Category, ContentType } from './types';

// Добавляем класс admin-mode к body при монтировании компонента
const addBodyClass = () => {
  document.body.classList.add('admin-mode');
  return () => {
    document.body.classList.remove('admin-mode');
  };
};

const AdminPage: React.FC = () => {
  const initDataState = useSignal(_initDataState);
  const { supabaseUser, loading: userLoading, error: userError } = useSupabaseUser(initDataState);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<AdminTab>('practices');
  const [passwordAuth, setPasswordAuth] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [previewPractice, setPreviewPractice] = useState<Practice | null>(null);
  
  // Добавляем состояние для редактирования практики непосредственно в AdminPage
  const [editPractice, setEditPractice] = useState<Practice | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [savingPractice, setSavingPractice] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Добавляем класс 'admin-mode' к body при монтировании компонента
  useEffect(() => {
    return addBodyClass();
  }, []);

  console.log('AdminPage рендеринг, previewPractice:', previewPractice !== null, 'editPractice:', editPractice !== null);

  // Проверяем права администратора
  useEffect(() => {
    if (!userLoading) {
      if (userError) {
        setError('Ошибка при загрузке данных пользователя');
      } else if (!supabaseUser) {
        setError('Пользователь не найден');
      } else if (!supabaseUser.is_admin && !passwordAuth) {
        // Если у пользователя нет прав админа, перенаправляем на главную
        navigate('/');
      }
    }
  }, [supabaseUser, userLoading, userError, navigate, passwordAuth]);

  // Загрузка категорий и типов контента для селектов
  useEffect(() => {
    if (!passwordAuth && !supabaseUser?.is_admin) return;
    
    const fetchMetadata = async () => {
      if (!supabase) return;
      
      try {
        console.log('Загружаем метаданные (категории и типы контента)...');
        
        const [{ data: cats, error: catError }, { data: types, error: typeError }] = await Promise.all([
          supabase.from('categories').select('*').order('name'),
          supabase.from('content_types').select('id, name, slug').order('name')
        ]);
        
        if (catError) {
          console.error('Ошибка при загрузке категорий:', catError);
          throw catError;
        }
        
        if (typeError) {
          console.error('Ошибка при загрузке типов контента:', typeError);
          throw typeError;
        }
        
        console.log('Получено категорий:', cats?.length, 'типов контента:', types?.length);
        console.log('Категории:', cats);
        
        setCategories(cats || []);
        setContentTypes(types || []);
      } catch (error) {
        console.error('Ошибка при загрузке метаданных:', error);
      }
    };
    
    fetchMetadata();
  }, [supabaseUser, passwordAuth]);

  // Обработчик входа по паролю (для дополнительной защиты)
  const checkPassword = () => {
    console.log('checkPassword клик');
    // Захардкоженный пароль для демонстрации
    if (password === 'admin123') {
      setPasswordAuth(true);
      setError(null);
      localStorage.setItem('admin_authenticated', 'true');
    } else {
      setError('Неверный пароль');
    }
  };

  // Проверка аутентификации по паролю при загрузке
  useEffect(() => {
    const isAuth = localStorage.getItem('admin_authenticated') === 'true';
    if (isAuth) {
      setPasswordAuth(true);
    }
  }, []);

  // Обработчик выхода
  const handleLogout = () => {
    console.log('handleLogout клик');
    setPasswordAuth(false);
    localStorage.removeItem('admin_authenticated');
    navigate('/');
  };

  // Обработчик сохранения изменений
  const handleSavePractice = async (form: Practice) => {
    console.log('handleSavePractice вызван с формой:', form);
    setSavingPractice(true);
    setSaveError(null);
    try {
      if (!supabase) throw new Error('Supabase не инициализирован');
      console.log('Сохраняем изменения практики:', form.title);
      
      const { error } = await supabase
        .from('contents')
        .update(form)
        .eq('id', editPractice!.id);
        
      if (error) throw error;
      
      console.log('Практика успешно обновлена');
      // Закрываем модалку редактирования
      setEditPractice(null);
      
      // Данные обновятся автоматически через Realtime подписку,
      // но для уверенности можно явно сбросить чтобы PracticesManager перезапросил данные
      // (это не обязательно, если Realtime работает правильно)
    } catch (e: any) {
      console.error('Ошибка при сохранении практики:', e);
      setSaveError(e.message || 'Ошибка при сохранении');
    } finally {
      setSavingPractice(false);
    }
  };

  // Вспомогательная функция для установки практики для предпросмотра
  const handlePreviewPractice = (practice: Practice | null) => {
    if (practice) {
      console.log('handlePreviewPractice вызван:', practice.title);
    }
    setPreviewPractice(practice);
  };

  // Вспомогательная функция для установки практики для редактирования
  const handleEditPractice = (practice: Practice | null) => {
    if (practice) {
      console.log('handleEditPractice вызван:', practice.title);
    }
    setEditPractice(practice);
  };

  // Если загрузка или нет прав администратора и нет аутентификации по паролю, показываем форму входа
  if (userLoading || (!supabaseUser?.is_admin && !passwordAuth)) {
    return (
      <Page>
        <div className="admin-login">
          <h1>Вход в Панель Администратора</h1>
          {userLoading ? (
            <div className="admin-loading">Проверка прав доступа...</div>
          ) : (
            <>
              {!supabaseUser?.is_admin && (
                <div className="admin-warning">
                  У вас нет прав администратора. Введите дополнительный пароль для входа.
                </div>
              )}
              {error && <div className="admin-error">{error}</div>}
              <input
                type="password"
                placeholder="Введите пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="admin-input"
              />
              <button onClick={checkPassword} className="admin-button">
                Войти
              </button>
            </>
          )}
        </div>
      </Page>
    );
  }

  const handleTabChange = (tab: AdminTab) => {
    console.log('Смена вкладки на:', tab);
    setActiveTab(tab);
  };

  return (
    <PlayerProvider>
      <Page showTabBar={false}>
        <div className="admin-page">
          <div className="admin-header">
            <h1>Панель Администратора</h1>
            <button onClick={handleLogout} className="admin-logout-btn">
              <MdLogout size={18} />
              Выйти
            </button>
          </div>
          
          <div className="admin-tabs">
            <button
              className={`admin-tab ${activeTab === 'practices' ? 'active' : ''}`}
              onClick={() => handleTabChange('practices')}
            >
              Практики
            </button>
            <button
              className={`admin-tab ${activeTab === 'categories' ? 'active' : ''}`}
              onClick={() => handleTabChange('categories')}
            >
              Категории
            </button>
            <button
              className={`admin-tab ${activeTab === 'quiz' ? 'active' : ''}`}
              onClick={() => handleTabChange('quiz')}
            >
              Настройки квиза
            </button>
            <button
              className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => handleTabChange('users')}
            >
              Пользователи
            </button>
            <button
              className={`admin-tab ${activeTab === 'events' ? 'active' : ''}`}
              onClick={() => handleTabChange('events')}
            >
              События
            </button>
          </div>
          
          {/* Контент вкладок */}
          <div className="admin-content">
            {activeTab === 'practices' && <PracticesManager 
              setPreviewPractice={handlePreviewPractice} 
              setEditPractice={handleEditPractice}
              categories={categories} 
            />}
            {activeTab === 'categories' && <CategoriesManager />}
            {activeTab === 'quiz' && <QuizManager />}
            {activeTab === 'users' && <UsersManager />}
            {activeTab === 'events' && <EventsManager 
              categories={categories}
              contentTypes={contentTypes}
            />}
          </div>

          {/* Попап предпросмотра видео */}
          {previewPractice && (
            <div 
              className="admin-modal-backdrop" 
              onClick={() => {
                console.log('Закрытие модалки предпросмотра по клику на backdrop');
                setPreviewPractice(null);
              }}
            >
              <div 
                className="admin-modal" 
                onClick={(e) => {
                  console.log('Клик внутри модалки предпросмотра (stopPropagation)');
                  e.stopPropagation();
                }}
              >
                <button 
                  className="admin-modal-close" 
                  onClick={(e) => {
                    console.log('Закрытие модалки предпросмотра по кнопке');
                    e.stopPropagation();
                    setPreviewPractice(null);
                  }}
                >✕</button>
                <h3>{previewPractice.title}</h3>
                
                {/* Отображаем видео из Kinescope - только через iframe для надежности */}
                {previewPractice.kinescope_id ? (
                  <div style={{ position: 'relative', paddingTop: '56.25%', width: '100%' }}>
                    <iframe 
                      src={`https://kinescope.io/embed/${previewPractice.kinescope_id}`} 
                      allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer; clipboard-write;"
                      frameBorder="0"
                      allowFullScreen
                      style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0 }}
                    ></iframe>
                  </div>
                ) : (
                  <div style={{ padding: '20px', backgroundColor: 'rgba(30, 30, 46, 0.3)', borderRadius: '8px', textAlign: 'center' }}>
                    ID видео не найден
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Попап редактирования практики перенесен на уровень AdminPage */}
          {editPractice && (
            <EditPracticeModal
              practice={editPractice}
              categories={categories}
              contentTypes={contentTypes}
              onClose={() => {
                console.log('Закрытие модалки редактирования');
                setEditPractice(null);
              }}
              onSave={handleSavePractice}
              saving={savingPractice}
              error={saveError}
            />
          )}
        </div>
      </Page>
    </PlayerProvider>
  );
};

export default AdminPage;
