
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ArrowLeftRight, Info, AlertCircle, Mail, FileText, ChevronRight } from 'lucide-react';
import { MatchTable } from '@/components/MatchTable';

export default function Match() {
  // Controllo se ci sono bandi importati da Google Sheets
  const [bandiImportati, setBandiImportati] = React.useState<any[]>([]);
  
  React.useEffect(() => {
    // Recupera i bandi importati da sessionStorage
    const importedBandi = sessionStorage.getItem('bandiImportati');
    if (importedBandi) {
      try {
        const parsedBandi = JSON.parse(importedBandi);
        setBandiImportati(parsedBandi);
        console.log('Bandi importati recuperati:', parsedBandi.length);
      } catch (error) {
        console.error('Errore nel parsing dei bandi importati:', error);
      }
    }
  }, []);
  
  // Stato per il tab attivo
  const [activeTab, setActiveTab] = React.useState('tutti');
  
  // Dati di esempio per i match
  const clientiMatch = [
    {
      id: '1',
      nome: 'Tecno Soluzioni SRL',
      settore: 'Informatica',
      punteggio: 92,
      bandi: 4
    },
    {
      id: '2',
      nome: 'Green Power SpA',
      settore: 'Energia',
      punteggio: 87,
      bandi: 3
    },
    {
      id: '3',
      nome: 'Agritech SA',
      settore: 'Agricoltura',
      punteggio: 76,
      bandi: 2
    }
  ];
  
  const bandiMatch = [
    {
      id: '1',
      titolo: 'Innovazione Digitale PMI',
      fonte: 'MIMIT',
      punteggio: 94,
      clienti: 3
    },
    {
      id: '2',
      titolo: 'Green Energy Transition',
      fonte: 'UE',
      punteggio: 88,
      clienti: 2
    },
    {
      id: '3',
      titolo: 'Agricoltura Sostenibile',
      fonte: 'Regione',
      punteggio: 79,
      clienti: 1
    }
  ];
  
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
      
      {bandiImportati.length > 0 ? (
        <Alert className="bg-green-50 border-green-200">
          <ArrowLeftRight className="h-4 w-4 text-green-600" />
          <AlertTitle>Bandi importati da Google Sheets</AlertTitle>
          <AlertDescription>
            Abbiamo importato {bandiImportati.length} bandi dal tuo foglio Google Sheets. 
            Questi bandi verranno utilizzati per il match con i clienti.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <Info className="h-4 w-4" />
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
                  <MatchTable />
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
                    <div className="text-2xl font-bold text-blue-700">87%</div>
                    <div className="text-sm text-gray-600">Match medio</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-700">12</div>
                    <div className="text-sm text-gray-600">Match totali</div>
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
