
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Fonte } from '@/types';
import { SourceFormFields } from './SourceFormFields';
import { GoogleSheetsToggle } from './GoogleSheetsToggle';
import { SubmitButton } from './SubmitButton';
import { useToast } from '@/components/ui/use-toast';
import GoogleSheetsService from '@/utils/GoogleSheetsService';

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
        await handleAddToGoogleSheet(newFonte);
      }
      
      // Reset form
      setNome('');
      setUrl('');
      setTipo('');
      setAddToGoogleSheet(false);
      
      toast({
        title: "Fonte aggiunta",
        description: "La fonte è stata aggiunta con successo",
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
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddToGoogleSheet = async (newFonte: Omit<Fonte, 'id'>) => {
    const sheetUrl = localStorage.getItem('googleSheetUrl');
    if (!sheetUrl) {
      toast({
        title: "Google Sheet non configurato",
        description: "Configura prima l'URL del foglio Google dalla pagina Fonti",
        variant: "default",
      });
      return false;
    } 
    
    try {
      console.log("Aggiunta fonte al foglio Google:", newFonte);
      
      // We need a temporary ID here that will be replaced with a proper UUID
      const fonte: Fonte = {
        id: 'temp-' + Date.now(),
        ...newFonte
      };
      
      const result = await GoogleSheetsService.updateFonteInSheet(fonte);
      
      if (result) {
        toast({
          title: "Fonte aggiunta al foglio Google",
          description: "La fonte è stata aggiunta con successo anche al foglio Google Sheets",
        });
        return true;
      } else {
        toast({
          title: "Attenzione",
          description: "La fonte è stata salvata localmente ma non sul foglio Google Sheets",
          variant: "default",
        });
        return false;
      }
    } catch (error) {
      console.error("Errore nell'aggiunta al foglio Google:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore nell'aggiunta della fonte al foglio Google",
        variant: "destructive",
      });
      return false;
    }
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
          
          <SubmitButton isAdding={isAdding} />
        </form>
      </CardContent>
    </Card>
  );
};

export default AddSourceForm;
