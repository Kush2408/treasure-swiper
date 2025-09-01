

export default function MetricCardSkeleton() {
  return (
    <div className="bg-gray-800 rounded-lg p-4 flex items-center">
      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer flex items-center justify-center mr-3">
        <div className="w-6 h-6 bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 animate-shimmer rounded"></div>
      </div>
      <div className="flex-1">
        <div className="h-4 w-20 mb-2 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer rounded"></div>
        <div className="h-6 w-16 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer rounded"></div>
      </div>
    </div>
  );
}
