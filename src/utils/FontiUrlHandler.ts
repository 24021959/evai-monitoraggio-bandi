
import { Fonte } from '@/types';
import WebhookService from '@/utils/WebhookService';
import { useToast } from '@/components/ui/use-toast';

export const useFontiUrlHandler = () => {
  const { toast } = useToast();

  const handleSaveUrl = async (fonte: Fonte, newUrl: string): Promise<boolean> => {
    const updatedFonte = { ...fonte, url: newUrl };
    
    try {
      // Get the webhook URL from localStorage, which will be set in the admin panel
      const webhookUrl = localStorage.getItem('n8nWebhookUrl');
      
      console.log("Tentativo di aggiornare fonte:", updatedFonte);
      
      // If webhook is configured, try to send the update
      if (webhookUrl) {
        try {
          await WebhookService.sendToWebhook(updatedFonte, 'update');
          console.log("Inviato aggiornamento a webhook n8n");
        } catch (webhookError) {
          console.error("Errore nell'invio al webhook:", webhookError);
        }
      }
      
      toast({
        title: "URL aggiornato",
        description: "L'URL della fonte è stato aggiornato con successo",
      });
      return true;
      
    } catch (error) {
      console.error("Errore durante l'aggiornamento:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiornamento dell'URL",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    handleSaveUrl
  };
};
