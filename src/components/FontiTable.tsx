
import React from 'react';
import { Fonte } from '../types';
import { Eye, Trash2 } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface FontiTableProps {
  fonti: Fonte[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
}

const FontiTable: React.FC<FontiTableProps> = ({ fonti, onEdit, onDelete, onView }) => {
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
            <TableHead>Nome</TableHead>
            <TableHead>URL</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Stato</TableHead>
            <TableHead>Modifica Fonte</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fonti.map((fonte) => (
            <TableRow key={fonte.id}>
              <TableCell className="font-medium">{fonte.nome}</TableCell>
              <TableCell>
                <a 
                  href={fonte.url} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {fonte.url}
                </a>
              </TableCell>
              <TableCell>
                <span className={`text-xs text-white px-2 py-1 rounded-full ${getTipoClass(fonte.tipo)}`}>
                  {fonte.tipo}
                </span>
              </TableCell>
              <TableCell>
                <span className={`text-xs px-2 py-1 rounded-full ${fonte.stato === 'attivo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {fonte.stato}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {onView && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => onView(fonte.id)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  {onEdit && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => onEdit(fonte.id)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      Dettagli
                    </Button>
                  )}
                  {onDelete && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => onDelete(fonte.id)}
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

export default FontiTable;
