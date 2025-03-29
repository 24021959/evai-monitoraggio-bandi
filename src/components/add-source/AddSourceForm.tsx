
import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Fonte } from '@/types';

interface AddSourceFormProps {
  onAddSource: (newSource: Omit<Fonte, 'id'>) => Promise<boolean>;
}

const AddSourceForm: React.FC<AddSourceFormProps> = ({ onAddSource }) => {
  const [nome, setNome] = useState('');
  const [url, setUrl] = useState('');
  const [tipo, setTipo] = useState('sito_web');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Assicurati che tutti i campi obbligatori siano compilati
      if (!nome || !url || !tipo) {
        setError('Tutti i campi obbligatori devono essere compilati');
        setIsSubmitting(false);
        return;
      }

      // Controlla se l'URL è valido
      try {
        new URL(url);
      } catch (e) {
        setError('L\'URL inserito non è valido. Assicurati di includere http:// o https://');
        setIsSubmitting(false);
        return;
      }

      // Crea l'oggetto fonte
      const newSource: Omit<Fonte, 'id'> = {
        nome,
        url,
        tipo
      };

      // Aggiungi la fonte
      const success = await onAddSource(newSource);
      
      if (success) {
        // Reset del form se il salvataggio è andato a buon fine
        setNome('');
        setUrl('');
        setTipo('sito_web');
        setIsSubmitting(false);
        
        // Mostra un messaggio di successo
        toast({
          title: "Fonte aggiunta",
          description: "La fonte è stata aggiunta con successo",
        });
      } else {
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Errore durante il salvataggio della fonte:', error);
      setError('Si è verificato un errore durante il salvataggio della fonte');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500">{error}</div>}
      
      <div>
        <Label htmlFor="nome">Nome</Label>
        <Input 
          type="text" 
          id="nome" 
          value={nome} 
          onChange={(e) => setNome(e.target.value)} 
        />
      </div>
      
      <div>
        <Label htmlFor="url">URL</Label>
        <Input 
          type="text" 
          id="url" 
          value={url} 
          onChange={(e) => setUrl(e.target.value)} 
        />
      </div>
      
      <div>
        <Label htmlFor="tipo">Tipo</Label>
        <Select value={tipo} onValueChange={setTipo}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleziona un tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sito_web">Sito Web</SelectItem>
            <SelectItem value="rss">RSS Feed</SelectItem>
            <SelectItem value="api">API</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Salvataggio...' : 'Salva Fonte'}
      </Button>
    </form>
  );
};

export default AddSourceForm;
