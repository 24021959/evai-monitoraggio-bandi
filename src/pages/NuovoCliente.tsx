
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
    annoFondazione: new Date().getFullYear() - 5, // Default to 5 years ago
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
  
  // Fasi di crescita aziendale
  const fasiCrescita = [
    "Startup (0-3 anni)",
    "Early Stage (3-5 anni)",
    "Scale-up (5-10 anni)",
    "Growth (10-20 anni)",
    "Matura (20+ anni)"
  ];
  
  // Livelli di esperienza finanziamenti
  const livelliEsperienzaFinanziamenti = [
    "Nessuna esperienza precedente",
    "Esperienza limitata (1-2 progetti)",
    "Esperienza media (3-5 progetti)",
    "Esperienza consolidata (6+ progetti)",
    "Team dedicato alla ricerca finanziamenti"
  ];
  
  // Livelli stabilità finanziaria
  const livelliStabilita = [
    "In fase di avvio",
    "In crescita con supporto di investitori",
    "Break-even",
    "Redditività stabile",
    "Alta redditività e liquidità"
  ];

  return (
    <div className="container mx-auto py-8 animate-fade-in">
      <div className="max-w-5xl mx-auto">
        <Card className="border-t-4 border-t-blue-500 shadow-md">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-white">
            <CardTitle className="text-2xl text-blue-700">Nuovo Cliente</CardTitle>
            <CardDescription className="text-blue-600">Inserisci i dettagli del nuovo cliente per creare una scheda completa.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="col-span-2">
                  <h2 className="text-lg font-medium mb-2 border-b border-blue-100 pb-2 text-blue-800">
                    Informazioni di Base
                  </h2>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nome" className="text-gray-700">Nome Azienda *</Label>
                  <Input 
                    type="text" 
                    id="nome" 
                    value={formData.nome} 
                    onChange={handleChange} 
                    required 
                    className="border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">Email *</Label>
                  <Input 
                    type="email" 
                    id="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    required 
                    className="border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono" className="text-gray-700">Telefono</Label>
                  <Input 
                    type="tel" 
                    id="telefono" 
                    value={formData.telefono} 
                    onChange={handleChange} 
                    className="border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="settore" className="text-gray-700">Settore Principale *</Label>
                  <Select 
                    value={formData.settore} 
                    onValueChange={(value) => setFormData(prevData => ({ ...prevData, settore: value }))}
                    required
                  >
                    <SelectTrigger className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all">
                      <SelectValue placeholder="Seleziona un settore" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {settori.map((settore) => (
                        <SelectItem key={settore} value={settore}>{settore}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interessiSettoriali" className="text-gray-700">Interessi Settoriali (separati da virgola) *</Label>
                  <Input
                    id="interessiSettoriali"
                    value={formData.interessiSettoriali.join(', ')}
                    onChange={(e) => handleArrayChange('interessiSettoriali', e.target.value.split(',').map(item => item.trim()))}
                    placeholder="Es: Digitale, Energia, Innovazione, Sostenibilità"
                    required
                    className="border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-blue-50 p-6 rounded-lg">
                <div className="col-span-2">
                  <h2 className="text-lg font-medium mb-2 border-b border-blue-200 pb-2 text-blue-800">
                    Localizzazione
                  </h2>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regione" className="text-gray-700">Regione *</Label>
                  <Select 
                    value={formData.regione} 
                    onValueChange={(value) => setFormData(prevData => ({ ...prevData, regione: value }))}
                    required
                  >
                    <SelectTrigger className="w-full bg-white border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all">
                      <SelectValue placeholder="Seleziona una regione" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {regioni.map((regione) => (
                        <SelectItem key={regione} value={regione}>{regione}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="provincia" className="text-gray-700">Provincia *</Label>
                  <Select 
                    value={formData.provincia} 
                    onValueChange={(value) => setFormData(prevData => ({ ...prevData, provincia: value }))}
                    disabled={!formData.regione}
                    required
                  >
                    <SelectTrigger className="w-full bg-white border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all">
                      <SelectValue placeholder={formData.regione ? "Seleziona una provincia" : "Prima seleziona una regione"} />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {provincieDisponibili.map((provincia) => (
                        <SelectItem key={provincia} value={provincia}>{provincia}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="col-span-2">
                  <h2 className="text-lg font-medium mb-2 border-b border-blue-100 pb-2 text-blue-800">
                    Informazioni Aziendali
                  </h2>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fatturato" className="text-gray-700">Fatturato annuale (€) *</Label>
                  <Input 
                    type="number" 
                    id="fatturato" 
                    value={formData.fatturato} 
                    onChange={handleNumberChange} 
                    required 
                    className="border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dipendenti" className="text-gray-700">Numero Dipendenti *</Label>
                  <Input 
                    type="number" 
                    id="dipendenti" 
                    value={formData.dipendenti} 
                    onChange={handleNumberChange} 
                    required 
                    className="border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="annoFondazione" className="text-gray-700">Anno di Fondazione</Label>
                  <Input 
                    type="number" 
                    id="annoFondazione" 
                    value={formData.annoFondazione} 
                    onChange={handleNumberChange} 
                    max={new Date().getFullYear()} 
                    className="border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="formaGiuridica" className="text-gray-700">Forma Giuridica</Label>
                  <Select 
                    value={formData.formaGiuridica} 
                    onValueChange={(value) => setFormData(prevData => ({ ...prevData, formaGiuridica: value }))}
                  >
                    <SelectTrigger className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all">
                      <SelectValue placeholder="Seleziona una forma giuridica" />
                    </SelectTrigger>
                    <SelectContent className="bg-white max-h-[300px]">
                      {formeGiuridiche.map((forma) => (
                        <SelectItem key={forma} value={forma}>{forma}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="codiceATECO" className="text-gray-700">Codice ATECO</Label>
                  <Input 
                    type="text" 
                    id="codiceATECO" 
                    value={formData.codiceATECO} 
                    onChange={handleChange} 
                    placeholder="Es: C.25.62" 
                    className="border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="faseDiCrescita" className="text-gray-700">Fase di Crescita</Label>
                  <Select 
                    value={formData.faseDiCrescita} 
                    onValueChange={(value) => setFormData(prevData => ({ ...prevData, faseDiCrescita: value }))}
                  >
                    <SelectTrigger className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all">
                      <SelectValue placeholder="Seleziona fase di crescita" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {fasiCrescita.map((fase) => (
                        <SelectItem key={fase} value={fase}>{fase}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-blue-50 p-6 rounded-lg">
                <div className="col-span-2">
                  <h2 className="text-lg font-medium mb-2 border-b border-blue-200 pb-2 text-blue-800">
                    Elementi di Valutazione per Finanziamenti
                  </h2>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="esperienzaFinanziamenti" className="text-gray-700">Esperienza Pregressa con Finanziamenti</Label>
                  <Select 
                    value={formData.esperienzaFinanziamenti} 
                    onValueChange={(value) => setFormData(prevData => ({ ...prevData, esperienzaFinanziamenti: value }))}
                  >
                    <SelectTrigger className="w-full bg-white border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all">
                      <SelectValue placeholder="Seleziona livello di esperienza" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {livelliEsperienzaFinanziamenti.map((livello) => (
                        <SelectItem key={livello} value={livello}>{livello}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stabilitaFinanziaria" className="text-gray-700">Stabilità Finanziaria</Label>
                  <Select 
                    value={formData.stabilitaFinanziaria} 
                    onValueChange={(value) => setFormData(prevData => ({ ...prevData, stabilitaFinanziaria: value }))}
                  >
                    <SelectTrigger className="w-full bg-white border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all">
                      <SelectValue placeholder="Seleziona stato finanziario" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {livelliStabilita.map((livello) => (
                        <SelectItem key={livello} value={livello}>{livello}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacitaRD" className="text-gray-700">Capacità R&D</Label>
                  <Textarea 
                    id="capacitaRD" 
                    name="capacitaRD"
                    value={formData.capacitaRD} 
                    onChange={handleChange} 
                    placeholder="Descrivi brevemente le capacità di ricerca e sviluppo" 
                    className="border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all min-h-[100px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="presenzaInternazionale" className="text-gray-700">Presenza Internazionale</Label>
                  <Textarea 
                    id="presenzaInternazionale" 
                    name="presenzaInternazionale"
                    value={formData.presenzaInternazionale} 
                    onChange={handleChange} 
                    placeholder="Descrivi la presenza sui mercati esteri" 
                    className="border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all min-h-[100px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tecnologieSpecifiche" className="text-gray-700">Tecnologie Specifiche (separate da virgola)</Label>
                  <Input
                    type="text"
                    id="tecnologieSpecifiche"
                    value={formData.tecnologieSpecifiche.join(', ')}
                    onChange={(e) => handleArrayChange('tecnologieSpecifiche', e.target.value.split(',').map(item => item.trim()))}
                    placeholder="Es: AI, Blockchain, IoT, Cloud"
                    className="border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="criteriESG" className="text-gray-700">Criteri ESG (separati da virgola)</Label>
                  <Input
                    type="text"
                    id="criteriESG"
                    value={formData.criteriESG.join(', ')}
                    onChange={(e) => handleArrayChange('criteriESG', e.target.value.split(',').map(item => item.trim()))}
                    placeholder="Es: Sostenibilità ambientale, Governance, Responsabilità sociale"
                    className="border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <h2 className="text-lg font-medium mb-2 border-b border-blue-100 pb-2 text-blue-800">
                    Altre Informazioni
                  </h2>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="competenzeDipendenti" className="text-gray-700">Competenze Dipendenti (separate da virgola)</Label>
                  <Input
                    type="text"
                    id="competenzeDipendenti"
                    value={formData.competenzeDipendenti.join(', ')}
                    onChange={(e) => handleArrayChange('competenzeDipendenti', e.target.value.split(',').map(item => item.trim()))}
                    placeholder="Es: Digitali, Linguistiche, Tecniche, Soft skills"
                    className="border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partnership" className="text-gray-700">Partnership (separate da virgola)</Label>
                  <Input
                    type="text"
                    id="partnership"
                    value={formData.partnership.join(', ')}
                    onChange={(e) => handleArrayChange('partnership', e.target.value.split(',').map(item => item.trim()))}
                    placeholder="Es: Università, Centri di Ricerca, Grandi Aziende"
                    className="border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                  />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <Label htmlFor="certificazioni" className="text-gray-700">Certificazioni (separate da virgola)</Label>
                  <Input
                    type="text"
                    id="certificazioni"
                    value={formData.certificazioni.join(', ')}
                    onChange={(e) => handleArrayChange('certificazioni', e.target.value.split(',').map(item => item.trim()))}
                    placeholder="Es: ISO 9001, ISO 14001, SA8000, EMAS"
                    className="border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                  />
                </div>
                <div className="col-span-1 md:col-span-2 mt-8 flex justify-end">
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-2 rounded-md transition-colors shadow-md hover:shadow-lg"
                  >
                    Crea Cliente
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NuovoCliente;
