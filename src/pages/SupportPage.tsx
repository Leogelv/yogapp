import { FC } from 'react';
import { Page } from '@/components/Page';

export const SupportPage: FC = () => {
  return (
    <Page>
      <div style={{ 
        padding: '2rem 1.5rem', 
        textAlign: 'center',
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <h1 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '600', 
          marginBottom: '1rem',
          color: '#1a1a1a'
        }}>
          Поддержка
        </h1>
        <p style={{ 
          color: '#666666', 
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          Если у вас есть вопросы или нужна помощь, свяжитесь с нами:
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <a 
            href="mailto:support@nova-yoga.com"
            style={{
              padding: '1rem',
              backgroundColor: '#000000',
              color: '#ffffff',
              textDecoration: 'none',
              borderRadius: '12px',
              fontWeight: '500'
            }}
          >
            Написать в поддержку
          </a>
          
          <a 
            href="https://t.me/nova_yoga_support"
            style={{
              padding: '1rem',
              backgroundColor: '#000000',
              color: '#ffffff',
              textDecoration: 'none',
              borderRadius: '12px',
              fontWeight: '500'
            }}
          >
            Telegram поддержка
          </a>
        </div>
      </div>
    </Page>
  );
}; 