import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RefreshCw, ArrowRight } from 'lucide-react';
import GoogleSheetsService from '@/utils/GoogleSheetsService';
import { Bando } from '@/types';
import SupabaseBandiService from '@/utils/SupabaseBandiService';
import { useBandiData } from '@/hooks/useBandiData';
import SupabaseMatchService from '@/utils/SupabaseMatchService';
import SupabaseClientiService from '@/utils/SupabaseClientiService';
import MatchDialog from '@/components/MatchDialog';
import { MatchResult } from '@/utils/MatchService';

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
  
  const [showMatchDialog, setShowMatchDialog] = useState<boolean>(false);
  const [matchesFound, setMatchesFound] = useState<MatchResult[]>([]);
  
  const { fetchBandi, bandi: bandiEsistenti } = useBandiData();
  
  const handleImportBandi = async () => {
    setIsLoading(true);
    setError(null);
    setImportStats(null);
    
    try {
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
      
      const bandiEsistentiMap = new Map();
      bandiEsistenti.forEach(bando => {
        const chiave = `${bando.titolo.toLowerCase().trim()}|${bando.fonte.toLowerCase().trim()}`;
        bandiEsistentiMap.set(chiave, true);
      });
      
      const nuoviBandi = bandi.filter(bando => {
        const chiave = `${bando.titolo.toLowerCase().trim()}|${bando.fonte.toLowerCase().trim()}`;
        return !bandiEsistentiMap.has(chiave);
      });
      
      console.log(`Trovati ${nuoviBandi.length} nuovi bandi su ${bandi.length} totali`);
      
      setBandiAnteprima(nuoviBandi);
      
      let contatoreSalvati = 0;
      
      for (const bando of nuoviBandi) {
        try {
          const bandoCompleto: Bando = {
            ...bando,
            fonte: bando.fonte || 'Google Sheet',
            tipo: bando.tipo || 'altro',
            settori: bando.settori || [],
            scadenza: bando.scadenza || new Date().toISOString().split('T')[0],
            dataEstrazione: bando.dataEstrazione || new Date().toISOString().split('T')[0]
          };
          
          console.log(`Salvando bando: ${bandoCompleto.titolo}, scadenza: ${bandoCompleto.scadenza}`);
          
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
      
      try {
        sessionStorage.setItem('bandiImportati', JSON.stringify(nuoviBandi));
      } catch (err) {
        console.error('Errore nel salvataggio dei bandi in sessionStorage:', err);
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
      
      await fetchBandi();
      
      await findAndShowMatches(nuoviBandi);
      
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

  const findAndShowMatches = async (nuoviBandi: Bando[]) => {
    try {
      const clienti = await SupabaseClientiService.getClienti();
      
      if (!clienti || clienti.length === 0) {
        console.log('Nessun cliente trovato per generare match');
        setMatchesFound([]);
        setShowMatchDialog(true);
        return;
      }
      
      console.log(`Cercando match tra ${nuoviBandi.length} nuovi bandi e ${clienti.length} clienti...`);
      
      const nuoviMatch = await SupabaseMatchService.findNewMatches(clienti, nuoviBandi);
      
      console.log(`Trovati ${nuoviMatch.length} nuovi match potenziali`);
      
      setMatchesFound(nuoviMatch);
      setShowMatchDialog(true);
      
      if (nuoviMatch.length > 0) {
        toast({
          title: "Match trovati",
          description: `Abbiamo trovato ${nuoviMatch.length} potenziali match con i tuoi clienti`,
        });
      }
    } catch (error) {
      console.error('Errore nella ricerca di match:', error);
      setMatchesFound([]);
      setShowMatchDialog(true);
    }
  };

  const handleViewBandi = () => {
    navigate('/bandi');
  };
  
  const handleCloseMatchDialog = () => {
    setShowMatchDialog(false);
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
        <CardContent className="space-y-6 pt-6">
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
      
      <MatchDialog 
        isOpen={showMatchDialog} 
        onClose={handleCloseMatchDialog} 
        matches={matchesFound}
        totalBandi={importStats?.saved || 0}
      />
    </div>
  );
};

export default ImportaBandi;
