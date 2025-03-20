
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BandiTable from '@/components/BandiTable';
import { useNavigate } from 'react-router-dom';
import { Filter, Search, X, Trash2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { FirecrawlService } from '@/utils/FirecrawlService';
import { Bando } from '@/types';

const Bandi = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tipo, setTipo] = useState<string>('tutti');
  const [settore, setSettore] = useState<string>('tutti');
  const [regione, setRegione] = useState<string>('tutti');
  const [scadenza, setScadenza] = useState<string>('tutti');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [bandi, setBandi] = useState<Bando[]>([]);

  // Load bandi from FirecrawlService on component mount
  useEffect(() => {
    const loadedBandi = FirecrawlService.getSavedBandi();
    setBandi(loadedBandi);
  }, []);

  const settoriUnici = Array.from(new Set(bandi.flatMap(bando => bando.settori)));
  
  const resetFilters = () => {
    setTipo('tutti');
    setSettore('tutti');
    setRegione('tutti');
    setScadenza('tutti');
    setSearchTerm('');
  };

  const filtraBandi = () => {
    return bandi.filter(bando => {
      if (searchTerm && !bando.titolo.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (tipo !== 'tutti' && bando.tipo !== tipo) {
        return false;
      }
      if (settore !== 'tutti' && !bando.settori.includes(settore)) {
        return false;
      }
      // Per la scadenza possiamo filtrare per periodo
      if (scadenza !== 'tutti') {
        const oggi = new Date();
        const scadenzaBando = new Date(bando.scadenza);
        const diffGiorni = Math.ceil((scadenzaBando.getTime() - oggi.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (scadenza) {
          case 'prossimi30':
            return diffGiorni <= 30 && diffGiorni > 0;
          case 'prossimi90':
            return diffGiorni <= 90 && diffGiorni > 0;
          case 'oltre90':
            return diffGiorni > 90;
          default:
            return true;
        }
      }
      return true;
    });
  };

  const handleDeleteBando = (id: string) => {
    FirecrawlService.deleteBando(id);
    // Update the UI
    setBandi(prevBandi => prevBandi.filter(bando => bando.id !== id));
    toast({
      title: "Bando eliminato",
      description: "Il bando è stato rimosso con successo",
      duration: 3000,
    });
  };

  const bandiMostrati = filtraBandi();

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Bandi di Finanza Agevolata</h1>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Filtri</CardTitle>
          <CardDescription>Filtra i bandi in base alle tue esigenze</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium">Tipo</label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Tutti" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tutti">Tutti</SelectItem>
                  <SelectItem value="statale">Statale</SelectItem>
                  <SelectItem value="regionale">Regionale</SelectItem>
                  <SelectItem value="europeo">Europeo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Settore</label>
              <Select value={settore} onValueChange={setSettore}>
                <SelectTrigger>
                  <SelectValue placeholder="Tutti" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tutti">Tutti</SelectItem>
                  {settoriUnici.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Regione</label>
              <Select value={regione} onValueChange={setRegione}>
                <SelectTrigger>
                  <SelectValue placeholder="Tutte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tutti">Tutte</SelectItem>
                  <SelectItem value="lombardia">Lombardia</SelectItem>
                  <SelectItem value="piemonte">Piemonte</SelectItem>
                  <SelectItem value="lazio">Lazio</SelectItem>
                  <SelectItem value="veneto">Veneto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Scadenza</label>
              <Select value={scadenza} onValueChange={setScadenza}>
                <SelectTrigger>
                  <SelectValue placeholder="Tutte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tutti">Tutte</SelectItem>
                  <SelectItem value="prossimi30">Prossimi 30 giorni</SelectItem>
                  <SelectItem value="prossimi90">Prossimi 90 giorni</SelectItem>
                  <SelectItem value="oltre90">Oltre 90 giorni</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Cerca</label>
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cerca bando..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={resetFilters} className="flex items-center gap-2">
              <X className="h-4 w-4" />
              Reset
            </Button>
            
            <Button className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtra
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Elenco Bandi</CardTitle>
          <CardDescription>
            {bandiMostrati.length} bandi trovati
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tabella">
            <TabsList className="mb-4">
              <TabsTrigger value="tabella">Tabella</TabsTrigger>
              <TabsTrigger value="card">Card</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tabella">
              <BandiTable 
                bandi={bandiMostrati} 
                onViewDetails={(id) => navigate(`/bandi/${id}`)} 
                onDeleteBando={handleDeleteBando}
              />
            </TabsContent>
            
            <TabsContent value="card">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bandiMostrati.map((bando) => (
                  <Card key={bando.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{bando.titolo}</CardTitle>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs text-white px-2 py-1 rounded-full ${
                            bando.tipo === 'statale' ? 'bg-green-500' :
                            bando.tipo === 'europeo' ? 'bg-blue-500' :
                            'bg-teal-500'
                          }`}>
                            {bando.tipo}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBando(bando.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription>{bando.settori.join(', ')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Fonte:</span>
                          <span>{bando.fonte}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Scadenza:</span>
                          <span>{new Date(bando.scadenza).toLocaleDateString('it-IT')}</span>
                        </div>
                        <Button 
                          variant="outline" 
                          className="w-full mt-2"
                          onClick={() => navigate(`/bandi/${bando.id}`)}
                        >
                          Dettagli
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-4 flex justify-center gap-2">
            <Button variant="outline" size="icon">
              1
            </Button>
            <Button variant="outline" size="icon">
              2
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Bandi;
