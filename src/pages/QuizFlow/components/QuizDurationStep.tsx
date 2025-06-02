import React from 'react';
import { useQuiz } from '../../../contexts/QuizContext';
import { useQuizStepsRealtime } from '../../../contexts/QuizContext';

const QuizDurationStep: React.FC = () => {
  const { state, setDuration } = useQuiz();
  const { steps, loading } = useQuizStepsRealtime();

  // Находим шаг с type === 'duration'
  const durationStep = steps.find((step) => step.type === 'duration');
  const options = durationStep?.answers || [];

  // Обработчик выбора длительности
  const handleSelectDuration = (value: string) => {
    // value ожидается в формате '300-600' (секунды)
    const [min, max] = value.split('-').map(Number);
    setDuration({ min, max });
  };

  if (loading) {
    return (
      <div className="quiz-loading">
        <div className="quiz-loading-spinner"></div>
        <p>Загрузка вариантов длительности...</p>
      </div>
    );
  }

  if (options.length === 0) {
    return (
      <div className="quiz-error">
        <h3>Ошибка загрузки</h3>
        <p>Нет доступных вариантов длительности</p>
      </div>
    );
  }

  return (
    <div className="quiz-step-content">
      <div className="quiz-duration-options">
        {options
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map((option) => {
            const [min, max] = option.value.split('-').map(Number);
            const selected = state.duration?.min === min && state.duration?.max === max;
            
            return (
              <button
                key={option.id}
                className={`quiz-duration-option ${selected ? 'selected' : ''}`}
                onClick={() => handleSelectDuration(option.value)}
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

export default QuizDurationStep; 