import React, { useState, useEffect } from 'react';
import TimeInput from '@/components/TimeInput/TimeInput';
import { uploadFileToR2 } from '@/lib/cloudflareR2Service';
import type { EditPracticeModalProps, Practice } from '../types';

// Модалка для редактирования практики
const EditPracticeModal: React.FC<EditPracticeModalProps> = ({ 
  practice, 
  categories, 
  contentTypes, 
  onClose, 
  onSave, 
  saving, 
  error 
}) => {
  console.log('EditPracticeModal рендеринг, форма:', practice);
  const [form, setForm] = useState<Practice>({ ...practice, categories: undefined, content_types: undefined });
  const [thumbPreview, setThumbPreview] = useState<string>(practice.thumbnail_url || '');
  const [audioPreview, setAudioPreview] = useState<string>(practice.audio_file_path || '');
  const [uploading, setUploading] = useState(false);
  
  // Добавляем debug чтобы видеть данные
  useEffect(() => {
    console.log('Категории в модалке:', categories);
    console.log('Текущая категория практики:', form.category_id);
  }, [categories, form.category_id]);

  // Обработка выбора файла обложки
  const handleThumbChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleThumbChange вызван');
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      console.log('Начинаем загрузку файла обложки:', file.name);
      const url = await uploadFileToR2(file, 'image');
      console.log('Файл обложки загружен, URL:', url);
      setForm((f) => ({ ...f, thumbnail_url: url }));
      setThumbPreview(url);
    } catch (e) {
      console.error('Ошибка загрузки обложки:', e);
      alert('Ошибка загрузки обложки');
    } finally {
      setUploading(false);
    }
  };
  
  // Обработка выбора аудиофайла
  const handleAudioChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleAudioChange вызван');
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      console.log('Начинаем загрузку аудиофайла:', file.name);
      const url = await uploadFileToR2(file, 'audio');
      console.log('Аудиофайл загружен, URL:', url);
      setForm((f) => ({ ...f, audio_file_path: url }));
      setAudioPreview(url);
    } catch (e) {
      console.error('Ошибка загрузки аудиофайла:', e);
      alert('Ошибка загрузки аудиофайла');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    console.log('Форма отправлена');
    e.preventDefault();
    onSave(form);
  };

  const handleCloseModal = () => {
    console.log('Закрытие модального окна редактирования');
    onClose();
  };

  return (
    <div 
      className="admin-modal-backdrop" 
      onClick={handleCloseModal}
    >
      <div 
        className="admin-modal"
        onClick={(e) => {
          console.log('Клик внутри модалки редактирования (stopPropagation)');
          e.stopPropagation();
        }}
      >
        <h3>Редактировать практику</h3>
        <button 
          className="admin-modal-close" 
          onClick={() => onClose()}
        >✕</button>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Название</label>
            <input 
              className="admin-input" 
              value={form.title || ''} 
              onChange={e => {
                console.log('Изменение названия:', e.target.value);
                setForm((f) => ({ ...f, title: e.target.value }));
              }} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label>Подзаголовок</label>
            <input 
              className="admin-input" 
              value={form.subtitle || ''} 
              onChange={e => {
                console.log('Изменение подзаголовка');
                setForm((f) => ({ ...f, subtitle: e.target.value }));
              }} 
            />
          </div>
          
          <div className="form-group">
            <label>Описание</label>
            <textarea 
              className="admin-input" 
              value={form.description || ''} 
              onChange={e => {
                console.log('Изменение описания');
                setForm((f) => ({ ...f, description: e.target.value }));
              }} 
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Длительность</label>
              <TimeInput 
                totalSeconds={form.duration || 0}
                onChange={(seconds) => {
                  console.log('Изменение длительности:', seconds, 'секунд');
                  setForm((f) => ({ ...f, duration: seconds }));
                }}
              />
            </div>
            
            <div className="form-group">
              <label>Порядок отображения</label>
              <input 
                className="admin-input" 
                type="number" 
                value={form.display_order || ''} 
                onChange={e => {
                  console.log('Изменение порядка отображения:', e.target.value);
                  setForm((f) => ({ ...f, display_order: Number(e.target.value) }));
                }} 
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Тип контента</label>
              <select 
                className="admin-input" 
                value={form.content_type_id || ''} 
                onChange={e => {
                  console.log('Изменение типа контента:', e.target.value);
                  setForm((f) => ({ ...f, content_type_id: e.target.value }));
                }}
              >
                <option value="">—</option>
                {contentTypes.map((ct) => (
                  <option key={ct.id} value={ct.id}>{ct.name}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Категория</label>
              <select 
                className="admin-input" 
                value={form.category_id || ''} 
                onChange={e => {
                  console.log('Изменение категории:', e.target.value);
                  setForm((f) => ({ ...f, category_id: e.target.value }));
                }}
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
            </div>
          </div>
          
          <div className="form-group">
            <label>Kinescope ID</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                className="admin-input" 
                style={{ flex: 1 }}
                value={form.kinescope_id || ''} 
                onChange={e => {
                  console.log('Изменение Kinescope ID:', e.target.value);
                  setForm((f) => ({ ...f, kinescope_id: e.target.value }));
                }} 
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Обложка</label>
            <input 
              className="admin-input file-input" 
              type="file" 
              accept="image/*" 
              onChange={handleThumbChange} 
              disabled={uploading} 
            />
            {thumbPreview && (
              <div className="preview-container">
                <img src={thumbPreview} alt="preview" className="thumbnail-preview" />
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label>Аудиофайл</label>
            <input 
              className="admin-input file-input" 
              type="file" 
              accept="audio/*" 
              onChange={handleAudioChange} 
              disabled={uploading} 
            />
            {audioPreview && (
              <div className="preview-container">
                <audio src={audioPreview} controls className="audio-preview" />
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label>Сложность</label>
            <input 
              className="admin-input" 
              value={form.difficulty_level || ''} 
              onChange={e => {
                console.log('Изменение сложности:', e.target.value);
                setForm((f) => ({ ...f, difficulty_level: e.target.value }));
              }} 
            />
          </div>
          
          <div className="form-row checkbox-group">
            <div className="form-group checkbox">
              <label>
                <input 
                  type="checkbox" 
                  checked={!!form.is_premium} 
                  onChange={e => {
                    console.log('Изменение статуса премиум:', e.target.checked);
                    setForm((f) => ({ ...f, is_premium: e.target.checked }));
                  }} 
                />
                Премиум контент
              </label>
            </div>
            
            <div className="form-group checkbox">
              <label>
                <input 
                  type="checkbox" 
                  checked={!!form.is_featured} 
                  onChange={e => {
                    console.log('Изменение статуса рекомендуемое:', e.target.checked);
                    setForm((f) => ({ ...f, is_featured: e.target.checked }));
                  }} 
                />
                Рекомендуемое
              </label>
            </div>
          </div>
          
          {error && <div className="admin-error">{error}</div>}
          
          <div className="form-actions">
            <button 
              className="admin-button" 
              type="submit" 
              disabled={saving || uploading}
            >
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
            <button 
              className="action-btn delete-btn" 
              type="button" 
              onClick={() => onClose()} 
              disabled={saving || uploading}
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPracticeModal;