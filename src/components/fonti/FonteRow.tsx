
import React, { useState } from 'react';
import { Fonte } from '@/types';
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Trash2, Link } from 'lucide-react';
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
  onDelete?: (id: string) => void;
  onEditUrl: (id: string) => void;
  onSaveUrl: (fonte: Fonte, newUrl: string) => Promise<boolean>;
}

export const FonteRow: React.FC<FonteRowProps> = ({ 
  fonte, 
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
        <TableCell>
          <div className="flex space-x-1">
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
