import React, { useRef, useEffect } from 'react';
import { usePlayer } from '../../contexts/PlayerContext';
import KinescopePlayer from '@kinescope/react-kinescope-player';
import './Player.css';

interface VideoPlayerProps {
  videoId: string;
  title: string;
  description?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, title, description }) => {
  const { state, play, pause, seekTo, toggleFullscreen } = usePlayer();
  const playerRef = useRef<any>(null);

  // Обработчики событий для Kinescope Player
  const handlePlay = () => {
    play();
  };

  const handlePause = () => {
    pause();
  };

  const handleTimeUpdate = ({ currentTime }: { currentTime: number }) => {
    seekTo(currentTime);
  };

  const handleEnded = () => {
    pause();
  };

  // Управление полноэкранным режимом
  useEffect(() => {
    const playerContainer = document.querySelector('.video-player-wrapper');
    if (!playerContainer) return;

    if (state.fullscreen) {
      if (document.fullscreenElement !== playerContainer) {
        playerContainer.requestFullscreen().catch(err => {
          console.error(`Ошибка перехода в полноэкранный режим: ${err.message}`);
        });
      }
    } else {
      if (document.fullscreenElement === playerContainer) {
        document.exitFullscreen().catch(err => {
          console.error(`Ошибка выхода из полноэкранного режима: ${err.message}`);
        });
      }
    }
  }, [state.fullscreen]);

  // Управление воспроизведением
  useEffect(() => {
    if (!playerRef.current) return;
    
    if (state.playing) {
      playerRef.current.play().catch((err: Error) => {
        console.error('Ошибка при запуске воспроизведения:', err);
      });
    } else {
      playerRef.current.pause().catch((err: Error) => {
        console.error('Ошибка при постановке на паузу:', err);
      });
    }
  }, [state.playing]);

  // Управление громкостью
  useEffect(() => {
    if (!playerRef.current) return;
    
    if (state.muted) {
      playerRef.current.mute().catch((err: Error) => {
        // Оставляем только логирование критичных ошибок
      });
    } else {
      playerRef.current.unmute().catch((err: Error) => {
        // Оставляем только логирование критичных ошибок
      });
      playerRef.current.setVolume(state.volume).catch((err: Error) => {
        // Оставляем только логирование критичных ошибок  
      });
    }
  }, [state.volume, state.muted]);

  // Управление скоростью воспроизведения
  useEffect(() => {
    if (!playerRef.current) return;
    
    playerRef.current.setPlaybackRate(state.playbackRate).catch((err: Error) => {
      // Оставляем только логирование критичных ошибок
    });
  }, [state.playbackRate]);

  return (
    <div className="video-player-container">
      <div className="video-player-header">
        <h2>{title || 'Без заголовка'}</h2>
        {description && <p className="video-description">{description}</p>}
      </div>
      
      <div className="video-player-wrapper">
        {videoId ? (
          <KinescopePlayer
            ref={playerRef}
            videoId={videoId}
            width="100%"
            height="100%"
            controls={true}
            autoPlay={false}
            muted={state.muted}
            onPlay={handlePlay}
            onPause={handlePause}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            onError={(err: unknown) => {
              // Оставляем только критичные ошибки
              if (err instanceof Error && err.message) {
                console.error('Критическая ошибка плеера:', err.message);
              }
            }}
          />
        ) : (
          <div className="error-message">Ошибка: ID видео не указан</div>
        )}
        
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