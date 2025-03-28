
import React from 'react';
import { Cliente } from '../types';
import { Eye, Trash } from 'lucide-react';
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
  onDeleteClient?: (id: string) => void;
}

const ClientiTable: React.FC<ClientiTableProps> = ({ clienti, onViewDetails, onDeleteClient }) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader className="bg-blue-500">
          <TableRow>
            <TableHead className="text-white font-semibold">Nome</TableHead>
            <TableHead className="text-white font-semibold">Settore</TableHead>
            <TableHead className="text-white font-semibold">Fatturato</TableHead>
            <TableHead className="text-white font-semibold">Dipendenti</TableHead>
            <TableHead className="text-white font-semibold">Regione</TableHead>
            <TableHead className="text-white font-semibold">Email</TableHead>
            <TableHead className="text-white font-semibold">Telefono</TableHead>
            <TableHead className="text-white font-semibold">Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clienti.map((cliente, index) => (
            <TableRow 
              key={cliente.id} 
              className={index % 2 === 0 ? "bg-white" : "bg-amber-50"}
            >
              <TableCell className="font-medium">{cliente.nome}</TableCell>
              <TableCell>{cliente.settore}</TableCell>
              <TableCell>{cliente.fatturato.toLocaleString('it-IT')}</TableCell>
              <TableCell>{cliente.dipendenti}</TableCell>
              <TableCell>{cliente.regione}</TableCell>
              <TableCell>{cliente.email}</TableCell>
              <TableCell>{cliente.telefono || '-'}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  {onViewDetails && (
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => onViewDetails(cliente.id)}
                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-100"
                      aria-label="Dettagli"
                      title="Visualizza dettagli"
                    >
                      <Eye className="h-5 w-5" />
                    </Button>
                  )}
                  {onDeleteClient && (
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => onDeleteClient(cliente.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-100"
                      aria-label="Elimina"
                      title="Elimina cliente"
                    >
                      <Trash className="h-5 w-5" />
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

export default ClientiTable;
