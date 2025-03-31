
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

  useEffect(() => {
    fetchFonti();
  }, []);

  return {
    fonti,
    isLoading,
    fetchFonti,
  };
};
