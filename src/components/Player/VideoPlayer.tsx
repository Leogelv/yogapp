import React, { useRef, useEffect, useState } from 'react';
import { usePlayer } from '../../contexts/PlayerContext';
import './Player.css';

interface VideoPlayerProps {
  videoId: string;
  title: string;
  description?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, title, description }) => {
  const { state, toggleFullscreen } = usePlayer();
  const [videoError, setVideoError] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Fallback для демо/тестирования
  const fallbackVideoId = 'CetLf3cKNDETJhGsUaP2s9';
  
  // ID видео с учетом возможных ошибок
  const effectiveVideoId = videoId || fallbackVideoId;

  // Управление полноэкранным режимом
  useEffect(() => {
    const playerContainer = document.querySelector('.video-player-wrapper');
    if (!playerContainer) return;

    if (state.fullscreen) {
      if (document.fullscreenElement !== playerContainer) {
        playerContainer.requestFullscreen().catch(() => {
          // Ошибка перехода в полноэкранный режим
          console.error('Ошибка перехода в полноэкранный режим');
        });
      }
    } else {
      if (document.fullscreenElement === playerContainer) {
        document.exitFullscreen().catch(() => {
          // Ошибка выхода из полноэкранного режима
          console.error('Ошибка выхода из полноэкранного режима');
        });
      }
    }
  }, [state.fullscreen]);

  // Обработчик ошибки загрузки iframe
  const handleIframeError = () => {
    setVideoError(true);
    console.error('Ошибка загрузки видео с Kinescope ID:', videoId);
  };

  console.log('Рендеринг VideoPlayer с videoId:', videoId, 'effectiveVideoId:', effectiveVideoId);

  return (
    <div className="video-player-container">
      <div className="video-player-header">
        <h2>{title || 'Без заголовка'}</h2>
        {description && <p className="video-description">{description}</p>}
        {videoError && (
          <div className="video-error-banner">
            <p>Оригинальное видео недоступно. Используется демо-контент.</p>
          </div>
        )}
      </div>
      
      <div className="video-player-wrapper">
        {effectiveVideoId ? (
          <div style={{ position: 'relative', paddingTop: '56.25%', width: '100%' }}>
            <iframe 
              ref={iframeRef}
              src={`https://kinescope.io/embed/${effectiveVideoId}`}
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer; clipboard-write;"
              frameBorder="0"
              allowFullScreen
              style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0 }}
              title={title || 'Видео'}
              onError={handleIframeError}
            ></iframe>
          </div>
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