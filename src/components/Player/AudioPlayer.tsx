import React, { useEffect, useRef, useState } from 'react';
import { usePlayer } from '../../contexts/PlayerContext';
import './Player.css';

interface AudioPlayerProps {
  audioUrl: string;
  title: string;
  description?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, title, description }) => {
  const { state, play, pause, seekTo } = usePlayer();
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isTrackingProgress] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [audioReady, setAudioReady] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  // Определяем мобильное устройство
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Инициализация аудио элемента
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    
    // Сброс состояний при смене URL
    setIsLoading(true);
    setLoadError(null);
    setAudioReady(false);
    setUserInteracted(false);

    // Обработчики загрузки
    const handleLoadStart = () => {
      console.log('Начало загрузки аудио');
      setIsLoading(true);
      setLoadError(null);
    };

    const handleLoadedMetadata = () => {
      console.log('Метаданные загружены');
      setAudioReady(true);
    };

    const handleCanPlay = () => {
      console.log('Аудио готово к воспроизведению');
      setIsLoading(false);
      setAudioReady(true);
    };

    const handleCanPlayThrough = () => {
      console.log('Аудио полностью загружено');
      setIsLoading(false);
      setAudioReady(true);
    };

    const handleError = (e: Event) => {
      console.error('Ошибка загрузки аудио:', e);
      const target = e.target as HTMLAudioElement;
      let errorMessage = 'Ошибка загрузки аудио';
      
      if (target.error) {
        switch (target.error.code) {
          case target.error.MEDIA_ERR_ABORTED:
            errorMessage = 'Загрузка прервана';
            break;
          case target.error.MEDIA_ERR_NETWORK:
            errorMessage = 'Ошибка сети';
            break;
          case target.error.MEDIA_ERR_DECODE:
            errorMessage = 'Ошибка декодирования';
            break;
          case target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = 'Формат не поддерживается';
            break;
        }
      }
      
      setLoadError(errorMessage);
      setIsLoading(false);
    };

    const handleStalled = () => {
      console.warn('Загрузка аудио приостановлена');
    };

    const handleWaiting = () => {
      console.log('Ожидание данных...');
    };

    // Добавляем обработчики
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('error', handleError);
    audio.addEventListener('stalled', handleStalled);
    audio.addEventListener('waiting', handleWaiting);

    // Принудительная загрузка для мобильных устройств
    if (isMobile) {
      // Для мобильных устройств используем более мягкую загрузку
      audio.preload = 'metadata';
      setTimeout(() => {
        audio.load();
      }, 100);
    } else {
      audio.load();
    }

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('stalled', handleStalled);
      audio.removeEventListener('waiting', handleWaiting);
    };
  }, [audioUrl, isMobile]);

  // Синхронизация с аудио элементом
  useEffect(() => {
    if (!audioRef.current || !audioReady) return;

    const audio = audioRef.current;

    // Установка начальной громкости
    audio.volume = state.muted ? 0 : state.volume;
    
    // Установка скорости воспроизведения
    audio.playbackRate = state.playbackRate;
    
    // Обработчики событий
    const handlePlay = () => play();
    const handlePause = () => pause();
    const handleTimeUpdate = () => {
      if (!isTrackingProgress && audio.currentTime !== state.currentTime) {
        seekTo(audio.currentTime);
      }
    };
    const handleDurationChange = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        seekTo(0);
      }
    };
    const handleEnded = () => pause();

    // Добавление обработчиков
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    // Очистка обработчиков
    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isTrackingProgress, play, pause, seekTo, audioReady]);

  // Обработка первого взаимодействия пользователя
  const handleFirstInteraction = async () => {
    if (!audioRef.current || userInteracted) return;
    
    try {
      // Попытка воспроизведения и сразу паузы для "разблокировки" аудио
      await audioRef.current.play();
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setUserInteracted(true);
      console.log('Аудио разблокировано для мобильного устройства');
    } catch (error) {
      console.log('Не удалось разблокировать аудио:', error);
    }
  };

  // Обработка клика на кнопку воспроизведения
  const handlePlayPause = async () => {
    if (!audioRef.current || !audioReady) return;

    // Для мобильных устройств сначала разблокируем аудио
    if (isMobile && !userInteracted) {
      await handleFirstInteraction();
    }

    try {
      if (state.playing) {
        audioRef.current.pause();
        pause();
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          await playPromise;
          play();
        }
      }
    } catch (error) {
      console.error('Ошибка воспроизведения:', error);
      if (error instanceof Error && error.name === 'NotAllowedError') {
        setLoadError('Нажмите для воспроизведения');
      }
    }
  };

  // Изменение времени воспроизведения
  useEffect(() => {
    if (!audioRef.current || isTrackingProgress) return;

    if (Math.abs(audioRef.current.currentTime - state.currentTime) > 0.5) {
      audioRef.current.currentTime = state.currentTime;
    }
  }, [state.currentTime, isTrackingProgress]);

  // Изменение громкости
  useEffect(() => {
    if (!audioRef.current) return;
    
    audioRef.current.volume = state.muted ? 0 : state.volume;
  }, [state.volume, state.muted]);

  // Изменение скорости воспроизведения
  useEffect(() => {
    if (!audioRef.current) return;
    
    audioRef.current.playbackRate = state.playbackRate;
  }, [state.playbackRate]);

  // Обработка клика на прогресс-бар
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !audioRef.current) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const percent = offsetX / rect.width;
    const newTime = percent * (audioRef.current.duration || 0);
    
    seekTo(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  // Расчет ширины прогресс-бара
  const progressWidth = () => {
    if (!audioRef.current || !audioRef.current.duration) return 0;
    const percent = (state.currentTime / audioRef.current.duration) * 100;
    return `${percent}%`;
  };

  // Визуализация аудио
  useEffect(() => {
    if (!audioRef.current || !canvasRef.current) return;

    const audio = audioRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Создание аудио контекста
    let audioContext: AudioContext | undefined;
    let analyser: AnalyserNode | undefined;
    let source: MediaElementAudioSourceNode | undefined;
    let animationFrameId: number;

    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      source = audioContext.createMediaElementSource(audio);
      
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const render = () => {
        if (!ctx || !analyser) return;
        
        animationFrameId = requestAnimationFrame(render);
        
        analyser.getByteFrequencyData(dataArray);
        
        const width = canvas.width;
        const height = canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        
        // Градиент для фона
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)');
        gradient.addColorStop(1, 'rgba(147, 51, 234, 0.5)');
        
        // Плавная цветная волна вместо баров
        ctx.beginPath();
        ctx.moveTo(0, height);
        
        const barWidth = width / bufferLength * 2.5;
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * height / 2;
          
          if (i === 0) {
            ctx.lineTo(x, height - barHeight);
          } else {
            ctx.lineTo(x, height - barHeight);
          }
          
          x += barWidth;
        }
        
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Добавляем обводку для волны
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
      };
      
      render();
    } catch (e) {
      console.error('Ошибка создания аудио визуализации:', e);
    }
    
    return () => {
      if (audioContext) {
        cancelAnimationFrame(animationFrameId);
        if (source && analyser) {
          source.disconnect();
          analyser.disconnect();
        }
      }
    };
  }, []);

  // Обработка касаний для мобильных устройств
  useEffect(() => {
    if (!isMobile || userInteracted) return;

    const handleTouch = async () => {
      await handleFirstInteraction();
    };

    // Добавляем обработчики касаний
    document.addEventListener('touchstart', handleTouch, { once: true });
    document.addEventListener('click', handleTouch, { once: true });

    return () => {
      document.removeEventListener('touchstart', handleTouch);
      document.removeEventListener('click', handleTouch);
    };
  }, [isMobile, userInteracted]);

  // Иконки для плеера
  const PlayIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 5V19L19 12L8 5Z" fill="currentColor" />
    </svg>
  );

  const PauseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 4H10V20H6V4ZM14 4H18V20H14V4Z" fill="currentColor" />
    </svg>
  );



  return (
    <div 
      className="audio-player-container"
      onClick={isMobile && !userInteracted ? handleFirstInteraction : undefined}
    >
      {isLoading && !loadError && (
        <div className="audio-loading">
          <div className="loading-spinner"></div>
          <span>Загрузка аудио...</span>
        </div>
      )}
      
      {isMobile && !userInteracted && audioReady && !loadError && (
        <div className="mobile-touch-hint">
          <div style={{ fontSize: '24px', marginBottom: '10px' }}></div>
          <span>Коснитесь экрана для воспроизведения</span>
        </div>
      )}
      
      {loadError && (
        <div className="audio-loading">
          <div style={{ color: '#ff6b6b', marginBottom: '10px' }}>⚠️</div>
          <span style={{ color: '#ff6b6b' }}>{loadError}</span>
          <button 
            onClick={() => {
              if (audioRef.current) {
                setLoadError(null);
                setIsLoading(true);
                audioRef.current.load();
              }
            }}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Повторить
          </button>
        </div>
      )}
      
      <div className="audio-player-header">
        <h2>{title}</h2>
        {description && <p className="audio-description">{description}</p>}
      </div>
      
      <div className="audio-player-wrapper">
        <audio 
          ref={audioRef} 
          src={audioUrl} 
          preload={isMobile ? "metadata" : "auto"}
          crossOrigin="anonymous"
          playsInline
          controls={false}
          muted={false}
        />
        
        <div className="audio-player-background">
          <div className="audio-controls">
            <div className="progress-container">
              <div 
                ref={progressBarRef} 
                className="progress-bar"
                onClick={handleProgressBarClick}
              >
                <div className="progress-fill" style={{ width: progressWidth() }}></div>
                <div className="progress-handle" style={{ left: progressWidth() }}></div>
              </div>
              <div className="time-display">
                <span>{formatTime(state.currentTime)}</span>
                <span>{formatTime(audioRef.current?.duration || 0)}</span>
              </div>
            </div>
            
            <button 
              className="play-pause-btn" 
              onClick={handlePlayPause} 
              disabled={!audioReady || !!loadError}
              aria-label={state.playing ? 'Пауза' : 'Играть'}
            >
              {state.playing ? <PauseIcon /> : <PlayIcon />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Вспомогательная функция для форматирования времени (MM:SS)
const formatTime = (seconds: number): string => {
  if (isNaN(seconds)) return '00:00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export default AudioPlayer; 