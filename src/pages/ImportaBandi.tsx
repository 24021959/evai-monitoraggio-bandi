
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileSpreadsheet, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import GoogleSheetsService from '@/utils/GoogleSheetsService';
import { Bando } from '@/types';
import SupabaseBandiService from '@/utils/SupabaseBandiService';

const ImportaBandi = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [googleSheetUrl, setGoogleSheetUrl] = useState(GoogleSheetsService.getSheetUrl() || '');
  const [isLoading, setIsLoading] = useState(false);
  const [bandiAnteprima, setBandiAnteprima] = useState<Bando[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [importStats, setImportStats] = useState<{
    total: number;
    unique: number;
    saved: number;
  } | null>(null);
  
  const handleImportBandi = async () => {
    if (!googleSheetUrl) {
      toast({
        title: "URL mancante",
        description: "Inserisci l'URL del foglio Google Sheets",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setImportStats(null);
    
    try {
      console.log('Iniziando importazione da:', googleSheetUrl);
      GoogleSheetsService.setSheetUrl(googleSheetUrl);
      
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
      
      // Prima recuperiamo i bandi esistenti da Supabase
      const bandiEsistenti = await SupabaseBandiService.getBandi();
      console.log('Bandi già esistenti in Supabase:', bandiEsistenti.length);
      
      // Filtriamo i bandi per escludere duplicati (basati su titolo e fonte)
      const titoliFonteEsistenti = new Set(
        bandiEsistenti.map(b => `${b.titolo.toLowerCase()}|${b.fonte.toLowerCase()}`)
      );
      
      const bandiUnici = bandi.filter(bando => {
        if (!bando.titolo || !bando.fonte) return false;
        const chiave = `${bando.titolo.toLowerCase()}|${bando.fonte.toLowerCase()}`;
        return !titoliFonteEsistenti.has(chiave);
      });
      
      console.log(`Filtrati ${bandi.length - bandiUnici.length} bandi duplicati`);
      console.log(`Bandi unici da importare: ${bandiUnici.length}`);
      
      // Salva in sessionStorage solo i bandi unici
      if (bandiUnici.length > 0) {
        sessionStorage.setItem('bandiImportati', JSON.stringify(bandiUnici));
        console.log('Bandi salvati in sessionStorage:', bandiUnici.length);
        
        // Salva in Supabase
        let contatoreSalvati = 0;
        for (const bando of bandiUnici) {
          // Verifichiamo che i campi obbligatori siano presenti
          if (!bando.titolo || !bando.fonte) {
            console.warn('Bando senza titolo o fonte, saltato:', bando);
            continue;
          }
          
          const success = await SupabaseBandiService.saveBando(bando);
          if (success) {
            contatoreSalvati++;
          } else {
            console.error('Errore nel salvataggio del bando in Supabase:', bando.titolo);
          }
        }
        
        // Impostiamo il flag per indicare che i bandi sono stati importati
        sessionStorage.setItem('bandiImportatiFlag', 'true');
        
        console.log(`Bandi salvati in Supabase: ${contatoreSalvati}/${bandiUnici.length}`);
        
        // Salva le statistiche di importazione
        setImportStats({
          total: bandi.length,
          unique: bandiUnici.length,
          saved: contatoreSalvati
        });
        
        // Per l'anteprima, mostriamo i primi 10 bandi (o meno se ce ne sono di meno)
        const anteprima = bandiUnici.slice(0, 10);
        setBandiAnteprima(anteprima);
        
        toast({
          title: "Importazione completata",
          description: `Importati ${contatoreSalvati} bandi su ${bandiUnici.length} unici dal foglio Google Sheets`,
        });
      } else {
        toast({
          title: "Nessun nuovo bando da importare",
          description: "Tutti i bandi dal foglio sono già presenti nel database.",
        });
        
        // Anche se non ci sono bandi unici, mostriamo comunque qualche bando come anteprima
        const anteprima = bandi.slice(0, 10);
        setBandiAnteprima(anteprima);
        
        setImportStats({
          total: bandi.length,
          unique: 0,
          saved: 0
        });
      }
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
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-blue-500" />
            <CardTitle>Importa Bandi da Google Sheets</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="googleSheetUrl">URL Foglio Google</Label>
              <Input
                id="googleSheetUrl"
                placeholder="Es. https://docs.google.com/spreadsheets/d/..."
                value={googleSheetUrl}
                onChange={(e) => setGoogleSheetUrl(e.target.value)}
              />
              <p className="text-sm text-gray-500">
                Inserisci l'URL completo del foglio Google Sheets contenente i bandi da importare.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={handleImportBandi} 
                disabled={isLoading || !googleSheetUrl} 
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
                  <li>Bandi unici (non già presenti): <span className="font-semibold">{importStats.unique}</span></li>
                  <li>Bandi salvati in database: <span className="font-semibold">{importStats.saved}</span></li>
                </ul>
              </div>
            )}
            
            {bandiAnteprima.length > 0 && (
              <div className="space-y-2 mt-4">
                <h3 className="font-medium">Anteprima bandi {importStats?.unique === 0 ? "dal foglio" : "importati"}</h3>
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
                          <td className="px-4 py-3">{bando.tipo}</td>
                          <td className="px-4 py-3">
                            {typeof bando.scadenza === 'string' ? bando.scadenza : 
                              bando.scadenza instanceof Date ? bando.scadenza.toLocaleDateString() : 'N/D'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-gray-500 italic">
                  Visualizzazione dei primi {bandiAnteprima.length} record {importStats?.unique === 0 ? "dal foglio" : "importati"}.
                  {bandiAnteprima.length < importStats?.total! && ` (su ${importStats?.total} totali)`}
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
