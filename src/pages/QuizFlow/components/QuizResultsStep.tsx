import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../../../contexts/QuizContext';
import { supabase } from '../../../lib/supabase/client';
import { Button } from '../../../ui/components/Button/Button';

// Структура контента из Supabase
interface ContentData {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  duration: number | null;
  content_type: { 
    name: string; 
    slug: string; 
  } | null;
}

interface QuizLogicItem {
  id: string;
  priority: number | null;
  content_id: string;
  contents: ContentData;
}

const QuizResultsStep: React.FC = () => {
  const { state } = useQuiz();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [recommendation, setRecommendation] = useState<ContentData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const findRecommendation = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Для самостоятельных медитаций не ищем рекомендации - используем таймер
        if (state.practiceType === 'meditation' && state.approach === 'self') {
          setLoading(false);
          return;
        }
        
        if (!supabase || !state.practiceType) {
          throw new Error('Отсутствуют необходимые параметры для поиска рекомендации');
        }

        // Строим запрос на основе выбранных параметров
        let query = supabase
          .from('quiz_logic')
          .select(`
            id,
            priority,
            content_id,
            contents:content_id (
              id,
              title,
              description,
              thumbnail_url,
              duration,
              content_type:content_types (
                name,
                slug
              )
            )
          `)
          .eq('practice_type', state.practiceType)
          .order('priority', { ascending: false });

        // Добавляем фильтры в зависимости от выбранных параметров
        if (state.duration) {
          query = query
            .gte('duration_max', state.duration.min)
            .lte('duration_min', state.duration.max);
        }

        if (state.goal) {
          query = query.eq('goal', state.goal);
        }

        if (state.approach) {
          query = query.eq('approach', state.approach);
        }

        // Получаем результаты
        const { data, error } = await query.limit(10);

        if (error) throw error;

        if (!data || data.length === 0) {
          // Если конкретные результаты не найдены, ищем менее специфичные
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('quiz_logic')
            .select(`
              id,
              priority,
              content_id,
              contents:content_id (
                id,
                title,
                description,
                thumbnail_url,
                duration,
                content_type:content_types (
                  name,
                  slug
                )
              )
            `)
            .eq('practice_type', state.practiceType)
            .order('priority', { ascending: false })
            .limit(5);
            
          if (fallbackError) throw fallbackError;
          
          if (!fallbackData || fallbackData.length === 0) {
            throw new Error('Не найдены подходящие практики для ваших параметров');
          }
          
          // Выбираем случайный элемент из подходящих
          const randomIndex = Math.floor(Math.random() * fallbackData.length);
          const selectedItem = fallbackData[randomIndex] as any;
          setRecommendation(selectedItem.contents);
        } else {
          // Выбираем случайный элемент из топ-приоритетных результатов
          const byPriority: Record<number, QuizLogicItem[]> = {};
          
          data.forEach((item: any) => {
            const priority = item.priority || 0;
            if (!byPriority[priority]) {
              byPriority[priority] = [];
            }
            byPriority[priority].push(item);
          });
          
          // Берем группу с самым высоким приоритетом
          const highestPriority = Math.max(...Object.keys(byPriority).map(Number));
          const topPriorityItems = byPriority[highestPriority];
          
          // Выбираем случайный элемент из топ-приоритетных
          const randomIndex = Math.floor(Math.random() * topPriorityItems.length);
          const selectedItem = topPriorityItems[randomIndex] as any;
          setRecommendation(selectedItem.contents);
        }
      } catch (error: any) {
        console.error('Ошибка при поиске рекомендации:', error);
        setError(error.message || 'Ошибка при поиске рекомендации');
      } finally {
        setLoading(false);
      }
    };

    findRecommendation();
  }, [state.practiceType, state.duration, state.goal, state.approach]);

  const handleStartPractice = () => {
    // Для самостоятельных медитаций переходим напрямую на таймер без поиска рекомендаций
    if (state.practiceType === 'meditation' && state.approach === 'self' && state.selfMeditationSettings) {
      const { object, duration } = state.selfMeditationSettings;
      navigate(`/practice/timer`, { 
        state: { 
          duration, 
          object, 
          fromQuiz: true,
          practiceType: 'meditation'
        } 
      });
      return;
    }
    
    // Для всех остальных практик (видео, аудио) переходим по ID контента
    if (recommendation) {
      navigate(`/practice/${recommendation.id}`);
    }
  };

  const handleRetakeQuiz = () => {
    navigate('/quiz');
  };

  const handleOtherPractice = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="quiz-loading">
        <div className="quiz-loading-spinner"></div>
        <p>Подбираем идеальную практику для вас...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-error">
        <h3>Произошла ошибка</h3>
        <p>{error}</p>
        <Button onClick={handleRetakeQuiz} fullWidth>
          Начать заново
        </Button>
      </div>
    );
  }

  // Специальный рендеринг для самостоятельных медитаций
  if (state.practiceType === 'meditation' && state.approach === 'self' && state.selfMeditationSettings) {
    return (
      <div className="quiz-step-content">
        <div className="quiz-recommendation">
          <div className="recommendation-image">
            <img src="/assets/images/meditation-placeholder.jpg" alt="Самостоятельная медитация" />
          </div>
          
          <div className="recommendation-details">
            <h3 className="recommendation-title">телесная практика</h3>
            <div className="recommendation-meta">
              <span className="recommendation-type">2 силы</span>
              <span className="recommendation-duration">до 7 минут</span>
              <span className="recommendation-category">йога</span>
            </div>
            <p className="recommendation-description">
              Идеально подходит, чтобы начать заниматься регулярно или вернуться в ритм. Когда тебя давно не было, тебе открыты только 7ми минутные практики, чтобы мягко включиться в процесс. Если есть желание сделать более длительную и плотную практику: выполняй 7ми минутку, и тебе откроется доступ к другим.
            </p>
            <p className="recommendation-description">
              Разнообразный и богатый опыт говорит нам, что реализация намеченных плановых заданий прекрасно подходит для реализации инновационных методов управления процессами.
            </p>
          </div>
          
          <div className="recommendation-actions">
            <Button onClick={handleStartPractice} fullWidth>
              выбрать практику
            </Button>
            <Button onClick={handleOtherPractice} variant="inverted" fullWidth>
              другая практика
            </Button>
            <Button onClick={handleRetakeQuiz} variant="inverted" fullWidth>
              о направлении
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-step-content">
      {recommendation && (
        <div className="quiz-recommendation">
          {recommendation.thumbnail_url && (
            <div className="recommendation-image">
              <img src={recommendation.thumbnail_url} alt={recommendation.title} />
            </div>
          )}
          
          <div className="recommendation-details">
            <h3 className="recommendation-title">{recommendation.title}</h3>
            <div className="recommendation-meta">
              <span className="recommendation-type">
                {recommendation.content_type?.name || 'Практика'}
              </span>
              {recommendation.duration && (
                <span className="recommendation-duration">
                  {Math.floor(recommendation.duration / 60)} мин
                </span>
              )}
            </div>
            {recommendation.description && (
              <p className="recommendation-description">{recommendation.description}</p>
            )}
          </div>
          
          <div className="recommendation-actions">
            <Button onClick={handleStartPractice} fullWidth>
              выбрать практику
            </Button>
            <Button onClick={handleOtherPractice} variant="inverted" fullWidth>
              другая практика
            </Button>
            <Button onClick={handleRetakeQuiz} variant="inverted" fullWidth>
              о направлении
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizResultsStep; 