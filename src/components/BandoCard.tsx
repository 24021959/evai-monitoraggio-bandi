
import React from 'react';
import { Bando } from '../types';
import { Info, Link2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface BandoCardProps {
  bando: Bando;
  onViewDetails?: (id: string) => void;
  onDelete?: (id: string) => void;
  showFullDetails?: boolean;
}

const BandoCard: React.FC<BandoCardProps> = ({ 
  bando, 
  onViewDetails, 
  onDelete,
  showFullDetails = false
}) => {
  const formatImporto = (min?: number, max?: number, budgetDisponibile?: string) => {
    if (budgetDisponibile) {
      return budgetDisponibile;
    }
    
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

  const openUrl = (url: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm hover:shadow transition-shadow h-full flex flex-col">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-medium text-lg">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="truncate max-w-[200px]">{bando.titolo}</div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-md">
                <p>{bando.titolo}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </h3>
        <span className={`text-xs text-white px-2 py-1 rounded-full ${getTipoClass(bando.tipo)}`}>
          {bando.tipo}
        </span>
      </div>
      
      <div className="text-sm text-gray-600 mb-4 flex-grow">
        <div className="flex justify-between mb-1">
          <span className="font-medium w-1/3">Fonte:</span>
          <span className="w-2/3 text-right">{bando.fonte}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span className="font-medium w-1/3">Settori:</span>
          <span className="w-2/3 text-right">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="truncate">
                    {(bando.settori && Array.isArray(bando.settori) && bando.settori.join(', ')) || 'Generico'}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-md">
                  <p>{(bando.settori && Array.isArray(bando.settori) && bando.settori.join(', ')) || 'Generico'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </span>
        </div>
        <div className="flex justify-between mb-1">
          <span className="font-medium w-1/3">Importo (€):</span>
          <span className="w-2/3 text-right">
            {formatImporto(bando.importoMin, bando.importoMax, bando.budgetDisponibile)}
          </span>
        </div>
        <div className="flex justify-between mb-1">
          <span className="font-medium w-1/3">Scadenza:</span>
          <span className="w-2/3 text-right">
            {bando.scadenzaDettagliata || new Date(bando.scadenza).toLocaleDateString('it-IT')}
          </span>
        </div>
        
        {showFullDetails && bando.dataEstrazione && (
          <div className="flex justify-between mb-1">
            <span className="font-medium w-1/3">Data Estrazione:</span>
            <span className="w-2/3 text-right">{bando.dataEstrazione}</span>
          </div>
        )}
        
        {showFullDetails && bando.descrizione && (
          <div className="mt-2">
            <Separator className="my-2" />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <strong className="block mb-1">Descrizione:</strong>
                    <p className="text-xs text-gray-500 max-h-28 overflow-y-auto border p-2 rounded bg-gray-50">
                      {bando.descrizione}
                    </p>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-md max-h-[300px] overflow-y-auto">
                  <p>{bando.descrizioneCompleta || bando.descrizione}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
        
        {showFullDetails && bando.requisiti && (
          <div className="mt-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <strong className="block mb-1">Requisiti:</strong>
                    <p className="text-xs text-gray-500 max-h-24 overflow-y-auto border p-2 rounded bg-gray-50">
                      {bando.requisiti}
                    </p>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-md max-h-[300px] overflow-y-auto">
                  <p>{bando.requisiti}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
        
        {showFullDetails && bando.modalitaPresentazione && (
          <div className="mt-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <strong className="block mb-1">Modalità Presentazione:</strong>
                    <p className="text-xs text-gray-500 max-h-16 overflow-y-auto border p-2 rounded bg-gray-50">
                      {bando.modalitaPresentazione}
                    </p>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-md max-h-[300px] overflow-y-auto">
                  <p>{bando.modalitaPresentazione}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
      
      <div className="flex flex-col gap-2 mt-auto pt-2">
        {bando.url && (
          <Button 
            variant="outline" 
            size="sm"
            className="w-full flex items-center justify-center gap-2"
            onClick={() => openUrl(bando.url as string)}
          >
            <ExternalLink className="h-4 w-4" />
            Apri Bando
          </Button>
        )}
        
        {onViewDetails && (
          <Button 
            variant="default" 
            size="sm"
            className="w-full flex items-center justify-center gap-2" 
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
            className="w-full"
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
