import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { usePlayer, PlayerType } from '@/contexts/PlayerContext';
import VideoPlayer from '@/components/Player/VideoPlayer';
import AudioPlayer from '@/components/Player/AudioPlayer';
import TimerPlayer from '@/components/Player/TimerPlayer';
import { supabase } from '@/lib/supabase/client';
import { PracticeCriteria } from '@/lib/supabase/hooks/useRecommendedPractice';
import './PracticePage.css';
import { useSupabaseUser } from '@/lib/supabase/hooks/useSupabaseUser';
import { initDataState as _initDataState, useSignal } from '@telegram-apps/sdk-react';
import { useFavorites } from '@/lib/supabase/hooks/useFavorites';

// SVG иконка информации для критериев
const InfoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// SVG иконка обновления для кнопки
const RefreshIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 3V8H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 16V21H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.5 8C17.6797 6.13033 16.1123 4.66053 14.1334 3.86301C12.1546 3.06548 9.9379 3.00208 7.9162 3.68259C5.8945 4.36311 4.20129 5.74065 3.13134 7.56327C2.06138 9.38589 1.69482 11.5325 2.09 13.61L3 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 13C21.1747 13.6991 21.26 14.4143 21.255 15.131C21.2505 15.7545 21.1915 16.3763 21.079 16.988C20.636 19.379 19.254 21.499 17.222 22.883C15.19 24.267 12.695 24.793 10.276 24.349C7.85707 23.9051 5.7371 22.5228 4.35297 20.4908C2.96883 18.4587 2.44315 15.9636 2.887 13.545" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Компонент для отображения критериев в попапе
const CriteriaPopup = ({ criteria }: { criteria: PracticeCriteria }) => {
  // Функция для форматирования значений критериев
  const formatCriteriaValue = (key: string, value: any): string => {
    if (value === undefined || value === null) return 'Любой';
    
    // Форматирование длительности в минуты
    if (key === 'duration') {
      return `${Math.floor(Number(value) / 60)} мин`;
    }
    
    // Перевод типов практик
    if (key === 'practice_type') {
      const practiceTypes: Record<string, string> = {
        'physical': 'Телесная',
        'breathing': 'Дыхательная',
        'meditation': 'Медитация',
        'short': 'Короткая практика'
      };
      return practiceTypes[value] || value;
    }
    
    // Перевод целей практик
    if (key === 'goal') {
      const goals: Record<string, string> = {
        'energize': 'Энергия',
        'relax': 'Расслабление',
        'stretch': 'Растяжка',
        'focus': 'Фокусировка',
        'thinking': 'Мышление',
        'sleep': 'Сон',
        'relationships': 'Отношения',
        'energy': 'Энергия',
        'body': 'Тело'
      };
      return goals[value] || value;
    }
    
    // По умолчанию возвращаем значение как есть
    return value.toString();
  };
  
  return (
    <div className="criteria-popup">
      <h3>Критерии подбора практики</h3>
      <ul className="criteria-list">
        {Object.entries(criteria).map(([key, value]) => (
          value !== null && 
          <li key={key} className="criteria-item">
            <span className="criteria-key">{key}:</span>
            <span className="criteria-value">{formatCriteriaValue(key, value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Основной компонент
const AutoPlayPracticePage: React.FC = () => {
  const { contentId, eventId } = useParams<{
    contentId?: string;
    eventId?: string;
  }>();
  
  const navigate = useNavigate();
  const location = useLocation();
  const { state, setActiveType, setContentData, play } = usePlayer();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<any>(null);
  const [showCriteria, setShowCriteria] = useState<boolean>(false);
  
  // Получаем initData из Telegram SDK
  const initDataState = useSignal(_initDataState);
  
  // Используем хук с initDataState
  const { supabaseUser } = useSupabaseUser(initDataState);
  
  // Упрощенная инициализация критериев 
  const criteria: PracticeCriteria = {
    practice_type: 'meditation', // Значение по умолчанию, чтобы избежать ошибок TypeScript
    duration: 600, // 10 минут
    goal: 'relax', // По умолчанию - расслабление
    approach: 'guided', // По умолчанию - с сопровождением
  };
  
  // Отслеживаем избранное для практики
  const userId = supabaseUser?.id || null;
  const favorites = useFavorites(userId);
  const { isFavorite } = favorites;
  console.log(isFavorite)
  const fetchContent = async () => {
    if (!contentId) {
      setError('ID контента не указан');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('AutoPlayPracticePage: Загружаем контент с ID:', contentId);

      // Получаем данные контента
      if (!supabase) {
        throw new Error('Supabase клиент не инициализирован');
      }

      const { data, error } = await supabase
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
          .eq('id', contentId)
          .single();

      if (error) {
        console.error('AutoPlayPracticePage: Ошибка запроса контента:', error);
        throw error;
      }

      if (!data) {
        console.error('AutoPlayPracticePage: Данные контента не найдены');
        setError('Контент не найден');
        setLoading(false);
        return;
      }

      console.log('AutoPlayPracticePage: Получены данные контента:', data.title, 'kinescope_id:', data.kinescope_id);
      setContent(data);

      // Определяем тип плеера на основе данных практики
      let playerType: PlayerType = PlayerType.VIDEO;

      if (data.content_types?.slug === 'audio') {
        console.log('AutoPlayPracticePage: Устанавливаем тип плеера: AUDIO');
        playerType = PlayerType.AUDIO;
      } else if (data.content_types?.slug === 'timer') {
        console.log('AutoPlayPracticePage: Устанавливаем тип плеера: TIMER');
        playerType = PlayerType.TIMER;
      } else {
        console.log('AutoPlayPracticePage: Устанавливаем тип плеера: VIDEO');
      }

      // Устанавливаем данные для плеера
      setActiveType(playerType);

      // Обогащаем данные для контекста плеера
      const contentDataForPlayer = {
        title: data.title,
        description: data.description || '',
        thumbnailUrl: data.thumbnail_url || '',
        duration: data.duration || 0,
        kinescopeId: data.kinescope_id || '',
        audioPath: data.audio_file_path || '',
        backgroundImage: data.background_image_url || ''
      };

      setContentData(contentDataForPlayer);
      console.log('AutoPlayPracticePage: Установлены данные контента для плеера:', contentDataForPlayer);

      // Автоматически начинаем воспроизведение
      setTimeout(() => {
        console.log('AutoPlayPracticePage: Автоматический запуск воспроизведения');
        play();
      }, 500);

    } catch (err: any) {
      console.error('AutoPlayPracticePage: Ошибка загрузки контента:', err);
      setError(err.message || 'Ошибка загрузки контента');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvent = async () => {
    if (!eventId) {
      setError('ID события не указан');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('AutoPlayPracticePage: Загружаем событие с ID:', eventId);

      if (!supabase) {
        throw new Error('Supabase клиент не инициализирован');
      }

      const { data, error } = await supabase
          .from('events')
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
          .eq('id', eventId)
          .single();

      if (error) {
        console.error('AutoPlayPracticePage: Ошибка запроса события:', error);
        throw error;
      }

      if (!data) {
        console.error('AutoPlayPracticePage: Данные события не найдены');
        setError('Событие не найдено');
        setLoading(false);
        return;
      }

      console.log('AutoPlayPracticePage: Получены данные события:', data.title, 'kinescope_id:', data.kinescope_id);
      setContent(data);

      // Определяем тип плеера на основе данных события
      let playerType: PlayerType = PlayerType.VIDEO;

      if (data.content_types?.slug === 'audio') {
        console.log('AutoPlayPracticePage: Устанавливаем тип плеера: AUDIO');
        playerType = PlayerType.AUDIO;
      } else if (data.content_types?.slug === 'timer') {
        console.log('AutoPlayPracticePage: Устанавливаем тип плеера: TIMER');
        playerType = PlayerType.TIMER;
      } else {
        console.log('AutoPlayPracticePage: Устанавливаем тип плеера: VIDEO');
      }

      // Устанавливаем данные для плеера
      setActiveType(playerType);

      // Обогащаем данные для контекста плеера
      const contentDataForPlayer = {
        title: data.title,
        description: data.description || '',
        thumbnailUrl: data.thumbnail_url || '',
        duration: data.duration || 0,
        kinescopeId: data.kinescope_id || '',
        audioPath: data.audio_file_path || '',
        backgroundImage: data.background_image_url || ''
      };

      setContentData(contentDataForPlayer);
      console.log('AutoPlayPracticePage: Установлены данные события для плеера:', contentDataForPlayer);

      // Автоматически начинаем воспроизведение
      setTimeout(() => {
        console.log('AutoPlayPracticePage: Автоматический запуск воспроизведения события');
        play();
      }, 500);

    } catch (err: any) {
      console.error('AutoPlayPracticePage: Ошибка загрузки события:', err);
      setError(err.message || 'Ошибка загрузки события');
    } finally {
      setLoading(false);
    }
  };
  // Получаем данные о контенте
  useEffect(() => {
    // Проверяем, если это роут таймера с данными из квиза
    const locationState = location.state as { 
      duration?: number; 
      object?: string; 
      fromQuiz?: boolean; 
      practiceType?: string;
    } | null;
    
    if (contentId === 'timer' && locationState?.fromQuiz) {
      // Это таймер из квиза - настраиваем его
      setActiveType(PlayerType.TIMER);
      
      const timerData = {
        title: 'Самостоятельная медитация',
        description: 'Сконцентрируйтесь на выбранном объекте',
        thumbnailUrl: '',
        duration: locationState.duration || 600,
        kinescopeId: '',
        audioPath: '',
        backgroundImage: '',
        meditationObject: locationState.object || 'breath'
      };
      
      setContentData(timerData);
      setContent({
        title: timerData.title,
        description: timerData.description,
        duration: timerData.duration,
        content_types: { slug: 'timer' },
        meditation_object: locationState.object
      });
      
      setLoading(false);
      
      // Автоматически начинаем
      setTimeout(() => {
        play();
      }, 500);
      
      return;
    }
    
    // Проверяем, если это событие
    if (eventId) {
      fetchEvent();
      return;
    }
    
    // Иначе загружаем обычный контент
    if(contentId && contentId !== 'timer'){
      fetchContent();
    }
  }, [contentId, eventId, location.state]);
  
  // Обработка загрузки
  if (loading) {
    return <div className="player-loading">Загрузка практики...</div>;
  }
  
  // Обработка ошибок
  if (error) {
    return (
      <div className="player-error">
        <p>{error}</p>
        <button onClick={() => navigate(-1)} className="back-button">Вернуться назад</button>
      </div>
    );
  }
  
  // Выбор типа плеера
  const renderPlayer = () => {
    if (!content && state.activeType !== PlayerType.TIMER) {
      return <div className="player-error">Контент не найден</div>;
    }
    
    console.log('AutoPlayPracticePage: Рендеринг плеера, тип:', state.activeType, 'контент:', content?.title);
    
    switch (state.activeType) {
      case PlayerType.VIDEO:
        return (
          <VideoPlayer />
        );
      case PlayerType.AUDIO:
        return (
          <AudioPlayer
            audioUrl={content.audio_file_path}
            title={content.title}
            description={content.description}
          />
        );
      case PlayerType.TIMER:
        let duration = 600; // 10 минут по умолчанию
        if (content.duration) {
          duration = content.duration;
        }
        
        // Получаем объект концентрации и переводим на русский
        const getObjectName = (obj: string) => {
          switch (obj) {
            case 'breath': return 'Дыхание';
            case 'thought': return 'Мысли';
            case 'body': return 'Тело';
            case 'none': return 'Ощущения';
            default: return 'Дыхание';
          }
        };
        
        const meditationObject = getObjectName(content.meditation_object || 'breath');
        
        return (
          <TimerPlayer
            duration={duration}
            title={content.title || 'Самостоятельная медитация'}
            meditationObject={meditationObject}
            instructions={content.description || `Сконцентрируйтесь на своем объекте медитации`}
          />
        );
      default:
        return <div className="player-error">Неизвестный тип контента</div>;
    }
  };
  
  // Обработчик получения другой рекомендованной практики
  const handleRefreshPractice = async () => {
    try {
      setLoading(true);
      
      // Сбрасываем состояние квиза перед переходом
      localStorage.removeItem('quizState');
      
      // Перенаправляем на страницу квиза для получения новой рекомендации
      console.log('Перенаправляем на страницу квиза для получения новой рекомендации');
      navigate('/quiz');
      
    } catch (err: any) {
      console.error('Ошибка при перенаправлении:', err);
      setError(err.message || 'Ошибка при получении рекомендации');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="practice-page">
      <div className="player-container">
        {renderPlayer()}
      </div>
      
      <div className="practice-info">
        <h1 className="practice-title">{content?.title || 'Практика'}</h1>
        <p className="practice-description">{content?.description || ''}</p>
        
        <div className="practice-actions">
          <button className="refresh-button" onClick={handleRefreshPractice}>
            <RefreshIcon />
            {content?.content_types?.slug === 'timer' ? 'Выбрать другую цель' : 'Другая практика'}
          </button>
          
          <button 
            className="criteria-button" 
            onClick={() => setShowCriteria(!showCriteria)}
            aria-label="Показать критерии"
          >
            <InfoIcon />
          </button>
          
          {/* Попап с критериями */}
          {showCriteria && (
            <>
              <div className="popup-backdrop" onClick={() => setShowCriteria(false)} />
              <CriteriaPopup criteria={criteria} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AutoPlayPracticePage;
