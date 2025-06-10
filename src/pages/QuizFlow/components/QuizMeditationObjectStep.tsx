import React from 'react';
import { useQuiz } from '../../../contexts/QuizContext';
import { useQuizStepsRealtime } from '../../../contexts/QuizContext';

const QuizMeditationObjectStep: React.FC = () => {
  const { state, setSelfMeditationSettings, setStep } = useQuiz();
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
    
    // 🎯 ИСПРАВЛЕНИЕ: Сразу переходим к результатам (таймер), минуя выбор времени
    setTimeout(() => {
      setStep(4); // Переходим сразу к результатам вместо шага 3 (выбор времени)
    }, 0);
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
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
          <p>Отладочная информация:</p>
          <p>Всего шагов: {steps.length}</p>
          <p>Шаг meditation_object найден: {objectStep ? 'Да' : 'Нет'}</p>
          {objectStep && <p>Вариантов ответов: {objectStep.answers.length}</p>}
        </div>
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