
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { ArrowRight, AlertCircle, RefreshCw, FileSpreadsheet } from 'lucide-react';
import GoogleSheetsService from '@/utils/GoogleSheetsService';
import { Bando } from '@/types';
import SupabaseBandiService from '@/utils/SupabaseBandiService';
import { useBandiData } from '@/hooks/useBandiData';

const ImportaBandi = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [googleSheetUrl, setGoogleSheetUrl] = useState<string>(
    GoogleSheetsService.getSheetUrl() || 
    "https://docs.google.com/spreadsheets/d/1E4ZR9tgeBZV545JJuduvWHtlRqo5GyW_woBXt8ooQ8E/edit?gid=0"
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [bandiAnteprima, setBandiAnteprima] = useState<Bando[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [importStats, setImportStats] = useState<{
    total: number;
    saved: number;
  } | null>(null);
  
  // Otteniamo la funzione fetchBandi da useBandiData per aggiornare l'elenco dopo l'importazione
  const { fetchBandi } = useBandiData();
  
  const handleImportBandi = async () => {
    if (!googleSheetUrl) {
      toast({
        title: "Errore",
        description: "Inserisci l'URL di un foglio Google Sheets",
        variant: "destructive",
      });
      return;
    }
    
    // Salva l'URL del foglio
    GoogleSheetsService.setSheetUrl(googleSheetUrl);
    
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
      
      // Salva i bandi in Supabase
      let contatoreSalvati = 0;
      for (const bando of bandi) {
        try {
          // Assicurati che tutti i campi richiesti siano presenti
          const bandoCompleto = {
            ...bando,
            // Assicura che i campi abbiano valori predefiniti se mancanti
            fonte: bando.fonte || 'Google Sheet',
            tipo: bando.tipo || 'altro',
            settori: bando.settori || [],
            scadenza: bando.scadenza || ''
          };
          
          console.log(`Salvando bando: ${bandoCompleto.titolo} (${bandoCompleto.id})`);
          
          const success = await SupabaseBandiService.saveBando(bandoCompleto);
          
          if (success) {
            contatoreSalvati++;
            console.log(`Bando salvato: ${contatoreSalvati}/${bandi.length}`);
          } else {
            console.error('Errore nel salvataggio del bando:', bando.titolo);
          }
        } catch (err) {
          console.error(`Errore nel salvataggio del bando: ${bando.titolo}`, err);
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
      
      // Aggiorna l'elenco dei bandi nella pagina principale
      await fetchBandi();
      
      // Mostra messaggio di successo
      if (contatoreSalvati > 0) {
        toast({
          title: "Importazione riuscita",
          description: `Ora puoi visualizzare i bandi importati nella pagina Bandi`,
        });
      }
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
            <h2 className="text-lg font-medium">Importazione da Google Sheets</h2>
            <p className="text-sm text-gray-500">
              Importa bandi da un foglio Google Sheets pubblico
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="googleSheetUrl" className="text-sm font-medium">URL del foglio Google Sheets</label>
              <Input
                id="googleSheetUrl"
                value={googleSheetUrl}
                onChange={(e) => setGoogleSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Inserisci l'URL di un foglio Google Sheets pubblico contenente i dati dei bandi
              </p>
            </div>
            
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
              
              {importStats && importStats.saved > 0 && (
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
                        <th className="px-4 py-3 text-left">Scadenza</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bandiAnteprima.map((bando, index) => (
                        <tr key={index} className="border-b">
                          <td className="px-4 py-3">{bando.titolo}</td>
                          <td className="px-4 py-3">{bando.fonte}</td>
                          <td className="px-4 py-3">{bando.scadenza || 'N/D'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-gray-500 italic">
                  Visualizzazione dei primi {bandiAnteprima.length} record
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
