import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { QuizStep } from '../types';

interface QuizStepsProps {
  quizSteps: QuizStep[];
  selectedStepId: string | null;
  setSelectedStepId: (id: string | null) => void;
  refreshData: () => void;
  setErrorMessage: (message: string | null) => void;
}

const QuizSteps: React.FC<QuizStepsProps> = ({
  quizSteps,
  selectedStepId,
  setSelectedStepId,
  refreshData,
  setErrorMessage
}) => {
  // Состояние для добавления шага
  const [stepTitle, setStepTitle] = useState('');
  const [stepType, setStepType] = useState('');
  const [stepOrder, setStepOrder] = useState(0);
  const [addStepLoading, setAddStepLoading] = useState(false);

  // Состояние для редактирования шага
  const [editingStep, setEditingStep] = useState<QuizStep | null>(null);
  const [editStepTitle, setEditStepTitle] = useState('');
  const [editStepType, setEditStepType] = useState('');
  const [editStepOrder, setEditStepOrder] = useState(0);

  // Добавление шага квиза
  const handleAddStep = async () => {
    if (!stepTitle || !stepType) {
      alert('Введите заголовок и тип шага');
      return;
    }
    
    setAddStepLoading(true);
    setErrorMessage(null);
    
    try {
      if (!supabase) {
        throw new Error('Supabase клиент не инициализирован');
      }
      
      const { error } = await supabase
        .from('quiz_steps')
        .insert([{ 
          title: stepTitle, 
          type: stepType, 
          order: stepOrder, 
          is_active: true 
        }]);
        
      if (error) throw error;
      
      // Очищаем форму
      setStepTitle('');
      setStepType('');
      setStepOrder(0);
      
      // Перезагружаем данные
      refreshData();
      
    } catch (error: any) {
      console.error('Ошибка при добавлении шага:', error);
      setErrorMessage(error.message || 'Произошла ошибка при добавлении шага');
    } finally {
      setAddStepLoading(false);
    }
  };

  // Обновление шага
  const handleUpdateStep = async () => {
    if (!editingStep) return;
    if (!editStepTitle || !editStepType) {
      alert('Заголовок и тип шага обязательны');
      return;
    }
    
    try {
      if (!supabase) {
        throw new Error('Supabase клиент не инициализирован');
      }
      
      const { error } = await supabase
        .from('quiz_steps')
        .update({ 
          title: editStepTitle, 
          type: editStepType, 
          order: editStepOrder
        })
        .eq('id', editingStep.id);
        
      if (error) throw error;
      
      // Завершаем редактирование
      setEditingStep(null);
      
      // Перезагружаем данные
      refreshData();
      
    } catch (error: any) {
      console.error('Ошибка при обновлении шага:', error);
      setErrorMessage(error.message || 'Произошла ошибка при обновлении шага');
    }
  };

  // Удаление шага
  const handleDeleteStep = async (stepId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот шаг? Все связанные опции также будут удалены.')) {
      return;
    }
    
    try {
      if (!supabase) {
        throw new Error('Supabase клиент не инициализирован');
      }
      
      // Сначала удаляем все связанные опции
      const { error: answersError } = await supabase
        .from('quiz_answers')
        .delete()
        .eq('question_id', stepId);
        
      if (answersError) throw answersError;
      
      // Затем удаляем сам шаг
      const { error } = await supabase
        .from('quiz_steps')
        .delete()
        .eq('id', stepId);
        
      if (error) throw error;
      
      // Если удаляемый шаг был выбран, сбрасываем выбор
      if (selectedStepId === stepId) {
        setSelectedStepId(null);
      }
      
      // Перезагружаем данные
      refreshData();
      
    } catch (error: any) {
      console.error('Ошибка при удалении шага:', error);
      setErrorMessage(error.message || 'Произошла ошибка при удалении шага');
    }
  };

  // Начать редактирование шага
  const startEditingStep = (step: QuizStep) => {
    setEditingStep(step);
    setEditStepTitle(step.title);
    setEditStepType(step.type);
    setEditStepOrder(step.order);
  };

  // Отменить редактирование шага
  const cancelEditingStep = () => {
    setEditingStep(null);
  };

  return (
    <div className="quiz-steps-column">
      <h3>Шаги квиза</h3>
      
      {/* Таблица шагов */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Порядок</th>
              <th>Заголовок</th>
              <th>Тип</th>
              <th>Активен</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {quizSteps.length > 0 ? (
              quizSteps.map((step) => (
                <tr 
                  key={step.id} 
                  className={`${selectedStepId === step.id ? 'selected-row' : ''} ${editingStep?.id === step.id ? 'editing-row' : ''}`}
                >
                  <td>
                    {editingStep?.id === step.id ? (
                      <input 
                        type="number"
                        className="admin-input inline-edit"
                        value={editStepOrder}
                        onChange={(e) => setEditStepOrder(Number(e.target.value))}
                        style={{ color: '#333', backgroundColor: '#f0f0f0', width: '60px' }}
                      />
                    ) : (
                      step.order
                    )}
                  </td>
                  <td>
                    {editingStep?.id === step.id ? (
                      <input 
                        className="admin-input inline-edit"
                        value={editStepTitle}
                        onChange={(e) => setEditStepTitle(e.target.value)}
                        style={{ color: '#333', backgroundColor: '#f0f0f0', width: '100%' }}
                      />
                    ) : (
                      step.title
                    )}
                  </td>
                  <td>
                    {editingStep?.id === step.id ? (
                      <input 
                        className="admin-input inline-edit"
                        value={editStepType}
                        onChange={(e) => setEditStepType(e.target.value)}
                        style={{ color: '#333', backgroundColor: '#f0f0f0', width: '100%' }}
                      />
                    ) : (
                      step.type
                    )}
                  </td>
                  <td>{step.is_active ? 'Да' : 'Нет'}</td>
                  <td className="actions-cell">
                    {editingStep?.id === step.id ? (
                      <>
                        <button 
                          className="action-btn edit-btn"
                          onClick={handleUpdateStep}
                        >
                          Сохранить
                        </button>
                        <button 
                          className="action-btn delete-btn"
                          onClick={cancelEditingStep}
                        >
                          Отмена
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          className="action-btn view-btn"
                          onClick={() => setSelectedStepId(step.id)}
                        >
                          Опции
                        </button>
                        <button 
                          className="action-btn edit-btn"
                          onClick={() => startEditingStep(step)}
                          disabled={!!editingStep}
                        >
                          Изменить
                        </button>
                        <button 
                          className="action-btn delete-btn"
                          onClick={() => handleDeleteStep(step.id)}
                          disabled={!!editingStep}
                        >
                          Удалить
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="empty-table">Нет доступных шагов</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Форма добавления шага */}
      <div className="admin-form">
        <h4>Добавить шаг</h4>
        <div className="form-row">
          <input 
            className="admin-input"
            placeholder="Заголовок" 
            value={stepTitle} 
            onChange={(e) => setStepTitle(e.target.value)}
            style={{ color: '#333', backgroundColor: '#f0f0f0' }}
          />
          <input 
            className="admin-input"
            placeholder="Тип (type)" 
            value={stepType} 
            onChange={(e) => setStepType(e.target.value)} 
            style={{ color: '#333', backgroundColor: '#f0f0f0' }}
          />
          <input 
            className="admin-input"
            type="number" 
            placeholder="Порядок" 
            value={stepOrder} 
            onChange={(e) => setStepOrder(Number(e.target.value))} 
            style={{ color: '#333', backgroundColor: '#f0f0f0', width: '80px' }}
          />
          <button 
            className="admin-button" 
            onClick={handleAddStep} 
            disabled={addStepLoading || !stepTitle || !stepType}
          >
            {addStepLoading ? 'Добавление...' : 'Добавить'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizSteps;