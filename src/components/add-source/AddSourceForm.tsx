
import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Fonte } from '@/types';
import { SourceFormFields } from './SourceFormFields';

interface AddSourceFormProps {
  onAddSource: (newSource: Omit<Fonte, 'id'>) => Promise<boolean>;
}

const AddSourceForm: React.FC<AddSourceFormProps> = ({ onAddSource }) => {
  const [nome, setNome] = useState('');
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Assicurati che tutti i campi obbligatori siano compilati
      if (!nome || !url) {
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

      // Crea l'oggetto fonte con tipo predefinito
      const newSource: Omit<Fonte, 'id'> = {
        nome,
        url,
        tipo: 'sito_web'  // Valore predefinito, non più selezionabile
      };

      // Aggiungi la fonte
      const success = await onAddSource(newSource);
      
      if (success) {
        // Reset del form se il salvataggio è andato a buon fine
        setNome('');
        setUrl('');
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
      
      <SourceFormFields
        nome={nome}
        setNome={setNome}
        url={url}
        setUrl={setUrl}
      />
      
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Salvataggio...' : 'Salva Fonte'}
      </Button>
    </form>
  );
};

export default AddSourceForm;
