import { type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Section,
  Button,
  Placeholder,
  Text,
} from '@telegram-apps/telegram-ui';

import { Page } from '@/components/Page.tsx';
import './QuizFlow.css';

export const QuizFlow: FC = () => {
  const navigate = useNavigate();

  return (
    <Page>
      <Section header="Выбор практики">
        <Placeholder
          header="Квиз для выбора практики"
          description="Здесь будет размещен интерактивный квиз для подбора подходящей практики"
        >
          <div className="quiz-coming-soon">
            <Text weight="3" style={{ margin: '20px 0' }}>В разработке</Text>
            <Button size="l" onClick={() => navigate('/')} stretched>
              Вернуться на главную
            </Button>
          </div>
        </Placeholder>
      </Section>
    </Page>
  );
}; 