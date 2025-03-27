
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
  Filter,
  FileSpreadsheet
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Bandi = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState<string>('');
  const [settoreFiltro, setSettoreFiltro] = useState<string>('tutti');
  const [visualizzazione, setVisualizzazione] = useState<'tabella' | 'cards'>('tabella');
  const [settoriDisponibili, setSettoriDisponibili] = useState<string[]>([]);
  const [bandi, setBandi] = useState<Bando[]>([]);
  const [paginaCorrente, setPaginaCorrente] = useState<number>(1);
  const [showGoogleSheetsBandi, setShowGoogleSheetsBandi] = useState<boolean>(false);
  const [bandiImportati, setBandiImportati] = useState<Bando[]>([]);

  useEffect(() => {
    FirecrawlService.clearScrapedBandi();
    const loadedBandi = FirecrawlService.getSavedBandi();
    setBandi(loadedBandi);
    console.log("Bandi page: Caricati bandi salvati:", loadedBandi.length);
    
    // Controllo se ci sono bandi importati da Google Sheets
    const importedBandi = sessionStorage.getItem('bandiImportati');
    if (importedBandi) {
      try {
        const parsedBandi = JSON.parse(importedBandi);
        setBandiImportati(parsedBandi);
        console.log('Bandi importati recuperati:', parsedBandi.length);
        if (parsedBandi.length > 0) {
          setShowGoogleSheetsBandi(true);
        }
      } catch (error) {
        console.error('Errore nel parsing dei bandi importati:', error);
      }
    }
  }, []);

  useEffect(() => {
    const settori = new Set<string>();
    const bandiToAnalyze = showGoogleSheetsBandi ? bandiImportati : bandi;
    
    bandiToAnalyze.forEach(bando => {
      if (bando.settori && Array.isArray(bando.settori)) {
        bando.settori.forEach(settore => {
          settori.add(settore);
        });
      }
    });
    setSettoriDisponibili(Array.from(settori).sort());
  }, [bandi, bandiImportati, showGoogleSheetsBandi]);

  const getBandiFiltrati = () => {
    const bandiToFilter = showGoogleSheetsBandi ? bandiImportati : bandi;
    
    return bandiToFilter.filter(bando => {
      const matchTestoRicerca = !filtro || 
        bando.titolo.toLowerCase().includes(filtro.toLowerCase()) ||
        bando.descrizione?.toLowerCase().includes(filtro.toLowerCase()) ||
        bando.fonte.toLowerCase().includes(filtro.toLowerCase());
        
      const matchSettore = settoreFiltro === 'tutti' || 
        (bando.settori && bando.settori.includes(settoreFiltro));
      
      return matchTestoRicerca && matchSettore;
    });
  };

  const bandiFiltrati = getBandiFiltrati();
  const RISULTATI_PER_PAGINA = 10;
  const indicePrimoRisultato = (paginaCorrente - 1) * RISULTATI_PER_PAGINA;
  const indiceUltimoRisultato = indicePrimoRisultato + RISULTATI_PER_PAGINA;
  const bandiPaginati = bandiFiltrati.slice(indicePrimoRisultato, indiceUltimoRisultato);
  const totalePagine = Math.ceil(bandiFiltrati.length / RISULTATI_PER_PAGINA);

  const handleViewDetail = (id: string) => {
    navigate(`/bandi/${id}`);
  };

  const handleDeleteBando = (id: string) => {
    if (showGoogleSheetsBandi) {
      setBandiImportati(prevBandi => {
        const updatedBandi = prevBandi.filter(bando => bando.id !== id);
        sessionStorage.setItem('bandiImportati', JSON.stringify(updatedBandi));
        return updatedBandi;
      });
    } else {
      FirecrawlService.deleteBando(id);
      setBandi(prevBandi => prevBandi.filter(bando => bando.id !== id));
    }
    
    toast({
      title: "Bando eliminato",
      description: "Il bando è stato rimosso con successo",
      duration: 3000,
    });
  };

  const toggleBandiSource = () => {
    setShowGoogleSheetsBandi(!showGoogleSheetsBandi);
    setPaginaCorrente(1); // Reset to first page when switching
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Catalogo Bandi</h1>
        <div className="flex gap-2">
          {bandiImportati.length > 0 && (
            <Button 
              variant={showGoogleSheetsBandi ? "default" : "outline"}
              onClick={toggleBandiSource}
              className="flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Bandi da Google Sheets
            </Button>
          )}
          <Button variant="outline" onClick={() => navigate('/importa-scraping')}>
            <FileText className="w-4 h-4 mr-2" />
            Importa Nuovi Bandi
          </Button>
        </div>
      </div>
      
      {bandiImportati.length > 0 && showGoogleSheetsBandi && (
        <Alert className="bg-green-50 border-green-200">
          <FileSpreadsheet className="h-4 w-4 text-green-600" />
          <AlertTitle>Visualizzazione bandi importati da Google Sheets</AlertTitle>
          <AlertDescription>
            Stai visualizzando {bandiImportati.length} bandi importati dal tuo foglio Google Sheets.
          </AlertDescription>
        </Alert>
      )}
      
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
                  Non sono stati trovati bandi che corrispondono ai criteri di ricerca. Prova a modificare i filtri o importa nuovi bandi.
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
                showFullDetails={showGoogleSheetsBandi}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bandiFiltrati.map(bando => (
                  <BandoCard 
                    key={bando.id} 
                    bando={bando} 
                    onViewDetails={handleViewDetail}
                    onDelete={handleDeleteBando}
                    showFullDetails={showGoogleSheetsBandi}
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
