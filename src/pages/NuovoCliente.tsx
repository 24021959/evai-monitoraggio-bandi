
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { SupabaseClientiService } from '@/utils/SupabaseClientiService';
import { useToast } from "@/hooks/use-toast";
import { provincePerRegione } from '@/utils/provinceItaliane';
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  nome: z.string().min(1, { message: "Il nome è obbligatorio" }),
  settore: z.string().min(1, { message: "Il settore è obbligatorio" }),
  fatturato: z.string().min(1, { message: "Il fatturato è obbligatorio" }),
  dipendenti: z.string().min(1, { message: "Il numero di dipendenti è obbligatorio" }),
  regione: z.string().min(1, { message: "La regione è obbligatoria" }),
  provincia: z.string().min(1, { message: "La provincia è obbligatoria" }),
  annoFondazione: z.string().optional(),
  formaGiuridica: z.string().optional(),
  codiceATECO: z.string().optional(),
  email: z.string().email({ message: "Inserisci un indirizzo email valido" }).optional().or(z.literal('')),
  telefono: z.string().optional(),
  // Campi Avanzati
  esperienzaFinanziamenti: z.string().optional(),
  tecnologieSpecifiche: z.string().optional(),
  criteriESG: z.string().optional(),
  capacitaRD: z.string().optional(),
  presenzaInternazionale: z.string().optional(),
  faseDiCrescita: z.string().optional(),
  stabilitaFinanziaria: z.string().optional(),
  competenzeDipendenti: z.string().optional(),
  partnership: z.string().optional(),
  certificazioni: z.string().optional(),
});

interface CampoAggiuntivo {
  id: string;
  nome: string;
  valore: string;
}

const NuovoCliente = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [campiAggiuntivi, setCampiAggiuntivi] = useState<CampoAggiuntivo[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("info-base");
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      settore: "",
      fatturato: "",
      dipendenti: "",
      regione: "",
      provincia: "",
      annoFondazione: "",
      formaGiuridica: "",
      codiceATECO: "",
      email: "",
      telefono: "",
      // Campi Avanzati
      esperienzaFinanziamenti: "",
      tecnologieSpecifiche: "",
      criteriESG: "",
      capacitaRD: "",
      presenzaInternazionale: "",
      faseDiCrescita: "",
      stabilitaFinanziaria: "",
      competenzeDipendenti: "",
      partnership: "",
      certificazioni: "",
    },
  });

  const regioneSelezionata = form.watch('regione');
  const [provinceDisponibili, setProvinceDisponibili] = useState<string[]>([]);

  // Aggiorna le province quando cambia la regione
  useEffect(() => {
    if (regioneSelezionata) {
      const province = provincePerRegione[regioneSelezionata] || [];
      setProvinceDisponibili(province);
      // Reset provincia se la regione cambia
      form.setValue('provincia', '');
    }
  }, [regioneSelezionata, form]);

  const aggiungiCampo = () => {
    setCampiAggiuntivi([...campiAggiuntivi, {
      id: `campo-${Date.now()}`,
      nome: '',
      valore: ''
    }]);
  };

  const rimuoviCampo = (id: string) => {
    setCampiAggiuntivi(campiAggiuntivi.filter(campo => campo.id !== id));
  };

  const aggiornaCampo = (id: string, tipo: 'nome' | 'valore', nuovoValore: string) => {
    setCampiAggiuntivi(campiAggiuntivi.map(campo => 
      campo.id === id ? { ...campo, [tipo]: nuovoValore } : campo
    ));
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    try {
      // Creazione di un oggetto cliente compatibile con il tipo Cliente
      const nuovoCliente = {
        id: '', // Generato da Supabase
        nome: values.nome,
        settore: values.settore,
        regione: values.regione,
        provincia: values.provincia,
        fatturato: parseInt(values.fatturato, 10),
        interessiSettoriali: [], // Campo vuoto iniziale
        dipendenti: parseInt(values.dipendenti, 10),
        email: values.email || '', // Assicuriamoci che non sia undefined
        telefono: values.telefono || '',
        annoFondazione: values.annoFondazione ? parseInt(values.annoFondazione, 10) : undefined,
        formaGiuridica: values.formaGiuridica || undefined,
        codiceATECO: values.codiceATECO || undefined,
        // Dati avanzati
        esperienzaFinanziamenti: values.esperienzaFinanziamenti || undefined,
        tecnologieSpecifiche: values.tecnologieSpecifiche || undefined,
        criteriESG: values.criteriESG || undefined,
        capacitaRD: values.capacitaRD || undefined,
        presenzaInternazionale: values.presenzaInternazionale || undefined,
        faseDiCrescita: values.faseDiCrescita as any || undefined,
        stabilitaFinanziaria: values.stabilitaFinanziaria || undefined,
        competenzeDipendenti: values.competenzeDipendenti || undefined,
        partnership: values.partnership || undefined,
        certificazioni: values.certificazioni || undefined,
      };
      
      // Aggiungi i campi personalizzati
      const campiExtra: Record<string, string> = {};
      campiAggiuntivi.forEach(campo => {
        if (campo.nome && campo.valore) {
          campiExtra[campo.nome] = campo.valore;
        }
      });
      
      // Salva il cliente in Supabase
      const success = await SupabaseClientiService.saveCliente(nuovoCliente);
      
      if (success) {
        toast({
          title: "Cliente aggiunto",
          description: "Il cliente è stato salvato con successo",
        });
        navigate('/clienti');
      } else {
        throw new Error("Errore nel salvataggio del cliente");
      }
    } catch (error) {
      console.error("Errore durante il salvataggio:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il salvataggio del cliente",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => navigate('/clienti')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Nuovo Cliente</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Informazioni Azienda</CardTitle>
          <CardDescription>Inserisci le informazioni del nuovo cliente</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="info-base">Informazioni Base</TabsTrigger>
                  <TabsTrigger value="info-avanzate">Informazioni Avanzate</TabsTrigger>
                  <TabsTrigger value="campi-personalizzati">Campi Personalizzati</TabsTrigger>
                </TabsList>
                
                <TabsContent value="info-base" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Azienda *</FormLabel>
                          <FormControl>
                            <Input placeholder="Inserisci nome azienda" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="settore"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Settore *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleziona settore" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Agricoltura">Agricoltura</SelectItem>
                              <SelectItem value="Industria">Industria</SelectItem>
                              <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                              <SelectItem value="Energia">Energia</SelectItem>
                              <SelectItem value="Startup">Startup</SelectItem>
                              <SelectItem value="Biomedicale">Biomedicale</SelectItem>
                              <SelectItem value="Turismo">Turismo</SelectItem>
                              <SelectItem value="Commercio">Commercio</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="fatturato"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fatturato Annuo (€) *</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Inserisci fatturato" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="dipendenti"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Numero Dipendenti *</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Inserisci n° dipendenti" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="annoFondazione"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Anno Fondazione</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Inserisci anno fondazione" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="regione"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Regione *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleziona regione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Abruzzo">Abruzzo</SelectItem>
                              <SelectItem value="Basilicata">Basilicata</SelectItem>
                              <SelectItem value="Calabria">Calabria</SelectItem>
                              <SelectItem value="Campania">Campania</SelectItem>
                              <SelectItem value="Emilia-Romagna">Emilia-Romagna</SelectItem>
                              <SelectItem value="Friuli-Venezia Giulia">Friuli-Venezia Giulia</SelectItem>
                              <SelectItem value="Lazio">Lazio</SelectItem>
                              <SelectItem value="Liguria">Liguria</SelectItem>
                              <SelectItem value="Lombardia">Lombardia</SelectItem>
                              <SelectItem value="Marche">Marche</SelectItem>
                              <SelectItem value="Molise">Molise</SelectItem>
                              <SelectItem value="Piemonte">Piemonte</SelectItem>
                              <SelectItem value="Puglia">Puglia</SelectItem>
                              <SelectItem value="Sardegna">Sardegna</SelectItem>
                              <SelectItem value="Sicilia">Sicilia</SelectItem>
                              <SelectItem value="Toscana">Toscana</SelectItem>
                              <SelectItem value="Trentino-Alto Adige">Trentino-Alto Adige</SelectItem>
                              <SelectItem value="Umbria">Umbria</SelectItem>
                              <SelectItem value="Valle d'Aosta">Valle d'Aosta</SelectItem>
                              <SelectItem value="Veneto">Veneto</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="provincia"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Provincia *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={provinceDisponibili.length === 0}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={regioneSelezionata ? "Seleziona provincia" : "Prima seleziona una regione"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {provinceDisponibili.map((provincia) => (
                                <SelectItem key={provincia} value={provincia}>
                                  {provincia}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="formaGiuridica"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Forma Giuridica</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleziona forma giuridica" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="srl">SRL</SelectItem>
                              <SelectItem value="spa">SPA</SelectItem>
                              <SelectItem value="sas">SAS</SelectItem>
                              <SelectItem value="snc">SNC</SelectItem>
                              <SelectItem value="srls">SRLS</SelectItem>
                              <SelectItem value="ditta_individuale">Ditta Individuale</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="codiceATECO"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Codice ATECO</FormLabel>
                          <FormControl>
                            <Input placeholder="Inserisci codice ATECO" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Inserisci email aziendale" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="telefono"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefono</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="Inserisci numero di telefono" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="info-avanzate" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="esperienzaFinanziamenti"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Esperienza con Finanziamenti</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Descrivi l'esperienza pregressa con finanziamenti pubblici o privati" 
                              className="resize-none" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="tecnologieSpecifiche"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tecnologie Specifiche</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Descrivi le tecnologie o innovazioni specifiche dell'azienda" 
                              className="resize-none" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="criteriESG"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Criteri ESG</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Descrivi gli aspetti ambientali, sociali e di governance" 
                              className="resize-none" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="capacitaRD"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Capacità di R&D</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Descrivi le capacità di Ricerca e Sviluppo dell'azienda" 
                              className="resize-none" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="presenzaInternazionale"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Presenza Internazionale</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Descrivi la presenza internazionale dell'azienda" 
                              className="resize-none" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="faseDiCrescita"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fase di Crescita</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleziona fase di crescita" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="startup">Startup</SelectItem>
                              <SelectItem value="scaleup">Scale-up</SelectItem>
                              <SelectItem value="matura">Azienda Matura</SelectItem>
                              <SelectItem value="consolidata">Azienda Consolidata</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="stabilitaFinanziaria"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stabilità Finanziaria</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Informazioni sulla stabilità finanziaria dell'azienda" 
                              className="resize-none" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="competenzeDipendenti"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Competenze Dipendenti</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Composizione delle competenze dei dipendenti" 
                              className="resize-none" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="partnership"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Partnership</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Informazioni su partnership con università, centri di ricerca o altri enti" 
                              className="resize-none" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="certificazioni"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Certificazioni</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Certificazioni o accreditamenti posseduti" 
                              className="resize-none" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="campi-personalizzati" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Campi Aggiuntivi</h3>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={aggiungiCampo}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Aggiungi Campo
                    </Button>
                  </div>
                  
                  {campiAggiuntivi.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Nessun campo personalizzato aggiunto. Clicca "Aggiungi Campo" per creare campi personalizzati.
                    </div>
                  )}
                  
                  {campiAggiuntivi.map((campo) => (
                    <div key={campo.id} className="flex gap-4 items-start">
                      <div className="flex-1">
                        <FormItem>
                          <FormLabel>Nome Campo</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Es: Sito Web"
                              value={campo.nome}
                              onChange={(e) => aggiornaCampo(campo.id, 'nome', e.target.value)}
                            />
                          </FormControl>
                        </FormItem>
                      </div>
                      
                      <div className="flex-1">
                        <FormItem>
                          <FormLabel>Valore</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Inserisci valore"
                              value={campo.valore}
                              onChange={(e) => aggiornaCampo(campo.id, 'valore', e.target.value)}
                            />
                          </FormControl>
                        </FormItem>
                      </div>
                      
                      <Button
                        type="button"
                        variant="ghost"
                        className="mt-8"
                        onClick={() => rimuoviCampo(campo.id)}
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button variant="outline" onClick={() => navigate('/clienti')} type="button">
                  Annulla
                </Button>
                <Button type="submit" className="flex items-center gap-2" disabled={isSubmitting}>
                  <Save className="h-4 w-4" />
                  {isSubmitting ? "Salvataggio..." : "Salva"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NuovoCliente;
