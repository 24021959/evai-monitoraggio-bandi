
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { SupabaseClientiService } from '@/utils/SupabaseClientiService';
import { useToast } from "@/hooks/use-toast";
import { provincePerRegione } from '@/utils/provinceItaliane';
import { codiciAtecoPerSettore } from '@/utils/codiciAteco';

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
  const [codiciAtecoDisponibili, setCodiciAtecoDisponibili] = useState<{ codice: string; descrizione: string }[]>([]);
  
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
    },
  });

  const regioneSelezionata = form.watch('regione');
  const settoreSelezionato = form.watch('settore');
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

  // Aggiorna i codici ATECO quando cambia il settore
  useEffect(() => {
    if (settoreSelezionato) {
      const codici = codiciAtecoPerSettore[settoreSelezionato] || [];
      setCodiciAtecoDisponibili(codici);
      // Reset codice ATECO se il settore cambia
      form.setValue('codiceATECO', '');
    } else {
      setCodiciAtecoDisponibili([]);
    }
  }, [settoreSelezionato, form]);

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
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!settoreSelezionato || codiciAtecoDisponibili.length === 0}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={settoreSelezionato ? "Seleziona codice ATECO" : "Prima seleziona un settore"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {codiciAtecoDisponibili.map((codice) => (
                            <SelectItem key={codice.codice} value={codice.codice}>
                              {codice.codice} - {codice.descrizione}
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
              
              <div className="space-y-4">
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
              </div>
              
              <div className="flex justify-end gap-4">
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
