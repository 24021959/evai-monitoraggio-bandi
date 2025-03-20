
import React, { useState, useEffect } from 'react';
import { mockFonti, mockClienti } from '@/data/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, HelpCircle, PlayCircle, AlertCircle } from 'lucide-react';
import FontiTable from '@/components/FontiTable';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { Progress } from '@/components/ui/progress';
import { CrawlForm } from '@/components/CrawlForm';
import AddSourceForm from '@/components/AddSourceForm';
import ClienteCard from '@/components/ClienteCard';
import { Fonte } from '@/types';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Fonti = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [fonti, setFonti] = useState(mockFonti);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [progress, setProgress] = useState(0);
  const [monitoringResults, setMonitoringResults] = useState<any[]>([]);
  const [clientiMock] = useState(mockClienti);
  
  const handleEdit = (id: string) => {
    console.log('Edit fonte with id:', id);
  };
  
  const handleDelete = (id: string) => {
    setFonti(fonti.filter(fonte => fonte.id !== id));
  };

  const handleAddSource = (newSource: Omit<Fonte, 'id'>) => {
    const id = `fonte-${Date.now()}`;
    setFonti([...fonti, { id, ...newSource }]);
  };

  const startMonitoring = () => {
    if (fonti.length === 0) {
      toast({
        title: "Attenzione",
        description: "Aggiungi almeno una fonte prima di avviare il monitoraggio",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsMonitoring(true);
    setProgress(0);
    setMonitoringResults([]);

    // Simuliamo il monitoraggio
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 4;
      setProgress(currentProgress);
      
      // Generare un risultato ogni 25% circa
      if (currentProgress % 25 === 0) {
        const randomFonte = fonti[Math.floor(Math.random() * fonti.length)];
        const randomCliente = clientiMock[Math.floor(Math.random() * clientiMock.length)];
        
        setMonitoringResults(prev => [
          ...prev,
          {
            id: `result-${Date.now()}-${Math.random()}`,
            fonte: randomFonte.nome,
            url: randomFonte.url,
            bandoTitolo: `Bando per ${randomCliente.interessiSettoriali[0] || 'sviluppo'} - ${new Date().toLocaleDateString('it-IT')}`,
            clienteNome: randomCliente.nome,
            compatibilita: Math.floor(Math.random() * 30) + 70
          }
        ]);
      }
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsMonitoring(false);
        
        toast({
          title: "Monitoraggio completato",
          description: `Trovati ${monitoringResults.length + 1} match potenziali`,
          duration: 3000,
        });
      }
    }, 400);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestione Fonti di Dati</h1>
        <div className="flex gap-2">
          {isMonitoring ? (
            <Button disabled className="flex items-center gap-2">
              <PlayCircle className="h-4 w-4" />
              Monitoraggio in corso...
            </Button>
          ) : (
            <Button 
              onClick={startMonitoring}
              className="flex items-center gap-2"
            >
              <PlayCircle className="h-4 w-4" />
              Avvia Monitoraggio
            </Button>
          )}
        </div>
      </div>
      
      {isMonitoring && (
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Monitoraggio fonti in corso...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}
      
      {monitoringResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Risultati Monitoraggio</CardTitle>
            <CardDescription>
              Trovati {monitoringResults.length} match potenziali tra bandi e clienti
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {monitoringResults.map((result, index) => (
                <div key={index} className="flex items-start p-4 border rounded-md bg-white hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <h3 className="font-medium">{result.bandoTitolo}</h3>
                    <p className="text-sm text-gray-500">Fonte: {result.fonte}</p>
                    <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">
                      {result.url}
                    </a>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">Match con: <span className="font-medium">{result.clienteNome}</span></p>
                    <div className="flex items-center justify-end mt-1 gap-2">
                      <span className="text-xs">Compatibilità:</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        result.compatibilita > 80 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {result.compatibilita}%
                      </span>
                    </div>
                    <Button size="sm" variant="outline" className="mt-2" onClick={() => navigate('/match')}>
                      Vedi Dettaglio
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => navigate('/match')}>
              Vai a Match
            </Button>
          </CardFooter>
        </Card>
      )}
      
      <Tabs defaultValue="fonti" className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="fonti">Fonti Configurate</TabsTrigger>
          <TabsTrigger value="aggiungi">Aggiungi Fonte</TabsTrigger>
          <TabsTrigger value="configura">Configura Scraping</TabsTrigger>
        </TabsList>
        
        <TabsContent value="fonti">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Fonti Configurate</CardTitle>
              <CardDescription>Gestisci le fonti da cui estrarre i dati sui bandi</CardDescription>
            </CardHeader>
            <CardContent>
              {fonti.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Nessuna fonte configurata</AlertTitle>
                  <AlertDescription>
                    Aggiungi almeno una fonte per avviare il monitoraggio dei bandi.
                  </AlertDescription>
                </Alert>
              ) : (
                <FontiTable 
                  fonti={fonti} 
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="aggiungi">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AddSourceForm onAddSource={handleAddSource} />
            </div>
            
            <div>
              <Card className="bg-blue-50 border-blue-100">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-blue-500" />
                    <CardTitle>Suggerimenti</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Aggiungi siti web di fonti ufficiali per il monitoraggio dei bandi. Alcune fonti consigliate:
                  </p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">UE</span>
                      <span>ec.europa.eu/info/funding-tenders</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">IT</span>
                      <span>mise.gov.it/bandi</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full">REG</span>
                      <span>regione.lombardia.it/bandi</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="configura">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CrawlForm />
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Clienti Configurati</CardTitle>
                  <CardDescription>Clienti disponibili per il matching automatico</CardDescription>
                </CardHeader>
                <CardContent>
                  {clientiMock.length === 0 ? (
                    <p className="text-gray-500 text-sm">Nessun cliente configurato</p>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                      {clientiMock.slice(0, 3).map((cliente) => (
                        <ClienteCard key={cliente.id} cliente={cliente} />
                      ))}
                      
                      {clientiMock.length > 3 && (
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => navigate('/clienti')}
                        >
                          Vedi tutti i clienti ({clientiMock.length})
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full"
                    onClick={() => navigate('/clienti/nuovo')}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Aggiungi Cliente
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Fonti;
