
import React, { useState } from 'react';
import { Fonte } from '@/types';
import { Trash2, Edit, ExternalLink, Save, X } from 'lucide-react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FonteRowProps {
  fonte: Fonte;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEditUrl: (fonte: Fonte) => void;
  onSaveUrl: (fonteId: string, newUrl: string) => Promise<void>;
}

export const FonteRow: React.FC<FonteRowProps> = ({
  fonte,
  onEdit,
  onDelete,
  onEditUrl,
  onSaveUrl
}) => {
  const [editingUrl, setEditingUrl] = useState(false);
  const [editUrl, setEditUrl] = useState(fonte.url);
  const [isUpdating, setIsUpdating] = useState(false);

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

  const handleEditUrl = () => {
    setEditingUrl(true);
    setEditUrl(fonte.url);
  };

  const handleSaveUrl = async () => {
    setIsUpdating(true);
    await onSaveUrl(fonte.id, editUrl);
    setIsUpdating(false);
    setEditingUrl(false);
  };

  const handleCancelEdit = () => {
    setEditingUrl(false);
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{fonte.nome}</TableCell>
      <TableCell>
        {editingUrl ? (
          <div className="flex items-center gap-2">
            <Input
              value={editUrl}
              onChange={(e) => setEditUrl(e.target.value)}
              className="text-sm"
            />
          </div>
        ) : (
          <a 
            href={fonte.url} 
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline flex items-center gap-1"
          >
            {fonte.url}
            <ExternalLink className="h-3 w-3 inline" />
          </a>
        )}
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
          {editingUrl ? (
            <>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleSaveUrl}
                className="text-green-500 hover:text-green-700"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <span className="flex items-center">
                    <span className="animate-spin h-4 w-4 mr-1 border-2 border-t-transparent border-green-500 rounded-full"></span>
                    Salvataggio...
                  </span>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-1" />
                    Salva
                  </>
                )}
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleCancelEdit}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleEditUrl}
                className="text-blue-500 hover:text-blue-700"
              >
                <Edit className="h-4 w-4 mr-1" />
                URL
              </Button>
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
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};
