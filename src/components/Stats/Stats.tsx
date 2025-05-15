import React from 'react';
import { ChevronRight } from './icons';
import './Stats.css';

interface StatItemProps {
  value: string | number;
  label: string;
  highlight?: boolean;
}

const StatItem: React.FC<StatItemProps> = ({ value, label, highlight = false }) => {
  return (
    <div className={`stat-item ${highlight ? 'stat-item-highlight' : ''}`}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
};

interface StatsProps {
  strength?: number;
  practiceMinutes?: number;
  daysInFlow?: number;
  onSelectPractice?: () => void;
}

const Stats: React.FC<StatsProps> = ({ 
  strength = 3, 
  practiceMinutes = 100, 
  daysInFlow = 7,
  onSelectPractice 
}) => {
  return (
    <div className="stats-container">
      <div className="strength-card">
        <StatItem 
          value={strength} 
          label="ТВОЯ СИЛА" 
          highlight={true} 
        />
      </div>
      
      <div className="stats-row">
        <div className="stats-card">
          <StatItem 
            value={practiceMinutes} 
            label="МИНУТ ПРАКТИКИ" 
          />
        </div>
        <div className="stats-card">
          <StatItem 
            value={daysInFlow} 
            label="ДНЕЙ В ПОТОКЕ" 
          />
        </div>
      </div>
      
      <button 
        className="select-practice-button"
        onClick={onSelectPractice}
      >
        <span>Выбрать практику</span>
        <ChevronRight />
      </button>
    </div>
  );
};

export default Stats; 