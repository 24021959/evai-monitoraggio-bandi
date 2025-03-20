
import React from 'react';
import { Bando } from '../types';
import { Info, Trash2 } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface BandiTableProps {
  bandi: Bando[];
  onViewDetails?: (id: string) => void;
  onDeleteBando?: (id: string) => void;
}

const BandiTable: React.FC<BandiTableProps> = ({ bandi, onViewDetails, onDeleteBando }) => {
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titolo</TableHead>
            <TableHead>Fonte</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Settori</TableHead>
            <TableHead>Importo (€)</TableHead>
            <TableHead>Scadenza</TableHead>
            <TableHead>Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bandi.map((bando) => (
            <TableRow key={bando.id}>
              <TableCell className="font-medium">{bando.titolo}</TableCell>
              <TableCell>{bando.fonte}</TableCell>
              <TableCell>
                <span className={`text-xs text-white px-2 py-1 rounded-full ${getTipoClass(bando.tipo)}`}>
                  {bando.tipo}
                </span>
              </TableCell>
              <TableCell>{bando.settori.join(', ')}</TableCell>
              <TableCell>{formatImporto(bando.importoMin, bando.importoMax)}</TableCell>
              <TableCell>{new Date(bando.scadenza).toLocaleDateString('it-IT')}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {onViewDetails && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => onViewDetails(bando.id)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  )}
                  {onDeleteBando && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => onDeleteBando(bando.id)}
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
