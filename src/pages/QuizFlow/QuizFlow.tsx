import React, { useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import { QuizProvider, useQuiz } from '@/contexts/QuizContext';
import './QuizFlow.css';

// Импортируем созданные компоненты для шагов
import QuizTypeStep from './components/QuizTypeStep';
import QuizDurationStep from './components/QuizDurationStep';
import QuizGoalStep from './components/QuizGoalStep';
import QuizApproachStep from './components/QuizApproachStep';
import QuizMeditationObjectStep from './components/QuizMeditationObjectStep';
import QuizResultsStep from './components/QuizResultsStep';
import {Page} from "@/components";

// Убираем QuizProgress - в новом дизайне нет прогресс бара

// Основной компонент с навигацией между шагами
const QuizFlowContent: React.FC = () => {
  const { state, resetQuiz } = useQuiz();
  // const navigate = useNavigate();

  // Автосброс квиза при каждом заходе
  useEffect(() => {
    resetQuiz();
  }, []);

  // Автопереход по шагам с задержкой


  // Обработчик кнопки назад
  // const handleBack = () => {
  //   if (state.step === 0) {
  //     navigate('/');
  //   } else {
  //     goBack();
  //   }
  // };

  // Получение общего количества шагов
  // const getTotalSteps = () => {
  //   if (!state.practiceType) return 5;
  //
  //   switch (state.practiceType) {
  //     case 'short':
  //     case 'breathing':
  //       return 3; // Тип -> Цель -> Результат
  //     case 'physical':
  //       return 4; // Тип -> Длительность -> Цель -> Результат
  //     case 'meditation':
  //       if (state.approach === 'self') {
  //         return 5; // Тип -> Подход -> Объект -> Длительность -> Результат
  //       } else if (state.approach === 'guided') {
  //         return 4; // Тип -> Подход -> Цель -> Результат
  //       }
  //       return 3; // Тип -> Подход -> ...
  //     default:
  //       return 5;
  //   }
  // };

  // Получение заголовка текущего шага по дизайну Figma
  const getStepTitle = () => {
    switch (state.step) {
      case 0:
        return 'выбери практику';
      case 1:
        if (state.practiceType === 'short' || state.practiceType === 'breathing') {
          return 'выбери цель';
        } else if (state.practiceType === 'physical') {
          return 'выбери время';
        } else if (state.practiceType === 'meditation') {
          return 'выбери подход';
        }
        break;
      case 2:
        if (state.practiceType === 'short' || state.practiceType === 'breathing') {
          return '';
        } else if (state.practiceType === 'physical') {
          return 'выбери цель';
        } else if (state.practiceType === 'meditation') {
          if (state.approach === 'self') {
            return 'выбери объект для концентрации';
          } else if (state.approach === 'guided') {
            return 'выбери тему';
          }
        }
        break;
      case 3:
        if (state.practiceType === 'physical' || 
            (state.practiceType === 'meditation' && state.approach === 'guided')) {
          return '';
        } else if (state.practiceType === 'meditation' && state.approach === 'self') {
          return 'выбери время медитации';
        }
        break;
      case 4:
        return '';
      default:
        return 'квиз';
    }
    return 'квиз';
  };

  // Определение компонента для текущего шага
  const renderStepComponent = () => {
    switch (state.step) {
      case 0:
        return <QuizTypeStep />;
      case 1:
        if (state.practiceType === 'short' || state.practiceType === 'breathing') {
          return <QuizGoalStep />;
        } else if (state.practiceType === 'physical') {
          return <QuizDurationStep />;
        } else if (state.practiceType === 'meditation') {
          return <QuizApproachStep />;
        }
        break;
      case 2:
        if (state.practiceType === 'short' || state.practiceType === 'breathing') {
          return <QuizResultsStep />;
        } else if (state.practiceType === 'physical') {
          return <QuizGoalStep />;
        } else if (state.practiceType === 'meditation') {
          if (state.approach === 'self') {
            return <QuizMeditationObjectStep />;
          } else if (state.approach === 'guided') {
            return <QuizGoalStep />;
          }
        }
        break;
      case 3:
        if (state.practiceType === 'physical' || 
            (state.practiceType === 'meditation' && state.approach === 'guided')) {
          return <QuizResultsStep />;
        } else if (state.practiceType === 'meditation' && state.approach === 'self') {
          return <QuizDurationStep />;
        }
        break;
      case 4:
        return <QuizResultsStep />;
      default:
        resetQuiz();
        return <QuizTypeStep />;
    }
  };

  return (
    <div className="quiz-container">
      {/* Кнопка назад только если не первый шаг */}
      {/*{state.step >= 0 && (*/}
      {/*  <div className="quiz-back-container">*/}
      {/*    <button className="quiz-back-button" onClick={handleBack}>*/}
      {/*      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">*/}
      {/*        <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>*/}
      {/*      </svg>*/}
      {/*      Назад*/}
      {/*    </button>*/}
      {/*  </div>*/}
      {/*)}*/}

      {/* Заголовок квиза */}
      {getStepTitle() && <div className="quiz-title">
        {getStepTitle()}
      </div>}

      {/* Контент шага */}
      <div className="quiz-step-container">
        {renderStepComponent()}
      </div>

      {/* Кнопка "как это работает?" для первого шага */}
      {state.step === 0 && (
        <div className="quiz-how-it-works-container">
          <button className="quiz-how-it-works">
            как это работает?
          </button>
        </div>
      )}

    </div>
  );
};

// Главный компонент с провайдером контекста
export const QuizFlow: React.FC = () => {
  return (
    <Page showTabBar={false}>
      <QuizProvider>
        <QuizFlowContent />
      </QuizProvider>
    </Page>
  );
}; 