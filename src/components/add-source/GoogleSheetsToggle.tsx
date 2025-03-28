
import React, { useEffect, useState } from 'react';
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface GoogleSheetsToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const GoogleSheetsToggle: React.FC<GoogleSheetsToggleProps> = ({
  checked,
  onCheckedChange
}) => {
  const [configComplete, setConfigComplete] = useState(false);
  
  useEffect(() => {
    const sheetUrl = localStorage.getItem('googleSheetUrl');
    const updateUrl = localStorage.getItem('googleSheetUpdateUrl');
    setConfigComplete(!!sheetUrl && !!updateUrl);
  }, [checked]);
  
  return (
    <div className="flex items-center space-x-2 my-4">
      <Switch 
        id="add-to-sheet"
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={!configComplete}
      />
      <Label htmlFor="add-to-sheet" className="flex items-center cursor-pointer">
        <FileSpreadsheet className="h-4 w-4 mr-1 text-green-600" />
        Aggiungi anche al foglio Google Sheets
        
        {!configComplete && (
          <Badge variant="outline" className="ml-2 text-xs flex items-center bg-amber-50 border-amber-200 text-amber-700">
            <AlertCircle className="h-3 w-3 mr-1" />
            Configurazione incompleta
          </Badge>
        )}
      </Label>
    </div>
  );
};
