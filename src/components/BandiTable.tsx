
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

  const openUrl = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="rounded-md border overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titolo</TableHead>
            <TableHead>Fonte</TableHead>
            <TableHead>Tipo</TableHead>
            {showFullDetails && <TableHead>Requisiti</TableHead>}
            <TableHead>Settori</TableHead>
            <TableHead>Importo (€)</TableHead>
            <TableHead>Scadenza</TableHead>
            {showFullDetails && <TableHead>Link</TableHead>}
            {showFullDetails && <TableHead>Data Estrazione</TableHead>}
            <TableHead>Azioni</TableHead>
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
                        <div className="max-w-xs truncate">
                          {bando.requisiti || 'N/D'}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-md">
                        <p>{bando.requisiti || 'Nessun requisito specificato'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
              )}
              <TableCell>{(bando.settori && bando.settori.join(', ')) || 'Generico'}</TableCell>
              <TableCell>{formatImporto(bando.importoMin, bando.importoMax, bando.budgetDisponibile)}</TableCell>
              <TableCell>
                {bando.scadenzaDettagliata || new Date(bando.scadenza).toLocaleDateString('it-IT')}
              </TableCell>
              {showFullDetails && (
                <TableCell onClick={(e) => e.stopPropagation()}>
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
                  {bando.dataEstrazione || 'N/D'}
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
