
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ArrowLeftRight, InfoIcon, AlertCircle, FileText, ChevronRight } from 'lucide-react';
import MatchTable from '@/components/MatchTable';
import { Bando, Cliente } from '@/types';
import { SupabaseBandiService } from '@/utils/SupabaseBandiService';
import { SupabaseClientiService } from '@/utils/SupabaseClientiService';
import { MatchService, MatchResult } from '@/utils/MatchService';
import { useToast } from "@/components/ui/use-toast";

export default function Match() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [clienti, setClienti] = useState<Cliente[]>([]);
  const [bandi, setBandi] = useState<Bando[]>([]);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [activeTab, setActiveTab] = useState('match');
  const [clientiMatch, setClientiMatch] = useState<any[]>([]);
  const [bandiMatch, setBandiMatch] = useState<any[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<MatchResult[]>([]);
  const [selectedSector, setSelectedSector] = useState('tutti');
  
  // Carica dati da Supabase
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      try {
        // Carica clienti
        const loadedClienti = await SupabaseClientiService.getClienti();
        setClienti(loadedClienti);
        console.log('Match: Clienti caricati:', loadedClienti.length);
        
        // Carica bandi
        const loadedBandi = await SupabaseBandiService.getBandiCombinati();
        setBandi(loadedBandi);
        console.log('Match: Bandi caricati:', loadedBandi.length);
        
        if (loadedClienti.length > 0 && loadedBandi.length > 0) {
          // Genera i match
          const calculatedMatches = MatchService.generateMatches(loadedClienti, loadedBandi);
          setMatches(calculatedMatches);
          setFilteredMatches(calculatedMatches);
          console.log('Match: Match generati:', calculatedMatches.length);
          
          // Prepara i dati per le viste "Per Cliente" e "Per Bando"
          prepareClienteAndBandoViews(calculatedMatches);
          
          toast({
            title: "Match completati",
            description: `Trovati ${calculatedMatches.length} match tra ${loadedClienti.length} clienti e ${loadedBandi.length} bandi`,
          });
        }
      } catch (error) {
        console.error('Errore nel caricamento dei dati:', error);
        toast({
          title: "Errore",
          description: "Si è verificato un errore nel caricamento dei dati",
          variant: "destructive",
        });
      }
      
      setLoading(false);
    };
    
    loadData();
  }, [toast]);
  
  // Prepara i dati per le viste "Per Cliente" e "Per Bando"
  const prepareClienteAndBandoViews = (calculatedMatches: MatchResult[]) => {
    // Aggregazione per cliente
    const clientMap = new Map<string, { nome: string; settore: string; bandi: number; punteggio: number }>();
    
    // Aggregazione per bando
    const bandoMap = new Map<string, { titolo: string; fonte: string; clienti: number; punteggio: number }>();
    
    // Popola le mappe con i dati dei match
    calculatedMatches.forEach(match => {
      // Aggiorna dati cliente
      if (!clientMap.has(match.cliente.id)) {
        clientMap.set(match.cliente.id, {
          nome: match.cliente.nome,
          settore: match.cliente.settore,
          bandi: 0,
          punteggio: 0
        });
      }
      
      const clienteData = clientMap.get(match.cliente.id)!;
      clienteData.bandi += 1;
      clienteData.punteggio = Math.max(clienteData.punteggio, match.punteggio);
      
      // Aggiorna dati bando
      if (!bandoMap.has(match.bando.id)) {
        bandoMap.set(match.bando.id, {
          titolo: match.bando.titolo,
          fonte: match.bando.fonte,
          clienti: 0,
          punteggio: 0
        });
      }
      
      const bandoData = bandoMap.get(match.bando.id)!;
      bandoData.clienti += 1;
      bandoData.punteggio = Math.max(bandoData.punteggio, match.punteggio);
    });
    
    // Converti le mappe in array e ordina per punteggio
    const clientiArray = Array.from(clientMap.entries()).map(([id, data]) => ({
      id,
      nome: data.nome,
      settore: data.settore,
      bandi: data.bandi,
      punteggio: data.punteggio
    })).sort((a, b) => b.punteggio - a.punteggio);
    
    const bandiArray = Array.from(bandoMap.entries()).map(([id, data]) => ({
      id,
      titolo: data.titolo,
      fonte: data.fonte,
      clienti: data.clienti,
      punteggio: data.punteggio
    })).sort((a, b) => b.punteggio - a.punteggio);
    
    setClientiMatch(clientiArray);
    setBandiMatch(bandiArray);
  };
  
  // Filtra i match per settore
  const handleSectorFilter = (sector: string) => {
    setSelectedSector(sector);
    
    if (sector === 'tutti') {
      setFilteredMatches(matches);
    } else {
      const filtered = matches.filter(match => 
        match.cliente.settore.toLowerCase().includes(sector.toLowerCase())
      );
      setFilteredMatches(filtered);
    }
  };
  
  // Esportazione CSV
  const handleExportCSV = () => {
    try {
      const csvContent = MatchService.exportMatchesToCSV(filteredMatches);
      MatchService.downloadCSV(csvContent, `match-clienti-bandi-${new Date().toISOString().split('T')[0]}.csv`);
      
      toast({
        title: "Esportazione completata",
        description: `Esportati ${filteredMatches.length} match in formato CSV`,
      });
    } catch (error) {
      console.error('Errore nell\'esportazione CSV:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore nell'esportazione CSV",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Match Clienti-Bandi</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleExportCSV}
          >
            <FileText className="h-4 w-4" />
            Esporta Report
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700 mx-auto mb-4"></div>
            <p>Caricamento dati in corso...</p>
          </div>
        </div>
      ) : (
        <>
          {clienti.length > 0 && bandi.length > 0 ? (
            <Alert className="bg-green-50 border-green-200">
              <ArrowLeftRight className="h-4 w-4 text-green-600" />
              <AlertTitle>Bandi disponibili per il match</AlertTitle>
              <AlertDescription>
                Trovati {matches.length} match tra {clienti.length} clienti e {bandi.length} bandi disponibili nel sistema.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>Match automatico</AlertTitle>
              <AlertDescription>
                Il sistema analizza i profili dei clienti e li confronta con i bandi disponibili per trovare le migliori corrispondenze.
                {clienti.length === 0 && <div className="mt-2 font-semibold text-red-600">Non ci sono clienti nel sistema. Aggiungi dei clienti per generare match.</div>}
                {bandi.length === 0 && <div className="mt-2 font-semibold text-red-600">Non ci sono bandi nel sistema. Importa o aggiungi bandi per generare match.</div>}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Tabs defaultValue="match" className="w-full" onValueChange={setActiveTab} value={activeTab}>
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="match">Match Trovati</TabsTrigger>
                  <TabsTrigger value="clienti">Per Cliente</TabsTrigger>
                  <TabsTrigger value="bandi">Per Bando</TabsTrigger>
                </TabsList>
                
                <TabsContent value="match">
                  <Card>
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-2">
                        <ArrowLeftRight className="h-5 w-5 text-blue-500" />
                        <CardTitle>Match recenti</CardTitle>
                      </div>
                      <CardDescription>
                        Le corrispondenze tra clienti e bandi con punteggio più alto
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <MatchTable 
                        matches={filteredMatches} 
                        onExportCSV={handleExportCSV}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="clienti">
                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle>Match per Cliente</CardTitle>
                      <CardDescription>
                        Clienti ordinati per livello di corrispondenza con i bandi disponibili
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {clientiMatch.length > 0 ? (
                          clientiMatch.map((cliente) => (
                            <div key={cliente.id} className="flex items-center justify-between border-b pb-4">
                              <div className="flex items-center gap-4">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback>{cliente.nome.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{cliente.nome}</div>
                                  <div className="text-sm text-gray-500">{cliente.settore}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div className="text-sm text-gray-500">Match</div>
                                  <div className={`font-medium ${
                                    cliente.punteggio > 85 ? 'text-green-600' : 
                                    cliente.punteggio > 70 ? 'text-yellow-600' : 'text-gray-600'
                                  }`}>
                                    {cliente.punteggio}%
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm text-gray-500">Bandi</div>
                                  <div className="font-medium">{cliente.bandi}</div>
                                </div>
                                <Button size="sm" variant="ghost">
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            Nessun match trovato per i clienti
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="bandi">
                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle>Match per Bando</CardTitle>
                      <CardDescription>
                        Bandi ordinati per numero di clienti compatibili
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {bandiMatch.length > 0 ? (
                          bandiMatch.map((bando) => (
                            <div key={bando.id} className="flex items-center justify-between border-b pb-4">
                              <div>
                                <div className="font-medium">{bando.titolo}</div>
                                <div className="text-sm text-gray-500">Fonte: {bando.fonte}</div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div className="text-sm text-gray-500">Match</div>
                                  <div className={`font-medium ${
                                    bando.punteggio > 85 ? 'text-green-600' : 
                                    bando.punteggio > 70 ? 'text-yellow-600' : 'text-gray-600'
                                  }`}>
                                    {bando.punteggio}%
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm text-gray-500">Clienti</div>
                                  <div className="font-medium">{bando.clienti}</div>
                                </div>
                                <Button size="sm" variant="ghost">
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            Nessun match trovato per i bandi
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Statistiche Match</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-700">
                          {matches.length > 0 
                            ? Math.round(matches.reduce((acc, match) => acc + match.punteggio, 0) / matches.length) 
                            : 0}%
                        </div>
                        <div className="text-sm text-gray-600">Match medio</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-700">{filteredMatches.length}</div>
                        <div className="text-sm text-gray-600">Match trovati</div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Clienti con più match</h4>
                      <div className="space-y-2">
                        {clientiMatch.slice(0, 3).map((cliente) => (
                          <div key={cliente.id} className="flex justify-between items-center">
                            <div className="text-sm truncate max-w-[150px]">{cliente.nome}</div>
                            <Badge variant="outline" className="bg-blue-50">{cliente.bandi} bandi</Badge>
                          </div>
                        ))}
                        
                        {clientiMatch.length === 0 && (
                          <div className="text-sm text-gray-500">Nessun cliente con match</div>
                        )}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Bandi più richiesti</h4>
                      <div className="space-y-2">
                        {bandiMatch.slice(0, 3).map((bando) => (
                          <div key={bando.id} className="flex justify-between items-center">
                            <div className="text-sm truncate max-w-[150px]">{bando.titolo}</div>
                            <Badge variant="outline" className="bg-green-50">{bando.clienti} clienti</Badge>
                          </div>
                        ))}
                        
                        {bandiMatch.length === 0 && (
                          <div className="text-sm text-gray-500">Nessun bando con match</div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Filtra Match</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Per settore</h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge 
                          variant={selectedSector === 'tutti' ? 'default' : 'outline'} 
                          className="cursor-pointer"
                          onClick={() => handleSectorFilter('tutti')}
                        >
                          Tutti
                        </Badge>
                        
                        {/* Genera badge dai settori disponibili */}
                        {Array.from(new Set(clienti.map(c => c.settore))).map(settore => (
                          <Badge 
                            key={settore}
                            variant={selectedSector === settore ? 'default' : 'outline'} 
                            className="cursor-pointer"
                            onClick={() => handleSectorFilter(settore)}
                          >
                            {settore}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Per livello di match</h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge 
                          variant="outline" 
                          className="cursor-pointer bg-green-50"
                          onClick={() => {
                            setFilteredMatches(matches.filter(m => m.punteggio >= 80));
                          }}
                        >
                          Alto (80%+)
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className="cursor-pointer bg-yellow-50"
                          onClick={() => {
                            setFilteredMatches(matches.filter(m => m.punteggio >= 60 && m.punteggio < 80));
                          }}
                        >
                          Medio (60-80%)
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className="cursor-pointer bg-red-50"
                          onClick={() => {
                            setFilteredMatches(matches.filter(m => m.punteggio < 60));
                          }}
                        >
                          Basso (&lt;60%)
                        </Badge>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Per fonte</h4>
                      <div className="flex flex-wrap gap-2">
                        {/* Genera badge dalle fonti disponibili */}
                        {Array.from(new Set(bandi.map(b => b.fonte))).slice(0, 5).map(fonte => (
                          <Badge 
                            key={fonte}
                            variant="outline" 
                            className="cursor-pointer"
                            onClick={() => {
                              setFilteredMatches(matches.filter(m => m.bando.fonte === fonte));
                            }}
                          >
                            {fonte}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <Alert variant="default" className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertTitle>Suggerimento</AlertTitle>
            <AlertDescription>
              Per migliorare la qualità dei match, completa il profilo dei tuoi clienti con informazioni dettagliate su settore, dimensione e fatturato.
            </AlertDescription>
          </Alert>
        </>
      )}
    </div>
  );
}
