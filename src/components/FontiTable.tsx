
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

interface FontiTableProps {
  fonti: Fonte[];
}

const FontiTable: React.FC<FontiTableProps> = ({ fonti }) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>URL</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fonti.map((fonte) => (
            <FonteRow 
              key={fonte.id}
              fonte={fonte}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default FontiTable;
