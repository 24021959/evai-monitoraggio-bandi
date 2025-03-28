
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Fonte } from '@/types';
import { SourceFormFields } from './SourceFormFields';
import { GoogleSheetsToggle } from './GoogleSheetsToggle';
import { SubmitButton } from './SubmitButton';
import { useToast } from '@/components/ui/use-toast';
import GoogleSheetsService from '@/utils/GoogleSheetsService';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface AddSourceFormProps {
  onAddSource: (fonte: Omit<Fonte, 'id'>) => void;
}

const AddSourceForm: React.FC<AddSourceFormProps> = ({ onAddSource }) => {
  const { toast } = useToast();
  const [nome, setNome] = useState('');
  const [url, setUrl] = useState('');
  const [tipo, setTipo] = useState<string>('');
  const [addToGoogleSheet, setAddToGoogleSheet] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [googleSheetsStatus, setGoogleSheetsStatus] = useState<'idle' | 'adding' | 'success' | 'error'>('idle');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome || !url || !tipo) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi richiesti",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    // Validazione URL
    try {
      new URL(url);
    } catch (err) {
      toast({
        title: "URL non valido",
        description: "Inserisci un URL nel formato corretto",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    const newFonte: Omit<Fonte, 'id'> = {
      nome,
      url,
      tipo: tipo as any,
      stato: 'attivo'
    };
    
    setIsAdding(true);
    
    try {
      console.log("Aggiunta fonte a Supabase:", newFonte);
      
      // Add to Supabase
      await onAddSource(newFonte);
      
      // Add to Google Sheet if enabled
      if (addToGoogleSheet) {
        setGoogleSheetsStatus('adding');
        try {
          const sheetSuccess = await handleAddToGoogleSheet(newFonte);
          setGoogleSheetsStatus(sheetSuccess ? 'success' : 'error');
          
          if (!sheetSuccess) {
            toast({
              title: "Attenzione",
              description: "La fonte è stata salvata nel database ma non nel foglio Google. Controlla la configurazione del foglio.",
              variant: "default",
            });
          }
        } catch (sheetError) {
          console.error("Errore specifico di Google Sheets:", sheetError);
          setGoogleSheetsStatus('error');
          toast({
            title: "Errore Google Sheets",
            description: "Si è verificato un errore nell'aggiunta al foglio Google. La fonte è stata salvata solo localmente.",
            variant: "destructive",
          });
        }
      }
      
      // Reset form only on success
      setNome('');
      setUrl('');
      setTipo('');
      setAddToGoogleSheet(false);
      
      toast({
        title: "Fonte aggiunta",
        description: "La fonte è stata aggiunta con successo al database",
        duration: 3000,
      });
    } catch (error) {
      console.error("Errore durante il salvataggio:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il salvataggio della fonte",
        variant: "destructive",
        duration: 3000,
      });
      if (addToGoogleSheet) {
        setGoogleSheetsStatus('error');
      }
    } finally {
      setIsAdding(false);
      // Reset dello stato Google Sheets dopo 5 secondi
      if (googleSheetsStatus !== 'idle') {
        setTimeout(() => setGoogleSheetsStatus('idle'), 5000);
      }
    }
  };

  const handleAddToGoogleSheet = async (newFonte: Omit<Fonte, 'id'>): Promise<boolean> => {
    const sheetUrl = localStorage.getItem('googleSheetUrl');
    const updateUrl = localStorage.getItem('googleSheetUpdateUrl');
    
    if (!sheetUrl) {
      throw new Error("URL del foglio Google non configurato");
    }
    
    if (!updateUrl) {
      throw new Error("URL per l'aggiornamento del foglio non configurato");
    }
    
    console.log("Configurazione Google Sheets:", { sheetUrl, updateUrl });
    console.log("Aggiunta fonte al foglio Google:", newFonte);
    
    // We need a temporary ID here that will be replaced with a proper UUID
    const fonte: Fonte = {
      id: 'temp-' + Date.now(),
      ...newFonte
    };
    
    // Tentativo di aggiunta al foglio
    console.log("Chiamata a GoogleSheetsService.updateFonteInSheet con:", fonte);
    const result = await GoogleSheetsService.updateFonteInSheet(fonte);
    
    console.log("Risultato dell'aggiunta al foglio Google:", result);
    
    if (result) {
      toast({
        title: "Fonte aggiunta al foglio Google",
        description: "La fonte è stata aggiunta con successo anche al foglio Google Sheets",
      });
      return true;
    }
    
    return false;
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Aggiungi Nuova Fonte</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <SourceFormFields
            nome={nome}
            setNome={setNome}
            url={url}
            setUrl={setUrl}
            tipo={tipo}
            setTipo={setTipo as (value: string) => void}
          />
          
          <GoogleSheetsToggle
            checked={addToGoogleSheet}
            onCheckedChange={setAddToGoogleSheet}
          />
          
          {googleSheetsStatus === 'adding' && (
            <div className="flex items-center space-x-2 text-yellow-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Aggiunta al foglio Google in corso...</span>
            </div>
          )}
          
          {googleSheetsStatus === 'success' && (
            <Alert variant="default" className="bg-green-50 border-green-200">
              <AlertTitle>Successo</AlertTitle>
              <AlertDescription>
                La fonte è stata aggiunta con successo al foglio Google Sheets.
              </AlertDescription>
            </Alert>
          )}
          
          {googleSheetsStatus === 'error' && (
            <Alert variant="destructive">
              <AlertTitle>Errore</AlertTitle>
              <AlertDescription>
                Si è verificato un errore durante l'aggiunta della fonte al foglio Google Sheets.
                Verifica di aver configurato correttamente sia l'URL del foglio che l'URL di aggiornamento,
                e che il foglio contenga le intestazioni corrette nella prima riga: row_number, url, nome, tipo.
              </AlertDescription>
            </Alert>
          )}
          
          <SubmitButton isAdding={isAdding} />
        </form>
      </CardContent>
    </Card>
  );
};

export default AddSourceForm;
