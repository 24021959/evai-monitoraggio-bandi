import React, { useState, useEffect } from 'react';
import { mockMatches, mockClienti } from '@/data/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import MatchTable from '@/components/MatchTable';
import { ArrowLeftRight, Send, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from 'react-router-dom';
import { Bando, Match as MatchType, Cliente } from '@/types';

const Match = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<MatchType[]>(mockMatches);
  const [selectedMatchIds, setSelectedMatchIds] = useState<string[]>([]);
  const [isNotificheDialogOpen, setIsNotificheDialogOpen] = useState(false);
  const [testoNotifica, setTestoNotifica] = useState(
    'Gentile cliente,\n\nAbbiamo individuato un\'opportunità di finanziamento che potrebbe essere interessante per la vostra azienda.\n\nBando: [NOME_BANDO]\nScadenza: [SCADENZA_BANDO]\nCompatibilità stimata: [COMPATIBILITA]%\n\nPer maggiori informazioni, non esitate a contattarci.\n\nCordiali saluti,\nIl team di Firecrawl'
  );
  const [bandiImportati, setBandiImportati] = useState<Bando[]>([]);

  useEffect(() => {
    const bandiStorageData = sessionStorage.getItem('bandiImportati');
    if (bandiStorageData) {
      try {
        const bandi = JSON.parse(bandiStorageData);
        setBandiImportati(bandi);
        
        if (bandi.length > 0) {
          const nuoviMatches = generaMatch(mockClienti, bandi);
          setMatches(nuoviMatches);
          
          toast({
            title: "Match generati",
            description: `Generati ${nuoviMatches.length} match potenziali tra clienti e bandi importati`,
            duration: 3000
          });
        }
      } catch (error) {
        console.error('Errore nel parsing dei bandi importati:', error);
      }
    }
  }, []);

  const generaMatch = (clienti: Cliente[], bandi: Bando[]): MatchType[] => {
    const nuoviMatches: MatchType[] = [];
    
    clienti.forEach(cliente => {
      bandi.forEach(bando => {
        const compatibilita = calcolaCompatibilita(cliente, bando);
        
        if (compatibilita > 30) {
          nuoviMatches.push({
            id: `${cliente.id}-${bando.id}`,
            clienteId: cliente.id,
            bandoId: bando.id,
            compatibilita,
            notificato: false
          });
        }
      });
    });
    
    return nuoviMatches.sort((a, b) => b.compatibilita - a.compatibilita);
  };

  const calcolaCompatibilita = (cliente: Cliente, bando: Bando): number => {
    let punteggio = 0;
    
    const settoriCliente = cliente.interessiSettoriali.map(s => s.toLowerCase());
    const settoriBando = bando.settori.map(s => s.toLowerCase());
    
    let matchSettori = 0;
    settoriCliente.forEach(settoreCliente => {
      if (settoriBando.some(settoreBando => settoreBando.includes(settoreCliente) || settoreCliente.includes(settoreBando))) {
        matchSettori++;
      }
    });
    
    if (settoriCliente.length > 0) {
      punteggio += (matchSettori / settoriCliente.length) * 70;
    }
    
    if (bando.descrizione && bando.descrizione.toLowerCase().includes(cliente.regione.toLowerCase())) {
      punteggio += 20;
    }
    
    if (bando.importoMin && bando.importoMax) {
      const rapportoFatturato = cliente.fatturato / bando.importoMax;
      if (rapportoFatturato >= 0.5 && rapportoFatturato <= 10) {
        punteggio += 10;
      }
    }
    
    return Math.min(100, Math.round(punteggio));
  };

  const handleSelectionChange = (selectedIds: string[]) => {
    setSelectedMatchIds(selectedIds);
  };

  const inviaNotifiche = () => {
    if (selectedMatchIds.length === 0) {
      toast({
        title: "Nessun match selezionato",
        description: "Seleziona almeno un match per inviare notifiche",
        duration: 3000
      });
      return;
    }

    const matchesAggiornati = matches.map(match => {
      if (selectedMatchIds.includes(match.id)) {
        return { ...match, notificato: true };
      }
      return match;
    });
    setMatches(matchesAggiornati);

    const clientiNotificati = selectedMatchIds.map(matchId => {
      const match = matches.find(m => m.id === matchId);
      if (match) {
        const cliente = mockClienti.find(c => c.id === match.clienteId);
        return cliente ? cliente.nome : 'Cliente sconosciuto';
      }
      return 'Cliente sconosciuto';
    });

    toast({
      title: "Notifiche inviate",
      description: `Inviate ${selectedMatchIds.length} notifiche a: ${clientiNotificati.join(", ")}`,
      duration: 3000
    });

    setSelectedMatchIds([]);
  };

  const handleImportaDaGoogleSheets = () => {
    navigate('/importa-scraping');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Match Bandi-Clienti</h1>
        <Button 
          onClick={handleImportaDaGoogleSheets} 
          className="flex items-center gap-2"
        >
          <FileSpreadsheet className="h-4 w-4" />
          Importa da Google Sheets
        </Button>
      </div>
      
      {bandiImportati.length > 0 ? (
        <Alert className="bg-blue-50 border-blue-100">
          <InfoIcon className="h-4 w-4 text-blue-500" />
          <AlertTitle>Dati importati</AlertTitle>
          <AlertDescription>
            Sono stati importati {bandiImportati.length} bandi da Google Sheets e generati {matches.length} potenziali match.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Nessun dato importato</AlertTitle>
          <AlertDescription>
            Clicca su "Importa da Google Sheets" per importare i dati dello scraping e generare automaticamente i match.
          </AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-blue-500" />
            <CardTitle>Corrispondenze Trovate</CardTitle>
          </div>
          <CardDescription>
            Il sistema ha trovato {matches.length} potenziali corrispondenze tra i bandi attivi e i tuoi clienti
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MatchTable 
            matches={matches}
            onSelectionChange={handleSelectionChange}
          />
          <div className="mt-4 flex justify-end gap-2">
            <Button 
              variant="outline"
              onClick={() => setIsNotificheDialogOpen(true)}
              className="flex items-center gap-2"
            >
              Configura Notifiche
            </Button>
            <Button 
              onClick={inviaNotifiche} 
              disabled={selectedMatchIds.length === 0}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Invia Notifiche ({selectedMatchIds.length})
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Come Funziona il Match</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Il sistema analizza le caratteristiche dei bandi attivi (settore, requisiti, importi, ecc.)</li>
              <li>Confronta queste caratteristiche con i profili dei tuoi clienti</li>
              <li>Calcola un punteggio di compatibilità in base a diversi parametri</li>
              <li>Mostra i risultati ordinati per rilevanza</li>
            </ol>
            <p className="mt-4 text-gray-600">
              Per migliorare la qualità dei match, assicurati di mantenere aggiornati i profili dei clienti e di specificare il maggior numero possibile di informazioni.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Notifiche</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600">
              Puoi inviare notifiche automatiche ai tuoi clienti quando viene trovata una corrispondenza tra bandi e profili.
            </p>
            <p className="text-gray-600">
              Puoi personalizzare il testo della notifica cliccando sul pulsante "Configura Notifiche".
            </p>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isNotificheDialogOpen} onOpenChange={setIsNotificheDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configura Notifica</DialogTitle>
            <DialogDescription>
              Personalizza il testo della notifica che verrà inviata ai clienti selezionati
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="testoNotifica">Testo Notifica</Label>
              <Textarea 
                id="testoNotifica"
                value={testoNotifica}
                onChange={(e) => setTestoNotifica(e.target.value)}
                className="min-h-[200px]"
              />
              <p className="text-sm text-gray-500">
                Puoi utilizzare i seguenti placeholder che verranno sostituiti automaticamente:
              </p>
              <ul className="text-sm text-gray-500 list-disc pl-5 space-y-1">
                <li>[NOME_CLIENTE] - Nome del cliente</li>
                <li>[NOME_BANDO] - Titolo del bando</li>
                <li>[SCADENZA_BANDO] - Data di scadenza del bando</li>
                <li>[COMPATIBILITA] - Percentuale di compatibilità</li>
                <li>[LINK_BANDO] - Link al bando</li>
              </ul>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsNotificheDialogOpen(false)}
            >
              Annulla
            </Button>
            <Button 
              type="button"
              onClick={() => {
                toast({
                  title: "Template salvato",
                  description: "Il testo della notifica è stato salvato con successo",
                  duration: 3000
                });
                setIsNotificheDialogOpen(false);
              }}
            >
              Salva Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Match;
