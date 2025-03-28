import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, AlertCircle, Play, RefreshCw, StopCircle } from 'lucide-react';
import FontiTable from '@/components/FontiTable';
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddSourceForm from '@/components/AddSourceForm';
import EditSourceForm from '@/components/EditSourceForm';
import { Fonte } from '@/types';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FirecrawlService } from '@/utils/FirecrawlService';
import { Progress } from "@/components/ui/progress";
import { useQuery } from '@tanstack/react-query';
import SupabaseFontiService from '@/utils/SupabaseFontiService';

const Fonti = () => {
  const { toast } = useToast();
  const [fonti, setFonti] = useState<Fonte[]>([]);
  const [activeTab, setActiveTab] = useState("fonti");
  const [selectedFonte, setSelectedFonte] = useState<Fonte | null>(null);
  const [isScrapingInProgress, setIsScrapingInProgress] = useState(false);
  const [scrapingProgress, setScrapingProgress] = useState(0);
  const [currentScrapingFonte, setCurrentScrapingFonte] = useState<Fonte | null>(null);
  const [autoScrape, setAutoScrape] = useState(false);
  const [progressInterval, setProgressInterval] = useState<NodeJS.Timeout | null>(null);
  
  const { data: supabaseFonti, isLoading } = useQuery({
    queryKey: ['fonti'],
    queryFn: async () => {
      const sources = await SupabaseFontiService.getFonti();
      console.log('Fonti caricate da Supabase:', sources);
      return sources;
    }
  });
  
  useEffect(() => {
    if (supabaseFonti && supabaseFonti.length > 0) {
      setFonti(supabaseFonti);
      FirecrawlService.saveFonti(supabaseFonti);
    } else {
      const savedFonti = FirecrawlService.getSavedFonti();
      if (savedFonti.length > 0) {
        setFonti(savedFonti);
      }
    }
    
    const autoMonitoringEnabled = localStorage.getItem('auto_monitoring_enabled') === 'true';
    if (autoMonitoringEnabled && !autoScrape && !isScrapingInProgress) {
      setAutoScrape(true);
      localStorage.removeItem('auto_monitoring_enabled');
    }
  }, [supabaseFonti]);
  
  useEffect(() => {
    const handleAutoMonitoringStart = () => {
      if (!autoScrape && !isScrapingInProgress) {
        setAutoScrape(true);
        handleScrapeNext();
      }
    };
    
    window.addEventListener('auto_monitoring_start', handleAutoMonitoringStart);
    
    return () => {
      window.removeEventListener('auto_monitoring_start', handleAutoMonitoringStart);
    };
  }, [autoScrape, isScrapingInProgress]);
  
  useEffect(() => {
    if (fonti.length > 0) {
      FirecrawlService.saveFonti(fonti);
      const syncToSupabase = async () => {
        try {
          await SupabaseFontiService.saveFonti(fonti);
        } catch (error) {
          console.error('Errore durante il salvataggio delle fonti su Supabase:', error);
        }
      };
      syncToSupabase();
    }
  }, [fonti]);
  
  useEffect(() => {
    const checkForScrapingTask = () => {
      if (autoScrape && !isScrapingInProgress) {
        handleScrapeNext();
      }
    };
    
    const intervalId = setInterval(checkForScrapingTask, 3000);
    
    return () => clearInterval(intervalId);
  }, [autoScrape, isScrapingInProgress]);

  const handleEdit = (id: string) => {
    const fonte = fonti.find(f => f.id === id);
    if (fonte) {
      setSelectedFonte(fonte);
      setActiveTab("modifica");
    }
  };
  
  const handleSaveEdit = async (updatedFonte: Fonte) => {
    setFonti(fonti.map(f => f.id === updatedFonte.id ? updatedFonte : f));
    try {
      const success = await SupabaseFontiService.saveFonte(updatedFonte);
      if (success) {
        toast({
          title: "Fonte aggiornata",
          description: "La fonte è stata aggiornata con successo",
          duration: 3000,
        });
      } else {
        toast({
          title: "Errore",
          description: "Si è verificato un errore durante l'aggiornamento della fonte",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: `Si è verificato un errore: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`,
        variant: "destructive",
        duration: 3000,
      });
    }
    setSelectedFonte(null);
    setActiveTab("fonti");
  };
  
  const handleCancelEdit = () => {
    setSelectedFonte(null);
    setActiveTab("fonti");
  };
  
  const handleDelete = async (id: string) => {
    try {
      const success = await SupabaseFontiService.deleteFonte(id);
      if (success) {
        setFonti(fonti.filter(fonte => fonte.id !== id));
        toast({
          title: "Fonte eliminata",
          description: "La fonte è stata eliminata con successo",
          duration: 3000,
        });
      } else {
        toast({
          title: "Errore",
          description: "Si è verificato un errore durante l'eliminazione della fonte",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: `Si è verificato un errore: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`,
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleAddSource = async (newSource: Omit<Fonte, 'id'>) => {
    try {
      const newFonte: Fonte = { id: `temp-${Date.now()}`, ...newSource };
      const success = await SupabaseFontiService.saveFonte(newFonte);
      if (success) {
        const updatedFonti = await SupabaseFontiService.getFonti();
        setFonti(updatedFonti);
        setActiveTab("fonti");
        toast({
          title: "Fonte aggiunta",
          description: "La fonte è stata aggiunta con successo",
          duration: 3000,
        });
      } else {
        toast({
          title: "Errore",
          description: "Si è verificato un errore durante l'aggiunta della fonte",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: `Si è verificato un errore: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`,
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleStopScraping = () => {
    if (progressInterval) {
      clearInterval(progressInterval);
    }
    
    setIsScrapingInProgress(false);
    setCurrentScrapingFonte(null);
    setScrapingProgress(0);
    setAutoScrape(false);
    
    toast({
      title: "Scraping interrotto",
      description: "Il processo di scraping è stato interrotto",
      duration: 3000,
    });
  };

  const handleScrapeNext = async () => {
    if (isScrapingInProgress) return;
    
    const apiKey = FirecrawlService.getApiKey();
    if (!apiKey) {
      toast({
        title: "Errore",
        description: "Imposta prima la tua API key nelle impostazioni",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    const nextSource = FirecrawlService.getNextUnscrapedSource(fonti);
    if (!nextSource) {
      toast({
        title: "Completato",
        description: "Tutte le fonti attive sono state già scrappate",
        duration: 3000,
      });
      setAutoScrape(false);
      return;
    }
    
    setIsScrapingInProgress(true);
    setScrapingProgress(0);
    setCurrentScrapingFonte(nextSource);
    
    const interval = setInterval(() => {
      setScrapingProgress((prev) => {
        const newValue = prev + 5;
        return newValue > 90 ? 90 : newValue;
      });
    }, 500);
    
    setProgressInterval(interval);
    
    try {
      const result = await FirecrawlService.crawlWebsite(nextSource.url);
      
      clearInterval(interval);
      setProgressInterval(null);
      setScrapingProgress(100);
      
      if (result.success) {
        const bandi = await FirecrawlService.extractBandiFromCrawlData(result.data);
        
        if (bandi.length > 0) {
          FirecrawlService.saveBandi(bandi);
          FirecrawlService.markSourceAsScraped(nextSource.id);
          
          toast({
            title: "Scraping completato",
            description: `Estratti ${bandi.length} bandi dalla fonte "${nextSource.nome}"`,
            duration: 3000,
          });
        } else {
          toast({
            title: "Scraping completato",
            description: `Nessun bando trovato nella fonte "${nextSource.nome}"`,
            duration: 3000,
          });
          FirecrawlService.markSourceAsScraped(nextSource.id);
        }
      } else {
        toast({
          title: "Errore",
          description: `Impossibile eseguire lo scraping della fonte "${nextSource.nome}": ${result.error}`,
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      if (interval) {
        clearInterval(interval);
        setProgressInterval(null);
      }
      
      toast({
        title: "Errore",
        description: `Si è verificato un errore durante lo scraping: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsScrapingInProgress(false);
      setCurrentScrapingFonte(null);
      
      if (!autoScrape) {
        const nextSource = FirecrawlService.getNextUnscrapedSource(fonti);
        if (nextSource) {
          toast({
            title: "Fonte successiva",
            description: `Pronta per lo scraping: "${nextSource.nome}"`,
            duration: 3000,
          });
        }
      }
    }
  };
  
  const handleResetScrapedSources = () => {
    FirecrawlService.resetScrapedSources();
    setAutoScrape(false);
    toast({
      title: "Reset completato",
      description: "Lo stato di scraping delle fonti è stato resettato",
      duration: 3000,
    });
  };
  
  const handleToggleAutoScrape = () => {
    const newState = !autoScrape;
    setAutoScrape(newState);
    
    if (newState) {
      toast({
        title: "Monitoraggio automatico attivato",
        description: "Le fonti verranno scrappate in sequenza automaticamente",
        duration: 3000,
      });
      
      if (!isScrapingInProgress) {
        handleScrapeNext();
      }
    } else {
      toast({
        title: "Monitoraggio automatico disattivato",
        description: "Lo scraping automatico è stato interrotto",
        duration: 3000,
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestione Fonti di Dati</h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleResetScrapedSources}
            disabled={isScrapingInProgress}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Monitoraggio
          </Button>
          {isScrapingInProgress ? (
            <Button
              onClick={handleStopScraping}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <StopCircle className="h-4 w-4" />
              Ferma Scraping
            </Button>
          ) : (
            <Button
              onClick={handleScrapeNext}
              disabled={isScrapingInProgress}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Monitoraggio Prossima Fonte
            </Button>
          )}
          <Button
            onClick={handleToggleAutoScrape}
            disabled={isScrapingInProgress && !autoScrape}
            variant={autoScrape ? "default" : "outline"}
            className={`flex items-center gap-2 ${autoScrape ? "bg-green-600 hover:bg-green-700" : ""}`}
          >
            {autoScrape ? "Ferma Monitoraggio Automatico" : "Avvia Monitoraggio Automatico"}
          </Button>
        </div>
      </div>
      
      {isLoading && (
        <Card className="bg-gray-50 border-gray-100">
          <CardContent className="pt-6">
            <div className="flex justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
            <p className="text-center mt-4 text-gray-500">Caricamento fonti in corso...</p>
          </CardContent>
        </Card>
      )}
      
      {currentScrapingFonte && (
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="pt-6">
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Scraping in corso: {currentScrapingFonte.nome}</h3>
                  <p className="text-sm text-gray-500">{currentScrapingFonte.url}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{scrapingProgress}%</span>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={handleStopScraping}
                    className="text-red-500 hover:text-red-700"
                  >
                    <StopCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Progress value={scrapingProgress} className="w-full" indicatorClassName="bg-green-500" />
            </div>
          </CardContent>
        </Card>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="fonti">Fonti Configurate</TabsTrigger>
          <TabsTrigger value="aggiungi">Aggiungi Fonte</TabsTrigger>
          <TabsTrigger value="modifica" disabled={!selectedFonte}>Modifica Fonte</TabsTrigger>
        </TabsList>
        
        <TabsContent value="fonti">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Fonti Configurate</CardTitle>
              <CardDescription>Gestisci le fonti da cui estrarre i dati sui bandi</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
                </div>
              ) : fonti.length === 0 ? (
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
                  currentScrapingId={currentScrapingFonte?.id}
                  scrapingProgress={scrapingProgress}
                  onStopScraping={handleStopScraping}
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
        
        <TabsContent value="modifica">
          {selectedFonte && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <EditSourceForm 
                  fonte={selectedFonte} 
                  onSave={handleSaveEdit} 
                  onCancel={handleCancelEdit} 
                />
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
                      Aggiorna i dettagli della fonte per migliorare il monitoraggio:
                    </p>
                    <ul className="mt-4 space-y-2 text-sm">
                      <li>• Assicurati che l'URL sia corretto e accessibile</li>
                      <li>• Imposta su "inattivo" le fonti che non vuoi monitorare temporaneamente</li>
                      <li>• Scegli il tipo corretto per migliorare la categorizzazione</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Fonti;
