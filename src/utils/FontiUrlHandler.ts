
import { Fonte } from '@/types';
import WebhookService from '@/utils/WebhookService';
import { useToast } from '@/components/ui/use-toast';

export const useFontiUrlHandler = () => {
  const { toast } = useToast();

  const handleSaveUrl = async (fonte: Fonte, newUrl: string): Promise<boolean> => {
    const updatedFonte = { ...fonte, url: newUrl };
    
    try {
      // Verifica se la configurazione del webhook è completa
      const webhookUrl = localStorage.getItem('n8nWebhookUrl');
      
      if (!webhookUrl) {
        toast({
          title: "Webhook non configurato",
          description: "Configura l'URL del webhook n8n nelle impostazioni",
          variant: "default",
        });
        return false;
      }
      
      console.log("Tentativo di aggiornare fonte tramite webhook:", updatedFonte);
      const updated = await WebhookService.sendToWebhook(updatedFonte, 'update');
      
      if (updated) {
        toast({
          title: "URL aggiornato",
          description: "L'URL della fonte è stato aggiornato con successo e inviato a n8n",
        });
        return true;
      } else {
        toast({
          title: "URL aggiornato parzialmente",
          description: "L'URL è stato aggiornato localmente ma c'è stato un problema con l'invio a n8n.",
          variant: "default"
        });
        return false;
      }
    } catch (error) {
      console.error("Errore completo durante l'aggiornamento:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiornamento dell'URL: " + 
          (error instanceof Error ? error.message : "Errore di comunicazione"),
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    handleSaveUrl
  };
};
