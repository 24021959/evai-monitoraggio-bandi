
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import BandoCard from '@/components/BandoCard';
import { Bando } from "@/types";
import { FirecrawlService } from '@/utils/FirecrawlService';
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  Filter,
  Calendar,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";

const Bandi = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState<string>('');
  const [settoreFiltro, setSettoreFiltro] = useState<string>('tutti');
  const [fonteFiltro, setFonteFiltro] = useState<string>('tutte');
  const [scadenzaFiltro, setScadenzaFiltro] = useState<Date | undefined>(undefined);
  const [settoriDisponibili, setSettoriDisponibili] = useState<string[]>([]);
  const [fontiDisponibili, setFontiDisponibili] = useState<string[]>([]);
  const [bandi, setBandi] = useState<Bando[]>([]);
  const [showGoogleSheetsBandi, setShowGoogleSheetsBandi] = useState<boolean>(false);
  const [bandiImportati, setBandiImportati] = useState<Bando[]>([]);

  useEffect(() => {
    FirecrawlService.clearScrapedBandi();
    const loadedBandi = FirecrawlService.getSavedBandi();
    setBandi(loadedBandi);
    console.log("Bandi page: Caricati bandi salvati:", loadedBandi.length);
    
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
    const fonti = new Set<string>();
    const bandiToAnalyze = showGoogleSheetsBandi ? bandiImportati : bandi;
    
    bandiToAnalyze.forEach(bando => {
      // Raccogliamo i settori
      if (bando.settori && Array.isArray(bando.settori)) {
        bando.settori.forEach(settore => {
          settori.add(settore);
        });
      }
      
      // Raccogliamo le fonti
      if (bando.fonte) {
        fonti.add(bando.fonte);
      }
    });
    
    setSettoriDisponibili(Array.from(settori).sort());
    setFontiDisponibili(Array.from(fonti).sort());
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
      
      const matchFonte = fonteFiltro === 'tutte' || 
        bando.fonte === fonteFiltro;
      
      const matchScadenza = !scadenzaFiltro || 
        new Date(bando.scadenza).setHours(0, 0, 0, 0) === new Date(scadenzaFiltro).setHours(0, 0, 0, 0);
      
      return matchTestoRicerca && matchSettore && matchFonte && matchScadenza;
    });
  };

  const bandiFiltrati = getBandiFiltrati();

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

  const handleResetFiltri = () => {
    setFiltro('');
    setSettoreFiltro('tutti');
    setFonteFiltro('tutte');
    setScadenzaFiltro(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Elenco Bandi</h1>
      </div>
      
      <Card className="bg-green-50">
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
            
            <div className="flex flex-wrap gap-3">
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
              
              <div className="w-48">
                <Select value={fonteFiltro} onValueChange={setFonteFiltro}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <span className="truncate">
                        {fonteFiltro === 'tutte' ? "Tutte le fonti" : fonteFiltro}
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tutte">Tutte le fonti</SelectItem>
                    {fontiDisponibili.map(fonte => (
                      <SelectItem key={fonte} value={fonte}>
                        {fonte}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-48">
                <DatePicker
                  placeholder="Seleziona scadenza"
                  date={scadenzaFiltro}
                  onDateChange={setScadenzaFiltro}
                  className="w-full"
                  buttonClassName="w-full justify-start text-left font-normal"
                  classNames={{
                    trigger: "flex items-center gap-2 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  }}
                  triggerIcon={<Calendar className="h-4 w-4 opacity-50" />}
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button variant="outline" onClick={handleResetFiltri}>Azzera filtri</Button>
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
            <div className="text-sm text-gray-500 mb-2">
              Mostra tutti i {bandiFiltrati.length} bandi
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bandiFiltrati.map((bando, index) => (
                <div key={bando.id} className={index % 2 === 0 ? "" : "bg-[#FEF7CD] rounded-lg"}>
                  <BandoCard 
                    bando={bando} 
                    onViewDetails={handleViewDetail}
                    onDelete={handleDeleteBando}
                    showFullDetails={showGoogleSheetsBandi}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Bandi;
