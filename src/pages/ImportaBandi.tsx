
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
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
  } | null>(null);
  
  // Get the fetchBandi function from useBandiData to refresh the bandi list after import
  const { fetchBandi } = useBandiData();
  
  const handleImportBandi = async () => {
    // Recupera l'URL del foglio Google dalla configurazione o usa un valore hardcoded per test
    const googleSheetUrl = GoogleSheetsService.getSheetUrl() || 
      "https://docs.google.com/spreadsheets/d/1E4ZR9tgeBZV545JJuduvWHtlRqo5GyW_woBXt8ooQ8E/edit?gid=0#gid=0";
    
    if (!googleSheetUrl) {
      toast({
        title: "Configurazione mancante",
        description: "L'URL del foglio Google non è stato configurato.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setImportStats(null);
    
    try {
      console.log('Iniziando importazione da:', googleSheetUrl);
      
      // Recupera i bandi dal foglio Google
      const bandi = await GoogleSheetsService.fetchBandiFromSheet(googleSheetUrl);
      console.log('Bandi ottenuti dal foglio:', bandi?.length);
      
      if (!bandi || bandi.length === 0) {
        setError("Nessun bando trovato nel foglio Google Sheets. Verifica che il formato sia corretto.");
        toast({
          title: "Nessun dato trovato",
          description: "Nessun bando trovato nel foglio. Verifica che il formato sia corretto.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Mostra anteprima dei primi bandi
      const anteprima = bandi.slice(0, 20);
      setBandiAnteprima(anteprima);
      
      // Salva tutti i bandi senza controllo duplicati - versione semplificata
      let contatoreSalvati = 0;
      for (const bando of bandi) {
        if (!bando.titolo) {
          console.warn('Bando senza titolo, saltato:', bando);
          continue;
        }
        
        try {
          // Assicurati che tutti i campi richiesti siano presenti e correttamente formattati
          const bandoCompleto = {
            ...bando,
            fonte: bando.fonte || 'Google Sheet',
            tipo: bando.tipo || 'altro',
            settori: bando.settori || [],
            // Make sure scadenza is in YYYY-MM-DD format for database compatibility
            scadenza: bando.scadenza || new Date().toISOString().split('T')[0]
          };
          
          console.log(`Tentativo di salvataggio bando: ${bandoCompleto.titolo}`);
          console.log('Dati bando per il salvataggio:', JSON.stringify(bandoCompleto));
          
          const success = await SupabaseBandiService.saveBando(bandoCompleto);
          
          if (success) {
            contatoreSalvati++;
            console.log(`Bando salvato con successo (${contatoreSalvati}/${bandi.length}): ${bando.titolo}`);
          } else {
            console.error('Errore nel salvataggio del bando in Supabase:', bando.titolo);
          }
        } catch (err) {
          console.error(`Errore nell'elaborazione del bando: ${bando.titolo}`, err);
        }
      }
      
      setImportStats({
        total: bandi.length,
        saved: contatoreSalvati
      });
      
      toast({
        title: "Importazione completata",
        description: `Importati ${contatoreSalvati} bandi su ${bandi.length} dal foglio Google Sheets`,
      });
      
      // Refresh the bandi list after import
      await fetchBandi();
    } catch (error: any) {
      console.error('Errore dettagliato durante l\'importazione:', error);
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
        <CardHeader className="pb-3">
          <h2 className="text-lg font-medium">Importazione da Google Sheets</h2>
          <p className="text-sm text-gray-500">
            Importa bandi da un foglio Google Sheets pubblico.
          </p>
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
              
              {importStats && (
                <Button
                  onClick={handleViewBandi}
                  variant="outline"
                  className="w-full md:w-auto"
                >
                  Visualizza bandi importati
                </Button>
              )}
            </div>
            
            {importStats && (
              <div className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-200">
                <h3 className="font-medium text-blue-800 mb-2">Riepilogo importazione</h3>
                <ul className="space-y-1 text-sm text-blue-700">
                  <li>Totale bandi nel foglio: <span className="font-semibold">{importStats.total}</span></li>
                  <li>Bandi salvati in database: <span className="font-semibold">{importStats.saved}</span></li>
                </ul>
              </div>
            )}
            
            {bandiAnteprima.length > 0 && (
              <div className="space-y-2 mt-4">
                <h3 className="font-medium">Anteprima bandi dal foglio</h3>
                <div className="rounded-md border overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-4 py-3 text-left">Titolo</th>
                        <th className="px-4 py-3 text-left">Fonte</th>
                        <th className="px-4 py-3 text-left">Tipo</th>
                        <th className="px-4 py-3 text-left">Scadenza</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bandiAnteprima.map((bando, index) => (
                        <tr key={index} className="border-b">
                          <td className="px-4 py-3">{bando.titolo}</td>
                          <td className="px-4 py-3">{bando.fonte}</td>
                          <td className="px-4 py-3">{bando.tipo || 'altro'}</td>
                          <td className="px-4 py-3">{bando.scadenza || 'N/D'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-gray-500 italic">
                  Visualizzazione dei primi {bandiAnteprima.length} record.
                  {bandiAnteprima.length < (importStats?.total || 0) && 
                    ` (su ${importStats?.total} totali)`}
                </p>
              </div>
            )}
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
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
