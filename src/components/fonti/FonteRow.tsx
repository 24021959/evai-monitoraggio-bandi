
import React from 'react';
import { Fonte } from '@/types';
import { TableCell, TableRow } from "@/components/ui/table";

interface FonteRowProps {
  fonte: Fonte;
}

export const FonteRow: React.FC<FonteRowProps> = ({ fonte }) => {
  return (
    <TableRow key={fonte.id}>
      <TableCell className="font-medium">{fonte.nome}</TableCell>
      <TableCell>
        <div className="flex items-center">
          <a 
            href={fonte.url} 
            target="_blank" 
            rel="noreferrer" 
            className="text-blue-600 hover:underline truncate max-w-[500px]"
          >
            {fonte.url}
          </a>
        </div>
      </TableCell>
    </TableRow>
  );
};
