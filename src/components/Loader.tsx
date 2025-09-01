
interface LoaderProps {
  variant?: 'dots' | 'spinner' | 'pulse';
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'warning'
  className?: string;
}

export default function Loader({ 
  variant = 'dots', 
  size = 'md', 
  color = 'primary',
  className = '' 
}: LoaderProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const colorClasses = {
    primary: 'text-blue-500',
    secondary: 'text-gray-500',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    // danger: 'text-red-500'
    danger: 'text-gray-500',  
  };

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className={`flex space-x-1 ${sizeClasses[size]}`}>
            <div className={`w-1 h-1 bg-current rounded-full animate-bounce ${colorClasses[color]}`}></div>
            <div className={`w-1 h-1 bg-current rounded-full animate-bounce ${colorClasses[color]}`} style={{ animationDelay: '0.1s' }}></div>
            <div className={`w-1 h-1 bg-current rounded-full animate-bounce ${colorClasses[color]}`} style={{ animationDelay: '0.2s' }}></div>
          </div>
        );
      
      case 'spinner':
        return (
          <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-current ${sizeClasses[size]} ${colorClasses[color]}`}></div>
        );
      
      case 'pulse':
        return (
          <div className={`animate-pulse rounded-full bg-current ${sizeClasses[size]} ${colorClasses[color]}`}></div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      {renderLoader()}
    </div>
  );
}
