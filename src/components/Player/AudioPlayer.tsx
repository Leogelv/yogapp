import React, { useEffect, useRef, useState } from 'react';
import { usePlayer } from '../../contexts/PlayerContext';
import './Player.css';

interface AudioPlayerProps {
  audioUrl: string;
  title: string;
  description?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, title, description }) => {
  const { state, play, pause, seekTo, togglePlay, setVolume } = usePlayer();
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isTrackingProgress] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Синхронизация с аудио элементом
  useEffect(() => {
    if (!audioRef.current) return;

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
    const handleLoaded = () => setIsLoading(false);

    // Добавление обработчиков
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('canplaythrough', handleLoaded);

    // Очистка обработчиков
    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('canplaythrough', handleLoaded);
    };
  }, [isTrackingProgress, play, pause, seekTo]);

  // Управление воспроизведением
  useEffect(() => {
    if (!audioRef.current) return;

    if (state.playing) {
      audioRef.current.play().catch(error => console.error('Ошибка воспроизведения:', error));
    } else {
      audioRef.current.pause();
    }
  }, [state.playing]);

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

  const VolumeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15.54 8.46C16.4774 9.39764 17.0039 10.6692 17.0039 11.995C17.0039 13.3208 16.4774 14.5924 15.54 15.53" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19.07 4.93C20.9447 6.80528 21.9979 9.34836 21.9979 12C21.9979 14.6516 20.9447 17.1947 19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <div className="audio-player-container">
      {isLoading && (
        <div className="audio-loading">
          <div className="loading-spinner"></div>
          <span>Загрузка аудио...</span>
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
          preload="metadata" 
          loop={false}
        />
        
        <div 
          className="audio-player-background" 
          style={{ 
            backgroundImage: state.backgroundImage ? `url(${state.backgroundImage})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
          }}
        >
          <canvas ref={canvasRef} className="audio-visualization" width="300" height="100"></canvas>
          
          <div className="audio-controls">
            <button className="play-pause-btn" onClick={togglePlay} aria-label={state.playing ? 'Пауза' : 'Играть'}>
              {state.playing ? <PauseIcon /> : <PlayIcon />}
            </button>
            
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
            
            <div className="volume-control">
              <VolumeIcon />
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={state.volume} 
                onChange={(e) => setVolume(parseFloat(e.target.value))} 
                className="volume-slider"
              />
            </div>
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