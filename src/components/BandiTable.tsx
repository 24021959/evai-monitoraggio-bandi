
import React from 'react';
import { Bando } from '../types';
import { Eye, Trash2, ExternalLink, Link2 } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface BandiTableProps {
  bandi: Bando[];
  onViewDetails?: (id: string) => void;
  onDeleteBando?: (id: string) => void;
  showFullDetails?: boolean;
}

const BandiTable: React.FC<BandiTableProps> = ({ 
  bandi, 
  onViewDetails, 
  onDeleteBando,
  showFullDetails = false
}) => {
  const formatImporto = (min?: number, max?: number, budgetDisponibile?: string) => {
    if (budgetDisponibile) {
      return budgetDisponibile;
    }
    
    min = min || 0;
    max = max || 0;
    
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
    switch (tipo?.toLowerCase()) {
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

  const openUrl = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[25%] min-w-[200px]">Titolo</TableHead>
            <TableHead className="w-[10%] min-w-[100px]">Fonte</TableHead>
            <TableHead className="w-[8%] min-w-[80px]">Tipo</TableHead>
            {showFullDetails && <TableHead className="w-[15%] min-w-[150px]">Requisiti</TableHead>}
            <TableHead className="w-[12%] min-w-[120px]">Settori</TableHead>
            <TableHead className="w-[10%] min-w-[100px]">Importo (€)</TableHead>
            <TableHead className="w-[10%] min-w-[100px]">Scadenza</TableHead>
            {showFullDetails && <TableHead className="w-[5%] min-w-[50px]">Link</TableHead>}
            {showFullDetails && <TableHead className="w-[10%] min-w-[100px]">Data Estrazione</TableHead>}
            <TableHead className="w-[10%] min-w-[120px]">Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bandi.map((bando) => (
            <TableRow 
              key={bando.id} 
              className="cursor-pointer hover:bg-muted"
              onClick={() => onViewDetails && onViewDetails(bando.id)}
            >
              <TableCell className="font-medium">
                <div className="max-w-xs truncate" title={bando.titolo}>
                  {bando.titolo}
                </div>
              </TableCell>
              <TableCell>{bando.fonte}</TableCell>
              <TableCell>
                <span className={`text-xs text-white px-2 py-1 rounded-full ${getTipoClass(bando.tipo)}`}>
                  {bando.tipo}
                </span>
              </TableCell>
              {showFullDetails && (
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="max-h-20 overflow-y-auto text-sm">
                          {bando.requisiti || 'N/D'}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-md max-h-[300px] overflow-y-auto">
                        <p>{bando.requisiti || 'Nessun requisito specificato'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
              )}
              <TableCell>
                <div className="max-w-[150px] truncate" title={(bando.settori && bando.settori.join(', ')) || 'Generico'}>
                  {(bando.settori && bando.settori.join(', ')) || 'Generico'}
                </div>
              </TableCell>
              <TableCell>
                {formatImporto(
                  bando.importoMin || bando.importo_min, 
                  bando.importoMax || bando.importo_max, 
                  bando.budgetDisponibile || bando.budget_disponibile
                )}
              </TableCell>
              <TableCell>
                {bando.scadenzaDettagliata || bando.scadenza_dettagliata || new Date(bando.scadenza).toLocaleDateString('it-IT')}
              </TableCell>
              {showFullDetails && (
                <TableCell onClick={(e) => e.stopPropagation()} className="text-center">
                  {bando.url ? (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={(e) => openUrl(bando.url as string, e)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Link2 className="h-4 w-4" />
                    </Button>
                  ) : 'N/D'}
                </TableCell>
              )}
              {showFullDetails && (
                <TableCell>
                  {bando.dataEstrazione || bando.data_estrazione || 'N/D'}
                </TableCell>
              )}
              <TableCell onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2">
                  {onViewDetails && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(bando.id);
                      }}
                      className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      Dettagli
                    </Button>
                  )}
                  {onDeleteBando && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteBando(bando.id);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default BandiTable;
