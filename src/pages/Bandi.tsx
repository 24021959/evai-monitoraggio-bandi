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
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const Bandi = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState<string>('');
  const [settoreFiltro, setSettoreFiltro] = useState<string>('tutti');
  const [settoriDisponibili, setSettoriDisponibili] = useState<string[]>([]);
  const [bandi, setBandi] = useState<Bando[]>([]);
  const [paginaCorrente, setPaginaCorrente] = useState<number>(1);
  const [showGoogleSheetsBandi, setShowGoogleSheetsBandi] = useState<boolean>(false);
  const [bandiImportati, setBandiImportati] = useState<Bando[]>([]);
  const [risultatiPerPagina, setRisultatiPerPagina] = useState<number>(10);

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
  const indicePrimoRisultato = (paginaCorrente - 1) * risultatiPerPagina;
  const indiceUltimoRisultato = indicePrimoRisultato + risultatiPerPagina;
  const bandiPaginati = bandiFiltrati.slice(indicePrimoRisultato, indiceUltimoRisultato);
  const totalePagine = Math.ceil(bandiFiltrati.length / risultatiPerPagina);

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

  const renderPagination = () => {
    if (totalePagine <= 1) return null;

    const pageItems = [];
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, paginaCorrente - halfVisible);
    let endPage = Math.min(totalePagine, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pageItems.push(
        <PaginationItem key="first">
          <PaginationLink onClick={() => setPaginaCorrente(1)}>1</PaginationLink>
        </PaginationItem>
      );
      
      if (startPage > 2) {
        pageItems.push(
          <PaginationItem key="ellipsis-start">
            <span className="flex h-9 w-9 items-center justify-center">...</span>
          </PaginationItem>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageItems.push(
        <PaginationItem key={i}>
          <PaginationLink 
            isActive={paginaCorrente === i} 
            onClick={() => setPaginaCorrente(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (endPage < totalePagine) {
      if (endPage < totalePagine - 1) {
        pageItems.push(
          <PaginationItem key="ellipsis-end">
            <span className="flex h-9 w-9 items-center justify-center">...</span>
          </PaginationItem>
        );
      }
      
      pageItems.push(
        <PaginationItem key="last">
          <PaginationLink onClick={() => setPaginaCorrente(totalePagine)}>
            {totalePagine}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return (
      <Pagination className="my-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => setPaginaCorrente(prev => Math.max(prev - 1, 1))}
              className={paginaCorrente === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          
          {pageItems}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => setPaginaCorrente(prev => Math.min(prev + 1, totalePagine))}
              className={paginaCorrente === totalePagine ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
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
              
              <div className="flex items-center gap-3">
                <Select 
                  value={risultatiPerPagina.toString()} 
                  onValueChange={(value) => {
                    setRisultatiPerPagina(Number(value));
                    setPaginaCorrente(1);
                  }}
                >
                  <SelectTrigger className="w-[130px]">
                    <span>{risultatiPerPagina} per pagina</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 per pagina</SelectItem>
                    <SelectItem value="10">10 per pagina</SelectItem>
                    <SelectItem value="20">20 per pagina</SelectItem>
                    <SelectItem value="50">50 per pagina</SelectItem>
                  </SelectContent>
                </Select>
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
            <div className="text-sm text-gray-500 mb-2">
              Mostra {indicePrimoRisultato + 1}-{Math.min(indiceUltimoRisultato, bandiFiltrati.length)} di {bandiFiltrati.length} bandi
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bandiPaginati.map(bando => (
                <BandoCard 
                  key={bando.id} 
                  bando={bando} 
                  onViewDetails={handleViewDetail}
                  onDelete={handleDeleteBando}
                  showFullDetails={showGoogleSheetsBandi}
                />
              ))}
            </div>
            
            {renderPagination()}
          </>
        )}
      </div>
    </div>
  );
};

export default Bandi;
