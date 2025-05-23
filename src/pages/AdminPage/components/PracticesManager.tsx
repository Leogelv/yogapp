import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { MdPlayCircleOutline } from 'react-icons/md';
import { formatTimeFromSeconds } from '@/components/TimeInput/TimeInput';
import type { Practice, EditingCell, PracticesManagerProps } from '../types';

// Компонент для управления практиками
const PracticesManager: React.FC<PracticesManagerProps> = ({ 
  setPreviewPractice, 
  setEditPractice, 
  categories 
}) => {
  const [practices, setPractices] = useState<Practice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [editValue, setEditValue] = useState<string | number>('');
  
  console.log('PracticesManager рендеринг');

  // Загрузка практик
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Начинаем загрузку практик...');
        setLoading(true);
        if (!supabase) return;
        
        // Загружаем практики с включением связанных данных
        const { data, error } = await supabase
          .from('contents')
          .select(`
            *,
            content_types (
              name, 
              slug
            ),
            categories (
              name,
              slug
            )
          `)
          .order('title');
        
        if (error) throw error;
        
        console.log('Загружено практик:', data?.length);
        setPractices(data || []);
      } catch (error) {
        console.error('Ошибка при загрузке практик:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Подписка на realtime обновления таблицы contents
    if (supabase) {
      console.log('Подписываемся на обновления таблицы contents');
      const channel = supabase
        .channel('contents_changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'contents' },
          (payload) => {
            console.log('Получено realtime событие:', payload.eventType);
            // Перезагружаем данные
            fetchData();
          }
        )
        .subscribe();
        
      // Очистка подписки при размонтировании
      return () => {
        console.log('Отписываемся от realtime обновлений');
        channel.unsubscribe();
      };
    }
  }, []);

  // Обработчики для событий
  const handleEditClick = (e: React.MouseEvent, practice: Practice) => {
    console.log('Клик по кнопке "Изменить" практику:', practice.title);
    e.stopPropagation();
    setEditPractice(practice);
  };

  const handleVideoPreview = (e: React.MouseEvent, practice: Practice) => {
    console.log('Клик по иконке предпросмотра видео:', practice.title);
    e.stopPropagation();
    setPreviewPractice(practice);
  };
  
  // Функции для инлайн-редактирования
  const startEditing = (practice: Practice, field: string) => {
    console.log(`Начинаем редактирование поля ${field} для практики ${practice.title}`);
    setEditingCell({ id: practice.id, field });
    
    // Устанавливаем начальное значение в зависимости от поля
    if (field === 'duration') {
      setEditValue(practice.duration || 0);
    } else if (field === 'title') {
      setEditValue(practice.title || '');
    } else if (field === 'category_id') {
      setEditValue(practice.category_id || '');
    }
  };
  
  const cancelEditing = () => {
    setEditingCell(null);
    setEditValue('');
  };
  
  const saveInlineEdit = async () => {
    if (!editingCell) return;
    
    try {
      console.log(`Сохраняем изменение поля ${editingCell.field} для практики ID: ${editingCell.id}`);
      
      if (!supabase) throw new Error('Supabase не инициализирован');
      
      // Создаем объект для обновления с одним полем
      const updateData: Record<string, any> = {};
      updateData[editingCell.field] = editValue;
      
      // Если это длительность, убедимся, что она числовая
      if (editingCell.field === 'duration') {
        updateData[editingCell.field] = Number(editValue);
      }
      
      const { error } = await supabase
        .from('contents')
        .update(updateData)
        .eq('id', editingCell.id);
        
      if (error) throw error;
      
      console.log('Изменение успешно сохранено');
      
      // Обновляем локальные данные без ожидания realtime события
      setPractices(prev => 
        prev.map(practice => {
          if (practice.id === editingCell.id) {
            // Создаем обновленный объект практики
            const updatedPractice = { ...practice };
            
            // Обновляем поле в зависимости от типа
            if (editingCell.field === 'category_id') {
              updatedPractice.category_id = editValue as string;
              
              // Также обновляем кэшированное значение категории
              const selectedCategory = categories.find(cat => cat.id === editValue);
              if (selectedCategory) {
                updatedPractice.categories = {
                  id: selectedCategory.id,
                  name: selectedCategory.name,
                  slug: selectedCategory.slug
                };
              } else {
                updatedPractice.categories = undefined;
              }
            } else if (editingCell.field === 'duration') {
              updatedPractice[editingCell.field] = Number(editValue);
            } else {
              (updatedPractice as any)[editingCell.field] = editValue;
            }
            
            return updatedPractice;
          }
          return practice;
        })
      );
      
      // Добавляем визуальный эффект успешного сохранения
      const cell = document.querySelector(`td[data-id="${editingCell.id}"][data-field="${editingCell.field}"]`);
      if (cell) {
        cell.classList.add('save-flash');
        setTimeout(() => {
          cell.classList.remove('save-flash');
        }, 1000);
      }
    } catch (e: any) {
      console.error('Ошибка при сохранении изменения:', e);
      alert(`Ошибка при сохранении: ${e.message}`);
    } finally {
      cancelEditing();
    }
  };
  
  // Обработчик клавиш для инлайн-редактирования
  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveInlineEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEditing();
    }
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>Управление практиками</h2>
        <button 
          className="admin-add-btn"
          onClick={() => console.log('Клик по кнопке "Добавить практику"')}
        >
          Добавить практику
        </button>
      </div>
      {loading ? (
        <div className="admin-loading">Загрузка практик...</div>
      ) : (
        <div className="practices-table">
          <table>
            <thead>
              <tr>
                <th>Название</th>
                <th>Тип</th>
                <th>Категория</th>
                <th>Длительность</th>
                <th>Обложка</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {practices.length > 0 ? (
                practices.map((practice) => (
                  <tr key={practice.id}>
                    <td 
                      className={`editable-cell ${editingCell?.id === practice.id && editingCell?.field === 'title' ? 'editing' : ''}`}
                      onClick={() => startEditing(practice, 'title')}
                      data-id={practice.id}
                      data-field="title"
                    >
                      {practice.kinescope_id && (
                        <MdPlayCircleOutline
                          size={24}
                          style={{ 
                            cursor: 'pointer', 
                            color: '#1976d2', 
                            marginRight: '8px',
                            verticalAlign: 'middle',
                          }}
                          title="Смотреть видео"
                          onClick={(e) => {
                            e.stopPropagation(); // Предотвращаем открытие редактирования при клике на иконку
                            handleVideoPreview(e, practice);
                          }}
                        />
                      )}
                      {editingCell?.id === practice.id && editingCell?.field === 'title' ? (
                        <input 
                          value={editValue.toString()} 
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={saveInlineEdit}
                          onKeyDown={handleEditKeyDown}
                          autoFocus
                        />
                      ) : (
                        practice.title
                      )}
                    </td>
                    <td>{practice.content_types?.name || '-'}</td>
                    <td 
                      className={`editable-cell ${editingCell?.id === practice.id && editingCell?.field === 'category_id' ? 'editing' : ''}`}
                      onClick={() => startEditing(practice, 'category_id')}
                      data-id={practice.id}
                      data-field="category_id"
                    >
                      {editingCell?.id === practice.id && editingCell?.field === 'category_id' ? (
                        <select 
                          value={editValue.toString()}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={saveInlineEdit}
                          onKeyDown={handleEditKeyDown}
                          className="inline-select"
                          autoFocus
                        >
                          <option value="">—</option>
                          {categories && categories.length > 0 ? (
                            categories.map((cat) => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))
                          ) : (
                            <option disabled>Загрузка категорий...</option>
                          )}
                        </select>
                      ) : (
                        practice.categories?.name || '-'
                      )}
                    </td>
                    <td 
                      style={{ cursor: 'default' }}
                      data-id={practice.id}
                      data-field="duration"
                    >
                      {practice.duration ? formatTimeFromSeconds(practice.duration) : '-'}
                    </td>
                    <td>
                      {practice.thumbnail_url ? (
                        <img src={practice.thumbnail_url} alt="thumbnail" style={{ width: 80, height: 50, objectFit: 'cover', borderRadius: 4 }} />
                      ) : (
                        <span style={{ color: '#aaa' }}>—</span>
                      )}
                    </td>
                    <td className="actions-cell">
                      <button 
                        className="action-btn edit-btn" 
                        onClick={(e) => handleEditClick(e, practice)}
                        style={{
                          padding: '8px 12px',
                          margin: '2px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Изменить
                      </button>
                      <button 
                        className="action-btn delete-btn"
                        onClick={() => console.log('Клик по кнопке "Удалить" практику:', practice.title)}
                        style={{
                          padding: '8px 12px',
                          margin: '2px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="empty-table">Нет доступных практик</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PracticesManager;