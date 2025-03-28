
import React, { useState } from 'react';
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
import { CloudIcon, FileSpreadsheet, HelpCircle, Link, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  const [updateSheetUrl, setUpdateSheetUrl] = useState(
    localStorage.getItem('googleSheetUpdateUrl') || ''
  );
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [connectionMessage, setConnectionMessage] = useState('');
  
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
  
  const testConnection = async () => {
    if (!updateSheetUrl) {
      setConnectionStatus('error');
      setConnectionMessage("Inserisci l'URL del Google Apps Script prima di testare la connessione");
      return;
    }
    
    setTestingConnection(true);
    setConnectionStatus('idle');
    
    try {
      // Invio di una richiesta di test al Google Apps Script
      const response = await fetch(updateSheetUrl, {
        method: 'GET',
        mode: 'no-cors', // Usa no-cors perché non possiamo leggere la risposta direttamente
      });
      
      // Poiché con no-cors non possiamo leggere la risposta,
      // assumiamo che se non ci sono errori la connessione funziona
      setConnectionStatus('success');
      setConnectionMessage('Connessione stabilita con successo! Lo script è raggiungibile.');
      
      toast({
        title: "Test completato",
        description: "La connessione con Google Apps Script è stata stabilita con successo",
      });
    } catch (error) {
      console.error("Errore nel test di connessione:", error);
      setConnectionStatus('error');
      setConnectionMessage("Impossibile connettersi allo script. Verifica che l'URL sia corretto e che lo script sia pubblicato come Web App con accesso 'Anyone, even anonymous'.");
      
      toast({
        title: "Errore di connessione",
        description: "Impossibile connettersi al Google Apps Script. Verifica l'URL e le impostazioni di pubblicazione.",
        variant: "destructive",
      });
    } finally {
      setTestingConnection(false);
    }
  };
  
  const openGoogleAppsScriptExample = () => {
    window.open('/docs/google-apps-script-example.js', '_blank');
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configura Google Sheets</DialogTitle>
          <DialogDescription>
            Inserisci l'URL del foglio Google Sheets per importare e sincronizzare le fonti.
            Il foglio deve contenere una scheda chiamata "Lista Fonti" con almeno le colonne "row_number", "url", "nome" e "tipo".
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
              Inserisci l'URL completo del foglio Google Sheets. Assicurati che il foglio contenga una scheda denominata "Lista Fonti" e che sia accessibile pubblicamente.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="updateSheetUrl" className="flex items-center">
              <CloudIcon className="h-4 w-4 mr-1" />
              URL per l'aggiornamento (Google Apps Script)
            </Label>
            <div className="flex space-x-2">
              <Input
                id="updateSheetUrl"
                value={updateSheetUrl}
                onChange={(e) => setUpdateSheetUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/..."
                className="flex-1"
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={testConnection}
                disabled={testingConnection}
                className="whitespace-nowrap"
              >
                {testingConnection ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <span>Test Connessione</span>
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Per poter aggiungere fonti al foglio, inserisci l'URL del Web App di Google Apps Script. Se non lo hai, dovrai creare uno script e pubblicarlo come webapp.
            </p>
          </div>

          {connectionStatus === 'success' && (
            <Alert variant="default" className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle>Connessione stabilita</AlertTitle>
              <AlertDescription>{connectionMessage}</AlertDescription>
            </Alert>
          )}

          {connectionStatus === 'error' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Errore di connessione</AlertTitle>
              <AlertDescription>{connectionMessage}</AlertDescription>
            </Alert>
          )}

          <Alert variant="default" className="bg-blue-50 border-blue-200">
            <AlertTitle className="flex items-center">
              <HelpCircle className="h-4 w-4 mr-1" />
              Come configurare
            </AlertTitle>
            <AlertDescription className="text-xs space-y-2">
              <ol className="list-decimal pl-5 space-y-1">
                <li>Assicurati che il tuo foglio Google abbia una scheda chiamata "Lista Fonti"</li>
                <li>Nella prima riga inserisci queste intestazioni: <strong>row_number, url, nome, tipo</strong> (opzionalmente: stato_elaborazione, data_ultimo_aggiornamento)</li>
                <li>Crea uno script Google Apps Script usando il codice di esempio</li>
                <li>Pubblica lo script come Web App (accesso "Anyone, even anonymous")</li>
                <li>Copia l'URL generato nel campo "URL per l'aggiornamento"</li>
              </ol>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 text-xs flex items-center"
                onClick={openGoogleAppsScriptExample}
              >
                <Link className="h-3 w-3 mr-1" />
                Visualizza esempio Google Apps Script
              </Button>
            </AlertDescription>
          </Alert>
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
