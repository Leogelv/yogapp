import React, {useState} from 'react';
import KinescopePlayer from '@kinescope/react-kinescope-player';
import './Player.css';

interface VideoPlayerProps {
  // videoId будет браться из PlayerContext.state.contentData.kinescopeId
  // title будет браться из PlayerContext.state.contentData.title
  // description будет браться из PlayerContext.state.contentData.description
  kinescopeId?: string
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({kinescopeId}) => {
  //const { state, setState, play, pause } = usePlayer();
  //const { contentData, playing, muted, fullscreen } = state as PlayerState;
  const [, setPlayerError] = useState<boolean>(false);
  // const kinescopePlayerRef = useRef<any>(null); // Если понадобится прямой доступ к методам плеера

  //const kinescopeId = contentData?.kinescopeId;

  // Fallback для демо/тестирования, если kinescopeId отсутствует
  const fallbackVideoId = '75EPdFkFahbUdBqsPvBmqA';
  const effectiveVideoId = kinescopeId || fallbackVideoId;

  // useEffect(() => {
  //   const playerContainer = document.querySelector('.video-player-wrapper');
  //   if (!playerContainer) return;
  //
  //   if (fullscreen) {
  //     if (document.fullscreenElement !== playerContainer) {
  //       playerContainer.requestFullscreen().catch(err => {
  //         console.error('Ошибка перехода в полноэкранный режим:', err);
  //       });
  //     }
  //   } else {
  //     if (document.fullscreenElement === playerContainer) {
  //       document.exitFullscreen().catch(err => {
  //         console.error('Ошибка выхода из полноэкранного режима:', err);
  //       });
  //     }
  //   }
  // }, [fullscreen]);

  const handlePlayerError = (error: any) => {
    console.error('Ошибка Kinescope плеера:', error, 'для videoId:', kinescopeId);
    setPlayerError(true);
    // Можно добавить логику для показа fallbackVideoId, если основной вызывает ошибку
    // if (kinescopeId && kinescopeId !== fallbackVideoId) {
    //   // Попробовать загрузить fallback (но это может вызвать рекурсию, если и он недоступен)
    // }
  };

  // const handleReady = (data: { duration: number }) => {
  //   setState((prevState: PlayerState) => ({ ...prevState, duration: data.duration }));
  // };
  //
  // const handleTimeUpdate = (data: { currentTime: number }) => {
  //   setState((prevState: PlayerState) => ({ ...prevState, currentTime: data.currentTime }));
  // };
  //
  // const handlePlay = () => {
  //   if (!playing) play();
  // };
  //
  // const handlePause = () => {
  //   if (playing) pause();
  // };
  //
  // const handleEnded = () => {
  //   pause();
  //   // Можно добавить логику перехода к следующему видео или закрытия плеера
  // };
  
  // Синхронизация состояния PlayerContext с KinescopePlayer
  // Этот useEffect не нужен, если KinescopePlayer сам управляет своим состоянием проигрывания/паузы/громкости
  // через пропсы, но если нужно принудительно вызывать play/pause/setVolume из контекста,
  // то потребуется ref и вызов методов плеера.
  // Пока оставляем так, предполагая, что пропсы autoPlay и muted работают.

  console.log('Рендеринг VideoPlayer с effectiveVideoId:', effectiveVideoId, 'из PlayerContext');

  if (!effectiveVideoId) {
    return (
      <div className="player-error">
        <p>Ошибка: ID видео Kinescope не указан в contentData.</p>
      </div>
    );
  }

  return (
    <div className="video-player-container">
      {/*<div className="video-player-header">
        <h2>{title}</h2>
        {description && <p className="video-description">{description}</p>}
        {playerError && (
          <div className="video-error-banner">
            <p>Ошибка загрузки видео. {kinescopeId ? 'Попробуйте обновить страницу.' : 'Используется демо-контент.'}</p>
          </div>
        )}
      </div>*/}
      
      <div className="video-player-wrapper" style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}>
        <KinescopePlayer
          // ref={kinescopePlayerRef} // Раскомментировать, если нужен прямой доступ к API плеера
          videoId={effectiveVideoId}
          width="100%"
          height="100%"
          className={'border-none'}
          // autoPlay={playing} // Управляем автовоспроизведением из контекста
          // muted={muted}      // Управляем Mute из контекста
          // // volume={volume}    // Управляем громкостью из контекста
          // // playsInline // По умолчанию true, важно для мобильных
          // // controls // По умолчанию true, используем стандартные контролы Kinescope
          // // title={title} // Kinescope сам подтянет, если есть
          // onReady={handleReady}
          // onPlay={handlePlay}
          // onPause={handlePause}
          // onEnded={handleEnded}
          // onTimeUpdate={handleTimeUpdate}
          onError={handlePlayerError}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          // Тут можно добавить другие пропсы из документации Kinescope, если нужно
          // Например, chapters, vtt, poster, language, etc.
        />
        
        {/* Оставляем кастомные контролы на случай, если они нужны для обертки */} 
        {/* state.displayControls && (
          <div className="custom-controls">
            <button className="play-pause-btn" onClick={togglePlay}>
              {playing ? 'Пауза' : 'Воспроизвести'}
            </button>
            <input 
              type="range" 
              min="0" 
              max={duration} 
              value={currentTime} 
              onChange={(e) => seekTo(Number(e.target.value))} 
              className="progress-bar"
            />
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.1" 
              value={volume} 
              onChange={(e) => setVolume(Number(e.target.value))} 
              className="volume-bar"
            />
            <button className="mute-btn" onClick={toggleMute}>
              {muted ? 'Вкл. звук' : 'Выкл. звук'}
            </button>
            <button className="fullscreen-btn" onClick={toggleFullscreen}>
              {fullscreen ? 'Оконный режим' : 'Полный экран'}
            </button>
          </div>
            )*/} 
      </div>
    </div>
  );
};

export default VideoPlayer; 