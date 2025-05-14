import { type FC, useMemo, useState } from 'react';
import {
  initDataState as _initDataState,
  useSignal,
  postEvent,
} from '@telegram-apps/sdk-react';
import { 
  List, 
  Placeholder, 
  Button, 
  Section,
  Avatar, 
  Text,
  Cell,
} from '@telegram-apps/telegram-ui';

import { Page } from '@/components/Page.tsx';

// Стили для контейнера списка
const listContainerStyle = {
  width: '100%',
};

export const ProfilePage: FC = () => {
  const initDataState = useSignal(_initDataState);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Пользователь из initData
  const user = useMemo(() => 
    initDataState && initDataState.user ? initDataState.user : undefined,
  [initDataState]);

  // Переключение режима fullscreen
  const toggleFullscreen = () => {
    if (isFullscreen) {
      postEvent('web_app_exit_fullscreen');
      setIsFullscreen(false);
    } else {
      postEvent('web_app_request_fullscreen');
      setIsFullscreen(true);
    }
  };

  // Если нет данных пользователя
  if (!user) {
    return (
      <Page>
        <Placeholder
          header="Нет данных пользователя"
          description="Не удалось получить данные пользователя"
        >
          <img
            alt="Telegram sticker"
            src="https://xelene.me/telegram.gif"
            style={{ display: 'block', width: '144px', height: '144px' }}
          />
        </Placeholder>
      </Page>
    );
  }

  return (
    <Page>
      <div style={listContainerStyle}>
        <List>
          <Section header="Профиль пользователя">
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              padding: '20px 0' 
            }}>
              <Avatar size={96} src={user.photo_url} alt={user.username || user.first_name} />
              <Text weight="2" style={{ marginTop: 12, fontSize: 20 }}>
                {user.first_name} {user.last_name || ''}
              </Text>
              {user.username && (
                <Text style={{ color: 'var(--tgui-text-secondary)' }}>
                  @{user.username}
                </Text>
              )}
            </div>

            <div style={{ padding: 16 }}>
              <Button 
                size="l" 
                stretched 
                onClick={toggleFullscreen}
              >
                {isFullscreen ? 'Выйти из полноэкранного режима' : 'Включить полноэкранный режим'}
              </Button>
            </div>
          </Section>

          <Section header="Информация о пользователе">
            <Cell multiline>
              <div>ID пользователя</div>
              <div>{user.id.toString()}</div>
            </Cell>
            <Cell multiline>
              <div>Язык</div>
              <div>{user.language_code || 'Не указан'}</div>
            </Cell>
            <Cell multiline>
              <div>Premium</div>
              <div>{user.is_premium ? 'Да' : 'Нет'}</div>
            </Cell>
          </Section>
        </List>
      </div>
    </Page>
  );
}; 