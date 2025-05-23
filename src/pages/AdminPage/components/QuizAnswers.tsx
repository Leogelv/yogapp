import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { QuizAnswer } from '../types';

interface QuizAnswersProps {
  quizAnswers: QuizAnswer[];
  selectedStepId: string | null;
  refreshData: () => void;
  setErrorMessage: (message: string | null) => void;
}

const QuizAnswers: React.FC<QuizAnswersProps> = ({
  quizAnswers,
  selectedStepId,
  refreshData,
  setErrorMessage
}) => {
  // Состояние для добавления опции
  const [answerLabel, setAnswerLabel] = useState('');
  const [answerValue, setAnswerValue] = useState('');
  const [answerOrder, setAnswerOrder] = useState(0);
  const [addAnswerLoading, setAddAnswerLoading] = useState(false);
  
  // Состояние для редактирования опции
  const [editingAnswer, setEditingAnswer] = useState<QuizAnswer | null>(null);
  const [editAnswerLabel, setEditAnswerLabel] = useState('');
  const [editAnswerValue, setEditAnswerValue] = useState('');
  const [editAnswerOrder, setEditAnswerOrder] = useState(0);

  // Добавление опции ответа
  const handleAddAnswer = async () => {
    if (!selectedStepId) {
      alert('Сначала выберите шаг квиза');
      return;
    }
    
    if (!answerLabel || !answerValue) {
      alert('Введите метку и значение опции');
      return;
    }
    
    setAddAnswerLoading(true);
    setErrorMessage(null);
    
    try {
      if (!supabase) {
        throw new Error('Supabase клиент не инициализирован');
      }
      
      const { error } = await supabase
        .from('quiz_answers')
        .insert([{ 
          question_id: selectedStepId, 
          label: answerLabel, 
          value: answerValue, 
          order: answerOrder 
        }]);
        
      if (error) throw error;
      
      // Очищаем форму
      setAnswerLabel('');
      setAnswerValue('');
      setAnswerOrder(0);
      
      // Перезагружаем данные
      refreshData();
      
    } catch (error: any) {
      console.error('Ошибка при добавлении опции:', error);
      setErrorMessage(error.message || 'Произошла ошибка при добавлении опции');
    } finally {
      setAddAnswerLoading(false);
    }
  };

  // Обновление опции
  const handleUpdateAnswer = async () => {
    if (!editingAnswer) return;
    if (!editAnswerLabel || !editAnswerValue) {
      alert('Метка и значение опции обязательны');
      return;
    }
    
    try {
      if (!supabase) {
        throw new Error('Supabase клиент не инициализирован');
      }
      
      const { error } = await supabase
        .from('quiz_answers')
        .update({ 
          label: editAnswerLabel, 
          value: editAnswerValue, 
          order: editAnswerOrder
        })
        .eq('id', editingAnswer.id);
        
      if (error) throw error;
      
      // Завершаем редактирование
      setEditingAnswer(null);
      
      // Перезагружаем данные
      refreshData();
      
    } catch (error: any) {
      console.error('Ошибка при обновлении опции:', error);
      setErrorMessage(error.message || 'Произошла ошибка при обновлении опции');
    }
  };

  // Удаление опции
  const handleDeleteAnswer = async (answerId: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту опцию?')) {
      return;
    }
    
    try {
      if (!supabase) {
        throw new Error('Supabase клиент не инициализирован');
      }
      
      const { error } = await supabase
        .from('quiz_answers')
        .delete()
        .eq('id', answerId);
        
      if (error) throw error;
      
      // Перезагружаем данные
      refreshData();
      
    } catch (error: any) {
      console.error('Ошибка при удалении опции:', error);
      setErrorMessage(error.message || 'Произошла ошибка при удалении опции');
    }
  };

  // Начать редактирование опции
  const startEditingAnswer = (answer: QuizAnswer) => {
    setEditingAnswer(answer);
    setEditAnswerLabel(answer.label);
    setEditAnswerValue(answer.value);
    setEditAnswerOrder(answer.order);
  };

  // Отменить редактирование опции
  const cancelEditingAnswer = () => {
    setEditingAnswer(null);
  };

  return (
    <div className="quiz-answers-column">
      <h3>Опции для шага</h3>
      
      {selectedStepId ? (
        <>
          {/* Таблица опций */}
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Порядок</th>
                  <th>Метка</th>
                  <th>Значение</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {quizAnswers.filter(a => a.question_id === selectedStepId).length > 0 ? (
                  quizAnswers
                    .filter(a => a.question_id === selectedStepId)
                    .map((answer) => (
                      <tr 
                        key={answer.id}
                        className={editingAnswer?.id === answer.id ? 'editing-row' : ''}
                      >
                        <td>
                          {editingAnswer?.id === answer.id ? (
                            <input 
                              type="number"
                              className="admin-input inline-edit"
                              value={editAnswerOrder}
                              onChange={(e) => setEditAnswerOrder(Number(e.target.value))}
                              style={{ color: '#333', backgroundColor: '#f0f0f0', width: '60px' }}
                            />
                          ) : (
                            answer.order
                          )}
                        </td>
                        <td>
                          {editingAnswer?.id === answer.id ? (
                            <input 
                              className="admin-input inline-edit"
                              value={editAnswerLabel}
                              onChange={(e) => setEditAnswerLabel(e.target.value)}
                              style={{ color: '#333', backgroundColor: '#f0f0f0', width: '100%' }}
                            />
                          ) : (
                            answer.label
                          )}
                        </td>
                        <td>
                          {editingAnswer?.id === answer.id ? (
                            <input 
                              className="admin-input inline-edit"
                              value={editAnswerValue}
                              onChange={(e) => setEditAnswerValue(e.target.value)}
                              style={{ color: '#333', backgroundColor: '#f0f0f0', width: '100%' }}
                            />
                          ) : (
                            answer.value
                          )}
                        </td>
                        <td className="actions-cell">
                          {editingAnswer?.id === answer.id ? (
                            <>
                              <button 
                                className="action-btn edit-btn"
                                onClick={handleUpdateAnswer}
                              >
                                Сохранить
                              </button>
                              <button 
                                className="action-btn delete-btn"
                                onClick={cancelEditingAnswer}
                              >
                                Отмена
                              </button>
                            </>
                          ) : (
                            <>
                              <button 
                                className="action-btn edit-btn"
                                onClick={() => startEditingAnswer(answer)}
                                disabled={!!editingAnswer}
                              >
                                Изменить
                              </button>
                              <button 
                                className="action-btn delete-btn"
                                onClick={() => handleDeleteAnswer(answer.id)}
                                disabled={!!editingAnswer}
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
                    <td colSpan={4} className="empty-table">Нет опций для этого шага</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Форма добавления опции */}
          <div className="admin-form">
            <h4>Добавить опцию</h4>
            <div className="form-row">
              <input 
                className="admin-input"
                placeholder="Метка" 
                value={answerLabel} 
                onChange={(e) => setAnswerLabel(e.target.value)} 
                style={{ color: '#333', backgroundColor: '#f0f0f0' }}
              />
              <input 
                className="admin-input"
                placeholder="Значение" 
                value={answerValue} 
                onChange={(e) => setAnswerValue(e.target.value)} 
                style={{ color: '#333', backgroundColor: '#f0f0f0' }}
              />
              <input 
                className="admin-input"
                type="number" 
                placeholder="Порядок" 
                value={answerOrder} 
                onChange={(e) => setAnswerOrder(Number(e.target.value))} 
                style={{ color: '#333', backgroundColor: '#f0f0f0', width: '80px' }}
              />
              <button 
                className="admin-button" 
                onClick={handleAddAnswer} 
                disabled={addAnswerLoading || !answerLabel || !answerValue}
              >
                {addAnswerLoading ? 'Добавление...' : 'Добавить'}
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="empty-selection-message">
          Выберите шаг для просмотра и добавления опций
        </div>
      )}
    </div>
  );
};

export default QuizAnswers;