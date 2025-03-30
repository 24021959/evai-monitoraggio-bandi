
import React from 'react';
import { RefreshCw } from 'lucide-react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <RefreshCw className="h-12 w-12 animate-spin text-blue-500" />
      <p className="mt-4 text-lg text-gray-600">Caricamento in corso...</p>
    </div>
  );
};

export default LoadingSpinner;
