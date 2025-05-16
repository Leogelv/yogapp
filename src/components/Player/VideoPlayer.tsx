import React, { useEffect, useRef } from 'react';
import { usePlayer } from '../../contexts/PlayerContext';
import './Player.css';

// Определение типов для Kinescope
declare global {
  interface Window {
    Kinescope?: {
      IframePlayer: new (element: HTMLElement, options: any) => any;
    };
  }
}

interface VideoPlayerProps {
  videoId: string;
  title: string;
  description?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, title, description }) => {
  const { state, play, pause, seekTo, toggleFullscreen } = usePlayer();
  const playerRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<any>(null);

  // Инициализация Kinescope плеера
  useEffect(() => {
    if (!videoId || !playerRef.current) return;

    // Функция загрузки Kinescope API
    const loadKinescopeAPI = () => {
      return new Promise<void>((resolve) => {
        // Проверка, загружен ли уже скрипт
        if (window.Kinescope) {
          resolve();
          return;
        }

        // Создание и загрузка скрипта
        const script = document.createElement('script');
        script.src = 'https://player.kinescope.io/latest/iframe.player.js';
        script.async = true;
        script.onload = () => resolve();
        document.body.appendChild(script);
      });
    };

    // Инициализация плеера
    const initPlayer = async () => {
      await loadKinescopeAPI();
      
      if (window.Kinescope && playerRef.current) {
        // Создаем новый экземпляр плеера
        playerInstanceRef.current = new window.Kinescope.IframePlayer(playerRef.current, {
          url: `https://kinescope.io/embed/${videoId}`,
          autoplay: false,
          loop: false,
        });

        // Добавляем обработчики событий
        playerInstanceRef.current.on('ready', () => {
          console.log('Kinescope player ready');
        });

        playerInstanceRef.current.on('play', () => {
          play();
        });

        playerInstanceRef.current.on('pause', () => {
          pause();
        });

        playerInstanceRef.current.on('timeupdate', (data: { currentTime: number }) => {
          seekTo(data.currentTime);
        });

        playerInstanceRef.current.on('ended', () => {
          pause();
        });
      }
    };

    initPlayer();

    // Очистка при размонтировании
    return () => {
      if (playerInstanceRef.current) {
        playerInstanceRef.current.destroy();
      }
    };
  }, [videoId, play, pause, seekTo]);

  // Управление воспроизведением
  useEffect(() => {
    if (!playerInstanceRef.current) return;

    if (state.playing) {
      playerInstanceRef.current.play();
    } else {
      playerInstanceRef.current.pause();
    }
  }, [state.playing]);

  // Управление громкостью
  useEffect(() => {
    if (!playerInstanceRef.current) return;
    
    playerInstanceRef.current.setVolume(state.muted ? 0 : state.volume);
  }, [state.volume, state.muted]);

  // Управление скоростью воспроизведения
  useEffect(() => {
    if (!playerInstanceRef.current) return;
    
    playerInstanceRef.current.setPlaybackRate(state.playbackRate);
  }, [state.playbackRate]);

  // Управление полноэкранным режимом
  useEffect(() => {
    if (!playerRef.current) return;

    if (state.fullscreen) {
      if (document.fullscreenElement !== playerRef.current) {
        playerRef.current.requestFullscreen().catch(err => {
          console.error(`Ошибка перехода в полноэкранный режим: ${err.message}`);
        });
      }
    } else {
      if (document.fullscreenElement === playerRef.current) {
        document.exitFullscreen().catch(err => {
          console.error(`Ошибка выхода из полноэкранного режима: ${err.message}`);
        });
      }
    }
  }, [state.fullscreen]);

  return (
    <div className="video-player-container">
      <div className="video-player-header">
        <h2>{title}</h2>
        {description && <p className="video-description">{description}</p>}
      </div>
      
      <div className="video-player-wrapper">
        <div ref={playerRef} className="kinescope-player"></div>
        
        {/* Пользовательские элементы управления */}
        {state.displayControls && (
          <div className="custom-controls">
            <button className="fullscreen-btn" onClick={toggleFullscreen}>
              {state.fullscreen ? 'Выйти из полноэкрана' : 'Полный экран'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer; 