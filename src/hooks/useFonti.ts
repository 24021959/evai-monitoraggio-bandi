
import { useState, useEffect } from 'react';
import { Fonte } from '@/types';
import SupabaseFontiService from '@/utils/SupabaseFontiService';
import { useToast } from "@/hooks/use-toast";

export const useFonti = () => {
  const [fonti, setFonti] = useState<Fonte[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  const fetchFonti = async () => {
    setIsLoading(true);
    try {
      const fonti = await SupabaseFontiService.getFonti();
      setFonti(fonti);
    } catch (error) {
      console.error("Errore nel recupero delle fonti:", error);
      toast({
        title: "Errore",
        description: "Impossibile recuperare le fonti dal database",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Method to add a new source
  const handleAddSource = async (newSource) => {
    try {
      const success = await SupabaseFontiService.saveFonte(newSource);
      if (success) {
        toast({
          title: "Fonte aggiunta",
          description: "La fonte è stata aggiunta con successo",
        });
        await fetchFonti(); // Refresh the list after adding
        return true;
      } else {
        toast({
          title: "Errore",
          description: "Impossibile aggiungere la fonte",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Errore nell'aggiunta della fonte:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiunta della fonte",
        variant: "destructive",
      });
      return false;
    }
  };

  // Method to delete a source
  const handleDelete = async (id: string) => {
    try {
      const success = await SupabaseFontiService.deleteFonte(id);
      if (success) {
        toast({
          title: "Fonte eliminata",
          description: "La fonte è stata eliminata con successo",
        });
        // Update the local state without needing to refetch
        setFonti(prevFonti => prevFonti.filter(fonte => fonte.id !== id));
        return true;
      } else {
        toast({
          title: "Errore",
          description: "Impossibile eliminare la fonte",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Errore nell'eliminazione della fonte:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'eliminazione della fonte",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchFonti();
  }, []);

  return {
    fonti,
    isLoading,
    fetchFonti,
    handleAddSource,
    handleDelete
  };
};
