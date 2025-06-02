import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
// import { supabase } from '../lib/supabase/client'; // Удалено как неиспользуемое
import { useQuizData } from './QuizDataContext';

// Типы практик
export type PracticeType = 'short' | 'physical' | 'breathing' | 'meditation';

// Подход к медитации
export type MeditationApproach = 'self' | 'guided';

// Объект концентрации для самостоятельной медитации
export type MeditationObject = 'breath' | 'thought' | 'body' | 'none';

// Возможные цели для разных типов практик
export type PracticeGoal = 
  // Цели для коротких практик (до 7 мин) и телесных (до 20 мин)
  | 'energize' // Взбодриться
  | 'relax' // Расслабиться / для сна
  | 'stretch' // Потянуться
  | 'focus' // Сфокусироваться
  
  // Цели для телесных практик (20-60 мин)
  | 'legs' // Ноги
  | 'whole_body' // Все тело
  | 'shoulders' // Плечи
  | 'core' // Кор
  | 'digestive' // Для ЖКТ
  | 'back_pain' // От боли в спине
  | 'hormonal' // Баланс гормонального фона
  
  // Цели для дыхательных практик
  | 'stress_relief' // Убрать стресс
  | 'sleep' // Расслабление и сон
  | 'energy' // Поднять энергию/творчество
  | 'breathing_depth' // Глубина дыхания
  | 'complex' // Комплекс
  
  // Цели для медитаций с сопровождением
  | 'body' // Тело
  | 'thinking' // Мышление
  | 'relationships'; // Отношения

// Длительность практики в секундах
export type PracticeDuration = {
  min: number;
  max: number;
};

// Структура для самостоятельной медитации
export type SelfMeditationSettings = {
  duration: number; // В секундах
  object: MeditationObject;
};

// Состояние квиза
export interface QuizState {
  practiceType?: PracticeType;
  duration?: PracticeDuration;
  goal?: PracticeGoal;
  approach?: MeditationApproach;
  selfMeditationSettings?: SelfMeditationSettings;
  contentId?: string;
  step: number;
  maxStep: number;
}

// Интерфейс контекста
interface QuizContextType {
  state: QuizState;
  setStep: (step: number) => void;
  setPracticeType: (type: PracticeType) => void;
  setDuration: (duration: PracticeDuration) => void;
  setGoal: (goal: PracticeGoal) => void;
  setApproach: (approach: MeditationApproach) => void;
  setSelfMeditationSettings: (settings: SelfMeditationSettings) => void;
  setContentId: (id: string) => void;
  resetQuiz: () => void;
  goBack: () => void;
  goNext: () => void;
  canGoBack: boolean;
  canGoNext: boolean;
}

// Начальное состояние
const initialState: QuizState = {
  step: 0,
  maxStep: 0,
};

// Создание контекста
const QuizContext = createContext<QuizContextType | undefined>(undefined);

// Провайдер контекста
export const QuizProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [state, setState] = useState<QuizState>(() => {
    // Попытка восстановить состояние из localStorage
    const savedState = localStorage.getItem('quizState');
    return savedState ? JSON.parse(savedState) : initialState;
  });

  // Сохранение состояния в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('quizState', JSON.stringify(state));
  }, [state]);

  // Обновление максимального шага при изменении типа практики
  useEffect(() => {
    let maxStep = 0;
    
    if (state.practiceType) {
      maxStep = 1; // Уже выбран тип

      if (state.practiceType === 'short') {
        maxStep = 2; // Тип -> Цель
      } else if (state.practiceType === 'physical') {
        maxStep = 3; // Тип -> Время -> Цель
      } else if (state.practiceType === 'breathing') {
        maxStep = 2; // Тип -> Цель
      } else if (state.practiceType === 'meditation') {
        maxStep = 2; // Тип -> Подход
        
        if (state.approach === 'self') {
          maxStep = 4; // Тип -> Подход -> Время -> Объект
        } else if (state.approach === 'guided') {
          maxStep = 4; // Тип -> Подход -> Тема -> Цель
        }
      }
    }
    
    setState(prev => ({ ...prev, maxStep }));
  }, [state.practiceType, state.approach]);

  // Методы для обновления состояния
  const setStep = (step: number) => {
    setState(prev => ({ ...prev, step }));
  };

  const setPracticeType = (practiceType: PracticeType) => {
    // При смене типа практики сбрасываем последующие выборы
    setState(prev => ({ 
      ...prev, 
      practiceType,
      duration: undefined,
      goal: undefined,
      approach: undefined,
      selfMeditationSettings: undefined,
      contentId: undefined
    }));
  };

  const setDuration = (duration: PracticeDuration) => {
    // При выборе длительности сбрасываем цель и последующие выборы
    setState(prev => ({ 
      ...prev, 
      duration,
      goal: undefined
    }));
  };

  const setGoal = (goal: PracticeGoal) => {
    setState(prev => ({ 
      ...prev, 
      goal
    }));
  };

  const setApproach = (approach: MeditationApproach) => {
    setState(prev => ({ 
      ...prev, 
      approach,
      goal: undefined,
      selfMeditationSettings: undefined
    }));
  };

  const setSelfMeditationSettings = (settings: SelfMeditationSettings) => {
    setState(prev => ({ 
      ...prev, 
      selfMeditationSettings: settings
    }));
  };

  const setContentId = (contentId: string) => {
    setState(prev => ({ 
      ...prev, 
      contentId
    }));
  };

  const resetQuiz = () => {
    setState(initialState);
  };

  const goBack = () => {
    if (state.step > 0) {
      setState(prev => ({ ...prev, step: prev.step - 1 }));
    }
  };

  const goNext = () => {
    if (state.step < state.maxStep) {
      setState(prev => ({ ...prev, step: prev.step + 1 }));
    }
  };

  // Логика для определения возможности перехода к следующему шагу
  const getCanGoNext = (): boolean => {
    switch (state.step) {
      case 0:
        // Первый шаг - выбор типа практики
        return !!state.practiceType;
      
      case 1:
        if (state.practiceType === 'short' || state.practiceType === 'breathing') {
          // Для коротких практик и дыхательных - нужна цель
          return !!state.goal;
        } else if (state.practiceType === 'physical') {
          // Для телесных практик - нужна длительность
          return !!state.duration;
        } else if (state.practiceType === 'meditation') {
          // Для медитаций - нужен подход
          return !!state.approach;
        }
        break;
      
      case 2:
        if (state.practiceType === 'short' || state.practiceType === 'breathing') {
          // Это уже результаты, переход не нужен
          return false;
        } else if (state.practiceType === 'physical') {
          // Для телесных практик - нужна цель
          return !!state.goal;
        } else if (state.practiceType === 'meditation') {
          if (state.approach === 'self') {
            // Для самостоятельной медитации - нужны настройки
            return !!state.selfMeditationSettings?.object;
          } else if (state.approach === 'guided') {
            // Для медитации с сопровождением - нужна цель
            return !!state.goal;
          }
        }
        break;
      
      case 3:
        // Это результаты для большинства путей
        return false;
      
      case 4:
        // Это результаты
        return false;
      
      default:
        return false;
    }
    
    return false;
  };

  return (
    <QuizContext.Provider
      value={{
        state,
        setStep,
        setPracticeType,
        setDuration,
        setGoal,
        setApproach,
        setSelfMeditationSettings,
        setContentId,
        resetQuiz,
        goBack,
        goNext,
        canGoBack: state.step > 0,
        canGoNext: getCanGoNext(),
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

// Хук для использования контекста
export const useQuiz = (): QuizContextType => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};

// Универсальный хук для real-time загрузки шагов и вариантов квиза
export interface QuizStep {
  id: string;
  order: number;
  title: string;
  type: string;
  is_active: boolean;
  answers: QuizAnswer[];
}

export interface QuizAnswer {
  id: string;
  question_id: string;
  value: string;
  label: string;
  order: number;
  icon?: string;
}

export function useQuizStepsRealtime() {
  // Теперь просто используем глобальный стор
  return useQuizData();
} 