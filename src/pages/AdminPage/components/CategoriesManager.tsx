import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { MdRefresh } from 'react-icons/md';
import type { Category } from '../types';

// Компонент для управления категориями
const CategoriesManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updateLoading, setUpdateLoading] = useState<boolean>(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  
  // Новая категория
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  
  // Редактируемая категория
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editDescription, setEditDescription] = useState('');
  
  // Загрузка категорий
  const fetchCategories = async () => {
    try {
      setLoading(true);
      if (!supabase) {
        console.error('ОШИБКА: Supabase клиент не инициализирован');
        return;
      }
      
      console.log('Попытка загрузки категорий прямым запросом с логами...');
      
      // Попробуем выполнить запрос и посмотреть на данные в консоли
      const response = await supabase
        .from('categories')
        .select('*');
      
      // Логируем весь ответ для диагностики
      console.log('ДИАГНОСТИКА SUPABASE ОТВЕТА:', response);
      
      if (response.error) {
        console.error('ОШИБКА ЗАПРОСА В SUPABASE:', response.error);
        throw response.error;
      }
      
      // Проверяем, есть ли данные вообще
      if (!response.data) {
        console.log('ПУСТОЙ ОТВЕТ ОТ SUPABASE, НЕТ ДАННЫХ');
      } else {
        console.log('ПОЛУЧЕНЫ ДАННЫЕ ОТ SUPABASE:', response.data.length, 'категорий');
        console.log('ДАННЫЕ КАТЕГОРИЙ:', JSON.stringify(response.data, null, 2));
      }
      
      setCategories(response.data || []);
    } catch (error) {
      console.error('КРИТИЧЕСКАЯ ОШИБКА ПРИ ЗАГРУЗКЕ КАТЕГОРИЙ:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCategories();
  }, []);

  // Добавление категории
  const handleAddCategory = async () => {
    if (!newName || !newSlug) {
      alert('Введите название и slug для новой категории');
      return;
    }
    
    try {
      setAddLoading(true);
      setUpdateError(null);
      
      if (!supabase) {
        throw new Error('Supabase клиент не доступен');
      }
      
      // Проверка на уникальность slug
      const { data: existingCategory, error: checkError } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', newSlug)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      if (existingCategory) {
        throw new Error(`Категория с slug "${newSlug}" уже существует`);
      }
      
      // Находим максимальный display_order для новой категории
      const { data: maxOrderData } = await supabase
        .from('categories')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1)
        .single();
      
      const newOrder = maxOrderData?.display_order ? maxOrderData.display_order + 1 : 1;
      
      // Добавляем новую категорию
      const { error } = await supabase
        .from('categories')
        .insert([{ 
          name: newName,
          slug: newSlug,
          description: newDescription,
          display_order: newOrder
        }]);
        
      if (error) throw error;
      
      // Очищаем форму
      setNewName('');
      setNewSlug('');
      setNewDescription('');
      
      // Перезагружаем список
      fetchCategories();
      
    } catch (error: any) {
      console.error('Ошибка при добавлении категории:', error);
      setUpdateError(error.message || 'Произошла ошибка при добавлении категории');
    } finally {
      setAddLoading(false);
    }
  };
  
  // Удаление категории
  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту категорию?')) {
      return;
    }
    
    try {
      setUpdateLoading(true);
      setUpdateError(null);
      
      if (!supabase) {
        throw new Error('Supabase клиент не доступен');
      }
      
      // Проверяем, используется ли эта категория в практиках
      const { data: linkedPractices, error: checkError } = await supabase
        .from('contents')
        .select('id, title')
        .eq('category_id', id);
      
      if (checkError) throw checkError;
      
      if (linkedPractices && linkedPractices.length > 0) {
        const practiceNames = linkedPractices.map(p => p.title).join(', ');
        throw new Error(`Эта категория используется в практиках: ${practiceNames}`);
      }
      
      // Удаляем категорию
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Обновляем список категорий
      fetchCategories();
      
    } catch (error: any) {
      console.error('Ошибка при удалении категории:', error);
      setUpdateError(error.message || 'Произошла ошибка при удалении категории');
    } finally {
      setUpdateLoading(false);
    }
  };
  
  // Начать редактирование категории
  const startEditing = (category: Category) => {
    setEditingCategory(category);
    setEditName(category.name);
    setEditSlug(category.slug);
    setEditDescription(category.description || '');
  };
  
  // Отмена редактирования
  const cancelEditing = () => {
    setEditingCategory(null);
    setEditName('');
    setEditSlug('');
    setEditDescription('');
  };
  
  // Сохранение отредактированной категории
  const saveCategory = async () => {
    if (!editingCategory) return;
    if (!editName || !editSlug) {
      alert('Название и slug обязательны');
      return;
    }
    
    try {
      setUpdateLoading(true);
      setUpdateError(null);
      
      if (!supabase) {
        throw new Error('Supabase клиент не доступен');
      }
      
      // Проверка на уникальность slug, если он изменился
      if (editSlug !== editingCategory.slug) {
        const { data: existingCategory, error: checkError } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', editSlug)
          .neq('id', editingCategory.id)
          .maybeSingle();
        
        if (checkError) throw checkError;
        
        if (existingCategory) {
          throw new Error(`Категория с slug "${editSlug}" уже существует`);
        }
      }
      
      // Обновляем категорию
      const { error } = await supabase
        .from('categories')
        .update({ 
          name: editName,
          slug: editSlug,
          description: editDescription
        })
        .eq('id', editingCategory.id);
        
      if (error) throw error;
      
      // Завершаем редактирование
      cancelEditing();
      
      // Перезагружаем список
      fetchCategories();
      
    } catch (error: any) {
      console.error('Ошибка при обновлении категории:', error);
      setUpdateError(error.message || 'Произошла ошибка при обновлении категории');
    } finally {
      setUpdateLoading(false);
    }
  };
  
  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>Управление категориями</h2>
        <button 
          className="admin-refresh-btn" 
          onClick={fetchCategories} 
          disabled={loading}
        >
          <MdRefresh size={18} />
          Обновить
        </button>
      </div>
      
      {/* Форма добавления категории */}
      <div className="category-add-form">
        <h3>Добавить категорию</h3>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <input 
            className="admin-input" 
            placeholder="Название" 
            value={newName} 
            onChange={e => setNewName(e.target.value)} 
          />
          <input 
            className="admin-input" 
            placeholder="Slug" 
            value={newSlug} 
            onChange={e => setNewSlug(e.target.value)} 
          />
          <input 
            className="admin-input" 
            placeholder="Описание" 
            value={newDescription} 
            onChange={e => setNewDescription(e.target.value)} 
          />
          <button 
            className="admin-button" 
            onClick={handleAddCategory} 
            disabled={addLoading || !newName || !newSlug}
          >
            {addLoading ? 'Добавление...' : 'Добавить'}
          </button>
        </div>
      </div>
      
      {updateError && (
        <div className="admin-error admin-update-error">
          {updateError}
        </div>
      )}
      
      {loading ? (
        <div className="admin-loading">Загрузка категорий...</div>
      ) : (
        <div className="categories-table">
          <table>
            <thead>
              <tr>
                <th>Название</th>
                <th>Slug</th>
                <th>Описание</th>
                <th>Порядок</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {categories.length > 0 ? (
                categories.map((category) => (
                  <tr key={category.id}>
                    <td>
                      {editingCategory?.id === category.id ? (
                        <input 
                          className="admin-input" 
                          value={editName} 
                          onChange={e => setEditName(e.target.value)} 
                          style={{ width: '100%' }}
                        />
                      ) : (
                        category.name
                      )}
                    </td>
                    <td>
                      {editingCategory?.id === category.id ? (
                        <input 
                          className="admin-input" 
                          value={editSlug} 
                          onChange={e => setEditSlug(e.target.value)} 
                          style={{ width: '100%' }}
                        />
                      ) : (
                        category.slug
                      )}
                    </td>
                    <td>
                      {editingCategory?.id === category.id ? (
                        <input 
                          className="admin-input" 
                          value={editDescription} 
                          onChange={e => setEditDescription(e.target.value)} 
                          style={{ width: '100%' }}
                        />
                      ) : (
                        category.description || '-'
                      )}
                    </td>
                    <td>{category.display_order || '-'}</td>
                    <td className="actions-cell">
                      {editingCategory?.id === category.id ? (
                        <>
                          <button 
                            className="action-btn edit-btn" 
                            onClick={saveCategory}
                            disabled={updateLoading}
                          >
                            Сохранить
                          </button>
                          <button 
                            className="action-btn delete-btn" 
                            onClick={cancelEditing}
                            disabled={updateLoading}
                          >
                            Отмена
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            className="action-btn edit-btn" 
                            onClick={() => startEditing(category)}
                            disabled={updateLoading || !!editingCategory}
                          >
                            Изменить
                          </button>
                          <button 
                            className="action-btn delete-btn" 
                            onClick={() => handleDeleteCategory(category.id)}
                            disabled={updateLoading || !!editingCategory}
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
                  <td colSpan={5} className="empty-table">Нет доступных категорий</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CategoriesManager;