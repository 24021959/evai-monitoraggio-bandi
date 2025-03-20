import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { FirecrawlService } from '@/utils/FirecrawlService';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { KeyRound, AlertCircle, CheckCircle } from 'lucide-react';

interface CrawlResult {
  success: boolean;
  status?: string;
  completed?: number;
  total?: number;
  creditsUsed?: number;
  expiresAt?: string;
  data?: any[];
}

export const CrawlForm = () => {
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [crawlResult, setCrawlResult] = useState<CrawlResult | null>(null);
  const [extractedBandi, setExtractedBandi] = useState<any[]>([]);
  const [showApiKeyInput, setShowApiKeyInput] = useState(!FirecrawlService.getApiKey());
  const [apiKeyStatus, setApiKeyStatus] = useState<'none' | 'saved' | 'already-exists'>('none');

  useEffect(() => {
    const savedApiKey = FirecrawlService.getApiKey();
    if (savedApiKey) {
      setApiKeyStatus('saved');
    }
  }, []);

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "Errore",
        description: "Inserisci una API key valida",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (FirecrawlService.isApiKeyAlreadySaved(apiKey)) {
      setApiKeyStatus('already-exists');
      toast({
        title: "Informazione",
        description: "Questa API key è già stata salvata nel sistema",
        duration: 3000,
      });
      return;
    }

    try {
      setIsLoading(true);
      const isValid = await FirecrawlService.testApiKey(apiKey);
      
      if (isValid) {
        FirecrawlService.saveApiKey(apiKey);
        setShowApiKeyInput(false);
        setApiKeyStatus('saved');
        toast({
          title: "Successo",
          description: "API key salvata con successo",
          duration: 3000,
        });
      } else {
        toast({
          title: "Errore",
          description: "API key non valida",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore nel test della API key",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewApiKey = () => {
    const savedApiKey = FirecrawlService.getApiKey();
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setShowApiKeyInput(true);
      setApiKeyStatus('already-exists');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setProgress(0);
    setCrawlResult(null);
    setExtractedBandi([]);
    
    try {
      const apiKey = FirecrawlService.getApiKey();
      if (!apiKey) {
        toast({
          title: "Errore",
          description: "Imposta prima la tua API key",
          variant: "destructive",
          duration: 3000,
        });
        setShowApiKeyInput(true);
        return;
      }

      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newValue = prev + 5;
          return newValue > 90 ? 90 : newValue;
        });
      }, 500);

      console.log('Avvio crawl per URL:', url);
      const result = await FirecrawlService.crawlWebsite(url);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if (result.success) {
        setCrawlResult(result.data);
        toast({
          title: "Successo",
          description: "Website crawled con successo",
          duration: 3000,
        });
        
        const bandi = await FirecrawlService.extractBandiFromCrawlData(result.data);
        setExtractedBandi(bandi);
        
        if (bandi.length > 0) {
          toast({
            title: "Estrazione completata",
            description: `Estratti ${bandi.length} bandi potenziali`,
            duration: 3000,
          });
        } else {
          toast({
            title: "Attenzione",
            description: "Nessun bando rilevato nella pagina",
            variant: "destructive",
            duration: 3000,
          });
        }
      } else {
        toast({
          title: "Errore",
          description: result.error || "Impossibile eseguire il crawl del sito web",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Errore durante il crawl del sito web:', error);
      toast({
        title: "Errore",
        description: "Impossibile eseguire il crawl del sito web",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {showApiKeyInput && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-blue-500" />
              <CardTitle>Configura Firecrawl API</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {apiKeyStatus === 'already-exists' && (
                <Alert className="bg-blue-50 border-blue-100">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  <AlertTitle>API Key già presente</AlertTitle>
                  <AlertDescription>
                    Questa API key è già stata salvata nel sistema.
                  </AlertDescription>
                </Alert>
              )}
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Attenzione</AlertTitle>
                <AlertDescription>
                  È necessaria una API key di Firecrawl per utilizzare il servizio di scraping. 
                  Visita <a href="https://firecrawl.dev" className="text-blue-500 underline" target="_blank" rel="noopener noreferrer">firecrawl.dev</a> per ottenere una API key.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Label htmlFor="apiKey">Firecrawl API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setApiKeyStatus('none');
                  }}
                  placeholder="Inserisci la tua API key"
                />
              </div>
              
              <Button 
                onClick={handleSaveApiKey}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Verifica..." : "Salva API Key"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {!showApiKeyInput && apiKeyStatus === 'saved' && (
        <Card className="bg-green-50 border-green-100">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <CardTitle>API Key configurata</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              L'API key di Firecrawl è stata configurata correttamente. Puoi procedere con l'estrazione dei bandi.
            </p>
            <Button 
              variant="outline" 
              onClick={handleViewApiKey} 
              className="w-full"
            >
              Visualizza/Modifica API Key
            </Button>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Estrai Bandi da Sito Web</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="url">URL Sito Web</Label>
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://esempio.com/bandi"
                required
              />
            </div>
            
            {isLoading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}
            
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Estrazione in corso..." : "Estrai Bandi"}
            </Button>
          </form>
          
          {extractedBandi.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Bandi Estratti ({extractedBandi.length})</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {extractedBandi.map((bando, index) => (
                  <Card key={index} className="p-4 text-sm">
                    <div className="font-medium">{bando.titolo}</div>
                    <div className="text-gray-500 text-xs mt-1">Scadenza: {new Date(bando.scadenza).toLocaleDateString('it-IT')}</div>
                    <div className="text-gray-500 text-xs">Importo: fino a €{bando.importoMax.toLocaleString('it-IT')}</div>
                    <div className="mt-2 flex gap-1 flex-wrap">
                      {bando.settori.map((settore: string, i: number) => (
                        <span key={i} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {settore}
                        </span>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
              <div className="mt-4">
                <Button variant="outline" className="w-full">
                  Salva Bandi Estratti
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
