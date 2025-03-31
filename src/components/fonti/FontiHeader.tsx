
import React from 'react';
import { Database } from 'lucide-react';

export const FontiHeader: React.FC = () => {
  return (
    <div className="flex items-center mb-2">
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-3 rounded-lg mr-4 shadow-md">
        <Database className="h-6 w-6 text-white" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Fonti di Dati</h1>
        <p className="text-gray-500 text-sm">Visualizza le fonti configurate per il sistema</p>
      </div>
    </div>
  );
};
