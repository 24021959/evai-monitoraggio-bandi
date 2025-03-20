
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
import { Fonte } from "@/types";

interface AddSourceFormProps {
  onAddSource: (fonte: Omit<Fonte, 'id'>) => void;
}

const AddSourceForm: React.FC<AddSourceFormProps> = ({ onAddSource }) => {
  const { toast } = useToast();
  const [nome, setNome] = useState('');
  const [url, setUrl] = useState('');
  const [tipo, setTipo] = useState<string>('');
  
  const handleSubmit = (e: React.FormEvent) => {
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
    
    onAddSource({
      nome,
      url,
      tipo,
      stato: 'attivo'
    });
    
    // Reset form
    setNome('');
    setUrl('');
    setTipo('');
    
    toast({
      title: "Fonte aggiunta",
      description: "La nuova fonte è stata aggiunta con successo",
      duration: 3000,
    });
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
            <Select value={tipo} onValueChange={setTipo} required>
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
          
          <Button type="submit" className="w-full">Aggiungi Fonte</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddSourceForm;
