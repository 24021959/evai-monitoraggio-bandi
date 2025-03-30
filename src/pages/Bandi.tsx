
import React, { useState, useEffect } from 'react';
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

  // Array per tenere traccia delle fonti disponibili, senza duplicati
  const [fontiUniche, setFontiUniche] = useState<string[]>([]);

  useEffect(() => {
    const fetchBandi = async () => {
      setLoading(true);
      try {
        const bandiCombinati = await SupabaseBandiService.getBandiCombinati();
        // Ordina i bandi dal più recente al meno recente
        const bandiOrdinati = bandiCombinati.sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
          const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
          return dateB.getTime() - dateA.getTime();
        });
        setBandi(bandiOrdinati);
        console.log("Bandi page: Caricati bandi combinati:", bandiOrdinati.length);
        
        // Estrai le fonti uniche dai bandi
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

    fetchBandi();
  }, [toast]);

  const getBandiFiltrati = () => {
    // Se showAllBandi è true o non ci sono filtri, mostra tutti i bandi
    if (showAllBandi && filtro === '' && fonteFiltro === 'tutte') {
      return bandi;
    }
    
    return bandi.filter(bando => {
      // Filtro per testo di ricerca
      const matchTestoRicerca = !filtro || 
        bando.titolo.toLowerCase().includes(filtro.toLowerCase()) ||
        bando.descrizione?.toLowerCase().includes(filtro.toLowerCase()) ||
        bando.fonte.toLowerCase().includes(filtro.toLowerCase());
      
      // Filtro per fonte
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

  const handleSearchFocus = () => {
    // Quando l'utente clicca sulla casella di ricerca, mostra tutti i bandi
    setShowAllBandi(true);
  };

  const handleSearchBlur = () => {
    // Non resettiamo showAllBandi quando si sfoca l'input
    // In questo modo i bandi rimangono visibili
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiltro(e.target.value);
    
    // Se l'utente sta cercando qualcosa, applica il filtro
    if (e.target.value) {
      setShowAllBandi(false);
    } else {
      // Se la ricerca è vuota, mostra tutti i bandi
      setShowAllBandi(true);
    }
  };

  // Combina le fonti dai bandi e dalle configurazioni delle fonti
  const getFontiCombinate = () => {
    // Inizia con le fonti uniche dai bandi
    const fonteCombinate = new Map<string, string>();
    
    // Aggiungi le fonti dai bandi
    fontiUniche.forEach(fonte => {
      fonteCombinate.set(fonte.toLowerCase(), fonte);
    });
    
    // Aggiungi le fonti dalla configurazione
    fonti.forEach(fonte => {
      if (fonte.nome) {
        fonteCombinate.set(fonte.nome.toLowerCase(), fonte.nome);
      }
    });
    
    // Converti la mappa in array e ordina
    return Array.from(fonteCombinate.values()).sort();
  };

  const fontiCombinate = getFontiCombinate();

  const handleFonteChange = (value: string) => {
    setFonteFiltro(value);
    // Quando si seleziona una fonte specifica, disattiviamo showAllBandi
    // per mostrare solo i bandi filtrati per quella fonte
    if (value !== 'tutte') {
      setShowAllBandi(false);
    } else {
      // Se si seleziona "tutte le fonti", torniamo a mostrare tutti i bandi
      setShowAllBandi(true);
    }
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
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Cerca bandi..."
                className="pl-9"
                value={filtro}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
              />
              {filtro && (
                <button
                  className="absolute right-2.5 top-2.5"
                  onClick={() => {
                    setFiltro('');
                    setShowAllBandi(true);
                  }}
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-3">
              <div className="w-48">
                <p className="text-sm font-medium mb-1">Seleziona fonte</p>
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
