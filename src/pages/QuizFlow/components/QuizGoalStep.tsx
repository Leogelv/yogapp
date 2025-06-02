import React from 'react';
import { useQuiz } from '../../../contexts/QuizContext';
import { useQuizStepsRealtime } from '../../../contexts/QuizContext';

const QuizGoalStep: React.FC = () => {
  const { state, setGoal } = useQuiz();
  const { steps, loading } = useQuizStepsRealtime();

  // Находим шаг с type === 'goal'
  const goalStep = steps.find((step) => step.type === 'goal');
  const options = goalStep?.answers || [];

  // Обработчик выбора цели
  const handleSelectGoal = (value: string) => {
    setGoal(value as any);
  };

  if (loading) {
    return (
      <div className="quiz-loading">
        <div className="quiz-loading-spinner"></div>
        <p>Загрузка целей...</p>
      </div>
    );
  }

  if (options.length === 0) {
    return (
      <div className="quiz-error">
        <h3>Ошибка загрузки</h3>
        <p>Нет доступных целей</p>
      </div>
    );
  }

  return (
    <div className="quiz-step-content">
      <div className="quiz-options-list">
        {options
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map((option) => {
            const selected = state.goal === option.value;
            
            return (
              <button
                key={option.id}
                className={`quiz-option ${selected ? 'selected' : ''}`}
                onClick={() => handleSelectGoal(option.value)}
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

export default QuizGoalStep; 