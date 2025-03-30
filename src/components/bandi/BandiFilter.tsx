
import React from 'react';
import { Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BandiFilterProps {
  fonteFiltro: string;
  setFonteFiltro: (fonte: string) => void;
  fontiCombinate: string[];
}

const BandiFilter: React.FC<BandiFilterProps> = ({ 
  fonteFiltro, 
  setFonteFiltro, 
  fontiCombinate 
}) => {
  const handleFonteChange = (value: string) => {
    setFonteFiltro(value);
  };

  return (
    <div className="w-full md:w-48">
      <p className="text-sm font-medium mb-1 block text-slate-700">Seleziona fonte</p>
      <Select value={fonteFiltro} onValueChange={handleFonteChange}>
        <SelectTrigger>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="truncate">
              {fonteFiltro === 'tutte' ? "Tutte le fonti" : fonteFiltro}
            </span>
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="tutte">Tutte le fonti</SelectItem>
          {fontiCombinate.map((fonte, index) => (
            <SelectItem key={`fonte-${index}`} value={fonte}>
              {fonte}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default BandiFilter;
