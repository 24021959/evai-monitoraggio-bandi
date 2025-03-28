
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Fonte, TipoBando } from "@/types";
import { Save, FileSpreadsheet } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import GoogleSheetsService from '@/utils/GoogleSheetsService';

interface AddSourceFormProps {
  onAddSource: (fonte: Omit<Fonte, 'id'>) => void;
}

const AddSourceForm: React.FC<AddSourceFormProps> = ({ onAddSource }) => {
  const { toast } = useToast();
  const [nome, setNome] = useState('');
  const [url, setUrl] = useState('');
  const [tipo, setTipo] = useState<TipoBando | ''>('');
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
      tipo: tipo as TipoBando,
      stato: 'attivo'
    };
    
    setIsAdding(true);
    
    try {
      // Add to Supabase
      onAddSource(newFonte);
      
      // Add to Google Sheet if enabled
      if (addToGoogleSheet) {
        const sheetUrl = localStorage.getItem('googleSheetUrl');
        if (!sheetUrl) {
          toast({
            title: "Google Sheet non configurato",
            description: "Configura prima l'URL del foglio Google dalla pagina Fonti",
            variant: "default",
          });
        } else {
          try {
            const tempId = `temp-${Date.now()}`;
            const result = await GoogleSheetsService.updateFonteInSheet({
              id: tempId,
              ...newFonte
            });
            
            if (result) {
              toast({
                title: "Fonte aggiunta al foglio Google",
                description: "La fonte è stata aggiunta con successo anche al foglio Google Sheets",
              });
            } else {
              toast({
                title: "Attenzione",
                description: "La fonte è stata salvata localmente ma non sul foglio Google Sheets",
                variant: "default",
              });
            }
          } catch (error) {
            console.error("Errore nell'aggiunta al foglio Google:", error);
            toast({
              title: "Errore",
              description: "Si è verificato un errore nell'aggiunta della fonte al foglio Google",
              variant: "destructive",
            });
          }
        }
      }
    } catch (error) {
      console.error("Errore durante il salvataggio:", error);
    } finally {
      // Reset form
      setNome('');
      setUrl('');
      setTipo('');
      setAddToGoogleSheet(false);
      setIsAdding(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Aggiungi Nuova Fonte</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Fonte</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="es. Ministero Sviluppo Economico"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="url">URL Fonte</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://esempio.gov.it/bandi"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo Fonte</Label>
            <Select value={tipo} onValueChange={setTipo as (value: string) => void} required>
              <SelectTrigger id="tipo">
                <SelectValue placeholder="Seleziona tipo fonte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="europeo">Bandi Europei</SelectItem>
                <SelectItem value="statale">Bandi Statali</SelectItem>
                <SelectItem value="regionale">Bandi Regionali</SelectItem>
                <SelectItem value="altro">Altra Tipologia</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2 my-4">
            <Switch 
              id="add-to-sheet"
              checked={addToGoogleSheet}
              onCheckedChange={setAddToGoogleSheet}
            />
            <Label htmlFor="add-to-sheet" className="flex items-center cursor-pointer">
              <FileSpreadsheet className="h-4 w-4 mr-1 text-green-600" />
              Aggiungi anche al foglio Google Sheets
            </Label>
          </div>
          
          <Button 
            type="submit" 
            className="w-full flex items-center justify-center gap-2"
            disabled={isAdding}
          >
            {isAdding ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-t-transparent border-current rounded-full"></span>
                Salvataggio...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salva Fonte
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddSourceForm;
