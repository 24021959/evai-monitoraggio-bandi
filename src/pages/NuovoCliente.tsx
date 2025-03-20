
import React from 'react';
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
import { ArrowLeft, Save } from 'lucide-react';
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

const formSchema = z.object({
  nome: z.string().min(1, { message: "Il nome è obbligatorio" }),
  settore: z.string().min(1, { message: "Il settore è obbligatorio" }),
  fatturato: z.string().min(1, { message: "Il fatturato è obbligatorio" }),
  dipendenti: z.string().min(1, { message: "Il numero di dipendenti è obbligatorio" }),
  regione: z.string().min(1, { message: "La regione è obbligatoria" }),
  annoFondazione: z.string().optional(),
  provincia: z.string().optional(),
  formaGiuridica: z.string().optional(),
  codiceATECO: z.string().optional(),
  email: z.string().email({ message: "Inserisci un indirizzo email valido" }).optional(),
});

const NuovoCliente = () => {
  const navigate = useNavigate();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      settore: "",
      fatturato: "",
      dipendenti: "",
      regione: "",
      annoFondazione: "",
      provincia: "",
      formaGiuridica: "",
      codiceATECO: "",
      email: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    navigate('/clienti');
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
                          <SelectItem value="Lombardia">Lombardia</SelectItem>
                          <SelectItem value="Piemonte">Piemonte</SelectItem>
                          <SelectItem value="Veneto">Veneto</SelectItem>
                          <SelectItem value="Emilia-Romagna">Emilia-Romagna</SelectItem>
                          <SelectItem value="Toscana">Toscana</SelectItem>
                          <SelectItem value="Lazio">Lazio</SelectItem>
                          <SelectItem value="Campania">Campania</SelectItem>
                          <SelectItem value="Sicilia">Sicilia</SelectItem>
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
                      <FormLabel>Provincia</FormLabel>
                      <FormControl>
                        <Input placeholder="Inserisci provincia" {...field} />
                      </FormControl>
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
                
              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => navigate('/clienti')}>
                  Annulla
                </Button>
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Salva
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
