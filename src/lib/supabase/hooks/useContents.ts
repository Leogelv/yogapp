import { useState, useEffect } from 'react';
import { supabase } from '../client';

export interface UseContentsOptions {
  categorySlug?: string; // slug категории, а не id
  search?: string;
  type?: 'video' | 'audio' | 'timer';
  duration?: { min: number, max: number };
}

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  duration: number;
  thumbnail_url?: string;
  content_type_id?: string;
  category_id?: string;
  kinescope_id?: string;
  audio_file_path?: string;
  background_image_url?: string;
  difficulty?: number | string; // Уровень сложности ("2 силы", "4 силы" и т.д.)
  short_description?: string;  // Краткое описание для карточки
  content_type?: { name: string; slug: string };
  content_types?: { name: string; slug: string };
  categories?: { name: string; slug: string };
  // ... другие поля по необходимости
}

export function useContents(options: UseContentsOptions = {}) {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchContents = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!supabase) throw new Error('Supabase client не инициализирован');
        
        // Формируем запрос с включением связанных данных
        let query = supabase
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
          .order('display_order', { ascending: true });
        
        // Фильтрация по slug категории
        if (options.categorySlug) {
          // Сначала получаем ID категории по slug
          const { data: categoryData, error: categoryError } = await supabase
            .from('categories')
            .select('id')
            .eq('slug', options.categorySlug);
            
          if (categoryError) throw categoryError;
          
          // Проверяем, что у нас есть категория с таким slug
          if (categoryData && categoryData.length > 0) {
            // Берем первую категорию, если их несколько с таким slug
            const categoryId = categoryData[0].id;
            // Теперь фильтруем контент по category_id
            query = query.eq('category_id', categoryId);
          } else {
            // Если категория не найдена, возвращаем пустой массив
            if (isMounted) {
              setContents([]);
              setLoading(false);
            }
            return;
          }
        }
        
        // Фильтрация по типу (video/audio/timer)
        if (options.type) {
          // Сначала получаем ID типа по slug
          const { data: typeData, error: typeError } = await supabase
            .from('content_types')
            .select('id')
            .eq('slug', options.type);
            
          if (typeError) throw typeError;
          
          if (typeData && typeData.length > 0) {
            // Берем первый тип, если их несколько с таким slug
            const typeId = typeData[0].id;
            // Теперь фильтруем контент по content_type_id
            query = query.eq('content_type_id', typeId);
          } else {
            // Если тип не найден, возвращаем пустой массив
            if (isMounted) {
              setContents([]);
              setLoading(false);
            }
            return;
          }
        }
        
        // Фильтрация по длительности, если указан диапазон
        if (options.duration) {
          if (options.duration.min !== undefined) {
            query = query.gte('duration', options.duration.min);
          }
          if (options.duration.max !== undefined) {
            query = query.lte('duration', options.duration.max);
          }
        }
        
        const { data, error: fetchError } = await query;
        
        if (fetchError) throw fetchError;
        
        // Приводим данные к правильному формату
        const formattedData = data?.map(item => ({
          ...item,
          // Копируем нужные данные из вложенных объектов в корневые свойства для удобства
          content_type: item.content_types,
          difficulty: item.difficulty || '2' // По умолчанию "2 силы"
        })) || [];
        
        // Применяем фильтрацию по поиску после получения данных, если нужно
        if (options.search && formattedData) {
          const searchLower = options.search.toLowerCase();
          const filtered = formattedData.filter((item: any) =>
            item.title?.toLowerCase().includes(searchLower) ||
            item.description?.toLowerCase().includes(searchLower)
          );
          if (isMounted) setContents(filtered);
        } else {
          if (isMounted) setContents(formattedData);
        }
      } catch (e: any) {
        if (isMounted) setError(e.message || 'Ошибка загрузки практик');
        console.error('Ошибка загрузки практик:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchContents();
    return () => { isMounted = false; };
  }, [options.categorySlug, options.search, options.type, options.duration?.min, options.duration?.max]);

  return { contents, loading, error };
} 