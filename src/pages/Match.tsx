
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, RotateCw, FileText, Filter, Calendar } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Bando, Cliente } from "@/types";
import MatchTable from "@/components/MatchTable";
import SupabaseMatchService from '@/utils/SupabaseMatchService';
import SupabaseBandiService from '@/utils/SupabaseBandiService';
import SupabaseClientiService from '@/utils/SupabaseClientiService';
import MatchService from '@/utils/MatchService';

const MatchPage = () => {
  const { toast } = useToast();
  const [bandi, setBandi] = useState<Bando[]>([]);
  const [clienti, setClienti] = useState<Cliente[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedBando, setSelectedBando] = useState<string>('');
  const [selectedCliente, setSelectedCliente] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMatches, setIsLoadingMatches] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Bando[]>([]);
  const [activeTab, setActiveTab] = useState<string>('tutti');
  const [isGeneratingMatches, setIsGeneratingMatches] = useState<boolean>(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const bandiData = await SupabaseBandiService.getBandi();
      setBandi(bandiData);
      
      const clientiData = await SupabaseClientiService.getClienti();
      setClienti(clientiData);
      
      await fetchMatches();
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore nel caricamento dei dati",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMatches = async () => {
    setIsLoadingMatches(true);
    try {
      const matchesData = await SupabaseMatchService.getMatches();
      
      if (matchesData.length > 0 && bandi.length > 0 && clienti.length > 0) {
        const matchResults = await SupabaseMatchService.convertMatchesToResults(
          matchesData, 
          clienti, 
          bandi
        );
        setMatches(matchResults);
      } else {
        setMatches([]);
      }
    } catch (error) {
      console.error("Errore nel caricamento dei match:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore nel caricamento dei match",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMatches(false);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);

    if (term) {
      const results = bandi.filter(bando =>
        bando.titolo.toLowerCase().includes(term.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleMatch = async () => {
    if (!selectedBando || !selectedCliente) {
      toast({
        title: "Errore",
        description: "Seleziona un bando e un cliente per creare un match",
        variant: "destructive",
      });
      return;
    }

    const bando = bandi.find(b => b.id === selectedBando);
    const cliente = clienti.find(c => c.id === selectedCliente);

    if (!bando || !cliente) {
      toast({
        title: "Errore",
        description: "Bando o cliente non trovato",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Calcoliamo il punteggio di compatibilità con l'algoritmo avanzato
      const { punteggio, dettaglioMatch } = MatchService.calculateMatch(bando, cliente);
      
      // Creiamo il match
      const matchResult = {
        id: crypto.randomUUID(),
        cliente: {
          id: cliente.id,
          nome: cliente.nome,
          settore: cliente.settore
        },
        bando: {
          id: bando.id,
          titolo: bando.titolo,
          fonte: bando.fonte,
          scadenza: bando.scadenza
        },
        punteggio,
        dataMatch: new Date().toISOString(),
        dettaglioMatch
      };

      // Salviamo in Supabase
      const success = await SupabaseMatchService.saveMatch({
        id: matchResult.id,
        clienteId: cliente.id,
        bandoId: bando.id,
        compatibilita: punteggio,
        notificato: false
      });

      if (success) {
        // Aggiorniamo la lista di match
        setMatches([matchResult, ...matches]);
        
        toast({
          title: "Match creato",
          description: `Match creato con compatibilità del ${punteggio}%`,
        });
        
        // Reset del form
        setSelectedBando('');
        setSelectedCliente('');
        setSearchTerm('');
      }
    } catch (error) {
      console.error("Errore nella creazione del match:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore nella creazione del match",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExportCSV = () => {
    if (matches.length === 0) {
      toast({
        title: "Nessun dato da esportare",
        description: "Non ci sono match da esportare",
      });
      return;
    }

    const csvContent = "data:text/csv;charset=utf-8," 
      + "ID Match,Cliente,Settore Cliente,Bando,Fonte Bando,Compatibilità,Data Scadenza\n"
      + matches.map(m => `"${m.id}","${m.cliente.nome}","${m.cliente.settore}","${m.bando.titolo}","${m.bando.fonte}","${m.punteggio}%","${new Date(m.bando.scadenza).toLocaleDateString('it-IT')}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `match_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Esportazione completata",
      description: "I dati sono stati esportati con successo",
    });
  };

  const handleGenerateAutomaticMatches = async () => {
    if (clienti.length === 0 || bandi.length === 0) {
      toast({
        title: "Dati insufficienti",
        description: "Importa bandi e clienti per generare match automatici",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingMatches(true);
    try {
      const matchResults = await SupabaseMatchService.generateAndSaveMatches(clienti, bandi);
      
      if (matchResults.length > 0) {
        setMatches(matchResults);
        toast({
          title: "Match generati con successo",
          description: `Generati ${matchResults.length} match potenziali tra ${clienti.length} clienti e ${bandi.length} bandi`,
        });
      } else {
        toast({
          title: "Nessun match trovato",
          description: "Non è stato possibile generare match con i dati disponibili",
        });
      }
    } catch (error) {
      console.error("Errore nella generazione dei match:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore nella generazione dei match",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingMatches(false);
    }
  };

  const filteredMatches = matches.filter(match => {
    if (activeTab === 'alti') {
      return match.punteggio >= 80;
    } else if (activeTab === 'medi') {
      return match.punteggio >= 60 && match.punteggio < 80;
    } else if (activeTab === 'bassi') {
      return match.punteggio < 60;
    }
    return true; // 'tutti'
  });
  
  return (
    <div className="container mx-auto py-8 animate-fade-in">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Match Bandi e Clienti</h1>
      
      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <CardTitle className="text-slate-700">Crea Match</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="bando" className="text-slate-700">Bando</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      type="text"
                      id="bando"
                      placeholder="Cerca bando per titolo..."
                      value={searchTerm}
                      onChange={handleSearch}
                      className="pl-10"
                    />
                  </div>
                  
                  {searchTerm && searchResults.length > 0 && (
                    <Card className="mt-2 absolute z-10 w-full max-w-md">
                      <CardContent className="p-1">
                        <ul className="max-h-48 overflow-y-auto">
                          {searchResults.map(bando => (
                            <li
                              key={bando.id}
                              className="hover:bg-slate-100 p-2 cursor-pointer rounded-md text-sm"
                              onClick={() => {
                                setSelectedBando(bando.id);
                                setSearchTerm(bando.titolo);
                                setSearchResults([]);
                              }}
                            >
                              {bando.titolo}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="cliente" className="text-slate-700">Cliente</Label>
                  <Select onValueChange={setSelectedCliente} value={selectedCliente}>
                    <SelectTrigger id="cliente" className="w-full">
                      <SelectValue placeholder="Seleziona Cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clienti.map(cliente => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={handleMatch} 
                  disabled={isLoading || !selectedBando || !selectedCliente}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Crea Match
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">oppure</span>
                  </div>
                </div>
                
                <Button 
                  onClick={handleGenerateAutomaticMatches}
                  disabled={isGeneratingMatches || clienti.length === 0 || bandi.length === 0}
                  variant="outline"
                  className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                >
                  {isGeneratingMatches ? (
                    <>
                      <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                      Generazione in corso...
                    </>
                  ) : (
                    <>
                      Genera match automatici
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b">
              <CardTitle className="text-slate-700">Statistiche</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                  <div className="text-3xl font-bold text-indigo-600">{matches.length}</div>
                  <div className="text-sm text-slate-500">Match totali</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                  <div className="text-3xl font-bold text-green-600">
                    {matches.filter(m => m.punteggio >= 80).length}
                  </div>
                  <div className="text-sm text-slate-500">Match &gt;80%</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                  <div className="text-3xl font-bold text-amber-600">{bandi.length}</div>
                  <div className="text-sm text-slate-500">Bandi</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                  <div className="text-3xl font-bold text-blue-600">{clienti.length}</div>
                  <div className="text-sm text-slate-500">Clienti</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-slate-700">Lista Match</CardTitle>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={fetchMatches}
                  disabled={isLoadingMatches}
                  className="text-slate-600"
                >
                  <RotateCw className={`h-4 w-4 mr-1 ${isLoadingMatches ? 'animate-spin' : ''}`} />
                  Aggiorna
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={handleExportCSV}
                  className="text-slate-600"
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Esporta
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="border-b bg-slate-50 px-6 py-3">
              <div className="flex justify-between items-center">
                <Tabs defaultValue="tutti" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="bg-slate-100">
                    <TabsTrigger value="tutti" className="text-sm">
                      Tutti ({matches.length})
                    </TabsTrigger>
                    <TabsTrigger value="alti" className="text-sm">
                      &gt; 80% ({matches.filter(m => m.punteggio >= 80).length})
                    </TabsTrigger>
                    <TabsTrigger value="medi" className="text-sm">
                      60-80% ({matches.filter(m => m.punteggio >= 60 && m.punteggio < 80).length})
                    </TabsTrigger>
                    <TabsTrigger value="bassi" className="text-sm">
                      &lt; 60% ({matches.filter(m => m.punteggio < 60).length})
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <div className="flex items-center text-sm text-slate-500">
                  {filteredMatches.length} risultati
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <MatchTable 
                matches={filteredMatches} 
                onExportCSV={handleExportCSV}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MatchPage;
