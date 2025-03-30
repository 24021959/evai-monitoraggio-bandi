
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowRight, AlertCircle, RefreshCw, Check, ArrowUpRight } from 'lucide-react';
import GoogleSheetsService from '@/utils/GoogleSheetsService';
import { Bando, Cliente } from '@/types';
import SupabaseBandiService from '@/utils/SupabaseBandiService';
import SupabaseClientiService from '@/utils/SupabaseClientiService';
import SupabaseMatchService from '@/utils/SupabaseMatchService';
import { Badge } from "@/components/ui/badge";
import MatchTable from '@/components/MatchTable';
import { MatchResult } from '@/utils/MatchService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const ImportaBandi = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [bandiAnteprima, setBandiAnteprima] = useState<Bando[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [importStats, setImportStats] = useState<{
    total: number;
    unique: number;
    saved: number;
  } | null>(null);
  
  // Stato per i nuovi match trovati
  const [nuoviMatch, setNuoviMatch] = useState<MatchResult[]>([]);
  const [showMatchResults, setShowMatchResults] = useState<boolean>(false);
  
  useEffect(() => {
    // Controlla se ci sono match recenti salvati nella sessione
    const matchRecenti = sessionStorage.getItem('nuoviMatch');
    if (matchRecenti) {
      try {
        const matchData = JSON.parse(matchRecenti);
        if (Array.isArray(matchData) && matchData.length > 0) {
          setNuoviMatch(matchData);
          setShowMatchResults(true);
        }
      } catch (error) {
        console.error("Errore nel parsing dei match recenti:", error);
      }
    }
  }, []);
  
  const handleImportBandi = async () => {
    const googleSheetUrl = localStorage.getItem('googleSheetUrl');
    if (!googleSheetUrl) {
      toast({
        title: "Configurazione mancante",
        description: "L'URL del foglio Google non è stato configurato. Contattare l'amministratore.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setImportStats(null);
    setNuoviMatch([]);
    setShowMatchResults(false);
    
    try {
      console.log('Iniziando importazione da:', googleSheetUrl);
      
      // Rimuoviamo il flag prima dell'importazione per consentire una nuova importazione
      sessionStorage.removeItem('bandiImportatiFlag');
      
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
      
      // Stampa per debug dei titoli
      console.log('Titoli dei bandi nel foglio:');
      bandi.slice(0, 5).forEach((b, i) => {
        console.log(`${i+1}. ${b.titolo} (${b.fonte || 'fonte non specificata'})`);
      });
      
      // Recupera i bandi esistenti da Supabase
      const bandiEsistenti = await SupabaseBandiService.getBandi();
      console.log('Bandi già esistenti in Supabase:', bandiEsistenti.length);
      
      // Miglioriamo la logica di confronto per i duplicati
      // Creiamo un set con combinazioni normalizzate di titolo+fonte per un confronto più accurato
      const titoliFonteEsistenti = new Set();
      
      bandiEsistenti.forEach(bando => {
        if (bando.titolo) {
          // Normalizziamo i testi: rimuoviamo spazi extra, caratteri speciali e convertiamo in minuscolo
          const titoloNormalizzato = bando.titolo
            .trim()
            .toLowerCase()
            .replace(/\s+/g, ' ')
            .replace(/[^\w\s]/g, '');
          
          const fonteNormalizzata = bando.fonte 
            ? bando.fonte.trim().toLowerCase().replace(/\s+/g, ' ')
            : '';
            
          titoliFonteEsistenti.add(`${titoloNormalizzato}|${fonteNormalizzata}`);
          
          // Aggiungiamo anche solo il titolo per catturare più duplicati
          if (titoloNormalizzato.length > 10) { // solo se il titolo è sufficientemente distintivo
            titoliFonteEsistenti.add(titoloNormalizzato);
          }
        }
      });
      
      console.log('Set di chiavi uniche esistenti:', titoliFonteEsistenti.size);
      
      // Filtriamo i bandi per trovare quelli unici
      const bandiUnici = bandi.filter(bando => {
        if (!bando.titolo) {
          console.log('Bando senza titolo, saltato.');
          return false;
        }
        
        // Normalizziamo i testi dal foglio allo stesso modo
        const titoloNormalizzato = bando.titolo
          .trim()
          .toLowerCase()
          .replace(/\s+/g, ' ')
          .replace(/[^\w\s]/g, '');
        
        const fonteNormalizzata = bando.fonte 
          ? bando.fonte.trim().toLowerCase().replace(/\s+/g, ' ')
          : '';
        
        const chiaveCombinata = `${titoloNormalizzato}|${fonteNormalizzata}`;
        
        // Verifica se questo bando è già presente usando la combinazione titolo+fonte
        const esiste = titoliFonteEsistenti.has(chiaveCombinata);
        
        // Se non esiste già con la combinazione titolo+fonte, controlla anche solo per titolo
        // ma solo per titoli abbastanza distintivi
        const esisteSoloTitolo = titoloNormalizzato.length > 10 && 
                                titoliFonteEsistenti.has(titoloNormalizzato);
        
        // Debug per verificare la chiave di confronto
        console.log(`Verifica bando: "${titoloNormalizzato}" | "${fonteNormalizzata}" => ${!esiste && !esisteSoloTitolo ? 'NUOVO' : 'ESISTENTE'}`);
        
        // È un bando nuovo solo se non è stato trovato in nessuno dei due controlli
        return !esiste && !esisteSoloTitolo;
      });
      
      console.log(`Filtrati ${bandi.length - bandiUnici.length} bandi duplicati`);
      console.log(`Bandi unici da importare: ${bandiUnici.length}`);
      
      if (bandiUnici.length > 0) {
        sessionStorage.setItem('bandiImportati', JSON.stringify(bandiUnici));
        console.log('Bandi salvati in sessionStorage:', bandiUnici.length);
        
        let contatoreSalvati = 0;
        for (const bando of bandiUnici) {
          if (!bando.titolo) {
            console.warn('Bando senza titolo, saltato:', bando);
            continue;
          }
          
          // Debug di ogni bando prima del salvataggio
          console.log(`Salvataggio bando: ${bando.titolo}`);
          
          const success = await SupabaseBandiService.saveBando(bando);
          if (success) {
            contatoreSalvati++;
            console.log(`Bando salvato con successo: ${bando.titolo}`);
          } else {
            console.error('Errore nel salvataggio del bando in Supabase:', bando.titolo);
          }
        }
        
        sessionStorage.setItem('bandiImportatiFlag', 'true');
        console.log(`Bandi salvati in Supabase: ${contatoreSalvati}/${bandiUnici.length}`);
        
        // Generiamo match per i nuovi bandi
        if (contatoreSalvati > 0) {
          const clienti = await SupabaseClientiService.getClienti();
          console.log(`Generando match tra ${clienti.length} clienti e ${bandiUnici.length} nuovi bandi...`);
          
          const matchResults = await SupabaseMatchService.findNewMatches(clienti, bandiUnici);
          console.log(`Generati ${matchResults.length} match per i nuovi bandi`);
          
          // Salviamo i match nella sessione per mostrarli nella UI
          if (matchResults.length > 0) {
            sessionStorage.setItem('nuoviMatch', JSON.stringify(matchResults));
            setNuoviMatch(matchResults);
            setShowMatchResults(true);
          }
        }
        
        setImportStats({
          total: bandi.length,
          unique: bandiUnici.length,
          saved: contatoreSalvati
        });
        
        const anteprima = bandiUnici.slice(0, 20);
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
        
        const anteprima = bandi.slice(0, 20);
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
  
  const handleViewMatches = () => {
    navigate('/match');
  };
  
  const handleExportCSV = () => {
    if (nuoviMatch.length === 0) {
      toast({
        title: "Nessun match da esportare",
        description: "Non ci sono match da esportare in CSV.",
        variant: "destructive",
      });
      return;
    }
    
    // Utilizziamo la funzione di MatchService per generare e scaricare il CSV
    const matchesCSV = SupabaseMatchService.generateMatchesCSV(
      nuoviMatch.map(match => ({
        id: match.id,
        clienteId: match.cliente.id,
        bandoId: match.bando.id,
        compatibilita: match.punteggio,
        notificato: false,
        bando_titolo: match.bando.titolo,
        cliente_nome: match.cliente.nome,
        data_creazione: match.dataMatch
      }))
    );
    
    const blob = new Blob([matchesCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `match_nuovi_bandi_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Esportazione completata",
      description: "Il file CSV con i match è stato scaricato.",
    });
  };
  
  const handleViewDetails = (matchId: string) => {
    const match = nuoviMatch.find(m => m.id === matchId);
    if (!match) return;
    
    navigate(`/bandi/${match.bando.id}`);
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
                  <li>Bandi unici (non già presenti): <span className="font-semibold">{importStats.unique}</span></li>
                  <li>Bandi salvati in database: <span className="font-semibold">{importStats.saved}</span></li>
                </ul>
              </div>
            )}
            
            {nuoviMatch.length > 0 && (
              <div className="mt-4 p-4 bg-green-50 rounded-md border border-green-200">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-green-800 flex items-center">
                    <Check className="mr-2 h-4 w-4" />
                    Match trovati con i nuovi bandi
                  </h3>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleExportCSV}
                      className="text-xs bg-white"
                    >
                      Esporta CSV
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleViewMatches}
                      className="text-xs bg-white"
                    >
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      Vedi tutti i match
                    </Button>
                  </div>
                </div>
                
                <p className="text-sm text-green-700 mb-3">
                  Abbiamo trovato <span className="font-bold">{nuoviMatch.length}</span> match tra i nuovi bandi importati e i tuoi clienti.
                </p>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-green-600 hover:bg-green-700" size="sm">
                      Visualizza i match dei nuovi bandi
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Match con i nuovi bandi importati</DialogTitle>
                      <DialogDescription>
                        Qui puoi vedere i match tra i tuoi clienti e i nuovi bandi importati
                      </DialogDescription>
                    </DialogHeader>
                    <div className="pt-2">
                      <MatchTable 
                        matches={nuoviMatch} 
                        onExportCSV={handleExportCSV}
                        onViewDetails={handleViewDetails}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
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
                          <td className="px-4 py-3">{bando.scadenza}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-gray-500 italic">
                  Visualizzazione dei primi {bandiAnteprima.length} record {importStats?.unique === 0 ? "dal foglio" : "importati"}.
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
