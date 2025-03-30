
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RefreshCw, FileSpreadsheet, ArrowRight } from 'lucide-react';
import GoogleSheetsService from '@/utils/GoogleSheetsService';
import { Bando } from '@/types';
import SupabaseBandiService from '@/utils/SupabaseBandiService';
import { useBandiData } from '@/hooks/useBandiData';

const ImportaBandi = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [bandiAnteprima, setBandiAnteprima] = useState<Bando[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [importStats, setImportStats] = useState<{
    total: number;
    saved: number;
    nuovi: number;
  } | null>(null);
  
  // Otteniamo la funzione fetchBandi da useBandiData per aggiornare l'elenco dopo l'importazione
  const { fetchBandi, bandi: bandiEsistenti } = useBandiData();
  
  const handleImportBandi = async () => {
    setIsLoading(true);
    setError(null);
    setImportStats(null);
    
    try {
      // Recupera l'URL salvato nell'area privata
      const googleSheetUrl = GoogleSheetsService.getSheetUrl();
      
      if (!googleSheetUrl) {
        setError("URL del foglio Google non configurato nell'area privata. Configura l'URL nelle impostazioni.");
        toast({
          title: "Configurazione mancante",
          description: "URL del foglio Google non configurato nell'area privata",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      console.log('Iniziando importazione da URL salvato');
      
      // Recupera i bandi dal foglio Google
      const bandi = await GoogleSheetsService.fetchBandiFromSheet();
      console.log('Bandi ottenuti dal foglio:', bandi?.length);
      
      if (!bandi || bandi.length === 0) {
        setError("Nessun bando trovato nel foglio Google Sheets");
        toast({
          title: "Nessun dato trovato",
          description: "Nessun bando trovato nel foglio",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Filtro per trovare solo i nuovi bandi (non presenti in bandiEsistenti)
      // Creo una mappa dei bandi esistenti usando titolo+fonte come chiave
      const bandiEsistentiMap = new Map();
      bandiEsistenti.forEach(bando => {
        const chiave = `${bando.titolo.toLowerCase().trim()}|${bando.fonte.toLowerCase().trim()}`;
        bandiEsistentiMap.set(chiave, true);
      });
      
      // Filtro i nuovi bandi
      const nuoviBandi = bandi.filter(bando => {
        const chiave = `${bando.titolo.toLowerCase().trim()}|${bando.fonte.toLowerCase().trim()}`;
        return !bandiEsistentiMap.has(chiave);
      });
      
      console.log(`Trovati ${nuoviBandi.length} nuovi bandi su ${bandi.length} totali`);
      
      // Mostra anteprima dei nuovi bandi
      setBandiAnteprima(nuoviBandi);
      
      // Salva i nuovi bandi in Supabase
      let contatoreSalvati = 0;
      for (const bando of nuoviBandi) {
        try {
          // Assicurati che tutti i campi richiesti siano presenti
          const bandoCompleto = {
            ...bando,
            fonte: bando.fonte || 'Google Sheet',
            tipo: bando.tipo || 'altro',
            settori: bando.settori || []
          };
          
          console.log(`Salvando bando: ${bandoCompleto.titolo}`);
          
          const success = await SupabaseBandiService.saveBando(bandoCompleto);
          
          if (success) {
            contatoreSalvati++;
            console.log(`Bando salvato: ${contatoreSalvati}/${nuoviBandi.length}`);
          } else {
            console.error('Errore nel salvataggio del bando:', bando.titolo);
          }
        } catch (err) {
          console.error(`Errore nel salvataggio del bando: ${bando.titolo}`, err);
        }
      }
      
      setImportStats({
        total: bandi.length,
        saved: contatoreSalvati,
        nuovi: nuoviBandi.length
      });
      
      toast({
        title: "Importazione completata",
        description: `Importati ${contatoreSalvati} nuovi bandi su ${nuoviBandi.length} trovati`,
      });
      
      // Aggiorna l'elenco dei bandi nella pagina principale
      await fetchBandi();
      
    } catch (error: any) {
      console.error('Errore durante l\'importazione:', error);
      setError(error.message || "Errore durante l'importazione");
      toast({
        title: "Errore di importazione",
        description: error.message || "Si è verificato un errore durante l'importazione",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewBandi = () => {
    navigate('/bandi');
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Importa Bandi</h1>
        
        <Button 
          onClick={handleViewBandi} 
          variant="outline"
        >
          Visualizza Bandi
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center space-x-2">
          <FileSpreadsheet className="h-5 w-5 text-blue-500" />
          <div>
            <h2 className="text-lg font-medium">Importazione Bandi</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={handleImportBandi} 
                disabled={isLoading} 
                className="w-full md:w-auto md:px-8 bg-blue-500 hover:bg-blue-600 text-white"
                variant="secondary"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Importazione in corso...
                  </>
                ) : (
                  <>
                    Importa Bandi
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
            
            {importStats && (
              <div className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-200">
                <h3 className="font-medium text-blue-800 mb-2">Riepilogo importazione</h3>
                <ul className="space-y-1 text-sm text-blue-700">
                  <li>Totale bandi nel foglio: <span className="font-semibold">{importStats.total}</span></li>
                  <li>Nuovi bandi trovati: <span className="font-semibold">{importStats.nuovi}</span></li>
                  <li>Bandi salvati in database: <span className="font-semibold">{importStats.saved}</span></li>
                </ul>
              </div>
            )}
            
            {bandiAnteprima.length > 0 && (
              <div className="space-y-2 mt-4">
                <h3 className="font-medium">Anteprima nuovi bandi importati</h3>
                <div className="rounded-md border overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-4 py-3 text-left">Titolo</th>
                        <th className="px-4 py-3 text-left">Fonte</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bandiAnteprima.map((bando, index) => (
                        <tr key={index} className="border-b">
                          <td className="px-4 py-3">{bando.titolo}</td>
                          <td className="px-4 py-3">{bando.fonte}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-gray-500 italic">
                  Visualizzazione di {bandiAnteprima.length} nuovi bandi
                </p>
              </div>
            )}
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Errore</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportaBandi;
