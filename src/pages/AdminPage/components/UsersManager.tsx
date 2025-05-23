import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { User } from '../types';

// Компонент для управления пользователями
const UsersManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updateLoading, setUpdateLoading] = useState<boolean>(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  
  // Загрузка пользователей
  const fetchUsers = async () => {
    try {
      setLoading(true);
      if (!supabase) return;
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Ошибка при загрузке пользователей:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, []);

  // Обработчик изменения прав администратора
  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      setUpdateLoading(true);
      setUpdateError(null);
      
      if (!supabase) {
        throw new Error('Supabase клиент не доступен');
      }
      
      const { error } = await supabase
        .from('users')
        .update({ is_admin: !currentStatus })
        .eq('id', userId);
        
      if (error) throw error;
      
      // Обновляем локальный массив пользователей
      setUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, is_admin: !currentStatus } 
            : user
        )
      );
    } catch (error: any) {
      console.error('Ошибка при обновлении статуса администратора:', error);
      setUpdateError(error.message || 'Произошла ошибка при обновлении');
    } finally {
      setUpdateLoading(false);
    }
  };
  
  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>Управление пользователями</h2>
        <button 
          className="admin-refresh-btn" 
          onClick={fetchUsers} 
          disabled={loading}
        >
          Обновить
        </button>
      </div>
      
      {updateError && (
        <div className="admin-error admin-update-error">
          {updateError}
        </div>
      )}
      
      {loading ? (
        <div className="admin-loading">Загрузка пользователей...</div>
      ) : (
        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>ID в Telegram</th>
                <th>Имя</th>
                <th>Username</th>
                <th>Дата регистрации</th>
                <th>Последний вход</th>
                <th>Админ</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.telegram_id}</td>
                    <td>{`${user.first_name || ''} ${user.last_name || ''}`}</td>
                    <td>{user.username || '-'}</td>
                    <td>{new Date(user.created_at).toLocaleString()}</td>
                    <td>{user.last_login ? new Date(user.last_login).toLocaleString() : '-'}</td>
                    <td>
                      <span className={`admin-status ${user.is_admin ? 'admin-yes' : 'admin-no'}`}>
                        {user.is_admin ? 'Да' : 'Нет'}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button 
                        className={`action-btn ${user.is_admin ? 'delete-btn' : 'edit-btn'}`}
                        onClick={() => toggleAdminStatus(user.id, user.is_admin)}
                        disabled={updateLoading}
                      >
                        {user.is_admin ? 'Снять права' : 'Сделать админом'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="empty-table">Нет зарегистрированных пользователей</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UsersManager;