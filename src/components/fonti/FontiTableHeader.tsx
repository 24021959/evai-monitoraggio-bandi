
import React from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle } from 'lucide-react';

interface FontiTableHeaderProps {
  onConfigureN8n?: () => void;
}

export const FontiTableHeader: React.FC<FontiTableHeaderProps> = () => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold">Fonti di Dati</h2>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" asChild>
          <a href="#aggiungi" className="flex items-center">
            <PlusCircle className="mr-2 h-4 w-4" />
            Aggiungi Fonte
          </a>
        </Button>
      </div>
    </div>
  );
};
