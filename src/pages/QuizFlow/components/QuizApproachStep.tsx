import React from 'react';
import { useQuiz } from '../../../contexts/QuizContext';
import { useQuizStepsRealtime } from '../../../contexts/QuizContext';

const QuizApproachStep: React.FC = () => {
  const { state, setApproach, setStep } = useQuiz();
  const { steps, loading } = useQuizStepsRealtime();

  // Находим шаг с type === 'approach'
  const approachStep = steps.find((step) => step.type === 'approach');
  const options = approachStep?.answers || [];

  // Обработчик выбора подхода
  const handleSelectApproach = (value: string) => {
    setApproach(value as any);
    
    // Определяем следующий шаг в зависимости от выбранного подхода
    setTimeout(() => {
      if (value === 'self') {
        setStep(2); // Переходим к выбору объекта медитации
      } else if (value === 'guided') {
        setStep(2); // Переходим к выбору темы (цели)
      }
    }, 0);
  };

  if (loading) {
    return (
      <div className="quiz-loading">
        <div className="quiz-loading-spinner"></div>
        <p>Загрузка подходов...</p>
      </div>
    );
  }

  if (options.length === 0) {
    return (
      <div className="quiz-error">
        <h3>Ошибка загрузки</h3>
        <p>Нет доступных подходов</p>
      </div>
    );
  }

  return (
    <div className="quiz-step-content">
      <div className="quiz-options-list">
        {options
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map((option) => {
            const selected = state.approach === option.value;
            
            return (
              <button
                key={option.id}
                className={`quiz-option ${selected ? 'selected' : ''}`}
                onClick={() => handleSelectApproach(option.value)}
              >
                {option.label}
              </button>
            );
          })
        }
      </div>
    </div>
  );
};

export default QuizApproachStep; 