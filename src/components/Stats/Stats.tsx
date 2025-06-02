import { FC } from "react";
import { AnimatedCircles } from "@/ui";
import "./Stats.css";

interface StatsProps {
  strength: number;
  practiceMinutes: number;
  daysInFlow: number;
  onSelectPractice?: () => void;
  className?: string;
}

const Stats: FC<StatsProps> = ({
  strength,
  practiceMinutes,
  daysInFlow,
  onSelectPractice,
  className = "",
}) => {
  return (
    <section
      className={`stats-container ${className}`}
      aria-label="Статистика практики"
    >
      <div className="meditation-image-container" aria-hidden="true">
        <div className="animated-circles-wrapper">
          <AnimatedCircles streakLevel={daysInFlow} size={260} />
        </div>
        
        <img
          src="/assets/images/main-avatar.png"
          alt="Медитирующий человек"
          className="meditation-image"
          loading="eager"
        />
      </div>

      {/* Кнопка выбрать практику прямо под картинкой */}
      <button
        className="practice-button"
        onClick={onSelectPractice}
        aria-label="Выбрать практику"
      >
        <span>выбрать практику</span>
      </button>

      {/* Статистика внизу в виде карточек */}
      <div className="stats-grid">
        <div className="stats-item">
          <div className="stats-value">{daysInFlow}</div>
          <div className="stats-label">дней в потоке</div>
          <div className="strength-progress">
            <div className="strength-bar"></div>
          </div>
          <div className="strength-numbers">
            <span>0</span>
            <span>3</span>
          </div>
        </div>
        
        <div className="stats-item">
          <div className="stats-value">{practiceMinutes}</div>
          <div className="stats-label">минут практики</div>
        </div>
        
        <div className="stats-item">
          <div className="stats-value">{strength}</div>
          <div className="stats-label">уровень силы</div>
        </div>
      </div>
    </section>
  );
};

export default Stats;
