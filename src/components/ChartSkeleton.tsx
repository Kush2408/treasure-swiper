
interface ChartSkeletonProps {
  type?: 'line' | 'bar' | 'pie' | 'area';
  height?: string;
  className?: string;
}

export default function ChartSkeleton({
  type = 'line',
  height = 'h-32',
  className = ''
}: ChartSkeletonProps) {
  const renderChartSkeleton = () => {
    switch (type) {
      case 'line':
        return (
          <div className="relative w-full h-full">
            <div className="w-full h-full bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer rounded-lg relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full relative">
                  <div className="absolute top-1/4 left-0 w-full h-0.5 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer transform -translate-y-1/2"></div>
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer transform -translate-y-1/2"></div>
                  <div className="absolute top-3/4 left-0 w-full h-0.5 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer transform -translate-y-1/2"></div>

                  <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                  <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                  <div className="absolute top-3/4 left-3/4 w-2 h-2 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'bar':
        return (
          <div className="w-full h-full bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 flex items-end justify-around px-4 pb-4">
              <div className="w-4 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer rounded-t" style={{ height: '60%' }}></div>
              <div className="w-4 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer rounded-t" style={{ height: '80%' }}></div>
              <div className="w-4 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer rounded-t" style={{ height: '40%' }}></div>
              <div className="w-4 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer rounded-t" style={{ height: '90%' }}></div>
              <div className="w-4 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer rounded-t" style={{ height: '70%' }}></div>
            </div>
          </div>
        );

      case 'pie':
        return (
          <div className="w-full h-full bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border-8 border-gray-600 relative">
                <div className="absolute inset-0 rounded-full border-8 border-gray-600 border-t-gray-400 transform rotate-45"></div>
                <div className="absolute inset-0 rounded-full border-8 border-gray-600 border-r-gray-500 transform rotate-90"></div>
              </div>
            </div>
          </div>
        );

      case 'area':
        return (
          <div className="w-full h-full bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer rounded-lg relative overflow-hidden">
            <div className="absolute inset-0">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <path
                  d="M0,80 L25,60 L50,70 L75,40 L100,50 L100,100 L0,100 Z"
                  fill="url(#areaGradient)"
                  opacity="0.3"
                />
                <defs>
                  <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#6B7280" />
                    <stop offset="100%" stopColor="#374151" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`${height} ${className}`}>
      {renderChartSkeleton()}
    </div>
  );
}
