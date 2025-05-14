import { useNavigate } from 'react-router-dom';
import { hideBackButton, onBackButtonClick, showBackButton, postEvent } from '@telegram-apps/sdk-react';
import { type PropsWithChildren, useEffect, useRef } from 'react';

// Стили для учета отступов content safe area
const contentSafeAreaStyle = {
  paddingTop: 'var(--content-safe-area-top, 0px)',
  paddingRight: 'var(--content-safe-area-right, 0px)',
  paddingBottom: 'var(--content-safe-area-bottom, 0px)',
  paddingLeft: 'var(--content-safe-area-left, 0px)',
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

  // Повторно запрашиваем content safe area при монтировании страницы
  useEffect(() => {
    postEvent('web_app_request_content_safe_area');
  }, []);

  return (
    <div className="page-container" style={contentSafeAreaStyle} ref={containerRef}>
      {children}
    </div>
  );
}