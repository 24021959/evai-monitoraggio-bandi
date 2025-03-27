
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ArrowLeftRight, InfoIcon, AlertCircle, Mail, FileText, ChevronRight } from 'lucide-react';
import MatchTable from '@/components/MatchTable';
import { Bando } from '@/types';
import { FirecrawlService } from '@/utils/FirecrawlService';
import { mockClienti } from '@/data/mockData';
import { useToast } from "@/components/ui/use-toast";

export default function Match() {
  const { toast } = useToast();
  const [bandiImportati, setBandiImportati] = useState<Bando[]>([]);
  const [savedBandi, setSavedBandi] = useState<Bando[]>([]);
  const [allBandi, setAllBandi] = useState<Bando[]>([]);
  const [activeTab, setActiveTab] = useState('tutti');
  const [matches, setMatches] = useState<any[]>([]);
  const [clientiMatch, setClientiMatch] = useState<any[]>([]);
  const [bandiMatch, setBandiMatch] = useState<any[]>([]);
  
  useEffect(() => {
    // Recupera i bandi importati da sessionStorage
    const importedBandi = sessionStorage.getItem('bandiImportati');
    if (importedBandi) {
      try {
        const parsedBandi = JSON.parse(importedBandi);
        setBandiImportati(parsedBandi);
        console.log('Match: Bandi importati recuperati:', parsedBandi.length);
      } catch (error) {
        console.error('Errore nel parsing dei bandi importati:', error);
      }
    }
    
    // Recupera i bandi salvati
    const loadedBandi = FirecrawlService.getSavedBandi();
    setSavedBandi(loadedBandi);
    console.log('Match: Bandi salvati recuperati:', loadedBandi.length);
  }, []);
  
  // Combine all bandi sources when either changes
  useEffect(() => {
    const combined = [...savedBandi, ...bandiImportati];
    setAllBandi(combined);
    console.log("Match: Combined bandi count:", combined.length);
  }, [savedBandi, bandiImportati]);
  
  // Calculate real matches based on clients and grants
  useEffect(() => {
    if (allBandi.length > 0 && mockClienti.length > 0) {
      // Calculate matches between clients and grants
      const calculatedMatches = [];
      const clientMatches: Record<string, {count: number, score: number}> = {};
      const bandoMatches: Record<string, {count: number, score: number}> = {};
      
      for (const cliente of mockClienti) {
        for (const bando of allBandi) {
          const matchScore = calculateMatchScore(cliente, bando);
          
          if (matchScore > 60) { // Only consider matches above 60%
            const matchId = `match-${cliente.id}-${bando.id}`;
            
            calculatedMatches.push({
              id: matchId,
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
              punteggio: matchScore,
              dataMatch: new Date().toISOString().split('T')[0]
            });
            
            // Update client match counts
            if (!clientMatches[cliente.id]) {
              clientMatches[cliente.id] = { count: 0, score: 0 };
            }
            clientMatches[cliente.id].count += 1;
            clientMatches[cliente.id].score = Math.max(clientMatches[cliente.id].score, matchScore);
            
            // Update grant match counts
            if (!bandoMatches[bando.id]) {
              bandoMatches[bando.id] = { count: 0, score: 0 };
            }
            bandoMatches[bando.id].count += 1;
            bandoMatches[bando.id].score = Math.max(bandoMatches[bando.id].score, matchScore);
          }
        }
      }
      
      // Sort matches by score
      calculatedMatches.sort((a, b) => b.punteggio - a.punteggio);
      setMatches(calculatedMatches);
      
      // Prepare client match data
      const clientMatchArray = mockClienti
        .filter(cliente => clientMatches[cliente.id])
        .map(cliente => ({
          id: cliente.id,
          nome: cliente.nome,
          settore: cliente.settore,
          punteggio: clientMatches[cliente.id]?.score || 0,
          bandi: clientMatches[cliente.id]?.count || 0
        }))
        .sort((a, b) => b.punteggio - a.punteggio);
      
      setClientiMatch(clientMatchArray);
      
      // Prepare grant match data
      const bandoMatchArray = allBandi
        .filter(bando => bandoMatches[bando.id])
        .map(bando => ({
          id: bando.id,
          titolo: bando.titolo,
          fonte: bando.fonte,
          punteggio: bandoMatches[bando.id]?.score || 0,
          clienti: bandoMatches[bando.id]?.count || 0
        }))
        .sort((a, b) => b.punteggio - a.punteggio);
      
      setBandiMatch(bandoMatchArray);
      
      toast({
        title: "Match completati",
        description: `Trovati ${calculatedMatches.length} match tra ${clientMatchArray.length} clienti e ${bandoMatchArray.length} bandi`,
      });
    }
  }, [allBandi]);
  
  const calculateMatchScore = (cliente: any, bando: Bando): number => {
    let score = 0;
    let totalFactors = 0;
    
    // Match by sector
    if (cliente.settore && bando.settori && Array.isArray(bando.settori)) {
      const settoreLowerCase = cliente.settore.toLowerCase();
      // Check if any of the bando sectors match the client sector
      const sectorMatch = bando.settori.some(
        settore => settore.toLowerCase().includes(settoreLowerCase) || 
                   settoreLowerCase.includes(settore.toLowerCase())
      );
      
      if (sectorMatch) {
        score += 40;
      }
      totalFactors += 40;
    }
    
    // Match by company size
    if (cliente.dimensione && bando.requisiti) {
      const requisiti = bando.requisiti.toLowerCase();
      const dimensione = cliente.dimensione.toLowerCase();
      
      if (
        (dimensione === 'piccola' && requisiti.includes('piccol')) ||
        (dimensione === 'media' && requisiti.includes('medi')) ||
        (dimensione === 'grande' && requisiti.includes('grand'))
      ) {
        score += 20;
      }
      totalFactors += 20;
    }
    
    // Match by location
    if (cliente.regione && bando.tipo) {
      if (
        (bando.tipo === 'regionale' && bando.requisiti && 
         bando.requisiti.toLowerCase().includes(cliente.regione.toLowerCase())) ||
        (bando.tipo === 'statale' || bando.tipo === 'europeo')
      ) {
        score += 20;
      }
      totalFactors += 20;
    }
    
    // Match by finance amount
    if (cliente.fatturato && bando.importoMin && bando.importoMax) {
      const fatturato = parseFloat(cliente.fatturato.toString().replace(/[^0-9.]/g, ''));
      
      // For smaller companies, larger grants are better
      // For larger companies, check if the grant amount is significant enough
      if (
        (fatturato < 2000000 && bando.importoMax > 50000) ||
        (fatturato >= 2000000 && fatturato < 10000000 && bando.importoMax > 100000) ||
        (fatturato >= 10000000 && bando.importoMax > 500000)
      ) {
        score += 20;
      }
      totalFactors += 20;
    }
    
    // Calculate final percentage
    return totalFactors > 0 ? Math.round((score / totalFactors) * 100) : 50;
  };
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Match Clienti-Bandi</h1>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Esporta Report
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Notifica Clienti
          </Button>
        </div>
      </div>
      
      {allBandi.length > 0 ? (
        <Alert className="bg-green-50 border-green-200">
          <ArrowLeftRight className="h-4 w-4 text-green-600" />
          <AlertTitle>Bandi disponibili per il match</AlertTitle>
          <AlertDescription>
            Abbiamo {allBandi.length} bandi disponibili per il match con i clienti 
            ({bandiImportati.length} importati da Google Sheets, {savedBandi.length} salvati nel sistema).
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Match automatico</AlertTitle>
          <AlertDescription>
            Il sistema analizza i profili dei clienti e li confronta con i bandi disponibili per trovare le migliori corrispondenze.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="match" className="w-full">
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
                  <MatchTable matches={matches} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="clienti">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle>Match per Cliente</CardTitle>
                  <CardDescription>
                    Clienti ordinati per numero di corrispondenze disponibili
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {clientiMatch.map((cliente) => (
                      <div key={cliente.id} className="flex items-center justify-between border-b pb-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{cliente.nome.substring(0, 2)}</AvatarFallback>
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
                    ))}
                    
                    {clientiMatch.length === 0 && (
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
                    {bandiMatch.map((bando) => (
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
                    ))}
                    
                    {bandiMatch.length === 0 && (
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
                    <div className="text-2xl font-bold text-green-700">{allBandi.length}</div>
                    <div className="text-sm text-gray-600">Bandi disponibili</div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Clienti con più match</h4>
                  <div className="space-y-2">
                    {clientiMatch.slice(0, 2).map((cliente) => (
                      <div key={cliente.id} className="flex justify-between items-center">
                        <div className="text-sm">{cliente.nome}</div>
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
                    {bandiMatch.slice(0, 2).map((bando) => (
                      <div key={bando.id} className="flex justify-between items-center">
                        <div className="text-sm">{bando.titolo}</div>
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
                      variant={activeTab === 'tutti' ? 'default' : 'outline'} 
                      className="cursor-pointer"
                      onClick={() => handleTabChange('tutti')}
                    >
                      Tutti
                    </Badge>
                    <Badge 
                      variant={activeTab === 'informatica' ? 'default' : 'outline'} 
                      className="cursor-pointer"
                      onClick={() => handleTabChange('informatica')}
                    >
                      Informatica
                    </Badge>
                    <Badge 
                      variant={activeTab === 'energia' ? 'default' : 'outline'} 
                      className="cursor-pointer"
                      onClick={() => handleTabChange('energia')}
                    >
                      Energia
                    </Badge>
                    <Badge 
                      variant={activeTab === 'agri' ? 'default' : 'outline'} 
                      className="cursor-pointer"
                      onClick={() => handleTabChange('agri')}
                    >
                      Agricoltura
                    </Badge>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Per livello di match</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="cursor-pointer bg-green-50">Alto (80%+)</Badge>
                    <Badge variant="outline" className="cursor-pointer bg-yellow-50">Medio (60-80%)</Badge>
                    <Badge variant="outline" className="cursor-pointer bg-red-50">Basso (&lt;60%)</Badge>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Per fonte</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="cursor-pointer">MIMIT</Badge>
                    <Badge variant="outline" className="cursor-pointer">UE</Badge>
                    <Badge variant="outline" className="cursor-pointer">Regione</Badge>
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
    </div>
  );
}
