
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
import { Bando } from '@/types';

const ImportaScraping = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [googleSheetUrl, setGoogleSheetUrl] = useState(GoogleSheetsService.getSheetUrl() || '');
  const [isLoading, setIsLoading] = useState(false);
  const [bandiAnteprima, setBandiAnteprima] = useState<Bando[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const handleImport = async () => {
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
      // Salva l'URL del foglio Google Sheets
      GoogleSheetsService.setSheetUrl(googleSheetUrl);
      
      // Recupera i dati dal foglio
      const bandi = await GoogleSheetsService.fetchBandiFromSheet(googleSheetUrl);
      
      if (bandi.length === 0) {
        setError("Nessun bando trovato nel foglio Google Sheets. Verifica che il formato sia corretto.");
        toast({
          title: "Nessun dato trovato",
          description: "Nessun bando trovato nel foglio. Verifica che il formato sia corretto.",
          variant: "destructive",
        });
      } else {
        // Mostra anteprima
        setBandiAnteprima(bandi.slice(0, 5));
        
        toast({
          title: "Importazione completata",
          description: `Importati ${bandi.length} bandi dal foglio Google Sheets`,
        });
        
        // Salva i bandi importati in sessionStorage per il match
        sessionStorage.setItem('bandiImportati', JSON.stringify(bandi));
        
        // Passa alla pagina di match dopo un breve ritardo
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
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Importa Dati da Google Sheets</h1>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-blue-500" />
            <CardTitle>Importa Bandi da Google Sheets</CardTitle>
          </div>
          <CardDescription>
            Importa i risultati dello scraping da un foglio Google Sheets per fare il match con i clienti
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Informazioni sul formato</AlertTitle>
            <AlertDescription>
              Il foglio Google Sheets deve essere pubblico e contenere le seguenti colonne: 
              titolo, fonte, tipo, settori, importoMin, importoMax, scadenza, descrizione, url.
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
                Inserisci l'URL completo del foglio Google Sheets contenente i dati dello scraping
              </p>
            </div>
            
            <Button 
              onClick={handleImport} 
              disabled={isLoading || !googleSheetUrl} 
              className="w-full"
            >
              {isLoading ? 'Importazione in corso...' : 'Importa e vai al Match'}
              {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Errore</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {bandiAnteprima.length > 0 && (
            <div className="space-y-2">
              <Separator />
              <h3 className="font-medium">Anteprima dati importati</h3>
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
        </CardContent>
      </Card>
      
      <Tabs defaultValue="instruction">
        <TabsList>
          <TabsTrigger value="instruction">Istruzioni</TabsTrigger>
          <TabsTrigger value="format">Formato Dati</TabsTrigger>
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
                <li>Incolla l'URL nel campo sopra e clicca "Importa e vai al Match"</li>
                <li>I dati importati verranno automaticamente utilizzati per il match con i clienti</li>
              </ol>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="format">
          <Card>
            <CardHeader>
              <CardTitle>Formato dei dati richiesto</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-gray-600">
                Il foglio Google Sheets deve contenere le seguenti colonne:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>titolo</strong>: Titolo del bando</li>
                <li><strong>fonte</strong>: Fonte del bando (es. sito web)</li>
                <li><strong>tipo</strong>: Tipo di bando (europeo, statale, regionale, altro)</li>
                <li><strong>settori</strong>: Settori di interesse separati da virgola</li>
                <li><strong>importoMin</strong>: Importo minimo del finanziamento</li>
                <li><strong>importoMax</strong>: Importo massimo del finanziamento</li>
                <li><strong>scadenza</strong>: Data di scadenza (formato YYYY-MM-DD)</li>
                <li><strong>descrizione</strong>: Descrizione del bando</li>
                <li><strong>url</strong>: URL completo del bando</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ImportaScraping;
