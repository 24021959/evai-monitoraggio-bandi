
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Cliente } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import { SupabaseClientiService } from '@/utils/SupabaseClientiService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const DettaglioCliente = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Cliente>>({});
  const [campiAggiuntivi, setCampiAggiuntivi] = useState<{nome: string, valore: string}[]>([]);
  const [nuovoCampo, setNuovoCampo] = useState({nome: '', valore: ''});
  const [activeTab, setActiveTab] = useState("informazioni-base");

  useEffect(() => {
    const fetchCliente = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const clienteTrovato = await SupabaseClientiService.getCliente(id);
        if (clienteTrovato) {
          setCliente(clienteTrovato);
          setFormData(clienteTrovato);
          
          // Estrai i campi aggiuntivi (tutto ciò che non è un campo standard)
          const campiStandard = ['id', 'nome', 'settore', 'regione', 'provincia', 'fatturato', 'dipendenti', 
                                'email', 'interessiSettoriali', 'telefono', 'codiceATECO', 'annoFondazione', 
                                'formaGiuridica', 'esperienzaFinanziamenti', 'tecnologieSpecifiche', 
                                'criteriESG', 'capacitaRD', 'presenzaInternazionale', 'faseDiCrescita', 
                                'stabilitaFinanziaria', 'competenzeDipendenti', 'partnership', 'certificazioni'];
          
          const campiExtra = Object.entries(clienteTrovato)
            .filter(([key]) => !campiStandard.includes(key))
            .map(([nome, valore]) => ({
              nome,
              valore: typeof valore === 'string' ? valore : String(valore)
            }));
            
          setCampiAggiuntivi(campiExtra);
        } else {
          toast({
            title: "Errore",
            description: "Cliente non trovato",
            variant: "destructive",
          });
          navigate('/clienti');
        }
      } catch (error) {
        console.error('Errore nel caricamento del cliente:', error);
        toast({
          title: "Errore",
          description: "Impossibile caricare i dati del cliente",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCliente();
  }, [id, navigate, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'fatturato' || name === 'dipendenti' ? Number(value) : value
    }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAggiungiCampo = () => {
    if (nuovoCampo.nome && nuovoCampo.valore) {
      setCampiAggiuntivi([...campiAggiuntivi, nuovoCampo]);
      setNuovoCampo({nome: '', valore: ''});
    } else {
      toast({
        title: "Errore",
        description: "Entrambi i campi sono obbligatori",
        variant: "destructive",
      });
    }
  };

  const handleRimuoviCampo = (index: number) => {
    const nuoviCampi = [...campiAggiuntivi];
    nuoviCampi.splice(index, 1);
    setCampiAggiuntivi(nuoviCampi);
  };

  const handleSalva = async () => {
    if (!cliente || !id) return;
    
    setIsSaving(true);
    try {
      // Creiamo un nuovo oggetto cliente con i dati aggiornati
      const clienteAggiornato: Cliente = {
        ...cliente,
        ...formData,
      };

      // Aggiungiamo i campi personalizzati
      campiAggiuntivi.forEach(campo => {
        (clienteAggiornato as any)[campo.nome] = campo.valore;
      });

      // Salviamo il cliente in Supabase
      const success = await SupabaseClientiService.saveCliente(clienteAggiornato);
      
      if (success) {
        // Aggiorniamo lo stato locale
        setCliente(clienteAggiornato);
        
        toast({
          title: "Cliente aggiornato",
          description: "Le modifiche sono state salvate con successo",
        });
        
        setIsEditing(false);
      } else {
        throw new Error("Errore nell'aggiornamento del cliente");
      }
    } catch (error) {
      console.error('Errore durante il salvataggio delle modifiche:', error);
      toast({
        title: "Errore",
        description: "Impossibile salvare le modifiche",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="ml-2">Caricamento cliente...</p>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Cliente non trovato</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate('/clienti')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Dettaglio Cliente</h1>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>Modifica</Button>
        ) : (
          <Button onClick={handleSalva} className="flex items-center gap-2" disabled={isSaving}>
            <Save className="h-4 w-4" />
            {isSaving ? "Salvataggio..." : "Salva Modifiche"}
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{cliente.nome}</CardTitle>
          <CardDescription>Dettagli completi del cliente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="informazioni-base">Informazioni Base</TabsTrigger>
              <TabsTrigger value="informazioni-avanzate">Informazioni Avanzate</TabsTrigger>
              <TabsTrigger value="campi-personalizzati">Campi Personalizzati</TabsTrigger>
            </TabsList>

            <TabsContent value="informazioni-base" className="pt-4">
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Azienda</Label>
                    <Input 
                      id="nome" 
                      name="nome" 
                      value={formData.nome || ''} 
                      onChange={handleInputChange} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="settore">Settore</Label>
                    <Input 
                      id="settore" 
                      name="settore" 
                      value={formData.settore || ''} 
                      onChange={handleInputChange} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="regione">Regione</Label>
                    <Input 
                      id="regione" 
                      name="regione" 
                      value={formData.regione || ''} 
                      onChange={handleInputChange} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="provincia">Provincia</Label>
                    <Input 
                      id="provincia" 
                      name="provincia" 
                      value={formData.provincia || ''} 
                      onChange={handleInputChange} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fatturato">Fatturato (€)</Label>
                    <Input 
                      id="fatturato" 
                      name="fatturato" 
                      type="number" 
                      value={formData.fatturato || 0} 
                      onChange={handleInputChange} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dipendenti">Numero Dipendenti</Label>
                    <Input 
                      id="dipendenti" 
                      name="dipendenti" 
                      type="number" 
                      value={formData.dipendenti || 0} 
                      onChange={handleInputChange} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      value={formData.email || ''} 
                      onChange={handleInputChange} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Telefono</Label>
                    <Input 
                      id="telefono" 
                      name="telefono" 
                      type="tel" 
                      value={formData.telefono || ''} 
                      onChange={handleInputChange} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="codiceATECO">Codice ATECO</Label>
                    <Input 
                      id="codiceATECO" 
                      name="codiceATECO" 
                      value={formData.codiceATECO || ''} 
                      onChange={handleInputChange} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="annoFondazione">Anno Fondazione</Label>
                    <Input 
                      id="annoFondazione" 
                      name="annoFondazione" 
                      type="number"
                      value={formData.annoFondazione || ''} 
                      onChange={handleInputChange} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="formaGiuridica">Forma Giuridica</Label>
                    <Select 
                      name="formaGiuridica" 
                      value={formData.formaGiuridica || ''} 
                      onValueChange={(value) => handleSelectChange('formaGiuridica', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona forma giuridica" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="srl">SRL</SelectItem>
                        <SelectItem value="spa">SPA</SelectItem>
                        <SelectItem value="sas">SAS</SelectItem>
                        <SelectItem value="snc">SNC</SelectItem>
                        <SelectItem value="srls">SRLS</SelectItem>
                        <SelectItem value="ditta_individuale">Ditta Individuale</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-sm text-gray-500">Nome Azienda</h3>
                    <p>{cliente.nome}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-gray-500">Settore</h3>
                    <p>{cliente.settore}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-gray-500">Regione</h3>
                    <p>{cliente.regione}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-gray-500">Provincia</h3>
                    <p>{cliente.provincia}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-gray-500">Fatturato</h3>
                    <p>€{cliente.fatturato?.toLocaleString('it-IT') || '-'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-gray-500">Numero Dipendenti</h3>
                    <p>{cliente.dipendenti || '-'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-gray-500">Email</h3>
                    <p>{cliente.email || '-'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-gray-500">Telefono</h3>
                    <p>{cliente.telefono || '-'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-gray-500">Codice ATECO</h3>
                    <p>{cliente.codiceATECO || '-'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-gray-500">Anno Fondazione</h3>
                    <p>{cliente.annoFondazione || '-'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-gray-500">Forma Giuridica</h3>
                    <p>{cliente.formaGiuridica || '-'}</p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="informazioni-avanzate" className="pt-4">
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="esperienzaFinanziamenti">Esperienza Pregressa con Finanziamenti</Label>
                    <Textarea 
                      id="esperienzaFinanziamenti" 
                      name="esperienzaFinanziamenti"
                      placeholder="Descrivere esperienze precedenti con bandi e finanziamenti"
                      value={(formData as any)?.esperienzaFinanziamenti || ''} 
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tecnologieSpecifiche">Tecnologie o Innovazioni Specifiche</Label>
                    <Textarea 
                      id="tecnologieSpecifiche" 
                      name="tecnologieSpecifiche"
                      placeholder="Tecnologie proprietarie o di particolare rilevanza"
                      value={(formData as any)?.tecnologieSpecifiche || ''} 
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="criteriESG">Criteri ESG (Ambientale, Sociale, Governance)</Label>
                    <Textarea 
                      id="criteriESG" 
                      name="criteriESG"
                      placeholder="Politiche ambientali, sociali e di governance"
                      value={(formData as any)?.criteriESG || ''} 
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacitaRD">Capacità R&D</Label>
                    <Textarea 
                      id="capacitaRD" 
                      name="capacitaRD"
                      placeholder="Budget R&D, brevetti, progetti in corso"
                      value={(formData as any)?.capacitaRD || ''} 
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="presenzaInternazionale">Presenza Internazionale</Label>
                    <Textarea 
                      id="presenzaInternazionale" 
                      name="presenzaInternazionale"
                      placeholder="Mercati esteri, export, sedi estere"
                      value={(formData as any)?.presenzaInternazionale || ''} 
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="faseDiCrescita">Fase di Crescita</Label>
                    <Select 
                      name="faseDiCrescita" 
                      value={(formData as any)?.faseDiCrescita || ''} 
                      onValueChange={(value) => handleSelectChange('faseDiCrescita', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona fase di crescita" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="startup">Startup</SelectItem>
                        <SelectItem value="scaleup">Scale-up</SelectItem>
                        <SelectItem value="matura">Azienda Matura</SelectItem>
                        <SelectItem value="consolidata">Azienda Consolidata</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stabilitaFinanziaria">Stabilità Finanziaria</Label>
                    <Textarea 
                      id="stabilitaFinanziaria" 
                      name="stabilitaFinanziaria"
                      placeholder="Redditività, indebitamento, indicatori finanziari"
                      value={(formData as any)?.stabilitaFinanziaria || ''} 
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="competenzeDipendenti">Competenze dei Dipendenti</Label>
                    <Textarea 
                      id="competenzeDipendenti" 
                      name="competenzeDipendenti"
                      placeholder="% personale tecnico, di ricerca o specializzato"
                      value={(formData as any)?.competenzeDipendenti || ''} 
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="partnership">Partnership</Label>
                    <Textarea 
                      id="partnership" 
                      name="partnership"
                      placeholder="Collaborazioni con università, centri ricerca, partner industriali"
                      value={(formData as any)?.partnership || ''} 
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="certificazioni">Certificazioni</Label>
                    <Textarea 
                      id="certificazioni" 
                      name="certificazioni"
                      placeholder="ISO, certificazioni di qualità o di settore"
                      value={(formData as any)?.certificazioni || ''} 
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-sm text-gray-500">Esperienza con Finanziamenti</h3>
                    <p>{(cliente as any)?.esperienzaFinanziamenti || 'Non specificato'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-gray-500">Tecnologie Specifiche</h3>
                    <p>{(cliente as any)?.tecnologieSpecifiche || 'Non specificato'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-gray-500">Criteri ESG</h3>
                    <p>{(cliente as any)?.criteriESG || 'Non specificato'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-gray-500">Capacità R&D</h3>
                    <p>{(cliente as any)?.capacitaRD || 'Non specificato'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-gray-500">Presenza Internazionale</h3>
                    <p>{(cliente as any)?.presenzaInternazionale || 'Non specificato'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-gray-500">Fase di Crescita</h3>
                    <p>{(cliente as any)?.faseDiCrescita || 'Non specificato'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-gray-500">Stabilità Finanziaria</h3>
                    <p>{(cliente as any)?.stabilitaFinanziaria || 'Non specificato'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-gray-500">Competenze Dipendenti</h3>
                    <p>{(cliente as any)?.competenzeDipendenti || 'Non specificato'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-gray-500">Partnership</h3>
                    <p>{(cliente as any)?.partnership || 'Non specificato'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-gray-500">Certificazioni</h3>
                    <p>{(cliente as any)?.certificazioni || 'Non specificato'}</p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="campi-personalizzati" className="pt-4">
              {isEditing ? (
                <div>
                  {campiAggiuntivi.map((campo, index) => (
                    <div key={index} className="space-y-2 flex items-end gap-2 mb-4">
                      <div className="flex-grow space-y-2">
                        <Label>{campo.nome}</Label>
                        <Input 
                          value={campo.valore} 
                          onChange={(e) => {
                            const nuoviCampi = [...campiAggiuntivi];
                            nuoviCampi[index].valore = e.target.value;
                            setCampiAggiuntivi(nuoviCampi);
                          }} 
                        />
                      </div>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="flex-shrink-0"
                        onClick={() => handleRimuoviCampo(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {/* Aggiungi nuovo campo */}
                  <div className="border-t pt-4 mt-2">
                    <div className="flex items-end gap-2">
                      <div className="flex-grow space-y-2">
                        <Label htmlFor="nomeCampo">Nome Campo</Label>
                        <Input 
                          id="nomeCampo" 
                          value={nuovoCampo.nome} 
                          onChange={(e) => setNuovoCampo({...nuovoCampo, nome: e.target.value})} 
                        />
                      </div>
                      <div className="flex-grow space-y-2">
                        <Label htmlFor="valoreCampo">Valore</Label>
                        <Input 
                          id="valoreCampo" 
                          value={nuovoCampo.valore} 
                          onChange={(e) => setNuovoCampo({...nuovoCampo, valore: e.target.value})} 
                        />
                      </div>
                      <Button 
                        variant="outline" 
                        className="flex-shrink-0 whitespace-nowrap"
                        onClick={handleAggiungiCampo}
                      >
                        <Plus className="mr-1 h-4 w-4" />
                        Aggiungi Campo
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {campiAggiuntivi.length > 0 ? (
                    campiAggiuntivi.map((campo, index) => (
                      <div key={index}>
                        <h3 className="font-medium text-sm text-gray-500">{campo.nome}</h3>
                        <p>{campo.valore}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">Non sono presenti campi personalizzati.</p>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DettaglioCliente;
