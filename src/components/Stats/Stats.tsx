import { FC } from 'react';
import './Stats.css';

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
  className = ''
}) => {
  return (
    <div className={`stats-container ${className}`}>
      <div className="meditation-image-container">
        <img 
          src="/mediman.png" 
          alt="Медитирующий человек" 
          className="meditation-image"
        />
      </div>
      
      <div className="stats-card">
        <div className="stats-strength">
          <div className="stats-header">{strength}</div>
          <div className="stats-label">ТВОЯ СИЛА</div>
        </div>
        
        <div className="stats-row">
          <div className="stats-item">
            <div className="stats-value">{practiceMinutes}</div>
            <div className="stats-label">минут практики</div>
          </div>
          
          <div className="stats-item">
            <div className="stats-value">{daysInFlow}</div>
            <div className="stats-label">дней в потоке</div>
          </div>
        </div>
        
        <button 
          className="practice-button" 
          onClick={onSelectPractice}
        >
          <span>Выбрать практику</span>
          <span className="arrow-icon">→</span>
        </button>
      </div>
    </div>
  );
};

export default Stats; 