import React from 'react';
import { useQuiz } from '../../../contexts/QuizContext';
import { useQuizStepsRealtime } from '../../../contexts/QuizContext';

const QuizMeditationObjectStep: React.FC = () => {
  const { state, setSelfMeditationSettings } = useQuiz();
  const { steps, loading } = useQuizStepsRealtime();

  // Находим шаг с type === 'meditation_object'
  const objectStep = steps.find((step) => step.type === 'meditation_object');
  const options = objectStep?.answers || [];

  // Обработчик выбора объекта медитации
  const handleSelectObject = (value: string) => {
    setSelfMeditationSettings({
      duration: state.selfMeditationSettings?.duration || 600, // 10 минут по умолчанию
      object: value as any
    });
  };

  if (loading) {
    return (
      <div className="quiz-loading">
        <div className="quiz-loading-spinner"></div>
        <p>Загрузка объектов медитации...</p>
      </div>
    );
  }

  if (options.length === 0) {
    return (
      <div className="quiz-error">
        <h3>Ошибка загрузки</h3>
        <p>Нет доступных объектов медитации</p>
      </div>
    );
  }

  return (
    <div className="quiz-step-content">
      <div className="quiz-options-list">
        {options
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map((option) => {
            const selected = state.selfMeditationSettings?.object === option.value;
            
            return (
              <button
                key={option.id}
                className={`quiz-option ${selected ? 'selected' : ''}`}
                onClick={() => handleSelectObject(option.value)}
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

export default QuizMeditationObjectStep; 