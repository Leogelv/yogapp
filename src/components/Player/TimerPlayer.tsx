import React, { useEffect, useState, useRef } from 'react';
import TimerSphereCanvas from '../TimerSphere';
import './Player.css';

interface TimerPlayerProps {
  duration: number;
  title: string;
  meditationObject?: string; // Объект для концентрации (мысль, дыхание, тело, без объекта)
  instructions?: string;
  audioUrl?: string; // Фоновое аудио для медитации
  autoStart?: boolean; // Автоматический запуск таймера
}

const TimerPlayer: React.FC<TimerPlayerProps> = ({ 
  duration,
  audioUrl,
  autoStart = true // По умолчанию автозапуск включен
}) => {
  const [isPlaying, setIsPlaying] = useState(autoStart);
  const [timeLeft, setTimeLeft] = useState(duration);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Инициализация аудио
  useEffect(() => {
    console.log('🎵 TimerPlayer: Инициализация аудио...');
    console.log('📝 Получен audioUrl:', audioUrl);
    
    if (audioUrl && audioRef.current) {
      console.log('✅ Настраиваем аудио элемент...');
      
      // 🔧 ИСПРАВЛЕНИЕ: Добавляем https:// если URL начинается с //
      let fullAudioUrl = audioUrl;
      if (audioUrl.startsWith('//')) {
        fullAudioUrl = 'https:' + audioUrl;
        console.log('🔗 Исправлен URL с https:', fullAudioUrl);
      }
      
      audioRef.current.src = fullAudioUrl;
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3; // Тихое фоновое аудио
      audioRef.current.crossOrigin = 'anonymous'; // Для визуализации
      console.log('🔧 Аудио настроено: src =', audioRef.current.src, 'volume =', audioRef.current.volume);
    } else if (!audioUrl) {
      console.warn('⚠️ audioUrl не передан в TimerPlayer');
    } else if (!audioRef.current) {
      console.warn('⚠️ audioRef.current не доступен');
    }
  }, [audioUrl]);

  // Инициализация таймера при изменении duration
  useEffect(() => {
    setTimeLeft(duration);
    if (autoStart) {
      setIsPlaying(true);
      startTimeRef.current = Date.now();
    } else {
      setIsPlaying(false);
      startTimeRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [duration, autoStart]);

  // Обработка плей/пауза
  useEffect(() => {
    if (isPlaying) {
      console.log('▶️ Запускаем таймер и аудио...');
      
      // Запускаем фоновое аудио
      if (audioRef.current && audioUrl) {
        console.log('🎵 Пытаемся запустить аудио:', audioUrl);
        audioRef.current.play()
          .then(() => {
            console.log('✅ Аудио успешно запущено');
          })
          .catch((error) => {
            console.error('❌ Ошибка при запуске аудио:', error);
          });
      } else {
        console.warn('⚠️ Аудио не может быть запущено:', {
          hasAudioRef: !!audioRef.current,
          hasAudioUrl: !!audioUrl,
          audioUrl: audioUrl
        });
      }

      // Если таймер запускается заново
      if (startTimeRef.current === null) {
        startTimeRef.current = Date.now();
      } else if (timerRef.current === null) {
        // Если таймер был на паузе, обновляем стартовое время
        const elapsedSeconds = duration - timeLeft;
        startTimeRef.current = Date.now() - (elapsedSeconds * 1000);
      }
      
      // Запускаем таймер
      timerRef.current = window.setInterval(() => {
        const now = Date.now();
        const startTime = startTimeRef.current || now;
        const elapsedMilliseconds = now - startTime;
        const elapsedSeconds = Math.floor(elapsedMilliseconds / 1000);
        const newTimeLeft = Math.max(0, duration - elapsedSeconds);
        
        setTimeLeft(newTimeLeft);
        
        // Если таймер закончился
        if (newTimeLeft <= 0) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          startTimeRef.current = null;
          
          // Останавливаем фоновое аудио
          if (audioRef.current) {
            audioRef.current.pause();
          }
          
          setIsPlaying(false);
        }
      }, 100);
    } else {
      // Останавливаем фоновое аудио при паузе
      if (audioRef.current) {
        audioRef.current.pause();
      }

      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, duration, timeLeft, audioUrl]);

  return (
    <div className="timer-player-container" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '2rem',
      padding: '2rem',
      background: '#191919',
      minHeight: '100vh',
      color: 'white'
    }}>
      {/* Скрытый аудио элемент для фонового звука */}
      {audioUrl && (
        <audio ref={audioRef} preload="auto" style={{ display: 'none' }} />
      )}
      
      <div className="timer-player-header" style={{ textAlign: 'center', maxWidth: '400px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Закройте глаза<br />и сфокусируйтесь на себе
        </h2>
        <p className="meditation-instructions" style={{ opacity: 0.8, fontSize: '0.875rem' }}>
          Расслабьтесь и закройте глаза.<br />
          Не блокируйте телефон, чтобы услышать<br />
          звуковой сигнал об окончании практики
        </p>
      </div>
      
      {/* Анимированная сфера таймера */}
      <div style={{ 
        width: '600px', 
        height: '600px',
        maxWidth: '90vw',
        maxHeight: '50vh',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <TimerSphereCanvas
          isPlaying={isPlaying}
          timeLeft={timeLeft}
          totalDuration={duration}
        />
      </div>
      
      {/* Отображение времени */}
      <div className="timer-time-display" style={{
        fontSize: '3rem',
        fontWeight: 'bold',
        fontFamily: 'monospace',
        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textAlign: 'center'
      }}>
        {formatTime(timeLeft)}
      </div>
      
      <div className="timer-controls">
        <button 
          className="stop-btn" 
          onClick={() => {
            // Останавливаем фоновое аудио
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
            }
            
            setIsPlaying(false);
            setTimeLeft(duration);
            startTimeRef.current = null;
          }}
          style={{
            padding: '12px 32px',
            fontSize: '1rem',
            fontWeight: 'bold',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '50px',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            backdropFilter: 'blur(10px)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          остановиться
        </button>
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

export default TimerPlayer; 