
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import BandoCard from '@/components/BandoCard';
import { Bando } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import SupabaseBandiService from '@/utils/SupabaseBandiService';
import { useFonti } from '@/hooks/useFonti';
import { 
  FileText, 
  Search, 
  Filter,
  X,
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
  const [fonteFiltro, setFonteFiltro] = useState<string>('tutte');
  const [bandi, setBandi] = useState<Bando[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAllBandi, setShowAllBandi] = useState<boolean>(false);
  const { fonti } = useFonti();

  const [fontiUniche, setFontiUniche] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<Bando[]>([]);
  const [isBandoDropdownOpen, setIsBandoDropdownOpen] = useState<boolean>(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchBandi();
    
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && 
          !dropdownRef.current.contains(event.target as Node) && 
          searchInputRef.current && 
          !searchInputRef.current.contains(event.target as Node)) {
        setIsBandoDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Effect to initialize searchResults with all bandi when component mounts
  useEffect(() => {
    if (bandi.length > 0) {
      setSearchResults(bandi);
    }
  }, [bandi]);

  const fetchBandi = async () => {
    setLoading(true);
    try {
      const bandiCombinati = await SupabaseBandiService.getBandiCombinati();
      const bandiOrdinati = bandiCombinati.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
        const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      setBandi(bandiOrdinati);
      console.log("Bandi page: Caricati bandi combinati:", bandiOrdinati.length);
      
      const setFontiDaiBandi = new Set(bandiOrdinati.map(bando => bando.fonte));
      setFontiUniche(Array.from(setFontiDaiBandi).sort());
    } catch (error) {
      console.error("Errore nel recupero dei bandi:", error);
      toast({
        title: "Errore",
        description: "Impossibile recuperare i bandi dal database",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getBandiFiltrati = () => {
    // Sempre mostrare tutti i bandi quando showAllBandi è true e non ci sono filtri attivi
    if (showAllBandi && filtro === '' && fonteFiltro === 'tutte') {
      return bandi;
    }
    
    return bandi.filter(bando => {
      const matchTestoRicerca = filtro === '' || 
        bando.titolo.toLowerCase().includes(filtro.toLowerCase()) ||
        bando.descrizione?.toLowerCase().includes(filtro.toLowerCase()) ||
        bando.fonte.toLowerCase().includes(filtro.toLowerCase());
      
      const matchFonte = fonteFiltro === 'tutte' || 
        bando.fonte === fonteFiltro;
      
      return matchTestoRicerca && matchFonte;
    });
  };

  const bandiFiltrati = getBandiFiltrati();

  const handleViewDetail = (id: string) => {
    navigate(`/bandi/${id}`);
  };

  const handleDeleteBando = async (id: string) => {
    const success = await SupabaseBandiService.deleteBando(id);
    if (success) {
      setBandi(prevBandi => prevBandi.filter(bando => bando.id !== id));
      
      toast({
        title: "Bando eliminato",
        description: "Il bando è stato rimosso con successo",
        duration: 3000,
      });
    } else {
      toast({
        title: "Errore",
        description: "Impossibile eliminare il bando",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleResetFiltri = () => {
    setFiltro('');
    setFonteFiltro('tutte');
    setShowAllBandi(true);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setFiltro(term);

    if (term) {
      const results = bandi.filter(bando =>
        bando.titolo.toLowerCase().includes(term.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults(bandi);
    }
  };

  const handleBandoClick = (bando: Bando) => {
    setFiltro(bando.titolo);
    setIsBandoDropdownOpen(false);
  };

  const clearSearch = () => {
    setFiltro('');
    setSearchResults(bandi); // Show all bandi when cleared
  };

  const handleBandoInputFocus = () => {
    setIsBandoDropdownOpen(true);
    setSearchResults(bandi); // Show all bandi when input is focused
  };

  const getFontiCombinate = () => {
    const fonteCombinate = new Map<string, string>();
    
    fontiUniche.forEach(fonte => {
      fonteCombinate.set(fonte.toLowerCase(), fonte);
    });
    
    fonti.forEach(fonte => {
      if (fonte.nome) {
        fonteCombinate.set(fonte.nome.toLowerCase(), fonte.nome);
      }
    });
    
    return Array.from(fonteCombinate.values()).sort();
  };

  const fontiCombinate = getFontiCombinate();

  const handleFonteChange = (value: string) => {
    setFonteFiltro(value);
    setShowAllBandi(true); // Mostriamo sempre i risultati quando si cambia la fonte
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Elenco Bandi</h1>
      </div>
      
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-4">
          <CardTitle>Filtra Bandi</CardTitle>
          <CardDescription>Ricerca e filtra i bandi in base ai tuoi criteri</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="relative flex-grow">
              <label htmlFor="bando" className="text-sm font-medium mb-1 block text-slate-700">Cerca</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  ref={searchInputRef}
                  type="text"
                  id="bando"
                  placeholder="Cerca bando per titolo..."
                  value={filtro}
                  onChange={handleSearch}
                  onFocus={handleBandoInputFocus}
                  onClick={handleBandoInputFocus}
                  className="pl-10 pr-10"
                  autoComplete="off"
                />
                {filtro && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-1 top-1 h-8 w-8 text-slate-400 hover:text-slate-600"
                    onClick={clearSearch}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              {isBandoDropdownOpen && (
                <div ref={dropdownRef} className="absolute z-50 w-full">
                  <Card className="mt-1 shadow-lg">
                    <CardContent className="p-1">
                      <div className="max-h-60 overflow-y-auto">
                        {searchResults.length > 0 ? (
                          <ul className="divide-y divide-slate-100">
                            {searchResults.map(bando => (
                              <li
                                key={bando.id}
                                className="hover:bg-slate-50 p-2 cursor-pointer rounded-md text-sm"
                                onClick={() => handleBandoClick(bando)}
                              >
                                <div className="font-medium text-slate-800">{bando.titolo}</div>
                                <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                  <span className={`inline-block w-2 h-2 rounded-full ${
                                    bando.tipo === 'europeo' ? 'bg-blue-500' : 
                                    bando.tipo === 'statale' ? 'bg-green-500' :
                                    bando.tipo === 'regionale' ? 'bg-teal-500' : 'bg-gray-500'
                                  }`}></span>
                                  {bando.fonte} · Scadenza: {new Date(bando.scadenza).toLocaleDateString('it-IT')}
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="p-4 text-center text-slate-500">
                            Nessun bando trovato
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
            
            <div className="w-full md:w-48">
              <p className="text-sm font-medium mb-1 block text-slate-700">Seleziona fonte</p>
              <Select value={fonteFiltro} onValueChange={handleFonteChange}>
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
                  {fontiCombinate.map((fonte, index) => (
                    <SelectItem key={`fonte-${index}`} value={fonte}>
                      {fonte}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button variant="outline" onClick={handleResetFiltri}>Azzera filtri</Button>
          </div>
        </CardContent>
      </Card>
      
      <div>
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        ) : bandiFiltrati.length === 0 ? (
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
              Mostra {bandiFiltrati.length} bandi
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bandiFiltrati.map((bando, index) => (
                <div key={bando.id} className={index % 2 === 0 ? "" : "bg-[#FEF7CD] rounded-lg"}>
                  <BandoCard 
                    bando={bando} 
                    onViewDetails={handleViewDetail}
                    onDelete={handleDeleteBando}
                    showFullDetails={true}
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
