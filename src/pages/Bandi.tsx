import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import BandiTable from "@/components/BandiTable";
import BandoCard from '@/components/BandoCard';
import { Bando } from "@/types";
import { FirecrawlService } from '@/utils/FirecrawlService';
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  Filter 
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Bandi = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState<string>('');
  const [settoreFiltro, setSettoreFiltro] = useState<string>('tutti');
  const [visualizzazione, setVisualizzazione] = useState<'tabella' | 'cards'>('tabella');
  const [settoriDisponibili, setSettoriDisponibili] = useState<string[]>([]);
  const [bandi, setBandi] = useState<Bando[]>([]);
  const [paginaCorrente, setPaginaCorrente] = useState<number>(1);

  useEffect(() => {
    FirecrawlService.clearScrapedBandi();
    const loadedBandi = FirecrawlService.getSavedBandi();
    setBandi(loadedBandi);
    console.log("Bandi page: Caricati bandi salvati:", loadedBandi.length);
  }, []);

  useEffect(() => {
    const settori = new Set<string>();
    bandi.forEach(bando => {
      bando.settori.forEach(settore => {
        settori.add(settore);
      });
    });
    setSettoriDisponibili(Array.from(settori).sort());
  }, [bandi]);

  const bandiFiltrati = bandi.filter(bando => {
    const matchTestoRicerca = !filtro || 
      bando.titolo.toLowerCase().includes(filtro.toLowerCase()) ||
      bando.descrizione?.toLowerCase().includes(filtro.toLowerCase()) ||
      bando.fonte.toLowerCase().includes(filtro.toLowerCase());
      
    const matchSettore = settoreFiltro === 'tutti' || bando.settori.includes(settoreFiltro);
    
    return matchTestoRicerca && matchSettore;
  });

  const RISULTATI_PER_PAGINA = 10;
  const indicePrimoRisultato = (paginaCorrente - 1) * RISULTATI_PER_PAGINA;
  const indiceUltimoRisultato = indicePrimoRisultato + RISULTATI_PER_PAGINA;
  const bandiPaginati = bandiFiltrati.slice(indicePrimoRisultato, indiceUltimoRisultato);
  const totalePagine = Math.ceil(bandiFiltrati.length / RISULTATI_PER_PAGINA);

  const handleViewDetail = (id: string) => {
    navigate(`/bandi/${id}`);
  };

  const handleDeleteBando = (id: string) => {
    FirecrawlService.deleteBando(id);
    
    setBandi(prevBandi => prevBandi.filter(bando => bando.id !== id));
    
    toast({
      title: "Bando eliminato",
      description: "Il bando è stato rimosso con successo",
      duration: 3000,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Catalogo Bandi</h1>
        <Button variant="outline" onClick={() => navigate('/risultati-scraping')}>
          <FileText className="w-4 h-4 mr-2" />
          Estrai Nuovi Bandi
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Filtra Bandi</CardTitle>
          <CardDescription>Ricerca e filtra i bandi in base ai tuoi criteri</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Cerca bandi..."
                className="pl-9"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
            </div>
            
            <div className="flex gap-3">
              <div className="w-48">
                <Select value={settoreFiltro} onValueChange={setSettoreFiltro}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <span className="truncate">
                        {settoreFiltro === 'tutti' ? "Tutti i settori" : settoreFiltro}
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tutti">Tutti i settori</SelectItem>
                    {settoriDisponibili.map(settore => (
                      <SelectItem key={settore} value={settore}>
                        {settore}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Tabs value={visualizzazione} onValueChange={(v) => setVisualizzazione(v as 'tabella' | 'cards')}>
                  <TabsList>
                    <TabsTrigger value="tabella">Tabella</TabsTrigger>
                    <TabsTrigger value="cards">Schede</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div>
        {bandiFiltrati.length === 0 ? (
          <Card className="bg-gray-50">
            <CardContent className="py-8">
              <div className="text-center text-gray-500">
                <FileText className="mx-auto h-12 w-12 mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">Nessun bando trovato</h3>
                <p className="text-sm max-w-md mx-auto">
                  Non sono stati trovati bandi che corrispondono ai criteri di ricerca. Prova a modificare i filtri o estrai nuovi bandi.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {visualizzazione === 'tabella' ? (
              <BandiTable 
                bandi={bandiPaginati} 
                onViewDetails={handleViewDetail}
                onDeleteBando={handleDeleteBando}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bandiFiltrati.map(bando => (
                  <BandoCard 
                    key={bando.id} 
                    bando={bando} 
                    onViewDetails={handleViewDetail}
                    onDelete={handleDeleteBando}
                  />
                ))}
              </div>
            )}
            
            {visualizzazione === 'tabella' && totalePagine > 1 && (
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-500">
                  Mostra {indicePrimoRisultato + 1}-{Math.min(indiceUltimoRisultato, bandiFiltrati.length)} di {bandiFiltrati.length} bandi
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={paginaCorrente === 1}
                    onClick={() => setPaginaCorrente(prev => Math.max(prev - 1, 1))}
                  >
                    Precedente
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={paginaCorrente === totalePagine}
                    onClick={() => setPaginaCorrente(prev => Math.min(prev + 1, totalePagine))}
                  >
                    Successiva
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Bandi;
