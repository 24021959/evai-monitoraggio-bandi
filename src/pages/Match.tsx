
import React, { useState } from 'react';
import { mockMatches, getCliente, getBando, mockClienti } from '@/data/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import MatchTable from '@/components/MatchTable';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftRight, Play, Settings, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from "@/components/ui/progress";

const Match = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isMatchRunning, setIsMatchRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [matches, setMatches] = useState(mockMatches);
  const [selectedMatchIds, setSelectedMatchIds] = useState<string[]>([]);

  const eseguiMatch = () => {
    setIsMatchRunning(true);
    setProgress(0);

    // Simuliamo un processo di matching con progress bar
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 5;
      setProgress(currentProgress);
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        
        // Aggiorniamo i match con valori calcolati (in una versione reale, questo sarebbe un algoritmo più complesso)
        const newMatches = [...matches];
        // Aggiungiamo un nuovo match calcolato
        newMatches.push({
          id: `new-match-${Date.now()}`,
          clienteId: '3', // Agritech
          bandoId: '4', // Credito R&S
          compatibilita: 72,
          notificato: false
        });
        
        // Aggiorniamo i match
        setMatches(newMatches);
        setIsMatchRunning(false);
        
        toast({
          title: 'Match completato',
          description: `Trovati ${newMatches.length} match potenziali tra clienti e bandi`,
          duration: 3000
        });
      }
    }, 200);
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
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/config-scraping')} className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configura
          </Button>
          <Button 
            onClick={eseguiMatch} 
            disabled={isMatchRunning}
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            Esegui Match
          </Button>
        </div>
      </div>
      
      {isMatchRunning && (
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Analisi in corso...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
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
          <div className="mt-4 flex justify-end">
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
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/configura-notifiche')}
            >
              Configura Notifiche
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Match;
