
import { useState, useEffect } from 'react';
import { Bando } from '@/types';
import SupabaseBandiService from '@/utils/SupabaseBandiService';
import { useToast } from "@/components/ui/use-toast";
import { useFonti } from '@/hooks/useFonti';
import { useNavigate } from 'react-router-dom';

export const useBandiData = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState<string>('');
  const [fonteFiltro, setFonteFiltro] = useState<string>('tutte');
  const [bandi, setBandi] = useState<Bando[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAllBandi, setShowAllBandi] = useState<boolean>(false);
  const { fonti } = useFonti();
  const [fontiUniche, setFontiUniche] = useState<string[]>([]);

  useEffect(() => {
    fetchBandi();
  }, []);

  const fetchBandi = async () => {
    setLoading(true);
    try {
      console.log("useBandiData: Recupero bandi...");
      // Recupera i bandi direttamente da Supabase, non dai bandi combinati
      // per assicurarsi che vengano mostrati i nuovi bandi salvati
      const bandiRecuperati = await SupabaseBandiService.getBandi();
      
      // Ordina i bandi per data di creazione (più recenti prima)
      const bandiOrdinati = bandiRecuperati.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
        const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      
      setBandi(bandiOrdinati);
      console.log(`useBandiData: Caricati ${bandiOrdinati.length} bandi`);
      
      // Estrai le fonti uniche dai bandi e ordina alfabeticamente
      const setFontiDaiBandi = new Set(
        bandiOrdinati
          .filter(bando => bando.fonte && bando.fonte.trim() !== '')
          .map(bando => bando.fonte)
      );
      
      setFontiUniche(Array.from(setFontiDaiBandi).sort());
      console.log(`useBandiData: Trovate ${setFontiDaiBandi.size} fonti uniche`);
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
        (bando.descrizione && bando.descrizione.toLowerCase().includes(filtro.toLowerCase())) ||
        bando.fonte.toLowerCase().includes(filtro.toLowerCase());
      
      // Modifica qui: confronta le fonti in modo case-insensitive
      const matchFonte = fonteFiltro === 'tutte' || 
        bando.fonte.toLowerCase() === fonteFiltro.toLowerCase();
      
      return matchTestoRicerca && matchFonte;
    });
  };

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

  const getFontiCombinate = () => {
    const fonteCombinate = new Map<string, string>();
    
    // Aggiungi fonti dai bandi
    fontiUniche.forEach(fonte => {
      if (fonte) {
        fonteCombinate.set(fonte.toLowerCase(), fonte);
      }
    });
    
    // Aggiungi fonti dalle configurazioni
    fonti.forEach(fonte => {
      if (fonte.nome) {
        fonteCombinate.set(fonte.nome.toLowerCase(), fonte.nome);
      }
    });
    
    return Array.from(fonteCombinate.values()).sort();
  };

  return {
    bandi,
    filtro,
    setFiltro,
    fonteFiltro,
    setFonteFiltro,
    loading,
    showAllBandi,
    setShowAllBandi,
    bandiFiltrati: getBandiFiltrati(),
    handleViewDetail,
    handleDeleteBando,
    handleResetFiltri,
    fontiCombinate: getFontiCombinate(),
    fontiUniche,
    fetchBandi
  };
};
