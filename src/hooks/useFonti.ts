
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { Fonte } from '@/types';
import SupabaseFontiService from '@/utils/SupabaseFontiService';
import GoogleSheetsService from '@/utils/GoogleSheetsService';

export function useFonti() {
  const { toast } = useToast();
  const [fonti, setFonti] = useState<Fonte[]>([]);
  const [selectedFonte, setSelectedFonte] = useState<Fonte | null>(null);
  const [importingFromSheets, setImportingFromSheets] = useState(false);
  
  const { data: supabaseFonti, isLoading, refetch } = useQuery({
    queryKey: ['fonti'],
    queryFn: async () => {
      const sources = await SupabaseFontiService.getFonti();
      console.log('Fonti caricate da Supabase:', sources);
      return sources;
    }
  });
  
  useEffect(() => {
    if (supabaseFonti && supabaseFonti.length > 0) {
      setFonti(supabaseFonti);
    }
  }, [supabaseFonti]);

  const handleEdit = (id: string) => {
    const fonte = fonti.find(f => f.id === id);
    if (fonte) {
      setSelectedFonte(fonte);
    }
  };
  
  const handleSaveEdit = async (updatedFonte: Fonte) => {
    setFonti(fonti.map(f => f.id === updatedFonte.id ? updatedFonte : f));
    try {
      const success = await SupabaseFontiService.saveFonte(updatedFonte);
      if (success) {
        toast({
          title: "Fonte aggiornata",
          description: "La fonte è stata aggiornata con successo",
          duration: 3000,
        });
      } else {
        toast({
          title: "Errore",
          description: "Si è verificato un errore durante l'aggiornamento della fonte",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: `Si è verificato un errore: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`,
        variant: "destructive",
        duration: 3000,
      });
    }
    setSelectedFonte(null);
  };
  
  const handleCancelEdit = () => {
    setSelectedFonte(null);
  };
  
  const handleDelete = async (id: string) => {
    try {
      const success = await SupabaseFontiService.deleteFonte(id);
      if (success) {
        setFonti(fonti.filter(fonte => fonte.id !== id));
        toast({
          title: "Fonte eliminata",
          description: "La fonte è stata eliminata con successo",
          duration: 3000,
        });
      } else {
        toast({
          title: "Errore",
          description: "Si è verificato un errore durante l'eliminazione della fonte",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: `Si è verificato un errore: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`,
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleAddSource = async (newSource: Omit<Fonte, 'id'>) => {
    try {
      const newFonte: Fonte = { id: `temp-${Date.now()}`, ...newSource };
      const success = await SupabaseFontiService.saveFonte(newFonte);
      if (success) {
        const updatedFonti = await SupabaseFontiService.getFonti();
        setFonti(updatedFonti);
        toast({
          title: "Fonte aggiunta",
          description: "La fonte è stata aggiunta con successo",
          duration: 3000,
        });
        return true;
      } else {
        toast({
          title: "Errore",
          description: "Si è verificato un errore durante l'aggiunta della fonte",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: `Si è verificato un errore: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`,
        variant: "destructive",
        duration: 3000,
      });
    }
    return false;
  };

  const importFromGoogleSheets = async () => {
    const sheetUrl = localStorage.getItem('googleSheetUrl');
    if (!sheetUrl) {
      toast({
        title: "URL non configurato",
        description: "Configura prima l'URL del foglio Google Sheets",
        variant: "destructive",
      });
      return;
    }

    setImportingFromSheets(true);
    try {
      const fontesFromSheet = await GoogleSheetsService.fetchFontiFromSheet(sheetUrl);
      if (fontesFromSheet.length === 0) {
        toast({
          title: "Nessuna fonte trovata",
          description: "Il foglio Google non contiene fonti o non è accessibile",
          variant: "destructive",
        });
        return;
      }

      // Save fonti to Supabase
      const savedCount = await SupabaseFontiService.saveFonti(fontesFromSheet);
      
      // Refresh the list
      const updatedFonti = await SupabaseFontiService.getFonti();
      setFonti(updatedFonti);
      
      toast({
        title: "Importazione completata",
        description: `Importate ${savedCount} fonti dal foglio Google Sheets`,
      });
    } catch (error) {
      console.error('Errore durante l\'importazione:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'importazione delle fonti",
        variant: "destructive",
      });
    } finally {
      setImportingFromSheets(false);
    }
  };

  return {
    fonti,
    isLoading,
    selectedFonte,
    importingFromSheets,
    handleEdit,
    handleSaveEdit,
    handleCancelEdit,
    handleDelete,
    handleAddSource,
    importFromGoogleSheets
  };
}
