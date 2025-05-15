import { logger } from '@/lib/logger';

/**
 * Преобразует наноТОНы в обычные ТОНы с форматированием
 * @param nanoAmount количество в наноТОНах (10^-9 TON)
 * @param decimals количество десятичных цифр после запятой
 */
export function formatTON(nanoAmount: string | number | undefined | null, decimals: number = 2): string {
  if (nanoAmount === undefined || nanoAmount === null) {
    return '0 TON';
  }
  
  try {
    // Преобразуем строку в число
    const amount = typeof nanoAmount === 'string' ? Number(nanoAmount) : nanoAmount;
    
    // Деление на 10^9 для конвертации наноТОНов в ТОНы
    const tons = amount / 1_000_000_000;
    
    // Форматирование с указанным количеством десятичных знаков
    const formatted = tons.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
    
    return `${formatted} TON`;
  } catch (error) {
    logger.error('Ошибка форматирования TON:', error);
    return '? TON';
  }
}

// Кеш для хранения результатов запросов баланса
interface BalanceCache {
  [address: string]: {
    balance: string;
    timestamp: number;
  }
}

const balanceCache: BalanceCache = {};
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 минуты

/**
 * Получает баланс кошелька TON по адресу
 * @param address адрес кошелька
 * @param useCache использовать ли кеш (по умолчанию true)
 */
export async function getTONWalletBalance(address: string, useCache: boolean = true): Promise<string> {
  if (!address) {
    logger.error('getTONWalletBalance: Адрес не указан');
    return '0';
  }
  
  const normalizedAddress = address.trim();
  
  // Проверяем кеш, если разрешено использовать кеш
  if (useCache && balanceCache[normalizedAddress]) {
    const cachedData = balanceCache[normalizedAddress];
    const now = Date.now();
    
    // Если кеш все еще актуален
    if (now - cachedData.timestamp < CACHE_TTL_MS) {
      logger.debug(`Используем кешированный баланс для ${normalizedAddress}`);
      return cachedData.balance;
    }
  }
  
  try {
    logger.info(`Запрашиваем баланс для адреса ${normalizedAddress}`);
    
    // Используем TON API для получения баланса
    const response = await fetch(`https://toncenter.com/api/v2/getAddressBalance?address=${encodeURIComponent(normalizedAddress)}`);
    
    if (!response.ok) {
      throw new Error(`API вернул код ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.ok || !data.result) {
      throw new Error('Некорректный ответ от API');
    }
    
    // Сохраняем в кеш
    balanceCache[normalizedAddress] = {
      balance: data.result,
      timestamp: Date.now()
    };
    
    return data.result;
  } catch (error) {
    logger.error('Ошибка получения баланса TON:', error);
    // Возвращаем кешированное значение в случае ошибки, если оно есть
    if (balanceCache[normalizedAddress]) {
      logger.info('Используем устаревший кеш из-за ошибки API');
      return balanceCache[normalizedAddress].balance;
    }
    return '0';
  }
}

/**
 * Очищает кеш балансов
 */
export function clearBalanceCache(): void {
  Object.keys(balanceCache).forEach(key => delete balanceCache[key]);
  logger.debug('Кеш балансов очищен');
} 