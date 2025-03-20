
import React, { useState } from 'react';
import { Match } from '../types';
import { Check, X } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { mockBandi, mockClienti } from '@/data/mockData';

interface MatchTableProps {
  matches: Match[];
  onViewDetails?: (id: string) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
}

const MatchTable: React.FC<MatchTableProps> = ({ 
  matches, 
  onSelectionChange 
}) => {
  const [selectedMatches, setSelectedMatches] = useState<string[]>([]);

  const getCompatibilitaClass = (compatibilita: number) => {
    if (compatibilita >= 80) return 'bg-green-500';
    if (compatibilita >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getClienteName = (id: string) => {
    const cliente = mockClienti.find(c => c.id === id);
    return cliente ? cliente.nome : 'Cliente sconosciuto';
  };

  const getBandoName = (id: string) => {
    const bando = mockBandi.find(b => b.id === id);
    return bando ? bando.titolo : 'Bando sconosciuto';
  };

  const getBandoScadenza = (id: string) => {
    const bando = mockBandi.find(b => b.id === id);
    return bando ? new Date(bando.scadenza).toLocaleDateString('it-IT') : 'N/D';
  };

  const handleCheckboxChange = (id: string) => {
    setSelectedMatches(prev => {
      const newSelection = prev.includes(id)
        ? prev.filter(matchId => matchId !== id)
        : [...prev, id];
      
      // Notify parent component about selection change
      if (onSelectionChange) {
        onSelectionChange(newSelection);
      }
      
      return newSelection;
    });
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Selezione</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Bando</TableHead>
            <TableHead>Scadenza</TableHead>
            <TableHead>Compatibilità</TableHead>
            <TableHead>Notificato</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {matches.map((match) => (
            <TableRow key={match.id}>
              <TableCell>
                <Checkbox 
                  checked={selectedMatches.includes(match.id)}
                  onCheckedChange={() => handleCheckboxChange(match.id)}
                />
              </TableCell>
              <TableCell className="font-medium">{getClienteName(match.clienteId)}</TableCell>
              <TableCell>{getBandoName(match.bandoId)}</TableCell>
              <TableCell>{getBandoScadenza(match.bandoId)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${getCompatibilitaClass(match.compatibilita)}`} 
                      style={{ width: `${match.compatibilita}%` }}
                    ></div>
                  </div>
                  <span>{match.compatibilita}%</span>
                </div>
              </TableCell>
              <TableCell>
                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${match.notificato ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {match.notificato ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default MatchTable;
