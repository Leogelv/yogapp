import {FC, useEffect, useState} from "react";
import { AnimatedCircles } from "@/ui";
import "./Stats.css";
import {supabase} from "@/lib/supabase/client.ts";
import {User} from "@/pages/AdminPage/types.ts";

interface StatsProps {
  strength: number;
  practiceMinutes: number;
  daysInFlow: number;
  onSelectPractice?: (num: number) => void;
  className?: string;
  telegramdId?: number
}

const Stats: FC<StatsProps> = ({
                                 telegramdId,
  onSelectPractice,
  className = "",
}) => {
  const [user, setUser] = useState<User | undefined>()
  useEffect(() => {
    if(telegramdId){
      supabase?.from('users').select('*').eq('telegram_id', telegramdId).then(r => {
        setUser(r.data![0])
      })
    }
  }, [telegramdId]);
  return (
      <section
          className={`stats-container ${className}`}
          aria-label="Статистика практики"
      >
        <div className="meditation-image-container" aria-hidden="true">
          <div className="animated-circles-wrapper">
            <AnimatedCircles streakLevel={user?.power || 0} size={300}/>
          </div>

          <img
              src="/assets/images/main-avatar.png"
              alt="Медитирующий человек"
              className="meditation-image"
              loading="eager"
          />
        </div>

        {/* Кнопка выбрать практику прямо под картинкой */}


        {/* Статистика внизу в виде карточек */}
        <div className={'grid grid-cols-2 w-full !mt-6'}>
          <div className={'col-span-2 border-b border-t border-black !p-4 flex flex-col gap-2'}>
            <div className={'flex items-center gap-4 justify-between'}>
              <p className={'text-[#191919]/40 text-sm'}>дней в потоке</p>
              <p style={{ fontFamily: 'RF Dewi, sans-serif', letterSpacing: '-0.07em' }} className={'font-bold text-2xl text-[#191919]'}>{user?.strike}</p>
            </div>
            <div className={'flex flex-col'}>
              <div className={'bg-[#E7E7E7] h-4 w-full'}>
                <div style={{
                  width: ((user?.strike ?? 0)/3)*100 + '%'
                }} className={`h-4 bg-[linear-gradient(90deg,_#E8E8E8_0%,_#F08F67_132.63%)]`}></div>
              </div>
              <div  className={'text-[#191919]/40 text-sm flex items-center justify-between'}>
                <p>0</p>
                <p>3</p>
              </div>
            </div>
          </div>
          <div className={'flex flex-col items-center !p-4 border-b border-r border-black'}>
            <p style={{ fontFamily: 'RF Dewi, sans-serif', letterSpacing: '-0.07em' }} className={'font-bold text-2xl text-[#191919]'}>{user?.practice_minutes}</p>
            <p className={'text-[#191919]/40 text-sm'}>минут практики</p>
          </div>
          <div className={'flex flex-col items-center !p-4 border-b border-black'}>
            <p style={{ fontFamily: 'RF Dewi, sans-serif', letterSpacing: '-0.07em' }} className={'font-bold text-2xl text-[#191919]'}>{user?.power}</p>
            <p className={'text-[#191919]/40 text-sm'}>уровень силы</p>
          </div>
        </div>


        <button
            className="practice-button !py-5"
            style={{ fontFamily: 'RF Dewi, sans-serif', letterSpacing: '-0.07em' }}
            onClick={()=> onSelectPractice ? onSelectPractice(user?.power || 0) : null}
            aria-label="Выбрать практику"
        >
          <span>выбрать практику</span>
        </button>
      </section>
  );
};

export default Stats;
