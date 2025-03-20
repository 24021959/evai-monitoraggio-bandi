
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockClienti } from '@/data/mockData';
import { Cliente } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Save, Plus, X } from 'lucide-react';

const DettaglioCliente = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Cliente>>({});
  const [campiAggiuntivi, setCampiAggiuntivi] = useState<{nome: string, valore: string}[]>([]);
  const [nuovoCampo, setNuovoCampo] = useState({nome: '', valore: ''});

  useEffect(() => {
    // In un'applicazione reale, qui faremmo una chiamata API
    const clienteTrovato = mockClienti.find(c => c.id === id);
    if (clienteTrovato) {
      setCliente(clienteTrovato);
      setFormData(clienteTrovato);
      
      // Estrai i campi aggiuntivi (tutto ciò che non è un campo standard)
      const campiStandard = ['id', 'nome', 'settore', 'regione', 'provincia', 'fatturato', 'dipendenti', 'email', 'interessiSettoriali', 'telefono'];
      const campiExtra = Object.entries(clienteTrovato)
        .filter(([key]) => !campiStandard.includes(key))
        .map(([nome, valore]) => ({
          nome,
          valore: typeof valore === 'string' ? valore : String(valore)
        }));
        
      setCampiAggiuntivi(campiExtra);
    }
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'fatturato' || name === 'dipendenti' ? Number(value) : value
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

  const handleSalva = () => {
    if (!cliente || !id) return;

    // Creiamo un nuovo oggetto cliente con i dati aggiornati
    const clienteAggiornato: Cliente = {
      ...cliente,
      ...formData,
    };

    // Aggiungiamo i campi personalizzati
    campiAggiuntivi.forEach(campo => {
      (clienteAggiornato as any)[campo.nome] = campo.valore;
    });

    // Aggiorniamo il cliente nell'array mockClienti
    const index = mockClienti.findIndex(c => c.id === id);
    if (index !== -1) {
      mockClienti[index] = clienteAggiornato;
      
      // Aggiorniamo lo stato locale
      setCliente(clienteAggiornato);
    }

    toast({
      title: "Cliente aggiornato",
      description: "Le modifiche sono state salvate con successo",
    });
    setIsEditing(false);
  };

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
          <Button onClick={handleSalva} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Salva Modifiche
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{cliente.nome}</CardTitle>
          <CardDescription>Dettagli completi del cliente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
              
              {/* Campi aggiuntivi */}
              {campiAggiuntivi.map((campo, index) => (
                <div key={index} className="space-y-2 flex items-end gap-2">
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
              <div className="col-span-1 md:col-span-2 border-t pt-4 mt-2">
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
                <p>€{cliente.fatturato.toLocaleString('it-IT')}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-gray-500">Numero Dipendenti</h3>
                <p>{cliente.dipendenti}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-gray-500">Email</h3>
                <p>{cliente.email}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-gray-500">Telefono</h3>
                <p>{cliente.telefono || '-'}</p>
              </div>
              
              {/* Visualizza campi aggiuntivi */}
              {campiAggiuntivi.map((campo, index) => (
                <div key={index}>
                  <h3 className="font-medium text-sm text-gray-500">{campo.nome}</h3>
                  <p>{campo.valore}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DettaglioCliente;
