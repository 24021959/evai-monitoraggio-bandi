
import React, { useState, useEffect } from 'react';
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
import { Save } from 'lucide-react';
import WebhookService from '@/utils/WebhookService';

interface EditSourceFormProps {
  fonte: Fonte;
  onSave: (updatedFonte: Fonte) => void;
  onCancel: () => void;
}

const EditSourceForm: React.FC<EditSourceFormProps> = ({ fonte, onSave, onCancel }) => {
  const { toast } = useToast();
  const [nome, setNome] = useState(fonte.nome);
  const [url, setUrl] = useState(fonte.url);
  const [tipo, setTipo] = useState<TipoBando>(fonte.tipo);
  const [stato, setStato] = useState<'attivo' | 'inattivo'>(
    fonte.stato === 'test' ? 'attivo' : fonte.stato
  );
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    // Aggiorna il form quando cambia la fonte selezionata
    setNome(fonte.nome);
    setUrl(fonte.url);
    setTipo(fonte.tipo);
    setStato(fonte.stato === 'test' ? 'attivo' : fonte.stato);
  }, [fonte]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
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
      
      const updatedFonte: Fonte = {
        ...fonte,
        nome,
        url,
        tipo,
        stato
      };
      
      // Verifica se l'integrazione n8n è configurata
      const webhookUrl = localStorage.getItem('n8nWebhookUrl');
      
      if (webhookUrl) {
        try {
          console.log("Tentativo di aggiornare fonte tramite webhook:", updatedFonte);
          const webhookSuccess = await WebhookService.sendToWebhook(updatedFonte, 'update');
          
          if (!webhookSuccess) {
            console.warn("L'aggiornamento è stato eseguito localmente ma l'invio a n8n potrebbe non essere riuscito");
            toast({
              title: "Attenzione",
              description: "La fonte è stata aggiornata ma potrebbero esserci problemi con la sincronizzazione n8n",
              variant: "default",
              duration: 5000,
            });
          }
        } catch (webhookError) {
          console.error("Errore durante la notifica n8n:", webhookError);
          toast({
            title: "Attenzione",
            description: "Fonte aggiornata localmente ma si è verificato un errore nella sincronizzazione con n8n",
            variant: "default",
            duration: 5000,
          });
        }
      }
      
      onSave(updatedFonte);
      
      toast({
        title: "Fonte aggiornata",
        description: "La fonte è stata aggiornata con successo",
        duration: 3000,
      });
    } catch (error) {
      console.error("Errore durante l'aggiornamento:", error);
      toast({
        title: "Errore di sistema",
        description: "Si è verificato un errore durante l'aggiornamento",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Modifica Fonte</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome-edit">Nome Fonte</Label>
            <Input
              id="nome-edit"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="es. Ministero Sviluppo Economico"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="url-edit">URL Fonte</Label>
            <Input
              id="url-edit"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://esempio.gov.it/bandi"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tipo-edit">Tipo Fonte</Label>
            <Select 
              value={tipo} 
              onValueChange={(value: string) => setTipo(value as TipoBando)}
              required
            >
              <SelectTrigger id="tipo-edit">
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
          
          <div className="space-y-2">
            <Label htmlFor="stato-edit">Stato</Label>
            <Select 
              value={stato} 
              onValueChange={(value: string) => setStato(value as 'attivo' | 'inattivo')}
              required
            >
              <SelectTrigger id="stato-edit">
                <SelectValue placeholder="Seleziona stato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="attivo">Attivo</SelectItem>
                <SelectItem value="inattivo">Inattivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-between gap-4 mt-6">
            <Button type="button" variant="outline" onClick={onCancel} className="w-1/2" disabled={isSaving}>
              Annulla
            </Button>
            <Button type="submit" className="w-1/2 flex items-center justify-center gap-2" disabled={isSaving}>
              <Save className="w-4 h-4" />
              {isSaving ? 'Salvataggio...' : 'Salva Modifiche'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EditSourceForm;
