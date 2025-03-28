
import React from 'react';
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from 'lucide-react';

interface FontiTableHeaderProps {
  onConfigureGoogleSheets: () => void;
}

export const FontiTableHeader: React.FC<FontiTableHeaderProps> = ({ 
  onConfigureGoogleSheets 
}) => {
  return (
    <div className="flex justify-between mb-4">
      <Button 
        variant="outline" 
        onClick={onConfigureGoogleSheets}
        className="flex items-center gap-2"
      >
        <FileSpreadsheet className="h-4 w-4" />
        Configura Google Sheets
      </Button>
    </div>
  );
};
