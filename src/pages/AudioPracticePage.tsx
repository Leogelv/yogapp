import {Page} from "@/components";
import AudioReactiveSphereCanvas from "@/components/AudioReactiveSphere.tsx";
import {useParams} from "react-router-dom";
import {supabase} from "@/lib/supabase/client.ts";
import React, {useEffect, useRef, useState} from "react";
import {ContentItem} from "@/lib/supabase/hooks/useContents.ts";

export const AudioPracticePage = () => {
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [progress, setProgress] = useState(0)
    const [duration, setDuration] = useState(0)

    const formatTime = (sec: number) =>
        new Date(sec * 1000).toISOString().substring(14, 19)

    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return

        const update = () => {
            setProgress(audio.currentTime)
            setDuration(audio.duration)
        }

        const handlePlay = () => setIsPlaying(true)
        const handlePause = () => setIsPlaying(false)
        const handleEnded = () => setIsPlaying(false)

        audio.addEventListener('timeupdate', update)
        audio.addEventListener('loadedmetadata', update)
        audio.addEventListener('play', handlePlay)
        audio.addEventListener('pause', handlePause)
        audio.addEventListener('ended', handleEnded)
        
        return () => {
            audio.removeEventListener('timeupdate', update)
            audio.removeEventListener('loadedmetadata', update)
            audio.removeEventListener('play', handlePlay)
            audio.removeEventListener('pause', handlePause)
            audio.removeEventListener('ended', handleEnded)
        }
    }, [])

    const togglePlay = () => {
        const audio = audioRef.current
        if (!audio) return
        if (isPlaying) {
            audio.pause()
        } else {
            audio.play()
        }
    }

    const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current
        if (!audio) return
        const time = parseFloat(e.target.value)
        audio.currentTime = time
        setProgress(time)
    }

    const { contentId } = useParams<{ contentId: string, eventId?: string }>();
    const [practice, setPractice] = useState<ContentItem | undefined>();
    useEffect(() => {
        supabase?.from('contents')
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
            .single().then(r => {
                setPractice(r.data)
        })
    }, []);
    
    return(
        <Page showTabBar={false} hideTopPadding={true}>
            <div className={'flex flex-col items-center gap-8 bg-[#191919] min-h-screen relative'}>
                <div className={'flex-1 w-full flex justify-center items-center'}>
                    <div style={{ 
                        width: '600px', 
                        height: '600px',
                        maxWidth: '90vw',
                        maxHeight: '50vh'
                    }}>
                        <AudioReactiveSphereCanvas 
                            audioElement={audioRef.current}
                            isPlaying={isPlaying}
                        />
                    </div>
                </div>
                <div className={'!px-3 flex flex-col items-center gap-6 !pb-6 relative z-[2] w-full max-w-[450px] max-auto'}>
                    <div className={'flex flex-col gap-3 w-full'}>
                        <h3 className={'font-bold text-xl'}>{practice?.title}</h3>
                        <div className={'flex items-center gap-2 flex-wrap'}>
                            <div className={'w-max text-sm !py-1 !px-2 text-white bg-[#414141] border border-[#191919]'}
                                 style={{fontFamily: 'RF Dewi, sans-serif', letterSpacing: '-0.07em'}}>
                                {Number(practice?.power_needed) || 2} силы
                            </div>
                            <div className={'w-max text-sm !py-1 !px-2 text-white bg-[#414141] border border-[#191919]'}
                                 style={{fontFamily: 'RF Dewi, sans-serif', letterSpacing: '-0.07em'}}>
                                {Math.floor((practice?.duration || 0) / 60)} минут
                            </div>
                            <div className={'w-max text-sm !py-1 !px-2 text-white bg-[#414141] border border-[#191919]'}
                                 style={{fontFamily: 'RF Dewi, sans-serif', letterSpacing: '-0.07em'}}>
                                {practice?.categories?.name || 'практика'}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 text-sm w-full">
                        <input
                            type="range"
                            min={0}
                            max={duration || 0}
                            value={progress}
                            onChange={onSeek}
                            className="flex-1 rounded-none"
                        />
                        <div className={'flex items-center gap-2 justify-between text-white/40'}>
                            <span>{formatTime(progress)}</span>

                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>

                    <button
                        onClick={togglePlay}
                        className="mt-4 w-12 h-12 rounded-full bg-[#414141] flex items-center justify-center text-xl"
                    >
                        {isPlaying ? <svg width="55" height="55" viewBox="0 0 55 55" fill="none"
                                          xmlns="http://www.w3.org/2000/svg">
                                <rect width="55" height="55" rx="27.5" fill="#414141"/>
                                <rect x="21" y="20" width="6" height="16" fill="currentColor"/>
                                <rect x="29" y="20" width="6" height="16" fill="currentColor"/>
                            </svg>
                            : <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                   xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
                            </svg>}
                    </button>

                    <audio 
                        ref={audioRef} 
                        src={practice?.audio_file_path} 
                        preload="metadata"
                        crossOrigin="anonymous"
                    />
                </div>

            </div>
        </Page>
    )
}

