
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SourceFormFieldsProps {
  nome: string;
  setNome: (value: string) => void;
  url: string;
  setUrl: (value: string) => void;
}

export const SourceFormFields: React.FC<SourceFormFieldsProps> = ({
  nome,
  setNome,
  url,
  setUrl
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
    </>
  );
};
