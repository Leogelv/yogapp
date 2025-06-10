import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from '@/components/Page';
import { useContents, ContentItem } from '@/lib/supabase/hooks/useContents';
import { useFavorites } from '@/lib/supabase/hooks';
import './LibraryPage.css';
import {Link} from "@/components";
import { useUser } from '@/contexts';
import {supabase} from "@/lib/supabase/client.ts";
import {User} from "@/pages/AdminPage/types.ts";
// Основные категории для главной страницы библиотеки
const mainCategories = [
  { id: 'physical', name: 'тело', img: '/cat1.png', icon: '🧘‍♀️', description: 'Асаны и физические практики' },
  { id: 'meditation', name: 'медитация', img: '/cat2.png', icon: '🧠', description: 'Практики осознанности' },
  { id: 'base', name: 'база', icon: '⭐', img: '/cat3.png', description: 'Основы и базовые навыки' },
  { id: 'breathing', name: 'дыхание', img: '/cat1.png', icon: '🌬️', description: 'Дыхательные техники' }
];

// Все категории включая фильтры
const allCategories = [
  { id: 'all', name: 'все' },
  ...mainCategories
];

const LibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // null = главная страница
  const [timeFilter, setTimeFilter] = useState<string | null>(null);
  const [showTimeFilter, setShowTimeFilter] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Получаем пользователя
  // const { supabaseUser } = useSupabaseUser(undefined);
  const { user, supabaseUser } = useUser();
  const userId = supabaseUser?.id || null;

  // Получаем избранное
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites(userId);

  // Получаем контент только если выбрана конкретная категория
  const { contents, loading, error } = useContents(selectedCategory !== null ? {
    categorySlug: selectedCategory && selectedCategory !== 'all' ? selectedCategory : undefined,
    duration: timeFilter ? getDurationRange(timeFilter) : undefined
  } : {});

  // Получаем последние практики для слайдера "Новое" (только для главной страницы)
  const shouldLoadLatest = selectedCategory === null;
  const { contents: latestContents, loading: latestLoading } = useContents(shouldLoadLatest ? {} : { search: 'NEVER_MATCH_ANYTHING_XYZ' }); // Hack: используем поиск который ничего не найдет для отключения загрузки

  // Применяем анимацию появления контента
  useEffect(() => {
    const timer = setTimeout(() => {
      setContentVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Автопроигрывание слайдера (только для главной страницы)
  useEffect(() => {
    if (selectedCategory === null && latestContents.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % Math.min(latestContents.length, 3));
      }, 5000); // Смена слайда каждые 5 секунд
      
      return () => clearInterval(interval);
    }
  }, [selectedCategory, latestContents.length]);
  const [supaUser, setSupaUser] = useState<User | undefined>()
  useEffect(() => {
    if(user?.id){
      supabase?.from('users').select('*').eq('telegram_id', user.id).then(r => {
        setSupaUser(r.data![0])
      })
    }
  }, [user]);
  // Функция для получения диапазона длительности исходя из фильтра
  function getDurationRange(timeFilter: string): { min: number, max: number } | undefined {
    switch (timeFilter) {
      case 'under7': return { min: 0, max: 7 * 60 };
      case '7-20': return { min: 7 * 60, max: 20 * 60 };
      case '20-40': return { min: 20 * 60, max: 40 * 60 };
      case '40-60': return { min: 40 * 60, max: 60 * 60 };
      default: return undefined;
    }
  }

  // Функция для получения текстовой метки фильтра времени
  function getTimeFilterLabel(timeFilter: string): string {
    switch (timeFilter) {
      case 'under7': return 'до 7 мин';
      case '7-20': return '7-20 мин';
      case '20-40': return '20-40 мин';
      case '40-60': return '40-60 мин';
      default: return 'Время';
    }
  }

  // Обработчик выбора основной категории (переход к списку практик)
  const handleMainCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  // Обработчик выбора подкатегории в фильтрах
  const handleSubCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  // Возврат к главной странице библиотеки
  const handleBackToMain = () => {
    setSelectedCategory(null);
    setTimeFilter(null);
    setShowTimeFilter(false);
  };

  // Обработчик перехода к конкретной практике
  const handlePracticeSelect = (practice: ContentItem) => {
    console.log(practice)
    if(practice.audio_file_path){
      navigate(`/practice/audio/${practice.id}`);
      return
    }

    if(((practice?.power_needed && practice?.power_needed !== null) ? practice?.power_needed : 2) <= (supaUser?.power || -1)){
      navigate(`/practice/${practice.id}`);
    }
  };

  // Обработчик добавления/удаления из избранного
  const handleToggleFavorite = (e: React.MouseEvent, practiceId: string) => {
    e.stopPropagation();
    if (!userId) return;

    if (isFavorite(practiceId)) {
      removeFromFavorites(practiceId);
    } else {
      addToFavorites(practiceId);
    }
  };

  // Обработчик перехода к избранному
  const handleFavoritesClick = () => {
    navigate('/library/favorites');
  };

  // Обработчик переключения фильтра по времени
  const toggleTimeFilter = () => {
    setShowTimeFilter(!showTimeFilter);
  };

  // Обработчик выбора фильтра по времени
  const handleTimeFilterSelect = (filter: string) => {
    setTimeFilter(filter);
    setShowTimeFilter(false);
  };
  // Получаем initData из Telegram SDK
  // const initDataState = useSignal(_initDataState);

  // const user = useMemo(() =>
  //         initDataState && initDataState.user ? initDataState.user : undefined,
  //     [initDataState]);
  // Если категория не выбрана, показываем главную страницу
  if (selectedCategory === null) {
    return (
        <Page back={false}>
          {user && <div className="!py-2 !px-4 flex justify-between items-center border-b border-black">
            <Link to={'/'} >
              {user.photo_url ? (
                  <img className={'w-6 h-6 rounded-full border border-black'} src={user.photo_url}
                       alt={user.username || user.first_name} loading="lazy"/>
              ) : (
                  <div className="w-6 h-6 rounded-full !bg-gray-200 flex items-center justify-center"
                       aria-hidden="true">
                    {user.first_name.charAt(0)}
                  </div>
              )}
            </Link>

            <img src={'/logo.svg'} alt={''}/>
            <img src={'/settings.svg'} alt={''}/>


          </div>}
          <div>


            {/* Слайдер "Новое" */}
            <div>

              {latestLoading ? (
                  <div className="latest-loading">Загрузка...</div>
              ) : latestContents.length > 0 ? (
                  <div className="latest-slider-container">
                    <div className="flex flex-col h-[260px] bg-cover" style={{backgroundImage: `url(${latestContents[currentSlide]?.thumbnail_url || '/img/practice-default.jpg'})`}}
                         onClick={() => handlePracticeSelect(latestContents[currentSlide])}>
                      <div
                          className="latest-card-image"

                      >
                      </div>
                      <div className="latest-card-content">
                        <div className="flex items-center gap-2">
                          <p style={{ fontFamily: 'RF Dewi, sans-serif', letterSpacing: '-0.07em' }} className={'text-sm !py-1 !px-2 bg-[#414141] text-white border border-black'}>{Math.floor(latestContents[currentSlide]?.duration / 60)} мин</p>
                          <p style={{ fontFamily: 'RF Dewi, sans-serif', letterSpacing: '-0.07em' }} className={'text-sm !py-1 !px-2 bg-[#414141] text-white border border-black'}>{latestContents[currentSlide]?.categories?.name || 'Практика'}</p>
                        </div>
                        <h3 style={{ fontFamily: 'RF Dewi, sans-serif', letterSpacing: '-0.07em' }} className="text-white font-bold text-2xl !mb-2">{latestContents[currentSlide]?.title}</h3>

                      </div>
                    </div>

                    {/* Пагинация точками */}
                    {latestContents.slice(0, 3).length > 1 && (
                        <div className="slider-dots absolute bottom-2 left-1/2 -translate-x-1/2">
                          {latestContents.slice(0, 3).map((_, index) => (
                              <button
                                  key={index}
                                  className={`slider-dot ${index === currentSlide ? 'active' : ''}`}
                                  onClick={() => setCurrentSlide(index)}
                              />
                          ))}
                        </div>
                    )}
                  </div>
              ) : null}
            </div>

            {/* Главные категории */}
            <div>
              {mainCategories.map(category => (
                  <div className={'!p-4 border-b border-black'} key={category.id}>
                    <div className={'flex flex-col gap-3'} onClick={() => handleMainCategorySelect(category.id)}>

                      <div className={'flex items-center justify-between gap-2'}>
                        <h3 style={{ fontFamily: 'RF Dewi, sans-serif', letterSpacing: '-0.07em' }} className="font-bold text-2xl !text-black">{category.name}</h3>
                        <p style={{ fontFamily: 'RF Dewi, sans-serif', letterSpacing: '-0.07em' }} className={'text-[#191919]/40 underline underline-offset-4 cursor-pointer'}>все практики</p>
                      </div>
                      <p className=" text-[#191919]">{category.description}</p>
                      <img src={category.img} className={''}/>
                    </div>
                  </div>
              ))}
            </div>

            {/* Раздел избранного */}
            <div className={'!p-5 border-b border-black'}>
              <div className={'flex justify-center'} onClick={handleFavoritesClick}>
                <h3 className="font-bold !text-black underline underline-offset-3" style={{ fontFamily: 'RF Dewi, sans-serif', letterSpacing: '-0.07em' }}>избранное</h3>
              </div>
            </div>
          </div>
        </Page>
    );
  }
  console.log(supaUser)
  // Страница выбранной категории с практиками
  return (
      <Page back={true} onBackClick={handleBackToMain}>
        {/* Header с фото профиля пользователя */}
        {user && <div className="!py-2 !px-4 flex justify-between items-center border-b border-black">
          <Link to={'/'} >
            {user.photo_url ? (
                <img className={'w-6 h-6 rounded-full border border-black'} src={user.photo_url}
                     alt={user.username || user.first_name} loading="lazy"/>
            ) : (
                <div className="w-6 h-6 rounded-full !bg-gray-200 flex items-center justify-center"
                     aria-hidden="true">
                  {user.first_name.charAt(0)}
                </div>
            )}
          </Link>

          <img src={'/logo.svg'} alt={''}/>
          <img src={'/settings.svg'} alt={''}/>
        </div>}

        <div className={`library-container ${contentVisible ? 'content-visible' : ''}`}>
          <div className="!px-3 flex items-center gap-2 justify-between !mb-4 !text-[#191919]">
            <h1 style={{ fontFamily: 'RF Dewi, sans-serif', letterSpacing: '-0.07em' }} className="font-bold text-2xl ">
              {allCategories.find(cat => cat.id === selectedCategory)?.name || 'Категория'}
            </h1>
            <div style={{ fontFamily: 'RF Dewi, sans-serif', letterSpacing: '-0.07em' }} className="time-filter-toggle !bg-transparent" onClick={toggleTimeFilter}>
              {timeFilter ? getTimeFilterLabel(timeFilter) : 'время'} <svg className={`duration-200 ${showTimeFilter ? "rotate-180" : ''}`} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 11L12 14L9 11" stroke="#191919" stroke-width="1.5" stroke-linecap="round"
                    stroke-linejoin="round"/>
            </svg>
            </div>
          </div>

          {/* Фильтр по времени */}
          {showTimeFilter && (
              <div className="time-filter-dropdown">
                <button
                    onClick={() => handleTimeFilterSelect('under7')}
              className={timeFilter === 'under7' ? 'active' : ''}
            >
              до 7 минут
            </button>
            <button 
              onClick={() => handleTimeFilterSelect('7-20')}
              className={timeFilter === '7-20' ? 'active' : ''}
            >
              7-20 минут
            </button>
            <button 
              onClick={() => handleTimeFilterSelect('20-40')}
              className={timeFilter === '20-40' ? 'active' : ''}
            >
              20-40 минут
            </button>
            <button 
              onClick={() => handleTimeFilterSelect('40-60')}
              className={timeFilter === '40-60' ? 'active' : ''}
            >
              40-60 минут
            </button>
            {timeFilter && (
              <button onClick={() => setTimeFilter(null)}>Сбросить фильтр</button>
            )}
          </div>
        )}
        
        {/* Подкатегории */}
        <div className="category-tabs !px-3 ">
          {allCategories.map(cat => (
            <button
              key={cat.id}
              style={{ fontFamily: 'RF Dewi, sans-serif', letterSpacing: '-0.07em' }}
              className={`cursor-pointer !py-2 !px-4 text-[#191919] bg-[#F1F1F1] ${selectedCategory === cat.id ? '!bg-[#191919] text-white' : ''}`}
              onClick={() => handleSubCategorySelect(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
        {/* Контент библиотеки */}
        <div className="library-content border-b border-black">
          {loading ? (
            <div className="library-loading">Загрузка...</div>
          ) : error ? (
            <div className="library-error">Ошибка: {error}</div>
          ) : contents.length === 0 ? (
            <div className="library-empty">
              {timeFilter 
                ? 'Нет практик с выбранным временем' 
                : 'В этой категории пока нет практик'}
            </div>
          ) : (
            <div className="practice-list">

              {contents.map((item: ContentItem) => {
                return (
                    <div
                        key={item.id}
                        className="flex flex-col gap-3 !py-4 !px-3 border-t border-black"
                        onClick={() => handlePracticeSelect(item)}
                    >
                      <div
                          className="practice-full-thumbnail"
                          style={{backgroundImage: `url(${item.thumbnail_url || '/img/practice-default.jpg'})`}}
                      >
                      </div>
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-start gap-4">
                          <h3 className="text-xl text-black font-bold"
                              style={{fontFamily: 'RF Dewi, sans-serif', letterSpacing: '-0.07em'}}>{item.title}</h3>
                          {((item.power_needed && item.power_needed !== null) ? item.power_needed : 2) <= (supaUser?.power || -1) ? <img
                              onClick={(e) => handleToggleFavorite(e, item.id)}
                              src={isFavorite(item.id) ? "/flag-filled.svg" : "/flag-empty.svg"}
                              alt={isFavorite(item.id) ? "Убрать из избранного" : "Добавить в избранное"}
                              className={`!mt-[2px] favorite-flag-icon cursor-pointer ${isFavorite(item.id) ? 'favorited' : ''}`}
                          /> : <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M9.23047 9H7.2002C6.08009 9 5.51962 9 5.0918 9.21799C4.71547 9.40973 4.40973 9.71547 4.21799 10.0918C4 10.5196 4 11.0801 4 12.2002V17.8002C4 18.9203 4 19.4801 4.21799 19.9079C4.40973 20.2842 4.71547 20.5905 5.0918 20.7822C5.5192 21 6.07902 21 7.19694 21H16.8031C17.921 21 18.48 21 18.9074 20.7822C19.2837 20.5905 19.5905 20.2842 19.7822 19.9079C20 19.4805 20 18.9215 20 17.8036V12.1969C20 11.079 20 10.5192 19.7822 10.0918C19.5905 9.71547 19.2837 9.40973 18.9074 9.21799C18.4796 9 17.9203 9 16.8002 9H14.7689M9.23047 9H14.7689M9.23047 9C9.10302 9 9 8.89668 9 8.76923V6C9 4.34315 10.3431 3 12 3C13.6569 3 15 4.34315 15 6V8.76923C15 8.89668 14.8964 9 14.7689 9"
                                stroke="#191919" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                          }
                        </div>
                        <div className="practice-full-tags">
                          <span className="practice-tag">{Number(item.difficulty) || 2} силы</span>
                          <span
                              className="practice-tag">{Math.floor(item.duration / 60)} минут</span>
                          <span className="practice-tag">{item.categories?.name || 'практика'}</span>
                        </div>
                      </div>
                    </div>
                )
              })}
            </div>
          )}
        </div>
        </div>
      </Page>
  );
};

export default LibraryPage; 