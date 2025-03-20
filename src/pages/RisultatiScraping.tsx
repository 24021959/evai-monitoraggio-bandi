import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Download, AlertCircle, FileText, ArrowLeftRight, CheckCircle, Trash2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { FirecrawlService } from '@/utils/FirecrawlService';
import { Bando, TipoBando } from '@/types';

const RisultatiScraping = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bandiSalvati, setBandiSalvati] = useState(false);
  const [matchSalvati, setMatchSalvati] = useState(false);
  const [bandiEstrati, setBandiEstratti] = useState<Bando[]>(() => {
    return [
      {
        id: 'bando-1',
        titolo: 'Bando Innovazione Digitale PMI',
        fonte: 'Regione Lombardia',
        tipo: 'regionale' as TipoBando,
        settori: ['Tecnologia', 'Industria', 'Startup'],
        importoMin: 20000,
        importoMax: 200000,
        scadenza: '2023-11-30',
        descrizione: 'Contributi a fondo perduto per l\'adozione di soluzioni tecnologiche innovative',
        url: 'https://regione.lombardia.it/bandi/123'
      },
      {
        id: 'bando-2',
        titolo: 'Fondo Ricerca e Sviluppo',
        fonte: 'MISE',
        tipo: 'statale' as TipoBando,
        settori: ['Tecnologia', 'Energia', 'Agricoltura'],
        importoMin: 50000,
        importoMax: 500000,
        scadenza: '2023-12-15',
        descrizione: 'Finanziamenti per progetti di ricerca e sviluppo sperimentale',
        url: 'https://mise.gov.it/bandi/456'
      },
      {
        id: 'bando-3',
        titolo: 'Horizon Europe Cluster 5',
        fonte: 'UE',
        tipo: 'europeo' as TipoBando,
        settori: ['Energia', 'Sostenibilità'],
        importoMin: 100000,
        importoMax: 1500000,
        scadenza: '2024-02-01',
        descrizione: 'Progetti di ricerca e innovazione per la transizione energetica e la sostenibilità',
        url: 'https://ec.europa.eu/info/funding-tenders/789'
      }
    ];
  });
  
  const [matchSuggeriti, setMatchSuggeriti] = useState(() => {
    return [
      {
        id: 'match-1',
        bandoId: 'bando-1',
        titoloBando: 'Bando Innovazione Digitale PMI',
        clienteId: '1',
        nomeCliente: 'TechSolutions SRL',
        compatibilita: 92,
        motivo: 'Il cliente opera nel settore tecnologico e ha un fatturato compatibile'
      },
      {
        id: 'match-2',
        bandoId: 'bando-2',
        titoloBando: 'Fondo Ricerca e Sviluppo',
        clienteId: '3',
        nomeCliente: 'Agritech SPA',
        compatibilita: 78,
        motivo: 'Settore agricolo con componente tecnologica, adatto per R&S'
      },
      {
        id: 'match-3',
        bandoId: 'bando-3',
        titoloBando: 'Horizon Europe Cluster 5',
        clienteId: '2',
        nomeCliente: 'GreenEnergy SRL',
        compatibilita: 95,
        motivo: 'Perfetta corrispondenza per focus su energia sostenibile'
      }
    ];
  });
  
  const handleSalvaBandi = () => {
    FirecrawlService.saveBandi(bandiEstrati);
    
    toast({
      title: "Bandi salvati",
      description: `${bandiEstrati.length} bandi sono stati salvati nel sistema`,
      duration: 3000,
    });
    setBandiSalvati(true);
  };
  
  const handleSalvaMatch = () => {
    toast({
      title: "Match salvati",
      description: `${matchSuggeriti.length} match sono stati salvati nel sistema`,
      duration: 3000,
    });
    setMatchSalvati(true);
  };
  
  const handleEsportaCSV = () => {
    toast({
      title: "Esportazione CSV",
      description: "I dati sono stati esportati in formato CSV",
      duration: 3000,
    });
  };
  
  const handleNuovoMonitoraggio = () => {
    navigate('/fonti');
  };

  // Updated function to handle bando deletion
  const handleDeleteBando = (id: string) => {
    const bandoToDelete = bandiEstrati.find(bando => bando.id === id);
    if (!bandoToDelete) return;
    
    // Remove the bando from the local state
    setBandiEstratti(prev => prev.filter(bando => bando.id !== id));
    
    // Also delete from the persisted storage via FirecrawlService
    FirecrawlService.deleteBando(id);
    
    // Notify the user
    toast({
      title: "Bando rimosso",
      description: `Il bando "${bandoToDelete.titolo}" è stato rimosso dalla lista`,
      duration: 3000,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Risultati Monitoraggio</h1>
        <div className="flex gap-2">
          <Button onClick={handleEsportaCSV} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Esporta CSV
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="bandi" className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="bandi">Bandi Trovati</TabsTrigger>
          <TabsTrigger value="match">Match Suggeriti</TabsTrigger>
        </TabsList>
        
        <TabsContent value="bandi">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                <CardTitle>Bandi Estratti</CardTitle>
              </div>
              <CardDescription>
                Il sistema ha estratto {bandiEstrati.length} bandi dalle fonti configurate
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bandiSalvati ? (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertTitle>Bandi salvati con successo</AlertTitle>
                  <AlertDescription>
                    I bandi sono stati salvati nel sistema. Puoi visualizzarli nella sezione Bandi.
                    <div className="mt-4">
                      <Button variant="outline" onClick={() => navigate('/bandi')} className="flex items-center gap-2">
                        Vai alla sezione Bandi
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : bandiEstrati.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Nessun bando trovato</AlertTitle>
                  <AlertDescription>
                    Non sono stati trovati bandi dalle fonti configurate. Prova ad aggiungere nuove fonti o modificare i criteri di ricerca.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Titolo</TableHead>
                        <TableHead>Fonte</TableHead>
                        <TableHead>Settori</TableHead>
                        <TableHead>Scadenza</TableHead>
                        <TableHead>Importo Max</TableHead>
                        <TableHead>Azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bandiEstrati.map((bando) => (
                        <TableRow key={bando.id}>
                          <TableCell className="font-medium">{bando.titolo}</TableCell>
                          <TableCell>{bando.fonte}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {bando.settori.map((settore, index) => (
                                <Badge key={index} variant="outline" className="bg-blue-50">{settore}</Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>{new Date(bando.scadenza).toLocaleDateString('it-IT')}</TableCell>
                          <TableCell>€{bando.importoMax.toLocaleString('it-IT')}</TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteBando(bando.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="flex justify-end">
                    <Button onClick={handleSalvaBandi}>
                      Salva Bandi nel Sistema
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="match">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="h-5 w-5 text-green-500" />
                <CardTitle>Match Suggeriti</CardTitle>
              </div>
              <CardDescription>
                Il sistema ha identificato {matchSuggeriti.length} potenziali match tra i bandi trovati e i tuoi clienti
              </CardDescription>
            </CardHeader>
            <CardContent>
              {matchSalvati ? (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertTitle>Match salvati con successo</AlertTitle>
                  <AlertDescription>
                    I match sono stati salvati nel sistema. Puoi visualizzarli nella sezione Match.
                    <div className="mt-4">
                      <Button variant="outline" onClick={() => navigate('/match')} className="flex items-center gap-2">
                        Vai alla sezione Match
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : matchSuggeriti.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Nessun match trovato</AlertTitle>
                  <AlertDescription>
                    Non sono stati trovati match tra i bandi estratti e i clienti nel sistema. Prova ad aggiungere più dettagli ai profili dei clienti.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Bando</TableHead>
                        <TableHead>Compatibilità</TableHead>
                        <TableHead>Motivo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {matchSuggeriti.map((match) => (
                        <TableRow key={match.id}>
                          <TableCell className="font-medium">{match.nomeCliente}</TableCell>
                          <TableCell>{match.titoloBando}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <span className={`inline-block w-12 text-center font-medium ${
                                match.compatibilita >= 80 ? 'text-green-600' : 
                                match.compatibilita >= 60 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {match.compatibilita}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{match.motivo}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="flex justify-end">
                    <Button onClick={handleSalvaMatch}>
                      Salva Match nel Sistema
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informazioni sul Monitoraggio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Fonti analizzate:</span>
                <span className="font-medium">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Pagine scansionate:</span>
                <span className="font-medium">127</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Bandi identificati:</span>
                <span className="font-medium">{bandiEstrati.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Match potenziali:</span>
                <span className="font-medium">{matchSuggeriti.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Data monitoraggio:</span>
                <span className="font-medium">{new Date().toLocaleDateString('it-IT')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Crediti API utilizzati:</span>
                <span className="font-medium">45</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Azioni Suggerite</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded border border-green-100">
                <div className="font-medium">Notifica Clienti</div>
                <p className="text-sm text-gray-600 mt-1">
                  Ci sono 2 match con compatibilità superiore all'80%. Considera di notificare i clienti.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RisultatiScraping;
