import React from 'react';
import { useQuiz } from '../../../contexts/QuizContext';
import { useQuizStepsRealtime } from '../../../contexts/QuizContext';

const QuizTypeStep: React.FC = () => {
  const { state, setPracticeType, setStep } = useQuiz();
  const { steps, loading } = useQuizStepsRealtime();

  // Находим шаг с type === 'practice_type'
  const typeStep = steps.find((step) => step.type === 'practice_type');
  const options = typeStep?.answers || [];

  // Обработчик выбора типа практики
  const handleSelectType = (value: string) => {
    setPracticeType(value as any);
    // Немедленно переходим к следующему шагу
    setTimeout(() => {
      setStep(1);
    }, 0);
  };

  if (loading) {
    return (
      <div className="quiz-loading">
        <div className="quiz-loading-spinner"></div>
        <p>Загрузка типов практик...</p>
      </div>
    );
  }

  if (options.length === 0) {
    return (
      <div className="quiz-error">
        <h3>Ошибка загрузки</h3>
        <p>Нет доступных типов практик</p>
      </div>
    );
  }

  return (
    <div className="quiz-step-content">
      <div className="quiz-options-list">
        {options
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map((option) => {
            const selected = state.practiceType === option.value;
            
            return (
              <button
                key={option.id}
                className={`quiz-option ${selected ? 'selected' : ''}`}
                onClick={() => handleSelectType(option.value)}
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

export default QuizTypeStep; 