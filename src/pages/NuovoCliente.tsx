import React, { useState, useEffect } from 'react';
import { v4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { Cliente } from '@/types';
import provincePerRegione from '@/utils/provinceItaliane';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";

const NuovoCliente = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    nome: '',
    settore: '',
    regione: '',
    provincia: '',
    fatturato: 0,
    interessiSettoriali: [] as string[],
    dipendenti: 0,
    email: '',
    telefono: '',
    annoFondazione: 0,
    formaGiuridica: '',
    codiceATECO: '',
    esperienzaFinanziamenti: '',
    tecnologieSpecifiche: [] as string[],
    criteriESG: [] as string[],
    capacitaRD: '',
    presenzaInternazionale: '',
    faseDiCrescita: '',
    stabilitaFinanziaria: '',
    competenzeDipendenti: [] as string[],
    partnership: [] as string[],
    certificazioni: [] as string[],
  });
  
  // Available provinces based on selected region
  const [provincieDisponibili, setProvincieDisponibili] = useState<string[]>([]);

  useEffect(() => {
    // Update available provinces when region changes
    if (formData.regione && provincePerRegione[formData.regione]) {
      setProvincieDisponibili(provincePerRegione[formData.regione]);
      // Reset province selection if current province is not in the new region
      if (!provincePerRegione[formData.regione].includes(formData.provincia)) {
        setFormData(prevData => ({ ...prevData, provincia: '' }));
      }
    } else {
      setProvincieDisponibili([]);
    }
  }, [formData.regione]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [id]: value
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [id]: parseInt(value) || 0
    }));
  };

  const handleArrayChange = (id: string, value: string[]) => {
    setFormData(prevData => ({
      ...prevData,
      [id]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Errore",
        description: "Devi essere autenticato per creare un cliente.",
        variant: "destructive",
      });
      return;
    }

    const newCliente: Cliente = {
      id: v4(),
      nome: formData.nome,
      settore: formData.settore,
      regione: formData.regione,
      provincia: formData.provincia,
      fatturato: formData.fatturato,
      interessiSettoriali: formData.interessiSettoriali,
      dipendenti: formData.dipendenti,
      email: formData.email,
      telefono: formData.telefono || "",
      annoFondazione: formData.annoFondazione || 0,
      formaGiuridica: formData.formaGiuridica || "",
      codiceATECO: formData.codiceATECO || "",
      esperienzaFinanziamenti: formData.esperienzaFinanziamenti || "",
      tecnologieSpecifiche: formData.tecnologieSpecifiche || [],
      criteriESG: formData.criteriESG || [],
      capacitaRD: formData.capacitaRD || "",
      presenzaInternazionale: formData.presenzaInternazionale || "",
      faseDiCrescita: formData.faseDiCrescita || "",
      stabilitaFinanziaria: formData.stabilitaFinanziaria || "",
      competenzeDipendenti: formData.competenzeDipendenti || [],
      partnership: formData.partnership || [],
      certificazioni: formData.certificazioni || [],
      interessi: formData.interessiSettoriali || [],
      userId: user.id || ""
    };

    try {
      const response = await fetch('/api/clienti', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCliente),
      });

      if (response.ok) {
        toast({
          title: "Successo",
          description: "Cliente creato con successo!",
        });
        navigate('/app/clienti');
      } else {
        const errorData = await response.json();
        toast({
          title: "Errore",
          description: errorData.message || "Si è verificato un errore durante la creazione del cliente.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante la creazione del cliente.",
        variant: "destructive",
      });
    }
  };

  const settori = [
    "Agroalimentare",
    "Automotive",
    "Banche e Finanza",
    "Chimica",
    "Commercio",
    "Costruzioni",
    "Energia",
    "Farmaceutica",
    "GDO",
    "ICT",
    "Industria",
    "Logistica",
    "Marketing e Comunicazione",
    "Media",
    "Pubblica Amministrazione",
    "Retail",
    "Servizi",
    "Turismo",
    "Altro"
  ];
  
  // Get list of regions from the provinceItaliane.ts file
  const regioni = Object.keys(provincePerRegione).sort();
  
  // List of Italian legal business forms (forme giuridiche)
  const formeGiuridiche = [
    "Società per Azioni (S.p.A.)",
    "Società a Responsabilità Limitata (S.r.l.)",
    "Società in Accomandita per Azioni (S.a.p.a.)",
    "Società in Accomandita Semplice (S.a.s.)",
    "Società in Nome Collettivo (S.n.c.)",
    "Società Semplice (S.s.)",
    "Ditta Individuale",
    "Impresa Familiare",
    "Società Cooperativa",
    "Associazione",
    "Fondazione",
    "Consorzio",
    "Società Consortile",
    "Ente Pubblico",
    "Ente del Terzo Settore (ETS)",
    "Società Benefit",
    "Start-up Innovativa",
    "PMI Innovativa",
    "Altro"
  ];

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Nuovo Cliente</CardTitle>
          <CardDescription>Inserisci i dettagli del nuovo cliente.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome</Label>
              <Input type="text" id="nome" value={formData.nome} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input type="email" id="email" value={formData.email} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="telefono">Telefono</Label>
              <Input type="tel" id="telefono" value={formData.telefono} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="settore">Settore</Label>
              <Select 
                value={formData.settore} 
                onValueChange={(value) => setFormData(prevData => ({ ...prevData, settore: value }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleziona un settore" />
                </SelectTrigger>
                <SelectContent>
                  {settori.map((settore) => (
                    <SelectItem key={settore} value={settore}>{settore}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Regione dropdown */}
            <div>
              <Label htmlFor="regione">Regione</Label>
              <Select 
                value={formData.regione} 
                onValueChange={(value) => setFormData(prevData => ({ ...prevData, regione: value }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleziona una regione" />
                </SelectTrigger>
                <SelectContent>
                  {regioni.map((regione) => (
                    <SelectItem key={regione} value={regione}>{regione}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Provincia dropdown - only enabled if a region is selected */}
            <div>
              <Label htmlFor="provincia">Provincia</Label>
              <Select 
                value={formData.provincia} 
                onValueChange={(value) => setFormData(prevData => ({ ...prevData, provincia: value }))}
                disabled={!formData.regione}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={formData.regione ? "Seleziona una provincia" : "Prima seleziona una regione"} />
                </SelectTrigger>
                <SelectContent>
                  {provincieDisponibili.map((provincia) => (
                    <SelectItem key={provincia} value={provincia}>{provincia}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="fatturato">Fatturato</Label>
              <Input type="number" id="fatturato" value={formData.fatturato} onChange={handleNumberChange} />
            </div>
            <div>
              <Label htmlFor="dipendenti">Dipendenti</Label>
              <Input type="number" id="dipendenti" value={formData.dipendenti} onChange={handleNumberChange} />
            </div>
            <div>
              <Label htmlFor="annoFondazione">Anno di Fondazione</Label>
              <Input type="number" id="annoFondazione" value={formData.annoFondazione} onChange={handleNumberChange} />
            </div>
            
            {/* Forma Giuridica dropdown */}
            <div>
              <Label htmlFor="formaGiuridica">Forma Giuridica</Label>
              <Select 
                value={formData.formaGiuridica} 
                onValueChange={(value) => setFormData(prevData => ({ ...prevData, formaGiuridica: value }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleziona una forma giuridica" />
                </SelectTrigger>
                <SelectContent>
                  {formeGiuridiche.map((forma) => (
                    <SelectItem key={forma} value={forma}>{forma}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="codiceATECO">Codice ATECO</Label>
              <Input type="text" id="codiceATECO" value={formData.codiceATECO} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="esperienzaFinanziamenti">Esperienza Finanziamenti</Label>
              <Textarea id="esperienzaFinanziamenti" value={formData.esperienzaFinanziamenti} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="tecnologieSpecifiche">Tecnologie Specifiche (separate da virgola)</Label>
              <Input
                type="text"
                id="tecnologieSpecifiche"
                value={formData.tecnologieSpecifiche.join(', ')}
                onChange={(e) => handleArrayChange('tecnologieSpecifiche', e.target.value.split(',').map(item => item.trim()))}
              />
            </div>
            <div>
              <Label htmlFor="criteriESG">Criteri ESG (separate da virgola)</Label>
              <Input
                type="text"
                id="criteriESG"
                value={formData.criteriESG.join(', ')}
                onChange={(e) => handleArrayChange('criteriESG', e.target.value.split(',').map(item => item.trim()))}
              />
            </div>
            <div>
              <Label htmlFor="capacitaRD">Capacità R&D</Label>
              <Input type="text" id="capacitaRD" value={formData.capacitaRD} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="presenzaInternazionale">Presenza Internazionale</Label>
              <Input type="text" id="presenzaInternazionale" value={formData.presenzaInternazionale} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="faseDiCrescita">Fase di Crescita</Label>
              <Input type="text" id="faseDiCrescita" value={formData.faseDiCrescita} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="stabilitaFinanziaria">Stabilità Finanziaria</Label>
              <Input type="text" id="stabilitaFinanziaria" value={formData.stabilitaFinanziaria} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="competenzeDipendenti">Competenze Dipendenti (separate da virgola)</Label>
              <Input
                type="text"
                id="competenzeDipendenti"
                value={formData.competenzeDipendenti.join(', ')}
                onChange={(e) => handleArrayChange('competenzeDipendenti', e.target.value.split(',').map(item => item.trim()))}
              />
            </div>
            <div>
              <Label htmlFor="partnership">Partnership (separate da virgola)</Label>
              <Input
                type="text"
                id="partnership"
                value={formData.partnership.join(', ')}
                onChange={(e) => handleArrayChange('partnership', e.target.value.split(',').map(item => item.trim()))}
              />
            </div>
            <div>
              <Label htmlFor="certificazioni">Certificazioni (separate da virgola)</Label>
              <Input
                type="text"
                id="certificazioni"
                value={formData.certificazioni.join(', ')}
                onChange={(e) => handleArrayChange('certificazioni', e.target.value.split(',').map(item => item.trim()))}
              />
            </div>
            <Button type="submit">Crea Cliente</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NuovoCliente;
