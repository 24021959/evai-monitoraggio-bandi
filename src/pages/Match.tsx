
import React, { useState } from 'react';
import { mockMatches, getCliente, getBando, mockClienti } from '@/data/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import MatchTable from '@/components/MatchTable';
import { ArrowLeftRight, Send } from 'lucide-react';
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

const Match = () => {
  const { toast } = useToast();
  const [matches, setMatches] = useState(mockMatches);
  const [selectedMatchIds, setSelectedMatchIds] = useState<string[]>([]);
  const [isNotificheDialogOpen, setIsNotificheDialogOpen] = useState(false);
  const [testoNotifica, setTestoNotifica] = useState(
    'Gentile cliente,\n\nAbbiamo individuato un\'opportunità di finanziamento che potrebbe essere interessante per la vostra azienda.\n\nBando: [NOME_BANDO]\nScadenza: [SCADENZA_BANDO]\nCompatibilità stimata: [COMPATIBILITA]%\n\nPer maggiori informazioni, non esitate a contattarci.\n\nCordiali saluti,\nIl team di Firecrawl'
  );

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

    // Aggiorna lo stato dei match selezionati a "notificato"
    const matchesAggiornati = matches.map(match => {
      if (selectedMatchIds.includes(match.id)) {
        return { ...match, notificato: true };
      }
      return match;
    });
    setMatches(matchesAggiornati);

    // Ottieni gli indirizzi email dei clienti selezionati
    const clientiNotificati = selectedMatchIds.map(matchId => {
      const match = matches.find(m => m.id === matchId);
      if (match) {
        const cliente = mockClienti.find(c => c.id === match.clienteId);
        return cliente ? cliente.nome : 'Cliente sconosciuto';
      }
      return 'Cliente sconosciuto';
    });

    // Mostra un toast con il messaggio di successo
    toast({
      title: "Notifiche inviate",
      description: `Inviate ${selectedMatchIds.length} notifiche a: ${clientiNotificati.join(", ")}`,
      duration: 3000
    });

    // Reset della selezione
    setSelectedMatchIds([]);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Match Bandi-Clienti</h1>
      </div>
      
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
