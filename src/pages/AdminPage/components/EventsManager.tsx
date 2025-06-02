import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { EventItem, Category, ContentType } from '../types';
import { RealtimeChannel } from '@supabase/supabase-js';

interface EventsManagerProps {
  categories: Category[];
  contentTypes: ContentType[];
}

const EventsManager: React.FC<EventsManagerProps> = ({ categories, contentTypes }) => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'cancelled' | 'completed'>('all');

  // Refs для realtime обновлений
  const channelRef = useRef<RealtimeChannel | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Форма для создания/редактирования события
  const [formData, setFormData] = useState<Partial<EventItem>>({
    title: '',
    subtitle: '',
    description: '',
    duration: 3600, // 1 час по умолчанию
    thumbnail_url: '',
    background_image_url: '',
    content_type_id: '',
    category_id: '',
    difficulty_level: '',
    kinescope_id: '',
    audio_file_path: '',
    is_premium: false,
    is_featured: false,
    display_order: 0,
    metadata: null,
    event_date: new Date().toISOString().split('T')[0],
    start_time: '18:00:00',
    end_time: '',
    is_recurring: false,
    recurring_pattern: null,
    event_status: 'active',
    max_participants: undefined,
    instructor_name: '',
    location: ''
  });

  // Загрузка событий
  const fetchEvents = async () => {
    if (!supabase) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          content_types (id, name, slug),
          categories (id, name, slug)
        `)
        .order('event_date', { ascending: false })
        .order('start_time', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (err: any) {
      console.error('Ошибка при загрузке событий:', err);
      setError(err.message || 'Ошибка при загрузке событий');
    } finally {
      setLoading(false);
    }
  };

  // Загружаем события при монтировании
  useEffect(() => {
    fetchEvents();
  }, []);

  // Настраиваем realtime обновления
  useEffect(() => {
    if (!supabase) return;

    channelRef.current = supabase
      .channel('public:events')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        () => {
          const now = Date.now();
          if (now - lastUpdateTimeRef.current < 200) return;

          if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

          debounceTimerRef.current = setTimeout(() => {
            fetchEvents();
            debounceTimerRef.current = null;
          }, 300);

          lastUpdateTimeRef.current = now;
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) channelRef.current.unsubscribe();
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  // Сохранение события
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    try {
      setLoading(true);
      setError(null);

      const eventData = {
        ...formData,
        content_type_id: formData.content_type_id || null,
        category_id: formData.category_id || null,
        thumbnail_url: formData.thumbnail_url || null,
        background_image_url: formData.background_image_url || null,
        difficulty_level: formData.difficulty_level || null,
        kinescope_id: formData.kinescope_id || null,
        audio_file_path: formData.audio_file_path || null,
        end_time: formData.end_time || null,
        max_participants: formData.max_participants || undefined,
        instructor_name: formData.instructor_name || null,
        location: formData.location || null,
        display_order: formData.display_order || 0
      };

      if (editingEvent) {
        // Обновление существующего события
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', editingEvent.id);

        if (error) throw error;
      } else {
        // Создание нового события
        const { error } = await supabase
          .from('events')
          .insert([eventData]);

        if (error) throw error;
      }

      // Сброс формы
      setFormData({
        title: '',
        subtitle: '',
        description: '',
        duration: 3600,
        thumbnail_url: '',
        background_image_url: '',
        content_type_id: '',
        category_id: '',
        difficulty_level: '',
        kinescope_id: '',
        audio_file_path: '',
        is_premium: false,
        is_featured: false,
        display_order: 0,
        metadata: null,
        event_date: new Date().toISOString().split('T')[0],
        start_time: '18:00:00',
        end_time: '',
        is_recurring: false,
        recurring_pattern: null,
        event_status: 'active',
        max_participants: undefined,
        instructor_name: '',
        location: ''
      });
      setShowCreateForm(false);
      setEditingEvent(null);
    } catch (err: any) {
      console.error('Ошибка при сохранении события:', err);
      setError(err.message || 'Ошибка при сохранении события');
    } finally {
      setLoading(false);
    }
  };

  // Удаление события
  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Вы уверены, что хотите удалить это событие?')) return;
    if (!supabase) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
    } catch (err: any) {
      console.error('Ошибка при удалении события:', err);
      setError(err.message || 'Ошибка при удалении события');
    } finally {
      setLoading(false);
    }
  };

  // Редактирование события
  const handleEditEvent = (event: EventItem) => {
    setFormData({
      title: event.title,
      subtitle: event.subtitle || '',
      description: event.description || '',
      duration: event.duration,
      thumbnail_url: event.thumbnail_url || '',
      background_image_url: event.background_image_url || '',
      content_type_id: event.content_type_id || '',
      category_id: event.category_id || '',
      difficulty_level: event.difficulty_level || '',
      kinescope_id: event.kinescope_id || '',
      audio_file_path: event.audio_file_path || '',
      is_premium: event.is_premium,
      is_featured: event.is_featured,
      display_order: event.display_order || 0,
      metadata: event.metadata,
      event_date: event.event_date,
      start_time: event.start_time,
      end_time: event.end_time || '',
      is_recurring: event.is_recurring,
      recurring_pattern: event.recurring_pattern,
      event_status: event.event_status,
      max_participants: event.max_participants || undefined,
      instructor_name: event.instructor_name || '',
      location: event.location || ''
    });
    setEditingEvent(event);
    setShowCreateForm(true);
  };

  // Фильтрация событий
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.instructor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         '';
    const matchesStatus = filterStatus === 'all' || event.event_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU');
  };

  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5); // HH:MM
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}ч ${minutes}м`;
    }
    return `${minutes}м`;
  };

  if (loading) {
    return <div className="admin-loading">Загрузка событий...</div>;
  }

  return (
    <div className="events-manager">
      <div className="events-header">
        <h2>Управление событиями</h2>
        <button
          className="admin-button primary"
          onClick={() => {
            setEditingEvent(null);
            setFormData({
              title: '',
              subtitle: '',
              description: '',
              duration: 3600,
              thumbnail_url: '',
              background_image_url: '',
              content_type_id: '',
              category_id: '',
              difficulty_level: '',
              kinescope_id: '',
              audio_file_path: '',
              is_premium: false,
              is_featured: false,
              display_order: 0,
              metadata: null,
              event_date: new Date().toISOString().split('T')[0],
              start_time: '18:00:00',
              end_time: '',
              is_recurring: false,
              recurring_pattern: null,
              event_status: 'active',
              max_participants: undefined,
              instructor_name: '',
              location: ''
            });
            setShowCreateForm(true);
          }}
        >
          Создать событие
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {/* Фильтры */}
      <div className="events-filters">
        <input
          type="text"
          placeholder="Поиск по названию или инструктору..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="admin-input"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="admin-select"
        >
          <option value="all">Все статусы</option>
          <option value="active">Активные</option>
          <option value="cancelled">Отмененные</option>
          <option value="completed">Завершенные</option>
        </select>
      </div>

      {/* Список событий */}
      <div className="events-list">
        {filteredEvents.length === 0 ? (
          <p>События не найдены</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Дата</th>
                <th>Время</th>
                <th>Длительность</th>
                <th>Инструктор</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((event) => (
                <tr key={event.id}>
                  <td>
                    <div>
                      <strong>{event.title}</strong>
                      {event.subtitle && <div className="subtitle">{event.subtitle}</div>}
                    </div>
                  </td>
                  <td>{formatDate(event.event_date)}</td>
                  <td>
                    {formatTime(event.start_time)}
                    {event.end_time && ` - ${formatTime(event.end_time)}`}
                  </td>
                  <td>{formatDuration(event.duration)}</td>
                  <td>{event.instructor_name || '-'}</td>
                  <td>
                    <span className={`status ${event.event_status}`}>
                      {event.event_status === 'active' && 'Активное'}
                      {event.event_status === 'cancelled' && 'Отменено'}
                      {event.event_status === 'completed' && 'Завершено'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="admin-button small"
                        onClick={() => handleEditEvent(event)}
                      >
                        Редактировать
                      </button>
                      <button
                        className="admin-button small danger"
                        onClick={() => handleDeleteEvent(event.id)}
                      >
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Форма создания/редактирования */}
      {showCreateForm && (
        <div className="admin-modal-backdrop" onClick={() => setShowCreateForm(false)}>
          <div className="admin-modal large" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editingEvent ? 'Редактировать событие' : 'Создать событие'}</h3>
              <button
                className="admin-modal-close"
                onClick={() => setShowCreateForm(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="event-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Название *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="admin-input"
                  />
                </div>
                <div className="form-group">
                  <label>Подзаголовок</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="admin-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Описание</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="admin-textarea"
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Дата события *</label>
                  <input
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    required
                    className="admin-input"
                  />
                </div>
                <div className="form-group">
                  <label>Время начала *</label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value + ':00' })}
                    required
                    className="admin-input"
                  />
                </div>
                <div className="form-group">
                  <label>Время окончания</label>
                  <input
                    type="time"
                    value={formData.end_time?.substring(0, 5) || ''}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value ? e.target.value + ':00' : '' })}
                    className="admin-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Длительность (минуты) *</label>
                  <input
                    type="number"
                    value={Math.floor(formData.duration! / 60)}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value || '0') * 60 })}
                    required
                    className="admin-input"
                  />
                </div>
                <div className="form-group">
                  <label>Инструктор</label>
                  <input
                    type="text"
                    value={formData.instructor_name}
                    onChange={(e) => setFormData({ ...formData, instructor_name: e.target.value })}
                    className="admin-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Категория</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="admin-select"
                  >
                    <option value="">Выберите категорию</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Тип контента</label>
                  <select
                    value={formData.content_type_id}
                    onChange={(e) => setFormData({ ...formData, content_type_id: e.target.value })}
                    className="admin-select"
                  >
                    <option value="">Выберите тип</option>
                    {contentTypes.map((type) => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Kinescope ID</label>
                  <input
                    type="text"
                    value={formData.kinescope_id}
                    onChange={(e) => setFormData({ ...formData, kinescope_id: e.target.value })}
                    className="admin-input"
                  />
                </div>
                <div className="form-group">
                  <label>Путь к аудиофайлу</label>
                  <input
                    type="text"
                    value={formData.audio_file_path}
                    onChange={(e) => setFormData({ ...formData, audio_file_path: e.target.value })}
                    className="admin-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>URL обложки</label>
                  <input
                    type="url"
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                    className="admin-input"
                  />
                </div>
                <div className="form-group">
                  <label>Статус</label>
                  <select
                    value={formData.event_status}
                    onChange={(e) => setFormData({ ...formData, event_status: e.target.value as any })}
                    className="admin-select"
                  >
                    <option value="active">Активное</option>
                    <option value="cancelled">Отменено</option>
                    <option value="completed">Завершено</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="admin-button secondary"
                  onClick={() => setShowCreateForm(false)}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="admin-button primary"
                  disabled={loading}
                >
                  {loading ? 'Сохранение...' : (editingEvent ? 'Обновить' : 'Создать')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsManager;