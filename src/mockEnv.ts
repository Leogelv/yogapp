import { mockTelegramEnv, isTMA, emitEvent } from '@telegram-apps/sdk-react';
import { isRealTelegramEnvironment } from '@/lib/telegramUtils';

// It is important, to mock the environment only for development purposes. When building the
// application, import.meta.env.DEV will become false, and the code inside will be tree-shaken,
// so you will not see it in your final bundle.
if (import.meta.env.DEV) {
 // Allow browser access if environment variable is set
 const allowBrowserAccess =
   import.meta.env.VITE_ALLOW_BROWSER_ACCESS === 'true';

 // Проверяем, не находимся ли мы в реальном Telegram
 const isRealTg = isRealTelegramEnvironment();

 if (!isRealTg && (allowBrowserAccess || !(await isTMA('complete')))) {
   const themeParams = {
     accent_text_color: '#6ab2f2',
     bg_color: '#ffffff',
     button_color: '#5288c1',
     button_text_color: '#ffffff',
     destructive_text_color: '#ec3942',
     header_bg_color: '#17212b',
     hint_color: '#708499',
     link_color: '#6ab3f3',
     secondary_bg_color: '#232e3c',
     section_bg_color: '#17212b',
     section_header_text_color: '#000000',
     subtitle_text_color: '#000000',
     text_color: '#000000',
   } as const;
   const noInsets = { left: 0, top: 0, bottom: 0, right: 0 } as const;
   mockTelegramEnv({
     onEvent(e) {
       // Here you can write your own handlers for all known Telegram MIni Apps methods.
       if (e[0] === 'web_app_request_theme') {
         return emitEvent('theme_changed', { theme_params: themeParams });
       }
       if (e[0] === 'web_app_request_viewport') {
         return emitEvent('viewport_changed', {
           height: window.innerHeight,
           width: window.innerWidth,
           is_expanded: true,
           is_state_stable: true,
         });
       }
       if (e[0] === 'web_app_request_content_safe_area') {
         return emitEvent('content_safe_area_changed', noInsets);
       }
       if (e[0] === 'web_app_request_safe_area') {
         return emitEvent('safe_area_changed', noInsets);
       }
     },
     launchParams: new URLSearchParams([
       // Discover more launch parameters:
       // https://docs.telegram-mini-apps.com/platform/launch-parameters#parameters-list
       ['tgWebAppThemeParams', JSON.stringify(themeParams)],
       // Your init data goes here. Learn more about it here:
       // https://docs.telegram-mini-apps.com/platform/init-data#parameters-list
       //
       // Note that to make sure, you are using a valid init data, you must pass it exactly as it
       // is sent from the Telegram application. The reason is in case you will sort its keys
       // (auth_date, hash, user, etc.) or values your own way, init data validation will more
       // likely to fail on your server side. So, to make sure you are working with a valid init
       // data, it is better to take a real one from your application and paste it here. It should
       // look something like this (a correctly encoded URL search params):
       // ```
       // user=%7B%22id%22%3A279058397%2C%22first_name%22%3A%22Vladislav%22%2C%22last_name%22...
       // ```
       // Try to use saved real user data or fallback to mock data
       [
         'tgWebAppData',
         (() => {
           try {
             // Пытаемся получить реальные данные пользователя из localStorage
             const savedUser = localStorage.getItem('yoga_user');
             if (savedUser) {
               const user = JSON.parse(savedUser);
               console.info(
                 '🔄 Using saved real user data for mock environment:',
                 {
                   id: user.id,
                   name: user.first_name,
                 }
               );

               return new URLSearchParams([
                 ['auth_date', ((new Date().getTime() / 1000) | 0).toString()],
                 ['hash', 'saved-user-hash'],
                 ['signature', 'saved-user-signature'],
                 [
                   'user',
                   JSON.stringify({
                     id: user.id,
                     first_name: user.first_name,
                     last_name: user.last_name,
                     username: user.username,
                     photo_url: user.photo_url,
                   }),
                 ],
               ]).toString();
             }
           } catch (error) {
             console.warn(
               'Failed to load saved user data, using fallback mock'
             );
           }

           // Fallback к мок данным для первого запуска
           return new URLSearchParams([
             ['auth_date', ((new Date().getTime() / 1000) | 0).toString()],
             ['hash', 'some-hash'],
             ['signature', 'some-signature'],
             ['user', JSON.stringify({ id: 1, first_name: 'Timur' })],
           ]).toString();
         })(),
       ],
       ['tgWebAppVersion', '8.4'],
       ['tgWebAppPlatform', 'tdesktop'],
     ]),
   });

   console.info(
     allowBrowserAccess
       ? '✅ Browser access enabled via VITE_ALLOW_BROWSER_ACCESS. Telegram environment mocked for development.'
       : '⚠️ As long as the current environment was not considered as the Telegram-based one, it was mocked. Take a note, that you should not do it in production and current behavior is only specific to the development process. Environment mocking is also applied only in development mode. So, after building the application, you will not see this behavior and related warning, leading to crashing the application outside Telegram.'
   );
 }
}


