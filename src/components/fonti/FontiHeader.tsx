
import React from 'react';
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Loader2 } from 'lucide-react';

interface FontiHeaderProps {
  importingFromSheets: boolean;
  onImportFromGoogleSheets: () => Promise<void>;
}

export const FontiHeader: React.FC<FontiHeaderProps> = ({ 
  importingFromSheets, 
  onImportFromGoogleSheets 
}) => {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold">Gestione Fonti di Dati</h1>
      <div className="flex space-x-2">
        <Button 
          onClick={onImportFromGoogleSheets}
          disabled={importingFromSheets}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600"
        >
          {importingFromSheets ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileSpreadsheet className="h-4 w-4" />
          )}
          Importa Fonti
        </Button>
      </div>
    </div>
  );
};
