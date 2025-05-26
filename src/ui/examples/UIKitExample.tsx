import React, { useState } from 'react';
import { Button, Card, Tag } from '../components';
import './UIKitExample.css';

/**
 * Пример использования UI Kit компонентов
 * Демонстрирует все варианты и состояния компонентов
 */
export const UIKitExample: React.FC = () => {
  const [favouriteCards, setFavouriteCards] = useState<Set<string>>(new Set());
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set(['duration-15']));

  const toggleFavourite = (cardId: string) => {
    const newFavourites = new Set(favouriteCards);
    if (newFavourites.has(cardId)) {
      newFavourites.delete(cardId);
    } else {
      newFavourites.add(cardId);
    }
    setFavouriteCards(newFavourites);
  };

  const toggleTag = (tagId: string) => {
    const newActiveTags = new Set(activeTags);
    if (newActiveTags.has(tagId)) {
      newActiveTags.delete(tagId);
    } else {
      newActiveTags.add(tagId);
    }
    setActiveTags(newActiveTags);
  };

  return (
    <div className="ui-kit-example">
      <div className="ui-kit-section">
        <h2>Кнопки</h2>
        <div className="ui-kit-grid">
          <Button variant="default" size="m">
            Обычная кнопка
          </Button>
          <Button variant="accent" size="m">
            Акцентная кнопка
          </Button>
          <Button variant="inverted" size="m">
            Инвертированная
          </Button>
          <Button variant="default" size="s">
            Маленькая
          </Button>
          <Button variant="accent" size="s" loading>
            Загрузка...
          </Button>
          <Button variant="default" disabled>
            Отключена
          </Button>
        </div>
      </div>

      <div className="ui-kit-section">
        <h2>Теги</h2>
        <div className="ui-kit-grid">
          <Tag variant="default">
            Обычный тег
          </Tag>
          <Tag variant="difficulty">
            2 силы
          </Tag>
          <Tag variant="duration">
            15 мин
          </Tag>
          <Tag 
            variant="default" 
            active={activeTags.has('filter-1')}
            onClick={() => toggleTag('filter-1')}
          >
            Фильтр 1
          </Tag>
          <Tag 
            variant="duration" 
            active={activeTags.has('duration-15')}
            onClick={() => toggleTag('duration-15')}
          >
            15 мин
          </Tag>
          <Tag variant="default" size="sm">
            Маленький
          </Tag>
        </div>
      </div>

      <div className="ui-kit-section">
        <h2>Карточки</h2>
        
        <h3>Library Card</h3>
        <Card
          variant="library"
          title="Медитация на дыхание"
          description="Краткое описание о чем речь, чем будем заниматься. Эта практика поможет вам расслабиться и сосредоточиться."
          imageUrl="/assets/images/library-card-bg.png"
          duration="15 мин"
          difficulty="2 силы"
          isFavourite={favouriteCards.has('library-1')}
          onFavouriteClick={() => toggleFavourite('library-1')}
          onClick={() => console.log('Открыть практику')}
        >
          <Tag variant="duration">15 мин</Tag>
          <Tag variant="difficulty">2 силы</Tag>
        </Card>

        <h3>Content Cards</h3>
        <div className="ui-kit-grid">
          <Card
            variant="content"
            title="Видео практика"
            description="Описание видео практики"
            imageUrl="/assets/images/library-card-bg.png"
            contentType="video"
            duration="20 мин"
            difficulty="3 силы"
            locked={false}
            isFavourite={favouriteCards.has('content-1')}
            onFavouriteClick={() => toggleFavourite('content-1')}
          />
          
          <Card
            variant="content"
            title="Аудио медитация"
            description="Описание аудио медитации"
            imageUrl="/assets/images/library-card-bg.png"
            contentType="audio"
            duration="10 мин"
            difficulty="1 сила"
            locked={true}
            isFavourite={favouriteCards.has('content-2')}
            onFavouriteClick={() => toggleFavourite('content-2')}
          />
        </div>

        <h3>Favourite Card</h3>
        <Card
          variant="favourite"
          title="Упражнение на борьбу со страхом сказать нет"
          imageUrl="/assets/images/favourites-card-bg.png"
          duration="25 мин"
          onClick={() => console.log('Открыть избранную практику')}
        />
      </div>

      <div className="ui-kit-section">
        <h2>Композиции</h2>
        <div className="ui-kit-composition">
          <Card
            variant="library"
            title="Комплексная практика"
            description="Пример композиции с кнопками и тегами"
            imageUrl="/assets/images/library-card-bg.png"
            duration="30 мин"
            difficulty="4 силы"
            isFavourite={favouriteCards.has('composition-1')}
            onFavouriteClick={() => toggleFavourite('composition-1')}
          >
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
              <Tag variant="duration">30 мин</Tag>
              <Tag variant="difficulty">4 силы</Tag>
              <Tag variant="default">Медитация</Tag>
            </div>
            <Button variant="accent" size="s" fullWidth>
              Начать практику
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}; 