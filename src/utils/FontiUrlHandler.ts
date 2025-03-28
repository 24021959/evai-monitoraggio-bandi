
import { Fonte } from '@/types';
import GoogleSheetsService from '@/utils/GoogleSheetsService';
import { useToast } from '@/components/ui/use-toast';

export const useFontiUrlHandler = () => {
  const { toast } = useToast();

  const handleSaveUrl = async (fonte: Fonte, newUrl: string): Promise<boolean> => {
    const updatedFonte = { ...fonte, url: newUrl };
    
    try {
      // Verifica se la configurazione è completa
      const sheetUrl = localStorage.getItem('googleSheetUrl');
      const updateUrl = localStorage.getItem('googleSheetUpdateUrl');
      
      if (!sheetUrl || !updateUrl) {
        toast({
          title: "Configurazione incompleta",
          description: "Configura gli URL del foglio Google e dell'aggiornamento nelle impostazioni",
          variant: "default",
        });
        return false;
      }
      
      const updated = await GoogleSheetsService.updateFonteInSheet(updatedFonte);
      
      if (updated) {
        toast({
          title: "URL aggiornato",
          description: "L'URL della fonte è stato aggiornato con successo sia localmente che nel foglio Google",
        });
        return true;
      } else {
        toast({
          title: "URL aggiornato parzialmente",
          description: "L'URL è stato aggiornato localmente ma c'è stato un problema con l'aggiornamento del foglio Google.",
          variant: "default"
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiornamento dell'URL: " + 
          (error instanceof Error ? error.message : "Errore di comunicazione"),
        variant: "destructive"
      });
      console.error("Errore durante l'aggiornamento:", error);
      return false;
    }
  };

  return {
    handleSaveUrl
  };
};
