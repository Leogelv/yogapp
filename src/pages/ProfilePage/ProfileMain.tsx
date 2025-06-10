import {FC, useMemo, useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {postEvent} from '@telegram-apps/sdk-react';

import {Page} from '@/components/Page';
import {useUser} from '@/contexts/UserContext';
import './ProfileMain.css';

export const ProfileMain: FC = () => {
    const {user, supabaseUser, loading, error} = useUser();

    const navigate = useNavigate();
    const [isPWAInstalled, setIsPWAInstalled] = useState(false);

    // Тестовые данные для показа UI
    const dummyStats = useMemo(
        () => ({
            subscriptionPlan: 'Pro',
            subscriptionStatus: 'active',
            expiryDate: '2024-12-31',
            daysLeft: 26,
        }),
        []
    );

    // Проверяем, установлено ли приложение как PWA
    useEffect(() => {
        const checkPWAInstallation = () => {
            // Проверка 1: display-mode
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

            // Проверка 2: navigator.standalone (iOS Safari)
            const isIOSStandalone = (window.navigator as any).standalone === true;

            // Проверка 3: проверяем URL и наличие Telegram
            const isTelegramApp = !!(window as any).Telegram?.WebApp;

            const installed = (isStandalone || isIOSStandalone) && !isTelegramApp;
            setIsPWAInstalled(installed);

            console.log('PWA Installation Check:', {
                isStandalone,
                isIOSStandalone,
                isTelegramApp,
                installed
            });
        };

        checkPWAInstallation();

        // Слушаем изменения display-mode
        const mediaQuery = window.matchMedia('(display-mode: standalone)');
        mediaQuery.addEventListener('change', checkPWAInstallation);

        return () => {
            mediaQuery.removeEventListener('change', checkPWAInstallation);
        };
    }, []);

    // Функция для добавления на рабочий стол через Telegram Mini App API
    const handleAddToHomeScreen = () => {
        try {
            // Проверяем, работает ли приложение в Telegram
            const tg = (window as any).Telegram?.WebApp;

            if (tg) {
                console.log('Попытка добавления на рабочий стол через Telegram Mini App API');

                // Используем различные методы Telegram Mini App API
                try {
                    // Метод 1: Прямой вызов через postEvent
                    postEvent('web_app_add_to_home_screen');
                    console.log('✅ Отправлен запрос web_app_add_to_home_screen');
                } catch (error) {
                    console.warn('⚠️ postEvent не сработал:', error);
                }

                try {
                    // Метод 2: Через нативный Telegram WebApp API
                    if (tg.addToHomeScreen) {
                        tg.addToHomeScreen();
                        console.log('✅ Вызван tg.addToHomeScreen()');
                    } else {
                        console.warn('⚠️ tg.addToHomeScreen не доступен');
                    }
                } catch (error) {
                    console.warn('⚠️ tg.addToHomeScreen не сработал:', error);
                }

                try {
                    // Метод 3: Показываем меню с опциями
                    if (tg.showPopup) {
                        tg.showPopup({
                            title: 'Добавить на рабочий стол',
                            message: 'Для добавления приложения на рабочий стол используйте меню Telegram (⋮) в правом верхнем углу и выберите "Добавить на главный экран"',
                            buttons: [
                                {type: 'ok', text: 'Понятно'}
                            ]
                        });
                    } else if (tg.showAlert) {
                        tg.showAlert('Для добавления на рабочий стол используйте меню Telegram (⋮) → "Добавить на главный экран"');
                    }
                } catch (error) {
                    console.warn('⚠️ Не удалось показать popup:', error);
                }

            } else {
                console.log('Не в Telegram, используем PWA fallback');

                // Fallback для PWA в обычном браузере
                const deferredPrompt = (window as any).deferredPrompt;

                if (deferredPrompt) {
                    console.log('✅ Используем сохраненный PWA install prompt');
                    deferredPrompt.prompt();

                    deferredPrompt.userChoice.then((choiceResult: any) => {
                        if (choiceResult.outcome === 'accepted') {
                            console.log('✅ Пользователь принял установку PWA');
                        } else {
                            console.log('❌ Пользователь отклонил установку PWA');
                        }
                        (window as any).deferredPrompt = null;
                    });
                } else {
                    // Показываем инструкции для разных браузеров
                    const userAgent = navigator.userAgent.toLowerCase();
                    let instructions = '';

                    if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
                        instructions = 'В Chrome: нажмите ⋮ → "Установить приложение" или "Добавить на главный экран"';
                    } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
                        instructions = 'В Safari: нажмите кнопку "Поделиться" → "На экран Домой"';
                    } else if (userAgent.includes('firefox')) {
                        instructions = 'В Firefox: нажмите ⋮ → "Установить" или "Добавить на главный экран"';
                    } else if (userAgent.includes('edg')) {
                        instructions = 'В Edge: нажмите ⋮ → "Приложения" → "Установить это приложение"';
                    } else {
                        instructions = 'Используйте меню браузера для добавления на главный экран';
                    }

                    window.alert(`Для добавления на рабочий стол:\n${instructions}`);
                }
            }
        } catch (error) {
            console.error('❌ Ошибка при добавлении на рабочий стол:', error);
            window.alert('Для добавления на рабочий стол используйте меню браузера или Telegram');
        }
    };

    // Если данные пользователя загружаются
    if (loading) {
        return (
            <Page>
                <div className="profile-loading">
                    <div className="profile-loading-spinner" aria-hidden="true"/>
                    <p>Загрузка профиля...</p>
                </div>
            </Page>
        );
    }

    // Если есть ошибка при получении данных
    if (error) {
        return (
            <Page>
                <div className="profile-error">
                    <div className="profile-error-icon" aria-hidden="true">
                        ⚠️
                    </div>
                    <h2>Ошибка</h2>
                    <p>{error.message}</p>
                </div>
            </Page>
        );
    }

    // Если нет данных пользователя
    if (!user) {
        return (
            <Page>
                <div className="profile-error">
                    <div className="profile-error-icon" aria-hidden="true">
                        ⚠️
                    </div>
                    <h2>Нет данных</h2>
                    <p>Не удалось получить данные пользователя</p>
                </div>
            </Page>
        );
    }

    return (
        <Page>
            <div className={'min-h-screen flex flex-col gap-20'}>
                <div className={'!py-6 flex flex-col items-center gap-4  border-t border-b border-[#191919]'}>
                    <div className={'overflow-hidden w-28 h-28 rounded-full border border-[#191919]'}>
                        {user.photo_url ? (
                            <img
                                src={user.photo_url}
                                alt={user.username || user.first_name}
                                loading="eager"
                            />
                        ) : (
                            <div className="profile-avatar-placeholder-simple" aria-hidden="true">
                                {user.first_name.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div className={'flex flex-col items-center text-black'}>
                        <h1 className={'text-2xl font-bold'} style={{ fontFamily: 'RF Dewi, sans-serif', letterSpacing: '-0.07em' }}>привет, {user.first_name}</h1>
                        <p>осталось в Nova: {dummyStats.daysLeft} дней</p>
                    </div>
                </div>
                <div className={'!px-3 flex flex-col gap-3 !pb-20 border-b border-[#191919]'}>
                    <button style={{ fontFamily: 'RF Dewi, sans-serif', letterSpacing: '-0.07em' }} className={'w-full !py-7 bg-[#191919] font-bold'} onClick={() => navigate('/subscription')}>продлить подписку</button>
                    {!isPWAInstalled && (
                        <button style={{ fontFamily: 'RF Dewi, sans-serif', letterSpacing: '-0.07em' }} className={'w-full !py-7 bg-[#191919] font-bold'}
                            onClick={handleAddToHomeScreen}
                        >
                            добавить на рабочий стол
                        </button>
                    )}
                    <button style={{ fontFamily: 'RF Dewi, sans-serif', letterSpacing: '-0.07em' }} className={'w-full !py-7 bg-[#191919] font-bold'} onClick={() => navigate('/support')}>поддержка</button>
                    {/* Кнопка для администраторов */}
                    {supabaseUser?.is_admin && (
                        <>
                            {/* Разделительная линия перед админской кнопкой */}
                            <div className="profile-divider"></div>
                            <div className="admin-button-container-simple">
                                <button
                                    className="action-button-simple admin-button-simple"
                                    onClick={() => navigate('/admin')}
                                >
                                    Панель администратора
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

        </Page>
    );
};

