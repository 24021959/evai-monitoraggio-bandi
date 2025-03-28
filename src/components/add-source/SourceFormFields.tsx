
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SourceFormFieldsProps {
  nome: string;
  setNome: (value: string) => void;
  url: string;
  setUrl: (value: string) => void;
  tipo: string;
  setTipo: (value: string) => void;
}

export const SourceFormFields: React.FC<SourceFormFieldsProps> = ({
  nome,
  setNome,
  url,
  setUrl,
  tipo,
  setTipo
}) => {
  return (
    <>
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
    </>
  );
};
