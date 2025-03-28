
import React, { useState } from 'react';
import { Fonte } from '@/types';
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Link } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FonteUrlEditor } from './FonteUrlEditor';

interface FonteRowProps {
  fonte: Fonte;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEditUrl: (id: string) => void;
  onSaveUrl: (fonte: Fonte, newUrl: string) => Promise<boolean>;
}

export const FonteRow: React.FC<FonteRowProps> = ({ 
  fonte, 
  onEdit, 
  onDelete,
  onEditUrl,
  onSaveUrl
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showUrlEditor, setShowUrlEditor] = useState(false);
  
  const handleDelete = () => {
    if (onDelete) {
      onDelete(fonte.id);
    }
    setShowDeleteDialog(false);
  };
  
  const getTipoBadge = (tipo: string) => {
    switch(tipo) {
      case 'europeo':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Europeo</Badge>;
      case 'statale':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Statale</Badge>;
      case 'regionale':
        return <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-100">Regionale</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Altro</Badge>;
    }
  };
  
  const getStatoBadge = (stato: string) => {
    return stato === 'attivo' 
      ? <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Attivo</Badge>
      : <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Inattivo</Badge>;
  };

  const handleSaveUrl = async (newUrl: string) => {
    const success = await onSaveUrl(fonte, newUrl);
    if (success) {
      setShowUrlEditor(false);
    }
  };
  
  return (
    <>
      <TableRow key={fonte.id}>
        <TableCell className="font-medium">{fonte.nome}</TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <a 
              href={fonte.url} 
              target="_blank" 
              rel="noreferrer" 
              className="text-blue-600 hover:underline truncate max-w-[250px]"
            >
              {fonte.url}
            </a>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7" 
              onClick={() => setShowUrlEditor(true)}
            >
              <Link className="h-4 w-4" />
              <span className="sr-only">Modifica URL</span>
            </Button>
          </div>
        </TableCell>
        <TableCell>{getTipoBadge(fonte.tipo)}</TableCell>
        <TableCell>{getStatoBadge(fonte.stato)}</TableCell>
        <TableCell>
          <div className="flex space-x-1">
            {onEdit && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onEdit(fonte.id)}
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Modifica</span>
              </Button>
            )}
            
            {onDelete && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
                <span className="sr-only">Elimina</span>
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare la fonte "{fonte.nome}"? Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <FonteUrlEditor
        open={showUrlEditor}
        onOpenChange={setShowUrlEditor}
        currentUrl={fonte.url}
        onSave={handleSaveUrl}
      />
    </>
  );
};
