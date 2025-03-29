
import React from 'react';

interface FontiHeaderProps {
  importingFromSheets?: boolean;
  onImportFromGoogleSheets?: () => Promise<void>;
}

export const FontiHeader: React.FC<FontiHeaderProps> = () => {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold">Gestione Fonti di Dati</h1>
    </div>
  );
};
