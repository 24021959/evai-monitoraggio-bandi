import React from 'react';
import { Bando } from '../types';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BandoCardProps {
  bando: Bando;
  onViewDetails?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const BandoCard: React.FC<BandoCardProps> = ({ bando, onViewDetails, onDelete }) => {
  const formatImporto = (min?: number, max?: number) => {
    if (min && max) {
      return `${min / 1000}K - ${max / 1000}K`;
    } else if (min) {
      return `da ${min / 1000}K`;
    } else if (max) {
      return `fino a ${max / 1000 > 1000 ? max / 1000000 + 'M' : max / 1000 + 'K'}`;
    }
    return 'N/D';
  };

  const getTipoClass = (tipo: string) => {
    switch (tipo) {
      case 'statale':
        return 'bg-green-500';
      case 'europeo':
        return 'bg-blue-500';
      case 'regionale':
        return 'bg-teal-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm hover:shadow transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-medium truncate text-lg">{bando.titolo}</h3>
        <span className={`text-xs text-white px-2 py-1 rounded-full ${getTipoClass(bando.tipo)}`}>
          {bando.tipo}
        </span>
      </div>
      <div className="text-sm text-gray-600 mb-4">
        <div className="flex justify-between mb-1">
          <span>Fonte:</span>
          <span className="font-medium">{bando.fonte}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span>Settori:</span>
          <span className="font-medium">{bando.settori.join(', ')}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span>Importo (€):</span>
          <span className="font-medium">{formatImporto(bando.importoMin, bando.importoMax)}</span>
        </div>
        <div className="flex justify-between">
          <span>Scadenza:</span>
          <span className="font-medium">{new Date(bando.scadenza).toLocaleDateString('it-IT')}</span>
        </div>
      </div>
      <div className="flex gap-2">
        {onViewDetails && (
          <Button 
            variant="outline" 
            size="sm"
            className="flex-1 flex items-center justify-center gap-2" 
            onClick={() => onViewDetails(bando.id)}
          >
            <Info className="h-4 w-4" />
            Dettagli
          </Button>
        )}
        {onDelete && (
          <Button 
            variant="destructive" 
            size="sm"
            className="flex-1"
            onClick={() => onDelete(bando.id)}
          >
            Elimina
          </Button>
        )}
      </div>
    </div>
  );
};

export default BandoCard;
