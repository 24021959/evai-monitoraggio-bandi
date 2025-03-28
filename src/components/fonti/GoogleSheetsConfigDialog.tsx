
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from "@/components/ui/use-toast";

interface GoogleSheetsConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  googleSheetUrl: string;
  setGoogleSheetUrl: (url: string) => void;
}

export const GoogleSheetsConfigDialog: React.FC<GoogleSheetsConfigDialogProps> = ({
  open,
  onOpenChange,
  googleSheetUrl,
  setGoogleSheetUrl
}) => {
  const { toast } = useToast();

  const saveGoogleSheetUrl = () => {
    localStorage.setItem('googleSheetUrl', googleSheetUrl);
    onOpenChange(false);
    toast({
      title: "URL salvato",
      description: "L'URL del foglio Google è stato salvato",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configura Google Sheets</DialogTitle>
          <DialogDescription>
            Inserisci l'URL del foglio Google Sheets che contiene le fonti da importare e sincronizzare.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="sheet-url" className="text-sm font-medium">URL del foglio Google</label>
            <Input
              id="sheet-url"
              value={googleSheetUrl}
              onChange={(e) => setGoogleSheetUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/1E4ZR9tgeBZV545JJuduvWHtlRqo5GyW_woBXt8ooQ8E/edit"
            />
            <p className="text-xs text-gray-500">
              Esempio: https://docs.google.com/spreadsheets/d/1E4ZR9tgeBZV545JJuduvWHtlRqo5GyW_woBXt8ooQ8E/edit
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annulla</Button>
          <Button onClick={saveGoogleSheetUrl}>Salva</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
