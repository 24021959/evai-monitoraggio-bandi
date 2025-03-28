
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from "@/components/ui/use-toast";

interface UpdateSheetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  updateSheetUrl: string;
  setUpdateSheetUrl: (url: string) => void;
}

export const UpdateSheetDialog: React.FC<UpdateSheetDialogProps> = ({
  open,
  onOpenChange,
  updateSheetUrl,
  setUpdateSheetUrl
}) => {
  const { toast } = useToast();

  const saveUpdateSheetUrl = () => {
    localStorage.setItem('googleSheetUpdateUrl', updateSheetUrl);
    onOpenChange(false);
    toast({
      title: "URL salvato",
      description: "L'URL per l'aggiornamento del foglio Google è stato salvato",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configura URL per l'aggiornamento del foglio Google</DialogTitle>
          <DialogDescription>
            Per sincronizzare le modifiche con il foglio Google Sheets, inserisci l'URL del tuo Google Apps Script Web App che può aggiornare il foglio.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="update-url" className="text-sm font-medium">URL del Web App</label>
            <Input
              id="update-url"
              value={updateSheetUrl}
              onChange={(e) => setUpdateSheetUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/your-script-id/exec"
            />
            <p className="text-xs text-gray-500">
              Nota: Dovrai creare un Google Apps Script Web App con le autorizzazioni appropriate per modificare il tuo foglio.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annulla</Button>
          <Button onClick={saveUpdateSheetUrl}>Salva</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
