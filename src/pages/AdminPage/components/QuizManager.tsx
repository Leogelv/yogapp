import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { MdRefresh } from 'react-icons/md';
import type { QuizStep, QuizAnswer } from '../types';
import QuizSteps from './QuizSteps';
import QuizAnswers from './QuizAnswers';

// Компонент для управления квизом (обновлённый)
const QuizManager: React.FC = () => {
  const [quizSteps, setQuizSteps] = useState<QuizStep[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);

  // Загрузка данных квиза
  const fetchQuizData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      if (!supabase) {
        throw new Error('Supabase клиент не инициализирован');
      }
      
      console.log('Загрузка данных квиза...');
      
      // Загружаем шаги
      const { data: steps, error: stepsError } = await supabase
        .from('quiz_steps')
        .select('*')
        .order('order');
        
      if (stepsError) {
        console.error('Ошибка при загрузке шагов квиза:', stepsError);
        throw stepsError;
      }
      
      console.log('Загружено шагов квиза:', steps?.length);
      setQuizSteps(steps || []);
      
      // Загружаем опции ответов
      const { data: answers, error: answersError } = await supabase
        .from('quiz_answers')
        .select('*')
        .order('order');
        
      if (answersError) {
        console.error('Ошибка при загрузке опций квиза:', answersError);
        throw answersError;
      }
      
      console.log('Загружено опций квиза:', answers?.length);
      setQuizAnswers(answers || []);
      
      // Если есть шаги, автоматически выбираем первый
      if (steps && steps.length > 0 && !selectedStepId) {
        setSelectedStepId(steps[0].id);
      }
      
    } catch (error: any) {
      console.error('Ошибка при загрузке данных квиза:', error);
      setErrorMessage(error.message || 'Произошла ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };

  // Загружаем данные при монтировании
  useEffect(() => {
    fetchQuizData();
  }, []);

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>Настройки квиза (шаги и опции из Supabase)</h2>
        <button 
          className="admin-refresh-btn" 
          onClick={fetchQuizData} 
          disabled={loading}
        >
          <MdRefresh size={18} />
          Обновить
        </button>
      </div>
      
      {errorMessage && (
        <div className="admin-error admin-update-error">
          {errorMessage}
        </div>
      )}
      
      {loading ? (
        <div className="admin-loading">Загрузка шагов и опций...</div>
      ) : (
        <div className="quiz-manager-container">
          <div className="quiz-manager-columns">
            {/* Левая колонка - шаги квиза */}
            <QuizSteps 
              quizSteps={quizSteps}
              selectedStepId={selectedStepId}
              setSelectedStepId={setSelectedStepId}
              refreshData={fetchQuizData}
              setErrorMessage={setErrorMessage}
            />
            
            {/* Правая колонка - опции выбранного шага */}
            <QuizAnswers
              quizAnswers={quizAnswers}
              selectedStepId={selectedStepId}
              refreshData={fetchQuizData}
              setErrorMessage={setErrorMessage}
            />
          </div>
        </div>
      )}
      
      {/* Добавляем стили для админки */}
      <style>{`
        .quiz-manager-container {
          margin-top: 20px;
        }
        
        .quiz-manager-columns {
          display: flex;
          gap: 30px;
        }
        
        .quiz-steps-column, .quiz-answers-column {
          flex: 1;
        }
        
        .admin-table-container {
          max-height: 400px;
          overflow-y: auto;
          margin-bottom: 20px;
          background-color: rgba(40, 40, 55, 0.5);
          border-radius: 8px;
        }
        
        .admin-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .admin-table th,
        .admin-table td {
          padding: 10px;
          text-align: left;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .admin-table th {
          background-color: rgba(30, 30, 46, 0.5);
          position: sticky;
          top: 0;
          z-index: 1;
        }
        
        .admin-table tbody tr:hover {
          background-color: rgba(50, 50, 70, 0.3);
        }
        
        .selected-row {
          background-color: rgba(25, 118, 210, 0.2) !important;
        }
        
        .editing-row {
          background-color: rgba(255, 193, 7, 0.1) !important;
        }
        
        .admin-form {
          background-color: rgba(40, 40, 55, 0.5);
          padding: 15px;
          border-radius: 8px;
        }
        
        .form-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        
        .admin-input {
          padding: 8px 12px;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background-color: #f0f0f0 !important;
          color: #333 !important;
        }
        
        .admin-input::placeholder {
          color: #777;
        }
        
        .inline-edit {
          margin: 0;
          padding: 4px 8px;
        }
        
        .empty-selection-message {
          padding: 30px;
          text-align: center;
          background-color: rgba(40, 40, 55, 0.5);
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.6);
        }
        
        .empty-table {
          text-align: center;
          color: rgba(255, 255, 255, 0.5);
          padding: 20px 0;
        }
        
        .actions-cell {
          white-space: nowrap;
        }
        
        .action-btn {
          padding: 5px 10px;
          margin: 0 3px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
          border: none;
        }
        
        .view-btn {
          background-color: rgba(33, 150, 243, 0.7);
          color: white;
        }
        
        .edit-btn {
          background-color: rgba(255, 193, 7, 0.7);
          color: black;
        }
        
        .delete-btn {
          background-color: rgba(244, 67, 54, 0.7);
          color: white;
        }
        
        .admin-button {
          padding: 8px 16px;
          background-color: rgba(63, 81, 181, 0.8);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .admin-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default QuizManager;