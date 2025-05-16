import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PlayerProvider, usePlayer, PlayerType } from '../../contexts/PlayerContext';
import VideoPlayer from '../../components/Player/VideoPlayer';
import AudioPlayer from '../../components/Player/AudioPlayer';
import TimerPlayer from '../../components/Player/TimerPlayer';
import { supabase } from '../../lib/supabase/client';
import { openTelegramLink } from '@telegram-apps/sdk-react';
import './PracticePage.css';

// Компонент подбирает подходящий плеер в зависимости от типа контента
const PlayerSelector: React.FC = () => {
  const { state, setActiveType, setContentData } = usePlayer();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { contentId, meditationType, meditationObject } = useParams();

  // Получаем данные контента
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        
        if (!supabase) {
          throw new Error('Supabase клиент не инициализирован');
        }
        
        if (contentId) {
          // Запрос контента из Supabase
          const { data, error } = await supabase
            .from('contents')
            .select(`
              *,
              content_types(name, slug)
            `)
            .eq('id', contentId)
            .single();
            
          if (error) {
            throw error;
          }
          
          if (data) {
            setContent(data);
            setContentData(data);
            
            // Определяем тип плеера на основе типа контента
            if (data.content_types?.slug === 'video' || data.content_types?.slug === 'physical' || data.content_types?.slug === 'breathing') {
              setActiveType(PlayerType.VIDEO);
            } else if (data.content_types?.slug === 'audio' || data.content_types?.slug === 'meditation') {
              // Проверяем, если это медитация с таймером
              if (meditationType === 'self') {
                setActiveType(PlayerType.TIMER);
              } else {
                setActiveType(PlayerType.AUDIO);
              }
            } else {
              setActiveType(PlayerType.VIDEO); // По умолчанию видео
            }
          }
        } else if (meditationType === 'self') {
          // Для самостоятельных медитаций не нужен контент
          setActiveType(PlayerType.TIMER);
          setContent({
            title: 'Самостоятельная медитация',
            description: 'Сконцентрируйтесь на своем дыхании и следуйте инструкциям'
          });
          setContentData({
            title: 'Самостоятельная медитация',
            description: 'Сконцентрируйтесь на своем дыхании и следуйте инструкциям',
            duration: parseInt(meditationObject?.split('-')[1] || '600', 10)
          });
        } else {
          setError('Не указан ID контента');
        }
      } catch (err: any) {
        console.error('Ошибка загрузки контента:', err);
        setError(err.message || 'Ошибка загрузки контента');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [contentId, meditationType, meditationObject, setActiveType, setContentData]);

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

    switch (state.activeType) {
      case PlayerType.VIDEO:
        return (
          <VideoPlayer
            videoId={content.kinescope_id}
            title={content.title}
            description={content.description}
          />
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
        let object = 'Дыхание';
        
        // Парсинг параметров самостоятельной медитации
        if (meditationObject) {
          const parts = meditationObject.split('-');
          if (parts.length >= 2) {
            object = parts[0];
            duration = parseInt(parts[1], 10);
          }
        }
        
        return (
          <TimerPlayer
            duration={duration}
            title="Самостоятельная медитация"
            meditationObject={object}
            instructions="Закройте глаза и сфокусируйтесь на выбранном объекте медитации"
          />
        );
      default:
        return <div className="player-error">Выберите тип практики</div>;
    }
  };

  // Функция для поделиться через Telegram
  const handleShare = () => {
    const shareText = `Попробуй эту практику: ${content?.title || 'Медитация'}`;
    openTelegramLink(`tg://msg_url?text=${encodeURIComponent(shareText)}`);
  };

  return (
    <div className="practice-content">
      {renderPlayer()}
      
      <div className="practice-actions">
        <button onClick={() => navigate(-1)} className="back-button">
          Вернуться к выбору
        </button>
        
        <button className="share-button" onClick={handleShare}>
          Поделиться
        </button>
      </div>
    </div>
  );
};

// Основной компонент страницы практики
const PracticePage: React.FC = () => {
  return (
    <PlayerProvider>
      <div className="practice-page">
        <PlayerSelector />
      </div>
    </PlayerProvider>
  );
};

export default PracticePage; 