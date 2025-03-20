
import React from 'react';
import { mockMatches, getCliente, getBando } from '@/data/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import MatchTable from '@/components/MatchTable';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Match = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Match Bandi-Clienti</h1>
        <Button className="flex items-center gap-2">
          <Play className="h-4 w-4" />
          Esegui Match
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-blue-500" />
            <CardTitle>Corrispondenze Trovate</CardTitle>
          </div>
          <CardDescription>
            Il sistema ha trovato {mockMatches.length} potenziali corrispondenze tra i bandi attivi e i tuoi clienti
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MatchTable 
            matches={mockMatches}
            onViewDetails={(id) => navigate(`/match/${id}`)}
          />
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
              Puoi inviare notifiche automatiche ai tuoi clienti quando viene trovata una corrispondenza di alta compatibilità.
            </p>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded border border-green-200">
                <div>
                  <p className="font-medium">Match &gt; 80%</p>
                  <p className="text-sm text-gray-600">Alta compatibilità</p>
                </div>
                <Button size="sm" variant="outline" className="border-green-500 text-green-600 hover:bg-green-50">
                  Invia ora
                </Button>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded border border-yellow-200">
                <div>
                  <p className="font-medium">Match tra 60% e 80%</p>
                  <p className="text-sm text-gray-600">Media compatibilità</p>
                </div>
                <Button size="sm" variant="outline" className="border-yellow-500 text-yellow-600 hover:bg-yellow-50">
                  Invia ora
                </Button>
              </div>
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full">
                Configura Notifiche
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Match;
