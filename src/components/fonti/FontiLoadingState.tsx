
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';

export const FontiLoadingState: React.FC = () => {
  return (
    <Card className="bg-blue-50 border-blue-100 shadow-md">
      <CardContent className="py-8">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
          <p className="text-center text-blue-700 font-medium">Caricamento fonti in corso...</p>
          <p className="text-center text-blue-400 text-sm mt-2">Recupero dei dati dal server</p>
        </div>
      </CardContent>
    </Card>
  );
};
