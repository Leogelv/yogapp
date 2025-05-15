import { FC } from 'react';

interface AuthStatusIndicatorProps {
  isAuthenticated: boolean;
  className?: string;
}

const AuthStatusIndicator: FC<AuthStatusIndicatorProps> = ({ 
  isAuthenticated, 
  className = ''
}) => {
  const status = isAuthenticated ? 'authenticated' : 'unauthenticated';
  const statusText = isAuthenticated ? 'Авторизован' : 'Не авторизован';
  const statusColor = isAuthenticated ? '#4caf50' : '#f44336';
  
  return (
    <div 
      className={`auth-status-indicator ${status} ${className}`} 
      style={{ 
        width: '12px', 
        height: '12px', 
        borderRadius: '50%', 
        backgroundColor: statusColor,
        display: 'inline-block',
        verticalAlign: 'middle',
        transition: 'all 0.3s ease',
        boxShadow: `0 0 0 2px rgba(${isAuthenticated ? '76, 175, 80' : '244, 67, 54'}, 0.15)`,
        position: 'relative'
      }} 
      title={statusText}
      role="status"
      aria-label={statusText}
    >
      <span className="visually-hidden">{statusText}</span>
    </div>
  );
};

export default AuthStatusIndicator; 