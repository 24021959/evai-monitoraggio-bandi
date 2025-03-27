import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileSpreadsheet, ArrowRight, AlertCircle, InfoIcon } from 'lucide-react';
import GoogleSheetsService from '@/utils/GoogleSheetsService';
import { Bando, Fonte } from '@/types';
import { FirecrawlService } from '@/utils/FirecrawlService';

const ImportaScraping = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [googleSheetUrl, setGoogleSheetUrl] = useState(GoogleSheetsService.getSheetUrl() || '');
  const [isLoading, setIsLoading] = useState(false);
  const [bandiAnteprima, setBandiAnteprima] = useState<Bando[]>([]);
  const [fontiAnteprima, setFontiAnteprima] = useState<Fonte[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("bandi");
  
  const handleImportBandi = async () => {
    if (!googleSheetUrl) {
      toast({
        title: "URL mancante",
        description: "Inserisci l'URL del foglio Google Sheets",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      GoogleSheetsService.setSheetUrl(googleSheetUrl);
      
      const bandi = await GoogleSheetsService.fetchBandiFromSheet(googleSheetUrl);
      
      if (bandi.length === 0) {
        setError("Nessun bando trovato nel foglio Google Sheets. Verifica che il formato sia corretto.");
        toast({
          title: "Nessun dato trovato",
          description: "Nessun bando trovato nel foglio. Verifica che il formato sia corretto.",
          variant: "destructive",
        });
      } else {
        setBandiAnteprima(bandi.slice(0, 5));
        
        toast({
          title: "Importazione completata",
          description: `Importati ${bandi.length} bandi dal foglio Google Sheets`,
        });
        
        sessionStorage.setItem('bandiImportati', JSON.stringify(bandi));
        
        setTimeout(() => {
          navigate('/match');
        }, 1500);
      }
    } catch (error: any) {
      console.error('Errore durante l\'importazione:', error);
      setError(error.message || "Errore durante l'importazione");
      toast({
        title: "Errore di importazione",
        description: error.message || "Si è verificato un errore durante l'importazione",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleImportFonti = async () => {
    if (!googleSheetUrl) {
      toast({
        title: "URL mancante",
        description: "Inserisci l'URL del foglio Google Sheets",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      GoogleSheetsService.setSheetUrl(googleSheetUrl);
      
      const fonti = await GoogleSheetsService.fetchFontiFromSheet(googleSheetUrl);
      
      if (fonti.length === 0) {
        setError("Nessuna fonte trovata nel foglio Google Sheets. Verifica che sia presente un foglio 'Lista Fonti' con il formato corretto.");
        toast({
          title: "Nessuna fonte trovata",
          description: "Verifica che sia presente un foglio 'Lista Fonti' con il formato corretto",
          variant: "destructive",
        });
      } else {
        setFontiAnteprima(fonti.slice(0, 5));
        
        FirecrawlService.saveFonti(fonti);
        
        toast({
          title: "Importazione completata",
          description: `Importate ${fonti.length} fonti dal foglio Google Sheets`,
        });
        
        setTimeout(() => {
          navigate('/fonti');
        }, 1500);
      }
    } catch (error: any) {
      console.error('Errore durante l\'importazione delle fonti:', error);
      setError(error.message || "Errore durante l'importazione delle fonti");
      toast({
        title: "Errore di importazione",
        description: error.message || "Si è verificato un errore durante l'importazione delle fonti",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Importa Dati da Google Sheets</h1>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-blue-500" />
            <CardTitle>Importa Dati da Google Sheets</CardTitle>
          </div>
          <CardDescription>
            Importa bandi o fonti da un foglio Google Sheets per gestire il sistema di monitoraggio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Informazioni sul formato</AlertTitle>
            <AlertDescription>
              Il foglio Google Sheets deve essere pubblico. Per importare le fonti, è necessario un foglio chiamato "Lista Fonti" con colonne come: id_number, url, stato_elaborazione, data_ultimo_aggiornamento, nome e tipo.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="googleSheetUrl">URL del foglio Google Sheets</Label>
              <Input
                id="googleSheetUrl"
                placeholder="Es. https://docs.google.com/spreadsheets/d/..."
                value={googleSheetUrl}
                onChange={(e) => setGoogleSheetUrl(e.target.value)}
              />
              <p className="text-sm text-gray-500">
                Inserisci l'URL completo del foglio Google Sheets contenente i dati
              </p>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="bandi">Importa Bandi</TabsTrigger>
                <TabsTrigger value="fonti">Importa Fonti</TabsTrigger>
              </TabsList>
              
              <TabsContent value="bandi">
                <Button 
                  onClick={handleImportBandi} 
                  disabled={isLoading || !googleSheetUrl} 
                  className="w-full"
                >
                  {isLoading && activeTab === "bandi" ? 'Importazione bandi in corso...' : 'Importa Bandi e vai al Match'}
                  {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
                
                {bandiAnteprima.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <Separator />
                    <h3 className="font-medium">Anteprima bandi importati</h3>
                    <div className="rounded-md border">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-gray-50">
                            <th className="px-4 py-3 text-left">Titolo</th>
                            <th className="px-4 py-3 text-left">Fonte</th>
                            <th className="px-4 py-3 text-left">Tipo</th>
                            <th className="px-4 py-3 text-left">Scadenza</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bandiAnteprima.map((bando, index) => (
                            <tr key={index} className="border-b">
                              <td className="px-4 py-3">{bando.titolo}</td>
                              <td className="px-4 py-3">{bando.fonte}</td>
                              <td className="px-4 py-3">{bando.tipo}</td>
                              <td className="px-4 py-3">{bando.scadenza}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-sm text-gray-500 italic">
                      Visualizzazione dei primi 5 record importati.
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="fonti">
                <Button 
                  onClick={handleImportFonti} 
                  disabled={isLoading || !googleSheetUrl} 
                  className="w-full"
                >
                  {isLoading && activeTab === "fonti" ? 'Importazione fonti in corso...' : 'Importa Fonti e vai alla gestione Fonti'}
                  {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
                
                {fontiAnteprima.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <Separator />
                    <h3 className="font-medium">Anteprima fonti importate</h3>
                    <div className="rounded-md border">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-gray-50">
                            <th className="px-4 py-3 text-left">Nome</th>
                            <th className="px-4 py-3 text-left">URL</th>
                            <th className="px-4 py-3 text-left">Tipo</th>
                            <th className="px-4 py-3 text-left">Stato</th>
                          </tr>
                        </thead>
                        <tbody>
                          {fontiAnteprima.map((fonte, index) => (
                            <tr key={index} className="border-b">
                              <td className="px-4 py-3">{fonte.nome}</td>
                              <td className="px-4 py-3">{fonte.url}</td>
                              <td className="px-4 py-3">{fonte.tipo}</td>
                              <td className="px-4 py-3">{fonte.stato}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-sm text-gray-500 italic">
                      Visualizzazione dei primi 5 record importati.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Errore</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      <Tabs defaultValue="instruction">
        <TabsList>
          <TabsTrigger value="instruction">Istruzioni</TabsTrigger>
          <TabsTrigger value="format-bandi">Formato Bandi</TabsTrigger>
          <TabsTrigger value="format-fonti">Formato Fonti</TabsTrigger>
        </TabsList>
        <TabsContent value="instruction" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Come importare i dati</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Assicurati che il foglio Google Sheets sia pubblico (File &gt; Condividi &gt; Chiunque abbia il link)</li>
                <li>Copia l'URL completo del foglio dalla barra degli indirizzi</li>
                <li>Incolla l'URL nel campo sopra e scegli cosa importare (Bandi o Fonti)</li>
                <li>Per importare le fonti, assicurati di avere un foglio chiamato "Lista Fonti" nel documento</li>
              </ol>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="format-bandi">
          <Card>
            <CardHeader>
              <CardTitle>Formato dei bandi richiesto</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-gray-600">
                Il foglio Google Sheets dei bandi deve contenere le seguenti colonne:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>data_scraping</strong>: Data di estrazione del bando</li>
                <li><strong>titolo_incentivo</strong>: Titolo del bando</li>
                <li><strong>fonte</strong>: Fonte del bando (es. MIMIT, UE)</li>
                <li><strong>descrizione</strong>: Breve descrizione del bando</li>
                <li><strong>url_dettaglio</strong>: URL completo del bando</li>
                <li><strong>descrizione_dettagliata</strong>: Dettagli completi del bando</li>
                <li><strong>requisiti</strong>: Requisiti di partecipazione</li>
                <li><strong>modalita_presentazione</strong>: Come presentare la domanda</li>
                <li><strong>scadenza_dettagliata</strong>: Data di scadenza per la presentazione</li>
                <li><strong>budget_disponibile</strong>: Importo del finanziamento</li>
                <li><strong>ultimi_aggiornamenti</strong>: Data degli ultimi aggiornamenti</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="format-fonti">
          <Card>
            <CardHeader>
              <CardTitle>Formato delle fonti richiesto</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-gray-600">
                Il foglio "Lista Fonti" di Google Sheets deve contenere le seguenti colonne:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>id_number</strong>: Numero identificativo della fonte</li>
                <li><strong>url</strong>: URL completo della fonte</li>
                <li><strong>stato_elaborazione</strong>: Stato dell'elaborazione (es. "Elaborato" o altro)</li>
                <li><strong>data_ultimo_aggiornamento</strong>: Data dell'ultimo aggiornamento della fonte</li>
                <li><strong>nome</strong>: Nome della fonte (facoltativo, generato automaticamente se mancante)</li>
                <li><strong>tipo</strong>: Tipo di fonte (facoltativo, derivato dall'URL se mancante)</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ImportaScraping;
