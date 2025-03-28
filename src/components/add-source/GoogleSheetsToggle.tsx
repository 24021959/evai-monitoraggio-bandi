
import React from 'react';
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FileSpreadsheet } from 'lucide-react';

interface GoogleSheetsToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const GoogleSheetsToggle: React.FC<GoogleSheetsToggleProps> = ({
  checked,
  onCheckedChange
}) => {
  return (
    <div className="flex items-center space-x-2 my-4">
      <Switch 
        id="add-to-sheet"
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
      <Label htmlFor="add-to-sheet" className="flex items-center cursor-pointer">
        <FileSpreadsheet className="h-4 w-4 mr-1 text-green-600" />
        Aggiungi anche al foglio Google Sheets
      </Label>
    </div>
  );
};
