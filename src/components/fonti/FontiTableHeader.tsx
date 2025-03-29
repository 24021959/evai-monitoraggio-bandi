
import React from 'react';
import { Button } from "@/components/ui/button";
import { Webhook } from 'lucide-react';

interface FontiTableHeaderProps {
  onConfigureGoogleSheets?: () => void;
  onConfigureN8n?: () => void;
}

export const FontiTableHeader: React.FC<FontiTableHeaderProps> = ({ 
  onConfigureGoogleSheets,
  onConfigureN8n
}) => {
  return (
    <div className="flex items-center justify-between pb-4">
      <div>
        <h2 className="text-lg font-semibold">Elenco Fonti</h2>
        <p className="text-sm text-gray-500">
          Gestisci le fonti configurate per il monitoraggio dei bandi
        </p>
      </div>
      <div className="flex gap-2">
        {onConfigureN8n && (
          <Button 
            variant="outline"
            size="sm"
            onClick={onConfigureN8n}
            className="flex items-center gap-1"
          >
            <Webhook className="h-4 w-4" />
            Configura n8n
          </Button>
        )}
      </div>
    </div>
  );
};
