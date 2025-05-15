import { Cell, Spinner, Placeholder, Section, Button } from '@telegram-apps/telegram-ui';
import { useTonWallet } from '@tonconnect/ui-react';
import { FC, useState, useEffect, useCallback } from 'react';

import { formatTON, getTONWalletBalance } from '@/helpers/tonHelpers';
import { logger } from '@/lib/logger';

// Типы стилей отображения баланса
export type BalanceDisplayStyle = 'section' | 'cell' | 'compact';

// Свойства компонента
interface WalletBalanceProps {
  style?: BalanceDisplayStyle;
  title?: string;
  autoRefreshInterval?: number; // в миллисекундах
  showRefreshButton?: boolean;
}

export const WalletBalance: FC<WalletBalanceProps> = ({
  style = 'section',
  title = 'Wallet Balance',
  autoRefreshInterval = 30000, // 30 секунд по умолчанию
  showRefreshButton = true,
}) => {
  const wallet = useTonWallet();
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Функция получения баланса
  const fetchBalance = useCallback(async () => {
    if (!wallet || !wallet.account.address) {
      setBalance(null);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      logger.info('Получаем баланс для кошелька', wallet.account.address);
      const balanceInNano = await getTONWalletBalance(wallet.account.address);
      
      setBalance(balanceInNano);
      setLastUpdated(new Date());
    } catch (err) {
      logger.error('Ошибка при получении баланса:', err);
      setError(err instanceof Error ? err : new Error('Неизвестная ошибка'));
    } finally {
      setIsLoading(false);
    }
  }, [wallet]);
  
  // Получение баланса при подключении кошелька
  useEffect(() => {
    if (wallet) {
      fetchBalance();
    } else {
      // Сбрасываем состояние, если кошелек отключен
      setBalance(null);
      setLastUpdated(null);
      setError(null);
    }
  }, [wallet, fetchBalance]);
  
  // Автообновление баланса
  useEffect(() => {
    if (!wallet || autoRefreshInterval <= 0) return;
    
    const intervalId = setInterval(() => {
      logger.debug('Автоматическое обновление баланса');
      fetchBalance();
    }, autoRefreshInterval);
    
    return () => clearInterval(intervalId);
  }, [wallet, autoRefreshInterval, fetchBalance]);
  
  // Если кошелек не подключен, не отображаем ничего
  if (!wallet) {
    return null;
  }
  
  // Обработчик кнопки обновления
  const handleRefresh = () => {
    fetchBalance();
  };
  
  // Форматированный баланс для отображения
  const formattedBalance = balance ? formatTON(balance) : '-- TON';
  
  // Время последнего обновления
  const lastUpdatedText = lastUpdated 
    ? `Last updated: ${lastUpdated.toLocaleTimeString()}` 
    : 'Not updated yet';
  
  // Различные варианты отображения в зависимости от стиля
  if (style === 'compact') {
    return (
      <Cell
        subtitle={lastUpdatedText}
        after={isLoading ? <Spinner size="s" /> : undefined}
      >
        {formattedBalance}
        {showRefreshButton && (
          <Button onClick={handleRefresh} disabled={isLoading} size="s" style={{ marginLeft: 8 }}>
            Refresh
          </Button>
        )}
      </Cell>
    );
  }
  
  if (style === 'cell') {
    return (
      <Cell
        before={isLoading ? <Spinner size="m" /> : undefined}
        subtitle={lastUpdatedText}
        onClick={showRefreshButton ? handleRefresh : undefined}
      >
        <span style={{ fontSize: '1.2em', fontWeight: 'bold' }}>
          {formattedBalance}
        </span>
        {error && (
          <div style={{ color: 'var(--tg-theme-text-color)', opacity: 0.7, marginTop: 4, fontSize: '0.9em' }}>
            Error: {error.message}
          </div>
        )}
      </Cell>
    );
  }
  
  // По умолчанию style === 'section'
  return (
    <Section
      header={title}
      footer={error ? `Error: ${error.message}` : lastUpdatedText}
    >
      <Cell
        before={isLoading ? <Spinner size="m" /> : undefined}
        subtitle="Current wallet balance"
        after={showRefreshButton ? <Button onClick={handleRefresh} disabled={isLoading}>Refresh</Button> : undefined}
      >
        <span style={{ fontSize: '1.5em', fontWeight: 'bold' }}>
          {formattedBalance}
        </span>
      </Cell>
    </Section>
  );
}; 