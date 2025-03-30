
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from 'lucide-react';

const BandiEmptyState: React.FC = () => {
  return (
    <Card className="bg-gray-50">
      <CardContent className="py-8">
        <div className="text-center text-gray-500">
          <FileText className="mx-auto h-12 w-12 mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">Nessun bando trovato</h3>
          <p className="text-sm max-w-md mx-auto">
            Non sono stati trovati bandi che corrispondono ai criteri di ricerca. Prova a modificare i filtri o importa nuovi bandi.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BandiEmptyState;
