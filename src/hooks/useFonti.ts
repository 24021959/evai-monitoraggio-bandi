import { useState, useEffect } from 'react';
import { Fonte } from '@/types';
import SupabaseFontiService from '@/utils/SupabaseFontiService';
import { useToast } from "@/components/ui/use-toast";
import WebhookService from '@/utils/WebhookService';

export const useFonti = () => {
  const [fonti, setFonti] = useState<Fonte[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [importingFromSheets, setImportingFromSheets] = useState<boolean>(false);
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

  const importFromGoogleSheets = async () => {
    setImportingFromSheets(true);
    try {
      const googleSheetUrl = localStorage.getItem('googleSheetUrl');
      if (!googleSheetUrl) {
        toast({
          title: "Configurazione mancante",
          description: "L'URL del foglio Google non è stato configurato. Contattare l'amministratore.",
          variant: "destructive",
        });
        return;
      }
      
      const newSources = await SupabaseFontiService.importFromGoogleSheets(googleSheetUrl);
      if (newSources) {
        fetchFonti();
        toast({
          title: "Fonti importate",
          description: `Importate ${newSources.length} nuove fonti dal foglio Google Sheets`,
        });
      } else {
        toast({
          title: "Nessuna nuova fonte",
          description: "Nessuna nuova fonte da importare dal foglio Google Sheets",
        });
      }
    } catch (error: any) {
      console.error("Errore durante l'importazione da Google Sheets:", error);
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante l'importazione",
        variant: "destructive",
      });
    } finally {
      setImportingFromSheets(false);
    }
  };

  const handleAddSource = async (newSource: Omit<Fonte, 'id'>): Promise<boolean> => {
  try {
    // Add the source to the database
    const savedFonte = await SupabaseFontiService.addFonte(newSource);
    
    if (savedFonte) {
      // Refresh the list of sources
      fetchFonti();
      
      // Try to send to webhook if configured
      const webhookUrl = localStorage.getItem('n8nWebhookUrl');
      if (webhookUrl) {
        try {
          await WebhookService.sendToWebhook(savedFonte, 'add');
          console.log("Fonte aggiunta inviata a webhook n8n");
        } catch (webhookError) {
          console.error("Errore nell'invio della nuova fonte al webhook:", webhookError);
        }
      }
      
      return true;
    }
    return false;
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

const handleDelete = async (id: string) => {
  try {
    // Get the fonte before deleting it
    const fonteToDelete = fonti.find(f => f.id === id);
    
    if (!fonteToDelete) {
      toast({
        title: "Errore",
        description: "Fonte non trovata",
        variant: "destructive",
      });
      return false;
    }
    
    // Delete the source from the database
    const success = await SupabaseFontiService.deleteFonte(id);
    
    if (success) {
      // Refresh the list of sources
      setFonti(prevFonti => prevFonti.filter(f => f.id !== id));
      
      // Try to send to webhook if configured
      const webhookUrl = localStorage.getItem('n8nWebhookUrl');
      if (webhookUrl) {
        try {
          await WebhookService.sendToWebhook(fonteToDelete, 'delete');
          console.log("Eliminazione fonte inviata a webhook n8n");
        } catch (webhookError) {
          console.error("Errore nell'invio dell'eliminazione al webhook:", webhookError);
        }
      }
      
      toast({
        title: "Fonte eliminata",
        description: "La fonte è stata eliminata con successo",
      });
      return true;
    } else {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'eliminazione della fonte",
        variant: "destructive",
      });
      return false;
    }
  } catch (error) {
    console.error("Errore durante l'eliminazione:", error);
    toast({
      title: "Errore",
      description: "Si è verificato un errore durante l'eliminazione della fonte",
      variant: "destructive",
    });
    return false;
  }
};

  return {
    fonti,
    isLoading,
    importingFromSheets,
    fetchFonti,
    importFromGoogleSheets,
    handleAddSource,
    handleDelete,
  };
};
