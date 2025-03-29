import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { Fonte } from '@/types';
import SupabaseFontiService from '@/utils/SupabaseFontiService';
import GoogleSheetsService from '@/utils/GoogleSheetsService';
import WebhookService from '@/utils/WebhookService';

export function useFonti() {
  const { toast } = useToast();
  const [fonti, setFonti] = useState<Fonte[]>([]);
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
  
  const handleDelete = async (id: string) => {
    try {
      const fonteToDelete = fonti.find(fonte => fonte.id === id);
      
      if (!fonteToDelete) {
        toast({
          title: "Errore",
          description: "Fonte non trovata",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      const webhookUrl = localStorage.getItem('n8nWebhookUrl');
      if (webhookUrl) {
        try {
          console.log("Notifica n8n dell'eliminazione della fonte:", fonteToDelete);
          await WebhookService.sendToWebhook(fonteToDelete, 'delete');
        } catch (webhookError) {
          console.error("Errore durante la notifica n8n dell'eliminazione:", webhookError);
        }
      }
      
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

  const handleAddSource = async (newSource: Omit<Fonte, 'id'>): Promise<boolean> => {
    try {
      console.log("Aggiunta fonte:", newSource);
      
      const duplicates = fonti.filter(fonte => 
        fonte.url.trim().toLowerCase() === newSource.url.trim().toLowerCase()
      );
      
      if (duplicates.length > 0) {
        console.log("URL duplicato trovato:", duplicates[0]);
        toast({
          title: "URL duplicato",
          description: `Esiste già una fonte con questo URL: "${duplicates[0].nome}"`,
          variant: "destructive",
          duration: 3000,
        });
        return false;
      }
      
      const newFonte: Fonte = { 
        id: `temp-${Date.now()}`, 
        ...newSource 
      };
      
      const webhookUrl = localStorage.getItem('n8nWebhookUrl');
      if (webhookUrl) {
        try {
          console.log("Tentativo di sincronizzare con n8n:", newFonte);
          await WebhookService.sendToWebhook(newFonte, 'add');
        } catch (webhookError) {
          console.error("Errore durante la sincronizzazione con n8n:", webhookError);
        }
      }
      
      const success = await SupabaseFontiService.saveFonte(newFonte);
      if (success) {
        await refetch();
        
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
      console.error("Errore durante l'aggiunta della fonte:", error);
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
      console.log('Importazione da Google Sheets iniziata');
      const fontesFromSheet = await GoogleSheetsService.fetchFontiFromSheet(sheetUrl);
      
      if (fontesFromSheet.length === 0) {
        toast({
          title: "Nessuna fonte trovata",
          description: "Il foglio Google non contiene fonti o non è accessibile",
          variant: "destructive",
        });
        return;
      }

      console.log(`Trovate ${fontesFromSheet.length} fonti da importare:`, fontesFromSheet);

      let savedCount = 0;
      for (const fonte of fontesFromSheet) {
        try {
          const saved = await SupabaseFontiService.saveFonte(fonte);
          if (saved) {
            savedCount++;
          }
        } catch (err) {
          console.error(`Errore nel salvare la fonte ${fonte.url}:`, err);
        }
      }
      
      await refetch();
      
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
    importingFromSheets,
    handleDelete,
    handleAddSource,
    importFromGoogleSheets
  };
}
