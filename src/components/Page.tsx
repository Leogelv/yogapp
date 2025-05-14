import { useNavigate } from 'react-router-dom';
import { hideBackButton, onBackButtonClick, showBackButton, postEvent } from '@telegram-apps/sdk-react';
import { type PropsWithChildren, useEffect, useRef } from 'react';

// Стили для учета отступов safe area с дополнительными 5px
const safeAreaStyle = {
  paddingTop: 'var(--safe-area-top-plus, 5px)',
  paddingRight: 'var(--safe-area-right-plus, 5px)',
  paddingBottom: 'var(--safe-area-bottom-plus, 5px)',
  paddingLeft: 'var(--safe-area-left-plus, 5px)',
  flex: 1,
  display: 'flex',
  flexDirection: 'column' as const,
  width: '100%',
  boxSizing: 'border-box' as const,
};

export function Page({ children, back = true }: PropsWithChildren<{
  /**
   * True if it is allowed to go back from this page.
   */
  back?: boolean
}>) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (back) {
      showBackButton();
      return onBackButtonClick(() => {
        navigate(-1);
      });
    }
    hideBackButton();
  }, [back, navigate]);

  // Повторно запрашиваем safe area при монтировании страницы
  useEffect(() => {
    postEvent('web_app_request_safe_area');
  }, []);

  return (
    <div className="page-container" style={safeAreaStyle} ref={containerRef}>
      {children}
    </div>
  );
}