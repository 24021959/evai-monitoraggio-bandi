
import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import GoogleSheetsService from '@/utils/GoogleSheetsService';
import { CloudIcon, FileSpreadsheet } from 'lucide-react';

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
  setGoogleSheetUrl,
}) => {
  const { toast } = useToast();
  const [updateSheetUrl, setUpdateSheetUrl] = React.useState(
    localStorage.getItem('googleSheetUpdateUrl') || ''
  );
  
  const handleSave = () => {
    if (!googleSheetUrl) {
      toast({
        title: "URL mancante",
        description: "Inserisci l'URL del foglio Google Sheets",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Salva l'URL del foglio Google in localStorage
      GoogleSheetsService.setSheetUrl(googleSheetUrl);
      
      // Salva anche l'URL per l'aggiornamento, se presente
      if (updateSheetUrl) {
        localStorage.setItem('googleSheetUpdateUrl', updateSheetUrl);
      }
      
      toast({
        title: "Configurazione salvata",
        description: "La configurazione di Google Sheets è stata salvata con successo",
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il salvataggio della configurazione",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configura Google Sheets</DialogTitle>
          <DialogDescription>
            Inserisci l'URL del foglio Google Sheets per importare e sincronizzare le fonti.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="googleSheetUrl" className="flex items-center">
              <FileSpreadsheet className="h-4 w-4 mr-1" />
              URL del foglio Google
            </Label>
            <Input
              id="googleSheetUrl"
              value={googleSheetUrl}
              onChange={(e) => setGoogleSheetUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
            />
            <p className="text-xs text-gray-500">
              Inserisci l'URL completo del foglio Google Sheets. Assicurati che il foglio sia accessibile pubblicamente o condiviso con l'account che utilizzi.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="updateSheetUrl" className="flex items-center">
              <CloudIcon className="h-4 w-4 mr-1" />
              URL per l'aggiornamento (Google Apps Script)
            </Label>
            <Input
              id="updateSheetUrl"
              value={updateSheetUrl}
              onChange={(e) => setUpdateSheetUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/..."
            />
            <p className="text-xs text-gray-500">
              Per poter aggiungere fonti al foglio, inserisci l'URL del Web App di Google Apps Script. Se non lo hai, dovrai creare uno script e pubblicarlo come webapp.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annulla
          </Button>
          <Button onClick={handleSave}>
            Salva Configurazione
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
