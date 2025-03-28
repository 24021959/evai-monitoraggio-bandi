
import { Fonte } from '@/types';
import GoogleSheetsService from '@/utils/GoogleSheetsService';
import { useToast } from '@/components/ui/use-toast';

export const useFontiUrlHandler = () => {
  const { toast } = useToast();

  const handleSaveUrl = async (fonte: Fonte, newUrl: string): Promise<boolean> => {
    const updatedFonte = { ...fonte, url: newUrl };
    
    try {
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
          description: "L'URL è stato aggiornato localmente. Per aggiornare il foglio Google, configurare l'URL di aggiornamento.",
          variant: "default"
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiornamento dell'URL",
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
