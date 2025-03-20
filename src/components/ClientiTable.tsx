
import React from 'react';
import { Cliente } from '../types';
import { Info } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface ClientiTableProps {
  clienti: Cliente[];
  onViewDetails?: (id: string) => void;
}

const ClientiTable: React.FC<ClientiTableProps> = ({ clienti, onViewDetails }) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Settore</TableHead>
            <TableHead>Fatturato (€)</TableHead>
            <TableHead>Dipendenti</TableHead>
            <TableHead>Regione</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clienti.map((cliente) => (
            <TableRow key={cliente.id}>
              <TableCell className="font-medium">{cliente.nome}</TableCell>
              <TableCell>{cliente.settore}</TableCell>
              <TableCell>{cliente.fatturato.toLocaleString('it-IT')}</TableCell>
              <TableCell>{cliente.dipendenti}</TableCell>
              <TableCell>{cliente.regione}</TableCell>
              <TableCell>{cliente.email}</TableCell>
              <TableCell>
                {onViewDetails && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => onViewDetails(cliente.id)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ClientiTable;
