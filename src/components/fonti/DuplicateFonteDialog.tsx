
import React from 'react';
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
import { AlertTriangle } from 'lucide-react';

interface DuplicateFonteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  duplicateUrl: string;
  existingFonteName: string;
}

export const DuplicateFonteDialog: React.FC<DuplicateFonteDialogProps> = ({
  open,
  onOpenChange,
  duplicateUrl,
  existingFonteName
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <span>URL duplicato rilevato</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              L'URL <span className="font-mono text-sm bg-slate-100 px-1 py-0.5 rounded">{duplicateUrl}</span> è già presente nel sistema.
            </p>
            <p>
              Questa fonte è già configurata con il nome <span className="font-semibold">{existingFonteName}</span>.
            </p>
            <p>
              Non è possibile aggiungere fonti duplicate. Modifica l'URL o utilizza la fonte esistente.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Chiudi</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
