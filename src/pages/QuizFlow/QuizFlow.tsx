import { type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import './QuizFlow.css';
import { Page } from '@/components/Page';

export const QuizFlow: FC = () => {
  const navigate = useNavigate();

  return (
    <Page>
      <div className="quiz-container">
        <div className="quiz-progress">
          <div className="quiz-progress-step active"></div>
          <div className="quiz-progress-step"></div>
          <div className="quiz-progress-step"></div>
        </div>
        
        <div className="quiz-content">
          <div className="quiz-header">
            <button className="quiz-back-button" onClick={() => navigate('/')}>
              ←
            </button>
            <div className="quiz-step">
              1/3
            </div>
          </div>
          
          <h2 className="quiz-question">Какая ваша основная цель?</h2>
          <p className="quiz-description">Выберите наиболее важную для вас цель практики</p>
          
          <div className="quiz-options">
            <button className="quiz-option">
              <span className="option-icon">😌</span>
              <span className="option-text">Снижение стресса и тревоги</span>
            </button>
            <button className="quiz-option">
              <span className="option-icon">💤</span>
              <span className="option-text">Улучшение сна</span>
            </button>
            <button className="quiz-option">
              <span className="option-icon">🧠</span>
              <span className="option-text">Повышение концентрации</span>
            </button>
            <button className="quiz-option">
              <span className="option-icon">⚡</span>
              <span className="option-text">Увеличение энергии</span>
            </button>
          </div>
        </div>
        
        <div className="quiz-info">
          <p>На основе ваших ответов мы подберем индивидуальную практику, наиболее подходящую для ваших целей и уровня опыта.</p>
        </div>
      </div>
    </Page>
  );
}; 