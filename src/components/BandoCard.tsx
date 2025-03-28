import React, { useState } from 'react';
import { Bando } from '../types';
import { Info, Link2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from "@/components/ui/hover-card";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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

  const handleDelete = () => {
    if (onDelete) {
      onDelete(bando.id);
    }
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm hover:shadow transition-shadow h-full flex flex-col">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-medium text-lg">
          <div className="break-words">{bando.titolo}</div>
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
            <HoverCard>
              <HoverCardTrigger asChild>
                <div>
                  <strong className="block mb-1">Requisiti:</strong>
                  <p className="text-xs text-gray-500 h-12 line-clamp-3 overflow-hidden border p-2 rounded bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
                    {bando.requisiti}
                  </p>
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="max-w-md max-h-[300px] overflow-y-auto bg-white p-4 shadow-lg border">
                <h4 className="font-medium mb-2">Requisiti completi</h4>
                <p className="text-sm">{bando.requisiti}</p>
              </HoverCardContent>
            </HoverCard>
          </div>
        )}
        
        {showFullDetails && bando.modalitaPresentazione && (
          <div className="mt-3">
            <HoverCard>
              <HoverCardTrigger asChild>
                <div>
                  <strong className="block mb-1">Modalità Presentazione:</strong>
                  <p className="text-xs text-gray-500 h-12 line-clamp-3 overflow-hidden border p-2 rounded bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
                    {bando.modalitaPresentazione}
                  </p>
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="max-w-md max-h-[300px] overflow-y-auto bg-white p-4 shadow-lg border">
                <h4 className="font-medium mb-2">Modalità di presentazione complete</h4>
                <p className="text-sm">{bando.modalitaPresentazione}</p>
              </HoverCardContent>
            </HoverCard>
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
            className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600" 
            onClick={() => onViewDetails(bando.id)}
          >
            <Info className="h-4 w-4" />
            Dettagli
          </Button>
        )}
        
        {onDelete && (
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                size="sm"
                className="w-full"
              >
                Elimina
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
                <AlertDialogDescription>
                  Sei sicuro di voler eliminare il bando "{bando.titolo}"? Questa azione non può essere annullata.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annulla</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Elimina</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
};

export default BandoCard;
