
import React from 'react';
import { Fonte } from '../types';
import { 
  Table, 
  TableBody, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { FonteRow } from './fonti/FonteRow';
import { useFontiUrlHandler } from '@/utils/FontiUrlHandler';

interface FontiTableProps {
  fonti: Fonte[];
  onDelete?: (id: string) => void;
}

const FontiTable: React.FC<FontiTableProps> = ({ 
  fonti, 
  onDelete
}) => {
  const { handleSaveUrl } = useFontiUrlHandler();

  const handleEditUrl = (id: string) => {
    // This is a placeholder function as the actual URL editing
    // is now handled in the FonteRow component
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>URL</TableHead>
            <TableHead>Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fonti.map((fonte) => (
            <FonteRow 
              key={fonte.id}
              fonte={fonte}
              onDelete={onDelete}
              onEditUrl={handleEditUrl}
              onSaveUrl={handleSaveUrl}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default FontiTable;
